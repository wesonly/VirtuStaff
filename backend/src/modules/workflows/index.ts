/**
 * VirtuStaff — Module: Workflows (placeholder)
 */

import { Hono } from 'hono';

export const workflowRouter = new Hono();

workflowRouter.get('/orgs/:orgId/workflows', (c) => {
  return c.json({ data: [], nextCursor: null });
});

workflowRouter.post('/orgs/:orgId/workflows', async (c) => {
  const body = await c.req.json();
  return c.json({ data: { id: 'new-workflow-id', ...body } }, 201);
});

workflowRouter.get('/orgs/:orgId/workflows/:wfId', (c) => {
  return c.json({ data: { id: c.req.param('wfId') } });
});

workflowRouter.patch('/orgs/:orgId/workflows/:wfId', async (c) => {
  return c.json({ data: { id: c.req.param('wfId'), updated: true } });
});

workflowRouter.delete('/orgs/:orgId/workflows/:wfId', (c) => {
  return c.json({ data: { id: c.req.param('wfId'), deleted: true } });
});