/**
 * VirtuStaff Platform — Environment Configuration
 */

import { config } from 'dotenv';
config(); // Load .env before any env access
export interface Env {
  // Database
  DATABASE_URL: string;

  // Auth (Clerk)
  CLERK_SECRET_KEY: string;
  CLERK_PUBLISHABLE_KEY: string;
  CLERK_WEBHOOK_SECRET: string;

  // Stripe
  STRIPE_SECRET_KEY: string;
  STRIPE_WEBHOOK_SECRET: string;
  STRIPE_PRICE_STARTER: string;
  STRIPE_PRICE_GROWTH: string;
  STRIPE_PRICE_SCALE: string;

  // AI Models
  OPENAI_API_KEY: string;
  ANTHROPIC_API_KEY: string;

  // Twilio
  TWILIO_ACCOUNT_SID: string;
  TWILIO_AUTH_TOKEN: string;
  TWILIO_PHONE_NUMBER: string;

  // Encryption
  CRM_ENCRYPTION_KEY: string;

  // Redis
  REDIS_URL: string;

  // App
  NODE_ENV: 'development' | 'production' | 'test';
  PORT: number;
  HOST: string;
  CORS_ORIGIN: string;
  LOG_LEVEL: 'debug' | 'info' | 'warn' | 'error';
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
    DATABASE_URL: requireEnv('DATABASE_URL'),
    CLERK_SECRET_KEY: requireEnv('CLERK_SECRET_KEY'),
    CLERK_PUBLISHABLE_KEY: requireEnv('CLERK_PUBLISHABLE_KEY'),
    CLERK_WEBHOOK_SECRET: requireEnv('CLERK_WEBHOOK_SECRET'),
    STRIPE_SECRET_KEY: requireEnv('STRIPE_SECRET_KEY'),
    STRIPE_WEBHOOK_SECRET: requireEnv('STRIPE_WEBHOOK_SECRET'),
    STRIPE_PRICE_STARTER: requireEnv('STRIPE_PRICE_STARTER'),
    STRIPE_PRICE_GROWTH: requireEnv('STRIPE_PRICE_GROWTH'),
    STRIPE_PRICE_SCALE: requireEnv('STRIPE_PRICE_SCALE'),
    OPENAI_API_KEY: requireEnv('OPENAI_API_KEY'),
    ANTHROPIC_API_KEY: requireEnv('ANTHROPIC_API_KEY'),
    TWILIO_ACCOUNT_SID: requireEnv('TWILIO_ACCOUNT_SID'),
    TWILIO_AUTH_TOKEN: requireEnv('TWILIO_AUTH_TOKEN'),
    TWILIO_PHONE_NUMBER: requireEnv('TWILIO_PHONE_NUMBER'),
    CRM_ENCRYPTION_KEY: requireEnv('CRM_ENCRYPTION_KEY'),
    REDIS_URL: requireEnv('REDIS_URL'),
    NODE_ENV: (process.env.NODE_ENV as Env['NODE_ENV']) || 'development',
    PORT: parseInt(process.env.PORT || '3000', 10),
    HOST: process.env.HOST || '0.0.0.0',
    CORS_ORIGIN: process.env.CORS_ORIGIN || 'http://localhost:5173',
    LOG_LEVEL: (process.env.LOG_LEVEL as Env['LOG_LEVEL']) || 'info',
  };
}

export const env = loadEnv();