/**
 * VirtuStaff — Subscriptions Schema
 */

import { pgTable, uuid, varchar, text, integer, jsonb, boolean, timestamp } from 'drizzle-orm/pg-core';

export const subscriptionPlans = pgTable('subscription_plans', {
  id: uuid('id').primaryKey().defaultRandom(),
  stripePriceId: varchar('stripe_price_id', { length: 255 }).unique().notNull(),
  name: varchar('name', { length: 100 }).notNull(),
  slug: varchar('slug', { length: 50 }).unique().notNull(),
  description: text('description'),
  priceCents: integer('price_cents').notNull(),
  currency: varchar('currency', { length: 3 }).default('usd'),
  interval: varchar('interval', { length: 10 }).default('month'),
  maxAiEmployees: integer('max_ai_employees').notNull(),
  features: jsonb('features').default([]),
  isActive: boolean('is_active').default(true),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
});

export const subscriptions = pgTable('subscriptions', {
  id: uuid('id').primaryKey().defaultRandom(),
  organizationId: uuid('organization_id').notNull(),
  planId: uuid('plan_id').notNull(),
  stripeSubscriptionId: varchar('stripe_subscription_id', { length: 255 }).unique(),
  stripeCustomerId: varchar('stripe_customer_id', { length: 255 }),
  status: varchar('status', { length: 20 }).default('active').notNull(),
  currentPeriodStart: timestamp('current_period_start', { withTimezone: true }),
  currentPeriodEnd: timestamp('current_period_end', { withTimezone: true }),
  trialEnd: timestamp('trial_end', { withTimezone: true }),
  canceledAt: timestamp('canceled_at', { withTimezone: true }),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
});

export const subscriptionRelations = {}; // TODO: add relations