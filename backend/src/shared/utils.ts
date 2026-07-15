/**
 * VirtuStaff Platform — Shared utilities
 */

import { v4 as uuidv4 } from 'uuid';
import { createHash } from 'node:crypto';

/**
 * Generate a UUID v4
 */
export function generateId(): string {
  return uuidv4();
}

/**
 * Hash an API key for storage (SHA-256)
 */
export function hashApiKey(key: string): string {
  return createHash('sha256').update(key).digest('hex');
}

/**
 * Generate an API key with a prefix
 */
export function generateApiKey(orgId: string): { key: string; prefix: string; hash: string } {
  const raw = `vs_${orgId.slice(0, 8)}_${uuidv4().replace(/-/g, '')}${uuidv4().replace(/-/g, '')}`;
  return {
    key: raw,
    prefix: raw.slice(0, 10),
    hash: hashApiKey(raw),
  };
}

/**
 * Simple delay for retry logic
 */
export function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Truncate a string to a max length
 */
export function truncate(str: string, maxLength: number): string {
  if (str.length <= maxLength) return str;
  return str.slice(0, maxLength - 3) + '...';
}