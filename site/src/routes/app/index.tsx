import { createFileRoute } from "@tanstack/react-router";
import { AppLayout } from "~/components/app-layout";
import { stats, recentActivity } from "~/data/dashboard";

export const Route = createFileRoute("/app/")({
  component: AppDashboard,
});

function StatCard({ title, value, change, color }: { title: string; value: string | number; change: string; color: string }) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-6 transition-all hover:shadow-lg dark:border-gray-800 dark:bg-gray-900">
      <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{title}</p>
      <p className={`mt-2 text-3xl font-bold tracking-tight ${color}`}>{value}</p>
      <p className="mt-1 text-xs text-green-600 dark:text-green-400">{change}</p>
    </div>
  );
}

function AppDashboard() {
  return (
    <AppLayout>
      <div className="mx-auto max-w-6xl">
        <div className="mb-8">
          <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">Welcome back, Acme Corp</h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Here's your AI workforce overview</p>
        </div>

        {/* Stats grid */}
        <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard title="Active AI Employees" value={stats.activeEmployees} change="+1 this week" color="text-indigo-600 dark:text-indigo-400" />
          <StatCard title="Tasks Completed" value={stats.tasksCompleted.toLocaleString()} change="+12% vs last week" color="text-violet-600 dark:text-violet-400" />
          <StatCard title="Leads Captured" value={stats.leadsCaptured} change="+8.3% vs last week" color="text-emerald-600 dark:text-emerald-400" />
          <StatCard title="Calls Handled" value={stats.callsHandled} change="+24.5% this month" color="text-blue-600 dark:text-blue-400" />
        </div>

        {/* Quick actions */}
        <div className="mb-8">
          <h2 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">Quick Actions</h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <button className="flex items-center gap-3 rounded-xl border border-gray-200 bg-white p-4 text-left text-sm font-medium text-gray-700 transition-all hover:border-indigo-200 hover:shadow-md dark:border-gray-800 dark:bg-gray-900 dark:text-gray-300 dark:hover:border-indigo-800">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-500 to-violet-500 text-white shadow-sm">
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                </svg>
              </div>
              <div><span className="block font-semibold">Hire New AI Employee</span><span className="text-xs text-gray-500">Get started →</span></div>
            </button>
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
          <div className="rounded-xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900">
            {recentActivity.map((item) => (
              <div key={item.id} className="flex items-start gap-4 border-b border-gray-100 px-6 py-4 last:border-0 dark:border-gray-800">
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
            ))}
          </div>
        </div>
      </div>
    </AppLayout>
  );
}