/**
 * VirtuStaff Platform — Shared constants
 */

export const APP_NAME = 'VirtuStaff';
export const API_VERSION = 'v1';
export const API_PREFIX = `/api/${API_VERSION}`;

export const PAGINATION = {
  DEFAULT_LIMIT: 20,
  MAX_LIMIT: 100,
} as const;

export const RATE_LIMIT = {
  WINDOW_MS: 60_000, // 1 minute
  MAX_REQUESTS: 1000,
} as const;

export const AI_MODELS = {
  GPT_4O: 'gpt-4o',
  GPT_4O_MINI: 'gpt-4o-mini',
  CLAUDE_SONNET: 'claude-3-5-sonnet-20240620',
  CLAUDE_HAIKU: 'claude-3-haiku-20240307',
} as const;

export const SUBSCRIPTION_LIMITS: Record<string, { maxEmployees: number; features: string[] }> = {
  starter: {
    maxEmployees: 2,
    features: ['voice_call', 'email', 'sms', 'basic_crm'],
  },
  growth: {
    maxEmployees: 5,
    features: ['voice_call', 'email', 'sms', 'advanced_crm', 'workflows', 'priority_support'],
  },
  scale: {
    maxEmployees: -1, // unlimited
    features: ['voice_call', 'email', 'sms', 'advanced_crm', 'workflows', 'custom_integrations', 'dedicated_support'],
  },
} as const;

export const EMPLOYEE_STATUS = ['active', 'paused', 'offline'] as const;
export const TASK_STATUS = ['pending', 'processing', 'completed', 'failed', 'requires_review'] as const;
export const MEMBER_ROLES = ['admin', 'member', 'billing'] as const;