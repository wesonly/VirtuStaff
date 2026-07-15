/**
 * VirtuStaff — Stripe Webhook Handler
 *
 * Handles checkout.session.completed to create/update subscriptions in Neon DB.
 */

import { Hono } from 'hono';
import Stripe from 'stripe';
import { db } from '../db/client.js';
import { subscriptions, subscriptionPlans } from '../db/schema/index.js';
import { eq } from 'drizzle-orm';
import { generateId } from '../shared/utils.js';

const stripeKey = process.env.STRIPE_SECRET_KEY;
const stripe = stripeKey ? new Stripe(stripeKey, { apiVersion: '2024-04-10' }) : null;

export const stripeWebhookRouter = new Hono();

stripeWebhookRouter.post('/webhooks/stripe', async (c) => {
  const body = await c.req.text();
  const signature = c.req.header('stripe-signature');

  if (!signature || !stripe) {
    return c.json({ error: { code: 'not_configured', message: 'Stripe webhook not configured' } }, 200);
  }

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, signature, process.env.STRIPE_WEBHOOK_SECRET || '');
  } catch {
    return c.json({ error: { code: 'invalid_signature', message: 'Invalid signature' } }, 400);
  }

  switch (event.type) {
    case 'checkout.session.completed': {
      const session = event.data.object as Stripe.Checkout.Session;
      const plan = session.metadata?.plan || 'starter';
      const orgId = session.metadata?.orgId;

      // Find the plan in DB
      const planRecord = await db.select().from(subscriptionPlans).where(eq(subscriptionPlans.slug, plan)).limit(1);
      if (!planRecord.length) {
        console.error(`[Stripe Webhook] Unknown plan: ${plan}`);
        return c.json({ received: true });
      }

      // If orgId is set, create/update subscription
      if (orgId && orgId !== 'new') {
        const existingSub = await db.select().from(subscriptions).where(eq(subscriptions.organizationId, orgId)).limit(1);
        if (existingSub.length) {
          await db.update(subscriptions).set({
            stripeSubscriptionId: session.subscription as string || existingSub[0].stripeSubscriptionId,
            stripeCustomerId: session.customer as string || existingSub[0].stripeCustomerId,
            status: 'active',
            currentPeriodStart: new Date((session.created || 0) * 1000),
            currentPeriodEnd: session.expires_at ? new Date(session.expires_at * 1000) : null,
          }).where(eq(subscriptions.id, existingSub[0].id));
        } else {
          await db.insert(subscriptions).values({
            id: generateId(),
            organizationId: orgId,
            planId: planRecord[0].id,
            stripeSubscriptionId: session.subscription as string || null,
            stripeCustomerId: session.customer as string || null,
            status: 'active',
            currentPeriodStart: new Date(),
          });
        }
      }

      console.log(`[Stripe Webhook] Checkout completed: plan=${plan}, org=${orgId}`);
      break;
    }

    case 'customer.subscription.deleted': {
      const sub = event.data.object as Stripe.Subscription;
      const existingSub = await db.select().from(subscriptions).where(
        eq(subscriptions.stripeSubscriptionId, sub.id)
      ).limit(1);
      if (existingSub.length) {
        await db.update(subscriptions).set({
          status: 'canceled',
          canceledAt: new Date(),
        }).where(eq(subscriptions.id, existingSub[0].id));
      }
      break;
    }

    case 'invoice.paid': {
      const invoice = event.data.object as Stripe.Invoice;
      if (invoice.subscription) {
        await db.update(subscriptions).set({
          status: 'active',
          currentPeriodStart: invoice.period_start ? new Date(invoice.period_start * 1000) : undefined,
          currentPeriodEnd: invoice.period_end ? new Date(invoice.period_end * 1000) : undefined,
        }).where(eq(subscriptions.stripeSubscriptionId, invoice.subscription as string));
      }
      break;
    }

    case 'invoice.payment_failed': {
      const failedInvoice = event.data.object as Stripe.Invoice;
      if (failedInvoice.subscription) {
        await db.update(subscriptions).set({
          status: 'past_due',
        }).where(eq(subscriptions.stripeSubscriptionId, failedInvoice.subscription as string));
      }
      break;
    }
  }

  return c.json({ received: true });
});