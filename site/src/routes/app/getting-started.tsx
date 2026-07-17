import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { AiAssistant } from "~/components/ai-assistant";

export const Route = createFileRoute("/app/getting-started")({
  component: GettingStartedPage,
});

const steps = [
  { id: 1, label: "Create Account", done: true },
  { id: 2, label: "Complete Profile", done: false },
  { id: 3, label: "Choose AI Employee", done: false },
  { id: 4, label: "Connect Phone", done: false },
  { id: 5, label: "Connect CRM", done: false },
  { id: 6, label: "Import Contacts", done: false },
  { id: 7, label: "Configure AI Voice", done: false },
  { id: 8, label: "Test AI Conversation", done: false },
  { id: 9, label: "Launch AI Employee", done: false },
];

function StepCard({
  step,
  index,
}: {
  step: (typeof steps)[0];
  index: number;
}) {
  return (
    <div
      className={`group relative flex items-start gap-4 rounded-xl border p-4 transition-all duration-300 ${
        step.done
          ? "border-emerald-200 bg-emerald-50/50 dark:border-emerald-800/50 dark:bg-emerald-950/20"
          : "border-gray-200 bg-white hover:border-indigo-200 hover:shadow-md dark:border-gray-800 dark:bg-gray-900 dark:hover:border-indigo-700"
      }`}
      style={{ animationDelay: `${index * 80}ms` }}
    >
      {/* Step number / checkmark */}
      <div
        className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-sm font-bold transition-all ${
          step.done
            ? "bg-emerald-500 text-white shadow-sm shadow-emerald-200 dark:shadow-emerald-900/30"
            : "bg-gray-100 text-gray-400 dark:bg-gray-800 dark:text-gray-500"
        }`}
      >
        {step.done ? (
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
          </svg>
        ) : (
          index + 1
        )}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <h3
          className={`text-sm font-semibold ${
            step.done
              ? "text-emerald-800 line-through decoration-emerald-400 dark:text-emerald-300"
              : "text-gray-900 dark:text-white"
          }`}
        >
          {step.label}
        </h3>
        {!step.done && (
          <p className="mt-0.5 text-xs text-gray-500 dark:text-gray-400">
            {index === 0
              ? "✅ Done — you're all set"
              : index === 1
              ? "Add your company name, industry, and timezone"
              : index === 2
              ? "Browse AI employees and pick your first one"
              : index === 3
              ? "Link a phone number for inbound/outbound calls"
              : index === 4
              ? "Connect your CRM to sync contacts & leads"
              : index === 5
              ? "Bring your contacts into VirtuStaff"
              : index === 6
              ? "Choose an AI voice and personality"
              : index === 7
              ? "Run a test call to make sure everything works"
              : "Go live and let your AI start working"}
          </p>
        )}
      </div>

      {/* Watch Demo button */}
      {step.done ? (
        <span className="shrink-0 self-center rounded-full bg-emerald-100 px-2.5 py-1 text-[10px] font-medium text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400">
          Done
        </span>
      ) : (
        <button
          onClick={(e) => {
            e.stopPropagation();
            window.location.href = "/app/training";
          }}
          className="shrink-0 self-center inline-flex items-center gap-1.5 rounded-lg border border-indigo-200 bg-white px-3 py-1.5 text-xs font-medium text-indigo-600 transition-all hover:bg-indigo-50 hover:border-indigo-300 dark:border-indigo-800 dark:bg-gray-800 dark:text-indigo-400 dark:hover:bg-indigo-950/50"
        >
          <svg className="h-3.5 w-3.5" fill="currentColor" viewBox="0 0 24 24">
            <path d="M8 5v14l11-7z" />
          </svg>
          Watch Demo
        </button>
      )}
    </div>
  );
}

function GettingStartedPage() {
  const [allSteps, setAllSteps] = useState(steps);
  const doneCount = allSteps.filter((s) => s.done).length;
  const progress = Math.round((doneCount / allSteps.length) * 100);

  const toggleStep = (id: number) => {
    setAllSteps((prev) =>
      prev.map((s) => (s.id === id ? { ...s, done: !s.done } : s))
    );
  };

  return (
    <div className="mx-auto max-w-3xl">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
          Getting Started
        </h1>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Complete these steps to launch your AI workforce.
        </p>
      </div>

      {/* Progress bar */}
      <div className="mb-8 rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-900">
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm font-semibold text-gray-900 dark:text-white">
            Setup Progress
          </span>
          <span className="text-sm font-bold text-indigo-600 dark:text-indigo-400">
            {progress}%
          </span>
        </div>
        <div className="h-3 w-full overflow-hidden rounded-full bg-gray-200 dark:bg-gray-800">
          <div
            className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-violet-500 transition-all duration-700 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>
        <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
          {doneCount} of {allSteps.length} steps completed
          {doneCount === allSteps.length ? " 🎉" : ""}
        </p>
      </div>

      {/* Steps */}
      <div className="space-y-3">
        {allSteps.map((step, i) => (
          <button
            key={step.id}
            onClick={() => toggleStep(step.id)}
            className="w-full text-left animate-in fade-in slide-in-from-bottom-2"
            style={{ animationDelay: `${i * 80}ms` } as React.CSSProperties}
          >
            <StepCard step={step} index={i} />
          </button>
        ))}
      </div>

      {/* CTA */}
      {doneCount === allSteps.length && (
        <div className="mt-8 rounded-2xl border border-indigo-200 bg-gradient-to-r from-indigo-50 to-violet-50 p-6 text-center dark:border-indigo-800/50 dark:from-indigo-950/20 dark:to-violet-950/20">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white">
            🎉 All steps complete!
          </h3>
          <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
            Your AI workforce is ready. Head to the dashboard to monitor your team.
          </p>
          <Link
            to="/app"
            className="mt-4 inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-all hover:from-indigo-500 hover:to-violet-500 active:scale-[0.97]"
          >
            Go to Dashboard
          </Link>
        </div>
      )}

      <AiAssistant />
    </div>
  );
}
