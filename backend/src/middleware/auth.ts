/**
 * VirtuStaff Platform — Authentication Middleware
 *
 * Validates Clerk JWT session tokens and extracts user + org context.
 */

import type { Context, Next } from 'hono';
import { HTTPException } from 'hono/http-exception';

// TODO: Implement proper Clerk JWT verification
// This is a placeholder for the auth middleware structure

export interface AuthUser {
  userId: string;
  orgId: string;
  role: 'admin' | 'member' | 'billing';
}

declare module 'hono' {
  interface ContextVariableMap {
    user: AuthUser;
  }
}

/**
 * Middleware: Require valid authentication
 */
export async function requireAuth(c: Context, next: Next) {
  const authHeader = c.req.header('Authorization');
  const apiKey = c.req.header('X-API-Key');

  if (!authHeader && !apiKey) {
    throw new HTTPException(401, { message: 'Missing authentication' });
  }

  // TODO: Validate Clerk JWT or API key
  // For now, extract from header and pass through

  await next();
}

/**
 * Middleware: Require specific role within the org
 */
export function requireRole(...roles: string[]) {
  return async (c: Context, next: Next) => {
    const user = c.get('user');
    if (!user || !roles.includes(user.role)) {
      throw new HTTPException(403, { message: 'Insufficient permissions' });
    }
    await next();
  };
}