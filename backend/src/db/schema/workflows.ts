/**
 * VirtuStaff — Workflows Schema
 */

import { pgTable, uuid, varchar, text, jsonb, boolean, timestamp } from 'drizzle-orm/pg-core';

export const workflows = pgTable('workflows', {
  id: uuid('id').primaryKey().defaultRandom(),
  organizationId: uuid('organization_id').notNull(),
  name: varchar('name', { length: 200 }).notNull(),
  description: text('description'),
  triggerType: varchar('trigger_type', { length: 50 }).notNull(),
  triggerConfig: jsonb('trigger_config').default({}),
  steps: jsonb('steps').notNull(),
  isActive: boolean('is_active').default(true),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
});

export const workflowSteps = pgTable('workflow_steps', {
  id: uuid('id').primaryKey().defaultRandom(),
  workflowId: uuid('workflow_id').notNull(),
  stepOrder: uuid('step_order'),
  type: varchar('type', { length: 50 }).notNull(),
  config: jsonb('config').default({}),
  nextStepId: uuid('next_step_id'),
});

export const workflowRelations = {}; // TODO: add relations