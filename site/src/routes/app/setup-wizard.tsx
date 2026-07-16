import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";

export const Route = createFileRoute("/app/setup-wizard")({
  component: SetupWizardPage,
});

const wizardSteps = [
  {
    id: 1,
    title: "Choose AI Employee",
    subtitle: "Select the type of AI employee you need first.",
    description:
      "Browse our catalog of AI employees — Receptionist, Sales Agent, Support Agent, and more. Each comes pre-trained for specific tasks.",
    icon: (
      <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
      </svg>
    ),
  },
  {
    id: 2,
    title: "Connect Phone",
    subtitle: "Link a phone number for inbound and outbound calls.",
    description:
      "Choose a new number or port your existing one. We support local, toll-free, and international numbers. Setup takes under 2 minutes.",
    icon: (
      <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z" />
      </svg>
    ),
  },
  {
    id: 3,
    title: "Connect CRM",
    subtitle: "Sync your contacts and deals with your CRM.",
    description:
      "We integrate with HubSpot, Salesforce, Pipedrive, Zoho, and more. Your data stays in sync in real-time — no manual imports needed.",
    icon: (
      <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 6.375c0 2.278-3.694 4.125-8.25 4.125S3.75 8.653 3.75 6.375m16.5 0c0-2.278-3.694-4.125-8.25-4.125S3.75 4.097 3.75 6.375m16.5 0v11.25c0 2.278-3.694 4.125-8.25 4.125s-8.25-1.847-8.25-4.125V6.375m16.5 0v3.75m-16.5-3.75v3.75m16.5 0v3.75C20.25 16.153 16.556 18 12 18s-8.25-1.847-8.25-4.125v-3.75m16.5 0c0 2.278-3.694 4.125-8.25 4.125s-8.25-1.847-8.25-4.125" />
      </svg>
    ),
  },
  {
    id: 4,
    title: "Import Contacts",
    subtitle: "Bring your contact list into VirtuStaff.",
    description:
      "Upload a CSV, connect your CRM, or use our API. We automatically deduplicate, validate, and enrich contact data.",
    icon: (
      <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m6.75 12l-3-3m0 0l-3 3m3-3v6m-1.5-15H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
      </svg>
    ),
  },
  {
    id: 5,
    title: "Train AI",
    subtitle: "Teach your AI about your business and products.",
    description:
      "Upload documents, write scripts, and set up your knowledge base. The more you train, the smarter your AI becomes.",
    icon: (
      <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M4.26 10.147a60.436 60.436 0 00-.491 6.347A48.627 48.627 0 0112 20.904a48.627 48.627 0 018.232-4.41 60.46 60.46 0 00-.491-6.347m-15.482 0a50.57 50.57 0 00-2.658-.813A59.905 59.905 0 0112 3.493a59.902 59.902 0 0110.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.697 50.697 0 0112 13.489a50.702 50.702 0 017.74-3.342M6.75 15a.75.75 0 100-1.5.75.75 0 000 1.5zm0 0v-3.675A55.378 55.378 0 0112 8.443m-7.007 11.55A5.981 5.981 0 006.75 15.75v-1.5" />
      </svg>
    ),
  },
  {
    id: 6,
    title: "Test AI",
    subtitle: "Run a test conversation with your AI employee.",
    description:
      "Make a test call or send a test message to verify your AI responds correctly. Catch issues before going live.",
    icon: (
      <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.455 2.456L21.75 6l-1.036.259a3.375 3.375 0 00-2.455 2.456zM16.894 20.567L16.5 21.75l-.394-1.183a2.25 2.25 0 00-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 001.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 001.423 1.423l1.183.394-1.183.394a2.25 2.25 0 00-1.423 1.423z" />
      </svg>
    ),
  },
  {
    id: 7,
    title: "Go Live",
    subtitle: "Launch your AI employee and start seeing results.",
    description:
      "Your AI is ready! Monitor performance from your dashboard, make adjustments, and watch your productivity grow.",
    icon: (
      <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M15.59 14.37a6 6 0 01-5.84 7.38v-4.8m5.84-2.58a14.98 14.98 0 006.16-12.12A14.98 14.98 0 009.631 8.41m5.96 5.96a14.926 14.926 0 01-5.841 2.58m-.119-8.54a6 6 0 00-7.381 5.84h4.8m2.581-5.84a14.927 14.927 0 00-2.58 5.84m2.699 2.7c-.103.021-.207.041-.311.06a15.09 15.09 0 01-2.448-2.448 14.9 14.9 0 01.06-.312m-2.24 2.39a4.493 4.493 0 00-1.757 4.306 4.493 4.493 0 004.306-1.758M16.5 9a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z" />
      </svg>
    ),
  },
];

function SetupWizardPage() {
  const [currentStep, setCurrentStep] = useState(0);
  const step = wizardSteps[currentStep];
  const isLast = currentStep === wizardSteps.length - 1;
  const isFirst = currentStep === 0;

  return (
    <div className="mx-auto max-w-2xl">
      {/* Header */}
      <div className="mb-8 text-center">
        <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
          Setup Wizard
        </h1>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Let's get your AI workforce up and running — one step at a time.
        </p>
      </div>

      {/* Progress bar */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          {wizardSteps.map((s, i) => (
            <div key={s.id} className="flex flex-col items-center">
              <button
                onClick={() => i < currentStep && setCurrentStep(i)}
                className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold transition-all ${
                  i < currentStep
                    ? "bg-emerald-500 text-white cursor-pointer hover:bg-emerald-400"
                    : i === currentStep
                    ? "bg-gradient-to-r from-indigo-600 to-violet-600 text-white ring-4 ring-indigo-100 dark:ring-indigo-900/30"
                    : "bg-gray-200 text-gray-400 dark:bg-gray-800 dark:text-gray-600"
                }`}
              >
                {i < currentStep ? (
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                  </svg>
                ) : (
                  i + 1
                )}
              </button>
              <span className="mt-1 hidden text-[10px] font-medium text-gray-400 sm:block">
                {s.title.length > 10 ? s.title.slice(0, 10) + "…" : s.title}
              </span>
            </div>
          ))}
        </div>
        {/* Connector line */}
        <div className="relative mt-4">
          <div className="absolute top-1/2 h-0.5 w-full -translate-y-1/2 bg-gray-200 dark:bg-gray-800" />
          <div
            className="absolute top-1/2 h-0.5 -translate-y-1/2 bg-gradient-to-r from-indigo-500 to-violet-500 transition-all duration-500"
            style={{ width: `${(currentStep / (wizardSteps.length - 1)) * 100}%` }}
          />
        </div>
      </div>

      {/* Step card */}
      <div className="rounded-2xl border border-gray-200 bg-white p-8 shadow-sm transition-all duration-500 dark:border-gray-800 dark:bg-gray-900">
        {/* Icon */}
        <div className="mb-6 inline-flex rounded-xl bg-gradient-to-br from-indigo-50 to-violet-50 p-4 text-indigo-600 dark:from-indigo-950/50 dark:to-violet-950/50 dark:text-indigo-400">
          {step.icon}
        </div>

        {/* Content */}
        <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
          <span className="rounded-full bg-indigo-100 px-2.5 py-1 text-xs font-medium text-indigo-700 dark:bg-indigo-950/50 dark:text-indigo-400">
            Step {currentStep + 1} of {wizardSteps.length}
          </span>
          <h2 className="mt-3 text-2xl font-bold text-gray-900 dark:text-white">
            {step.title}
          </h2>
          <p className="mt-1 text-sm font-medium text-indigo-600 dark:text-indigo-400">
            {step.subtitle}
          </p>
          <p className="mt-4 text-gray-600 leading-relaxed dark:text-gray-400">
            {step.description}
          </p>
        </div>

        {/* Placeholder action */}
        <div className="mt-8 rounded-xl border-2 border-dashed border-gray-300 bg-gray-50 p-6 text-center dark:border-gray-700 dark:bg-gray-800/50">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Connect your {step.title.toLowerCase()} in the next step or from{" "}
            <Link to="/app/settings" className="font-medium text-indigo-600 hover:text-indigo-500">
              Settings
            </Link>
            .
          </p>
          <button className="mt-3 inline-flex items-center gap-1.5 rounded-lg border border-indigo-200 bg-white px-4 py-2 text-xs font-medium text-indigo-600 transition-all hover:bg-indigo-50 dark:border-indigo-800 dark:bg-gray-800 dark:text-indigo-400 dark:hover:bg-indigo-950/50">
            <svg className="h-3.5 w-3.5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M8 5v14l11-7z" />
            </svg>
            Watch Demo
          </button>
        </div>
      </div>

      {/* Navigation */}
      <div className="mt-6 flex items-center justify-between">
        <button
          onClick={() => setCurrentStep((s) => s - 1)}
          disabled={isFirst}
          className="inline-flex items-center gap-2 rounded-xl border border-gray-300 px-5 py-2.5 text-sm font-medium text-gray-700 transition-all hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
          </svg>
          Back
        </button>

        {isLast ? (
          <Link
            to="/app"
            className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 px-6 py-2.5 text-sm font-semibold text-white shadow-sm transition-all hover:from-emerald-500 hover:to-teal-500 active:scale-[0.97]"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
            </svg>
            Finish & Go to Dashboard
          </Link>
        ) : (
          <button
            onClick={() => setCurrentStep((s) => s + 1)}
            className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 px-6 py-2.5 text-sm font-semibold text-white shadow-sm transition-all hover:from-indigo-500 hover:to-violet-500 active:scale-[0.97]"
          >
            Next
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
            </svg>
          </button>
        )}
      </div>
    </div>
  );
}
