import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { AppLayout } from "~/components/app-layout";
import { fetchDashboardStats, fetchRecentActivity } from "~/lib/api-client";
import type { ApiResponse } from "~/lib/api-client";
import type { DashboardStats, ActivityItem } from "~/data/dashboard";

export const Route = createFileRoute("/app/")({
  component: AppDashboard,
});

// ─── Stat Card ───────────────────────────────────────────────────────────────

function StatCard({ title, value, change, color, loading }: { title: string; value: string | number; change: string; color: string; loading?: boolean }) {
  if (loading) {
    return (
      <div className="rounded-xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-900">
        <div className="h-4 w-24 animate-pulse rounded bg-gray-200 dark:bg-gray-800" />
        <div className="mt-3 h-8 w-16 animate-pulse rounded bg-gray-200 dark:bg-gray-800" />
        <div className="mt-2 h-3 w-20 animate-pulse rounded bg-gray-200 dark:bg-gray-800" />
      </div>
    );
  }
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-6 transition-all hover:shadow-lg dark:border-gray-800 dark:bg-gray-900">
      <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{title}</p>
      <p className={`mt-2 text-3xl font-bold tracking-tight ${color}`}>{value}</p>
      <p className="mt-1 text-xs text-green-600 dark:text-green-400">{change}</p>
    </div>
  );
}

// ─── Activity Item ───────────────────────────────────────────────────────────

function ActivityCard({ item }: { item: ActivityItem }) {
  return (
    <div className="flex items-start gap-4 border-b border-gray-100 px-6 py-4 last:border-0 dark:border-gray-800">
      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-50 text-indigo-500 dark:bg-indigo-950/30 dark:text-indigo-400">
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
        </svg>
      </div>
      <div className="flex-1">
        <p className="text-sm text-gray-900 dark:text-white">{item.description}</p>
        <p className="mt-0.5 text-xs text-gray-500 dark:text-gray-400">{item.timestamp}</p>
      </div>
    </div>
  );
}

// ─── Dashboard Page ──────────────────────────────────────────────────────────

function AppDashboard() {
  const [stats, setStats] = useState<ApiResponse<DashboardStats>>({ data: null, error: null, source: "fallback" });
  const [activity, setActivity] = useState<ApiResponse<ActivityItem[]>>({ data: null, error: null, source: "fallback" });
  const [statsLoading, setStatsLoading] = useState(true);
  const [activityLoading, setActivityLoading] = useState(true);

  useEffect(() => {
    fetchDashboardStats().then((result) => {
      setStats(result);
      setStatsLoading(false);
    });
    fetchRecentActivity().then((result) => {
      setActivity(result);
      setActivityLoading(false);
    });
  }, []);

  const dataSource = stats.source === "api" ? "Live data" : "Sample data";
  const dataSourceBadge = stats.source === "api"
    ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
    : "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400";

  const statCards = [
    { title: "Active AI Employees", value: stats.data?.activeEmployees ?? 0, change: "+1 this week", color: "text-indigo-600 dark:text-indigo-400" },
    { title: "Tasks Completed", value: (stats.data?.tasksCompleted ?? 0).toLocaleString(), change: "+12% vs last week", color: "text-violet-600 dark:text-violet-400" },
    { title: "Leads Captured", value: stats.data?.leadsCaptured ?? 0, change: "+8.3% vs last week", color: "text-emerald-600 dark:text-emerald-400" },
    { title: "Calls Handled", value: stats.data?.callsHandled ?? 0, change: "+24.5% this month", color: "text-blue-600 dark:text-blue-400" },
  ];

  return (
    <AppLayout>
      <div className="mx-auto max-w-6xl">
        {/* Header with data source badge */}
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">Welcome back, Acme Corp</h1>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Here's your AI workforce overview</p>
          </div>
          <span className={`rounded-full px-3 py-1 text-xs font-medium ${dataSourceBadge}`}>
            {dataSource}
          </span>
        </div>

        {/* Error banner */}
        {stats.error && (
          <div className="mb-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900/50 dark:bg-red-950/30 dark:text-red-400">
            Could not connect to backend — showing sample data
          </div>
        )}

        {/* Stats grid */}
        <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {statCards.map((card) => (
            <StatCard key={card.title} {...card} loading={statsLoading} />
          ))}
        </div>

        {/* Quick actions */}
        <div className="mb-8">
          <h2 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">Quick Actions</h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <a href="/app/employees" className="flex items-center gap-3 rounded-xl border border-gray-200 bg-white p-4 text-left text-sm font-medium text-gray-700 transition-all hover:border-indigo-200 hover:shadow-md dark:border-gray-800 dark:bg-gray-900 dark:text-gray-300 dark:hover:border-indigo-800">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-500 to-violet-500 text-white shadow-sm">
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                </svg>
              </div>
              <div><span className="block font-semibold">Hire New AI Employee</span><span className="text-xs text-gray-500">Get started →</span></div>
            </a>
            <button className="flex items-center gap-3 rounded-xl border border-gray-200 bg-white p-4 text-left text-sm font-medium text-gray-700 transition-all hover:border-indigo-200 hover:shadow-md dark:border-gray-800 dark:bg-gray-900 dark:text-gray-300 dark:hover:border-indigo-800">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-violet-500 to-purple-500 text-white shadow-sm">
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
                </svg>
              </div>
              <div><span className="block font-semibold">View Reports</span><span className="text-xs text-gray-500">Get started →</span></div>
            </button>
            <button className="flex items-center gap-3 rounded-xl border border-gray-200 bg-white p-4 text-left text-sm font-medium text-gray-700 transition-all hover:border-indigo-200 hover:shadow-md dark:border-gray-800 dark:bg-gray-900 dark:text-gray-300 dark:hover:border-indigo-800">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-emerald-500 to-teal-500 text-white shadow-sm">
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
                </svg>
              </div>
              <div><span className="block font-semibold">Manage Team</span><span className="text-xs text-gray-500">Get started →</span></div>
            </button>
            <button className="flex items-center gap-3 rounded-xl border border-gray-200 bg-white p-4 text-left text-sm font-medium text-gray-700 transition-all hover:border-indigo-200 hover:shadow-md dark:border-gray-800 dark:bg-gray-900 dark:text-gray-300 dark:hover:border-indigo-800">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-cyan-500 to-blue-500 text-white shadow-sm">
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13.19 8.688a4.5 4.5 0 011.242 7.244l-4.5 4.5a4.5 4.5 0 01-6.364-6.364l1.757-1.757m13.35-.622l1.757-1.757a4.5 4.5 0 00-6.364-6.364l-4.5 4.5a4.5 4.5 0 001.242 7.244" />
                </svg>
              </div>
              <div><span className="block font-semibold">Add Integration</span><span className="text-xs text-gray-500">Get started →</span></div>
            </button>
          </div>
        </div>

        {/* Recent activity */}
        <div>
          <h2 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">Recent Activity</h2>
          {activityLoading ? (
            <div className="space-y-4 rounded-xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-900">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="flex items-center gap-4">
                  <div className="h-8 w-8 animate-pulse rounded-lg bg-gray-200 dark:bg-gray-800" />
                  <div className="flex-1 space-y-2">
                    <div className="h-3 w-3/4 animate-pulse rounded bg-gray-200 dark:bg-gray-800" />
                    <div className="h-2 w-1/4 animate-pulse rounded bg-gray-200 dark:bg-gray-800" />
                  </div>
                </div>
              ))}
            </div>
          ) : activity.data && activity.data.length > 0 ? (
            <div className="rounded-xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900">
              {activity.data.map((item) => (
                <ActivityCard key={item.id} item={item} />
              ))}
            </div>
          ) : (
            <div className="rounded-xl border border-gray-200 bg-white p-12 text-center dark:border-gray-800 dark:bg-gray-900">
              <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <h3 className="mt-4 text-sm font-semibold text-gray-900 dark:text-white">No activity yet</h3>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Activity will appear here as your AI employees start working.</p>
            </div>
          )}
          {/* Error state for activity */}
          {activity.error && (
            <p className="mt-2 text-xs text-red-500">Failed to load activity feed: {activity.error}</p>
          )}
        </div>

        {/* 7-Day Activity Chart */}
        <div className="mt-8">
          <h2 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">7-Day Activity</h2>
          <div className="rounded-xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-900">
            <div className="flex items-end justify-between gap-2 sm:gap-4" style={{ height: "160px" }}>
              {[
                { day: "Mon", value: 65, label: "65" },
                { day: "Tue", value: 82, label: "82" },
                { day: "Wed", value: 71, label: "71" },
                { day: "Thu", value: 93, label: "93" },
                { day: "Fri", value: 78, label: "78" },
                { day: "Sat", value: 45, label: "45" },
                { day: "Sun", value: 52, label: "52" },
              ].map((bar) => (
                <div key={bar.day} className="flex flex-1 flex-col items-center gap-2">
                  <span className="text-xs font-medium text-gray-500 dark:text-gray-400">{bar.label}</span>
                  <div
                    className="w-full max-w-[40px] rounded-t-lg bg-gradient-to-t from-indigo-500 to-violet-500 transition-all duration-500 hover:from-indigo-400 hover:to-violet-400"
                    style={{ height: `${bar.value}%` }}
                  />
                  <span className="text-xs text-gray-500 dark:text-gray-400">{bar.day}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}