/**
 * VirtuStaff — Base AI Agent Class
 *
 * All AI employee types extend this base class, which provides
 * shared infrastructure for LLM interaction, tool calling, and logging.
 */

import type { AIExecutionResult } from '../runtime.js';
import type { Task } from '../../shared/types.js';

export interface AgentConfig {
  model: string;
  systemPrompt: string;
  maxTokens?: number;
  temperature?: number;
  tools?: string[];
}

export abstract class BaseAgent {
  protected config: AgentConfig;

  constructor(config: AgentConfig) {
    this.config = config;
  }

  /**
   * Execute a task using this agent's configuration.
   * Each agent type implements its own execution logic.
   */
  abstract execute(task: Task): Promise<AIExecutionResult>;

  /**
   * Build the full system prompt for this agent.
   * Combines the base prompt with employee-specific personality and context.
   */
  protected buildSystemPrompt(task: Task): string {
    return [
      this.config.systemPrompt,
      task.type === 'call' ? 'You are speaking with a customer on the phone.' : '',
      task.type === 'email' ? 'You are composing a professional email.' : '',
      task.priority === 'urgent' ? 'This task is urgent and requires immediate attention.' : '',
    ].filter(Boolean).join('\n\n');
  }
}