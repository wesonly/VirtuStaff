import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { AiAssistant } from "~/components/ai-assistant";

export const Route = createFileRoute("/app/integrations")({
  component: IntegrationsPage,
});

const API_BASE = import.meta.env.VITE_API_URL || "/api/v1";
const DEFAULT_ORG_ID = "default";

// ─── Types ───────────────────────────────────────────────────────────────────

interface CrmProvider {
  id: string;
  name: string;
  authType: "oauth2" | "api_key";
  description: string;
  website: string;
  docsUrl: string;
  icon: string;
  requiresOAuthApp: boolean;
  apiKeyLabel: string | null;
  apiKeyHelp: string | null;
  isConfigured: boolean;
}

interface CrmConnection {
  id: string;
  providerId: string;
  providerName: string;
  status: string;
  createdAt: string;
  lastSyncAt: string | null;
  syncStatus: string | null;
}

interface Integration {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: "crm" | "communication" | "calendar" | "analytics";
  status: "connected" | "available" | "coming_soon";
  providerId?: string;
  connectionId?: string;
}

// ─── API Helpers ─────────────────────────────────────────────────────────────

async function fetchProviders(): Promise<CrmProvider[]> {
  try {
    const res = await fetch(`${API_BASE}/crm/providers`);
    if (res.ok) {
      const json = await res.json();
      return json.data || [];
    }
  } catch {}
  return [];
}

async function fetchConnections(): Promise<CrmConnection[]> {
  try {
    const res = await fetch(`${API_BASE}/orgs/${DEFAULT_ORG_ID}/crm`);
    if (res.ok) {
      const json = await res.json();
      return json.data || [];
    }
  } catch {}
  return [];
}

async function connectCrm(providerId: string, apiKey?: string): Promise<{ success: boolean; error?: string; authorizeUrl?: string }> {
  try {
    const res = await fetch(`${API_BASE}/orgs/${DEFAULT_ORG_ID}/crm/connect`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ providerId, apiKey }),
    });
    const json = await res.json();
    return json;
  } catch {
    return { success: false, error: "Backend unreachable" };
  }
}

async function disconnectCrm(connectionId: string): Promise<boolean> {
  try {
    const res = await fetch(`${API_BASE}/orgs/${DEFAULT_ORG_ID}/crm/${connectionId}`, { method: "DELETE" });
    return res.ok;
  } catch {
    return false;
  }
}

// ─── Icons ───────────────────────────────────────────────────────────────────

const iconMap: Record<string, JSX.Element> = {
  hubspot: (
    <svg className="h-6 w-6" viewBox="0 0 24 24" fill="currentColor"><path d="M18.1 11.5c-.4 0-.8.1-1.1.3l-3.2-2.5c.1-.3.1-.6.1-.9 0-1.7-1.4-3.1-3.1-3.1-.9 0-1.7.4-2.3 1L6.7 4.7c.1-.2.1-.5.1-.7 0-1.1-.9-2-2-2s-2 .9-2 2 .9 2 2 2c.4 0 .8-.1 1.1-.3l1.9 1.9c-.4.6-.6 1.3-.6 2.1 0 1.7 1.4 3.1 3.1 3.1.9 0 1.7-.4 2.3-1l3.2 2.5c-.1.3-.1.6-.1.9 0 1.7 1.4 3.1 3.1 3.1s3.1-1.4 3.1-3.1-1.4-3.1-3.1-3.1z"/></svg>
  ),
  salesforce: (
    <svg className="h-6 w-6" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z"/></svg>
  ),
  pipedrive: (
    <svg className="h-6 w-6" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/></svg>
  ),
  zoho: (
    <svg className="h-6 w-6" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z"/></svg>
  ),
  close: (
    <svg className="h-6 w-6" viewBox="0 0 24 24" fill="currentColor"><path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/></svg>
  ),
  email: (
    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" /></svg>
  ),
  phone: (
    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z" /></svg>
  ),
  calendar: (
    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" /></svg>
  ),
  chart: (
    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" /></svg>
  ),
  grid: (
    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z" /></svg>
  ),
};

// ─── Component ───────────────────────────────────────────────────────────────

function IntegrationsPage() {
  const [providers, setProviders] = useState<CrmProvider[]>([]);
  const [connections, setConnections] = useState<CrmConnection[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [connecting, setConnecting] = useState<string | null>(null);
  const [apiKeyInputs, setApiKeyInputs] = useState<Record<string, string>>({});

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [providersData, connectionsData] = await Promise.all([
        fetchProviders(),
        fetchConnections(),
      ]);
      setProviders(providersData);
      setConnections(connectionsData);
    } catch {
      setError("Failed to load integrations. Please try again.");
    }
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleConnect = async (provider: CrmProvider) => {
    setConnecting(provider.id);
    try {
      if (provider.authType === "api_key") {
        const apiKey = apiKeyInputs[provider.id];
        if (!apiKey) {
          setError(`Please enter your ${provider.name} API key.`);
          setConnecting(null);
          return;
        }
        const result = await connectCrm(provider.id, apiKey);
        if (result.success) {
          await loadData();
        } else {
          setError(result.error || "Failed to connect.");
        }
      } else {
        // OAuth2 — get authorize URL from backend
        const result = await connectCrm(provider.id);
        if (result.authorizeUrl) {
          window.open(result.authorizeUrl, "_blank");
        } else {
          setError(result.error || "OAuth configuration not available.");
        }
      }
    } catch {
      setError("Connection failed. Please try again.");
    }
    setConnecting(null);
  };

  const handleDisconnect = async (connectionId: string) => {
    const success = await disconnectCrm(connectionId);
    if (success) {
      await loadData();
    } else {
      setError("Failed to disconnect. Please try again.");
    }
  };

  // Build integration list from CRM providers + static integrations
  const allIntegrations: Integration[] = [
    // CRM integrations from backend
    ...providers.map((p) => {
      const conn = connections.find((c) => c.providerId === p.id);
      return {
        id: p.id,
        name: p.name,
        description: p.description,
        icon: p.icon || "grid",
        category: "crm" as const,
        status: conn ? "connected" as const : "available" as const,
        providerId: p.id,
        connectionId: conn?.id,
      };
    }),
    // Static integrations
    { id: "gmail", name: "Gmail", description: "Connect your Gmail inbox for email automation.", icon: "email", category: "communication" as const, status: "available" as const },
    { id: "outlook", name: "Outlook", description: "Connect Microsoft Outlook for email and calendar.", icon: "email", category: "communication" as const, status: "available" as const },
    { id: "twilio", name: "Twilio", description: "Phone numbers for AI calling and SMS.", icon: "phone", category: "communication" as const, status: "available" as const },
    { id: "google-calendar", name: "Google Calendar", description: "Sync appointments and availability.", icon: "calendar", category: "calendar" as const, status: "available" as const },
    { id: "outlook-calendar", name: "Outlook Calendar", description: "Sync appointments and availability.", icon: "calendar", category: "calendar" as const, status: "available" as const },
    { id: "google-analytics", name: "Google Analytics", description: "Import website traffic and conversion data.", icon: "chart", category: "analytics" as const, status: "coming_soon" as const },
  ];

  const categories = [
    { id: "crm", label: "CRM", desc: "Sync contacts, deals, and activity" },
    { id: "communication", label: "Communication", desc: "Email, phone, and messaging" },
    { id: "calendar", label: "Calendar", desc: "Appointment scheduling" },
    { id: "analytics", label: "Analytics", desc: "Reports and insights" },
  ] as const;

  return (
    <div className="mx-auto max-w-5xl">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
          Integrations
        </h1>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Connect your tools and services to extend VirtuStaff's capabilities.
        </p>
      </div>

      {/* Error banner */}
      {error && (
        <div className="mb-6 flex items-center gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-800/50 dark:bg-red-950/20 dark:text-red-400">
          <svg className="h-5 w-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
          </svg>
          <span className="flex-1">{error}</span>
          <button onClick={() => setError(null)} className="text-red-500 hover:text-red-700">
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      )}

      {/* Loading state */}
      {loading ? (
        <div className="space-y-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-900">
              <div className="mb-4 h-5 w-32 animate-pulse rounded bg-gray-200 dark:bg-gray-800" />
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {[1, 2, 3].map((j) => (
                  <div key={j} className="h-32 animate-pulse rounded-xl bg-gray-100 dark:bg-gray-800" />
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* Integration categories */
        <div className="space-y-8">
          {categories.map((cat) => {
            const items = allIntegrations.filter((i) => i.category === cat.id);
            if (items.length === 0) return null;

            return (
              <div key={cat.id} className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-900">
                <div className="mb-4">
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                    {cat.label}
                  </h2>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{cat.desc}</p>
                </div>

                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {items.map((integration) => {
                    const isConnected = integration.status === "connected";
                    const isComingSoon = integration.status === "coming_soon";
                    const provider = providers.find((p) => p.id === integration.providerId);
                    const needsApiKey = provider?.authType === "api_key";
                    const requiresOAuth = provider?.requiresOAuthApp;

                    return (
                      <div
                        key={integration.id}
                        className={`group relative rounded-xl border p-4 transition-all ${
                          isConnected
                            ? "border-emerald-200 bg-emerald-50/30 dark:border-emerald-800/30 dark:bg-emerald-950/10"
                            : isComingSoon
                            ? "border-gray-100 bg-gray-50/50 opacity-60 dark:border-gray-800 dark:bg-gray-900/50"
                            : "border-gray-200 bg-white hover:border-indigo-200 hover:shadow-sm dark:border-gray-700 dark:bg-gray-800/50 dark:hover:border-indigo-700"
                        }`}
                      >
                        {/* Icon + name */}
                        <div className="flex items-start gap-3">
                          <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${
                            isConnected
                              ? "bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400"
                              : "bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400"
                          }`}>
                            {iconMap[integration.icon] || iconMap.grid}
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2">
                              <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
                                {integration.name}
                              </h3>
                              {isConnected && (
                                <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-medium text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400">
                                  Connected
                                </span>
                              )}
                              {isComingSoon && (
                                <span className="rounded-full bg-gray-100 px-2 py-0.5 text-[10px] font-medium text-gray-500 dark:bg-gray-800 dark:text-gray-400">
                                  Soon
                                </span>
                              )}
                            </div>
                            <p className="mt-0.5 text-xs text-gray-500 dark:text-gray-400">
                              {integration.description}
                            </p>
                          </div>
                        </div>

                        {/* API key input (for API key based providers) */}
                        {!isConnected && !isComingSoon && needsApiKey && (
                          <div className="mt-3">
                            <input
                              type="text"
                              placeholder={provider?.apiKeyLabel || "Enter API key"}
                              value={apiKeyInputs[integration.id] || ""}
                              onChange={(e) =>
                                setApiKeyInputs((prev) => ({ ...prev, [integration.id]: e.target.value }))
                              }
                              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-xs text-gray-900 placeholder-gray-400 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white dark:placeholder-gray-500"
                            />
                          </div>
                        )}

                        {/* OAuth note */}
                        {!isConnected && !isComingSoon && requiresOAuth && (
                          <p className="mt-2 text-[10px] text-amber-600 dark:text-amber-400">
                            Requires OAuth app registration in {integration.name} developer portal.
                          </p>
                        )}

                        {/* Action button */}
                        <div className="mt-3">
                          {isConnected ? (
                            <button
                              onClick={() => integration.connectionId && handleDisconnect(integration.connectionId)}
                              className="w-full rounded-lg border border-red-200 px-3 py-1.5 text-xs font-medium text-red-600 transition-all hover:bg-red-50 dark:border-red-800/50 dark:text-red-400 dark:hover:bg-red-950/20"
                            >
                              Disconnect
                            </button>
                          ) : isComingSoon ? (
                            <button
                              disabled
                              className="w-full cursor-not-allowed rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-medium text-gray-400 dark:border-gray-700 dark:text-gray-500"
                            >
                              Coming Soon
                            </button>
                          ) : (
                            <button
                              onClick={() => provider && handleConnect(provider)}
                              disabled={connecting === integration.id}
                              className="inline-flex w-full items-center justify-center gap-1.5 rounded-lg border border-indigo-200 bg-white px-3 py-1.5 text-xs font-medium text-indigo-600 transition-all hover:bg-indigo-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-indigo-800 dark:bg-gray-800 dark:text-indigo-400 dark:hover:bg-indigo-950/50"
                            >
                              {connecting === integration.id ? (
                                <>
                                  <svg className="h-3.5 w-3.5 animate-spin" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                                  </svg>
                                  Connecting...
                                </>
                              ) : (
                                "Connect"
                              )}
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}

      <AiAssistant />
    </div>
  );
}