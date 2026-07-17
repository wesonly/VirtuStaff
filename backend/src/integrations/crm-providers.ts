/**
 * VirtuStaff — CRM Provider Integrations
 *
 * Defines supported CRM providers, their auth types, and connection helpers.
 * For OAuth2 providers (HubSpot, Salesforce, Zoho), the user must register
 * an OAuth app in the provider's developer portal and provide client_id/secret.
 * For API key providers (Pipedrive, Close), the user just provides their API key.
 */
import { createCipheriv, createDecipheriv, randomBytes, createHash } from 'node:crypto';

// ─── Types ───────────────────────────────────────────────────────────────────

export type CrmAuthType = 'oauth2' | 'api_key';

export interface CrmProvider {
  id: string;
  name: string;
  authType: CrmAuthType;
  description: string;
  website: string;
  docsUrl: string;
  icon: string; // emoji fallback
  requiresOAuthApp: boolean;
  oauthConfig?: {
    authorizeUrl: string;
    tokenUrl: string;
    scopes: string[];
    clientIdEnvVar: string;
    clientSecretEnvVar: string;
  };
  apiKeyLabel?: string;
  apiKeyHelp?: string;
}

export interface CrmProviderAuth {
  provider: string;
  // For OAuth2
  code?: string;
  redirectUri?: string;
  // For API key
  apiKey?: string;
  // Optional label
  label?: string;
}

export interface CrmTokenResponse {
  accessToken: string;
  refreshToken?: string;
  expiresAt?: Date;
  raw?: Record<string, unknown>;
}

// ─── Encryption ──────────────────────────────────────────────────────────────

const ALGORITHM = 'aes-256-gcm';
const KEY = process.env.CRM_ENCRYPTION_KEY || 'vtstaff-crm-key-2026-aes256-gcm-secure';

/** Derive a 32-byte key from the encryption key string */
function deriveKey(): Buffer {
  return createHash('sha256').update(KEY).digest();
}

/**
 * Encrypt a value using AES-256-GCM.
 * Returns a base64-encoded string: iv:authTag:ciphertext
 */
export function encryptToken(plaintext: string): string {
  const key = deriveKey();
  const iv = randomBytes(16);
  const cipher = createCipheriv(ALGORITHM, key, iv);
  let encrypted = cipher.update(plaintext, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  const authTag = cipher.getAuthTag().toString('hex');
  return `${iv.toString('hex')}:${authTag}:${encrypted}`;
}

/**
 * Decrypt a value encrypted with encryptToken.
 */
export function decryptToken(encrypted: string): string {
  const key = deriveKey();
  const parts = encrypted.split(':');
  if (parts.length !== 3) {
    throw new Error('Invalid encrypted token format');
  }
  const [ivHex, authTagHex, ciphertext] = parts;
  const iv = Buffer.from(ivHex, 'hex');
  const authTag = Buffer.from(authTagHex, 'hex');
  const decipher = createDecipheriv(ALGORITHM, key, iv);
  decipher.setAuthTag(authTag);
  let decrypted = decipher.update(ciphertext, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  return decrypted;
}

// ─── Provider Definitions ────────────────────────────────────────────────────

export const CRM_PROVIDERS: CrmProvider[] = [
  {
    id: 'hubspot',
    name: 'HubSpot',
    authType: 'oauth2',
    description: 'CRM, marketing, sales, and service platform',
    website: 'https://www.hubspot.com',
    docsUrl: 'https://developers.hubspot.com/docs/api/oauth-quickstart',
    icon: '🟠',
    requiresOAuthApp: true,
    oauthConfig: {
      authorizeUrl: 'https://app.hubspot.com/oauth/authorize',
      tokenUrl: 'https://api.hubapi.com/oauth/v1/token',
      scopes: ['crm.objects.contacts.read', 'crm.objects.contacts.write', 'crm.objects.companies.read', 'crm.objects.deals.read'],
      clientIdEnvVar: 'CRM_HUBSPOT_CLIENT_ID',
      clientSecretEnvVar: 'CRM_HUBSPOT_CLIENT_SECRET',
    },
  },
  {
    id: 'salesforce',
    name: 'Salesforce',
    authType: 'oauth2',
    description: 'Enterprise CRM and sales platform',
    website: 'https://www.salesforce.com',
    docsUrl: 'https://developer.salesforce.com/docs/atlas.en-us.api_rest.meta/api_rest/intro_oauth.htm',
    icon: '🔵',
    requiresOAuthApp: true,
    oauthConfig: {
      authorizeUrl: 'https://login.salesforce.com/services/oauth2/authorize',
      tokenUrl: 'https://login.salesforce.com/services/oauth2/token',
      scopes: ['api', 'id', 'refresh_token'],
      clientIdEnvVar: 'CRM_SALESFORCE_CLIENT_ID',
      clientSecretEnvVar: 'CRM_SALESFORCE_CLIENT_SECRET',
    },
  },
  {
    id: 'pipedrive',
    name: 'Pipedrive',
    authType: 'api_key',
    description: 'Sales pipeline CRM for small teams',
    website: 'https://www.pipedrive.com',
    docsUrl: 'https://developers.pipedrive.com/docs/api',
    icon: '🟢',
    requiresOAuthApp: false,
    apiKeyLabel: 'API Token',
    apiKeyHelp: 'Find your API token in Pipedrive settings > Personal preferences > API',
  },
  {
    id: 'zoho',
    name: 'Zoho CRM',
    authType: 'oauth2',
    description: 'Cloud-based CRM platform',
    website: 'https://www.zoho.com/crm',
    docsUrl: 'https://www.zoho.com/crm/developer/docs/api/auth-request.html',
    icon: '🔴',
    requiresOAuthApp: true,
    oauthConfig: {
      authorizeUrl: 'https://accounts.zoho.com/oauth/v2/auth',
      tokenUrl: 'https://accounts.zoho.com/oauth/v2/token',
      scopes: ['ZohoCRM.modules.contacts.READ', 'ZohoCRM.modules.contacts.CREATE', 'ZohoCRM.modules.leads.READ', 'ZohoCRM.modules.accounts.READ'],
      clientIdEnvVar: 'CRM_ZOHO_CLIENT_ID',
      clientSecretEnvVar: 'CRM_ZOHO_CLIENT_SECRET',
    },
  },
  {
    id: 'close',
    name: 'Close CRM',
    authType: 'api_key',
    description: 'Sales communication CRM',
    website: 'https://www.close.com',
    docsUrl: 'https://developer.close.com/',
    icon: '🟣',
    requiresOAuthApp: false,
    apiKeyLabel: 'API Key',
    apiKeyHelp: 'Find your API key in Close CRM settings > API Keys',
  },
];

/**
 * Get a provider definition by ID.
 */
export function getProvider(providerId: string): CrmProvider | undefined {
  return CRM_PROVIDERS.find((p) => p.id === providerId);
}

/**
 * Exchange an OAuth authorization code for tokens.
 * Returns the token response or throws an error.
 */
export async function exchangeOAuthCode(
  providerId: string,
  code: string,
  redirectUri: string,
): Promise<CrmTokenResponse> {
  const provider = getProvider(providerId);
  if (!provider) throw new Error(`Unknown provider: ${providerId}`);
  if (!provider.oauthConfig) throw new Error(`${provider.name} does not use OAuth`);

  const clientId = process.env[provider.oauthConfig.clientIdEnvVar];
  const clientSecret = process.env[provider.oauthConfig.clientSecretEnvVar];

  if (!clientId || !clientSecret) {
    throw new Error(
      `${provider.name} OAuth is not configured. Set ${provider.oauthConfig.clientIdEnvVar} and ${provider.oauthConfig.clientSecretEnvVar} in your environment.`,
    );
  }

  const params = new URLSearchParams({
    grant_type: 'authorization_code',
    client_id: clientId,
    client_secret: clientSecret,
    code,
    redirect_uri: redirectUri,
  });

  const response = await fetch(provider.oauthConfig.tokenUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: params.toString(),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`OAuth token exchange failed for ${provider.name}: ${response.status} ${errorText}`);
  }

  const data = (await response.json()) as Record<string, unknown>;

  const expiresIn = data.expires_in as number | undefined;
  const expiresAt = expiresIn ? new Date(Date.now() + expiresIn * 1000) : undefined;

  return {
    accessToken: data.access_token as string,
    refreshToken: data.refresh_token as string | undefined,
    expiresAt,
    raw: data,
  };
}

/**
 * Refresh an OAuth access token using a refresh token.
 */
export async function refreshOAuthToken(
  providerId: string,
  refreshToken: string,
): Promise<CrmTokenResponse> {
  const provider = getProvider(providerId);
  if (!provider) throw new Error(`Unknown provider: ${providerId}`);
  if (!provider.oauthConfig) throw new Error(`${provider.name} does not use OAuth`);

  const clientId = process.env[provider.oauthConfig.clientIdEnvVar];
  const clientSecret = process.env[provider.oauthConfig.clientSecretEnvVar];

  if (!clientId || !clientSecret) {
    throw new Error(
      `${provider.name} OAuth is not configured. Set ${provider.oauthConfig.clientIdEnvVar} and ${provider.oauthConfig.clientSecretEnvVar} in your environment.`,
    );
  }

  const params = new URLSearchParams({
    grant_type: 'refresh_token',
    client_id: clientId,
    client_secret: clientSecret,
    refresh_token: refreshToken,
  });

  const response = await fetch(provider.oauthConfig.tokenUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: params.toString(),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`OAuth token refresh failed for ${provider.name}: ${response.status} ${errorText}`);
  }

  const data = (await response.json()) as Record<string, unknown>;

  const expiresIn = data.expires_in as number | undefined;
  const expiresAt = expiresIn ? new Date(Date.now() + expiresIn * 1000) : undefined;

  return {
    accessToken: data.access_token as string,
    refreshToken: data.refresh_token as string | undefined,
    expiresAt,
    raw: data,
  };
}

/**
 * Build the OAuth authorization URL for a provider.
 * The user will be redirected to this URL to authorize the app.
 */
export function buildOAuthUrl(
  providerId: string,
  redirectUri: string,
  state: string,
): string {
  const provider = getProvider(providerId);
  if (!provider) throw new Error(`Unknown provider: ${providerId}`);
  if (!provider.oauthConfig) throw new Error(`${provider.name} does not use OAuth`);

  const clientId = process.env[provider.oauthConfig.clientIdEnvVar];
  if (!clientId) {
    throw new Error(
      `${provider.name} OAuth is not configured. Set ${provider.oauthConfig.clientIdEnvVar} in your environment.`,
    );
  }

  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: 'code',
    scope: provider.oauthConfig.scopes.join(' '),
    state,
  });

  return `${provider.oauthConfig.authorizeUrl}?${params.toString()}`;
}

/**
 * Test a CRM connection by making a simple API call.
 * Returns true if the connection is valid, throws otherwise.
 */
export async function testConnection(providerId: string, accessToken: string): Promise<boolean> {
  switch (providerId) {
    case 'hubspot': {
      const res = await fetch('https://api.hubapi.com/crm/v3/objects/contacts?limit=1', {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      return res.ok;
    }
    case 'salesforce': {
      // Salesforce needs an instance URL — try to get identity
      const res = await fetch('https://login.salesforce.com/services/oauth2/userinfo', {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      return res.ok;
    }
    case 'pipedrive': {
      const res = await fetch('https://api.pipedrive.com/v1/leads?limit=1', {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      return res.ok;
    }
    case 'zoho': {
      // Zoho needs region-specific URL — try generic accounts endpoint
      const res = await fetch('https://accounts.zoho.com/oauth/user/info', {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      return res.ok;
    }
    case 'close': {
      const res = await fetch('https://api.close.com/api/v1/me/', {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      return res.ok;
    }
    default:
      throw new Error(`Unknown provider: ${providerId}`);
  }
}