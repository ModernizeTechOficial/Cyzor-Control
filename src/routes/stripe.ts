import { Router } from "express";
import { requireAuth, AuthRequest } from "../middleware/auth.ts";
import { tenantMiddleware } from "../middleware/tenant.ts";
import { db } from "../db/index.ts";
import { plans, billingCustomers, billingSubscriptions, billingPayments, billingWebhookEvents, users, tenants } from "../db/schema.ts";
import { eq, and } from "drizzle-orm";
import { getStripe, getStripeConfig } from "../services/stripe.ts";

export const stripeRouter = Router();

// Endpoint for users to start checkout
stripeRouter.post("/stripe/checkout-session", requireAuth, tenantMiddleware, async (req: AuthRequest, res) => {
  try {
    const { planId } = req.body;
    const userId = req.user!.uid;
    const tenantId = req.tenantId!;

    const [plan] = await db.select().from(plans).where(eq(plans.name, planId)).limit(1);
    if (!plan || !plan.stripePriceId) {
      return res.status(400).json({ error: 'Invalid plan or not synchronized with Stripe' });
    }

    const stripe = await getStripe();
    
    // Check if user is already a Stripe Customer for this tenant
    let [customer] = await db.select().from(billingCustomers).where(
      and(eq(billingCustomers.tenantId, tenantId), eq(billingCustomers.userId, userId))
    ).limit(1);

    let stripeCustomerId = customer?.stripeCustomerId;

    if (!stripeCustomerId) {
      // Create Stripe customer
      const [userRec] = await db.select().from(users).where(eq(users.uid, userId)).limit(1);
      const newCustomer = await stripe.customers.create({
        email: userRec.email,
        metadata: { tenantId, userId }
      });
      stripeCustomerId = newCustomer.id;
      
      await db.insert(billingCustomers).values({
        tenantId,
        userId,
        stripeCustomerId,
        email: userRec.email,
      });
    }

    // Create Checkout Session
    const session = await stripe.checkout.sessions.create({
      customer: stripeCustomerId,
      payment_method_types: ['card'],
      line_items: [{
        price: plan.stripePriceId,
        quantity: 1,
      }],
      mode: 'subscription',
      success_url: `${req.headers.origin}/settings?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${req.headers.origin}/settings`,
      metadata: { tenantId, userId, planId: plan.id.toString() },
      subscription_data: {
        metadata: { tenantId, userId, planId: plan.id.toString() }
      }
    });

    res.json({ url: session.url });
  } catch (error: any) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
});

// Endpoint for Stripe Customer Portal
stripeRouter.post("/stripe/portal-session", requireAuth, tenantMiddleware, async (req: AuthRequest, res) => {
  try {
    const userId = req.user!.uid;
    const tenantId = req.tenantId!;

    const [customer] = await db.select().from(billingCustomers).where(
      and(eq(billingCustomers.tenantId, tenantId), eq(billingCustomers.userId, userId))
    ).limit(1);

    if (!customer) {
      return res.status(400).json({ error: 'No billing customer found' });
    }

    const stripe = await getStripe();
    const session = await stripe.billingPortal.sessions.create({
      customer: customer.stripeCustomerId,
      return_url: `${req.headers.origin}/settings`,
    });

    res.json({ url: session.url });
  } catch (error: any) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
});

// Endpoint for listing user payments
stripeRouter.get("/stripe/invoices", requireAuth, tenantMiddleware, async (req: AuthRequest, res) => {
  try {
    const tenantId = req.tenantId!;
    const { desc } = await import("drizzle-orm");
    const payments = await db.select().from(billingPayments)
      .where(eq(billingPayments.tenantId, tenantId))
      .orderBy(desc(billingPayments.createdAt));
      
    res.json(payments);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Webhook endpoint
export const stripeWebhookRouter = Router();

stripeWebhookRouter.post("/webhooks/stripe", async (req: any, res) => {
  try {
    const config = await getStripeConfig();
    if (!config) {
      return res.status(500).send("Stripe config not found");
    }

    const isProd = config.environment === 'production';
    const webhookSecret = isProd ? config.liveWebhookSecret : config.testWebhookSecret;

    if (!webhookSecret) {
      return res.status(500).send(`Stripe ${isProd ? 'Live' : 'Sandbox'} webhook secret not configured`);
    }

    const stripe = await getStripe();
    const signature = req.headers['stripe-signature'];

    let event;
    try {
      event = stripe.webhooks.constructEvent(
        req.rawBody,
        signature,
        webhookSecret
      );
    } catch (err: any) {
      console.error(`Webhook signature verification failed.`, err.message);
      return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    // Save event for audit/idempotency
    const existingEvent = await db.select().from(billingWebhookEvents).where(eq(billingWebhookEvents.stripeEventId, event.id)).limit(1);
    if (existingEvent.length > 0) {
      console.log(`Event ${event.id} already processed. Skipping.`);
      return res.json({ received: true });
    }

    await db.insert(billingWebhookEvents).values({
      stripeEventId: event.id,
      type: event.type,
      payload: event as any,
      status: 'pending'
    });

    try {
      // Process event
      switch (event.type) {
        case 'checkout.session.completed': {
          const session = event.data.object as any;
          if (session.mode === 'subscription') {
            const subscriptionId = session.subscription;
            const sub: any = await stripe.subscriptions.retrieve(subscriptionId);
            
            const tenantId = session.metadata?.tenantId;
            const planId = parseInt(session.metadata?.planId);
            
            if (tenantId && planId) {
              await db.insert(billingSubscriptions).values({
                tenantId,
                planId,
                stripeSubscriptionId: sub.id,
                status: sub.status,
                currentPeriodStart: new Date(sub.current_period_start * 1000),
                currentPeriodEnd: new Date(sub.current_period_end * 1000),
              });
              
              // Update Tenant Plan Name
              const [p] = await db.select().from(plans).where(eq(plans.id, planId)).limit(1);
              if (p) {
                await db.update(tenants).set({ plan: p.name }).where(eq(tenants.id, tenantId));
              }
            }
          }
          break;
        }
        case 'customer.subscription.updated': {
          const sub = event.data.object as any;
          await db.update(billingSubscriptions).set({
            status: sub.status,
            currentPeriodStart: new Date(sub.current_period_start * 1000),
            currentPeriodEnd: new Date(sub.current_period_end * 1000),
            cancelAtPeriodEnd: sub.cancel_at_period_end,
            updatedAt: new Date()
          }).where(eq(billingSubscriptions.stripeSubscriptionId, sub.id));
          break;
        }
        case 'customer.subscription.deleted': {
          const sub = event.data.object as any;
          const updated = await db.update(billingSubscriptions).set({
            status: 'canceled',
            updatedAt: new Date()
          }).where(eq(billingSubscriptions.stripeSubscriptionId, sub.id)).returning();
          
          if (updated.length > 0) {
            await db.update(tenants).set({ plan: 'Free' }).where(eq(tenants.id, updated[0].tenantId));
          }
          break;
        }
        case 'invoice.payment_succeeded': {
          const invoice = event.data.object as any;
          if (invoice.subscription) {
            // Find tenant from subscription metadata or db
            const [subRecord] = await db.select().from(billingSubscriptions).where(eq(billingSubscriptions.stripeSubscriptionId, invoice.subscription)).limit(1);
            if (subRecord) {
              await db.insert(billingPayments).values({
                tenantId: subRecord.tenantId,
                stripeInvoiceId: invoice.id,
                stripePaymentIntentId: invoice.payment_intent as string,
                amount: (invoice.amount_paid / 100).toString() as any, // convert cents to standard
                currency: invoice.currency,
                status: 'succeeded',
              });
            }
          }
          break;
        }
        case 'invoice.payment_failed': {
          const invoice = event.data.object as any;
          if (invoice.subscription) {
            const [subRecord] = await db.select().from(billingSubscriptions).where(eq(billingSubscriptions.stripeSubscriptionId, invoice.subscription)).limit(1);
            if (subRecord) {
              await db.insert(billingPayments).values({
                tenantId: subRecord.tenantId,
                stripeInvoiceId: invoice.id,
                stripePaymentIntentId: invoice.payment_intent as string,
                amount: (invoice.amount_due / 100).toString() as any,
                currency: invoice.currency,
                status: 'failed',
              });
            }
          }
          break;
        }
      }

      await db.update(billingWebhookEvents).set({ status: 'processed' }).where(eq(billingWebhookEvents.stripeEventId, event.id));
    } catch (e: any) {
      console.error('Error processing event', e);
      await db.update(billingWebhookEvents).set({ status: 'failed', error: e.message }).where(eq(billingWebhookEvents.stripeEventId, event.id));
    }

    res.json({ received: true });
  } catch (error: any) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
});