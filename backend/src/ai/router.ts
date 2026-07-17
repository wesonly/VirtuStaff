/**
 * VirtuStaff AI Engine — Task Routing
 *
 * Routes incoming tasks to the appropriate AI employee model based on task type.
 */

import type { Task } from '../shared/types.js';

export interface RoutingDecision {
  taskId: string;
  employeeId: string;
  workflowId?: string;
  model: string;
  priority: 'low' | 'normal' | 'high' | 'urgent';
}

// Maps task types to the best Claude model for the job
const MODEL_MAP: Record<string, string> = {
  call: 'claude-sonnet-4-5-20250929',
  email: 'claude-sonnet-4-5-20250929',
  sms: 'claude-3-5-haiku-20241022',
  lead_qualification: 'claude-3-5-haiku-20241022',
  qualification: 'claude-3-5-haiku-20241022',
  chat: 'claude-sonnet-4-5-20250929',
  scheduling: 'claude-sonnet-4-5-20250929',
  appointment: 'claude-sonnet-4-5-20250929',
  marketing: 'claude-sonnet-4-5-20250929',
  content: 'claude-sonnet-4-5-20250929',
  analysis: 'claude-3-5-haiku-20241022',
  report: 'claude-sonnet-4-5-20250929',
  default: 'claude-sonnet-4-5-20250929',
};

/**
 * Route an inbound task to the appropriate AI employee and model.
 */
export async function routeTask(task: Task): Promise<RoutingDecision> {
  const model = MODEL_MAP[task.type] || MODEL_MAP.default;

  return {
    taskId: task.id,
    employeeId: task.aiEmployeeId,
    priority: task.priority || 'normal',
    model,
  };
}