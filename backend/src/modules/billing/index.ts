/**
 * VirtuStaff — Billing Module
 *
 * Endpoints for subscription management, invoices, payments, and Stripe Customer Portal.
 * Uses the existing Stripe client and Neon DB subscription records.
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
 * GET /api/v1/billing/subscription
 * Returns the current subscription details for the authenticated org.
 * Merges Neon DB subscription record with live Stripe data.
 */
billingRouter.get('/billing/subscription', async (c) => {
  try {
    const orgId = c.req.header('x-org-id');
    if (!orgId) {
      return c.json({ error: { code: 'missing_org', message: 'x-org-id header is required' } }, 400);
    }

    const sub = await db
      .select({
        id: subscriptions.id,
        planId: subscriptions.planId,
        status: subscriptions.status,
        stripeSubscriptionId: subscriptions.stripeSubscriptionId,
        stripeCustomerId: subscriptions.stripeCustomerId,
        currentPeriodStart: subscriptions.currentPeriodStart,
        currentPeriodEnd: subscriptions.currentPeriodEnd,
        trialEnd: subscriptions.trialEnd,
        canceledAt: subscriptions.canceledAt,
        createdAt: subscriptions.createdAt,
        plan: {
          name: subscriptionPlans.name,
          slug: subscriptionPlans.slug,
          priceCents: subscriptionPlans.priceCents,
          currency: subscriptionPlans.currency,
          interval: subscriptionPlans.interval,
          maxAiEmployees: subscriptionPlans.maxAiEmployees,
          features: subscriptionPlans.features,
          description: subscriptionPlans.description,
        },
      })
      .from(subscriptions)
      .leftJoin(subscriptionPlans, eq(subscriptions.planId, subscriptionPlans.id))
      .where(eq(subscriptions.organizationId, orgId))
      .limit(1);

    const localSub = sub[0] || null;

    // Try to enrich with live Stripe data if we have a stripe subscription ID
    let stripeSub: Stripe.Subscription | null = null;
    if (stripe && localSub?.stripeSubscriptionId) {
      try {
        stripeSub = await stripe.subscriptions.retrieve(localSub.stripeSubscriptionId);
      } catch {
        // Stripe fetch failed — return local data gracefully
      }
    }

    return c.json({
      data: {
        ...localSub,
        stripe: stripeSub
          ? {
              id: stripeSub.id,
              status: stripeSub.status,
              currentPeriodStart: new Date(stripeSub.current_period_start * 1000),
              currentPeriodEnd: new Date(stripeSub.current_period_end * 1000),
              trialEnd: stripeSub.trial_end ? new Date(stripeSub.trial_end * 1000) : null,
              canceledAt: stripeSub.canceled_at ? new Date(stripeSub.canceled_at * 1000) : null,
              cancelAtPeriodEnd: stripeSub.cancel_at_period_end,
              defaultPaymentMethod: stripeSub.default_payment_method,
            }
          : null,
      },
    });
  } catch (error) {
    console.error('[BILLING] Error fetching subscription:', error);
    return c.json({
      error: { code: 'fetch_failed', message: error instanceof Error ? error.message : 'Unknown error' },
    }, 500);
  }
});

/**
 * GET /api/v1/billing/invoices
 * Returns invoice history from Stripe for the org's customer.
 */
billingRouter.get('/billing/invoices', async (c) => {
  try {
    const orgId = c.req.header('x-org-id');
    if (!orgId) {
      return c.json({ error: { code: 'missing_org', message: 'x-org-id header is required' } }, 400);
    }

    const sub = await db
      .select({ stripeCustomerId: subscriptions.stripeCustomerId })
      .from(subscriptions)
      .where(eq(subscriptions.organizationId, orgId))
      .limit(1);

    const customerId = sub[0]?.stripeCustomerId;

    if (!stripe || !customerId) {
      return c.json({ data: [], meta: { total: 0 } });
    }

    const invoices = await stripe.invoices.list({
      customer: customerId,
      limit: 24,
    });

    return c.json({
      data: invoices.data.map((inv) => ({
        id: inv.id,
        number: inv.number,
        amountPaid: inv.amount_paid,
        amountDue: inv.amount_due,
        currency: inv.currency,
        status: inv.status,
        paid: inv.paid,
        created: new Date(inv.created * 1000),
        periodStart: new Date(inv.period_start * 1000),
        periodEnd: new Date(inv.period_end * 1000),
        hostedInvoiceUrl: inv.hosted_invoice_url,
        pdfUrl: inv.invoice_pdf,
        lines: inv.lines.data.map((line) => ({
          description: line.description,
          amount: line.amount,
          period: line.period ? {
            start: new Date(line.period.start * 1000),
            end: new Date(line.period.end * 1000),
          } : null,
        })),
      })),
      meta: { total: invoices.data.length },
    });
  } catch (error) {
    console.error('[BILLING] Error fetching invoices:', error);
    return c.json({
      error: { code: 'fetch_failed', message: error instanceof Error ? error.message : 'Unknown error' },
    }, 500);
  }
});

/**
 * GET /api/v1/billing/payments
 * Returns payment history from Stripe for the org's customer.
 */
billingRouter.get('/billing/payments', async (c) => {
  try {
    const orgId = c.req.header('x-org-id');
    if (!orgId) {
      return c.json({ error: { code: 'missing_org', message: 'x-org-id header is required' } }, 400);
    }

    const sub = await db
      .select({ stripeCustomerId: subscriptions.stripeCustomerId })
      .from(subscriptions)
      .where(eq(subscriptions.organizationId, orgId))
      .limit(1);

    const customerId = sub[0]?.stripeCustomerId;

    if (!stripe || !customerId) {
      return c.json({ data: [], meta: { total: 0 } });
    }

    const paymentIntents = await stripe.paymentIntents.list({
      customer: customerId,
      limit: 24,
    });

    return c.json({
      data: paymentIntents.data.map((pi) => ({
        id: pi.id,
        amount: pi.amount,
        amountCapturable: pi.amount_capturable,
        amountReceived: pi.amount_received,
        currency: pi.currency,
        status: pi.status,
        created: new Date(pi.created * 1000),
        description: pi.description,
        paymentMethod: pi.payment_method_types,
        invoiceId: pi.invoice,
        receiptEmail: pi.receipt_email,
      })),
      meta: { total: paymentIntents.data.length },
    });
  } catch (error) {
    console.error('[BILLING] Error fetching payments:', error);
    return c.json({
      error: { code: 'fetch_failed', message: error instanceof Error ? error.message : 'Unknown error' },
    }, 500);
  }
});

/**
 * POST /api/v1/billing/portal
 * Creates a Stripe Customer Portal session and returns the URL.
 */
billingRouter.post('/billing/portal', async (c) => {
  try {
    const orgId = c.req.header('x-org-id');
    if (!orgId) {
      return c.json({ error: { code: 'missing_org', message: 'x-org-id header is required' } }, 400);
    }

    if (!stripe) {
      return c.json({
        error: { code: 'stripe_not_configured', message: 'Stripe is not configured' },
      }, 500);
    }

    const sub = await db
      .select({ stripeCustomerId: subscriptions.stripeCustomerId })
      .from(subscriptions)
      .where(eq(subscriptions.organizationId, orgId))
      .limit(1);

    let customerId = sub[0]?.stripeCustomerId;

    // If no Stripe customer yet, create one
    if (!customerId) {
      const customer = await stripe.customers.create({
        metadata: { orgId },
      });
      customerId = customer.id;
      // Update the subscription record with the customer ID
      await db
        .update(subscriptions)
        .set({ stripeCustomerId: customerId })
        .where(eq(subscriptions.organizationId, orgId));
    }

    const session = await stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: c.req.header('Referer') || 'https://be740fcb1111d6740ba7b0a41c2d3231.ctonew.app/app/billing',
    });

    return c.json({
      success: true,
      url: session.url,
    });
  } catch (error) {
    console.error('[BILLING] Error creating portal session:', error);
    return c.json({
      error: { code: 'portal_failed', message: error instanceof Error ? error.message : 'Unknown error' },
    }, 500);
  }
});

/**
 * POST /api/v1/billing/cancel
 * Cancels the subscription at the end of the current billing period.
 */
billingRouter.post('/billing/cancel', async (c) => {
  try {
    const orgId = c.req.header('x-org-id');
    if (!orgId) {
      return c.json({ error: { code: 'missing_org', message: 'x-org-id header is required' } }, 400);
    }

    if (!stripe) {
      return c.json({
        error: { code: 'stripe_not_configured', message: 'Stripe is not configured' },
      }, 500);
    }

    const sub = await db
      .select({ stripeSubscriptionId: subscriptions.stripeSubscriptionId })
      .from(subscriptions)
      .where(eq(subscriptions.organizationId, orgId))
      .limit(1);

    const stripeSubId = sub[0]?.stripeSubscriptionId;

    if (!stripeSubId) {
      return c.json({
        error: { code: 'no_subscription', message: 'No active subscription found' },
      }, 404);
    }

    // Cancel at period end (don't immediately cancel)
    const updatedSubscription = await stripe.subscriptions.update(stripeSubId, {
      cancel_at_period_end: true,
    });

    // Update local DB
    await db
      .update(subscriptions)
      .set({
        status: 'canceled',
        updatedAt: new Date(),
      })
      .where(eq(subscriptions.organizationId, orgId));

    return c.json({
      success: true,
      data: {
        cancelAtPeriodEnd: updatedSubscription.cancel_at_period_end,
        currentPeriodEnd: new Date(updatedSubscription.current_period_end * 1000),
      },
    });
  } catch (error) {
    console.error('[BILLING] Error canceling subscription:', error);
    return c.json({
      error: { code: 'cancel_failed', message: error instanceof Error ? error.message : 'Unknown error' },
    }, 500);
  }
});

/**
 * POST /api/v1/billing/change-plan
 * Upgrades or downgrades to a different subscription plan.
 */
billingRouter.post('/billing/change-plan', async (c) => {
  try {
    const orgId = c.req.header('x-org-id');
    if (!orgId) {
      return c.json({ error: { code: 'missing_org', message: 'x-org-id header is required' } }, 400);
    }

    if (!stripe) {
      return c.json({
        error: { code: 'stripe_not_configured', message: 'Stripe is not configured' },
      }, 500);
    }

    const body = await c.req.json();
    const { planSlug } = body;

    if (!planSlug) {
      return c.json({
        error: { code: 'missing_plan', message: 'planSlug is required' },
      }, 400);
    }

    // Fetch the target plan from the DB
    const targetPlan = await db
      .select()
      .from(subscriptionPlans)
      .where(eq(subscriptionPlans.slug, planSlug))
      .limit(1);

    if (!targetPlan.length) {
      return c.json({
        error: { code: 'invalid_plan', message: `Plan "${planSlug}" not found` },
      }, 404);
    }

    const planRecord = targetPlan[0];

    // Fetch the current subscription
    const currentSub = await db
      .select()
      .from(subscriptions)
      .where(eq(subscriptions.organizationId, orgId))
      .limit(1);

    if (!currentSub.length) {
      return c.json({
        error: { code: 'no_subscription', message: 'No subscription found. Please subscribe first.' },
      }, 404);
    }

    const subRecord = currentSub[0];

    // If there's an active Stripe subscription, update it
    if (subRecord.stripeSubscriptionId && planRecord.stripePriceId) {
      await stripe.subscriptions.update(subRecord.stripeSubscriptionId, {
        items: [{
          id: (await stripe.subscriptions.retrieve(subRecord.stripeSubscriptionId)).items.data[0].id,
          price: planRecord.stripePriceId,
        }],
        proration_behavior: 'create_prorations',
      });
    }

    // Update the local DB record
    await db
      .update(subscriptions)
      .set({
        planId: planRecord.id,
        updatedAt: new Date(),
      })
      .where(eq(subscriptions.organizationId, orgId));

    return c.json({
      success: true,
      data: {
        planId: planRecord.id,
        planName: planRecord.name,
        planSlug: planRecord.slug,
        priceCents: planRecord.priceCents,
        maxAiEmployees: planRecord.maxAiEmployees,
      },
    });
  } catch (error) {
    console.error('[BILLING] Error changing plan:', error);
    return c.json({
      error: { code: 'change_plan_failed', message: error instanceof Error ? error.message : 'Unknown error' },
    }, 500);
  }
});