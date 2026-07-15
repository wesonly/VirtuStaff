/**
 * VirtuStaff Platform — Global Error Handler Middleware
 */

import type { Context } from 'hono';
import { HTTPException } from 'hono/http-exception';
import pino from 'pino';

const logger = pino({ level: process.env.LOG_LEVEL || 'info' });

export function errorHandler(err: Error, c: Context) {
  if (err instanceof HTTPException) {
    return c.json({
      error: {
        code: err.status === 401 ? 'unauthorized' : err.status === 403 ? 'forbidden' : 'error',
        message: err.message,
      },
    }, err.status);
  }

  // Log unexpected errors
  logger.error({ err, path: c.req.path, method: c.req.method }, 'Unhandled error');

  return c.json({
    error: {
      code: 'internal_server_error',
      message: process.env.NODE_ENV === 'production'
        ? 'An unexpected error occurred'
        : err.message,
    },
  }, 500);
}