# VirtuStaff Platform Architecture

> **Last Updated:** 2026-07-15
> **Author:** Platform Engineer
> **Status:** Draft v1

---

## Table of Contents

1. [Tech Stack Overview](#1-tech-stack-overview)
2. [Database Schema Design](#2-database-schema-design)
3. [API Design](#3-api-design)
4. [Authentication System](#4-authentication-system)
5. [AI Engine Design](#5-ai-engine-design)
6. [Deployment & Infrastructure](#6-deployment--infrastructure)

---

## 1. Tech Stack Overview

| Layer | Technology | Justification |
|-------|-----------|---------------|
| **Runtime** | Node.js 20+ (TypeScript) | Strong ecosystem, excellent async I/O for AI/API workloads |
| **Framework** | Hono.js (lightweight) or Express | Hono preferred — fast, edge-compatible, TypeScript-native |
| **Database** | **Neon (Serverless Postgres)** | Free tier, autoscaling, branching for dev/staging, good for multi-tenant SaaS |
| **ORM** | Drizzle ORM or Prisma | Drizzle preferred — lighter, SQL-like, great TypeScript inference |
| **Auth** | **Clerk** | Built-in org/team management, session handling, social logins |
| **Payments** | Stripe (custom integration) | Industry standard for SaaS billing, webhooks, subscriptions |
| **AI Models** | OpenAI API + Anthropic Claude API | GPT-4o for call/text agents, Claude for nuanced workflows |
| **Voice** | Twilio + Deepgram (STT) + ElevenLabs (TTS) | Twilio for telephony, Deepgram for transcription, ElevenLabs for voice |
| **Hosting** | Railway or Fly.io | Easy deploys, containerized, good for Node.js backends |
| **Job Queue** | BullMQ (Redis) | For async AI processing, scheduled tasks, webhook handling |
| **Cache** | Upstash Redis | Serverless Redis, free tier available |
| **Monitoring** | Sentry + Logfire | Error tracking and observability |
| **DX** | Biome (lint/format) + Vitest (testing) | Fast, modern tooling |

### Why These Choices

- **Neon** over traditional Postgres: Serverless, auto-scales to zero, branching lets us create per-dev or per-feature DB copies instantly.
- **Clerk** over Auth0/Firebase: Built for orgs from day one — organizations, memberships, invitation flows are first-class.
- **Hono** over Next.js API routes: The backend is purely an API server, not a frontend. Hono is lighter and faster for this.
- **Drizzle** over Prisma: Better performance, SQL-like syntax, and smaller bundle size for an API server.

---

## 2. Database Schema Design

### 2.1 Entity Relationship Overview

```
organizations 1──* users
organizations 1──* ai_employees
organizations 1──* subscriptions
organizations 1──* crm_connections
users         1──* ai_employees (assigned)
ai_employees  1──* tasks
tasks         1──* task_logs
subscriptions 1──* invoices
crm_connections 1──* sync_logs
```

### 2.2 Core Tables

#### `organizations`
```sql
CREATE TABLE organizations (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name        VARCHAR(255) NOT NULL,
  slug        VARCHAR(100) UNIQUE NOT NULL,
  logo_url    TEXT,
  size        VARCHAR(20) DEFAULT 'small',  -- 'small' (2-10), 'medium' (11-50), 'large' (51-200)
  timezone    VARCHAR(50) DEFAULT 'UTC',
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  updated_at  TIMESTAMPTZ DEFAULT NOW()
);
```

#### `users`
```sql
CREATE TABLE users (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clerk_id          VARCHAR(255) UNIQUE NOT NULL,   -- Clerk user ID
  email             VARCHAR(255) UNIQUE NOT NULL,
  first_name        VARCHAR(100),
  last_name         VARCHAR(100),
  avatar_url        TEXT,
  phone             VARCHAR(20),
  default_org_id    UUID REFERENCES organizations(id),
  created_at        TIMESTAMPTZ DEFAULT NOW(),
  updated_at        TIMESTAMPTZ DEFAULT NOW()
);
```

#### `organization_members`
```sql
CREATE TABLE organization_members (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id   UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  user_id           UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  role              VARCHAR(20) NOT NULL DEFAULT 'member',  -- 'admin', 'member', 'billing'
  joined_at         TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(organization_id, user_id)
);
```

#### `subscription_plans`
```sql
CREATE TABLE subscription_plans (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  stripe_price_id   VARCHAR(255) UNIQUE NOT NULL,
  name              VARCHAR(100) NOT NULL,   -- 'Starter', 'Growth', 'Scale'
  slug              VARCHAR(50) UNIQUE NOT NULL,
  description       TEXT,
  price_cents       INTEGER NOT NULL,
  currency          VARCHAR(3) DEFAULT 'usd',
  interval          VARCHAR(10) DEFAULT 'month',  -- 'month', 'year'
  max_ai_employees  INTEGER NOT NULL,   -- 2, 5, -1 for unlimited
  features          JSONB DEFAULT '[]',
  is_active         BOOLEAN DEFAULT TRUE,
  created_at        TIMESTAMPTZ DEFAULT NOW()
);
```

#### `subscriptions`
```sql
CREATE TABLE subscriptions (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id   UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  plan_id           UUID NOT NULL REFERENCES subscription_plans(id),
  stripe_subscription_id VARCHAR(255) UNIQUE,
  stripe_customer_id     VARCHAR(255),
  status            VARCHAR(20) DEFAULT 'active',  -- 'active', 'past_due', 'canceled', 'trialing'
  current_period_start TIMESTAMPTZ,
  current_period_end   TIMESTAMPTZ,
  trial_end         TIMESTAMPTZ,
  canceled_at       TIMESTAMPTZ,
  created_at        TIMESTAMPTZ DEFAULT NOW(),
  updated_at        TIMESTAMPTZ DEFAULT NOW()
);
```

#### `ai_employee_types`
```sql
CREATE TABLE ai_employee_types (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name              VARCHAR(100) NOT NULL,   -- 'Call Agent', 'Lead Qualifier', 'Email Responder', etc.
  slug              VARCHAR(50) UNIQUE NOT NULL,
  description       TEXT,
  capabilities      JSONB DEFAULT '[]',      -- ['voice_call', 'email', 'sms', 'crm_sync', ...]
  icon              VARCHAR(50),
  config_schema     JSONB,                   -- JSON Schema for employee-specific config
  is_active         BOOLEAN DEFAULT TRUE
);
```

#### `ai_employees`
```sql
CREATE TABLE ai_employees (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id   UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  type_id           UUID NOT NULL REFERENCES ai_employee_types(id),
  name              VARCHAR(100) NOT NULL,   -- Employee display name
  assigned_to       UUID REFERENCES users(id),   -- Human manager
  phone_number      VARCHAR(20),             -- Twilio number
  email_address     VARCHAR(255),            -- AI employee email alias
  personality       TEXT,                    -- System prompt customizations
  capabilities      JSONB,                   -- Specific skill toggles
  config            JSONB DEFAULT '{}',      -- Type-specific config
  status            VARCHAR(20) DEFAULT 'active',  -- 'active', 'paused', 'offline'
  avatar_url        TEXT,
  total_tasks       INTEGER DEFAULT 0,
  successful_tasks  INTEGER DEFAULT 0,
  last_active_at    TIMESTAMPTZ,
  created_at        TIMESTAMPTZ DEFAULT NOW(),
  updated_at        TIMESTAMPTZ DEFAULT NOW()
);
```

#### `workflows`
```sql
CREATE TABLE workflows (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id   UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  name              VARCHAR(200) NOT NULL,
  description       TEXT,
  trigger_type      VARCHAR(50) NOT NULL,    -- 'inbound_call', 'new_lead', 'scheduled', 'webhook'
  trigger_config    JSONB DEFAULT '{}',
  steps             JSONB NOT NULL,           -- Ordered array of workflow step definitions
  is_active         BOOLEAN DEFAULT TRUE,
  created_at        TIMESTAMPTZ DEFAULT NOW(),
  updated_at        TIMESTAMPTZ DEFAULT NOW()
);
```

#### `tasks`
```sql
CREATE TABLE tasks (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id   UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  ai_employee_id    UUID NOT NULL REFERENCES ai_employees(id) ON DELETE CASCADE,
  workflow_id       UUID REFERENCES workflows(id),
  type              VARCHAR(50) NOT NULL,    -- 'call', 'email', 'sms', 'lead_qualification', etc.
  status            VARCHAR(20) DEFAULT 'pending',  -- 'pending', 'processing', 'completed', 'failed', 'requires_review'
  priority          VARCHAR(10) DEFAULT 'normal',   -- 'low', 'normal', 'high', 'urgent'
  input_data        JSONB NOT NULL,          -- Task input (call transcript, email body, lead data, etc.)
  output_data       JSONB,                   -- Task output (summary, generated response, etc.)
  result            TEXT,                    -- Human-readable outcome
  contact_name      VARCHAR(255),
  contact_phone     VARCHAR(20),
  contact_email     VARCHAR(255),
  scheduled_at      TIMESTAMPTZ,
  started_at        TIMESTAMPTZ,
  completed_at      TIMESTAMPTZ,
  duration_seconds  INTEGER,
  error_message     TEXT,
  created_at        TIMESTAMPTZ DEFAULT NOW(),
  updated_at        TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_tasks_ai_employee ON tasks(ai_employee_id, status);
CREATE INDEX idx_tasks_org_status ON tasks(organization_id, status);
CREATE INDEX idx_tasks_scheduled ON tasks(organization_id, scheduled_at) WHERE scheduled_at IS NOT NULL;
```

#### `task_logs`
```sql
CREATE TABLE task_logs (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id           UUID NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
  level             VARCHAR(20) DEFAULT 'info',  -- 'debug', 'info', 'warn', 'error'
  source            VARCHAR(100),                -- 'ai_engine', 'twilio', 'crm', 'system'
  message           TEXT NOT NULL,
  metadata          JSONB DEFAULT '{}',
  created_at        TIMESTAMPTZ DEFAULT NOW()
);
```

#### `crm_connections`
```sql
CREATE TABLE crm_connections (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id   UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  provider          VARCHAR(50) NOT NULL,    -- 'hubspot', 'salesforce', 'pipedrive', 'zoho', etc.
  label             VARCHAR(100),            -- User-friendly name
  access_token      TEXT,                    -- Encrypted OAuth token
  refresh_token     TEXT,                    -- Encrypted refresh token
  token_expires_at  TIMESTAMPTZ,
  config            JSONB DEFAULT '{}',      -- Provider-specific config
  is_connected      BOOLEAN DEFAULT FALSE,
  last_sync_at      TIMESTAMPTZ,
  created_at        TIMESTAMPTZ DEFAULT NOW(),
  updated_at        TIMESTAMPTZ DEFAULT NOW()
);
```

#### `sync_logs`
```sql
CREATE TABLE sync_logs (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  connection_id     UUID NOT NULL REFERENCES crm_connections(id) ON DELETE CASCADE,
  direction         VARCHAR(10) NOT NULL,    -- 'inbound', 'outbound'
  entity_type       VARCHAR(50) NOT NULL,    -- 'contact', 'deal', 'lead', 'note'
  records_processed INTEGER DEFAULT 0,
  records_succeeded INTEGER DEFAULT 0,
  records_failed    INTEGER DEFAULT 0,
  status            VARCHAR(20) DEFAULT 'completed',  -- 'running', 'completed', 'failed'
  error_message     TEXT,
  started_at        TIMESTAMPTZ,
  completed_at      TIMESTAMPTZ,
  created_at        TIMESTAMPTZ DEFAULT NOW()
);
```

#### `api_keys`
```sql
CREATE TABLE api_keys (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id   UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  name              VARCHAR(100) NOT NULL,
  key_prefix        VARCHAR(10) NOT NULL,    -- First 10 chars for identification
  key_hash          TEXT NOT NULL,           -- Hashed full key
  scopes            JSONB DEFAULT '["read"]',  -- ['read', 'write', 'admin']
  last_used_at      TIMESTAMPTZ,
  expires_at        TIMESTAMPTZ,
  is_active         BOOLEAN DEFAULT TRUE,
  created_at        TIMESTAMPTZ DEFAULT NOW()
);
```

### 2.3 Key Design Decisions

- **UUIDs everywhere**: Enables safe ID generation at the application layer without DB round-trips. Use `gen_random_uuid()` for server-assigned IDs.
- **Soft deletes sparingly**: Hard deletes with `ON DELETE CASCADE` for normalized child tables (logs, members). Soft delete via `is_active` for business entities (employees, API keys).
- **JSONB for flexible configs**: AI employee configurations, workflow steps, and CRM settings are inherently schema-flexible. JSONB lets us iterate fast without migrations.
- **Indexes on query patterns**: Tasks are queried by `(organization_id, status)` for dashboards and `(ai_employee_id, status)` for agent routing. Scheduled tasks need time-range lookups.
- **Encrypted tokens**: CRM OAuth tokens are encrypted at rest using AES-256-GCM with a key in environment variables.

---

## 3. API Design

### 3.1 Base URL

```
https://api.virtustaff.com/v1
```

### 3.2 Authentication

All endpoints except public health/status require either:
- **Bearer token** (JWT from Clerk session token)
- **API key** (for programmatic access) via `X-API-Key` header
- Organization context determined by `X-Org-ID` header or derived from token

### 3.3 Endpoints

#### Organization Management
```
GET    /v1/orgs                          # List organizations for current user
POST   /v1/orgs                          # Create organization
GET    /v1/orgs/:orgId                   # Get organization details
PATCH  /v1/orgs/:orgId                   # Update organization
DELETE /v1/orgs/:orgId                   # Delete organization

GET    /v1/orgs/:orgId/members           # List members
POST   /v1/orgs/:orgId/members           # Invite member
PATCH  /v1/orgs/:orgId/members/:userId   # Update member role
DELETE /v1/orgs/:orgId/members/:userId   # Remove member
```

#### AI Employees
```
GET    /v1/orgs/:orgId/employees         # List AI employees
POST   /v1/orgs/:orgId/employees         # Create AI employee
GET    /v1/orgs/:orgId/employees/:empId  # Get employee details
PATCH  /v1/orgs/:orgId/employees/:empId  # Update employee config
DELETE /v1/orgs/:orgId/employees/:empId  # Terminate employee

POST   /v1/orgs/:orgId/employees/:empId/activate    # Activate employee
POST   /v1/orgs/:orgId/employees/:empId/pause       # Pause employee
POST   /v1/orgs/:orgId/employees/:empId/test        # Test employee with sample input

GET    /v1/orgs/:orgId/employees/:empId/stats        # Performance stats
```

#### Employee Types (Templates)
```
GET    /v1/employee-types               # List available AI employee types
GET    /v1/employee-types/:typeId       # Get type details & config schema
```

#### Tasks
```
GET    /v1/orgs/:orgId/tasks            # List tasks (filterable: status, employee, date range)
GET    /v1/orgs/:orgId/tasks/:taskId    # Get task details
POST   /v1/orgs/:orgId/tasks            # Create/manually assign a task
POST   /v1/orgs/:orgId/tasks/:taskId/cancel    # Cancel pending task

GET    /v1/orgs/:orgId/tasks/:taskId/logs       # Get task execution logs
```

#### Workflows
```
GET    /v1/orgs/:orgId/workflows        # List workflows
POST   /v1/orgs/:orgId/workflows        # Create workflow
GET    /v1/orgs/:orgId/workflows/:wfId  # Get workflow details
PATCH  /v1/orgs/:orgId/workflows/:wfId  # Update workflow
DELETE /v1/orgs/:orgId/workflows/:wfId  # Delete workflow
POST   /v1/orgs/:orgId/workflows/:wfId/toggle   # Enable/disable
```

#### CRM Integrations
```
GET    /v1/orgs/:orgId/crm              # List CRM connections
POST   /v1/orgs/:orgId/crm              # Initiate OAuth flow
GET    /v1/orgs/:orgId/crm/:connId      # Get connection details
DELETE /v1/orgs/:orgId/crm/:connId      # Disconnect CRM
POST   /v1/orgs/:orgId/crm/:connId/sync # Trigger manual sync

GET    /v1/orgs/:orgId/crm/:connId/logs # Sync history
```

#### Subscriptions & Billing
```
GET    /v1/orgs/:orgId/subscription     # Get current subscription
POST   /v1/orgs/:orgId/subscription     # Create/update subscription
POST   /v1/orgs/:orgId/subscription/change-plan   # Change plan
POST   /v1/orgs/:orgId/subscription/cancel        # Cancel subscription
GET    /v1/orgs/:orgId/invoices         # List invoices

GET    /v1/plans                         # List available subscription plans
```

#### API Keys
```
GET    /v1/orgs/:orgId/api-keys         # List API keys
POST   /v1/orgs/:orgId/api-keys         # Create API key (returns full key once)
DELETE /v1/orgs/:orgId/api-keys/:keyId  # Revoke API key
```

#### Webhooks (Stripe)
```
POST   /v1/webhooks/stripe              # Stripe event webhooks
```

#### AI Employee Communication (Internal/Webhook)
```
POST   /v1/inbound/twilio               # Twilio inbound call/SMS webhook
POST   /v1/inbound/email                # Inbound email processing
POST   /v1/inbound/chat                 # Web chat / widget messages
```

### 3.4 API Conventions

- **Pagination**: Cursor-based via `cursor` and `limit` query params. Response includes `next_cursor`.
- **Filtering**: Query parameters like `status=active&type=call_agent&from=2026-01-01&to=2026-06-30`.
- **Errors**: Standard JSON error format:
  ```json
  {
    "error": {
      "code": "employee_limit_exceeded",
      "message": "Organization has reached its AI employee limit for the current plan.",
      "details": { "current": 5, "limit": 5, "plan": "growth" }
    }
  }
  ```
- **Rate Limiting**: 1000 req/min per organization (stricter per endpoint as needed). Returns `X-RateLimit-*` headers.

---

## 4. Authentication System

### 4.1 Auth Flow

```
User → Clerk UI (hosted or embedded)
  → Clerk issues session JWT
  → Frontend passes JWT as Bearer token to API
  → API validates JWT with Clerk SDK
  → Extracts user ID and org context
```

### 4.2 Session Management

- Clerk handles sessions server-side. Sessions can be revoked from Clerk dashboard.
- JWT tokens contain: `sub` (user ID), `org_id` (active organization), `role` (within org).
- Tokens expire after 1 hour. Frontend refreshes via Clerk's session management (silent refresh).
- API validates token on every request via Clerk middleware.

### 4.3 Team Invitation Flow

```
Admin → POST /v1/orgs/:orgId/members
  → API creates pending invitation via Clerk API
  → Clerk sends invitation email
  → Recipient clicks link → Clerk handles acceptance
  → Webhook from Clerk → API creates organization_members row
  → New member appears in org roster
```

### 4.4 Multi-Tenant Context

- Each request carries an organization context (from Clerk org claim or `X-Org-ID` header).
- All queries are scoped by `organization_id` via middleware.
- A user can belong to multiple organizations and switch between them.

### 4.5 RBAC

| Role | Permissions |
|------|-------------|
| **admin** | Full access — manage employees, members, billing, workflows, CRM, API keys |
| **member** | View & use employees, view tasks, view workflows |
| **billing** | View & manage subscription/invoices only |

---

## 5. AI Engine Design

### 5.1 Architecture Overview

```
                    ┌─────────────┐
                    │   Inbound   │  (Twilio, Email, Webchat, Webhooks)
                    └──────┬──────┘
                           │
                    ┌──────▼──────┐
                    │   Router    │  (Workflow matching, intent detection)
                    └──────┬──────┘
                           │
              ┌────────────┼────────────┐
              │            │            │
       ┌──────▼─────┐ ┌───▼───┐ ┌─────▼──────┐
       │  Call Agent │ │ Email │ │  Lead Qual  │  ...more types
       │ (Voice)     │ │ Agent │ │  Agent      │
       └──────┬─────┘ └───┬───┘ └─────┬──────┘
              │            │            │
              └────────────┼────────────┘
                           │
                    ┌──────▼──────┐
                    │    LLM      │  (OpenAI / Claude API)
                    │   Runtime   │
                    └──────┬──────┘
                           │
              ┌────────────┼────────────┐
              │            │            │
       ┌──────▼─────┐ ┌───▼───┐ ┌─────▼──────┐
       │    Tools    │ │ CRM   │ │  Memory    │
       │ (Calculator,│ │ Sync  │ │  (History, │
       │  Search,    │ │       │ │  Context)  │
       │  DB Query)  │ │       │ │            │
       └─────────────┘ └───────┘ └────────────┘
```

### 5.2 Model Selection

| Use Case | Model | Rationale |
|----------|-------|-----------|
| **Voice calls** | GPT-4o (or GPT-4o-realtime) | Low latency, strong conversation flow, realtime API support |
| **Email/SMS** | Claude 3.5 Sonnet or GPT-4o | Longer context, nuanced tone handling, better formatting |
| **Lead qualification** | GPT-4o-mini | Cheaper, fast, sufficient for structured data extraction |
| **Summarization** | Claude 3 Haiku | Fast, cheap, good at distilling |
| **Content generation** | Claude 3.5 Sonnet | Best for marketing copy, reports |

### 5.3 Task Routing

1. **Inbound event** arrives (call, email, webhook)
2. **Router** determines:
   - Which AI employee should handle it (based on phone/email mapping or workflow rules)
   - What workflow to execute
   - Priority level
3. **Queue** the task in BullMQ (Redis)
4. **Worker** picks up the task, initializes the appropriate AI employee type
5. **AI Runtime** executes the workflow:
   - Builds system prompt from employee config + type template
   - Loads relevant context (CRM data, conversation history)
   - Calls the selected LLM with function/tool definitions
   - Executes tool calls (CRM lookup, calendar booking, etc.)
   - Records output and logs
6. **Task completes** → notifications, CRM sync triggers

### 5.4 Memory & Context Management

- **Short-term**: Conversation history stored per task (in-memory during active call/session)
- **Long-term**: Key facts extracted and stored in DB (preferences, objections, follow-up dates)
- **Context window**: Token-budgeted — oldest messages summarized when approaching limit
- **Employee memory**: Each AI employee can have a persistent "memory" (JSONB) with learned preferences about the organization's customers

### 5.5 Tool Integrations

Each AI employee has access to a set of tools (functions the LLM can call):

| Tool | Description |
|------|-------------|
| `crm_search_contact` | Look up contact in connected CRM |
| `crm_create_contact` | Create/update contact record |
| `crm_create_deal` | Create opportunity/deal |
| `crm_get_deals` | List active deals |
| `calendar_check_availability` | Check calendar for open slots |
| `calendar_create_event` | Schedule an appointment |
| `send_email` | Send an email as the AI employee |
| `send_sms` | Send an SMS message |
| `get_lead_score` | Calculate lead score from criteria |
| `search_knowledge_base` | Look up org-specific info |
| `generate_report` | Create a summary or report |
| `escalate_to_human` | Flag task for human review |

### 5.6 Error Handling & Escalation

- **3 retry policy**: Failed LLM calls retry with exponential backoff
- **Sentiment/confusion detection**: If the AI detects the customer is frustrated or confused, escalate to human
- **Escalation queue**: Tasks with `requires_review` status appear in the org's dashboard
- **Fallback prompts**: If LLM returns empty/invalid, fall back to a simpler model or a safe default response

---

## 6. Deployment & Infrastructure

### 6.1 Architecture Diagram (Conceptual)

```
                    ┌──────────────────┐
                    │   Cloudflare     │  (DNS, CDN, DDoS protection)
                    │   (optional)     │
                    └────────┬─────────┘
                             │
                    ┌────────▼─────────┐
                    │  Railway / Fly   │  (App hosting)
                    │                  │
                    │  ┌────────────┐  │
                    │  │  Hono API  │  │
                    │  │  Server    │  │
                    │  └─────┬──────┘  │
                    │        │         │
                    │  ┌─────▼──────┐  │
                    │  │  BullMQ    │  │
                    │  │  Workers   │  │
                    │  └─────┬──────┘  │
                    └────────┼─────────┘
                             │
              ┌──────────────┼──────────────┐
              │              │              │
       ┌──────▼──────┐ ┌────▼────┐ ┌───────▼──────┐
       │   Neon DB   │ │ Upstash │ │  OpenAI /    │
       │  (Postgres) │ │  Redis  │ │  Claude API  │
       └─────────────┘ └─────────┘ └──────────────┘
```

### 6.2 Environment Variables

```env
# Database
DATABASE_URL=postgres://...

# Auth (Clerk)
CLERK_SECRET_KEY=sk_...
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_...
CLERK_WEBHOOK_SECRET=whsec_...

# Stripe
STRIPE_SECRET_KEY=sk_...
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_PRICE_STARTER=price_...
STRIPE_PRICE_GROWTH=price_...
STRIPE_PRICE_SCALE=price_...

# AI Models
OPENAI_API_KEY=sk-...
ANTHROPIC_API_KEY=sk-ant-...

# Voice
TWILIO_ACCOUNT_SID=AC...
TWILIO_AUTH_TOKEN=...
TWILIO_PHONE_NUMBER=+1...

# CRM OAuth
CRM_ENCRYPTION_KEY=...  # AES-256 key

# Redis (BullMQ)
REDIS_URL=redis://...

# App
NODE_ENV=production
PORT=3000
CORS_ORIGIN=https://app.virtustaff.com
```

### 6.3 CI/CD Pipeline

```
Git push → GitHub Actions
  → Lint (Biome)
  → Test (Vitest)
  → Build (tsc)
  → Deploy to Railway/Fly
  → Run DB migrations (Drizzle)
  → Health check
```

### 6.4 Monitoring & Alerting

- **Sentry**: Capture exceptions in API routes and AI worker processes
- **Logfire**: Structured logging for debugging AI workflows
- **Custom health endpoint**: `GET /v1/health` returns DB status, Redis status, last AI model ping
- **Uptime monitoring**: BetterUptime or similar

---

## Appendix: File Structure

```
/home/team/shared/backend/
├── package.json
├── tsconfig.json
├── .env.example
├── .gitignore
├── src/
│   ├── index.ts                # Entry point
│   ├── app.ts                  # Hono app setup, middleware
│   ├── config/
│   │   ├── env.ts              # Env var validation & typing
│   │   └── constants.ts
│   ├── db/
│   │   ├── schema/             # Drizzle schema files
│   │   │   ├── organizations.ts
│   │   │   ├── users.ts
│   │   │   ├── employees.ts
│   │   │   ├── subscriptions.ts
│   │   │   ├── tasks.ts
│   │   │   ├── workflows.ts
│   │   │   └── crm.ts
│   │   ├── migrations/         # Auto-generated by Drizzle
│   │   └── client.ts           # DB connection
│   ├── modules/
│   │   ├── organizations/
│   │   ├── employees/
│   │   ├── tasks/
│   │   ├── workflows/
│   │   ├── subscriptions/
│   │   ├── crm/
│   │   └── auth/
│   ├── ai/
│   │   ├── runtime.ts          # AI execution engine
│   │   ├── router.ts           # Task routing logic
│   │   ├── agents/
│   │   │   ├── base.ts         # Base agent class
│   │   │   ├── call-agent.ts
│   │   │   ├── email-agent.ts
│   │   │   └── lead-qualifier.ts
│   │   ├── tools/              # LLM-callable tools
│   │   │   ├── crm-tools.ts
│   │   │   ├── calendar-tools.ts
│   │   │   └── communication-tools.ts
│   │   └── memory/             # Context & memory management
│   ├── integrations/
│   │   ├── clerk.ts
│   │   ├── stripe.ts
│   │   ├── twilio.ts
│   │   ├── openai.ts
│   │   └── anthropic.ts
│   ├── webhooks/
│   │   ├── stripe.ts
│   │   └── clerk.ts
│   ├── middleware/
│   │   ├── auth.ts             # JWT validation + org context
│   │   ├── error-handler.ts
│   │   └── rate-limiter.ts
│   └── shared/
│       ├── types.ts
│       └── utils.ts
└── tests/
    ├── unit/
    └── integration/
```

---

*This architecture document is a living reference. Update it as decisions change or new integrations are added.*