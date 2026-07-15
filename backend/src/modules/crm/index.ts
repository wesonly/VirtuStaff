/**
 * VirtuStaff — Module: CRM (placeholder)
 */

import { Hono } from 'hono';

export const crmRouter = new Hono();

crmRouter.get('/orgs/:orgId/crm', (c) => {
  return c.json({ data: [], nextCursor: null });
});

crmRouter.post('/orgs/:orgId/crm', async (c) => {
  const body = await c.req.json();
  return c.json({ data: { id: 'new-conn-id', ...body } }, 201);
});

crmRouter.delete('/orgs/:orgId/crm/:connId', (c) => {
  return c.json({ data: { id: c.req.param('connId'), deleted: true } });
});

crmRouter.post('/orgs/:orgId/crm/:connId/sync', (c) => {
  return c.json({ data: { connectionId: c.req.param('connId'), syncStarted: true } });
});