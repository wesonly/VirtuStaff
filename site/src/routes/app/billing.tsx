import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/app/billing")({
  component: BillingPage,
});

const plans = [
  { name: "Starter", price: "$99", employees: "2 AI employees", features: ["Core capabilities", "Basic CRM integration", "Email support", "Monthly reports"], href: "https://buy.stripe.com/eVq28q8wn36LeDc83Zes002", current: true },
  { name: "Growth", price: "$299", employees: "5 AI employees", features: ["Everything in Starter", "Advanced integrations", "Appointment scheduling", "Marketing content", "Priority support"], href: "https://buy.stripe.com/14A5kCdQHazdcv4983es001", current: false },
  { name: "Scale", price: "$999", employees: "Unlimited", features: ["Everything in Growth", "Unlimited employees", "Custom workflows", "Dedicated account manager", "API access", "White-label"], href: "https://buy.stripe.com/3cIfZgdQH8r5fHg83Zes000", current: false },
];

function BillingPage() {
  return (
    <div className="mx-auto max-w-6xl">
      <div className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">Billing</h1>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Manage your subscription and billing details.</p>
      </div>

      {/* Current plan */}
      <div className="mb-8 rounded-xl border border-indigo-200 bg-gradient-to-r from-indigo-50 to-white p-6 dark:border-indigo-800/50 dark:from-indigo-950/20 dark:to-gray-900">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Current Plan: Starter</h2>
              <span className="rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-700 dark:bg-green-900/30 dark:text-green-400">Active</span>
            </div>
            <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">$99/month · 2 AI employees · Next billing: Aug 15, 2026</p>
          </div>
          <a
            href="https://customer.stripe.com/"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-xl border border-gray-300 px-5 py-2.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
          >
            Manage in Stripe
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
            </svg>
          </a>
        </div>
      </div>

      {/* Plan comparison */}
      <div className="mb-8">
        <h2 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">Available Plans</h2>
        <div className="grid gap-6 lg:grid-cols-3">
          {plans.map((plan) => (
            <div key={plan.name} className={`relative rounded-xl border p-6 transition-all ${
              plan.current
                ? "border-indigo-300 bg-white shadow-md dark:border-indigo-700 dark:bg-gray-900"
                : "border-gray-200 bg-white hover:border-indigo-200 hover:shadow-md dark:border-gray-800 dark:bg-gray-900 dark:hover:border-indigo-700"
            }`}>
              {plan.current && (
                <span className="absolute -top-2.5 right-4 rounded-full bg-indigo-600 px-3 py-0.5 text-xs font-medium text-white">Current</span>
              )}
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{plan.name}</h3>
              <p className="mt-1 text-3xl font-bold tracking-tight text-gray-900 dark:text-white">
                {plan.price}<span className="text-sm font-normal text-gray-500">/mo</span>
              </p>
              <p className="mt-1 text-sm text-indigo-600 dark:text-indigo-400">{plan.employees}</p>
              <ul className="mt-4 space-y-2">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                    <svg className="h-4 w-4 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                    </svg>
                    {f}
                  </li>
                ))}
              </ul>
              <a
                href={plan.href}
                target="_blank"
                rel="noopener noreferrer"
                className={`mt-6 inline-flex w-full items-center justify-center rounded-xl px-4 py-2.5 text-sm font-semibold transition-all ${
                  plan.current
                    ? "border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300"
                    : "bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-sm hover:from-indigo-500 hover:to-violet-500 hover:shadow-md"
                }`}
              >
                {plan.current ? "Current Plan" : "Upgrade"}
              </a>
            </div>
          ))}
        </div>
      </div>

      {/* Payment method */}
      <div className="rounded-xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900">
        <div className="border-b border-gray-200 px-6 py-4 dark:border-gray-800">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Payment Method</h2>
        </div>
        <div className="flex items-center justify-between p-6">
          <div className="flex items-center gap-4">
            <div className="flex h-10 w-14 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 text-xs font-bold text-white">VISA</div>
            <div>
              <p className="text-sm font-medium text-gray-900 dark:text-white">Visa ending in 4242</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">Expires 12/28</p>
            </div>
          </div>
          <button className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800">
            Update
          </button>
        </div>
      </div>
    </div>
  );
}