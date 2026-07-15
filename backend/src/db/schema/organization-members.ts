/**
 * VirtuStaff — Organization Members Table Schema
 */

import { pgTable, uuid, varchar, timestamp, unique } from 'drizzle-orm/pg-core';

export const organizationMembers = pgTable('organization_members', {
  id: uuid('id').primaryKey().defaultRandom(),
  organizationId: uuid('organization_id').notNull(),
  userId: uuid('user_id').notNull(),
  role: varchar('role', { length: 20 }).default('member').notNull(),
  joinedAt: timestamp('joined_at', { withTimezone: true }).defaultNow(),
}, (table) => ({
  uniqueMembership: unique().on(table.organizationId, table.userId),
}));

export const memberRelations = {}; // TODO: add relations