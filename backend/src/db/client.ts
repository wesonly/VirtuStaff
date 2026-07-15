/**
 * VirtuStaff Platform — Database Client
 *
 * Neon (Serverless Postgres) connection via Postgres.js + Drizzle ORM.
 */

import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { env } from '../config/env.js';
import * as schema from './schema/index.js';

const queryClient = postgres(env.DATABASE_URL, {
  max: 10, // Connection pool size
  idle_timeout: 30,
  connect_timeout: 10,
  prepare: false, // Neon's PgBouncer mode requires this
});

export const db = drizzle(queryClient, { schema });

/**
 * Test database connectivity
 */
export async function pingDatabase(): Promise<boolean> {
  try {
    await queryClient`SELECT 1`;
    return true;
  } catch {
    return false;
  }
}

export default db;