import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { VideoPlaceholder } from "~/components/video-placeholder";
import { AiAssistant } from "~/components/ai-assistant";

export const Route = createFileRoute("/app/training")({
  component: TrainingPage,
});

const features = [
  {
    id: "receptionist",
    title: "AI Receptionist",
    description: "Handle inbound calls, route to departments, and take messages automatically.",
    duration: "4:32",
    estimated: "~15 min",
    steps: [
      "Choose a voice from our voice library",
      "Set business hours and after-hours behavior",
      "Create a greeting script for callers",
      "Configure call routing rules",
      "Test with a sample inbound call",
    ],
    faqs: [
      { q: "Can I customize the greeting?", a: "Yes! You can write a custom script or use one of our templates for your industry." },
      { q: "What happens after hours?", a: "You can choose to send callers to voicemail, play a custom message, or forward to a personal number." },
      { q: "Does it support multiple languages?", a: "Yes, our AI supports 20+ languages including Spanish, French, German, and Mandarin." },
    ],
    color: "from-blue-600 to-indigo-600",
    videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
  },
  {
    id: "outbound",
    title: "Outbound AI Caller",
    description: "Make outbound calls for lead qualification, follow-ups, and surveys.",
    duration: "5:18",
    estimated: "~20 min",
    steps: [
      "Upload or import a contact list",
      "Define the call objective (qualify, follow-up, survey)",
      "Write or select a call script",
      "Set call scheduling and limits",
      "Run a test campaign with 5 contacts",
    ],
    faqs: [
      { q: "Can I set calling hours?", a: "Yes, you can specify allowed calling windows and timezone-aware scheduling." },
      { q: "What about DNC lists?", a: "VirtuStaff automatically checks against national DNC registries before each call." },
    ],
    color: "from-violet-600 to-purple-600",
    videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
  },
  {
    id: "booking",
    title: "Appointment Booking",
    description: "Let AI schedule appointments, send reminders, and manage your calendar.",
    duration: "3:45",
    estimated: "~10 min",
    steps: [
      "Connect your calendar (Google, Outlook, or iCal)",
      "Set your availability and buffer times",
      "Customize the booking confirmation message",
      "Enable automated reminders via SMS/email",
    ],
    faqs: [
      { q: "Can it handle rescheduling?", a: "Yes, customers can reschedule via the booking link or by replying to reminder messages." },
      { q: "What calendars are supported?", a: "Google Calendar, Microsoft Outlook, and Apple iCal — more coming soon." },
    ],
    color: "from-emerald-600 to-teal-600",
    videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
  },
  {
    id: "crm",
    title: "CRM Integration",
    description: "Sync contacts, deals, and activity with your existing CRM platform.",
    duration: "6:10",
    estimated: "~25 min",
    steps: [
      "Choose your CRM from the integrations list",
      "Authenticate with your CRM credentials",
      "Map data fields between VirtuStaff and CRM",
      "Set sync direction and frequency",
      "Run a test sync to verify",
    ],
    faqs: [
      { q: "Which CRMs are supported?", a: "HubSpot, Salesforce, Pipedrive, Zoho, and Close — with more added monthly." },
      { q: "Is the sync real-time?", a: "Yes, changes sync in both directions within seconds for supported CRMs." },
    ],
    color: "from-orange-600 to-red-600",
    videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
  },
  {
    id: "email",
    title: "Email Automation",
    description: "Auto-generate and send personalized emails based on triggers and templates.",
    duration: "4:55",
    estimated: "~15 min",
    steps: [
      "Connect your email provider (Gmail, Outlook, SMTP)",
      "Create email templates with dynamic fields",
      "Set up automation triggers (new lead, follow-up, etc.)",
      "Configure sending schedule and limits",
      "Test email delivery and formatting",
    ],
    faqs: [
      { q: "Can I use my own domain?", a: "Yes, you can authenticate with SPF/DKIM to send from your own domain." },
      { q: "Are there sending limits?", a: "Limits depend on your plan and email provider — we help you stay compliant." },
    ],
    color: "from-cyan-600 to-blue-600",
    videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
  },
  {
    id: "sms",
    title: "SMS Automation",
    description: "Send and receive SMS messages for reminders, confirmations, and lead engagement.",
    duration: "3:20",
    estimated: "~10 min",
    steps: [
      "Choose or port a phone number",
      "Create SMS templates with merge tags",
      "Set up automation rules and triggers",
      "Configure opt-out handling",
      "Send a test message",
    ],
    faqs: [
      { q: "Can I use my existing number?", a: "Number porting is available on Growth and Scale plans. Contact support to get started." },
      { q: "What about compliance?", a: "We handle TCPA/10DLC compliance automatically — opt-out language is always included." },
    ],
    color: "from-pink-600 to-rose-600",
    videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
  },
  {
    id: "leads",
    title: "Lead Management",
    description: "Qualify, score, and nurture leads automatically with AI-powered workflows.",
    duration: "5:40",
    estimated: "~20 min",
    steps: [
      "Define your lead qualification criteria",
      "Create lead scoring rules",
      "Set up automated nurture sequences",
      "Configure lead routing to your CRM/sales team",
      "Review lead pipeline dashboard",
    ],
    faqs: [
      { q: "How does lead scoring work?", a: "You define point values for actions like website visits, email opens, and call responses." },
      { q: "Can leads be assigned automatically?", a: "Yes, leads can be round-robin assigned or routed based on territory/skills." },
    ],
    color: "from-amber-600 to-yellow-600",
    videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
  },
  {
    id: "knowledge",
    title: "Knowledge Base",
    description: "Build a knowledge base so your AI employees can answer customer questions accurately.",
    duration: "4:10",
    estimated: "~30 min",
    steps: [
      "Upload documents, FAQs, and product info",
      "Organize content into categories",
      "Train the AI on your knowledge base",
      "Test with sample customer questions",
      "Monitor answer quality and refine",
    ],
    faqs: [
      { q: "What formats are supported?", a: "PDF, Word, text files, web pages, and direct text input. More formats coming soon." },
      { q: "How often should I update?", a: "We recommend reviewing weekly — the AI learns from new content automatically." },
    ],
    color: "from-slate-600 to-gray-600",
    videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
  },
  {
    id: "analytics",
    title: "Analytics Dashboard",
    description: "Track AI employee performance, call metrics, lead conversion, and ROI.",
    duration: "3:55",
    estimated: "~10 min",
    steps: [
      "Explore the pre-built dashboards",
      "Set up custom reports and date ranges",
      "Configure alert thresholds for key metrics",
      "Schedule automated report delivery",
      "Share dashboard with your team",
    ],
    faqs: [
      { q: "Can I export data?", a: "Yes, all reports can be exported as CSV, PDF, or sent via email on a schedule." },
      { q: "Is there an API for custom dashboards?", a: "Yes, our Analytics API is available on Scale plans for building custom BI integrations." },
    ],
    color: "from-indigo-600 to-blue-600",
    videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
  },
];

function TrainingPage() {
  const [expanded, setExpanded] = useState<string | null>(null);
  const [expandedFaq, setExpandedFaq] = useState<string | null>(null);

  return (
    <div className="mx-auto max-w-7xl">
      <div className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
          Training Center
        </h1>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Learn how to set up and use each VirtuStaff feature.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {features.map((feature) => (
          <div
            key={feature.id}
            className="group rounded-2xl border border-gray-200 bg-white transition-all hover:shadow-lg dark:border-gray-800 dark:bg-gray-900"
          >
            {/* Video placeholder */}
            <div className="p-4 pb-0">
              <VideoPlaceholder
                title={feature.title}
                duration={feature.duration}
                thumbnailColor={feature.color}
                videoUrl={feature.videoUrl}
              />
            </div>

            {/* Card body */}
            <div className="p-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                {feature.title}
              </h3>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                {feature.description}
              </p>

              <div className="mt-3 flex items-center gap-3 text-xs text-gray-500 dark:text-gray-400">
                <span className="flex items-center gap-1">
                  <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  {feature.estimated}
                </span>
              </div>

              {/* Expand/collapse */}
              {expanded === feature.id ? (
                <div className="mt-4 space-y-4 border-t border-gray-100 pt-4 dark:border-gray-800">
                  {/* Steps */}
                  <div>
                    <h4 className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                      Step-by-Step
                    </h4>
                    <ol className="mt-2 space-y-1.5">
                      {feature.steps.map((step, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm text-gray-700 dark:text-gray-300">
                          <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-indigo-100 text-[10px] font-bold text-indigo-600 dark:bg-indigo-900/50 dark:text-indigo-400">
                            {i + 1}
                          </span>
                          {step}
                        </li>
                      ))}
                    </ol>
                  </div>

                  {/* FAQ */}
                  <div>
                    <h4 className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                      FAQ
                    </h4>
                    <div className="mt-2 space-y-1">
                      {feature.faqs.map((faq, i) => (
                        <div key={i}>
                          <button
                            onClick={() =>
                              setExpandedFaq(
                                expandedFaq === `${feature.id}-${i}`
                                  ? null
                                  : `${feature.id}-${i}`
                              )
                            }
                            className="flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-800"
                          >
                            {faq.q}
                            <svg
                              className={`h-4 w-4 shrink-0 text-gray-400 transition-transform ${
                                expandedFaq === `${feature.id}-${i}` ? "rotate-180" : ""
                              }`}
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                              strokeWidth={2}
                            >
                              <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                            </svg>
                          </button>
                          {expandedFaq === `${feature.id}-${i}` && (
                            <p className="px-3 pb-2 text-sm text-gray-500 dark:text-gray-400">
                              {faq.a}
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Need help */}
                  <button className="inline-flex w-full items-center justify-center gap-2 rounded-lg border border-indigo-200 bg-indigo-50 px-4 py-2.5 text-sm font-medium text-indigo-700 transition-all hover:bg-indigo-100 dark:border-indigo-800 dark:bg-indigo-950/30 dark:text-indigo-400 dark:hover:bg-indigo-950/50">
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9 5.25h.008v.008H12v-.008z" />
                    </svg>
                    Need Help?
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => {
                    setExpanded(feature.id);
                    setExpandedFaq(null);
                  }}
                  className="mt-4 w-full rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-600 transition-all hover:border-indigo-300 hover:text-indigo-600 dark:border-gray-700 dark:text-gray-400 dark:hover:border-indigo-700 dark:hover:text-indigo-400"
                >
                  View Instructions
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      <AiAssistant />
    </div>
  );
}

