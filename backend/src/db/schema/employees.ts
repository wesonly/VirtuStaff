/**
 * VirtuStaff — AI Employees Schema
 */

import { pgTable, uuid, varchar, text, jsonb, integer, boolean, timestamp } from 'drizzle-orm/pg-core';

export const aiEmployeeTypes = pgTable('ai_employee_types', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: varchar('name', { length: 100 }).notNull(),
  slug: varchar('slug', { length: 50 }).unique().notNull(),
  description: text('description'),
  capabilities: jsonb('capabilities').default([]),
  icon: varchar('icon', { length: 50 }),
  configSchema: jsonb('config_schema'),
  isActive: boolean('is_active').default(true),
});

export const aiEmployees = pgTable('ai_employees', {
  id: uuid('id').primaryKey().defaultRandom(),
  organizationId: uuid('organization_id').notNull(),
  typeId: uuid('type_id').notNull(),
  name: varchar('name', { length: 100 }).notNull(),
  assignedTo: uuid('assigned_to'),
  phoneNumber: varchar('phone_number', { length: 20 }),
  emailAddress: varchar('email_address', { length: 255 }),
  personality: text('personality'),
  capabilities: jsonb('capabilities'),
  config: jsonb('config').default({}),
  status: varchar('status', { length: 20 }).default('active').notNull(),
  avatarUrl: text('avatar_url'),
  totalTasks: integer('total_tasks').default(0),
  successfulTasks: integer('successful_tasks').default(0),
  lastActiveAt: timestamp('last_active_at', { withTimezone: true }),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
});

export const employeeRelations = {}; // TODO: add relations