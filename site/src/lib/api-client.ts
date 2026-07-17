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

// ─── Billing API ──────────────────────────────────────────────────────────────

export interface BillingSubscription {
  id: string;
  status: string;
  currentPeriodStart: string | null;
  currentPeriodEnd: string | null;
  trialEnd: string | null;
  canceledAt: string | null;
  plan: {
    id: string;
    name: string;
    slug: string;
    priceCents: number;
    maxAiEmployees: number;
    features: string[];
  } | null;
  stripeStatus: string | null;
  cancelAtPeriodEnd: boolean;
  cancelAt: string | null;
  paymentMethod: {
    brand: string;
    last4: string;
    expMonth: number;
    expYear: number;
  } | null;
  nextBillingAmount: number | null;
}

export interface PaymentHistoryItem {
  id: string;
  number: string;
  amountPaid: number;
  amountDue: number;
  currency: string;
  status: string;
  invoicePdf: string | null;
  hostedInvoiceUrl: string | null;
  periodStart: string | null;
  periodEnd: string | null;
  created: string;
  paid: boolean;
  paymentIntentStatus: string | null;
  cardBrand: string | null;
  cardLast4: string | null;
}

export interface SubscriptionPlan {
  id: string;
  stripePriceId: string;
  name: string;
  slug: string;
  description: string | null;
  priceCents: number;
  currency: string;
  interval: string;
  maxAiEmployees: number;
  features: string[];
  isActive: boolean;
  createdAt: string;
}

/**
 * Fetch billing subscription details from Stripe.
 */
export const fetchBillingSubscription = createServerFn({ method: "GET" }).handler(async (): Promise<ApiResponse<BillingSubscription>> => {
  try {
    const res = await fetch(`${API_BASE}/billing/subscription?orgId=${DEFAULT_ORG_ID}`);
    if (res.ok) {
      const json = await res.json();
      return { data: json.data as BillingSubscription, error: null, source: "api" };
    }
    return { data: null, error: `Backend returned ${res.status}`, source: "fallback" };
  } catch {
    return { data: null, error: "Backend unreachable", source: "fallback" };
  }
});

// ─── Settings / Organization API ──────────────────────────────────────────────

export interface Organization {
  id: string;
  name: string;
  slug: string;
  logoUrl: string | null;
  size: string;
  timezone: string;
  createdAt: string;
  updatedAt: string;
}

export interface OrgMember {
  id: string;
  userId: string;
  role: string;
  joinedAt: string;
  email: string | null;
  firstName: string | null;
  lastName: string | null;
}

/**
 * Fetch organization details.
 */
export const fetchOrganization = createServerFn({ method: "GET" }).handler(async (): Promise<ApiResponse<Organization>> => {
  try {
    const res = await fetch(`${API_BASE}/orgs/${DEFAULT_ORG_ID}`);
    if (res.ok) {
      const json = await res.json();
      return { data: json.data as Organization, error: null, source: "api" };
    }
    return { data: null, error: `Backend returned ${res.status}`, source: "fallback" };
  } catch {
    return { data: null, error: "Backend unreachable", source: "fallback" };
  }
});

/**
 * Fetch payment/invoice history from Stripe.
 */
export const fetchBillingPayments = createServerFn({ method: "GET" }).handler(async (): Promise<ApiResponse<PaymentHistoryItem[]>> => {
  try {
    const res = await fetch(`${API_BASE}/billing/payments?orgId=${DEFAULT_ORG_ID}&limit=12`);
    if (res.ok) {
      const json = await res.json();
      return { data: json.data as PaymentHistoryItem[], error: null, source: "api" };
    }
    return { data: null, error: `Backend returned ${res.status}`, source: "fallback" };
  } catch {
    return { data: null, error: "Backend unreachable", source: "fallback" };
  }
});

/**
 * Create a Stripe Customer Portal session.
 */
export const createBillingPortal = createServerFn({ method: "POST" }).handler(async (): Promise<{ success: boolean; portalUrl?: string; error?: string }> => {
  try {
    const res = await fetch(`${API_BASE}/billing/portal`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ orgId: DEFAULT_ORG_ID }),
    });
    if (res.ok) {
      const json = await res.json();
      return { success: true, portalUrl: json.portalUrl };
    }
    return { success: false, error: `Backend returned ${res.status}` };
  } catch {
    return { success: false, error: "Backend unreachable" };
  }
});

/**
 * Update organization settings.
 */
export const updateOrganization = createServerFn({ method: "POST" }).handler(
  async ({ data }: { data: Record<string, unknown> }): Promise<{ success: boolean; data?: Organization; error?: string }> => {
    try {
      const res = await fetch(`${API_BASE}/orgs/${DEFAULT_ORG_ID}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (res.ok) {
        const json = await res.json();
        return { success: true, data: json.data as Organization };
      }
      const json = await res.json();
      return { success: false, error: json.error?.message || `Backend returned ${res.status}` };
    } catch {
      return { success: false, error: "Backend unreachable" };
    }
  },
);

/**
 * Delete an organization and all its data.
 */
export const deleteOrganization = createServerFn({ method: "POST" }).handler(async (): Promise<{ success: boolean; error?: string }> => {
  try {
    const res = await fetch(`${API_BASE}/orgs/${DEFAULT_ORG_ID}`, { method: "DELETE" });
    if (res.ok) {
      return { success: true };
    }
    const json = await res.json();
    return { success: false, error: json.error?.message || `Backend returned ${res.status}` };
  } catch {
    return { success: false, error: "Backend unreachable" };
  }
});

/**
 * Cancel a subscription.
 */
export const cancelBillingSubscription = createServerFn({ method: "POST" }).handler(async ({ data }: { data: { immediate?: boolean } }): Promise<{ success: boolean; error?: string }> => {
  try {
    const res = await fetch(`${API_BASE}/billing/cancel`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ orgId: DEFAULT_ORG_ID, immediate: data.immediate }),
    });
    if (res.ok) {
      const json = await res.json();
      return { success: json.success };
    }
    const json = await res.json();
    return { success: false, error: json.error?.message || `Backend returned ${res.status}` };
  } catch {
    return { success: false, error: "Backend unreachable" };
  }
});

/**
 * Reactivate a subscription set to cancel at period end.
 */
export const reactivateBillingSubscription = createServerFn({ method: "POST" }).handler(async (): Promise<{ success: boolean; error?: string }> => {
  try {
    const res = await fetch(`${API_BASE}/billing/reactivate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ orgId: DEFAULT_ORG_ID }),
    });
    if (res.ok) {
      const json = await res.json();
      return { success: json.success };
    }
    const json = await res.json();
    return { success: false, error: json.error?.message || `Backend returned ${res.status}` };
  } catch {
    return { success: false, error: "Backend unreachable" };
  }
});

/**
 * Fetch available subscription plans from the DB.
 */
export const fetchSubscriptionPlans = createServerFn({ method: "GET" }).handler(async (): Promise<ApiResponse<SubscriptionPlan[]>> => {
  try {
    const res = await fetch(`${API_BASE}/plans`);
    if (res.ok) {
      const json = await res.json();
      return { data: json.data as SubscriptionPlan[], error: null, source: "api" };
    }
    return { data: null, error: `Backend returned ${res.status}`, source: "fallback" };
  } catch {
    return { data: null, error: "Backend unreachable", source: "fallback" };
  }
});

/**
 * Fetch organization members.
 */
export const fetchOrgMembers = createServerFn({ method: "GET" }).handler(async (): Promise<ApiResponse<OrgMember[]>> => {
  try {
    const res = await fetch(`${API_BASE}/orgs/${DEFAULT_ORG_ID}/members`);
    if (res.ok) {
      const json = await res.json();
      return { data: json.data as OrgMember[], error: null, source: "api" };
    }
    return { data: null, error: `Backend returned ${res.status}`, source: "fallback" };
  } catch {
    return { data: null, error: "Backend unreachable", source: "fallback" };
  }
});