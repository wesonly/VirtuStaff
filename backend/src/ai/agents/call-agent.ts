/**
 * VirtuStaff — Call Agent
 *
 * Handles inbound and outbound phone calls.
 * Uses Claude for conversation and Twilio for telephony.
 */

import { BaseAgent, type AgentConfig } from './base.js';
import type { Task } from '../../shared/types.js';
import type { AIExecutionResult } from '../runtime.js';
import { executeTask } from '../runtime.js';

const DEFAULT_CONFIG: AgentConfig = {
  model: 'claude-3-5-sonnet-20241022',
  systemPrompt: `You are a professional AI phone agent for a business. 
Your role is to handle calls professionally, answer questions, 
qualify leads, schedule appointments, and provide information.
Keep responses concise and natural for phone conversation.
Never claim to be human. Identify yourself as an AI assistant when asked.`,
  temperature: 0.7,
  maxTokens: 1024,
  tools: ['crm_search_contact', 'calendar_check_availability', 'calendar_create_event', 'send_sms'],
};

export class CallAgent extends BaseAgent {
  constructor(config: Partial<AgentConfig> = {}) {
    super({ ...DEFAULT_CONFIG, ...config });
  }

  async execute(task: Task): Promise<AIExecutionResult> {
    return executeTask(task);
  }

  async process(input: { message: string; contactName?: string; contactPhone?: string }): Promise<AIExecutionResult> {
    return executeTask({
      id: `call-${Date.now()}`,
      organizationId: 'org',
      aiEmployeeId: 'agent',
      type: 'call',
      status: 'pending',
      priority: 'normal',
      inputData: { text: input.message },
      contactName: input.contactName,
      contactPhone: input.contactPhone,
    } as Task);
  }
}