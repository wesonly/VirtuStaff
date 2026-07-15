/**
 * Run all database migrations — creates tables if they don't exist.
 * Usage: DATABASE_URL=... npx tsx src/scripts/run-migrations.ts
 */

import postgres from 'postgres';

const DATABASE_URL = process.env.DATABASE_URL;
if (!DATABASE_URL) {
  console.error('DATABASE_URL is required');
  process.exit(1);
}

const sql = postgres(DATABASE_URL);

async function main() {
  console.log('Running migrations...\n');

  // Create tables in dependency order
  const tables = [
    {
      name: 'organizations',
      sql: `CREATE TABLE IF NOT EXISTS organizations (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name VARCHAR(255) NOT NULL,
        slug VARCHAR(100) UNIQUE NOT NULL,
        logo_url TEXT,
        size VARCHAR(20) DEFAULT 'small',
        timezone VARCHAR(50) DEFAULT 'UTC',
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
      )`,
    },
    {
      name: 'users',
      sql: `CREATE TABLE IF NOT EXISTS users (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        clerk_id VARCHAR(255) UNIQUE NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        first_name VARCHAR(100),
        last_name VARCHAR(100),
        avatar_url TEXT,
        phone VARCHAR(20),
        default_org_id UUID REFERENCES organizations(id),
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
      )`,
    },
    {
      name: 'organization_members',
      sql: `CREATE TABLE IF NOT EXISTS organization_members (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
        user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        role VARCHAR(20) DEFAULT 'member',
        joined_at TIMESTAMPTZ DEFAULT NOW(),
        UNIQUE(organization_id, user_id)
      )`,
    },
    {
      name: 'subscription_plans',
      sql: `CREATE TABLE IF NOT EXISTS subscription_plans (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        stripe_price_id VARCHAR(255) UNIQUE NOT NULL,
        name VARCHAR(100) NOT NULL,
        slug VARCHAR(50) UNIQUE NOT NULL,
        description TEXT,
        price_cents INTEGER NOT NULL,
        currency VARCHAR(3) DEFAULT 'usd',
        interval VARCHAR(10) DEFAULT 'month',
        max_ai_employees INTEGER NOT NULL,
        features JSONB DEFAULT '[]',
        is_active BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMPTZ DEFAULT NOW()
      )`,
    },
    {
      name: 'subscriptions',
      sql: `CREATE TABLE IF NOT EXISTS subscriptions (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
        plan_id UUID NOT NULL REFERENCES subscription_plans(id),
        stripe_subscription_id VARCHAR(255) UNIQUE,
        stripe_customer_id VARCHAR(255),
        status VARCHAR(20) DEFAULT 'active',
        current_period_start TIMESTAMPTZ,
        current_period_end TIMESTAMPTZ,
        trial_end TIMESTAMPTZ,
        canceled_at TIMESTAMPTZ,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
      )`,
    },
    {
      name: 'ai_employee_types',
      sql: `CREATE TABLE IF NOT EXISTS ai_employee_types (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name VARCHAR(100) NOT NULL,
        slug VARCHAR(50) UNIQUE NOT NULL,
        description TEXT,
        capabilities JSONB DEFAULT '[]',
        icon VARCHAR(50),
        config_schema JSONB,
        is_active BOOLEAN DEFAULT TRUE
      )`,
    },
    {
      name: 'ai_employees',
      sql: `CREATE TABLE IF NOT EXISTS ai_employees (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
        type_id UUID NOT NULL REFERENCES ai_employee_types(id),
        name VARCHAR(100) NOT NULL,
        assigned_to UUID REFERENCES users(id),
        phone_number VARCHAR(20),
        email_address VARCHAR(255),
        personality TEXT,
        capabilities JSONB,
        config JSONB DEFAULT '{}',
        status VARCHAR(20) DEFAULT 'active',
        avatar_url TEXT,
        total_tasks INTEGER DEFAULT 0,
        successful_tasks INTEGER DEFAULT 0,
        last_active_at TIMESTAMPTZ,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
      )`,
    },
    {
      name: 'workflows',
      sql: `CREATE TABLE IF NOT EXISTS workflows (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
        name VARCHAR(200) NOT NULL,
        description TEXT,
        trigger_type VARCHAR(50) NOT NULL,
        trigger_config JSONB DEFAULT '{}',
        steps JSONB NOT NULL,
        is_active BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
      )`,
    },
    {
      name: 'tasks',
      sql: `CREATE TABLE IF NOT EXISTS tasks (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
        ai_employee_id UUID NOT NULL REFERENCES ai_employees(id) ON DELETE CASCADE,
        workflow_id UUID REFERENCES workflows(id),
        type VARCHAR(50) NOT NULL,
        status VARCHAR(20) DEFAULT 'pending',
        priority VARCHAR(10) DEFAULT 'normal',
        input_data JSONB NOT NULL,
        output_data JSONB,
        result TEXT,
        contact_name VARCHAR(255),
        contact_phone VARCHAR(20),
        contact_email VARCHAR(255),
        scheduled_at TIMESTAMPTZ,
        started_at TIMESTAMPTZ,
        completed_at TIMESTAMPTZ,
        duration_seconds INTEGER,
        error_message TEXT,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
      )`,
    },
    {
      name: 'task_logs',
      sql: `CREATE TABLE IF NOT EXISTS task_logs (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        task_id UUID NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
        level VARCHAR(20) DEFAULT 'info',
        source VARCHAR(100),
        message TEXT NOT NULL,
        metadata JSONB DEFAULT '{}',
        created_at TIMESTAMPTZ DEFAULT NOW()
      )`,
    },
    {
      name: 'crm_connections',
      sql: `CREATE TABLE IF NOT EXISTS crm_connections (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
        provider VARCHAR(50) NOT NULL,
        label VARCHAR(100),
        access_token TEXT,
        refresh_token TEXT,
        token_expires_at TIMESTAMPTZ,
        config JSONB DEFAULT '{}',
        is_connected BOOLEAN DEFAULT FALSE,
        last_sync_at TIMESTAMPTZ,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
      )`,
    },
    {
      name: 'sync_logs',
      sql: `CREATE TABLE IF NOT EXISTS sync_logs (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        connection_id UUID NOT NULL REFERENCES crm_connections(id) ON DELETE CASCADE,
        direction VARCHAR(10) NOT NULL,
        entity_type VARCHAR(50) NOT NULL,
        records_processed INTEGER DEFAULT 0,
        records_succeeded INTEGER DEFAULT 0,
        records_failed INTEGER DEFAULT 0,
        status VARCHAR(20) DEFAULT 'completed',
        error_message TEXT,
        started_at TIMESTAMPTZ,
        completed_at TIMESTAMPTZ,
        created_at TIMESTAMPTZ DEFAULT NOW()
      )`,
    },
    {
      name: 'api_keys',
      sql: `CREATE TABLE IF NOT EXISTS api_keys (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
        name VARCHAR(100) NOT NULL,
        key_prefix VARCHAR(10) NOT NULL,
        key_hash TEXT NOT NULL,
        scopes JSONB DEFAULT '["read"]',
        last_used_at TIMESTAMPTZ,
        expires_at TIMESTAMPTZ,
        is_active BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMPTZ DEFAULT NOW()
      )`,
    },
    {
      name: 'waitlist_signups',
      sql: `CREATE TABLE IF NOT EXISTS waitlist_signups (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        email VARCHAR(255) NOT NULL UNIQUE,
        source VARCHAR(50) DEFAULT 'website',
        created_at TIMESTAMPTZ DEFAULT NOW()
      )`,
    },
  ];

  for (const table of tables) {
    try {
      await sql.unsafe(table.sql);
      console.log(`✅ ${table.name}`);
    } catch (err) {
      console.error(`❌ ${table.name}:`, err instanceof Error ? err.message : err);
    }
  }

  console.log('\nVerifying tables...');
  const result = await sql`SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' ORDER BY table_name`;
  console.log('Tables:', result.map(r => r.table_name).join(', '));
  console.log(`Count: ${result.length}`);

  await sql.end();
  console.log('\n✅ Migrations complete!');
}

main().catch((e) => { console.error(e); process.exit(1); });