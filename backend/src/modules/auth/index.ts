/**
 * VirtuStaff — Module: Auth (placeholder)
 */

import { Hono } from 'hono';

export const authRouter = new Hono();

authRouter.get('/auth/me', (c) => {
  // TODO: Return current user info from Clerk token
  return c.json({ data: { user: null } });
});

authRouter.post('/auth/invitations/accept', async (c) => {
  const body = await c.req.json();
  // TODO: Accept org invitation via Clerk
  return c.json({ data: { accepted: true, token: body.token } });
});