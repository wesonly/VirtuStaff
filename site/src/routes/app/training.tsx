import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, useEffect, useCallback } from "react";
import { AiAssistant } from "~/components/ai-assistant";

export const Route = createFileRoute("/app/training")({
  component: OnboardingWizard,
});

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

interface OnboardingStep {
  id: string;
  title: string;
  description: string;
  /** Optional — set a YouTube embed URL to show a tutorial video later */
  videoUrl?: string;
  /** Contextual help text shown when user clicks "Need Help?" */
  helpText: string;
  /** Sub‑tasks the user completes within this step */
  tasks: string[];
}

const STEPS: OnboardingStep[] = [
  {
    id: "company",
    title: "Configure your company profile",
    description: "Tell us about your business so your AI employees can work in context.",
    helpText:
      "Your company profile helps the AI understand your industry, working hours, and communication preferences. You can update this anytime in Settings.",
    tasks: [
      "Set your company name and industry",
      "Choose your timezone",
      "Set business hours",
    ],
  },
  {
    id: "ai-employee",
    title: "Choose your first AI employee",
    description: "Pick the AI role that will make the biggest impact first.",
    helpText:
      "Start with one AI employee — you can always add more later. The AI Receptionist is great for handling inbound calls, while the Lead Qualifier helps with sales outreach.",
    tasks: [
      "Browse available AI employee types",
      "Select your first employee",
      "Give them a name and voice",
    ],
  },
  {
    id: "channels",
    title: "Connect communication channels",
    description: "Link your phone number and email so your AI can call and message.",
    helpText:
      "You can use an existing phone number (port it in) or get a new one from VirtuStaff. For email, connect Gmail, Outlook, or a custom SMTP provider.",
    tasks: [
      "Add or port a phone number",
      "Connect your email provider",
      "Verify your sender identity (SPF/DKIM)",
    ],
  },
  {
    id: "crm",
    title: "Integrate CRM or import contacts",
    description: "Sync your existing contacts so your AI knows who to call and email.",
    helpText:
      "VirtuStaff integrates with HubSpot, Salesforce, Pipedrive, Zoho, and Close. You can also upload a CSV if you don't use a CRM.",
    tasks: [
      "Choose your CRM or upload a CSV",
      "Authenticate and map data fields",
      "Run a test sync to verify",
    ],
  },
  {
    id: "workflow",
    title: "Complete your first test workflow",
    description: "Run a test scenario to make sure everything works end-to-end.",
    helpText:
      "Create a simple workflow — like 'call a test lead and send a follow-up email'. This lets you catch any configuration issues before going live.",
    tasks: [
      "Create a test workflow",
      "Run the workflow with sample data",
      "Review the results and logs",
    ],
  },
  {
    id: "launch",
    title: "Launch and go live",
    description: "Activate your AI employee and start serving customers.",
    helpText:
      "Once you're happy with the test results, toggle your AI employee to 'Active' and monitor their first few interactions from the dashboard.",
    tasks: [
      "Review final settings",
      "Toggle AI employee to Active",
      "Monitor the first live interactions",
    ],
  },
];

/* ------------------------------------------------------------------ */
/*  localStorage helpers                                               */
/* ------------------------------------------------------------------ */

const STORAGE_KEY = "virtustaff_onboarding_progress";

function loadProgress(): Record<string, boolean> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function saveProgress(progress: Record<string, boolean>) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
  } catch {
    /* localStorage unavailable — silently degrade */
  }
}

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

function OnboardingWizard() {
  const [progress, setProgress] = useState<Record<string, boolean>>({});
  const [helpOpen, setHelpOpen] = useState<string | null>(null);
  const [animating, setAnimating] = useState(false);

  /* Load persisted progress on mount */
  useEffect(() => {
    setProgress(loadProgress());
  }, []);

  const doneCount = STEPS.filter((s) => progress[s.id]).length;
  const total = STEPS.length;
  const pct = Math.round((doneCount / total) * 100);
  const allDone = doneCount === total;

  /* Toggle a single step */
  const toggleStep = useCallback(
    (id: string) => {
      setProgress((prev) => {
        const next = { ...prev, [id]: !prev[id] };
        saveProgress(next);
        return next;
      });
    },
    [],
  );

  /* Reset all progress */
  const resetProgress = useCallback(() => {
    setAnimating(true);
    setProgress({});
    setHelpOpen(null);
    localStorage.removeItem(STORAGE_KEY);
    setTimeout(() => setAnimating(false), 300);
  }, []);

  return (
    <div className="mx-auto max-w-3xl">
      {/* ── Header ─────────────────────────────────────────────── */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
          Onboarding Wizard
        </h1>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Follow these steps to configure VirtuStaff and launch your first AI employee.
        </p>
      </div>

      {/* ── Progress card ──────────────────────────────────────── */}
      <div className="mb-8 overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm transition-all dark:border-gray-800 dark:bg-gray-900">
        {/* Gradient accent bar */}
        <div
          className={`h-1.5 w-full bg-gradient-to-r from-indigo-500 to-violet-500 transition-all duration-700 ease-out ${
            allDone ? "to-emerald-500" : ""
          }`}
          style={{ width: `${pct}%` }}
        />

        <div className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-gray-900 dark:text-white">
                {allDone ? "🎉 All steps complete!" : "Setup Progress"}
              </p>
              <p className="mt-0.5 text-xs text-gray-500 dark:text-gray-400">
                {doneCount} of {total} steps completed
                {allDone ? " — Your AI workforce is ready!" : ""}
              </p>
            </div>
            <span className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">
              {pct}%
            </span>
          </div>

          {/* Thin progress bar (desktop) */}
          <div className="mt-4 hidden h-2 w-full overflow-hidden rounded-full bg-gray-100 sm:block dark:bg-gray-800">
            <div
              className={`h-full rounded-full transition-all duration-700 ease-out ${
                allDone
                  ? "bg-gradient-to-r from-emerald-400 to-emerald-500"
                  : "bg-gradient-to-r from-indigo-500 to-violet-500"
              }`}
              style={{ width: `${pct}%` }}
            />
          </div>
        </div>
      </div>

      {/* ── Step list ──────────────────────────────────────────── */}
      <div className="space-y-4">
        {STEPS.map((step, i) => {
          const isDone = progress[step.id];
          const isHelpOpen = helpOpen === step.id;

          return (
            <div
              key={step.id}
              className={`group rounded-2xl border bg-white shadow-sm transition-all duration-300 dark:bg-gray-900 ${
                isDone
                  ? "border-emerald-200 dark:border-emerald-800/50"
                  : "border-gray-200 hover:border-indigo-200 hover:shadow-md dark:border-gray-800 dark:hover:border-indigo-700"
              } ${animating ? "opacity-50" : ""}`}
              style={{ animationDelay: `${i * 60}ms` }}
            >
              <div className="p-5">
                {/* ── Step header row ──────────────────────────── */}
                <div className="flex items-start gap-4">
                  {/* Step number / checkmark */}
                  <div
                    className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-sm font-bold transition-all ${
                      isDone
                        ? "bg-emerald-500 text-white shadow-sm shadow-emerald-200 dark:shadow-emerald-900/30"
                        : "bg-gray-100 text-gray-400 dark:bg-gray-800 dark:text-gray-500"
                    }`}
                  >
                    {isDone ? (
                      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                      </svg>
                    ) : (
                      i + 1
                    )}
                  </div>

                  {/* Text content */}
                  <div className="min-w-0 flex-1">
                    <h3
                      className={`text-base font-semibold ${
                        isDone
                          ? "text-emerald-800 line-through decoration-emerald-400 dark:text-emerald-300"
                          : "text-gray-900 dark:text-white"
                      }`}
                    >
                      {step.title}
                    </h3>
                    <p className="mt-0.5 text-sm text-gray-500 dark:text-gray-400">
                      {step.description}
                    </p>

                    {/* ── Sub‑tasks (visible when not done) ──── */}
                    {!isDone && (
                      <ul className="mt-3 space-y-1.5">
                        {step.tasks.map((task, j) => (
                          <li key={j} className="flex items-start gap-2 text-sm text-gray-600 dark:text-gray-400">
                            <svg className="mt-0.5 h-4 w-4 shrink-0 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            {task}
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>

                  {/* Mark-done button */}
                  <button
                    onClick={() => toggleStep(step.id)}
                    className={`shrink-0 self-start rounded-lg px-3.5 py-2 text-xs font-semibold transition-all active:scale-[0.96] ${
                      isDone
                        ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400"
                        : "border border-indigo-200 bg-white text-indigo-600 hover:bg-indigo-50 dark:border-indigo-800 dark:bg-gray-800 dark:text-indigo-400 dark:hover:bg-indigo-950/50"
                    }`}
                  >
                    {isDone ? "Done" : "Mark Complete"}
                  </button>
                </div>

                {/* ── Action buttons row ──────────────────────── */}
                <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-gray-100 pt-4 dark:border-gray-800">
                  {/* Need Help? */}
                  <button
                    onClick={() => setHelpOpen(isHelpOpen ? null : step.id)}
                    className="inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium text-gray-500 transition-all hover:bg-gray-100 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-gray-200"
                  >
                    <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9 5.25h.008v.008H12v-.008z" />
                    </svg>
                    Need Help?
                  </button>

                  {/* Video placeholder — hidden until videoUrl is set */}
                  {step.videoUrl && (
                    <button className="inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium text-indigo-600 transition-all hover:bg-indigo-50 dark:text-indigo-400 dark:hover:bg-indigo-950/50">
                      <svg className="h-3.5 w-3.5" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M8 5v14l11-7z" />
                      </svg>
                      Watch Tutorial
                    </button>
                  )}
                </div>

                {/* ── Help text (expandable) ──────────────────── */}
                {isHelpOpen && (
                  <div className="mt-3 animate-in fade-in slide-in-from-top-1 duration-200 rounded-xl border border-indigo-100 bg-indigo-50/50 px-4 py-3 text-sm text-indigo-800 dark:border-indigo-900/50 dark:bg-indigo-950/20 dark:text-indigo-300">
                    <div className="flex items-start gap-2.5">
                      <svg className="mt-0.5 h-4 w-4 shrink-0 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 18v-5.25m0 0a6.01 6.01 0 001.5-.189m-1.5.189a6.01 6.01 0 01-1.5-.189m3.75 7.478a12.06 12.06 0 01-4.5 0m3.75 2.383a14.406 14.406 0 01-3 0M14.25 18v-.192c0-.983.658-1.823 1.508-2.316a7.5 7.5 0 10-7.517 0c.85.493 1.509 1.333 1.509 2.316V18" />
                      </svg>
                      <p>{step.helpText}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* ── Celebration state ─────────────────────────────────── */}
      {allDone && (
        <div className="mt-8 animate-in fade-in zoom-in-95 duration-500 rounded-2xl border border-emerald-200 bg-gradient-to-br from-emerald-50 to-teal-50 p-6 text-center dark:border-emerald-800/50 dark:from-emerald-950/20 dark:to-teal-950/20">
          <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-900/30">
            <svg className="h-7 w-7 text-emerald-600 dark:text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h3 className="text-lg font-bold text-gray-900 dark:text-white">
            🎉 You're all set!
          </h3>
          <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
            Your VirtuStaff account is fully configured. Head to the dashboard to monitor your AI employees.
          </p>
          <div className="mt-5 flex flex-wrap items-center justify-center gap-3">
            <Link
              to="/app"
              className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-all hover:from-indigo-500 hover:to-violet-500 active:scale-[0.97]"
            >
              Go to Dashboard
            </Link>
            <button
              onClick={resetProgress}
              className="inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-5 py-2.5 text-sm font-medium text-gray-600 transition-all hover:border-gray-300 hover:text-gray-800 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:border-gray-600 dark:hover:text-gray-200"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182" />
              </svg>
              Reset Progress
            </button>
          </div>
        </div>
      )}

      {/* ── Reset (when not all done) ─────────────────────────── */}
      {doneCount > 0 && !allDone && (
        <div className="mt-6 text-center">
          <button
            onClick={resetProgress}
            className="inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium text-gray-400 transition-all hover:text-gray-600 dark:hover:text-gray-300"
          >
            <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182" />
            </svg>
            Reset progress
          </button>
        </div>
      )}

      <AiAssistant />
    </div>
  );
}