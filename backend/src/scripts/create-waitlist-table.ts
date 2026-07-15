/**
 * Quick script to create the waitlist_signups table
 */
import postgres from 'postgres';

const DATABASE_URL = process.env.DATABASE_URL || "postgresql://neondb_owner:npg_teVS8D0AzdCn@ep-rough-thunder-a6qgn93n-pooler.us-west-2.aws.neon.tech/neondb?sslmode=require";

async function main() {
  const sql = postgres(DATABASE_URL);
  try {
    await sql`CREATE TABLE IF NOT EXISTS waitlist_signups (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      email VARCHAR(255) NOT NULL UNIQUE,
      source VARCHAR(50) DEFAULT 'website',
      created_at TIMESTAMPTZ DEFAULT NOW()
    )`;
    console.log('✅ waitlist_signups table created');

    const [row] = await sql`SELECT COUNT(*)::int as count FROM waitlist_signups`;
    console.log('Current signups:', row.count);
  } finally {
    await sql.end();
  }
}

main().catch((e) => {
  console.error('Failed:', e);
  process.exit(1);
});