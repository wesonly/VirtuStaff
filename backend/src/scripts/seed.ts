/**
 * VirtuStaff — Database Seed Script
 *
 * Populates reference data (subscription plans, AI employee types).
 * Idempotent — safe to run multiple times.
 *
 * Usage: npx tsx src/scripts/seed.ts
 */

import postgres from 'postgres';

const DATABASE_URL = process.env.DATABASE_URL;
if (!DATABASE_URL) {
  console.error('DATABASE_URL is required');
  process.exit(1);
}

const sql = postgres(DATABASE_URL);

async function main() {
  console.log('Seeding database...\n');

  // ── Subscription Plans ──
  console.log('📋 Subscription Plans:');
  const plans = [
    {
      stripe_price_id: 'price_1TtSa8D7OxutGUwVCunnApfU',
      name: 'Starter',
      slug: 'starter',
      description: 'For small businesses getting started with AI employees',
      price_cents: 9900,
      max_ai_employees: 2,
      features: [
        'Core capabilities (calls, email, SMS)',
        'Basic CRM integration',
        'Email support',
        'Monthly reports',
      ],
    },
    {
      stripe_price_id: 'price_1TtSa7D7OxutGUwVj7iT9W7i',
      name: 'Growth',
      slug: 'growth',
      description: 'For growing teams that need more capacity',
      price_cents: 29900,
      max_ai_employees: 5,
      features: [
        'Everything in Starter',
        'Advanced integrations',
        'Appointment scheduling',
        'Marketing content generation',
        'Priority support',
      ],
    },
    {
      stripe_price_id: 'price_1TtSa7D7OxutGUwVsFu6igBw',
      name: 'Scale',
      slug: 'scale',
      description: 'For businesses that want unlimited AI workforce',
      price_cents: 99900,
      max_ai_employees: -1, // unlimited
      features: [
        'Everything in Growth',
        'Unlimited AI employees',
        'Custom workflows',
        'Dedicated account manager',
        'API access',
        'White-label options',
      ],
    },
  ];

  for (const plan of plans) {
    await sql`
      INSERT INTO subscription_plans (stripe_price_id, name, slug, description, price_cents, max_ai_employees, features)
      VALUES (${plan.stripe_price_id}, ${plan.name}, ${plan.slug}, ${plan.description}, ${plan.price_cents}, ${plan.max_ai_employees}, ${sql.json(plan.features)})
      ON CONFLICT (slug) DO NOTHING
    `;
    console.log(`  ✅ ${plan.name} ($${plan.price_cents / 100}/mo)`);
  }

  // ── AI Employee Types ──
  console.log('\n🤖 AI Employee Types:');
  const types = [
    {
      slug: 'call-agent',
      name: 'Call Handling Agent',
      description: 'Handles inbound and outbound calls professionally. Takes messages, answers FAQs, routes inquiries to the right person, and provides 24/7 phone coverage.',
      capabilities: ['inbound_calls', 'outbound_calls', 'call_transfer', 'voicemail', 'call_logging', 'call_recording'],
      icon: 'phone',
    },
    {
      slug: 'lead-qualifier',
      name: 'Lead Qualification Specialist',
      description: 'Engages website visitors and prospect lists. Asks qualifying questions, scores leads based on BANT criteria, and prioritizes follow-ups for your sales team.',
      capabilities: ['lead_scoring', 'bant_qualification', 'prospect_engagement', 'lead_routing', 'follow_up_scheduling'],
      icon: 'target',
    },
    {
      slug: 'email-agent',
      name: 'Email & SMS Agent',
      description: 'Manages all email and text communications. Auto-replies to common inquiries, sends personalized follow-ups, and maintains consistent brand voice across channels.',
      capabilities: ['email_auto_reply', 'email_campaigns', 'sms_messaging', 'template_management', 'email_scheduling', 'response_drafting'],
      icon: 'mail',
    },
    {
      slug: 'scheduler',
      name: 'Appointment Scheduler',
      description: 'Manages your business calendar. Books appointments, sends reminders, handles cancellations and rescheduling, and syncs with Google Calendar and Outlook.',
      capabilities: ['calendar_sync', 'appointment_booking', 'reminder_notifications', 'rescheduling', 'availability_management', 'google_calendar', 'outlook'],
      icon: 'calendar',
    },
    {
      slug: 'marketing-agent',
      name: 'Marketing Content Agent',
      description: 'Generates on-brand marketing content. Creates social media posts, email campaigns, blog drafts, ad copy, and promotional materials tailored to your business.',
      capabilities: ['social_media_posts', 'email_campaigns', 'blog_drafts', 'ad_copy', 'content_calendar', 'brand_voice'],
      icon: 'megaphone',
    },
    {
      slug: 'data-analyst',
      name: 'Reports & Analytics Agent',
      description: 'Turns your business data into actionable insights. Creates performance reports, tracks KPIs, analyzes trends, and generates visual dashboards for decision-making.',
      capabilities: ['report_generation', 'kpi_tracking', 'trend_analysis', 'data_visualization', 'dashboard_creation', 'export_csv_pdf'],
      icon: 'bar-chart',
    },
  ];

  for (const type of types) {
    await sql`
      INSERT INTO ai_employee_types (slug, name, description, capabilities, icon)
      VALUES (${type.slug}, ${type.name}, ${type.description}, ${sql.json(type.capabilities)}, ${type.icon})
      ON CONFLICT (slug) DO NOTHING
    `;
    console.log(`  ✅ ${type.name}`);
  }

  // Verify
  console.log('\n🔍 Verifying seed data...');
  const planCount = await sql`SELECT COUNT(*)::int AS count FROM subscription_plans`;
  console.log(`  Subscription plans: ${planCount[0].count}`);

  const typeCount = await sql`SELECT COUNT(*)::int AS count FROM ai_employee_types`;
  console.log(`  AI employee types: ${typeCount[0].count}`);

  await sql.end();
  console.log('\n✅ Seeding complete!');
}

main().catch((e) => {
  console.error('❌ Seed failed:', e);
  process.exit(1);
});