/**
 * VirtuStaff — Email Agent
 *
 * Handles email composition, responses, and follow-ups.
 * Uses Claude for content generation and email sending.
 */

import { BaseAgent, type AgentConfig } from './base.js';
import type { Task } from '../../shared/types.js';
import type { AIExecutionResult } from '../runtime.js';
import { executeTask } from '../runtime.js';

const DEFAULT_CONFIG: AgentConfig = {
  model: 'claude-sonnet-4-20250515',
  systemPrompt: `You are a professional AI email assistant for a business.
Your role is to compose clear, professional emails that represent the business well.
Adapt tone based on context: formal for prospects, warm for existing customers.
Include proper signatures and formatting.
Never claim to be human. Identify yourself as an AI assistant when asked.`,
  temperature: 0.5,
  maxTokens: 2048,
  tools: ['crm_search_contact', 'send_email', 'calendar_create_event'],
};

export class EmailAgent extends BaseAgent {
  constructor(config: Partial<AgentConfig> = {}) {
    super({ ...DEFAULT_CONFIG, ...config });
  }

  async execute(task: Task): Promise<AIExecutionResult> {
    return executeTask(task);
  }

  async process(input: { message: string; contactName?: string; contactEmail?: string }): Promise<AIExecutionResult> {
    return executeTask({
      id: `email-${Date.now()}`,
      organizationId: 'org',
      aiEmployeeId: 'agent',
      type: 'email',
      status: 'pending',
      priority: 'normal',
      inputData: { text: input.message },
      contactName: input.contactName,
      contactEmail: input.contactEmail,
    } as Task);
  }
}