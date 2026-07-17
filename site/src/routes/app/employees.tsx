import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { fetchEmployees, toggleEmployeeStatus } from "~/lib/api-client";
import type { ApiResponse } from "~/lib/api-client";
import type { AIEmployee } from "~/data/dashboard";

export const Route = createFileRoute("/app/employees")({
  component: EmployeesPage,
});

// ─── Type icon ───────────────────────────────────────────────────────────────

function TypeIcon({ type }: { type: string }) {
  const paths: Record<string, string> = {
    phone: "M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z",
    star: "M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z",
    mail: "M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75",
    edit: "M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10",
    database: "M20.25 6.375c0 2.278-3.694 4.125-8.25 4.125S3.75 8.653 3.75 6.375m16.5 0c0-2.278-3.694-4.125-8.25-4.125S3.75 4.097 3.75 6.375m16.5 0v11.25c0 2.278-3.694 4.125-8.25 4.125s-8.25-1.847-8.25-4.125V6.375m16.5 0v3.75m-16.5-3.75v3.75m16.5 0v3.75C20.25 16.153 16.556 18 12 18s-8.25-1.847-8.25-4.125v-3.75m16.5 0c0 2.278-3.694 4.125-8.25 4.125s-8.25-1.847-8.25-4.125",
  };

  return (
    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d={paths[type] || paths.star} />
    </svg>
  );
}

// ─── Loading Skeleton ────────────────────────────────────────────────────────

function EmployeeCardSkeleton() {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-gray-900">
      <div className="flex items-start justify-between">
        <div className="h-12 w-12 animate-pulse rounded-full bg-gray-200 dark:bg-gray-800" />
        <div className="h-5 w-14 animate-pulse rounded-full bg-gray-200 dark:bg-gray-800" />
      </div>
      <div className="mt-4 space-y-2">
        <div className="h-5 w-24 animate-pulse rounded bg-gray-200 dark:bg-gray-800" />
        <div className="h-4 w-32 animate-pulse rounded bg-gray-200 dark:bg-gray-800" />
      </div>
      <div className="mt-4 flex gap-4 border-t border-gray-100 pt-4 dark:border-gray-800">
        <div className="h-10 w-1/2 animate-pulse rounded bg-gray-200 dark:bg-gray-800" />
        <div className="h-10 w-1/2 animate-pulse rounded bg-gray-200 dark:bg-gray-800" />
      </div>
    </div>
  );
}

// ─── Employees Page ──────────────────────────────────────────────────────────

function EmployeesPage() {
  const [employeesData, setEmployeesData] = useState<ApiResponse<AIEmployee[]>>({ data: null, error: null, source: "fallback" });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [togglingId, setTogglingId] = useState<string | null>(null);

  useEffect(() => {
    fetchEmployees().then((result) => {
      setEmployeesData(result);
      setLoading(false);
    });
  }, []);

  const employees = employeesData.data ?? [];
  const dataSource = employeesData.source === "api" ? "Live data" : "Sample data — connect to backend";
  const dataSourceBadge = employeesData.source === "api"
    ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
    : "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400";

  const filtered = employees.filter((emp) => {
    const matchesSearch =
      emp.name.toLowerCase().includes(search.toLowerCase()) ||
      emp.type.toLowerCase().includes(search.toLowerCase());
    const matchesStatus =
      filterStatus === "all" || emp.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const statusCounts = {
    all: employees.length,
    active: employees.filter((e) => e.status === "active").length,
    paused: employees.filter((e) => e.status === "paused").length,
    offline: employees.filter((e) => e.status === "offline").length,
  };

  const statusStyles: Record<string, string> = {
    active: "bg-emerald-50 text-emerald-700 ring-emerald-600/20 dark:bg-emerald-950/50 dark:text-emerald-400 dark:ring-emerald-500/30",
    paused: "bg-amber-50 text-amber-700 ring-amber-600/20 dark:bg-amber-950/50 dark:text-amber-400 dark:ring-amber-500/30",
    offline: "bg-gray-50 text-gray-700 ring-gray-600/20 dark:bg-gray-900 dark:text-gray-400 dark:ring-gray-500/30",
  };

  const handleToggleStatus = async (emp: AIEmployee) => {
    setTogglingId(emp.id);
    const action = emp.status === "active" ? "pause" : "activate";
    const result = await toggleEmployeeStatus({ data: { empId: emp.id, action } });
    if (result.success) {
      // Optimistic update: toggle the status locally
      setEmployeesData((prev) => {
        if (!prev.data) return prev;
        return {
          ...prev,
          data: prev.data.map((e) =>
            e.id === emp.id
              ? { ...e, status: (action === "activate" ? "active" : "paused") as "active" | "paused" }
              : e
          ),
        };
      });
    }
    setTogglingId(null);
  };

  return (
    <div className="mx-auto max-w-7xl">
      {/* Header with data source badge */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-3xl">
              AI Employees
            </h1>
            <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
              Manage your AI workforce.{" "}
              {!loading && (
                <>
                  <span className="font-medium text-indigo-600 dark:text-indigo-400">
                    {statusCounts.active} active
                  </span>{" "}
                  · {statusCounts.paused} paused · {statusCounts.offline} offline
                </>
              )}
            </p>
          </div>
          <span className={`self-start rounded-full px-3 py-1 text-xs font-medium ${dataSourceBadge}`}>
            {dataSource}
          </span>
        </div>
        <button
          onClick={() => window.location.href = "/app/setup-wizard"}
          className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-all hover:from-indigo-500 hover:to-violet-500 hover:shadow-md active:scale-[0.97]"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
          Hire New Employee
        </button>
      </div>

      {/* Error banner */}
      {employeesData.error && (
        <div className="mt-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900/50 dark:bg-red-950/30 dark:text-red-400">
          Could not connect to backend — showing sample data
        </div>
      )}

      {/* Search and filter */}
      <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <svg className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
          </svg>
          <input
            type="text"
            placeholder="Search employees by name or type..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-lg border border-gray-300 bg-white py-2.5 pl-9 pr-3 text-sm text-gray-900 placeholder-gray-500 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:border-gray-700 dark:bg-gray-900 dark:text-white dark:placeholder-gray-500 dark:focus:border-indigo-400 dark:focus:ring-indigo-400"
          />
        </div>
        <div className="flex items-center gap-2">
          {(["all", "active", "paused", "offline"] as const).map((s) => (
            <button
              key={s}
              onClick={() => setFilterStatus(s)}
              className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
                filterStatus === s
                  ? "bg-indigo-100 text-indigo-700 dark:bg-indigo-950/50 dark:text-indigo-400"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700"
              }`}
            >
              {s === "all" ? "All" : s.charAt(0).toUpperCase() + s.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Employee cards */}
      {loading ? (
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <EmployeeCardSkeleton key={i} />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="mt-12 text-center">
          <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
          </svg>
          <h3 className="mt-4 text-sm font-semibold text-gray-900 dark:text-white">No employees found</h3>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            {search || filterStatus !== "all"
              ? "Try adjusting your search or filter to find what you're looking for."
              : "You haven't hired any AI employees yet. Click 'Hire New Employee' to get started."}
          </p>
        </div>
      ) : (
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((emp) => (
            <div
              key={emp.id}
              className="group rounded-xl border border-gray-200 bg-white p-5 shadow-sm transition-all hover:shadow-md hover:border-indigo-200 dark:border-gray-800 dark:bg-gray-900 dark:hover:border-indigo-800"
            >
              {/* Avatar + status */}
              <div className="flex items-start justify-between">
                <div className="relative flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 text-sm font-bold text-white ring-2 ring-offset-2 ring-offset-white dark:ring-offset-gray-900">
                  {emp.avatar}
                  <span
                    className={`absolute -bottom-0.5 -right-0.5 h-3.5 w-3.5 rounded-full border-2 border-white dark:border-gray-900 ${
                      emp.status === "active" ? "bg-emerald-500" : emp.status === "paused" ? "bg-amber-500" : "bg-gray-400"
                    }`}
                  />
                </div>
                <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset ${statusStyles[emp.status]}`}>
                  <span className={`h-1.5 w-1.5 rounded-full ${emp.status === "active" ? "bg-emerald-500" : emp.status === "paused" ? "bg-amber-500" : "bg-gray-400"}`} />
                  {emp.status.charAt(0).toUpperCase() + emp.status.slice(1)}
                </span>
              </div>

              {/* Name + type */}
              <div className="mt-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{emp.name}</h3>
                <div className="mt-1 flex items-center gap-1.5 text-sm text-gray-600 dark:text-gray-400">
                  <span className="text-indigo-500 dark:text-indigo-400">
                    <TypeIcon type={emp.typeIcon} />
                  </span>
                  <span>{emp.type}</span>
                </div>
              </div>

              {/* Stats */}
              <div className="mt-4 flex items-center gap-4 border-t border-gray-100 pt-4 dark:border-gray-800">
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-500">Tasks Done</p>
                  <p className="text-sm font-semibold text-gray-900 dark:text-white">{emp.tasksCompleted.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-500">Hired</p>
                  <p className="text-sm font-semibold text-gray-900 dark:text-white">{emp.hiredDate}</p>
                </div>
              </div>

              {/* Actions */}
              <div className="mt-4 flex gap-2">
                <button
                  onClick={() => handleToggleStatus(emp)}
                  disabled={togglingId === emp.id}
                  className="flex-1 rounded-lg border border-gray-300 px-3 py-1.5 text-xs font-medium text-gray-700 transition-colors hover:bg-gray-50 disabled:opacity-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
                >
                  {togglingId === emp.id ? (
                    <span className="inline-flex items-center gap-1">
                      <svg className="h-3 w-3 animate-spin" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                      </svg>
                      ...
                    </span>
                  ) : (
                    emp.status === "active" ? "Pause" : "Activate"
                  )}
                </button>
                <button className="flex-1 rounded-lg border border-gray-300 px-3 py-1.5 text-xs font-medium text-gray-700 transition-colors hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800">
                  Configure
                </button>
                <button
                  onClick={() => window.location.href = "/app/training"}
                  className="inline-flex items-center gap-1 rounded-lg border border-indigo-200 bg-indigo-50 px-3 py-1.5 text-xs font-medium text-indigo-600 transition-colors hover:bg-indigo-100 dark:border-indigo-800 dark:bg-indigo-950/30 dark:text-indigo-400 dark:hover:bg-indigo-950/50"
                  title="Watch training demo"
                >
                  <svg className="h-3.5 w-3.5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M8 5v14l11-7z" />
                  </svg>
                  Demo
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}