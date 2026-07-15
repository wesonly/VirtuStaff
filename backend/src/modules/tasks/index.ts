/**
 * VirtuStaff — Tasks Module
 *
 * CRUD operations with real Neon DB via Drizzle ORM.
 */

import { Hono } from 'hono';
import { HTTPException } from 'hono/http-exception';
import { db } from '../../db/client.js';
import { tasks, taskLogs } from '../../db/schema/index.js';
import { eq, and, desc, asc } from 'drizzle-orm';
import { generateId } from '../../shared/utils.js';

export const taskRouter = new Hono();

taskRouter.get('/orgs/:orgId/tasks', async (c) => {
  const { orgId } = c.req.param();
  const { status, employeeId, limit } = c.req.query();

  const conditions = [eq(tasks.organizationId, orgId)];
  if (status) conditions.push(eq(tasks.status, status));
  if (employeeId) conditions.push(eq(tasks.aiEmployeeId, employeeId));

  const take = Math.min(parseInt(limit || '20'), 100);
  const list = await db
    .select()
    .from(tasks)
    .where(and(...conditions))
    .orderBy(desc(tasks.createdAt))
    .limit(take);

  return c.json({ data: list, nextCursor: list.length === take ? list[list.length - 1].id : null });
});

taskRouter.post('/orgs/:orgId/tasks', async (c) => {
  const { orgId } = c.req.param();
  const body = await c.req.json();
  const id = generateId();

  await db.insert(tasks).values({
    id,
    organizationId: orgId,
    aiEmployeeId: body.aiEmployeeId,
    type: body.type,
    inputData: body.inputData || {},
    priority: body.priority || 'normal',
    contactName: body.contactName || null,
    contactPhone: body.contactPhone || null,
    contactEmail: body.contactEmail || null,
    scheduledAt: body.scheduledAt || null,
    status: 'pending',
  });

  const created = await db.select().from(tasks).where(eq(tasks.id, id)).limit(1);
  return c.json({ data: created[0] }, 201);
});

taskRouter.get('/orgs/:orgId/tasks/:taskId', async (c) => {
  const { orgId, taskId } = c.req.param();
  const task = await db
    .select()
    .from(tasks)
    .where(and(eq(tasks.id, taskId), eq(tasks.organizationId, orgId)))
    .limit(1);
  if (!task.length) throw new HTTPException(404, { message: 'Task not found' });
  return c.json({ data: task[0] });
});

taskRouter.post('/orgs/:orgId/tasks/:taskId/cancel', async (c) => {
  const { orgId, taskId } = c.req.param();
  await db.update(tasks).set({ status: 'failed' }).where(and(eq(tasks.id, taskId), eq(tasks.organizationId, orgId)));
  return c.json({ data: { id: taskId, status: 'canceled' } });
});

taskRouter.get('/orgs/:orgId/tasks/:taskId/logs', async (c) => {
  const { taskId } = c.req.param();
  const logs = await db
    .select()
    .from(taskLogs)
    .where(eq(taskLogs.taskId, taskId))
    .orderBy(asc(taskLogs.createdAt));
  return c.json({ data: logs });
});