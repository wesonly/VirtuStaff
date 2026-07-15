/**
 * VirtuStaff — Clerk Webhook Handler
 */

import { Hono } from 'hono';
import { handleClerkWebhook } from '../integrations/clerk.js';

export const clerkWebhookRouter = new Hono();

clerkWebhookRouter.post('/webhooks/clerk', async (c) => {
  const payload = await c.req.json();
  try {
    await handleClerkWebhook(payload);
    return c.json({ received: true });
  } catch (error) {
    return c.json({
      error: { code: 'webhook_error', message: 'Failed to process Clerk webhook' },
    }, 500);
  }
});