/**
 * VirtuStaff Platform — Health Check Module
 */

import { Hono } from 'hono';

export const healthRouter = new Hono();

healthRouter.get('/health', (c) => {
  return c.json({
    status: 'ok',
    service: 'VirtuStaff API',
    version: '0.1.0',
    timestamp: new Date().toISOString(),
    checks: {
      database: 'not_checked', // TODO: implement DB ping
      redis: 'not_checked',    // TODO: implement Redis ping
    },
  });
});