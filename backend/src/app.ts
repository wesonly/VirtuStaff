/**
 * VirtuStaff Platform — Hono App Setup
 */

import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { logger } from 'hono/logger';
import { secureHeaders } from 'hono/secure-headers';
import { API_PREFIX } from './config/constants.js';
import { errorHandler } from './middleware/error-handler.js';
import { healthRouter } from './modules/health.js';
import { emailRouter } from './modules/email.js';

const app = new Hono();

// Global middleware
app.use('*', logger());
app.use('*', secureHeaders());
app.use('*', cors({
  origin: process.env.CORS_ORIGIN || '*',
  credentials: true,
}));

// Global error handler
app.onError(errorHandler);

// Health check and email (unauthenticated)
app.route(`${API_PREFIX}`, healthRouter);
app.route(`${API_PREFIX}`, emailRouter);

// Import and mount route modules here as they're built:
// app.route(`${API_PREFIX}`, orgRouter);
// app.route(`${API_PREFIX}`, employeeRouter);
// app.route(`${API_PREFIX}`, taskRouter);
// app.route(`${API_PREFIX}`, workflowRouter);
// app.route(`${API_PREFIX}`, subscriptionRouter);
// app.route(`${API_PREFIX}`, crmRouter);

// 404 handler
app.notFound((c) => {
  return c.json({
    error: {
      code: 'not_found',
      message: `Route ${c.req.method} ${c.req.path} not found`,
    },
  }, 404);
});

export { app };