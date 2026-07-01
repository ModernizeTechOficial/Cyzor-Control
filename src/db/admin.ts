import { Router, Request, Response, NextFunction } from "express";
import { requireAuth, AuthRequest } from "../middleware/auth.ts";
import { db } from "./index.ts";
import { tenants, users, companies, products, projects, userTenants, financeEntries, tasks, ideas, workspaces, plans } from "./schema.ts";
import { eq, sql, desc, count } from "drizzle-orm";

export const adminRouter = Router();

// Middleware to ensure user is platform admin
export const requirePlatformAdmin = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    if (!req.user) {
      console.log("Admin Middleware: No req.user");
      return res.status(401).json({ error: "Unauthorized" });
    }
    const [userRecord] = await db.select().from(users).where(eq(users.uid, req.user.uid)).limit(1);
    if (!userRecord) {
      console.log("Admin Middleware: No userRecord found for uid:", req.user.uid);
      return res.status(403).json({ error: "Forbidden: Platform Admin only" });
    }
    if (!userRecord.isPlatformAdmin) {
      console.log("Admin Middleware: User is not platform admin:", req.user.uid);
      return res.status(403).json({ error: "Forbidden: Platform Admin only" });
    }
    console.log("Admin Middleware: User IS platform admin, proceeding");
    next();
  } catch (error) {
    console.error("Admin middleware error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

adminRouter.use(requireAuth);
adminRouter.use(requirePlatformAdmin as any);

// --- METRICS ---
adminRouter.get("/metrics", async (req: AuthRequest, res) => {
  try {
    const [tenantsCount] = await db.select({ value: count() }).from(tenants);
    const [usersCount] = await db.select({ value: count() }).from(users);
    const [companiesCount] = await db.select({ value: count() }).from(companies);
    const [projectsCount] = await db.select({ value: count() }).from(projects);
    const [productsCount] = await db.select({ value: count() }).from(products);
    const [tasksCount] = await db.select({ value: count() }).from(tasks);
    const [ideasCount] = await db.select({ value: count() }).from(ideas);

    // Sum of amount for RECEITA
    const revenueResult = await db.select({
      sum: sql<string>`sum(amount)`
    }).from(financeEntries).where(eq(financeEntries.type, 'RECEITA'));
    const totalRevenue = parseFloat(revenueResult[0]?.sum || '0');

    // Sum of amount for DESPESA
    const expenseResult = await db.select({
      sum: sql<string>`sum(amount)`
    }).from(financeEntries).where(eq(financeEntries.type, 'DESPESA'));
    const totalExpense = parseFloat(expenseResult[0]?.sum || '0');

    // Grouped monthly revenue & expense trends
    const monthlyTrends = await db.select({
      month: sql<string>`to_char(${financeEntries.date}, 'YYYY-MM')`,
      revenue: sql<string>`coalesce(sum(case when ${financeEntries.type} = 'RECEITA' then ${financeEntries.amount} else 0 end), 0)`,
      expense: sql<string>`coalesce(sum(case when ${financeEntries.type} = 'DESPESA' then ${financeEntries.amount} else 0 end), 0)`,
    })
    .from(financeEntries)
    .groupBy(sql`to_char(${financeEntries.date}, 'YYYY-MM')`)
    .orderBy(sql`to_char(${financeEntries.date}, 'YYYY-MM')`);

    // Map trends to UI chart format
    const formattedTrends = monthlyTrends.map((t) => ({
      month: t.month,
      revenue: parseFloat(t.revenue || '0'),
      expense: parseFloat(t.expense || '0'),
    }));

    res.json({
      status: "success",
      metrics: {
        totalTenants: tenantsCount.value,
        totalUsers: usersCount.value,
        totalCompanies: companiesCount.value,
        totalProjects: projectsCount.value,
        totalProducts: productsCount.value,
        totalTasks: tasksCount.value,
        totalIdeas: ideasCount.value,
        totalRevenue,
        totalExpense,
        trends: formattedTrends
      }
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// --- TENANTS ---
adminRouter.get("/tenants", async (req: AuthRequest, res) => {
  try {
    const allTenants = await db.select().from(tenants).orderBy(desc(tenants.createdAt));
    res.json(allTenants);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

adminRouter.put("/tenants/:id", async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;
    const { name, slug, plan, status } = req.body;
    const updated = await db.update(tenants)
      .set({
        name,
        slug,
        plan,
        status,
        updatedAt: new Date()
      })
      .where(eq(tenants.id, id))
      .returning();
    res.json(updated[0]);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

adminRouter.delete("/tenants/:id", async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;
    await db.delete(tenants).where(eq(tenants.id, id));
    res.json({ success: true, message: "Tenant deleted successfully" });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// --- USERS ---
adminRouter.get("/users", async (req: AuthRequest, res) => {
  try {
    const allUsers = await db.select().from(users).orderBy(desc(users.createdAt));
    res.json(allUsers);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

adminRouter.put("/users/:uid", async (req: AuthRequest, res) => {
  try {
    const { uid } = req.params;
    const { displayName, email, role, isPlatformAdmin, currentPlan } = req.body;
    const updated = await db.update(users)
      .set({
        displayName: displayName || null,
        email,
        role: role || null,
        isPlatformAdmin: isPlatformAdmin !== undefined ? isPlatformAdmin : false,
        currentPlan: currentPlan || 'Pro',
        updatedAt: new Date()
      })
      .where(eq(users.uid, uid))
      .returning();
    res.json(updated[0]);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

adminRouter.delete("/users/:uid", async (req: AuthRequest, res) => {
  try {
    const { uid } = req.params;
    await db.delete(users).where(eq(users.uid, uid));
    res.json({ success: true, message: "User deleted successfully" });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// --- COMPANIES (Client Companies) ---
adminRouter.get("/companies", async (req: AuthRequest, res) => {
  try {
    const allCompanies = await db.select({
      id: companies.id,
      name: companies.name,
      cnpj: companies.cnpj,
      industry: companies.industry,
      size: companies.size,
      website: companies.website,
      status: companies.status,
      createdAt: companies.createdAt,
      workspaceId: companies.workspaceId,
      workspaceName: workspaces.name,
      tenantId: companies.tenantId,
      tenantName: tenants.name,
    })
    .from(companies)
    .leftJoin(workspaces, eq(companies.workspaceId, workspaces.id))
    .leftJoin(tenants, eq(companies.tenantId, tenants.id))
    .orderBy(desc(companies.createdAt));

    res.json(allCompanies);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

adminRouter.post("/companies", async (req: AuthRequest, res) => {
  try {
    const { name, cnpj, industry, size, website, status, workspaceId } = req.body;
    if (!name) {
      return res.status(400).json({ error: "Name is required" });
    }

    // Default to the first workspace if not provided
    let targetWorkspaceId = workspaceId;
    let targetTenantId = null;

    if (!targetWorkspaceId) {
      const [firstWorkspace] = await db.select().from(workspaces).limit(1);
      if (!firstWorkspace) {
        return res.status(400).json({ error: "No workspaces exist to associate this company with." });
      }
      targetWorkspaceId = firstWorkspace.id;
      targetTenantId = firstWorkspace.tenantId;
    } else {
      const [ws] = await db.select().from(workspaces).where(eq(workspaces.id, targetWorkspaceId)).limit(1);
      if (ws) {
        targetTenantId = ws.tenantId;
      }
    }

    const newCompany = await db.insert(companies).values({
      name,
      cnpj: cnpj || null,
      industry: industry || null,
      size: size || null,
      website: website || null,
      status: status || 'Ativo',
      workspaceId: targetWorkspaceId,
      tenantId: targetTenantId,
    }).returning();

    res.json(newCompany[0]);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

adminRouter.put("/companies/:id", async (req: AuthRequest, res) => {
  try {
    const id = parseInt(req.params.id);
    const { name, cnpj, industry, size, website, status } = req.body;
    const updated = await db.update(companies)
      .set({
        name,
        cnpj: cnpj || null,
        industry: industry || null,
        size: size || null,
        website: website || null,
        status: status || 'Ativo',
        updatedAt: new Date()
      })
      .where(eq(companies.id, id))
      .returning();
    res.json(updated[0]);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

adminRouter.delete("/companies/:id", async (req: AuthRequest, res) => {
  try {
    const id = parseInt(req.params.id);
    await db.delete(companies).where(eq(companies.id, id));
    res.json({ success: true, message: "Company deleted successfully" });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// --- FINANCE (All) ---
adminRouter.get("/finance", async (req: AuthRequest, res) => {
  try {
    const allFinance = await db.select().from(financeEntries).orderBy(desc(financeEntries.createdAt));
    res.json(allFinance);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// --- PLANS ---
adminRouter.get("/plans", async (req: AuthRequest, res) => {
  try {
    const allPlans = await db.select().from(plans).orderBy(desc(plans.createdAt));
    res.json(allPlans);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

adminRouter.post("/plans", async (req: AuthRequest, res) => {
  try {
    const { name, price, currency, billingPeriod, maxUsers, maxWorkspaces, features, isPopular, isActive } = req.body;
    const newPlan = await db.insert(plans).values({
      name, price, currency, billingPeriod, maxUsers, maxWorkspaces, features, isPopular, isActive
    }).returning();
    res.json(newPlan[0]);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

adminRouter.put("/plans/:id", async (req: AuthRequest, res) => {
  try {
    const id = parseInt(req.params.id);
    const { name, price, currency, billingPeriod, maxUsers, maxWorkspaces, features, isPopular, isActive } = req.body;
    const updated = await db.update(plans)
      .set({ name, price, currency, billingPeriod, maxUsers, maxWorkspaces, features, isPopular, isActive, updatedAt: new Date() })
      .where(eq(plans.id, id))
      .returning();
    res.json(updated[0]);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

adminRouter.delete("/plans/:id", async (req: AuthRequest, res) => {
  try {
    const id = parseInt(req.params.id);
    await db.delete(plans).where(eq(plans.id, id));
    res.json({ success: true, message: "Plan deleted successfully" });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// --- STRIPE CONFIG ---
import { stripeConfig, billingSubscriptions, billingPayments, billingWebhookEvents } from "./schema.ts";
import { getStripe } from "../services/stripe.ts";

adminRouter.get("/stripe/config", async (req: AuthRequest, res) => {
  try {
    const config = await db.select().from(stripeConfig).limit(1);
    res.json(config[0] || null);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

adminRouter.post("/stripe/config", async (req: AuthRequest, res) => {
  try {
    const { 
      testPublishableKey, testSecretKey, testWebhookSecret, 
      livePublishableKey, liveSecretKey, liveWebhookSecret, 
      environment 
    } = req.body;
    const existing = await db.select().from(stripeConfig).limit(1);
    
    let result;
    if (existing.length > 0) {
      result = await db.update(stripeConfig).set({
        testPublishableKey, testSecretKey, testWebhookSecret,
        livePublishableKey, liveSecretKey, liveWebhookSecret,
        environment, updatedAt: new Date()
      }).where(eq(stripeConfig.id, existing[0].id)).returning();
    } else {
      result = await db.insert(stripeConfig).values({
        testPublishableKey, testSecretKey, testWebhookSecret,
        livePublishableKey, liveSecretKey, liveWebhookSecret,
        environment
      }).returning();
    }
    res.json(result[0]);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

adminRouter.post("/stripe/provision-webhook", async (req: AuthRequest, res) => {
  try {
    const { url } = req.body;
    if (!url) return res.status(400).json({ error: 'Webhook URL is required' });

    const stripe = await getStripe();
    
    // Create webhook endpoint in Stripe
    const endpoint = await stripe.webhookEndpoints.create({
      url,
      enabled_events: [
        'checkout.session.completed',
        'customer.subscription.updated',
        'customer.subscription.deleted',
        'invoice.payment_succeeded',
        'invoice.payment_failed',
      ],
    });

    // Update DB with the new webhook secret based on current environment
    const existing = await db.select().from(stripeConfig).limit(1);
    if (existing.length === 0) return res.status(400).json({ error: 'Config not found' });
    
    const isProd = existing[0].environment === 'production';
    
    const updateData: any = { updatedAt: new Date() };
    if (isProd) {
      updateData.liveWebhookSecret = endpoint.secret;
    } else {
      updateData.testWebhookSecret = endpoint.secret;
    }
    
    const result = await db.update(stripeConfig).set(updateData).where(eq(stripeConfig.id, existing[0].id)).returning();
    
    res.json(result[0]);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

adminRouter.post("/stripe/sync-plan/:id", async (req: AuthRequest, res) => {
  try {
    const id = parseInt(req.params.id);
    const [plan] = await db.select().from(plans).where(eq(plans.id, id)).limit(1);
    
    if (!plan) return res.status(404).json({ error: 'Plan not found' });
    
    const config = await getStripeConfig();
    if (!config) return res.status(400).json({ error: 'Stripe config not found' });
    
    const isProd = config.environment === 'production';
    const stripe = await getStripe();
    
    let productId = isProd ? plan.liveStripeProductId : plan.testStripeProductId;
    if (!productId) {
      const product = await stripe.products.create({
        name: plan.name,
        description: `Cyzor Control - ${plan.name} (${isProd ? 'Live' : 'Test'})`,
      });
      productId = product.id;
    }
    
    let priceId = isProd ? plan.liveStripePriceId : plan.testStripePriceId;
    if (!priceId) {
      const price = await stripe.prices.create({
        product: productId,
        unit_amount: Math.round(Number(plan.price) * 100), // in cents
        currency: plan.currency?.toLowerCase() || 'brl',
        recurring: { interval: plan.billingPeriod === 'yearly' ? 'year' : 'month' },
      });
      priceId = price.id;
    }
    
    const updateData: any = { updatedAt: new Date() };
    if (isProd) {
      updateData.liveStripeProductId = productId;
      updateData.liveStripePriceId = priceId;
    } else {
      updateData.testStripeProductId = productId;
      updateData.testStripePriceId = priceId;
    }
    
    const updated = await db.update(plans).set(updateData).where(eq(plans.id, id)).returning();
    
    res.json(updated[0]);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

adminRouter.get("/stripe/subscriptions", async (req: AuthRequest, res) => {
  try {
    const subs = await db.select().from(billingSubscriptions).orderBy(desc(billingSubscriptions.createdAt));
    res.json(subs);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

adminRouter.get("/stripe/payments", async (req: AuthRequest, res) => {
  try {
    const payments = await db.select().from(billingPayments).orderBy(desc(billingPayments.createdAt));
    res.json(payments);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

adminRouter.get("/stripe/webhooks", async (req: AuthRequest, res) => {
  try {
    const events = await db.select().from(billingWebhookEvents).orderBy(desc(billingWebhookEvents.createdAt)).limit(100);
    res.json(events);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

