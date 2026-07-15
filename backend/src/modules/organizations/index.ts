/**
 * VirtuStaff — Organizations Module
 *
 * CRUD operations with real Neon DB via Drizzle ORM.
 */

import { Hono } from 'hono';
import { HTTPException } from 'hono/http-exception';
import { z } from 'zod';
import { zValidator } from '@hono/zod-validator';
import { db } from '../../db/client.js';
import { organizations, organizationMembers, users } from '../../db/schema/index.js';
import { eq } from 'drizzle-orm';
import { generateId } from '../../shared/utils.js';

export const orgRouter = new Hono();

const createOrgSchema = z.object({
  name: z.string().min(1).max(255),
  slug: z.string().min(1).max(100).regex(/^[a-z0-9-]+$/, 'Slug must be lowercase alphanumeric with hyphens'),
  size: z.enum(['small', 'medium', 'large']).optional().default('small'),
  timezone: z.string().optional().default('UTC'),
});

orgRouter.get('/orgs', async (c) => {
  // TODO: Filter by current user's memberships when auth is wired
  const allOrgs = await db.select().from(organizations);
  return c.json({ data: allOrgs });
});

orgRouter.post('/orgs', zValidator('json', createOrgSchema), async (c) => {
  const body = c.req.valid('json');
  const id = generateId();

  // Check slug uniqueness
  const existing = await db.select().from(organizations).where(eq(organizations.slug, body.slug)).limit(1);
  if (existing.length > 0) {
    throw new HTTPException(409, { message: 'An organization with this slug already exists' });
  }

  await db.insert(organizations).values({
    id,
    name: body.name,
    slug: body.slug,
    size: body.size,
    timezone: body.timezone,
  });

  const created = await db.select().from(organizations).where(eq(organizations.id, id)).limit(1);
  return c.json({ data: created[0] }, 201);
});

orgRouter.get('/orgs/:orgId', async (c) => {
  const { orgId } = c.req.param();
  const org = await db.select().from(organizations).where(eq(organizations.id, orgId)).limit(1);
  if (!org.length) throw new HTTPException(404, { message: 'Organization not found' });
  return c.json({ data: org[0] });
});

orgRouter.patch('/orgs/:orgId', async (c) => {
  const { orgId } = c.req.param();
  const body = await c.req.json();
  const allowed = ['name', 'size', 'timezone', 'logo_url'];
  const updates: Record<string, unknown> = {};
  for (const key of allowed) {
    if (body[key] !== undefined) updates[key] = body[key];
  }
  if (Object.keys(updates).length === 0) {
    throw new HTTPException(400, { message: 'No valid fields to update' });
  }
  await db.update(organizations).set(updates).where(eq(organizations.id, orgId));
  const updated = await db.select().from(organizations).where(eq(organizations.id, orgId)).limit(1);
  return c.json({ data: updated[0] });
});

orgRouter.get('/orgs/:orgId/members', async (c) => {
  const { orgId } = c.req.param();
  const members = await db
    .select({
      id: organizationMembers.id,
      userId: organizationMembers.userId,
      role: organizationMembers.role,
      joinedAt: organizationMembers.joinedAt,
      email: users.email,
      firstName: users.firstName,
      lastName: users.lastName,
    })
    .from(organizationMembers)
    .leftJoin(users, eq(organizationMembers.userId, users.id))
    .where(eq(organizationMembers.organizationId, orgId));
  return c.json({ data: members });
});

orgRouter.post('/orgs/:orgId/members', async (c) => {
  const body = await c.req.json();
  // TODO: Invite via Clerk, then create membership record
  return c.json({ data: { invited: true, email: body.email } }, 201);
});