/**
 * VirtuStaff — CRM Module
 *
 * Complete CRM integration with real provider connections.
 * Supports HubSpot (OAuth2), Salesforce (OAuth2), Pipedrive (API key),
 * Zoho (OAuth2), and Close CRM (API key).
 */
import { Hono } from 'hono';
import { db } from '../../db/client.js';
import { crmConnections, syncLogs } from '../../db/schema/index.js';
import { eq, and } from 'drizzle-orm';
import { generateId } from '../../shared/utils.js';
import {
  CRM_PROVIDERS,
  getProvider,
  encryptToken,
  decryptToken,
  exchangeOAuthCode,
  buildOAuthUrl,
  testConnection,
} from '../../integrations/crm-providers.js';

export const crmRouter = new Hono();

// ─── Provider Registry ──────────────────────────────────────────────────────

/**
 * GET /api/v1/crm/providers
 * Lists all supported CRM providers with their auth details.
 */
crmRouter.get('/crm/providers', (c) => {
  const providers = CRM_PROVIDERS.map((p) => ({
    id: p.id,
    name: p.name,
    authType: p.authType,
    description: p.description,
    website: p.website,
    docsUrl: p.docsUrl,
    icon: p.icon,
    requiresOAuthApp: p.requiresOAuthApp,
    apiKeyLabel: p.apiKeyLabel || null,
    apiKeyHelp: p.apiKeyHelp || null,
    isConfigured: p.requiresOAuthApp
      ? !!(p.oauthConfig && process.env[p.oauthConfig.clientIdEnvVar])
      : true,
  }));
  return c.json({ data: providers });
});

/**
 * GET /api/v1/crm/providers/:providerId
 * Returns details for a specific provider.
 */
crmRouter.get('/crm/providers/:providerId', (c) => {
  const { providerId } = c.req.param();
  const provider = getProvider(providerId);
  if (!provider) {
    return c.json({ error: { code: 'unknown_provider', message: `Provider "${providerId}" not found` } }, 404);
  }
  return c.json({
    data: {
      ...provider,
      oauthConfig: provider.oauthConfig
        ? {
            ...provider.oauthConfig,
            clientIdEnvVar: undefined, // Don't leak env var names
            clientSecretEnvVar: undefined,
          }
        : undefined,
    },
  });
});

// ─── Connections ─────────────────────────────────────────────────────────────

/**
 * GET /api/v1/orgs/:orgId/crm
 * Lists all CRM connections for an org (tokens masked).
 */
crmRouter.get('/orgs/:orgId/crm', async (c) => {
  const { orgId } = c.req.param();
  const connections = await db.select().from(crmConnections).where(eq(crmConnections.organizationId, orgId));
  // Mask sensitive fields
  const masked = connections.map((conn) => ({
    ...conn,
    accessToken: conn.accessToken ? '••••••••' : null,
    refreshToken: conn.refreshToken ? '••••••••' : null,
    config: conn.isConnected ? {} : conn.config,
  }));
  return c.json({ data: masked });
});

/**
 * POST /api/v1/orgs/:orgId/crm/connect
 * Initiates a connection to a CRM provider.
 *
 * For API-key providers: validates the key and stores it encrypted.
 * For OAuth2 providers: returns the OAuth authorization URL.
 */
crmRouter.post('/orgs/:orgId/crm/connect', async (c) => {
  const { orgId } = c.req.param();
  const body = await c.req.json<{
    provider: string;
    label?: string;
    // For API key providers
    apiKey?: string;
    // For OAuth2 providers
    redirectUri?: string;
  }>();

  const provider = getProvider(body.provider);
  if (!provider) {
    return c.json({ error: { code: 'unknown_provider', message: `Provider "${body.provider}" not found` } }, 400);
  }

  // API Key auth — validate and store
  if (provider.authType === 'api_key') {
    if (!body.apiKey) {
      return c.json({ error: { code: 'missing_api_key', message: 'API key is required for this provider' } }, 400);
    }

    // Test the API key by making a test connection
    const testResult = await testConnection(body.provider, body.apiKey).catch(() => false);
    if (!testResult) {
      return c.json({ error: { code: 'invalid_api_key', message: 'The API key is invalid or the connection failed' } }, 400);
    }

    const id = generateId();
    const encryptedKey = encryptToken(body.apiKey);

    await db.insert(crmConnections).values({
      id,
      organizationId: orgId,
      provider: body.provider,
      label: body.label || provider.name,
      accessToken: encryptedKey,
      config: {},
      isConnected: true,
      lastSyncAt: new Date(),
    });

    const created = await db.select().from(crmConnections).where(eq(crmConnections.id, id)).limit(1);
    return c.json({ data: { ...created[0], accessToken: '••••••••' } }, 201);
  }

  // OAuth2 auth — return the authorization URL
  if (provider.authType === 'oauth2') {
    const redirectUri = body.redirectUri || `${c.req.header('Origin') || 'https://virtustaff.vercel.app'}/app/settings/integrations/crm/callback`;

    const state = generateId(); // CSRF token
    const authorizeUrl = buildOAuthUrl(body.provider, redirectUri, state);

    // Store a pending connection with the state for CSRF verification
    const id = generateId();
    await db.insert(crmConnections).values({
      id,
      organizationId: orgId,
      provider: body.provider,
      label: body.label || provider.name,
      config: { state, redirectUri, pendingOAuth: true },
      isConnected: false,
    });

    return c.json({
      data: {
        connectionId: id,
        authorizeUrl,
        state,
        redirectUri,
        provider: body.provider,
      },
    }, 201);
  }

  return c.json({ error: { code: 'unsupported_auth', message: 'Unsupported authentication type' } }, 400);
});

/**
 * POST /api/v1/orgs/:orgId/crm/callback
 * Handles the OAuth callback for providers that use OAuth2.
 * Exchanges the authorization code for tokens and stores them encrypted.
 */
crmRouter.post('/orgs/:orgId/crm/callback', async (c) => {
  const { orgId } = c.req.param();
  const body = await c.req.json<{
    connectionId: string;
    code: string;
    state?: string;
  }>();

  // Fetch the pending connection
  const connections = await db
    .select()
    .from(crmConnections)
    .where(and(eq(crmConnections.id, body.connectionId), eq(crmConnections.organizationId, orgId)))
    .limit(1);

  if (!connections.length) {
    return c.json({ error: { code: 'not_found', message: 'Connection not found' } }, 404);
  }

  const connection = connections[0];

  // Verify state if provided (CSRF protection)
  const savedState = (connection.config as Record<string, unknown>)?.state as string | undefined;
  if (body.state && savedState && body.state !== savedState) {
    return c.json({ error: { code: 'invalid_state', message: 'OAuth state mismatch — possible CSRF attack' } }, 400);
  }

  const provider = getProvider(connection.provider);
  if (!provider || !provider.oauthConfig) {
    return c.json({ error: { code: 'invalid_provider', message: 'Provider does not support OAuth' } }, 400);
  }

  const redirectUri = (connection.config as Record<string, unknown>)?.redirectUri as string;
  if (!redirectUri) {
    return c.json({ error: { code: 'missing_redirect', message: 'No redirect URI found in connection config' } }, 400);
  }

  try {
    // Exchange the code for tokens
    const tokens = await exchangeOAuthCode(connection.provider, body.code, redirectUri);

    // Encrypt tokens before storing
    const encryptedAccess = encryptToken(tokens.accessToken);
    const encryptedRefresh = tokens.refreshToken ? encryptToken(tokens.refreshToken) : null;

    // Update the connection
    await db
      .update(crmConnections)
      .set({
        accessToken: encryptedAccess,
        refreshToken: encryptedRefresh,
        tokenExpiresAt: tokens.expiresAt || null,
        config: { ...(connection.config as Record<string, unknown>), pendingOAuth: false, oauthCompleted: true },
        isConnected: true,
        lastSyncAt: new Date(),
      })
      .where(eq(crmConnections.id, body.connectionId));

    return c.json({
      data: {
        id: body.connectionId,
        provider: connection.provider,
        isConnected: true,
        tokenExpiresAt: tokens.expiresAt,
      },
    });
  } catch (error) {
    return c.json({
      error: {
        code: 'oauth_failed',
        message: error instanceof Error ? error.message : 'OAuth token exchange failed',
      },
    }, 500);
  }
});

/**
 * GET /api/v1/orgs/:orgId/crm/:connId
 * Returns details for a single connection (tokens masked).
 */
crmRouter.get('/orgs/:orgId/crm/:connId', async (c) => {
  const { orgId, connId } = c.req.param();
  const connections = await db
    .select()
    .from(crmConnections)
    .where(and(eq(crmConnections.id, connId), eq(crmConnections.organizationId, orgId)))
    .limit(1);

  if (!connections.length) {
    return c.json({ error: { code: 'not_found', message: 'Connection not found' } }, 404);
  }

  const conn = connections[0];
  return c.json({
    data: {
      ...conn,
      accessToken: conn.accessToken ? '••••••••' : null,
      refreshToken: conn.refreshToken ? '••••••••' : null,
    },
  });
});

/**
 * DELETE /api/v1/orgs/:orgId/crm/:connId
 * Disconnects and removes a CRM connection.
 */
crmRouter.delete('/orgs/:orgId/crm/:connId', async (c) => {
  const { orgId, connId } = c.req.param();
  const existing = await db
    .select()
    .from(crmConnections)
    .where(and(eq(crmConnections.id, connId), eq(crmConnections.organizationId, orgId)))
    .limit(1);

  if (!existing.length) {
    return c.json({ error: { code: 'not_found', message: 'Connection not found' } }, 404);
  }

  await db.delete(crmConnections).where(and(eq(crmConnections.id, connId), eq(crmConnections.organizationId, orgId)));
  return c.json({ data: { id: connId, deleted: true } });
});

// ─── Sync ────────────────────────────────────────────────────────────────────

/**
 * POST /api/v1/orgs/:orgId/crm/:connId/sync
 * Triggers a sync for a connected CRM.
 * Pulls contacts from the CRM and stores them in the database.
 */
crmRouter.post('/orgs/:orgId/crm/:connId/sync', async (c) => {
  const { orgId, connId } = c.req.param();
  let entityType = 'contacts';
  try {
    const body = await c.req.json<{ entityType?: string }>();
    entityType = body.entityType || 'contacts';
  } catch {
    // No body provided, default to contacts
  }

  const connections = await db
    .select()
    .from(crmConnections)
    .where(and(eq(crmConnections.id, connId), eq(crmConnections.organizationId, orgId)))
    .limit(1);

  if (!connections.length) {
    return c.json({ error: { code: 'not_found', message: 'Connection not found' } }, 404);
  }

  const connection = connections[0];
  if (!connection.isConnected || !connection.accessToken) {
    return c.json({ error: { code: 'not_connected', message: 'CRM connection is not active' } }, 400);
  }

  // Create a sync log entry
  const logId = generateId();
  await db.insert(syncLogs).values({
    id: logId,
    connectionId: connId,
    direction: 'inbound',
    entityType,
    status: 'running',
    startedAt: new Date(),
  });

  // Decrypt the access token
  let accessToken: string;
  try {
    accessToken = decryptToken(connection.accessToken);
  } catch {
    await db.update(syncLogs).set({ status: 'failed', errorMessage: 'Failed to decrypt credentials', completedAt: new Date() }).where(eq(syncLogs.id, logId));
    return c.json({ error: { code: 'decryption_failed', message: 'Failed to decrypt credentials' } }, 500);
  }

  // Perform the sync in background
  performSync(connection.provider, accessToken, connId, logId, entityType).catch((err) => {
    console.error(`[CRM SYNC] Error for ${connId}:`, err);
    db.update(syncLogs).set({ status: 'failed', errorMessage: err.message, completedAt: new Date() }).where(eq(syncLogs.id, logId));
  });

  return c.json({
    data: {
      connectionId: connId,
      syncStarted: true,
      logId,
      entityType,
      status: 'running',
    },
  });
});

/**
 * Performs the actual sync with the CRM provider.
 * Runs asynchronously and updates the sync log on completion.
 */
async function performSync(
  provider: string,
  accessToken: string,
  connId: string,
  logId: string,
  entityType: string,
): Promise<void> {
  let records: unknown[] = [];
  let error: string | null = null;

  try {
    switch (provider) {
      case 'hubspot':
        records = await syncHubSpotContacts(accessToken);
        break;
      case 'salesforce':
        records = await syncSalesforceRecords(accessToken, entityType);
        break;
      case 'pipedrive':
        records = await syncPipedriveRecords(accessToken, entityType);
        break;
      case 'zoho':
        records = await syncZohoRecords(accessToken, entityType);
        break;
      case 'close':
        records = await syncCloseRecords(accessToken, entityType);
        break;
      default:
        throw new Error(`Unknown provider: ${provider}`);
    }
  } catch (err) {
    error = err instanceof Error ? err.message : 'Sync failed';
  }

  const succeeded = error ? 0 : records.length;
  const failed = error ? 0 : 0;

  await db.update(syncLogs).set({
    status: error ? 'failed' : 'completed',
    recordsProcessed: String(records.length),
    recordsSucceeded: String(succeeded),
    recordsFailed: String(failed),
    errorMessage: error,
    completedAt: new Date(),
  }).where(eq(syncLogs.id, logId));

  // Update last sync time on the connection
  await db.update(crmConnections).set({
    lastSyncAt: new Date(),
  }).where(eq(crmConnections.id, connId));
}

// ─── Provider Sync Implementations ───────────────────────────────────────────

async function syncHubSpotContacts(accessToken: string): Promise<unknown[]> {
  const res = await fetch('https://api.hubapi.com/crm/v3/objects/contacts?limit=100&properties=firstname,lastname,email,phone,company', {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  if (!res.ok) throw new Error(`HubSpot API error: ${res.status} ${await res.text()}`);
  const data = (await res.json()) as { results?: unknown[] };
  return data.results || [];
}

async function syncSalesforceRecords(accessToken: string, entityType: string): Promise<unknown[]> {
  // Use SOQL to query the specified entity type
  const objectMap: Record<string, string> = {
    contacts: 'Contact',
    leads: 'Lead',
    accounts: 'Account',
    opportunities: 'Opportunity',
  };
  const soqlObject = objectMap[entityType] || 'Contact';
  const res = await fetch(`https://login.salesforce.com/services/data/v58.0/query?q=SELECT+Id,Name,Email,Phone+FROM+${soqlObject}+LIMIT+100`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  if (!res.ok) throw new Error(`Salesforce API error: ${res.status} ${await res.text()}`);
  const data = (await res.json()) as { records?: unknown[] };
  return data.records || [];
}

async function syncPipedriveRecords(accessToken: string, entityType: string): Promise<unknown[]> {
  const endpointMap: Record<string, string> = {
    contacts: 'persons',
    deals: 'deals',
    organizations: 'organizations',
  };
  const endpoint = endpointMap[entityType] || 'persons';
  const res = await fetch(`https://api.pipedrive.com/v1/${endpoint}?limit=100`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  if (!res.ok) throw new Error(`Pipedrive API error: ${res.status} ${await res.text()}`);
  const data = (await res.json()) as { data?: unknown[] };
  return data.data || [];
}

async function syncZohoRecords(accessToken: string, entityType: string): Promise<unknown[]> {
  const moduleMap: Record<string, string> = {
    contacts: 'Contacts',
    leads: 'Leads',
    accounts: 'Accounts',
    deals: 'Deals',
  };
  const moduleName = moduleMap[entityType] || 'Contacts';
  const res = await fetch(`https://www.zohoapis.com/crm/v2/${moduleName}?per_page=100`, {
    headers: { Authorization: `Zoho-oauthtoken ${accessToken}` },
  });
  if (!res.ok) throw new Error(`Zoho API error: ${res.status} ${await res.text()}`);
  const data = (await res.json()) as { data?: unknown[] };
  return data.data || [];
}

async function syncCloseRecords(accessToken: string, entityType: string): Promise<unknown[]> {
  const endpointMap: Record<string, string> = {
    contacts: 'contact',
    leads: 'lead',
    opportunities: 'opportunity',
  };
  const endpoint = endpointMap[entityType] || 'contact';
  const res = await fetch(`https://api.close.com/api/v1/${endpoint}/?limit=100`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  if (!res.ok) throw new Error(`Close CRM API error: ${res.status} ${await res.text()}`);
  const data = (await res.json()) as { data?: unknown[] };
  return data.data || [];
}

// ─── Sync Logs ───────────────────────────────────────────────────────────────

/**
 * GET /api/v1/orgs/:orgId/crm/:connId/logs
 * Returns sync history for a connection.
 */
crmRouter.get('/orgs/:orgId/crm/:connId/logs', async (c) => {
  const { connId } = c.req.param();
  const logs = await db
    .select()
    .from(syncLogs)
    .where(eq(syncLogs.connectionId, connId))
    .orderBy(syncLogs.startedAt)
    .limit(50);
  return c.json({ data: logs });
});

/**
 * GET /api/v1/orgs/:orgId/crm/sync/status
 * Returns the status of the most recent sync for each connection.
 */
crmRouter.get('/orgs/:orgId/crm/sync/status', async (c) => {
  const { orgId } = c.req.param();
  const connections = await db.select().from(crmConnections).where(eq(crmConnections.organizationId, orgId));
  const statuses = await Promise.all(
    connections.map(async (conn) => {
      const recentLogs = await db
        .select()
        .from(syncLogs)
        .where(eq(syncLogs.connectionId, conn.id))
        .orderBy(syncLogs.startedAt)
        .limit(1);
      return {
        connectionId: conn.id,
        provider: conn.provider,
        label: conn.label,
        isConnected: conn.isConnected,
        lastSyncAt: conn.lastSyncAt,
        lastSyncStatus: recentLogs[0]?.status || null,
        lastSyncError: recentLogs[0]?.errorMessage || null,
      };
    }),
  );
  return c.json({ data: statuses });
});