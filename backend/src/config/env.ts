/**
 * VirtuStaff Platform — Environment Configuration
 *
 * Only truly essential vars are required. All others are optional with null defaults,
 * so the server can start and serve health/checkout endpoints while integrations
 * are filled in gradually. Each integration module checks its own config before use.
 */

import { config } from 'dotenv';
config(); // Load .env before any env access

export interface Env {
  // Database (required)
  DATABASE_URL: string;

  // Auth (Clerk) — optional
  CLERK_SECRET_KEY: string | null;
  CLERK_PUBLISHABLE_KEY: string | null;
  CLERK_WEBHOOK_SECRET: string | null;

  // Stripe — only SECRET_KEY is required; prices are optional with runtime fallback
  STRIPE_SECRET_KEY: string;
  STRIPE_WEBHOOK_SECRET: string | null;
  STRIPE_PRICE_STARTER: string | null;
  STRIPE_PRICE_GROWTH: string | null;
  STRIPE_PRICE_SCALE: string | null;

  // AI Models — only Anthropic is required for the AI engine
  OPENAI_API_KEY: string | null;
  ANTHROPIC_API_KEY: string;

  // Twilio — optional, voice features degrade gracefully
  TWILIO_ACCOUNT_SID: string | null;
  TWILIO_AUTH_TOKEN: string | null;
  TWILIO_PHONE_NUMBER: string | null;

  // Encryption — optional, CRM connections degrade gracefully
  CRM_ENCRYPTION_KEY: string | null;

  // Redis — optional, BullMQ falls back to in-memory
  REDIS_URL: string | null;

  // App — all have defaults
  NODE_ENV: 'development' | 'production' | 'test';
  PORT: number;
  HOST: string;
  CORS_ORIGIN: string;
  LOG_LEVEL: 'debug' | 'info' | 'warn' | 'error';
}

function optionalEnv(key: string): string | null {
  return process.env[key] || null;
}

function requireEnv(key: string): string {
  const value = process.env[key];
  if (!value) {
    if (process.env.NODE_ENV === 'test') return 'test-' + key.toLowerCase();
    throw new Error(`Missing required environment variable: ${key}`);
  }
  return value;
}

export function loadEnv(): Env {
  return {
    // Required
    DATABASE_URL: requireEnv('DATABASE_URL'),
    STRIPE_SECRET_KEY: requireEnv('STRIPE_SECRET_KEY'),
    ANTHROPIC_API_KEY: requireEnv('ANTHROPIC_API_KEY'),

    // Optional with null defaults
    CLERK_SECRET_KEY: optionalEnv('CLERK_SECRET_KEY'),
    CLERK_PUBLISHABLE_KEY: optionalEnv('CLERK_PUBLISHABLE_KEY'),
    CLERK_WEBHOOK_SECRET: optionalEnv('CLERK_WEBHOOK_SECRET'),
    STRIPE_WEBHOOK_SECRET: optionalEnv('STRIPE_WEBHOOK_SECRET'),
    STRIPE_PRICE_STARTER: optionalEnv('STRIPE_PRICE_STARTER'),
    STRIPE_PRICE_GROWTH: optionalEnv('STRIPE_PRICE_GROWTH'),
    STRIPE_PRICE_SCALE: optionalEnv('STRIPE_PRICE_SCALE'),
    OPENAI_API_KEY: optionalEnv('OPENAI_API_KEY'),
    TWILIO_ACCOUNT_SID: optionalEnv('TWILIO_ACCOUNT_SID'),
    TWILIO_AUTH_TOKEN: optionalEnv('TWILIO_AUTH_TOKEN'),
    TWILIO_PHONE_NUMBER: optionalEnv('TWILIO_PHONE_NUMBER'),
    CRM_ENCRYPTION_KEY: optionalEnv('CRM_ENCRYPTION_KEY'),
    REDIS_URL: optionalEnv('REDIS_URL'),

    // App — all have defaults
    NODE_ENV: (process.env.NODE_ENV as Env['NODE_ENV']) || 'development',
    PORT: parseInt(process.env.PORT || '3000', 10),
    HOST: process.env.HOST || '0.0.0.0',
    CORS_ORIGIN: process.env.CORS_ORIGIN || 'http://localhost:5173',
    LOG_LEVEL: (process.env.LOG_LEVEL as Env['LOG_LEVEL']) || 'info',
  };
}

export const env = loadEnv();