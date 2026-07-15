/**
 * VirtuStaff — Waitlist Signups Table Schema
 */

import { pgTable, uuid, varchar, timestamp } from 'drizzle-orm/pg-core';

export const waitlistSignups = pgTable('waitlist_signups', {
  id: uuid('id').primaryKey().defaultRandom(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  source: varchar('source', { length: 50 }).default('website'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
});