/**
 * VirtuStaff — CRM Connections Schema
 */

import { pgTable, uuid, varchar, text, jsonb, boolean, timestamp } from 'drizzle-orm/pg-core';

export const crmConnections = pgTable('crm_connections', {
  id: uuid('id').primaryKey().defaultRandom(),
  organizationId: uuid('organization_id').notNull(),
  provider: varchar('provider', { length: 50 }).notNull(),
  label: varchar('label', { length: 100 }),
  accessToken: text('access_token'),
  refreshToken: text('refresh_token'),
  tokenExpiresAt: timestamp('token_expires_at', { withTimezone: true }),
  config: jsonb('config').default({}),
  isConnected: boolean('is_connected').default(false),
  lastSyncAt: timestamp('last_sync_at', { withTimezone: true }),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
});

export const syncLogs = pgTable('sync_logs', {
  id: uuid('id').primaryKey().defaultRandom(),
  connectionId: uuid('connection_id').notNull(),
  direction: varchar('direction', { length: 10 }).notNull(),
  entityType: varchar('entity_type', { length: 50 }).notNull(),
  recordsProcessed: varchar('records_processed').default('0'),
  recordsSucceeded: varchar('records_succeeded').default('0'),
  recordsFailed: varchar('records_failed').default('0'),
  status: varchar('status', { length: 20 }).default('completed'),
  errorMessage: text('error_message'),
  startedAt: timestamp('started_at', { withTimezone: true }),
  completedAt: timestamp('completed_at', { withTimezone: true }),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
});

export const crmRelations = {}; // TODO: add relations