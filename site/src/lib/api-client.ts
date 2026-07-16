/**
 * VirtuStaff Dashboard — API Client
 *
 * Fetches data from the backend API (localhost:3001) with graceful fallback
 * to placeholder data when the backend is unavailable or tables aren't migrated.
 */

import { createServerFn } from "@tanstack/react-start";
import { stats, recentActivity, aiEmployees } from "~/data/dashboard";
import type { DashboardStats, ActivityItem, AIEmployee } from "~/data/dashboard";

// ─── Types ───────────────────────────────────────────────────────────────────

export interface ApiResponse<T> {
  data: T | null;
  error: string | null;
  source: "api" | "fallback";
}

// ─── Backend URL ─────────────────────────────────────────────────────────────

/**
 * API base URL for backend requests.
 * In development, use localhost:3001 (backend dev server).
 * In production (Vercel), use the API proxy at /api/v1 which forwards to the backend.
 */
const API_BASE = import.meta.env.VITE_API_URL || "/api/v1";
const DEFAULT_ORG_ID = "default-org";

// ─── Server Functions ───────────────────────────────────────────────────────

/**
 * Fetch the health check from the backend.
 */
export const fetchHealth = createServerFn({ method: "GET" }).handler(async () => {
  try {
    const res = await fetch(`${API_BASE}/health`);
    if (!res.ok) return { ok: false, error: `Backend returned ${res.status}` };
    return { ok: true, ...(await res.json()) };
  } catch {
    return { ok: false, error: "Backend unreachable" };
  }
});

/**
 * Fetch dashboard stats from the backend API, falling back to placeholder data.
 */
export const fetchDashboardStats = createServerFn({ method: "GET" }).handler(async (): Promise<ApiResponse<DashboardStats>> => {
  try {
    const res = await fetch(`${API_BASE}/orgs/${DEFAULT_ORG_ID}/stats`);
    if (res.ok) {
      const json = await res.json();
      return { data: json.data as DashboardStats, error: null, source: "api" };
    }
    // Backend returned an error — fall back to placeholder
    return { data: stats, error: null, source: "fallback" };
  } catch {
    // Backend unreachable — fall back to placeholder
    return { data: stats, error: null, source: "fallback" };
  }
});

/**
 * Fetch recent activity from the backend API, falling back to placeholder data.
 */
export const fetchRecentActivity = createServerFn({ method: "GET" }).handler(async (): Promise<ApiResponse<ActivityItem[]>> => {
  try {
    const res = await fetch(`${API_BASE}/orgs/${DEFAULT_ORG_ID}/activity`);
    if (res.ok) {
      const json = await res.json();
      return { data: json.data as ActivityItem[], error: null, source: "api" };
    }
    return { data: recentActivity, error: null, source: "fallback" };
  } catch {
    return { data: recentActivity, error: null, source: "fallback" };
  }
});

/**
 * Fetch AI employees from the backend API, falling back to placeholder data.
 */
export const fetchEmployees = createServerFn({ method: "GET" }).handler(async (): Promise<ApiResponse<AIEmployee[]>> => {
  try {
    const res = await fetch(`${API_BASE}/orgs/${DEFAULT_ORG_ID}/employees`);
    if (res.ok) {
      const json = await res.json();
      return { data: json.data as AIEmployee[], error: null, source: "api" };
    }
    return { data: aiEmployees, error: null, source: "fallback" };
  } catch {
    return { data: aiEmployees, error: null, source: "fallback" };
  }
});

/**
 * Toggle employee status (activate/pause).
 */
export const toggleEmployeeStatus = createServerFn({ method: "POST" }).handler(
  async ({ data }: { data: { empId: string; action: "activate" | "pause" } }) => {
    const { empId, action } = data;
    try {
      const endpoint = action === "activate" ? "activate" : "pause";
      const res = await fetch(`${API_BASE}/orgs/${DEFAULT_ORG_ID}/employees/${empId}/${endpoint}`, {
        method: "POST",
      });
      if (res.ok) {
        const json = await res.json();
        return { success: true, data: json.data };
      }
      return { success: false, error: `Backend returned ${res.status}` };
    } catch {
      return { success: false, error: "Backend unreachable" };
    }
  },
);