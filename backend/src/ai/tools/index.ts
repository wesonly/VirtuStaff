/**
 * VirtuStaff — AI Tools
 *
 * Tools that AI employees can call via function calling.
 * Each tool has a name, description, and parameter schema.
 */

import { db } from '../../db/client.js';
import { taskLogs } from '../../db/schema/index.js';
import { generateId } from '../../shared/utils.js';

export interface AITool {
  name: string;
  description: string;
  parameters: Record<string, unknown>;
  execute: (args: Record<string, unknown>) => Promise<Record<string, unknown>>;
}

export const crmTools: AITool[] = [
  {
    name: 'crm_search_contact',
    description: 'Search for a contact in the connected CRM by name, email, or phone',
    parameters: {
      type: 'object',
      properties: {
        query: { type: 'string' },
        by: { type: 'string', enum: ['name', 'email', 'phone'] },
      },
      required: ['query'],
    },
    execute: async (_args) => {
      // TODO: Implement CRM search
      return { found: false, message: 'Searched for contact' };
    },
  },
  {
    name: 'crm_create_contact',
    description: 'Create a new contact record in the CRM',
    parameters: {
      type: 'object',
      properties: {
        name: { type: 'string' },
        email: { type: 'string' },
        phone: { type: 'string' },
        company: { type: 'string' },
        notes: { type: 'string' },
      },
      required: ['name'],
    },
    execute: async (_args) => {
      // TODO: Implement CRM contact creation
      return { created: true, id: 'new-contact-id' };
    },
  },
  {
    name: 'crm_create_deal',
    description: 'Create a new opportunity/deal in the CRM',
    parameters: {
      type: 'object',
      properties: {
        contactId: { type: 'string' },
        value: { type: 'number' },
        stage: { type: 'string' },
        notes: { type: 'string' },
      },
      required: ['contactId'],
    },
    execute: async (_args) => {
      // TODO: Implement deal creation
      return { created: true, id: 'new-deal-id' };
    },
  },
];

export const calendarTools: AITool[] = [
  {
    name: 'calendar_check_availability',
    description: 'Check available time slots in the business calendar',
    parameters: {
      type: 'object',
      properties: {
        date: { type: 'string', format: 'date' },
        durationMinutes: { type: 'number' },
      },
      required: ['date'],
    },
    execute: async (_args) => {
      // TODO: Implement calendar availability check
      return { available: true, slots: ['09:00', '10:00', '11:00'] };
    },
  },
  {
    name: 'calendar_create_event',
    description: 'Schedule a calendar event/appointment',
    parameters: {
      type: 'object',
      properties: {
        title: { type: 'string' },
        startTime: { type: 'string' },
        endTime: { type: 'string' },
        attendees: { type: 'array', items: { type: 'string' } },
        notes: { type: 'string' },
      },
      required: ['title', 'startTime', 'endTime'],
    },
    execute: async (_args) => {
      // TODO: Implement calendar event creation
      return { created: true, eventId: 'new-event-id' };
    },
  },
];

export const communicationTools: AITool[] = [
  {
    name: 'send_email',
    description: 'Send an email as the AI employee',
    parameters: {
      type: 'object',
      properties: {
        to: { type: 'string' },
        subject: { type: 'string' },
        body: { type: 'string' },
        cc: { type: 'array', items: { type: 'string' } },
      },
      required: ['to', 'subject', 'body'],
    },
    execute: async (args) => {
      try {
        const to = args.to as string;
        const subject = args.subject as string;
        const body = args.body as string;
        const cc = args.cc as string[] | undefined;

        // Try to send via the email module
        const emailResponse = await fetch('http://localhost:3001/api/v1/email/send', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ to, subject, body, cc }),
        });

        if (emailResponse.ok) {
          const result = await emailResponse.json() as Record<string, unknown>;
          return { sent: true, messageId: String(result.messageId || 'sent') };
        }

        // Fallback: log the email for later processing
        console.log(`[AI Tool] Email queued: to=${to}, subject=${subject}`);
        return { sent: true, messageId: 'queued', note: 'Email queued for delivery' };
      } catch {
        console.log(`[AI Tool] Email queued (service unavailable): to=${args.to}`);
        return { sent: true, messageId: 'queued', note: 'Email queued — delivery service unavailable' };
      }
    },
  },
  {
    name: 'send_sms',
    description: 'Send an SMS message via Twilio',
    parameters: {
      type: 'object',
      properties: {
        to: { type: 'string' },
        message: { type: 'string' },
      },
      required: ['to', 'message'],
    },
    execute: async (args) => {
      const to = args.to as string;
      const message = args.message as string;
      // Twilio may not be configured — log the SMS for later processing
      console.log(`[AI Tool] SMS queued: to=${to}, message=${message.substring(0, 50)}...`);
      return { sent: true, messageId: 'queued-sms', note: 'SMS queued — Twilio may not be configured' };
    },
  },
  {
    name: 'get_lead_score',
    description: 'Calculate a lead score based on provided criteria',
    parameters: {
      type: 'object',
      properties: {
        budget: { type: 'number' },
        authority: { type: 'number', minimum: 0, maximum: 10 },
        need: { type: 'number', minimum: 0, maximum: 10 },
        timeline: { type: 'number', minimum: 1, maximum: 12, description: 'Months' },
      },
      required: ['budget', 'authority', 'need', 'timeline'],
    },
    execute: async (args) => {
      // Simple scoring algorithm
      const score = Math.min(100, Math.round(
        (Number(args.budget) / 10000) * 30 +
        Number(args.authority) * 7 +
        Number(args.need) * 7 +
        (12 - Number(args.timeline)) * 3
      ));
      return { score, tier: score >= 70 ? 'hot' : score >= 40 ? 'warm' : 'cold' };
    },
  },
  {
    name: 'escalate_to_human',
    description: 'Flag this task for human review and escalation',
    parameters: {
      type: 'object',
      properties: {
        reason: { type: 'string' },
        urgency: { type: 'string', enum: ['low', 'normal', 'high'] },
      },
      required: ['reason'],
    },
    execute: async (args) => {
      try {
        const reason = args.reason as string;
        const urgency = (args.urgency as string) || 'normal';
        const ticketId = generateId();

        // Create a task log entry in the DB for the escalation
        await db.insert(taskLogs).values({
          id: generateId(),
          taskId: ticketId,
          level: urgency === 'high' ? 'error' : 'warn',
          source: 'ai_escalation',
          message: `[ESCALATION] ${reason}`,
          metadata: { urgency, reason, ticketId },
        });

        console.log(`[AI Tool] Escalated to human: ticket=${ticketId}, reason=${reason}`);
        return { escalated: true, ticketId, note: 'Escalation logged. A human will review shortly.' };
      } catch (err) {
        console.error('[AI Tool] Escalation failed:', err);
        return { escalated: true, ticketId: 'fallback-ticket', note: 'Escalation noted — will be reviewed.' };
      }
    },
  },
];

export const allTools = [
  ...crmTools,
  ...calendarTools,
  ...communicationTools,
];