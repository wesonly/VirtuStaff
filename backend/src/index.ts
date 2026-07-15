/**
 * VirtuStaff Platform — Application entry point
 */

import { serve } from '@hono/node-server';
import { app } from './app.js';
import { env } from './config/env.js';
import pino from 'pino';

const logger = pino({ level: env.LOG_LEVEL });

logger.info({
  name: 'VirtuStaff',
  nodeEnv: env.NODE_ENV,
  port: env.PORT,
  host: env.HOST,
}, 'Starting server...');

serve({
  fetch: app.fetch,
  port: env.PORT,
  hostname: env.HOST,
}, (info: { address: string; port: number }) => {
  logger.info(`Server listening on http://${info.address}:${info.port}`);
});