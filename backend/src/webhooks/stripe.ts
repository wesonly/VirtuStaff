/**
 * VirtuStaff — Stripe Webhook Handler
 */

import { Hono } from 'hono';
import { handleStripeWebhook } from '../integrations/stripe.js';

export const stripeWebhookRouter = new Hono();

stripeWebhookRouter.post('/webhooks/stripe', async (c) => {
  const body = await c.req.text();
  const signature = c.req.header('stripe-signature');

  if (!signature) {
    return c.json({ error: { code: 'missing_signature', message: 'Missing Stripe signature' } }, 400);
  }

  try {
    const result = await handleStripeWebhook(body, signature);
    return c.json(result);
  } catch {
    return c.json({ error: { code: 'invalid_signature', message: 'Invalid webhook signature' } }, 400);
  }
});