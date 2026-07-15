/**
 * VirtuStaff — Stripe Products & Prices Setup Script
 *
 * Run this script to create the subscription products and prices in Stripe.
 * Usage: npx tsx src/scripts/setup-stripe-products.ts
 *
 * Prerequisites: STRIPE_SECRET_KEY must be set in environment or .env file.
 */

import Stripe from 'stripe';

const stripeKey = process.env.STRIPE_SECRET_KEY;
if (!stripeKey) {
  console.error('Error: STRIPE_SECRET_KEY environment variable is required.');
  console.error('Set it in your .env file or export it before running.');
  process.exit(1);
}

const stripe = new Stripe(stripeKey, { apiVersion: '2024-04-10' });

interface ProductConfig {
  name: string;
  description: string;
  priceCents: number;
  interval: 'month' | 'year';
  metadata: Record<string, string>;
}

const products: ProductConfig[] = [
  {
    name: 'Starter',
    description: 'For small businesses just getting started with AI employees. Includes 2 AI employees, core capabilities (voice, email, SMS), and basic CRM integrations.',
    priceCents: 9900, // $99/month
    interval: 'month',
    metadata: {
      plan: 'starter',
      max_employees: '2',
      features: JSON.stringify(['voice_call', 'email', 'sms', 'basic_crm']),
    },
  },
  {
    name: 'Growth',
    description: 'For growing teams that need more AI employees and advanced integrations. Includes up to 5 AI employees, advanced CRM, workflow automation, and priority support.',
    priceCents: 29900, // $299/month
    interval: 'month',
    metadata: {
      plan: 'growth',
      max_employees: '5',
      features: JSON.stringify(['voice_call', 'email', 'sms', 'advanced_crm', 'workflows', 'priority_support']),
    },
  },
  {
    name: 'Scale',
    description: 'For businesses that need unlimited AI employees and custom solutions. Includes unlimited AI employees, custom integrations, dedicated account management, and white-glove onboarding.',
    priceCents: 99900, // $999/month
    interval: 'month',
    metadata: {
      plan: 'scale',
      max_employees: '-1', // unlimited
      features: JSON.stringify(['voice_call', 'email', 'sms', 'advanced_crm', 'workflows', 'custom_integrations', 'dedicated_support']),
    },
  },
  {
    name: 'Starter (Annual)',
    description: 'Starter plan billed annually — save 2 months.',
    priceCents: 79900, // $799/year ($66.58/month)
    interval: 'year',
    metadata: {
      plan: 'starter',
      max_employees: '2',
      billing: 'annual',
    },
  },
  {
    name: 'Growth (Annual)',
    description: 'Growth plan billed annually — save 2 months.',
    priceCents: 249900, // $2,499/year ($208.25/month)
    interval: 'year',
    metadata: {
      plan: 'growth',
      max_employees: '5',
      billing: 'annual',
    },
  },
  {
    name: 'Scale (Annual)',
    description: 'Scale plan billed annually — save 2 months.',
    priceCents: 849900, // $8,499/year ($708.25/month)
    interval: 'year',
    metadata: {
      plan: 'scale',
      max_employees: '-1',
      billing: 'annual',
    },
  },
];

async function setupProducts() {
  console.log('Checking existing Stripe products...\n');

  // List existing products
  const existingProducts = await stripe.products.list({ active: true, limit: 100 });
  const existingNames = new Set(existingProducts.data.map((p) => p.name));
  console.log(`Found ${existingProducts.data.length} existing products.`);

  for (const product of products) {
    if (existingNames.has(product.name)) {
      console.log(`⏭️  Skipping "${product.name}" — already exists.`);
      continue;
    }

    console.log(`\nCreating "${product.name}"...`);

    // Create the product
    const createdProduct = await stripe.products.create({
      name: product.name,
      description: product.description,
      metadata: product.metadata,
    });

    // Create the price
    const price = await stripe.prices.create({
      product: createdProduct.id,
      unit_amount: product.priceCents,
      currency: 'usd',
      recurring: { interval: product.interval },
      metadata: product.metadata,
    });

    console.log(`  ✅ Product: ${createdProduct.id}`);
    console.log(`  ✅ Price:   ${price.id} ($${(product.priceCents / 100).toFixed(2)}/${product.interval})`);
  }

  console.log('\n=== Stripe setup complete! ===');
  console.log('\nAdd these price IDs to your .env file:');
  console.log('STRIPE_PRICE_STARTER=<monthly_starter_price_id>');
  console.log('STRIPE_PRICE_GROWTH=<monthly_growth_price_id>');
  console.log('STRIPE_PRICE_SCALE=<monthly_scale_price_id>');

  // Print the created prices
  const allPrices = await stripe.prices.list({ active: true, limit: 100 });
  for (const price of allPrices.data) {
    const prod = await stripe.products.retrieve(price.product as string);
    console.log(`  ${prod.name}: ${price.id} ($${(price.unit_amount! / 100).toFixed(2)}/${price.recurring?.interval})`);
  }
}

setupProducts().catch((err) => {
  console.error('Failed to set up Stripe products:', err);
  process.exit(1);
});