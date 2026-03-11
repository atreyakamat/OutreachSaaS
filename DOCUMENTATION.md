# OutreachSaaS: Complete Project Documentation

## 1. Product Requirements Document (PRD)

### 1.1. Product Overview
**OutreachSaaS** is a multi-tenant B2B outreach platform designed for precision, timezone-aware email scheduling and automated lead enrichment. The platform is built to scale employer and partner acquisition engines with localized intelligence, AI-driven data entry, and strict compliance.

### 1.2. Target Audience
- B2B Sales Teams
- Growth Leads & Marketers
- Partnership Managers
- Recruiters sourcing corporate partners or employers

### 1.3. Core Scope & Features
**In-Scope (MVP):**
1. **Authentication & Multi-tenancy**: Secure user registration and login with strict organization-level data isolation.
2. **Lead Discovery & Management**: 
   - Manage Companies and Contacts.
   - AI-powered Lead Processor: Dump unstructured text (from LinkedIn, emails, etc.) and let a local LLM (Ollama) structure it into valid leads.
3. **Dynamic Sequences & Campaigns**: 
   - Create multi-step email sequences.
   - Liquid-style variable injection (e.g., `{{name}}`, `{{company}}`) for deep personalization.
4. **Precision Timezone Scheduling**: 
   - Automated timezone detection for contacts.
   - Asynchronous job queueing (Redis/BullMQ) to ensure emails land exactly at the optimal time (e.g., 10:00 AM local time) for each recipient.
5. **Global Command Center (Analytics)**: 
   - Real-time dashboard tracking conversion rates, pipeline distribution, regional performance, and active sequences.
6. **Pipeline Management**: Kanban/List tracking of leads across the acquisition funnel.

**Out-of-Scope (MVP):**
- Real-time two-way inbox syncing (IMAP/SMTP reply tracking is kept basic).
- Native CRM integrations (Salesforce, HubSpot).
- Billing and Subscription management (Stripe integration).

---

## 2. Tech Stack

### 2.1. Frontend
- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **API Client**: Axios (configured with interceptors for JWT auth)

### 2.2. Backend
- **Runtime**: Node.js
- **Framework**: Express.js
- **Language**: TypeScript
- **Database ORM**: Prisma
- **Database**: SQLite (Local Dev) / PostgreSQL (Production)
- **Job Queue**: BullMQ backed by Redis (for scheduling and automation)
- **AI Processing**: Local Ollama instance (e.g., `llama3` model) for parsing unstructured text into JSON.

### 2.3. Infrastructure & Deployment
- **Containerization**: Docker & Docker Compose (for Postgres and Redis).
- **Architecture**: Separated API Server and Background Worker processes.

---

## 3. System Design Document

### 3.1. Architectural Pattern
OutreachSaaS uses a decoupled **Client-Server Architecture** with an **Asynchronous Worker Pattern**:
1. **Next.js Client**: Serves the UI and interacts with the REST API.
2. **Express API**: Handles HTTP requests, authentication, database CRUD, and queues background jobs.
3. **Background Worker (`worker.ts`)**: Continuously listens to Redis queues to execute time-delayed tasks (sending emails, AI enrichment) without blocking the main API thread.

### 3.2. Data Model (Key Entities)
- `Organization`: The root tenant. All operational data belongs to an Organization.
- `User`: Staff members belonging to an Organization.
- `Company`: Target businesses (includes domain, industry, and calculated score).
- `Contact`: Individuals at a Company (includes email, role, and timezone).
- `Sequence` & `SequenceStep`: Templates and timeline rules for outreach.
- `EmailJob`: Individual scheduled messages tied to a specific Contact and SequenceStep.
- `OutreachPipeline`: Tracks the current stage of a Company/Contact in the sales funnel.

### 3.3. Key Workflows
#### A. AI Lead Processing (The "Magic" Import)
1. User pastes a block of unstructured text into the frontend.
2. Frontend sends text to `POST /api/leads/ai-import`.
3. Backend constructs a prompt and forwards it to the local Ollama API.
4. Ollama returns a structured JSON array of leads.
5. Backend parses the JSON, creates `Company` and `Contact` records in the database, and returns the result.

#### B. Timezone-Aware Outreach Scheduling
1. A user enrolls a `Contact` into a `Sequence`.
2. The API creates a `LeadSequenceState`.
3. The API iterates through `SequenceSteps`. For each step, it calculates the precise UTC time that corresponds to 10:00 AM (or specified time) in the Contact's specific timezone (e.g., `America/Los_Angeles`).
4. An `EmailJob` is inserted into the database and pushed to BullMQ with a `delay` calculated based on the target UTC time.
5. When the delay expires, the `worker.ts` picks up the job, compiles the Liquid template with the Contact's data, and "sends" the email.

### 3.4. Security & Compliance
- **Authentication**: JWT-based stateless authentication. Passwords hashed via `bcryptjs`.
- **Data Isolation**: Every API endpoint enforces `organizationId` scoping. A user can never query or mutate data belonging to another tenant.
- **Suppression Lists**: Before queuing any email, the system checks the `SuppressionList` table to prevent sending to unsubscribed or blocked domains.
