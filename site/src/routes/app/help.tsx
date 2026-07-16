import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { AiAssistant } from "~/components/ai-assistant";

export const Route = createFileRoute("/app/help")({
  component: HelpCenterPage,
});

const categories = [
  {
    title: "Documentation",
    description: "Comprehensive guides and reference docs",
    icon: (
      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
      </svg>
    ),
    color: "from-blue-600 to-indigo-600",
  },
  {
    title: "Video Tutorials",
    description: "Watch step-by-step video walkthroughs",
    icon: (
      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M5.25 5.653c0-.856.917-1.398 1.667-.986l11.54 6.348a1.125 1.125 0 010 1.971l-11.54 6.347a1.125 1.125 0 01-1.667-.985V5.653z" />
      </svg>
    ),
    color: "from-violet-600 to-purple-600",
  },
  {
    title: "FAQs",
    description: "Answers to the most common questions",
    icon: (
      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9 5.25h.008v.008H12v-.008z" />
      </svg>
    ),
    color: "from-emerald-600 to-teal-600",
  },
  {
    title: "Troubleshooting",
    description: "Fix common issues and errors",
    icon: (
      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M11.42 15.17l-2.71 2.71a2.125 2.125 0 11-3-3l2.71-2.71m9.71 5.46l-2.71-2.71m-7.17-7.17l-2.71 2.71a2.125 2.125 0 01-3-3l2.71-2.71m9.71 5.46l.29-.29a2.125 2.125 0 00-3-3l-.29.29m4.5 4.5a10.5 10.5 0 01-4.5 4.5m-7.5-7.5a10.5 10.5 0 014.5-4.5" />
      </svg>
    ),
    color: "from-orange-600 to-red-600",
  },
  {
    title: "Best Practices",
    description: "Tips to get the most out of VirtuStaff",
    icon: (
      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z" />
      </svg>
    ),
    color: "from-amber-600 to-yellow-600",
  },
];

const faqs = [
  {
    q: "How do I connect my phone number?",
    a: "Go to Settings → Phone Numbers and click 'Add Number'. You can choose a new number or port your existing one. Setup typically takes under 2 minutes.",
  },
  {
    q: "Which CRMs does VirtuStaff integrate with?",
    a: "We currently support HubSpot, Salesforce, Pipedrive, Zoho, and Close. More integrations are added monthly. You can connect your CRM from Settings → Integrations.",
  },
  {
    q: "Can I customize my AI employee's voice and personality?",
    a: "Yes! You can choose from 50+ natural-sounding voices and customize the tone, pace, and personality of each AI employee. Go to Employees → Configure → Voice Settings.",
  },
  {
    q: "How do I import my contacts?",
    a: "You can import contacts by uploading a CSV file, connecting your CRM, or using our API. Head to Contacts → Import to get started. We automatically handle deduplication.",
  },
  {
    q: "What happens if my AI employee makes a mistake on a call?",
    a: "All calls are logged and transcribed. You can review calls from the Dashboard, flag issues, and update training data. The AI learns from corrections over time.",
  },
  {
    q: "How secure is my data?",
    a: "VirtuStaff is SOC 2 Type II compliant. All data is encrypted at rest and in transit. We never share or sell your data. Contact compliance@virtustaff.ai for our security whitepaper.",
  },
  {
    q: "Can I have multiple AI employees?",
    a: "Yes! The number of AI employees depends on your plan — 2 on Starter, 5 on Growth, and unlimited on Scale. Each can be configured independently.",
  },
  {
    q: "How do I cancel or change my plan?",
    a: "You can manage your subscription from Billing → Manage in Stripe. Upgrades take effect immediately. Downgrades apply at the end of your billing cycle.",
  },
];

function HelpCenterPage() {
  const [search, setSearch] = useState("");
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);

  const filteredFaqs = search
    ? faqs.filter(
        (f) =>
          f.q.toLowerCase().includes(search.toLowerCase()) ||
          f.a.toLowerCase().includes(search.toLowerCase())
      )
    : faqs;

  return (
    <div className="mx-auto max-w-5xl">
      {/* Header */}
      <div className="mb-8 text-center">
        <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
          Help Center
        </h1>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Find answers, watch tutorials, and get support.
        </p>
      </div>

      {/* Search */}
      <div className="mb-10">
        <div className="relative mx-auto max-w-xl">
          <svg
            className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
          </svg>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search for help articles, tutorials, FAQs..."
            className="w-full rounded-xl border border-gray-300 bg-white py-3.5 pl-12 pr-4 text-sm text-gray-900 placeholder-gray-400 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 dark:border-gray-700 dark:bg-gray-900 dark:text-white dark:placeholder-gray-500 dark:focus:border-indigo-400"
          />
        </div>
      </div>

      {/* Category cards */}
      <div className="mb-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {categories.map((cat) => (
          <button
            key={cat.title}
            onClick={() => setSearch(cat.title)}
            className="group flex items-start gap-4 rounded-xl border border-gray-200 bg-white p-5 text-left transition-all hover:border-indigo-200 hover:shadow-md dark:border-gray-800 dark:bg-gray-900 dark:hover:border-indigo-700"
          >
            <div
              className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br ${cat.color} text-white shadow-sm`}
            >
              {cat.icon}
            </div>
            <div>
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                {cat.title}
              </h3>
              <p className="mt-0.5 text-xs text-gray-500 dark:text-gray-400">
                {cat.description}
              </p>
            </div>
          </button>
        ))}
      </div>

      {/* FAQs */}
      <div>
        <h2 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
          Frequently Asked Questions
        </h2>
        <div className="rounded-xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900 divide-y divide-gray-100 dark:divide-gray-800">
          {filteredFaqs.length === 0 ? (
            <div className="p-12 text-center">
              <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
              </svg>
              <h3 className="mt-4 text-sm font-semibold text-gray-900 dark:text-white">No results found</h3>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Try a different search term or browse the categories above.</p>
            </div>
          ) : (
            filteredFaqs.map((faq, i) => (
              <div key={i}>
                <button
                  onClick={() => setExpandedFaq(expandedFaq === i ? null : i)}
                  className="flex w-full items-center justify-between px-6 py-4 text-left text-sm font-medium text-gray-900 transition-colors hover:bg-gray-50 dark:text-white dark:hover:bg-gray-800/50"
                >
                  <span>{faq.q}</span>
                  <svg
                    className={`h-4 w-4 shrink-0 text-gray-400 transition-transform ${
                      expandedFaq === i ? "rotate-180" : ""
                    }`}
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                  </svg>
                </button>
                {expandedFaq === i && (
                  <div className="px-6 pb-4">
                    <p className="text-sm text-gray-600 leading-relaxed dark:text-gray-400">
                      {faq.a}
                    </p>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>

      <AiAssistant />
    </div>
  );
}
