/**
 * VirtuStaff — Module: Tasks (placeholder)
 */

import { Hono } from 'hono';

export const taskRouter = new Hono();

taskRouter.get('/orgs/:orgId/tasks', (c) => {
  return c.json({ data: [], nextCursor: null });
});

taskRouter.post('/orgs/:orgId/tasks', async (c) => {
  const body = await c.req.json();
  return c.json({ data: { id: 'new-task-id', ...body } }, 201);
});

taskRouter.get('/orgs/:orgId/tasks/:taskId', (c) => {
  return c.json({ data: { id: c.req.param('taskId') } });
});

taskRouter.post('/orgs/:orgId/tasks/:taskId/cancel', (c) => {
  return c.json({ data: { id: c.req.param('taskId'), status: 'canceled' } });
});