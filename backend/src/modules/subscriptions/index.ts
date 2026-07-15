/**
 * VirtuStaff — Subscriptions Module
 *
 * Reads from Neon DB, syncs with Stripe data.
 */

import { Hono } from 'hono';
import { db } from '../../db/client.js';
import { subscriptions, subscriptionPlans } from '../../db/schema/index.js';
import { eq } from 'drizzle-orm';

export const subscriptionRouter = new Hono();

subscriptionRouter.get('/plans', async (c) => {
  const plans = await db.select().from(subscriptionPlans).where(eq(subscriptionPlans.isActive, true));
  return c.json({ data: plans });
});

subscriptionRouter.get('/orgs/:orgId/subscription', async (c) => {
  const { orgId } = c.req.param();
  const sub = await db
    .select({
      id: subscriptions.id,
      planId: subscriptions.planId,
      status: subscriptions.status,
      currentPeriodStart: subscriptions.currentPeriodStart,
      currentPeriodEnd: subscriptions.currentPeriodEnd,
      trialEnd: subscriptions.trialEnd,
      plan: {
        name: subscriptionPlans.name,
        slug: subscriptionPlans.slug,
        priceCents: subscriptionPlans.priceCents,
        maxAiEmployees: subscriptionPlans.maxAiEmployees,
        features: subscriptionPlans.features,
      },
    })
    .from(subscriptions)
    .leftJoin(subscriptionPlans, eq(subscriptions.planId, subscriptionPlans.id))
    .where(eq(subscriptions.organizationId, orgId))
    .limit(1);
  return c.json({ data: sub[0] || null });
});

subscriptionRouter.post('/orgs/:orgId/subscription/change-plan', async (c) => {
  const { orgId } = c.req.param();
  const body = await c.req.json();
  await db.update(subscriptions).set({ planId: body.planId }).where(eq(subscriptions.organizationId, orgId));
  return c.json({ data: { planId: body.planId, updated: true } });
});