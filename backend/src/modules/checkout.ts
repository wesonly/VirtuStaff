/**
 * VirtuStaff — Stripe Checkout Endpoint
 *
 * POST /api/v1/checkout
 * Creates a Stripe Checkout Session with a 7-day free trial.
 */

import { Hono } from 'hono';
import Stripe from 'stripe';

const stripeKey = process.env.STRIPE_SECRET_KEY;
const stripe = stripeKey ? new Stripe(stripeKey, { apiVersion: '2024-04-10' }) : null;

interface PlanConfig {
  name: string;
  priceCents: number;
  description: string;
}

const plans: Record<string, PlanConfig> = {
  starter: {
    name: 'Starter',
    priceCents: 9900,
    description: '2 AI employees, core capabilities',
  },
  growth: {
    name: 'Growth',
    priceCents: 29900,
    description: '5 AI employees, advanced integrations',
  },
  scale: {
    name: 'Scale',
    priceCents: 99900,
    description: 'Unlimited AI employees, custom workflows',
  },
};

export const checkoutRouter = new Hono();

checkoutRouter.post('/checkout', async (c) => {
  try {
    const { plan, successUrl, cancelUrl } = await c.req.json();

    if (!plan || !plans[plan]) {
      return c.json({
        error: { code: 'invalid_plan', message: `Invalid plan. Choose: ${Object.keys(plans).join(', ')}` },
      }, 400);
    }

    if (!stripe) {
      return c.json({
        error: { code: 'stripe_not_configured', message: 'Stripe is not configured' },
      }, 500);
    }

    const planConfig = plans[plan];

    // Find or create the product in Stripe
    let productId: string;
    const existingProducts = await stripe.products.list({
      active: true,
      limit: 100,
    });
    const existingProduct = existingProducts.data.find(
      (p) => p.metadata?.plan === plan,
    );

    if (existingProduct) {
      productId = existingProduct.id;
    } else {
      const newProduct = await stripe.products.create({
        name: planConfig.name,
        description: planConfig.description,
        metadata: { plan },
      });
      productId = newProduct.id;
    }

    // Find or create the price
    const existingPrices = await stripe.prices.list({
      product: productId,
      active: true,
      limit: 10,
    });
    let priceId: string;
    const monthlyPrice = existingPrices.data.find(
      (p) => p.recurring?.interval === 'month' && p.unit_amount === planConfig.priceCents,
    );

    if (monthlyPrice) {
      priceId = monthlyPrice.id;
    } else {
      const newPrice = await stripe.prices.create({
        product: productId,
        unit_amount: planConfig.priceCents,
        currency: 'usd',
        recurring: { interval: 'month' },
        metadata: { plan },
      });
      priceId = newPrice.id;
    }

    // Create Checkout Session with 7-day trial
    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      line_items: [{ price: priceId, quantity: 1 }],
      subscription_data: {
        trial_period_days: 7,
      },
      success_url: successUrl || 'https://be740fcb1111d6740ba7b0a41c2d3231.ctonew.app/app?checkout=success',
      cancel_url: cancelUrl || 'https://be740fcb1111d6740ba7b0a41c2d3231.ctonew.app/pricing',
      metadata: { plan },
    });

    return c.json({
      success: true,
      checkoutUrl: session.url,
      sessionId: session.id,
    });
  } catch (error) {
    console.error('[CHECKOUT] Error:', error);
    return c.json({
      error: { code: 'checkout_failed', message: error instanceof Error ? error.message : 'Failed to create checkout' },
    }, 500);
  }
});