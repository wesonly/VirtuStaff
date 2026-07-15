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
import { checkoutRouter } from './modules/checkout.js';
import { aiRouter } from './modules/ai-test.js';
import { orgRouter } from './modules/organizations/index.js';
import { employeeRouter } from './modules/employees/index.js';
import { taskRouter } from './modules/tasks/index.js';
import { workflowRouter } from './modules/workflows/index.js';
import { subscriptionRouter } from './modules/subscriptions/index.js';
import { crmRouter } from './modules/crm/index.js';
import { authRouter } from './modules/auth/index.js';

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

// Mount all route modules
app.route(`${API_PREFIX}`, healthRouter);
app.route(`${API_PREFIX}`, emailRouter);
app.route(`${API_PREFIX}`, checkoutRouter);
app.route(`${API_PREFIX}`, aiRouter);
app.route(`${API_PREFIX}`, orgRouter);
app.route(`${API_PREFIX}`, employeeRouter);
app.route(`${API_PREFIX}`, taskRouter);
app.route(`${API_PREFIX}`, workflowRouter);
app.route(`${API_PREFIX}`, subscriptionRouter);
app.route(`${API_PREFIX}`, crmRouter);
app.route(`${API_PREFIX}`, authRouter);

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