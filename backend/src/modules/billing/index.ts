/**
 * VirtuStaff — Billing Module
 *
 * Stripe Customer Portal sessions, subscription details, and payment history.
 * Mounted at /api/v1/billing/*
 */

import { Hono } from 'hono';
import Stripe from 'stripe';
import { db } from '../../db/client.js';
import { subscriptions, subscriptionPlans } from '../../db/schema/index.js';
import { eq } from 'drizzle-orm';

const stripeKey = process.env.STRIPE_SECRET_KEY;
const stripe = stripeKey ? new Stripe(stripeKey, { apiVersion: '2024-04-10' }) : null;

export const billingRouter = new Hono();

/**
 * POST /billing/portal
 * Create a Stripe Customer Portal session and return the URL.
 * Body: { orgId: string, returnUrl?: string }
 */
billingRouter.post('/billing/portal', async (c) => {
  try {
    if (!stripe) {
      return c.json({ error: { code: 'stripe_not_configured', message: 'Stripe is not configured' } }, 500);
    }

    const { orgId, returnUrl } = await c.req.json();

    if (!orgId) {
      return c.json({ error: { code: 'missing_org_id', message: 'orgId is required' } }, 400);
    }

    // Look up the subscription and get the Stripe customer ID
    const sub = await db
      .select({
        stripeCustomerId: subscriptions.stripeCustomerId,
        status: subscriptions.status,
      })
      .from(subscriptions)
      .where(eq(subscriptions.organizationId, orgId))
      .limit(1);

    if (!sub.length || !sub[0].stripeCustomerId) {
      return c.json({
        error: { code: 'no_customer', message: 'No Stripe customer found. Create a subscription first.' },
      }, 404);
    }

    const session = await stripe.billingPortal.sessions.create({
      customer: sub[0].stripeCustomerId,
      return_url: returnUrl || `${c.req.header('origin') || 'https://be740fcb1111d6740ba7b0a41c2d3231.ctonew.app'}/app/billing`,
    });

    return c.json({
      success: true,
      portalUrl: session.url,
      sessionId: session.id,
    });
  } catch (error) {
    console.error('[BILLING PORTAL] Error:', error);
    return c.json({
      error: { code: 'portal_failed', message: error instanceof Error ? error.message : 'Failed to create portal session' },
    }, 500);
  }
});

/**
 * GET /billing/subscription?orgId=xxx
 * Fetch detailed subscription info from Stripe (via the Stripe subscription ID stored in our DB).
 * Returns: plan, status, current period, trial dates, cancel info, payment method info.
 */
billingRouter.get('/billing/subscription', async (c) => {
  try {
    if (!stripe) {
      return c.json({ error: { code: 'stripe_not_configured', message: 'Stripe is not configured' } }, 500);
    }

    const orgId = c.req.query('orgId');
    if (!orgId) {
      return c.json({ error: { code: 'missing_org_id', message: 'orgId query parameter is required' } }, 400);
    }

    // Get subscription from our DB
    const dbSub = await db
      .select({
        id: subscriptions.id,
        stripeSubscriptionId: subscriptions.stripeSubscriptionId,
        stripeCustomerId: subscriptions.stripeCustomerId,
        status: subscriptions.status,
        currentPeriodStart: subscriptions.currentPeriodStart,
        currentPeriodEnd: subscriptions.currentPeriodEnd,
        trialEnd: subscriptions.trialEnd,
        canceledAt: subscriptions.canceledAt,
        plan: {
          id: subscriptionPlans.id,
          name: subscriptionPlans.name,
          slug: subscriptionPlans.slug,
          priceCents: subscriptionPlans.priceCents,
          maxAiEmployees: subscriptionPlans.maxAiEmployees,
          features: subscriptionPlans.features,
        },
      })
      .from(subscriptions)
      .leftJoin(subscriptionPlans, eq(subscriptions.planId, subscriptionPlans.id))
      .where(eq(subscriptions.organizationId, orgId))
      .limit(1);

    if (!dbSub.length) {
      return c.json({ data: null });
    }

    const sub = dbSub[0];
    let stripeSub: Stripe.Subscription | null = null;
    let paymentMethod: { brand: string; last4: string; expMonth: number; expYear: number } | null = null;
    let upcomingInvoiceAmount: number | null = null;

    // Fetch Stripe subscription details
    if (sub.stripeSubscriptionId) {
      try {
        stripeSub = await stripe.subscriptions.retrieve(sub.stripeSubscriptionId, {
          expand: ['latest_invoice.payment_intent'],
        });
      } catch {
        // Subscription may not exist in Stripe (e.g., dev/test)
      }
    }

    // Fetch payment method
    if (sub.stripeCustomerId) {
      try {
        const pmList = await stripe.paymentMethods.list({
          customer: sub.stripeCustomerId,
          type: 'card',
          limit: 1,
        });
        if (pmList.data.length > 0) {
          const card = pmList.data[0].card;
          if (card) {
            paymentMethod = {
              brand: card.brand,
              last4: card.last4,
              expMonth: card.exp_month,
              expYear: card.exp_year,
            };
          }
        }
      } catch {
        // Payment method fetch can fail silently
      }

      // Get upcoming invoice amount
      try {
        const upcoming = await stripe.invoices.retrieveUpcoming({
          customer: sub.stripeCustomerId,
        });
        upcomingInvoiceAmount = upcoming.amount_due;
      } catch {
        // Not always possible (e.g., no upcoming invoice)
      }
    }

    return c.json({
      data: {
        id: sub.id,
        status: sub.status,
        currentPeriodStart: sub.currentPeriodStart,
        currentPeriodEnd: sub.currentPeriodEnd,
        trialEnd: sub.trialEnd,
        canceledAt: sub.canceledAt,
        plan: sub.plan,
        stripeStatus: stripeSub?.status || null,
        cancelAtPeriodEnd: stripeSub?.cancel_at_period_end || false,
        cancelAt: stripeSub?.cancel_at ? new Date(stripeSub.cancel_at * 1000).toISOString() : null,
        paymentMethod,
        nextBillingAmount: upcomingInvoiceAmount,
      },
    });
  } catch (error) {
    console.error('[BILLING SUBSCRIPTION] Error:', error);
    return c.json({
      error: { code: 'fetch_failed', message: error instanceof Error ? error.message : 'Failed to fetch subscription' },
    }, 500);
  }
});

/**
 * GET /billing/payments?orgId=xxx&limit=10
 * Fetch payment/invoice history from Stripe.
 */
billingRouter.get('/billing/payments', async (c) => {
  try {
    if (!stripe) {
      return c.json({ error: { code: 'stripe_not_configured', message: 'Stripe is not configured' } }, 500);
    }

    const orgId = c.req.query('orgId');
    const limit = parseInt(c.req.query('limit') || '12', 10);

    if (!orgId) {
      return c.json({ error: { code: 'missing_org_id', message: 'orgId query parameter is required' } }, 400);
    }

    // Get Stripe customer ID from our DB
    const sub = await db
      .select({ stripeCustomerId: subscriptions.stripeCustomerId })
      .from(subscriptions)
      .where(eq(subscriptions.organizationId, orgId))
      .limit(1);

    if (!sub.length || !sub[0].stripeCustomerId) {
      return c.json({ data: [] });
    }

    const invoices = await stripe.invoices.list({
      customer: sub[0].stripeCustomerId,
      limit,
      expand: ['data.payment_intent'],
    });

    const payments = invoices.data.map((inv) => {
      const pi = inv.payment_intent as Stripe.PaymentIntent | null;
      let cardBrand: string | null = null;
      let cardLast4: string | null = null;

      return {
        id: inv.id,
        number: inv.number,
        amountPaid: inv.amount_paid,
        amountDue: inv.amount_due,
        currency: inv.currency,
        status: inv.status,
        invoicePdf: inv.invoice_pdf,
        hostedInvoiceUrl: inv.hosted_invoice_url,
        periodStart: inv.period_start ? new Date(inv.period_start * 1000).toISOString() : null,
        periodEnd: inv.period_end ? new Date(inv.period_end * 1000).toISOString() : null,
        created: new Date(inv.created * 1000).toISOString(),
        paid: inv.paid,
        paymentIntentStatus: pi?.status || null,
        cardBrand,
        cardLast4,
      };
    });

    return c.json({ data: payments });
  } catch (error) {
    console.error('[BILLING PAYMENTS] Error:', error);
    return c.json({
      error: { code: 'fetch_failed', message: error instanceof Error ? error.message : 'Failed to fetch payments' },
    }, 500);
  }
});

/**
 * POST /billing/cancel
 * Cancel a subscription at period end via Stripe.
 * Body: { orgId: string, immediate?: boolean }
 */
billingRouter.post('/billing/cancel', async (c) => {
  try {
    if (!stripe) {
      return c.json({ error: { code: 'stripe_not_configured', message: 'Stripe is not configured' } }, 500);
    }

    const { orgId, immediate } = await c.req.json();

    if (!orgId) {
      return c.json({ error: { code: 'missing_org_id', message: 'orgId is required' } }, 400);
    }

    const sub = await db
      .select({
        stripeSubscriptionId: subscriptions.stripeSubscriptionId,
      })
      .from(subscriptions)
      .where(eq(subscriptions.organizationId, orgId))
      .limit(1);

    if (!sub.length || !sub[0].stripeSubscriptionId) {
      return c.json({ error: { code: 'no_subscription', message: 'No active subscription found' } }, 404);
    }

    if (immediate) {
      await stripe.subscriptions.cancel(sub[0].stripeSubscriptionId);
      await db.update(subscriptions).set({
        status: 'canceled',
        canceledAt: new Date(),
      }).where(eq(subscriptions.organizationId, orgId));
    } else {
      // Cancel at period end
      await stripe.subscriptions.update(sub[0].stripeSubscriptionId, {
        cancel_at_period_end: true,
      });
      // Status will be updated when webhook fires customer.subscription.deleted
    }

    return c.json({ success: true, immediate: !!immediate });
  } catch (error) {
    console.error('[BILLING CANCEL] Error:', error);
    return c.json({
      error: { code: 'cancel_failed', message: error instanceof Error ? error.message : 'Failed to cancel subscription' },
    }, 500);
  }
});

/**
 * POST /billing/reactivate
 * Reactivate a subscription set to cancel at period end.
 * Body: { orgId: string }
 */
billingRouter.post('/billing/reactivate', async (c) => {
  try {
    if (!stripe) {
      return c.json({ error: { code: 'stripe_not_configured', message: 'Stripe is not configured' } }, 500);
    }

    const { orgId } = await c.req.json();

    if (!orgId) {
      return c.json({ error: { code: 'missing_org_id', message: 'orgId is required' } }, 400);
    }

    const sub = await db
      .select({ stripeSubscriptionId: subscriptions.stripeSubscriptionId })
      .from(subscriptions)
      .where(eq(subscriptions.organizationId, orgId))
      .limit(1);

    if (!sub.length || !sub[0].stripeSubscriptionId) {
      return c.json({ error: { code: 'no_subscription', message: 'No subscription found' } }, 404);
    }

    await stripe.subscriptions.update(sub[0].stripeSubscriptionId, {
      cancel_at_period_end: false,
    });

    return c.json({ success: true });
  } catch (error) {
    console.error('[BILLING REACTIVATE] Error:', error);
    return c.json({
      error: { code: 'reactivate_failed', message: error instanceof Error ? error.message : 'Failed to reactivate subscription' },
    }, 500);
  }
});
