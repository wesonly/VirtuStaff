/**
 * VirtuStaff — AI Test Endpoint
 *
 * POST /api/v1/ai/test — Accepts a message and returns a Claude response.
 * Used to verify the Anthropic integration works end-to-end.
 */

import { Hono } from 'hono';
import { chat } from '../integrations/anthropic.js';
import { executeTask } from '../ai/runtime.js';

export const aiRouter = new Hono();

aiRouter.post('/ai/test', async (c) => {
  try {
    const { message, mode } = await c.req.json();

    if (!message) {
      return c.json({ error: { code: 'missing_message', message: 'message is required' } }, 400);
    }

    if (mode === 'task') {
      // Test with a simulated task
      const result = await executeTask({
        id: 'test-task',
        organizationId: 'test-org',
        aiEmployeeId: 'test-employee',
        type: 'email',
        status: 'pending',
        priority: 'normal',
        inputData: { text: message },
        contactName: 'Test User',
        contactEmail: 'test@example.com',
      } as any);
      return c.json({ success: true, result });
    }

    // Simple chat mode
    const response = await chat({
      systemPrompt: 'You are a helpful AI assistant for VirtuStaff, an AI workforce platform. Answer questions concisely and professionally.',
      message,
    });

    return c.json({ success: true, response });
  } catch (error) {
    return c.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    }, 500);
  }
});