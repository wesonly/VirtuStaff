export interface DashboardStats {
  activeEmployees: number;
  tasksCompleted: number;
  leadsCaptured: number;
  callsHandled: number;
}

export interface ActivityItem {
  id: string;
  type: "lead" | "call" | "email" | "task" | "report" | "integration";
  description: string;
  timestamp: string;
  employeeName?: string;
}

export interface AIEmployee {
  id: string;
  name: string;
  type: string;
  typeIcon: string;
  status: "active" | "paused" | "offline";
  tasksCompleted: number;
  hiredDate: string;
  avatar: string;
}

export const stats: DashboardStats = {
  activeEmployees: 4,
  tasksCompleted: 1287,
  leadsCaptured: 342,
  callsHandled: 891,
};

export const recentActivity: ActivityItem[] = [
  { id: "1", type: "lead", description: "New lead qualified: Sarah Johnson (Home Services)", timestamp: "2 min ago", employeeName: "Alex" },
  { id: "2", type: "call", description: "Inbound call handled - appointment booked", timestamp: "15 min ago", employeeName: "Sophia" },
  { id: "3", type: "email", description: "Follow-up email sent to 5 prospects", timestamp: "1 hr ago", employeeName: "Marcus" },
  { id: "4", type: "report", description: "Weekly performance report generated", timestamp: "2 hr ago", employeeName: "Elena" },
  { id: "5", type: "task", description: "CRM sync completed - 23 contacts updated", timestamp: "3 hr ago", employeeName: "Jasper" },
  { id: "6", type: "lead", description: "New lead: David Kim (Interested in Growth plan)", timestamp: "4 hr ago", employeeName: "Alex" },
  { id: "7", type: "call", description: "Customer support call - issue resolved", timestamp: "5 hr ago", employeeName: "Sophia" },
  { id: "8", type: "integration", description: "HubSpot integration connected successfully", timestamp: "6 hr ago" },
];

export const aiEmployees: AIEmployee[] = [
  { id: "e1", name: "Alex", type: "Call Agent", typeIcon: "phone", status: "active", tasksCompleted: 1247, hiredDate: "Mar 15, 2026", avatar: "AX" },
  { id: "e2", name: "Sophia", type: "Lead Qualifier", typeIcon: "star", status: "active", tasksCompleted: 892, hiredDate: "Mar 20, 2026", avatar: "SO" },
  { id: "e3", name: "Marcus", type: "Email Responder", typeIcon: "mail", status: "active", tasksCompleted: 2103, hiredDate: "Apr 1, 2026", avatar: "MA" },
  { id: "e4", name: "Elena", type: "Content Creator", typeIcon: "edit", status: "paused", tasksCompleted: 456, hiredDate: "Apr 10, 2026", avatar: "EL" },
  { id: "e5", name: "Jasper", type: "CRM Sync Agent", typeIcon: "database", status: "offline", tasksCompleted: 178, hiredDate: "May 5, 2026", avatar: "JA" },
];