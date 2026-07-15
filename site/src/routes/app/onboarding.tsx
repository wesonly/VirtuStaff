import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";

export const Route = createFileRoute("/app/onboarding")({
  component: OnboardingPage,
});

// ─── Steps ───────────────────────────────────────────────────────────────────

const steps = [
  { id: "org", label: "Organization", description: "Set up your company" },
  { id: "tools", label: "Tools", description: "Connect your services" },
  { id: "employees", label: "AI Employees", description: "Choose your team" },
  { id: "deploy", label: "Deploy", description: "Launch your workforce" },
];

const employeeTypes = [
  { id: "call-handler", name: "Call Handler", desc: "Answer and route calls, handle inquiries, take messages", icon: "phone" },
  { id: "lead-qualifier", name: "Lead Qualifier", desc: "Engage visitors, qualify leads in real time", icon: "star" },
  { id: "email-agent", name: "Email & SMS Agent", desc: "Send, receive, and respond to messages automatically", icon: "mail" },
  { id: "scheduler", name: "Scheduler", desc: "Manage calendars, book appointments, send reminders", icon: "calendar" },
  { id: "marketing", name: "Marketing Agent", desc: "Generate social posts, email campaigns, blog drafts", icon: "edit" },
  { id: "analytics", name: "Analytics Agent", desc: "Daily, weekly, and monthly performance reports", icon: "chart" },
];

const typeIcons: Record<string, string> = {
  phone: "M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z",
  star: "M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z",
  mail: "M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75",
  calendar: "M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5",
  edit: "M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10",
  chart: "M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z",
};

// ─── Step 1: Organization ────────────────────────────────────────────────────

function OrgStep({ data, onChange }: { data: Record<string, string>; onChange: (d: Record<string, string>) => void }) {
  return (
    <div className="space-y-5">
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Organization Name</label>
        <input type="text" value={data.name || ""} onChange={(e) => onChange({ ...data, name: e.target.value })}
          placeholder="Acme Corp"
          className="mt-1 w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:border-gray-700 dark:bg-gray-950 dark:text-white dark:focus:border-indigo-400" />
      </div>
      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Industry</label>
          <select value={data.industry || ""} onChange={(e) => onChange({ ...data, industry: e.target.value })}
            className="mt-1 w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-900 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:border-gray-700 dark:bg-gray-950 dark:text-white">
            <option value="">Select industry</option>
            <option value="technology">Technology</option>
            <option value="healthcare">Healthcare</option>
            <option value="real-estate">Real Estate</option>
            <option value="ecommerce">E-commerce</option>
            <option value="services">Professional Services</option>
            <option value="other">Other</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Company Size</label>
          <select value={data.size || ""} onChange={(e) => onChange({ ...data, size: e.target.value })}
            className="mt-1 w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-900 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:border-gray-700 dark:bg-gray-950 dark:text-white">
            <option value="">Select size</option>
            <option value="1">1 (Solo)</option>
            <option value="2-10">2-10 (Small)</option>
            <option value="11-50">11-50 (Medium)</option>
            <option value="51-200">51-200 (Large)</option>
            <option value="200+">200+ (Enterprise)</option>
          </select>
        </div>
      </div>
    </div>
  );
}

// ─── Step 2: Tools ───────────────────────────────────────────────────────────

function ToolsStep({ data, onChange }: { data: string[]; onChange: (d: string[]) => void }) {
  const tools = [
    { id: "crm", label: "CRM", desc: "Sync with Salesforce, HubSpot, or Pipedrive" },
    { id: "calendar", label: "Calendar", desc: "Connect Google Calendar or Outlook" },
    { id: "email", label: "Email", desc: "Send and receive emails via your inbox" },
    { id: "phone", label: "Phone", desc: "Handle inbound and outbound calls" },
  ];

  const toggle = (id: string) => {
    onChange(data.includes(id) ? data.filter((d) => d !== id) : [...data, id]);
  };

  return (
    <div className="space-y-4">
      <p className="text-sm text-gray-600 dark:text-gray-400">Select the tools you want your AI workforce to connect with.</p>
      {tools.map((tool) => (
        <button
          key={tool.id}
          onClick={() => toggle(tool.id)}
          className={`flex w-full items-center gap-4 rounded-xl border p-4 text-left transition-all ${
            data.includes(tool.id)
              ? "border-indigo-300 bg-indigo-50 dark:border-indigo-700 dark:bg-indigo-950/30"
              : "border-gray-200 bg-white hover:border-gray-300 dark:border-gray-800 dark:bg-gray-900 dark:hover:border-gray-700"
          }`}
        >
          <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${
            data.includes(tool.id) ? "bg-indigo-600 text-white" : "bg-gray-100 text-gray-500 dark:bg-gray-800"
          }`}>
            {data.includes(tool.id) ? (
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
              </svg>
            ) : (
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
              </svg>
            )}
          </div>
          <div className="flex-1">
            <p className="text-sm font-medium text-gray-900 dark:text-white">{tool.label}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">{tool.desc}</p>
          </div>
        </button>
      ))}
    </div>
  );
}

// ─── Step 3: AI Employees ────────────────────────────────────────────────────

function EmployeesStep({ data, onChange }: { data: string[]; onChange: (d: string[]) => void }) {
  const toggle = (id: string) => {
    onChange(data.includes(id) ? data.filter((d) => d !== id) : [...data, id]);
  };

  return (
    <div className="space-y-4">
      <p className="text-sm text-gray-600 dark:text-gray-400">Choose the AI employees you want to deploy. Select at least one.</p>
      <div className="grid gap-4 sm:grid-cols-2">
        {employeeTypes.map((emp) => (
          <button
            key={emp.id}
            onClick={() => toggle(emp.id)}
            className={`flex items-start gap-4 rounded-xl border p-4 text-left transition-all ${
              data.includes(emp.id)
                ? "border-indigo-300 bg-indigo-50 dark:border-indigo-700 dark:bg-indigo-950/30"
                : "border-gray-200 bg-white hover:border-gray-300 dark:border-gray-800 dark:bg-gray-900 dark:hover:border-gray-700"
            }`}
          >
            <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${
              data.includes(emp.id) ? "bg-indigo-600 text-white" : "bg-gray-100 text-gray-500 dark:bg-gray-800"
            }`}>
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d={typeIcons[emp.icon]} />
              </svg>
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-900 dark:text-white">{emp.name}</p>
              <p className="mt-0.5 text-xs text-gray-500 dark:text-gray-400">{emp.desc}</p>
            </div>
            {data.includes(emp.id) && (
              <svg className="mt-1 h-5 w-5 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            )}
          </button>
        ))}
      </div>
    </div>
  );
}

// ─── Step 4: Deploy ──────────────────────────────────────────────────────────

function DeployStep({ data, deployed, onDeploy }: { data: Record<string, unknown>; deployed: boolean; onDeploy: () => void }) {
  const selectedEmployees = (data.employees as string[]) || [];
  const selectedTools = (data.tools as string[]) || [];

  return (
    <div className="space-y-6">
      {deployed ? (
        <div className="text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/30">
            <svg className="h-8 w-8 text-green-600 dark:text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
            </svg>
          </div>
          <h3 className="mt-4 text-lg font-semibold text-gray-900 dark:text-white">Your AI Workforce is Deploying!</h3>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            We're setting up your AI employees. This should take just a moment. You'll be redirected to your dashboard shortly.
          </p>
        </div>
      ) : (
        <>
          <div className="rounded-xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-900">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Review Your Configuration</h3>
            <div className="mt-4 space-y-3">
              <div className="flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-100 text-indigo-600 dark:bg-indigo-950/50 dark:text-indigo-400">
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 21h16.5M4.5 3h15M5.25 3v18m13.5-18v18M9 6.75h1.5m-1.5 3h1.5m-1.5 3h1.5m3-6H15m-1.5 3H15m-1.5 3H15M9 21v-3.375c0-.621.504-1.125 1.125-1.125h3.75c.621 0 1.125.504 1.125 1.125V21" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">{data.orgName as string || "Your Organization"}</p>
                  <p className="text-xs text-gray-500">{data.orgIndustry as string || "Technology"} · {data.orgSize as string || "2-10"} employees</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-100 text-emerald-600 dark:bg-emerald-950/50 dark:text-emerald-400">
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13.19 8.688a4.5 4.5 0 011.242 7.244l-4.5 4.5a4.5 4.5 0 01-6.364-6.364l1.757-1.757m13.35-.622l1.757-1.757a4.5 4.5 0 00-6.364-6.364l-4.5 4.5a4.5 4.5 0 001.242 7.244" />
                  </svg>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400">{selectedTools.length} tool{selectedTools.length !== 1 ? "s" : ""} connected</p>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-violet-100 text-violet-600 dark:bg-violet-950/50 dark:text-violet-400">
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
                  </svg>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400">{selectedEmployees.length} AI employee{selectedEmployees.length !== 1 ? "s" : ""} selected</p>
              </div>
            </div>
          </div>

          <button
            onClick={onDeploy}
            disabled={selectedEmployees.length === 0}
            className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 px-6 py-3 text-sm font-semibold text-white shadow-sm transition-all hover:from-indigo-500 hover:to-violet-500 hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.97]"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
            </svg>
            Deploy AI Workforce
          </button>
        </>
      )}
    </div>
  );
}

// ─── Onboarding Page ─────────────────────────────────────────────────────────

function OnboardingPage() {
  const [step, setStep] = useState(0);
  const [deployed, setDeployed] = useState(false);
  const navigate = useNavigate();

  const [orgData, setOrgData] = useState<Record<string, string>>({ name: "", industry: "", size: "" });
  const [toolsData, setToolsData] = useState<string[]>([]);
  const [employeesData, setEmployeesData] = useState<string[]>([]);

  const canProceed = () => {
    switch (step) {
      case 0: return orgData.name.trim().length > 0 && orgData.industry !== "" && orgData.size !== "";
      case 1: return true; // tools are optional
      case 2: return employeesData.length > 0;
      default: return true;
    }
  };

  const handleDeploy = () => {
    setDeployed(true);
    setTimeout(() => {
      navigate({ to: "/app" });
    }, 2500);
  };

  return (
    <div className="mx-auto max-w-3xl">
      {/* Progress bar */}
      <div className="mb-10">
        <div className="flex items-center justify-between">
          {steps.map((s, i) => (
            <div key={s.id} className="flex flex-col items-center">
              <div className={`flex h-10 w-10 items-center justify-center rounded-full text-sm font-semibold transition-all ${
                i < step ? "bg-indigo-600 text-white" : i === step ? "bg-indigo-100 text-indigo-700 ring-2 ring-indigo-600 dark:bg-indigo-950/50 dark:text-indigo-400 dark:ring-indigo-400" : "bg-gray-100 text-gray-400 dark:bg-gray-800 dark:text-gray-500"
              }`}>
                {i < step ? (
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                  </svg>
                ) : (
                  i + 1
                )}
              </div>
              <p className={`mt-2 text-xs font-medium ${i <= step ? "text-indigo-600 dark:text-indigo-400" : "text-gray-400 dark:text-gray-500"}`}>{s.label}</p>
            </div>
          ))}
        </div>
        <div className="relative mt-4">
          <div className="absolute inset-0 flex items-center">
            <div className="h-0.5 w-full bg-gray-200 dark:bg-gray-800" />
          </div>
          <div className="relative flex justify-between">
            {steps.slice(0, -1).map((_, i) => (
              <div key={i} className="flex-1" style={{ marginLeft: i === 0 ? "0" : "-1px" }}>
                <div className={`h-0.5 transition-all ${i < step ? "bg-indigo-600" : "bg-gray-200 dark:bg-gray-800"}`} style={{ width: "100%" }} />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Step content */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">{steps[step].label}</h2>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">{steps[step].description}</p>
      </div>

      <div className="mb-8 rounded-xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-900">
        {step === 0 && <OrgStep data={orgData} onChange={setOrgData} />}
        {step === 1 && <ToolsStep data={toolsData} onChange={setToolsData} />}
        {step === 2 && <EmployeesStep data={employeesData} onChange={setEmployeesData} />}
        {step === 3 && <DeployStep data={{ orgName: orgData.name, orgIndustry: orgData.industry, orgSize: orgData.size, tools: toolsData, employees: employeesData }} deployed={deployed} onDeploy={handleDeploy} />}
      </div>

      {/* Navigation buttons */}
      {!deployed && (
        <div className="flex items-center justify-between">
          <button
            onClick={() => setStep(Math.max(0, step - 1))}
            disabled={step === 0}
            className="inline-flex items-center gap-2 rounded-xl border border-gray-300 px-6 py-2.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 disabled:opacity-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
            </svg>
            Back
          </button>
          {step < 3 ? (
            <button
              onClick={() => setStep(step + 1)}
              disabled={!canProceed()}
              className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 px-6 py-2.5 text-sm font-semibold text-white shadow-sm transition-all hover:from-indigo-500 hover:to-violet-500 hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.97]"
            >
              Continue
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
              </svg>
            </button>
          ) : null}
        </div>
      )}
    </div>
  );
}