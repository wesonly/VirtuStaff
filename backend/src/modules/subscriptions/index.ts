/**
 * VirtuStaff — Module: Subscriptions (placeholder)
 */

import { Hono } from 'hono';

export const subscriptionRouter = new Hono();

subscriptionRouter.get('/plans', (c) => {
  return c.json({
    data: [
      { id: 'plan-starter', name: 'Starter', slug: 'starter', priceCents: 9900, maxAiEmployees: 2 },
      { id: 'plan-growth', name: 'Growth', slug: 'growth', priceCents: 29900, maxAiEmployees: 5 },
      { id: 'plan-scale', name: 'Scale', slug: 'scale', priceCents: 99900, maxAiEmployees: -1 },
    ],
  });
});

subscriptionRouter.get('/orgs/:orgId/subscription', (c) => {
  return c.json({ data: { orgId: c.req.param('orgId'), plan: 'starter', status: 'active' } });
});

subscriptionRouter.post('/orgs/:orgId/subscription/change-plan', async (c) => {
  const body = await c.req.json();
  return c.json({ data: { planId: body.planId, updated: true } });
});