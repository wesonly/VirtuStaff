/**
 * VirtuStaff — Tasks Schema
 */

import { pgTable, uuid, varchar, text, jsonb, integer, timestamp } from 'drizzle-orm/pg-core';

export const tasks = pgTable('tasks', {
  id: uuid('id').primaryKey().defaultRandom(),
  organizationId: uuid('organization_id').notNull(),
  aiEmployeeId: uuid('ai_employee_id').notNull(),
  workflowId: uuid('workflow_id'),
  type: varchar('type', { length: 50 }).notNull(),
  status: varchar('status', { length: 20 }).default('pending').notNull(),
  priority: varchar('priority', { length: 10 }).default('normal'),
  inputData: jsonb('input_data').notNull(),
  outputData: jsonb('output_data'),
  result: text('result'),
  contactName: varchar('contact_name', { length: 255 }),
  contactPhone: varchar('contact_phone', { length: 20 }),
  contactEmail: varchar('contact_email', { length: 255 }),
  scheduledAt: timestamp('scheduled_at', { withTimezone: true }),
  startedAt: timestamp('started_at', { withTimezone: true }),
  completedAt: timestamp('completed_at', { withTimezone: true }),
  durationSeconds: integer('duration_seconds'),
  errorMessage: text('error_message'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
});

export const taskLogs = pgTable('task_logs', {
  id: uuid('id').primaryKey().defaultRandom(),
  taskId: uuid('task_id').notNull(),
  level: varchar('level', { length: 20 }).default('info'),
  source: varchar('source', { length: 100 }),
  message: text('message').notNull(),
  metadata: jsonb('metadata').default({}),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
});

export const taskRelations = {}; // TODO: add relations