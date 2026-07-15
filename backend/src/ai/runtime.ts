/**
 * VirtuStaff AI Engine — Runtime
 *
 * Core execution engine that orchestrates AI employee task processing.
 * Manages the LLM call lifecycle: context building, tool execution, output handling.
 */

import { callClaude } from '../integrations/anthropic.js';
import { allTools, type AITool } from './tools/index.js';
import type { Task } from '../shared/types.js';
import pino from 'pino';

const logger = pino({ level: process.env.LOG_LEVEL || 'info' });

export interface AIExecutionResult {
  success: boolean;
  output?: Record<string, unknown>;
  response?: string;
  summary?: string;
  error?: string;
  durationMs: number;
  usage?: { inputTokens: number; outputTokens: number };
}

/**
 * Execute an AI employee task using Claude.
 *
 * 1. Builds system prompt from employee configuration
 * 2. Loads relevant tools
 * 3. Calls Claude with the conversation
 * 4. Processes any tool calls
 * 5. Returns structured output
 */
export async function executeTask(task: Task): Promise<AIExecutionResult> {
  const startTime = Date.now();
  logger.info({ taskId: task.id, type: task.type }, 'Executing task');

  try {
    // Step 1: Build system prompt
    const systemPrompt = buildSystemPrompt(task);

    // Step 2: Select tools based on task type
    const tools = selectTools(task.type);

    // Step 3: Build the conversation
    const messages = buildMessages(task);

    // Step 4: Call Claude
    const model = selectModel(task.type);
    const response = await callClaude({
      model,
      systemPrompt,
      messages,
      tools: tools.map(t => ({
        name: t.name,
        description: t.description,
        input_schema: t.parameters as Record<string, unknown>,
      })),
      temperature: 0.7,
      maxTokens: 2048,
    });

    // Step 5: Process any tool calls
    let output = response.content;
    let toolResults: Record<string, unknown> = {};

    if (response.toolCalls) {
      for (const toolCall of response.toolCalls) {
        const tool = allTools.find(t => t.name === toolCall.name);
        if (tool) {
          logger.info({ tool: toolCall.name, input: toolCall.input }, 'Executing tool');
          toolResults[toolCall.name] = await tool.execute(toolCall.input);
        }
      }

      // After tool calls, get final response from Claude
      const followUpMessages = [
        ...messages,
        {
          role: 'assistant' as const,
          content: response.toolCalls.map(tc => ({
            type: 'tool_use' as const,
            id: tc.id,
            name: tc.name,
            input: tc.input,
          })),
        },
        {
          role: 'user' as const,
          content: `Tool results: ${JSON.stringify(toolResults)}\n\nBased on these results, provide your final response.`,
        },
      ];

      const followUp = await callClaude({
        model,
        systemPrompt,
        messages: followUpMessages,
        temperature: 0.7,
        maxTokens: 1024,
      });

      output = followUp.content;
    }

    const result: AIExecutionResult = {
      success: true,
      response: output,
      output: { processed: true, toolResults },
      summary: truncate(output, 200),
      durationMs: Date.now() - startTime,
      usage: response.usage,
    };

    logger.info({ taskId: task.id, durationMs: result.durationMs }, 'Task completed');
    return result;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    logger.error({ taskId: task.id, error: errorMessage }, 'Task execution failed');
    return {
      success: false,
      error: errorMessage,
      durationMs: Date.now() - startTime,
    };
  }
}

/**
 * Build the system prompt for a task based on type and configuration.
 */
function buildSystemPrompt(task: Task): string {
  const prompts: Record<string, string> = {
    call: `You are a professional AI phone agent for a business.
Keep responses concise and natural for phone conversation.
Never claim to be human. Identify yourself as an AI assistant when asked.
Focus on: answering questions, qualifying leads, scheduling appointments.`,

    email: `You are a professional AI email assistant.
Compose clear, professional emails. Adapt tone based on context.
Include proper signatures and formatting.
Never claim to be human. Identify yourself as an AI assistant when asked.`,

    lead_qualification: `You are an AI lead qualification specialist.
Analyze lead information and determine:
1. Lead score (1-100) based on fit and intent
2. Key qualification criteria (budget, authority, need, timeline)
3. Recommended next action (call, email, nurture, discard)
Be thorough but efficient. Focus on actionable insights.`,

    sms: `You are an AI SMS assistant.
Keep messages short and conversational (under 160 chars when possible).
Be friendly and professional. Never claim to be human.`,
  };

  const basePrompt = prompts[task.type] ?? `You are an AI employee for a business.
Handle the following task professionally and efficiently.
Never claim to be human. Identify yourself as an AI assistant when asked.`;

  const parts = [basePrompt];

  if (task.priority === 'urgent') {
    parts.push('\nThis task is URGENT. Prioritize speed and clarity.');
  }

  if (task.contactName) {
    parts.push(`\nContact: ${task.contactName}`);
  }

  return parts.join('\n');
}

/**
 * Select the appropriate model for the task type.
 */
function selectModel(type: string): string {
  const models: Record<string, string> = {
    call: 'claude-3-5-sonnet-20241022',
    email: 'claude-3-5-sonnet-20241022',
    lead_qualification: 'claude-3-5-haiku-20241022',
    sms: 'claude-3-5-haiku-20241022',
  };
  return models[type] ?? 'claude-3-5-sonnet-20241022';
}

/**
 * Select tools for a given task type.
 */
function selectTools(type: string): AITool[] {
  const crm = allTools.filter(t => t.name.startsWith('crm_'));
  const calendar = allTools.filter(t => t.name.startsWith('calendar_'));
  const comm = allTools.filter(t => ['send_email', 'send_sms'].includes(t.name));
  const lead = allTools.filter(t => t.name === 'get_lead_score');
  const escalate = allTools.filter(t => t.name === 'escalate_to_human');

  switch (type) {
    case 'call':
      return [...crm, ...calendar, ...comm, ...escalate];
    case 'email':
      return [...crm, ...comm, ...calendar];
    case 'lead_qualification':
      return [...crm, ...lead, ...escalate];
    case 'sms':
      return [...comm, ...crm];
    default:
      return [...crm, ...comm, ...escalate];
  }
}

/**
 * Build conversation messages from task data.
 */
function buildMessages(task: Task): Array<{ role: 'user' | 'assistant'; content: string }> {
  const inputText = task.inputData?.text || task.inputData?.message || task.inputData?.transcript || JSON.stringify(task.inputData);
  const messages: Array<{ role: 'user' | 'assistant'; content: string }> = [];

  if (inputText) {
    messages.push({ role: 'user', content: String(inputText) });
  }

  return messages;
}

function truncate(str: string, maxLength: number): string {
  if (str.length <= maxLength) return str;
  return str.slice(0, maxLength - 3) + '...';
}