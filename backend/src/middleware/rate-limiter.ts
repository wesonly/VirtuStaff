/**
 * VirtuStaff Platform — Rate Limiter Middleware (placeholder)
 */

import type { Context, Next } from 'hono';
import { HTTPException } from 'hono/http-exception';
import { RATE_LIMIT } from '../config/constants.js';

// TODO: Implement Redis-backed rate limiting with Upstash
// This is a simple in-memory placeholder

const requestCounts = new Map<string, { count: number; resetAt: number }>();

export async function rateLimiter(c: Context, next: Next) {
  const key = c.get('user')?.orgId || c.req.header('x-forwarded-for') || 'anonymous';
  const now = Date.now();
  const entry = requestCounts.get(key);

  if (entry && now < entry.resetAt) {
    entry.count++;
    if (entry.count > RATE_LIMIT.MAX_REQUESTS) {
      throw new HTTPException(429, { message: 'Rate limit exceeded' });
    }
  } else {
    requestCounts.set(key, { count: 1, resetAt: now + RATE_LIMIT.WINDOW_MS });
  }

  await next();
}