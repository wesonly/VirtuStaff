/**
 * VirtuStaff — Lead Qualifier Agent
 *
 * Specializes in scoring and qualifying inbound leads.
 * Uses Claude Haiku (fast/cheap) for structured data extraction and scoring.
 */

import { BaseAgent, type AgentConfig } from './base.js';
import type { Task } from '../../shared/types.js';
import type { AIExecutionResult } from '../runtime.js';
import { executeTask } from '../runtime.js';

const DEFAULT_CONFIG: AgentConfig = {
  model: 'claude-haiku-4-5-20251001',
  systemPrompt: `You are an AI lead qualification specialist.
Your role is to analyze lead information and determine:
1. Lead score (1-100) based on fit and intent
2. Key qualification criteria (budget, authority, need, timeline)
3. Recommended next action (call, email, nurture, discard)
4. Extract structured data for CRM entry
Be thorough but efficient. Focus on actionable insights.`,
  temperature: 0.3,
  maxTokens: 1024,
  tools: ['crm_search_contact', 'crm_create_contact', 'crm_create_deal', 'get_lead_score'],
};

export class LeadQualifier extends BaseAgent {
  constructor(config: Partial<AgentConfig> = {}) {
    super({ ...DEFAULT_CONFIG, ...config });
  }

  async execute(task: Task): Promise<AIExecutionResult> {
    return executeTask(task);
  }

  async process(input: { message: string; contactName?: string; contactEmail?: string }): Promise<AIExecutionResult> {
    return executeTask({
      id: `lead-${Date.now()}`,
      organizationId: 'org',
      aiEmployeeId: 'agent',
      type: 'lead_qualification',
      status: 'pending',
      priority: 'normal',
      inputData: { text: input.message },
      contactName: input.contactName,
      contactEmail: input.contactEmail,
    } as Task);
  }
}