/**
 * VirtuStaff — Auth Module
 *
 * Clerk JWT validation, /me endpoint, org membership checks.
 */

import { Hono } from 'hono';
import { HTTPException } from 'hono/http-exception';
import { db } from '../../db/client.js';
import { users, organizationMembers, organizations } from '../../db/schema/index.js';
import { eq } from 'drizzle-orm';

export const authRouter = new Hono();

authRouter.get('/auth/me', async (c) => {
  // TODO: Extract user from Clerk JWT token
  // For now, require a user-id header for development
  const userId = c.req.header('x-user-id');
  if (!userId) {
    return c.json({ data: { user: null, message: 'Not authenticated' } });
  }
  const user = await db.select().from(users).where(eq(users.clerkId, userId)).limit(1);
  if (!user.length) {
    return c.json({ data: { user: null, message: 'User not found' } });
  }
  // Get org memberships
  const memberships = await db
    .select({
      orgId: organizationMembers.organizationId,
      role: organizationMembers.role,
      orgName: organizations.name,
      orgSlug: organizations.slug,
    })
    .from(organizationMembers)
    .leftJoin(organizations, eq(organizationMembers.organizationId, organizations.id))
    .where(eq(organizationMembers.userId, user[0].id));
  return c.json({ data: { user: user[0], organizations: memberships } });
});

authRouter.get('/auth/orgs/:orgId/check', async (c) => {
  const { orgId } = c.req.param();
  const userId = c.req.header('x-user-id');
  if (!userId) throw new HTTPException(401, { message: 'Not authenticated' });

  const membership = await db
    .select()
    .from(organizationMembers)
    .where(eq(organizationMembers.organizationId, orgId))
    .limit(1);
  return c.json({ data: { hasAccess: membership.length > 0 } });
});