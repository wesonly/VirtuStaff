/**
 * VirtuStaff — CRM Module
 */

import { Hono } from 'hono';
import { HTTPException } from 'hono/http-exception';
import { db } from '../../db/client.js';
import { crmConnections, syncLogs } from '../../db/schema/index.js';
import { eq, and } from 'drizzle-orm';
import { generateId } from '../../shared/utils.js';

export const crmRouter = new Hono();

crmRouter.get('/orgs/:orgId/crm', async (c) => {
  const { orgId } = c.req.param();
  const connections = await db.select().from(crmConnections).where(eq(crmConnections.organizationId, orgId));
  return c.json({ data: connections });
});

crmRouter.post('/orgs/:orgId/crm', async (c) => {
  const { orgId } = c.req.param();
  const body = await c.req.json();
  const id = generateId();
  await db.insert(crmConnections).values({
    id,
    organizationId: orgId,
    provider: body.provider,
    label: body.label || null,
    config: body.config || {},
    isConnected: false,
  });
  const created = await db.select().from(crmConnections).where(eq(crmConnections.id, id)).limit(1);
  return c.json({ data: created[0] }, 201);
});

crmRouter.delete('/orgs/:orgId/crm/:connId', async (c) => {
  const { orgId, connId } = c.req.param();
  await db.delete(crmConnections).where(and(eq(crmConnections.id, connId), eq(crmConnections.organizationId, orgId)));
  return c.json({ data: { id: connId, deleted: true } });
});

crmRouter.post('/orgs/:orgId/crm/:connId/sync', async (c) => {
  const { connId } = c.req.param();
  const logId = generateId();
  await db.insert(syncLogs).values({
    id: logId,
    connectionId: connId,
    direction: 'inbound',
    entityType: 'contacts',
    status: 'running',
    startedAt: new Date(),
  });
  // TODO: Trigger actual sync
  setTimeout(async () => {
    await db.update(syncLogs).set({ status: 'completed', completedAt: new Date() }).where(eq(syncLogs.id, logId));
  }, 100);
  return c.json({ data: { connectionId: connId, syncStarted: true, logId } });
});

crmRouter.get('/orgs/:orgId/crm/:connId/logs', async (c) => {
  const { connId } = c.req.param();
  const logs = await db.select().from(syncLogs).where(eq(syncLogs.connectionId, connId));
  return c.json({ data: logs });
});