import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState, useCallback } from "react";
import { AppLayout } from "~/components/app-layout";
import {
  fetchBillingSubscription,
  fetchBillingPayments,
  fetchSubscriptionPlans,
  createBillingPortal,
  cancelBillingSubscription,
  reactivateBillingSubscription,
  type BillingSubscription,
  type PaymentHistoryItem,
  type SubscriptionPlan,
} from "~/lib/api-client";

export const Route = createFileRoute("/app/billing")({
  component: BillingPage,
});

// ─── Helpers ──────────────────────────────────────────────────────────────────

const STRIPE_CHECKOUT_URLS: Record<string, string> = {
  starter: "https://buy.stripe.com/eVq28q8wn36LeDc83Zes002",
  growth: "https://buy.stripe.com/14A5kCdQHazdcv4983es001",
  scale: "https://buy.stripe.com/3cIfZgdQH8r5fHg83Zes000",
};

function formatCents(cents: number | null | undefined): string {
  if (cents == null) return "$0.00";
  return `$${(cents / 100).toFixed(2)}`;
}

function formatDate(dateStr: string | null | undefined): string {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function statusBadge(status: string, cancelAtPeriodEnd?: boolean) {
  const display = cancelAtPeriodEnd && status === "active" ? "canceling" : status;
  const config: Record<string, { label: string; classes: string }> = {
    active: { label: "Active", classes: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400" },
    trialing: { label: "Trial", classes: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400" },
    past_due: { label: "Past Due", classes: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400" },
    canceled: { label: "Canceled", classes: "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400" },
    canceling: { label: "Canceling", classes: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400" },
    incomplete: { label: "Incomplete", classes: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400" },
    unpaid: { label: "Unpaid", classes: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400" },
  };
  const c = config[display] || { label: display, classes: "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400" };
  return <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${c.classes}`}>{c.label}</span>;
}

function cardBrandIcon(brand: string) {
  const colors: Record<string, string> = {
    visa: "from-blue-500 to-blue-600",
    mastercard: "from-red-500 to-orange-500",
    amex: "from-blue-400 to-blue-700",
    discover: "from-orange-400 to-orange-600",
  };
  const gradient = colors[brand.toLowerCase()] || "from-gray-400 to-gray-500";
  return (
    <div className={`flex h-10 w-14 items-center justify-center rounded-lg bg-gradient-to-br ${gradient} text-xs font-bold text-white`}>
      {brand.toUpperCase()}
    </div>
  );
}

// ─── Skeleton Components ──────────────────────────────────────────────────────

function SkeletonBlock({ className = "" }: { className?: string }) {
  return <div className={`animate-pulse rounded bg-gray-200 dark:bg-gray-800 ${className}`} />;
}

function PlanCardSkeleton() {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-900">
      <SkeletonBlock className="mb-3 h-5 w-20" />
      <SkeletonBlock className="mb-2 h-9 w-24" />
      <SkeletonBlock className="mb-4 h-4 w-32" />
      {[1, 2, 3, 4].map((i) => (
        <SkeletonBlock key={i} className="mb-2 h-4 w-full" />
      ))}
      <SkeletonBlock className="mt-6 h-10 w-full rounded-xl" />
    </div>
  );
}

// ─── Billing Page ─────────────────────────────────────────────────────────────

function BillingPage() {
  const [subscription, setSubscription] = useState<BillingSubscription | null>(null);
  const [subscriptionError, setSubscriptionError] = useState<string | null>(null);
  const [subLoading, setSubLoading] = useState(true);

  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [plansLoading, setPlansLoading] = useState(true);

  const [payments, setPayments] = useState<PaymentHistoryItem[] | null>(null);
  const [paymentsLoading, setPaymentsLoading] = useState(true);

  const [portalLoading, setPortalLoading] = useState(false);
  const [cancelLoading, setCancelLoading] = useState(false);
  const [reactivateLoading, setReactivateLoading] = useState(false);
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const [cancelError, setCancelError] = useState<string | null>(null);
  const [actionMessage, setActionMessage] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    setSubLoading(true);
    setPlansLoading(true);
    setPaymentsLoading(true);

    const [subRes, plansRes, paymentsRes] = await Promise.all([
      fetchBillingSubscription(),
      fetchSubscriptionPlans(),
      fetchBillingPayments(),
    ]);

    if (subRes.error && subRes.source === "fallback") {
      setSubscriptionError(subRes.error);
    }
    setSubscription(subRes.data);
    setSubLoading(false);

    if (plansRes.data) {
      setPlans(plansRes.data);
    } else if (plansRes.error) {
      // Fallback plans if DB is empty
      setPlans([
        {
          id: "starter", stripePriceId: "", name: "Starter", slug: "starter",
          description: "2 AI employees, core capabilities", priceCents: 9900,
          currency: "usd", interval: "month", maxAiEmployees: 2,
          features: ["Core capabilities", "Basic CRM integration", "Email support", "Monthly reports"],
          isActive: true, createdAt: "",
        },
        {
          id: "growth", stripePriceId: "", name: "Growth", slug: "growth",
          description: "5 AI employees, advanced integrations", priceCents: 29900,
          currency: "usd", interval: "month", maxAiEmployees: 5,
          features: ["Everything in Starter", "Advanced integrations", "Appointment scheduling", "Marketing content", "Priority support"],
          isActive: true, createdAt: "",
        },
        {
          id: "scale", stripePriceId: "", name: "Scale", slug: "scale",
          description: "Unlimited AI employees, custom workflows", priceCents: 99900,
          currency: "usd", interval: "month", maxAiEmployees: -1,
          features: ["Everything in Growth", "Unlimited employees", "Custom workflows", "Dedicated account manager", "API access", "White-label"],
          isActive: true, createdAt: "",
        },
      ]);
    }
    setPlansLoading(false);

    if (paymentsRes.data) {
      setPayments(paymentsRes.data);
    } else {
      setPayments([]);
    }
    setPaymentsLoading(false);
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handlePortal = async () => {
    setPortalLoading(true);
    const result = await createBillingPortal();
    setPortalLoading(false);
    if (result.success && result.portalUrl) {
      window.open(result.portalUrl, "_blank", "noopener,noreferrer");
    } else {
      setActionMessage(result.error || "Failed to open portal");
    }
  };

  const handleCancel = async (immediate: boolean) => {
    setCancelLoading(true);
    setCancelError(null);
    const result = await cancelBillingSubscription({ data: { immediate } });
    setCancelLoading(false);
    if (result.success) {
      setShowCancelConfirm(false);
      setActionMessage(immediate ? "Subscription canceled." : "Subscription will be canceled at end of period.");
      loadData();
    } else {
      setCancelError(result.error || "Failed to cancel");
    }
  };

  const handleReactivate = async () => {
    setReactivateLoading(true);
    const result = await reactivateBillingSubscription();
    setReactivateLoading(false);
    if (result.success) {
      setActionMessage("Subscription reactivated.");
      loadData();
    } else {
      setActionMessage(result.error || "Failed to reactivate");
    }
  };

  const activePlanSlug = subscription?.plan?.slug || "starter";
  const isTrialing = subscription?.status === "trialing";
  const isActive = subscription?.status === "active";
  const isPastDue = subscription?.status === "past_due";
  const isCanceled = subscription?.status === "canceled";
  const isCanceling = subscription?.cancelAtPeriodEnd && isActive;
  const hasRealSubscription = !!subscription?.stripeStatus;
  const nextBillingDate = subscription?.currentPeriodEnd
    ? formatDate(subscription.currentPeriodEnd)
    : null;
  const trialEndDate = subscription?.trialEnd ? formatDate(subscription.trialEnd) : null;

  return (
    <AppLayout>
      <div className="mx-auto max-w-6xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">Billing</h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Manage your subscription, payment method, and billing history.</p>
        </div>

        {/* Global error banner */}
        {subscriptionError && (
          <div className="mb-6 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700 dark:border-amber-900/50 dark:bg-amber-950/30 dark:text-amber-400">
            Could not connect to backend — showing available plans. Please{" "}
            <button onClick={loadData} className="font-medium underline underline-offset-2">
              retry
            </button>
            .
          </div>
        )}

        {/* Action message */}
        {actionMessage && (
          <div className="mb-6 flex items-center justify-between rounded-lg border border-indigo-200 bg-indigo-50 px-4 py-3 text-sm text-indigo-700 dark:border-indigo-800/50 dark:bg-indigo-950/30 dark:text-indigo-400">
            <span>{actionMessage}</span>
            <button onClick={() => setActionMessage(null)} className="ml-4 text-indigo-500 hover:text-indigo-600">
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        )}

        {/* ── Current Plan Banner ─────────────────────────────────────────── */}
        {subLoading ? (
          <div className="mb-8 rounded-xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-900">
            <SkeletonBlock className="mb-2 h-6 w-48" />
            <SkeletonBlock className="h-4 w-64" />
          </div>
        ) : hasRealSubscription ? (
          <div className="mb-8 rounded-xl border border-indigo-200 bg-gradient-to-r from-indigo-50 to-white p-6 dark:border-indigo-800/50 dark:from-indigo-950/20 dark:to-gray-900">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Current Plan: {subscription.plan?.name || "Unknown"}
                  </h2>
                  {statusBadge(subscription.status, subscription.cancelAtPeriodEnd)}
                </div>
                <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                  {formatCents(subscription.plan?.priceCents)}/month
                  {subscription.plan?.maxAiEmployees != null && subscription.plan.maxAiEmployees > 0
                    ? ` · ${subscription.plan.maxAiEmployees} AI employees`
                    : " · Unlimited AI employees"}
                  {isTrialing && trialEndDate && ` · Trial ends ${trialEndDate}`}
                  {nextBillingDate && !isTrialing && ` · Next billing: ${nextBillingDate}`}
                  {isCanceling && subscription.cancelAt && ` · Access until ${formatDate(subscription.cancelAt)}`}
                </p>
              </div>
              <div className="flex flex-wrap gap-3">
                {isCanceling && (
                  <button
                    onClick={handleReactivate}
                    disabled={reactivateLoading}
                    className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-all hover:from-indigo-500 hover:to-violet-500 disabled:opacity-50"
                  >
                    {reactivateLoading ? "Reactivating..." : "Reactivate Subscription"}
                  </button>
                )}
                {!isCanceled && (
                  <button
                    onClick={handlePortal}
                    disabled={portalLoading}
                    className="inline-flex items-center gap-2 rounded-xl border border-gray-300 px-5 py-2.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800 disabled:opacity-50"
                  >
                    {portalLoading ? (
                      <>
                        <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                        </svg>
                        Loading...
                      </>
                    ) : (
                      <>
                        Manage in Stripe
                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
                        </svg>
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>
          </div>
        ) : (
          <div className="mb-8 rounded-xl border border-amber-200 bg-amber-50 p-6 dark:border-amber-900/50 dark:bg-amber-950/20">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400">
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
                </svg>
              </div>
              <div>
                <h3 className="text-sm font-semibold text-amber-800 dark:text-amber-300">No active subscription</h3>
                <p className="text-xs text-amber-700 dark:text-amber-400">
                  Choose a plan below to get started with your AI workforce.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* ── Plan Comparison ─────────────────────────────────────────────── */}
        <div className="mb-8">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Available Plans</h2>
            <Link
              to="/app/training"
              className="inline-flex items-center gap-1.5 rounded-lg border border-indigo-200 bg-indigo-50 px-3 py-1.5 text-xs font-medium text-indigo-600 transition-colors hover:bg-indigo-100 dark:border-indigo-800 dark:bg-indigo-950/30 dark:text-indigo-400 dark:hover:bg-indigo-950/50"
            >
              <svg className="h-3.5 w-3.5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M8 5v14l11-7z" />
              </svg>
              Watch Demo
            </Link>
          </div>
          <div className="grid gap-6 lg:grid-cols-3">
            {plansLoading
              ? [1, 2, 3].map((i) => <PlanCardSkeleton key={i} />)
              : plans
                  .filter((p) => p.isActive !== false)
                  .sort((a, b) => a.priceCents - b.priceCents)
                  .map((plan) => {
                    const isCurrent = plan.slug === activePlanSlug;
                    const features = Array.isArray(plan.features) ? plan.features : [];
                    const maxEmployees = plan.maxAiEmployees > 0 ? `${plan.maxAiEmployees} AI employees` : "Unlimited AI employees";

                    return (
                      <div
                        key={plan.id}
                        className={`relative rounded-xl border p-6 transition-all ${
                          isCurrent
                            ? "border-indigo-300 bg-white shadow-md dark:border-indigo-700 dark:bg-gray-900"
                            : "border-gray-200 bg-white hover:border-indigo-200 hover:shadow-md dark:border-gray-800 dark:bg-gray-900 dark:hover:border-indigo-700"
                        }`}
                      >
                        {isCurrent && (
                          <span className="absolute -top-2.5 right-4 rounded-full bg-indigo-600 px-3 py-0.5 text-xs font-medium text-white">
                            {isCanceling ? "Current (Canceling)" : isTrialing ? "Current (Trial)" : "Current"}
                          </span>
                        )}
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{plan.name}</h3>
                        <p className="mt-1 text-3xl font-bold tracking-tight text-gray-900 dark:text-white">
                          {formatCents(plan.priceCents)}
                          <span className="text-sm font-normal text-gray-500">/mo</span>
                        </p>
                        <p className="mt-1 text-sm text-indigo-600 dark:text-indigo-400">{maxEmployees}</p>
                        <ul className="mt-4 space-y-2">
                          {features.map((f: string) => (
                            <li key={f} className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                              <svg className="h-4 w-4 shrink-0 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                              </svg>
                              {f}
                            </li>
                          ))}
                        </ul>
                        {isCurrent ? (
                          isPastDue ? (
                            <button
                              onClick={handlePortal}
                              disabled={portalLoading}
                              className="mt-6 inline-flex w-full items-center justify-center rounded-xl border border-red-300 bg-red-50 px-4 py-2.5 text-sm font-semibold text-red-700 transition-all hover:bg-red-100 dark:border-red-800 dark:bg-red-950/30 dark:text-red-400"
                            >
                              Update Payment
                            </button>
                          ) : (
                            <button
                              disabled
                              className="mt-6 inline-flex w-full items-center justify-center rounded-xl border border-gray-300 bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 transition-all dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300"
                            >
                              Current Plan
                            </button>
                          )
                        ) : (
                          <a
                            href={STRIPE_CHECKOUT_URLS[plan.slug] || STRIPE_CHECKOUT_URLS.starter}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="mt-6 inline-flex w-full items-center justify-center rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-all hover:from-indigo-500 hover:to-violet-500 hover:shadow-md"
                          >
                            {isCanceled ? "Resubscribe" : isCanceling ? "Switch Plan" : plan.priceCents > (subscription?.plan?.priceCents || 0) ? "Upgrade" : "Switch"}
                          </a>
                        )}
                      </div>
                    );
                  })}
          </div>
        </div>

        {/* ── Payment Method ──────────────────────────────────────────────── */}
        <div className="mb-8 rounded-xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900">
          <div className="border-b border-gray-200 px-6 py-4 dark:border-gray-800">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Payment Method</h2>
          </div>
          {subLoading ? (
            <div className="p-6">
              <div className="flex items-center gap-4">
                <SkeletonBlock className="h-10 w-14 rounded-lg" />
                <div>
                  <SkeletonBlock className="mb-1 h-4 w-32" />
                  <SkeletonBlock className="h-3 w-24" />
                </div>
              </div>
            </div>
          ) : subscription?.paymentMethod ? (
            <div className="flex flex-col gap-4 p-6 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-4">
                {cardBrandIcon(subscription.paymentMethod.brand)}
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    {subscription.paymentMethod.brand.charAt(0).toUpperCase() + subscription.paymentMethod.brand.slice(1)} ending in {subscription.paymentMethod.last4}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Expires {subscription.paymentMethod.expMonth}/{subscription.paymentMethod.expYear}
                  </p>
                </div>
              </div>
              <button
                onClick={handlePortal}
                disabled={portalLoading}
                className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800 disabled:opacity-50"
              >
                {portalLoading ? "Loading..." : "Update"}
              </button>
            </div>
          ) : hasRealSubscription ? (
            <div className="flex flex-col gap-4 p-6 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-sm text-gray-500 dark:text-gray-400">No payment method on file.</p>
              <button
                onClick={handlePortal}
                disabled={portalLoading}
                className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800 disabled:opacity-50"
              >
                Add Payment Method
              </button>
            </div>
          ) : (
            <div className="p-6">
              <p className="text-sm text-gray-500 dark:text-gray-400">Subscribe to a plan to add a payment method.</p>
            </div>
          )}
        </div>

        {/* ── Payment & Invoice History ───────────────────────────────────── */}
        <div className="mb-8 rounded-xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900">
          <div className="border-b border-gray-200 px-6 py-4 dark:border-gray-800">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Payment History</h2>
          </div>
          {paymentsLoading ? (
            <div className="divide-y divide-gray-100 dark:divide-gray-800">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-center justify-between px-6 py-4">
                  <div>
                    <SkeletonBlock className="mb-1 h-4 w-40" />
                    <SkeletonBlock className="h-3 w-24" />
                  </div>
                  <div className="text-right">
                    <SkeletonBlock className="mb-1 ml-auto h-4 w-16" />
                    <SkeletonBlock className="ml-auto h-3 w-20" />
                  </div>
                </div>
              ))}
            </div>
          ) : payments && payments.length > 0 ? (
            <>
              {/* Desktop table */}
              <div className="hidden sm:block">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-100 text-left text-xs font-medium uppercase text-gray-500 dark:border-gray-800 dark:text-gray-400">
                      <th className="px-6 py-3">Invoice</th>
                      <th className="px-6 py-3">Date</th>
                      <th className="px-6 py-3">Period</th>
                      <th className="px-6 py-3">Amount</th>
                      <th className="px-6 py-3">Status</th>
                      <th className="px-6 py-3"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                    {payments.map((inv) => (
                      <tr key={inv.id} className="text-sm hover:bg-gray-50 dark:hover:bg-gray-800/50">
                        <td className="px-6 py-3 font-mono text-xs text-gray-500 dark:text-gray-400">
                          {inv.number || inv.id.slice(-8)}
                        </td>
                        <td className="px-6 py-3 text-gray-700 dark:text-gray-300">
                          {formatDate(inv.created)}
                        </td>
                        <td className="px-6 py-3 text-gray-500 dark:text-gray-400 text-xs">
                          {inv.periodStart ? formatDate(inv.periodStart) : "—"} – {inv.periodEnd ? formatDate(inv.periodEnd) : "—"}
                        </td>
                        <td className="px-6 py-3 font-medium text-gray-900 dark:text-white">
                          {formatCents(inv.amountPaid)}
                        </td>
                        <td className="px-6 py-3">
                          <span
                            className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                              inv.paid
                                ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                                : "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400"
                            }`}
                          >
                            {inv.paid ? "Paid" : inv.status}
                          </span>
                        </td>
                        <td className="px-6 py-3 text-right">
                          {inv.hostedInvoiceUrl && (
                            <a
                              href={inv.hostedInvoiceUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-xs font-medium text-indigo-600 hover:text-indigo-500 dark:text-indigo-400"
                            >
                              View
                            </a>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {/* Mobile cards */}
              <div className="divide-y divide-gray-100 sm:hidden dark:divide-gray-800">
                {payments.map((inv) => (
                  <div key={inv.id} className="px-6 py-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-900 dark:text-white">{formatCents(inv.amountPaid)}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">{formatDate(inv.created)}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span
                          className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                            inv.paid
                              ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                              : "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400"
                          }`}
                        >
                          {inv.paid ? "Paid" : inv.status}
                        </span>
                        {inv.hostedInvoiceUrl && (
                          <a
                            href={inv.hostedInvoiceUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs font-medium text-indigo-600 hover:text-indigo-500 dark:text-indigo-400"
                          >
                            View Invoice →
                          </a>
                        )}
                      </div>
                    </div>
                    <p className="mt-1 text-xs text-gray-400 dark:text-gray-500">
                      {inv.number || inv.id.slice(-8)}
                      {inv.cardBrand && ` · ${inv.cardBrand} ····${inv.cardLast4}`}
                    </p>
                  </div>
                ))}
              </div>
            </>
          ) : hasRealSubscription ? (
            <div className="p-12 text-center">
              <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
              </svg>
              <h3 className="mt-4 text-sm font-semibold text-gray-900 dark:text-white">No invoices yet</h3>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Your payment history will appear here.</p>
            </div>
          ) : (
            <div className="p-12 text-center">
              <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
              </svg>
              <h3 className="mt-4 text-sm font-semibold text-gray-900 dark:text-white">No billing history</h3>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Subscribe to a plan to see your payment history here.</p>
            </div>
          )}
        </div>

        {/* ── Cancel Subscription ─────────────────────────────────────────── */}
        {hasRealSubscription && !isCanceled && (
          <div className="rounded-xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900">
            <div className="border-b border-gray-200 px-6 py-4 dark:border-gray-800">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Cancel Subscription</h2>
            </div>
            <div className="p-6">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {isCanceling
                  ? "Your subscription is set to cancel at the end of the current billing period. You can reactivate it anytime before then."
                  : "You can cancel your subscription at any time. You will retain access until the end of your current billing period."}
              </p>
              {cancelError && (
                <p className="mt-2 text-sm text-red-600 dark:text-red-400">{cancelError}</p>
              )}
              <div className="mt-4 flex flex-wrap gap-3">
                {isCanceling ? (
                  <button
                    onClick={handleReactivate}
                    disabled={reactivateLoading}
                    className="rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-all hover:from-indigo-500 hover:to-violet-500 disabled:opacity-50"
                  >
                    {reactivateLoading ? "Reactivating..." : "Reactivate Subscription"}
                  </button>
                ) : (
                  <>
                    <button
                      onClick={() => setShowCancelConfirm(true)}
                      className="rounded-xl border border-red-300 px-5 py-2.5 text-sm font-medium text-red-700 transition-colors hover:bg-red-50 dark:border-red-800 dark:text-red-400 dark:hover:bg-red-950/30"
                    >
                      Cancel Subscription
                    </button>
                    <p className="self-center text-xs text-gray-500 dark:text-gray-400">
                      Or{" "}
                      <button
                        onClick={handlePortal}
                        disabled={portalLoading}
                        className="font-medium text-indigo-600 hover:text-indigo-500 dark:text-indigo-400 disabled:opacity-50"
                      >
                        manage in Stripe
                      </button>{" "}
                      for more options.
                    </p>
                  </>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ── Cancel Confirmation Modal ───────────────────────────────────── */}
        {showCancelConfirm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl dark:bg-gray-900">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Cancel Subscription?</h3>
              <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                Your access will continue until{" "}
                <span className="font-medium text-gray-900 dark:text-white">
                  {nextBillingDate || "the end of your billing period"}
                </span>
                . After that, your AI employees will be paused and your data will be retained for 30 days.
              </p>
              <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-end">
                <button
                  onClick={() => setShowCancelConfirm(false)}
                  disabled={cancelLoading}
                  className="rounded-xl border border-gray-300 px-4 py-2.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800 disabled:opacity-50"
                >
                  Keep Subscription
                </button>
                <button
                  onClick={() => handleCancel(false)}
                  disabled={cancelLoading}
                  className="rounded-xl bg-red-600 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-red-500 disabled:opacity-50"
                >
                  {cancelLoading ? "Canceling..." : "Cancel at End of Period"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
