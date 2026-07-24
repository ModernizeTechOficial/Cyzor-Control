import { db } from '../src/db/index.ts';
import { plans, users, tenants, workspaces } from '../src/db/schema.ts';
import { eq, sql } from 'drizzle-orm';

const canonicalPlanName = (value) => {
  if (!value) return 'free';
  const normalized = String(value).trim().toLowerCase();
  if (normalized === 'free') return 'free';
  if (normalized === 'pro' || normalized === 'master') return 'Pro';
  if (normalized === 'enterprise') return 'Enterprise';
  return value;
};

const planDefinitions = [
  {
    name: 'free',
    price: '0.00',
    currency: 'BRL',
    billingPeriod: 'monthly',
    maxUsers: 9999,
    maxWorkspaces: 9999,
    features: ['unlimited_access', 'all_modules'],
    isPopular: false,
    isActive: true,
    stripeProductId: null,
    stripePriceId: null,
    testStripeProductId: null,
    testStripePriceId: null,
    liveStripeProductId: null,
    liveStripePriceId: null,
  },
  {
    name: 'Pro',
    price: '0.00',
    currency: 'BRL',
    billingPeriod: 'monthly',
    maxUsers: 9999,
    maxWorkspaces: 9999,
    features: ['unlimited_access', 'all_modules'],
    isPopular: true,
    isActive: true,
    stripeProductId: null,
    stripePriceId: null,
    testStripeProductId: null,
    testStripePriceId: null,
    liveStripeProductId: null,
    liveStripePriceId: null,
  },
  {
    name: 'Enterprise',
    price: '0.00',
    currency: 'BRL',
    billingPeriod: 'monthly',
    maxUsers: 9999,
    maxWorkspaces: 9999,
    features: ['unlimited_access', 'all_modules'],
    isPopular: false,
    isActive: true,
    stripeProductId: null,
    stripePriceId: null,
    testStripeProductId: null,
    testStripePriceId: null,
    liveStripeProductId: null,
    liveStripePriceId: null,
  },
];

async function resetPlans() {
  console.log('Resetting plans data...');

  await db.transaction(async (tx) => {
    await tx.execute(sql`TRUNCATE TABLE plans RESTART IDENTITY CASCADE`);

    for (const plan of planDefinitions) {
      await tx.insert(plans).values(plan).returning();
    }

    await tx.update(users)
      .set({ currentPlan: 'free' })
      .where(eq(users.currentPlan, 'Free'));

    await tx.update(users)
      .set({ currentPlan: 'Pro' })
      .where(eq(users.currentPlan, 'pro'));

    await tx.update(users)
      .set({ currentPlan: 'Enterprise' })
      .where(eq(users.currentPlan, 'enterprise'));

    await tx.update(users)
      .set({ currentPlan: 'Pro' })
      .where(eq(users.currentPlan, 'Master'));

    await tx.execute(sql`UPDATE users SET current_plan = 'free' WHERE current_plan IS NULL OR current_plan = ''`);

    await tx.update(tenants)
      .set({ plan: 'free' })
      .where(eq(tenants.plan, 'Free'));

    await tx.update(tenants)
      .set({ plan: 'Pro' })
      .where(eq(tenants.plan, 'pro'));

    await tx.update(tenants)
      .set({ plan: 'Enterprise' })
      .where(eq(tenants.plan, 'enterprise'));

    await tx.update(tenants)
      .set({ plan: 'Pro' })
      .where(eq(tenants.plan, 'Master'));

    await tx.execute(sql`UPDATE tenants SET plan = 'free' WHERE plan IS NULL OR plan = ''`);

    await tx.update(workspaces)
      .set({ plan: 'free' })
      .where(eq(workspaces.plan, 'Free'));

    await tx.update(workspaces)
      .set({ plan: 'Pro' })
      .where(eq(workspaces.plan, 'pro'));

    await tx.update(workspaces)
      .set({ plan: 'Enterprise' })
      .where(eq(workspaces.plan, 'enterprise'));

    await tx.update(workspaces)
      .set({ plan: 'Pro' })
      .where(eq(workspaces.plan, 'Master'));

    await tx.execute(sql`UPDATE workspaces SET plan = 'free' WHERE plan IS NULL OR plan = ''`);
  });

  console.log('Plans reset and canonicalized successfully.');
}

resetPlans()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('Failed to reset plans:', error);
    process.exit(1);
  });
