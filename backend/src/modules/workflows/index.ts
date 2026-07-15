/**
 * VirtuStaff — Workflows Module
 */

import { Hono } from 'hono';
import { HTTPException } from 'hono/http-exception';
import { db } from '../../db/client.js';
import { workflows } from '../../db/schema/index.js';
import { eq, and } from 'drizzle-orm';
import { generateId } from '../../shared/utils.js';

export const workflowRouter = new Hono();

workflowRouter.get('/orgs/:orgId/workflows', async (c) => {
  const { orgId } = c.req.param();
  const list = await db.select().from(workflows).where(eq(workflows.organizationId, orgId));
  return c.json({ data: list });
});

workflowRouter.post('/orgs/:orgId/workflows', async (c) => {
  const { orgId } = c.req.param();
  const body = await c.req.json();
  const id = generateId();
  await db.insert(workflows).values({
    id,
    organizationId: orgId,
    name: body.name,
    description: body.description,
    triggerType: body.triggerType,
    triggerConfig: body.triggerConfig || {},
    steps: body.steps || [],
    isActive: true,
  });
  const created = await db.select().from(workflows).where(eq(workflows.id, id)).limit(1);
  return c.json({ data: created[0] }, 201);
});

workflowRouter.get('/orgs/:orgId/workflows/:wfId', async (c) => {
  const { orgId, wfId } = c.req.param();
  const wf = await db.select().from(workflows).where(and(eq(workflows.id, wfId), eq(workflows.organizationId, orgId))).limit(1);
  if (!wf.length) throw new HTTPException(404, { message: 'Workflow not found' });
  return c.json({ data: wf[0] });
});

workflowRouter.patch('/orgs/:orgId/workflows/:wfId', async (c) => {
  const { orgId, wfId } = c.req.param();
  const body = await c.req.json();
  const allowed = ['name', 'description', 'triggerType', 'triggerConfig', 'steps', 'isActive'];
  const updates: Record<string, unknown> = {};
  for (const key of allowed) if (body[key] !== undefined) updates[key] = body[key];
  await db.update(workflows).set(updates).where(and(eq(workflows.id, wfId), eq(workflows.organizationId, orgId)));
  const updated = await db.select().from(workflows).where(eq(workflows.id, wfId)).limit(1);
  return c.json({ data: updated[0] });
});

workflowRouter.post('/orgs/:orgId/workflows/:wfId/toggle', async (c) => {
  const { orgId, wfId } = c.req.param();
  const wf = await db.select().from(workflows).where(and(eq(workflows.id, wfId), eq(workflows.organizationId, orgId))).limit(1);
  if (!wf.length) throw new HTTPException(404, { message: 'Workflow not found' });
  await db.update(workflows).set({ isActive: !wf[0].isActive }).where(eq(workflows.id, wfId));
  return c.json({ data: { id: wfId, isActive: !wf[0].isActive } });
});