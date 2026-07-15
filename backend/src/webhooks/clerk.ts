/**
 * VirtuStaff — Clerk Webhook Handler
 *
 * Creates/updates user and organization records in Neon when Clerk events fire.
 */

import { Hono } from 'hono';
import { db } from '../db/client.js';
import { users, organizations, organizationMembers } from '../db/schema/index.js';
import { eq } from 'drizzle-orm';
import { generateId } from '../shared/utils.js';
import { env } from '../config/env.js';

export const clerkWebhookRouter = new Hono();

clerkWebhookRouter.post('/webhooks/clerk', async (c) => {
  // Skip processing if Clerk is not configured
  if (!env.CLERK_SECRET_KEY) {
    console.log('[Clerk Webhook] Skipped — CLERK_SECRET_KEY not configured');
    return c.json({ received: true, skipped: true });
  }

  const payload = await c.req.json();
  const { type, data } = payload;

  console.log(`[Clerk Webhook] Processing: ${type}`);

  try {
    switch (type) {
      case 'user.created': {
        const id = generateId();
        await db.insert(users).values({
          id,
          clerkId: data.id,
          email: data.email_addresses?.[0]?.email_address || '',
          firstName: data.first_name || null,
          lastName: data.last_name || null,
          avatarUrl: data.image_url || null,
        }).onConflictDoNothing();
        break;
      }

      case 'user.updated': {
        await db.update(users).set({
          email: data.email_addresses?.[0]?.email_address || undefined,
          firstName: data.first_name || undefined,
          lastName: data.last_name || undefined,
          avatarUrl: data.image_url || undefined,
        }).where(eq(users.clerkId, data.id));
        break;
      }

      case 'user.deleted': {
        await db.delete(users).where(eq(users.clerkId, data.id));
        break;
      }

      case 'organization.created': {
        const orgId = generateId();
        await db.insert(organizations).values({
          id: orgId,
          name: data.name || 'Unnamed Organization',
          slug: data.slug || `org-${orgId.slice(0, 8)}`,
        }).onConflictDoNothing();
        break;
      }

      case 'organization.updated': {
        await db.update(organizations).set({
          name: data.name || undefined,
          slug: data.slug || undefined,
        }).where(eq(organizations.slug, data.slug));
        break;
      }

      case 'organization.deleted': {
        await db.delete(organizations).where(eq(organizations.slug, data.slug));
        break;
      }

      case 'organizationMembership.created': {
        const user = await db.select().from(users).where(eq(users.clerkId, data.public_user_data?.user_id)).limit(1);
        const org = await db.select().from(organizations).where(eq(organizations.slug, data.organization?.slug)).limit(1);
        if (user.length && org.length) {
          await db.insert(organizationMembers).values({
            id: generateId(),
            organizationId: org[0].id,
            userId: user[0].id,
            role: data.role === 'admin' ? 'admin' : 'member',
          }).onConflictDoNothing();
        }
        break;
      }

      case 'organizationMembership.deleted': {
        const delUser = await db.select().from(users).where(eq(users.clerkId, data.public_user_data?.user_id)).limit(1);
        const delOrg = await db.select().from(organizations).where(eq(organizations.slug, data.organization?.slug)).limit(1);
        if (delUser.length && delOrg.length) {
          await db.delete(organizationMembers).where(
            eq(organizationMembers.organizationId, delOrg[0].id)
          );
        }
        break;
      }
    }
  } catch (error) {
    console.error('[Clerk Webhook] Error:', error);
  }

  return c.json({ received: true });
});