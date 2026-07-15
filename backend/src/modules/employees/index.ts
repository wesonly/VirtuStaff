/**
 * VirtuStaff — AI Employees Module
 *
 * CRUD operations with real Neon DB via Drizzle ORM.
 */

import { Hono } from 'hono';
import { HTTPException } from 'hono/http-exception';
import { z } from 'zod';
import { zValidator } from '@hono/zod-validator';
import { db } from '../../db/client.js';
import { aiEmployees, aiEmployeeTypes } from '../../db/schema/index.js';
import { eq, and } from 'drizzle-orm';
import { generateId } from '../../shared/utils.js';

export const employeeRouter = new Hono();

const createSchema = z.object({
  typeId: z.string().uuid(),
  name: z.string().min(1).max(100),
  personality: z.string().optional(),
  config: z.record(z.unknown()).optional().default({}),
});

employeeRouter.get('/orgs/:orgId/employees', async (c) => {
  const { orgId } = c.req.param();
  const list = await db
    .select()
    .from(aiEmployees)
    .where(eq(aiEmployees.organizationId, orgId));
  return c.json({ data: list });
});

employeeRouter.post('/orgs/:orgId/employees', zValidator('json', createSchema), async (c) => {
  const { orgId } = c.req.param();
  const body = c.req.valid('json');

  // Verify type exists
  const type = await db.select().from(aiEmployeeTypes).where(eq(aiEmployeeTypes.id, body.typeId)).limit(1);
  if (!type.length) throw new HTTPException(400, { message: 'Invalid employee type' });

  const id = generateId();
  await db.insert(aiEmployees).values({
    id,
    organizationId: orgId,
    typeId: body.typeId,
    name: body.name,
    personality: body.personality ?? null,
    config: body.config,
    status: 'active',
  });

  const created = await db.select().from(aiEmployees).where(eq(aiEmployees.id, id)).limit(1);
  return c.json({ data: created[0] }, 201);
});

employeeRouter.get('/orgs/:orgId/employees/:empId', async (c) => {
  const { orgId, empId } = c.req.param();
  const emp = await db
    .select()
    .from(aiEmployees)
    .where(and(eq(aiEmployees.id, empId), eq(aiEmployees.organizationId, orgId)))
    .limit(1);
  if (!emp.length) throw new HTTPException(404, { message: 'Employee not found' });
  return c.json({ data: emp[0] });
});

employeeRouter.patch('/orgs/:orgId/employees/:empId', async (c) => {
  const { orgId, empId } = c.req.param();
  const body = await c.req.json();
  const allowed = ['name', 'personality', 'config', 'status', 'assigned_to', 'phone_number', 'email_address'];
  const updates: Record<string, unknown> = {};
  for (const key of allowed) {
    if (body[key] !== undefined) updates[key] = body[key];
  }
  await db.update(aiEmployees).set(updates).where(and(eq(aiEmployees.id, empId), eq(aiEmployees.organizationId, orgId)));
  const updated = await db.select().from(aiEmployees).where(eq(aiEmployees.id, empId)).limit(1);
  return c.json({ data: updated[0] });
});

employeeRouter.post('/orgs/:orgId/employees/:empId/activate', async (c) => {
  const { orgId, empId } = c.req.param();
  await db.update(aiEmployees).set({ status: 'active' }).where(and(eq(aiEmployees.id, empId), eq(aiEmployees.organizationId, orgId)));
  return c.json({ data: { id: empId, status: 'active' } });
});

employeeRouter.post('/orgs/:orgId/employees/:empId/pause', async (c) => {
  const { orgId, empId } = c.req.param();
  await db.update(aiEmployees).set({ status: 'paused' }).where(and(eq(aiEmployees.id, empId), eq(aiEmployees.organizationId, orgId)));
  return c.json({ data: { id: empId, status: 'paused' } });
});

employeeRouter.get('/employee-types', async (c) => {
  const types = await db.select().from(aiEmployeeTypes).where(eq(aiEmployeeTypes.isActive, true));
  return c.json({ data: types });
});