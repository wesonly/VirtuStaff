/**
 * VirtuStaff — Anthropic Claude Integration
 *
 * Provides Claude API access with tool/function calling, retry logic,
 * and error handling for the AI employee engine.
 */

import Anthropic from '@anthropic-ai/sdk';
import pino from 'pino';

const logger = pino({ level: process.env.LOG_LEVEL || 'info' });

let anthropicClient: Anthropic | null = null;

export function getAnthropicClient(): Anthropic {
  if (!anthropicClient) {
    const key = process.env.ANTHROPIC_API_KEY;
    if (!key) throw new Error('ANTHROPIC_API_KEY not configured');
    anthropicClient = new Anthropic({ apiKey: key });
  }
  return anthropicClient;
}

export interface ToolDefinition {
  name: string;
  description: string;
  input_schema: Record<string, unknown>;
}

export interface ClaudeMessage {
  role: 'user' | 'assistant';
  content: string | Array<Record<string, unknown>>;
}

export interface ClaudeCallParams {
  model: string;
  systemPrompt: string;
  messages: ClaudeMessage[];
  maxTokens?: number;
  temperature?: number;
  tools?: ToolDefinition[];
}

export interface ClaudeResponse {
  content: string;
  toolCalls?: Array<{
    name: string;
    input: Record<string, unknown>;
    id: string;
  }>;
  usage?: {
    inputTokens: number;
    outputTokens: number;
  };
  finishReason: string;
}

/**
 * Call Claude with messages, system prompt, and optional tool definitions.
 * Implements retry logic with exponential backoff.
 */
export async function callClaude(params: ClaudeCallParams): Promise<ClaudeResponse> {
  const anthropic = getAnthropicClient();
  const maxRetries = 3;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const response = await anthropic.messages.create({
        model: params.model,
        system: params.systemPrompt,
        messages: params.messages.map(m => ({
          role: m.role,
          content: typeof m.content === 'string' ? m.content : m.content,
        })) as Anthropic.MessageParam[],
        max_tokens: params.maxTokens ?? 2048,
        temperature: params.temperature ?? 0.7,
        tools: params.tools as Anthropic.Tool[] | undefined,
      });

      // Extract text content
      const textContent = response.content
        .filter((block) => block.type === 'text')
        .map((block) => (block as Anthropic.TextBlock).text)
        .join('\n');

      // Extract tool calls
      const toolCalls = response.content
        .filter((block) => block.type === 'tool_use')
        .map((block) => {
          const tb = block as Anthropic.ToolUseBlock;
          return {
            name: tb.name,
            input: tb.input as Record<string, unknown>,
            id: tb.id,
          };
        });

      return {
        content: textContent,
        toolCalls: toolCalls.length > 0 ? toolCalls : undefined,
        usage: {
          inputTokens: response.usage?.input_tokens ?? 0,
          outputTokens: response.usage?.output_tokens ?? 0,
        },
        finishReason: response.stop_reason ?? 'end_turn',
      };
    } catch (error) {
      const isRateLimit = error instanceof Error && (
        error.message.includes('rate_limit') ||
        error.message.includes('429')
      );

      if (attempt < maxRetries && isRateLimit) {
        const delay = Math.pow(2, attempt) * 1000;
        logger.warn({ attempt, delay }, 'Claude rate limited, retrying...');
        await new Promise((resolve) => setTimeout(resolve, delay));
        continue;
      }

      logger.error({ attempt, error }, 'Claude API call failed');
      throw error;
    }
  }

  throw new Error('Max retries exceeded');
}

/**
 * Quick chat helper for simple prompts (no tools).
 */
export async function chat(params: {
  systemPrompt?: string;
  message: string;
  model?: string;
}): Promise<string> {
  const response = await callClaude({
    model: params.model ?? 'claude-sonnet-4-5-20250929',
    systemPrompt: params.systemPrompt ?? 'You are a helpful AI assistant.',
    messages: [{ role: 'user', content: params.message }],
  });
  return response.content;
}