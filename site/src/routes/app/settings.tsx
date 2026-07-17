import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState, useCallback } from "react";
import { AiAssistant } from "~/components/ai-assistant";
import {
  fetchOrganization,
  updateOrganization,
  deleteOrganization,
  fetchOrgMembers,
  type Organization,
  type OrgMember,
} from "~/lib/api-client";

export const Route = createFileRoute("/app/settings")({
  component: SettingsPage,
});

// ─── Helpers ──────────────────────────────────────────────────────────────────

function SkeletonBlock({ className = "" }: { className?: string }) {
  return <div className={`animate-pulse rounded bg-gray-200 dark:bg-gray-800 ${className}`} />;
}

const roleBadge = (role: string) => {
  const config: Record<string, string> = {
    admin: "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400",
    member: "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400",
    billing: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
    owner: "bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-400",
  };
  return (
    <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${config[role] || config.member}`}>
      {role}
    </span>
  );
};

// ─── Settings Page ────────────────────────────────────────────────────────────

function SettingsPage() {
  const navigate = useNavigate();

  // Org settings state
  const [org, setOrg] = useState<Organization | null>(null);
  const [orgLoading, setOrgLoading] = useState(true);
  const [orgError, setOrgError] = useState<string | null>(null);

  // Form fields
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [size, setSize] = useState("small");
  const [timezone, setTimezone] = useState("UTC");
  const [businessHours, setBusinessHours] = useState("9:00 AM - 5:00 PM");
  const [industry, setIndustry] = useState("technology");

  // Save state
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [hasChanges, setHasChanges] = useState(false);

  // Members
  const [members, setMembers] = useState<OrgMember[] | null>(null);
  const [membersLoading, setMembersLoading] = useState(true);

  // Delete
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState("");
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  // Notification toggles (UI-only)
  const [notifications, setNotifications] = useState({
    dailyReport: true,
    leadAlerts: true,
    employeeStatus: true,
    weeklyDigest: false,
  });

  // ─── Load data ──────────────────────────────────────────────────────────

  const loadData = useCallback(async () => {
    setOrgLoading(true);
    setMembersLoading(true);

    const [orgResult, membersResult] = await Promise.all([
      fetchOrganization(),
      fetchOrgMembers(),
    ]);

    if (orgResult.data) {
      setOrg(orgResult.data);
      setName(orgResult.data.name);
      setSlug(orgResult.data.slug);
      setSize(orgResult.data.size || "small");
      setTimezone(orgResult.data.timezone || "UTC");
      setHasChanges(false);
    } else if (orgResult.error) {
      setOrgError(orgResult.error);
    }
    setOrgLoading(false);

    if (membersResult.data) {
      setMembers(membersResult.data);
    }
    setMembersLoading(false);
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // ─── Track changes ──────────────────────────────────────────────────────

  const markChanged = () => setHasChanges(true);

  // ─── Save ───────────────────────────────────────────────────────────────

  const handleSave = async () => {
    setSaving(true);
    setSaveError(null);
    setSaved(false);

    const result = await updateOrganization({
      data: { name, slug, size, timezone },
    });

    setSaving(false);

    if (result.success) {
      setSaved(true);
      setHasChanges(false);
      if (result.data) setOrg(result.data);
      setTimeout(() => setSaved(false), 2500);
    } else {
      setSaveError(result.error || "Failed to save");
    }
  };

  // ─── Delete ─────────────────────────────────────────────────────────────

  const handleDelete = async () => {
    setDeleting(true);
    setDeleteError(null);

    const result = await deleteOrganization();

    setDeleting(false);

    if (result.success) {
      // Redirect to home or onboarding
      navigate({ to: "/" });
    } else {
      setDeleteError(result.error || "Failed to delete");
    }
  };

  // ─── Loading state ──────────────────────────────────────────────────────

  if (orgLoading) {
    return (
      <div className="mx-auto max-w-4xl">
        <div className="mb-8">
          <SkeletonBlock className="mb-2 h-8 w-32" />
          <SkeletonBlock className="h-4 w-64" />
        </div>
        <div className="mb-8 rounded-xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-900">
          <SkeletonBlock className="mb-4 h-6 w-40" />
          <div className="space-y-4">
            <SkeletonBlock className="h-10 w-full" />
            <SkeletonBlock className="h-10 w-full" />
            <div className="grid gap-4 sm:grid-cols-2">
              <SkeletonBlock className="h-10 w-full" />
              <SkeletonBlock className="h-10 w-full" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ─── Error / No org state — show defaults ────────────────────────────────

  if ((orgError || !org) && !orgLoading) {
    // Set defaults so the page is still usable
    if (!name) setName("My Company");
    if (!slug) setSlug("my-company");
  }

  // ─── Main settings view ─────────────────────────────────────────────────

  return (
    <div className="mx-auto max-w-4xl">
        {/* Offline notice */}
        {orgError && (
          <div className="mb-6 flex items-center gap-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700 dark:border-amber-900/50 dark:bg-amber-950/20 dark:text-amber-400">
            <svg className="h-5 w-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
            </svg>
            <span>Using offline defaults — connect to backend to save changes.</span>
            <button onClick={loadData} className="ml-auto rounded-lg border border-amber-300 px-3 py-1 text-xs font-medium hover:bg-amber-100 dark:border-amber-700 dark:hover:bg-amber-950/30">Retry</button>
          </div>
        )}

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">Settings</h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Manage your organization settings and preferences.</p>
        </div>

        {/* Save error */}
        {saveError && (
          <div className="mb-6 flex items-center justify-between rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900/50 dark:bg-red-950/30 dark:text-red-400">
            <span>{saveError}</span>
            <button onClick={() => setSaveError(null)} className="ml-4 text-red-500 hover:text-red-600">
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        )}

        {/* ── Organization ──────────────────────────────────────────────── */}
        <div className="mb-8 rounded-xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900">
          <div className="border-b border-gray-200 px-6 py-4 dark:border-gray-800">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Organization</h2>
                <p className="text-sm text-gray-500 dark:text-gray-400">Update your organization's name and details.</p>
              </div>
              <button className="inline-flex items-center gap-1.5 rounded-lg border border-indigo-200 bg-indigo-50 px-3 py-1.5 text-xs font-medium text-indigo-600 transition-colors hover:bg-indigo-100 dark:border-indigo-800 dark:bg-indigo-950/30 dark:text-indigo-400 dark:hover:bg-indigo-950/50">
                <svg className="h-3.5 w-3.5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M8 5v14l11-7z" />
                </svg>
                Watch Demo
              </button>
            </div>
          </div>
          <div className="space-y-5 p-6">
            {/* Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Organization Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => { setName(e.target.value); markChanged(); }}
                className="mt-1 w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:border-gray-700 dark:bg-gray-950 dark:text-white dark:focus:border-indigo-400"
              />
            </div>

            {/* Slug */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Slug</label>
              <input
                type="text"
                value={slug}
                onChange={(e) => { setSlug(e.target.value); markChanged(); }}
                className="mt-1 w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-900 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:border-gray-700 dark:bg-gray-950 dark:text-white dark:focus:border-indigo-400"
              />
              <p className="mt-1 text-xs text-gray-500">Used in URLs and API references. Lowercase alphanumeric with hyphens.</p>
            </div>

            {/* Industry + Timezone */}
            <div className="grid gap-5 sm:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Industry</label>
                <select
                  value={industry}
                  onChange={(e) => { setIndustry(e.target.value); markChanged(); }}
                  className="mt-1 w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-900 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:border-gray-700 dark:bg-gray-950 dark:text-white"
                >
                  <option value="technology">Technology</option>
                  <option value="healthcare">Healthcare</option>
                  <option value="real-estate">Real Estate</option>
                  <option value="ecommerce">E-commerce</option>
                  <option value="services">Professional Services</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Timezone</label>
                <select
                  value={timezone}
                  onChange={(e) => { setTimezone(e.target.value); markChanged(); }}
                  className="mt-1 w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-900 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:border-gray-700 dark:bg-gray-950 dark:text-white"
                >
                  <option value="UTC">UTC</option>
                  <option value="US/Eastern">US/Eastern</option>
                  <option value="US/Central">US/Central</option>
                  <option value="US/Mountain">US/Mountain</option>
                  <option value="US/Pacific">US/Pacific</option>
                  <option value="Europe/London">Europe/London</option>
                  <option value="Europe/Berlin">Europe/Berlin</option>
                  <option value="Asia/Tokyo">Asia/Tokyo</option>
                </select>
              </div>
            </div>

            {/* Company size + Business hours */}
            <div className="grid gap-5 sm:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Company Size</label>
                <select
                  value={size}
                  onChange={(e) => { setSize(e.target.value); markChanged(); }}
                  className="mt-1 w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-900 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:border-gray-700 dark:bg-gray-950 dark:text-white"
                >
                  <option value="small">Small (2–10 employees)</option>
                  <option value="medium">Medium (11–50 employees)</option>
                  <option value="large">Large (51–200 employees)</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Business Hours</label>
                <input
                  type="text"
                  value={businessHours}
                  onChange={(e) => { setBusinessHours(e.target.value); markChanged(); }}
                  placeholder="9:00 AM - 5:00 PM"
                  className="mt-1 w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:border-gray-700 dark:bg-gray-950 dark:text-white"
                />
                <p className="mt-1 text-xs text-gray-500">Saved locally as a preference (not synced to backend yet).</p>
              </div>
            </div>
          </div>
        </div>

        {/* ── Subscription ──────────────────────────────────────────────── */}
        <div className="mb-8 rounded-xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900">
          <div className="border-b border-gray-200 px-6 py-4 dark:border-gray-800">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Subscription Plan</h2>
          </div>
          <div className="flex flex-col gap-3 p-6 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600 dark:bg-indigo-950/30 dark:text-indigo-400">
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
                </svg>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900 dark:text-white">
                  View your current plan, upgrade, or manage billing details.
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">Plan, payment method, and invoice history.</p>
              </div>
            </div>
            <a
              href="/app/billing"
              className="inline-flex shrink-0 items-center gap-2 rounded-xl border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
            >
              Manage Billing
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
              </svg>
            </a>
          </div>
        </div>

        {/* ── Team Members ──────────────────────────────────────────────── */}
        <div className="mb-8 rounded-xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900">
          <div className="border-b border-gray-200 px-6 py-4 dark:border-gray-800">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Team Members</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">People with access to this organization.</p>
          </div>
          {membersLoading ? (
            <div className="divide-y divide-gray-100 dark:divide-gray-800">
              {[1, 2].map((i) => (
                <div key={i} className="flex items-center gap-4 px-6 py-4">
                  <SkeletonBlock className="h-10 w-10 rounded-full" />
                  <div>
                    <SkeletonBlock className="mb-1 h-4 w-32" />
                    <SkeletonBlock className="h-3 w-24" />
                  </div>
                </div>
              ))}
            </div>
          ) : members && members.length > 0 ? (
            <div className="divide-y divide-gray-100 dark:divide-gray-800">
              {members.map((m) => (
                <div key={m.id} className="flex items-center justify-between px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-violet-500 text-sm font-medium text-white">
                      {(m.firstName?.[0] || m.email?.[0] || "?").toUpperCase()}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        {m.firstName && m.lastName ? `${m.firstName} ${m.lastName}` : m.email || "Unknown User"}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">{m.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    {roleBadge(m.role)}
                    <p className="text-xs text-gray-400 dark:text-gray-500">
                      Joined {new Date(m.joinedAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-12 text-center">
              <svg className="mx-auto h-10 w-10 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
              </svg>
              <p className="mt-3 text-sm font-medium text-gray-500 dark:text-gray-400">No team members yet</p>
              <p className="text-xs text-gray-400 dark:text-gray-500">Invite team members to collaborate.</p>
            </div>
          )}
        </div>

        {/* ── Notifications ─────────────────────────────────────────────── */}
        <div className="mb-8 rounded-xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900">
          <div className="border-b border-gray-200 px-6 py-4 dark:border-gray-800">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Notifications</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">Configure how you receive alerts and updates.</p>
          </div>
          <div className="space-y-4 p-6">
            {[
              { key: "dailyReport", label: "Daily performance report", desc: "Receive a daily summary of your AI workforce performance" },
              { key: "leadAlerts", label: "Lead capture alerts", desc: "Get notified when a new lead is qualified" },
              { key: "employeeStatus", label: "Employee status changes", desc: "Alert when an AI employee goes offline or errors" },
              { key: "weeklyDigest", label: "Weekly digest", desc: "Weekly roundup of all activity across your AI workforce" },
            ].map((item) => (
              <div key={item.key} className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">{item.label}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{item.desc}</p>
                </div>
                <label className="relative inline-flex cursor-pointer items-center">
                  <input
                    type="checkbox"
                    checked={notifications[item.key as keyof typeof notifications]}
                    onChange={() =>
                      setNotifications((prev) => ({
                        ...prev,
                        [item.key]: !prev[item.key as keyof typeof prev],
                      }))
                    }
                    className="peer sr-only"
                  />
                  <div className="h-6 w-11 rounded-full bg-gray-200 after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:border after:border-gray-300 after:bg-white after:transition-all peer-checked:bg-indigo-600 peer-checked:after:translate-x-full peer-checked:after:border-white dark:bg-gray-700" />
                </label>
              </div>
            ))}
            <p className="text-xs text-gray-400 dark:text-gray-500">Notification preferences are saved locally (not synced to backend yet).</p>
          </div>
        </div>

        {/* ── Danger Zone ────────────────────────────────────────────────── */}
        <div className="mb-8 rounded-xl border border-red-200 bg-white dark:border-red-900/50 dark:bg-gray-900">
          <div className="border-b border-red-200 px-6 py-4 dark:border-red-900/50">
            <h2 className="text-lg font-semibold text-red-600 dark:text-red-400">Danger Zone</h2>
            <p className="text-sm text-red-500 dark:text-red-400">Irreversible actions — proceed with caution.</p>
          </div>
          <div className="flex flex-col gap-4 p-6 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-medium text-gray-900 dark:text-white">Delete Organization</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Permanently delete <span className="font-medium text-gray-700 dark:text-gray-300">{org.name}</span> and all associated data — AI employees, tasks, members, and integrations. This cannot be undone.
              </p>
            </div>
            <button
              onClick={() => setShowDeleteConfirm(true)}
              className="shrink-0 rounded-lg border border-red-300 px-4 py-2 text-sm font-medium text-red-600 transition-colors hover:bg-red-50 dark:border-red-800 dark:text-red-400 dark:hover:bg-red-950/30"
            >
              Delete Organization
            </button>
          </div>
        </div>

        {/* ── Save / Cancel ──────────────────────────────────────────────── */}
        <div className="flex items-center gap-3">
          <button
            onClick={handleSave}
            disabled={saving || !hasChanges}
            className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 px-6 py-2.5 text-sm font-semibold text-white shadow-sm transition-all hover:from-indigo-500 hover:to-violet-500 hover:shadow-md active:scale-[0.97] disabled:cursor-not-allowed disabled:opacity-50"
          >
            {saving ? (
              <>
                <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Saving...
              </>
            ) : saved ? (
              <>
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                </svg>
                Saved
              </>
            ) : (
              "Save Changes"
            )}
          </button>
          <button
            onClick={() => {
              if (org) {
                setName(org.name);
                setSlug(org.slug);
                setSize(org.size || "small");
                setTimezone(org.timezone || "UTC");
                setHasChanges(false);
              }
            }}
            disabled={!hasChanges}
            className="rounded-xl border border-gray-300 px-6 py-2.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
          >
            Cancel
          </button>
        </div>

        {/* ── Delete Confirmation Modal ─────────────────────────────────── */}
        {showDeleteConfirm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl dark:bg-gray-900">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400">
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Delete Organization</h3>
              <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                This will permanently delete <span className="font-semibold text-gray-900 dark:text-white">{org.name}</span> and all associated data. This action <span className="font-semibold text-red-600 dark:text-red-400">cannot be undone</span>.
              </p>
              <p className="mt-3 text-sm text-gray-600 dark:text-gray-400">
                Type <span className="rounded bg-gray-100 px-1.5 py-0.5 font-mono text-xs text-red-600 dark:bg-gray-800 dark:text-red-400">DELETE</span> to confirm:
              </p>
              <input
                type="text"
                value={deleteConfirmText}
                onChange={(e) => setDeleteConfirmText(e.target.value)}
                placeholder="DELETE"
                className="mt-2 w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-900 focus:border-red-500 focus:outline-none focus:ring-1 focus:ring-red-500 dark:border-gray-700 dark:bg-gray-950 dark:text-white"
              />
              {deleteError && (
                <p className="mt-2 text-sm text-red-600 dark:text-red-400">{deleteError}</p>
              )}
              <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-end">
                <button
                  onClick={() => { setShowDeleteConfirm(false); setDeleteConfirmText(""); setDeleteError(null); }}
                  disabled={deleting}
                  className="rounded-xl border border-gray-300 px-4 py-2.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800 disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDelete}
                  disabled={deleteConfirmText !== "DELETE" || deleting}
                  className="rounded-xl bg-red-600 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-red-500 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {deleting ? "Deleting..." : "Delete Organization"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
  );
}
