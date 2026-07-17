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

    // Check if Anthropic key is configured
    if (!process.env.ANTHROPIC_API_KEY) {
      return c.json({
        success: false,
        error: 'ANTHROPIC_API_KEY not configured. AI features require a valid API key.',
        hint: 'Set ANTHROPIC_API_KEY in your .env file or environment variables.',
      }, 503);
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
    const message = error instanceof Error ? error.message : 'Unknown error';
    // Provide clearer error messages for common failures
    if (message.includes('not_found_error') || message.includes('model')) {
      return c.json({
        success: false,
        error: `AI model error: ${message}`,
        hint: 'The model name may be incorrect or unavailable. Check model IDs at console.anthropic.com.',
      }, 500);
    }
    if (message.includes('rate') || message.includes('quota') || message.includes('credit')) {
      return c.json({
        success: false,
        error: `API rate limit or credits exhausted: ${message}`,
        hint: 'Add credits at console.anthropic.com/settings/plans.',
      }, 429);
    }
    return c.json({
      success: false,
      error: message,
    }, 500);
  }
});