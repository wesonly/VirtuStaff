/**
 * VirtuStaff — Anthropic Integration (placeholder)
 */

import Anthropic from '@anthropic-ai/sdk';

let anthropicClient: Anthropic | null = null;

export function getAnthropicClient(): Anthropic {
  if (!anthropicClient) {
    const key = process.env.ANTHROPIC_API_KEY;
    if (!key) throw new Error('ANTHROPIC_API_KEY not configured');
    anthropicClient = new Anthropic({ apiKey: key });
  }
  return anthropicClient;
}

/**
 * Call Claude with a prompt
 */
export async function callClaude(params: {
  model: string;
  systemPrompt: string;
  messages: Array<{ role: 'user' | 'assistant'; content: string }>;
  maxTokens?: number;
}) {
  const anthropic = getAnthropicClient();
  // TODO: Implement tool use with Claude
  return anthropic.messages.create({
    model: params.model,
    system: params.systemPrompt,
    messages: params.messages,
    max_tokens: params.maxTokens ?? 2048,
  });
}