/**
 * VirtuStaff Platform — Shared type definitions
 */

import type { MEMBER_ROLES, TASK_STATUS } from '../config/constants.js';

// ─── ID Types ────────────────────────────────────────────
export type OrgId = string;
export type UserId = string;
export type EmployeeId = string;
export type TaskId = string;
export type WorkflowId = string;
export type SubscriptionId = string;
export type CrmConnectionId = string;

// ─── Organization ────────────────────────────────────────
export interface Organization {
  id: OrgId;
  name: string;
  slug: string;
  logoUrl?: string;
  size: 'small' | 'medium' | 'large';
  timezone: string;
  createdAt: Date;
  updatedAt: Date;
}

// ─── User ────────────────────────────────────────────────
export interface User {
  id: UserId;
  clerkId: string;
  email: string;
  firstName?: string;
  lastName?: string;
  avatarUrl?: string;
  phone?: string;
  defaultOrgId?: OrgId;
}

// ─── Organization Members ────────────────────────────────
export type MemberRole = (typeof MEMBER_ROLES)[number];

export interface OrganizationMember {
  id: string;
  organizationId: OrgId;
  userId: UserId;
  role: MemberRole;
  joinedAt: Date;
}

// ─── Subscription ────────────────────────────────────────
export interface SubscriptionPlan {
  id: string;
  stripePriceId: string;
  name: string;
  slug: string;
  description?: string;
  priceCents: number;
  currency: string;
  interval: 'month' | 'year';
  maxAiEmployees: number;
  features: string[];
  isActive: boolean;
}

export interface Subscription {
  id: SubscriptionId;
  organizationId: OrgId;
  planId: string;
  stripeSubscriptionId?: string;
  stripeCustomerId?: string;
  status: 'active' | 'past_due' | 'canceled' | 'trialing';
  currentPeriodStart?: Date;
  currentPeriodEnd?: Date;
  trialEnd?: Date;
  canceledAt?: Date;
}

// ─── AI Employee ─────────────────────────────────────────
export type EmployeeStatus = 'active' | 'paused' | 'offline';

export interface AIEmployeeType {
  id: string;
  name: string;
  slug: string;
  description?: string;
  capabilities: string[];
  icon?: string;
  configSchema?: Record<string, unknown>;
  isActive: boolean;
}

export interface AIEmployee {
  id: EmployeeId;
  organizationId: OrgId;
  typeId: string;
  name: string;
  assignedTo?: UserId;
  phoneNumber?: string;
  emailAddress?: string;
  personality?: string;
  capabilities?: string[];
  config: Record<string, unknown>;
  status: EmployeeStatus;
  avatarUrl?: string;
  totalTasks: number;
  successfulTasks: number;
  lastActiveAt?: Date;
}

// ─── Tasks ───────────────────────────────────────────────
export type TaskStatus = (typeof TASK_STATUS)[number];

export interface Task {
  id: TaskId;
  organizationId: OrgId;
  aiEmployeeId: EmployeeId;
  workflowId?: WorkflowId;
  type: string;
  status: TaskStatus;
  priority: 'low' | 'normal' | 'high' | 'urgent';
  inputData: Record<string, unknown>;
  outputData?: Record<string, unknown>;
  result?: string;
  contactName?: string;
  contactPhone?: string;
  contactEmail?: string;
  scheduledAt?: Date;
  startedAt?: Date;
  completedAt?: Date;
  durationSeconds?: number;
  errorMessage?: string;
}

export interface TaskLog {
  id: string;
  taskId: TaskId;
  level: 'debug' | 'info' | 'warn' | 'error';
  source?: string;
  message: string;
  metadata?: Record<string, unknown>;
  createdAt: Date;
}

// ─── Workflows ───────────────────────────────────────────
export interface Workflow {
  id: WorkflowId;
  organizationId: OrgId;
  name: string;
  description?: string;
  triggerType: string;
  triggerConfig: Record<string, unknown>;
  steps: WorkflowStep[];
  isActive: boolean;
}

export interface WorkflowStep {
  id: string;
  type: string;
  config: Record<string, unknown>;
  next?: string; // ID of next step
}

// ─── CRM ─────────────────────────────────────────────────
export interface CrmConnection {
  id: CrmConnectionId;
  organizationId: OrgId;
  provider: string;
  label?: string;
  config: Record<string, unknown>;
  isConnected: boolean;
  lastSyncAt?: Date;
}

export interface SyncLog {
  id: string;
  connectionId: CrmConnectionId;
  direction: 'inbound' | 'outbound';
  entityType: string;
  recordsProcessed: number;
  recordsSucceeded: number;
  recordsFailed: number;
  status: 'running' | 'completed' | 'failed';
  errorMessage?: string;
  startedAt?: Date;
  completedAt?: Date;
}

// ─── API ─────────────────────────────────────────────────
export interface PaginatedResponse<T> {
  data: T[];
  nextCursor?: string;
  total?: number;
}

export interface ApiError {
  error: {
    code: string;
    message: string;
    details?: Record<string, unknown>;
  };
}

export interface CursorQuery {
  cursor?: string;
  limit?: number;
}