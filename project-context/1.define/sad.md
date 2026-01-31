# BAGANA AI - System Architecture Document (SAD)

## Context & Instructions

This System Architecture Document (SAD) defines the architecture for BAGANA AI—an AI-powered multi-agent system using the CrewAI framework and AAMAD that helps agencies create clear PRD and MRD documents for client campaigns and internal projects through guided conversations. It uses a modern Next.js frontend and assistant-ui interface per the AAMAD Phase 3 template.

**Inputs**: PRD (`project-context/1.define/prd.md`), MRD (`project-context/1.define/mrd.md`), use case (`usecase.txt`).  
**MVP Scope**: Focus on core value—PRD-only workflow, single/combined agent, chat + export—with 80/20 rule. Full multi-agent PRD/MRD and dashboard in Phase 2.

**Adapter**: Active multi-agent framework is selected via `AAMAD_ADAPTER` (default: `crewai`). This SAD aligns with the CrewAI adapter; see Audit for resolved value.

---

## 1. MVP Architecture Philosophy & Principles

### MVP Design Principles

- **Customer Feedback First**: Deploy quickly to validate core value proposition (time-to-first-PRD < 1 hour, document completeness, user satisfaction).
- **Modern LLM Interface**: Use assistant-ui for production-grade AI chat experience and streaming.
- **Automated Deployment**: CI/CD from day 1 to enable rapid iteration (GitHub Actions → AWS App Runner).
- **Observable by Default**: Basic monitoring for user behavior, agent runs, and API latency.

### Core vs. Future Features Decision Framework

- **Phase 3 Beta (MVP)**: Core PRD creation via chat, assistant-ui interface, document export (Markdown/PDF), essential auth and document storage. Single or minimal agent set to validate pipeline.
- **Phase 3 Full**: Full multi-agent (Research, Requirements Gathering, Document Generation, Validation, Dashboard), MRD workflow, research integration, executive dashboard, collaboration.
- **Validation Focus**: Prove product-market fit and time-to-value before scaling agent count and features.

### Technical Architecture Decisions

- **Next.js App Router over Pages Router**: App Router provides Server Components, streaming, and layout/nested routing needed for chat + dashboard and future RSC data loading; aligns with modern React and better SEO/data fetching patterns.
- **assistant-ui over custom chat**: assistant-ui offers production-grade LLM chat patterns (streaming, tool calls, message types) and reduces custom UI/state bugs; allows focus on BAGANA-specific flows (PRD/MRD steps, export).
- **CrewAI agent communication**: Sequential crew for MVP (Requirements Gathering → Document Generation); optional parallel (e.g., Research + Requirements) in Phase 2. Context passed via Task.context; no delegation in MVP.
- **Real-time streaming**: All chat and document-generation responses streamed from API to assistant-ui to keep perceived latency low (<3s p95 for chat; progress indicators for full PRD generation <30s).

---

## 2. Multi-Agent System Specification

### Agent Architecture Requirements

**MVP (Phase 3 Beta)** — 2 agents maximum to validate pipeline:

1. **Requirements & Document Agent (combined)**  
   - Role: Guide requirements discovery and produce a single PRD from the conversation.  
   - Goal: Lead the user through AAMAD PRD template sections and output one complete PRD (markdown).  
   - Backstory: Senior product/business analyst and technical writer; expert in requirements and AAMAD templates.  
   - Tools: question prompts (from template), template engine, markdown generator.  
   - Memory: session-only (conversation context).  
   - Delegation: false.

2. **Validation Agent (optional in MVP)**  
   - Role: Check PRD completeness and template compliance.  
   - Goal: Return a short validation report (missing sections, suggestions).  
   - Backstory: QA/documentation reviewer.  
   - Tools: template validator, completeness checker.  
   - Memory: false.  
   - Delegation: false.

**Full vision (Phase 2+)** — from PRD, up to 5 agents: Research, Requirements Gathering, Document Generation, Validation, Dashboard. Agent definitions (role, goal, backstory, tools) externalized in YAML under `config/` per AAMAD adapter-crewai rules.

### Task Orchestration Specification

- **MVP flow**: User message → Requirements & Document Agent (guided Q&A + section generation) → optional Validation Agent → structured output (PRD markdown + validation summary). Single crew, sequential tasks.
- **Task dependencies**: Document task depends on requirements task output (context); validation task depends on document task output.
- **Expected outputs**: PRD markdown (file path and required headings per AAMAD template); validation report (list of gaps/suggestions). Data format: JSON-serializable for API; markdown for download/export.
- **Context passing**: Task.context used for prior task outputs; no reliance on memory alone for artifact handoff.
- **Error handling**: On LLM/timeout failure, return user-facing error and log; retry once with exponential backoff; on validation failure, return diagnostic and do not overwrite document.
- **Performance**: Max execution time per task configurable (e.g., 60s for document generation); token limits per agent from adapter/config; target &lt;30s end-to-end for full PRD.

### CrewAI Framework Configuration

- **Crew composition**: One crew for MVP (Requirements & Document; optionally Validation). Process: sequential.
- **Memory and caching**: Session memory only for MVP; cache template definitions and optionally recent LLM responses per session; no long-term memory in MVP.
- **Logging**: Verbose logging in dev; structured logs (task id, agent, duration, token count) for production; trace log under `project-context/2.build/logs` for step/tool calls, not in final artifact.
- **Integration with Next.js**: Next.js API route (e.g., `POST /api/chat` or `/api/crew/kickoff`) invokes Python CrewAI layer via subprocess or HTTP; streaming implemented via Server-Sent Events or chunked response from Python to Next.js to client.

---

## 3. Frontend Architecture Specification (Next.js + assistant-ui)

### Technology Stack Requirements

- **Framework**: Next.js 14+ with App Router.
- **UI Library**: assistant-ui for LLM chat; shadcn/ui for shared components (buttons, forms, layout).
- **Styling**: Tailwind CSS.
- **Type Safety**: TypeScript for frontend and API route types.
- **State Management**: Zustand for client-side app state (e.g., current document id, sidebar); assistant-ui manages chat state.

### Application Structure Requirements

- **App Router**: `app/` with `layout.tsx`, `page.tsx` (landing/dashboard entry), `chat/page.tsx` (main chat), `documents/[id]/page.tsx` (view/export document). API routes under `app/api/` (e.g., `app/api/chat/route.ts`, `app/api/documents/route.ts`).
- **API route organization**: `/api/chat` for chat/streaming; `/api/documents` for list/create/get; `/api/documents/[id]/export` for Markdown/PDF download. CrewAI invoked from chat route (via Python bridge or server-side SDK if available).
- **Components**: Reusable UI in `components/ui/` (shadcn); chat-specific in `components/chat/`; document viewer/export in `components/documents/`.
- **assistant-ui**: Custom tool components for “document_generated” or “validation_report” if CrewAI returns tool calls; otherwise plain message stream.
- **Layout**: Root layout with nav (Chat, Documents, Export); chat page full-width conversation; responsive for desktop/tablet.

### assistant-ui Integration Specifications

- **Tool components**: Map CrewAI tool outputs (e.g., document snippet, validation result) to assistant-ui tool renderers so the user sees structured result blocks in the thread.
- **Streaming**: Consume streaming response from `/api/chat` and pass to assistant-ui; show typing/loading until first token.
- **Interaction**: User sends message → assistant-ui → API → CrewAI → stream back; support multi-turn and “Generate PRD” / “Export” actions.
- **Feedback**: Optional thumbs up/down or inline feedback widget; store in backend for analytics (MVP: minimal).
- **Theming**: Use Tailwind + shadcn theme tokens; support light/dark per system or toggle.

### User Interface Requirements

- **Chat interface**: Main area = assistant-ui thread; sidebar or top bar for “New PRD”, “My Documents”, “Export”. Show progress when generating full PRD (e.g., “Generating sections…”).
- **Dashboard (MVP minimal)**: List of saved documents (title, date, status); link to view/export. Full executive dashboard (charts, KPIs) deferred to Phase 2.
- **Responsive**: Desktop-first; usable on tablet; mobile = single-column chat.
- **Accessibility**: ARIA labels, keyboard navigation, focus management in chat; WCAG 2.1 AA target.
- **Loading and errors**: Skeleton/spinner for loading; error boundary and inline error message with retry for failed requests.

---

## 4. Backend Architecture Specification

### API Architecture Requirements

- **Next.js API routes**: `app/api/chat/route.ts` (POST, streaming); `app/api/documents/route.ts` (GET list, POST create); `app/api/documents/[id]/route.ts` (GET); `app/api/documents/[id]/export/route.ts` (GET, Markdown/PDF).
- **Streaming**: Use ReadableStream or SSE to stream from CrewAI layer to client; ensure no buffering of full response before first byte.
- **Request/response**: Request body: `{ message, sessionId?, documentId? }`. Response: stream of text/SSE or JSON for tool results. Validate input (max message length, sessionId format).
- **Rate limiting**: Per-IP and per-user (when authenticated) limits on `/api/chat` and `/api/documents` to prevent abuse; return 429 with Retry-After when exceeded.
- **Errors and logging**: Catch exceptions, log with request id, return 500 with generic message; do not leak stack or internal details.

### Database Architecture Specification

- **Technology**: SQLite for MVP (single file, zero config); schema designed for future PostgreSQL migration (avoid SQLite-specific types).
- **Data models**: Users (id, email, name, createdAt); Sessions (id, userId, createdAt); Documents (id, userId, sessionId, title, status, createdAt, updatedAt); DocumentVersions (id, documentId, contentMarkdown, createdAt); Messages (id, sessionId, role, content, createdAt) for chat history.
- **ORM**: Prisma for schema, migrations, and queries; place schema in `prisma/schema.prisma`.
- **Migrations**: Prisma migrate; version migrations in repo; document PostgreSQL migration path (e.g., change provider, run same migrations).
- **Retention**: Configurable retention for Messages and DocumentVersions (e.g., 90 days); soft delete or archive for Documents.
- **Backup**: For MVP, periodic SQLite file copy or export; for production, use managed DB backups (RDS, etc.).

### CrewAI Integration Layer Requirements

- **Python layer**: Separate Python service or subprocess that runs CrewAI crew; receives input (e.g., user message + session context), returns stream or final output. Option: FastAPI or Flask app that Next.js calls via HTTP; or Node child_process to Python script with stdin/stdout for streaming.
- **Agent configuration**: Load agents/tasks from YAML under `config/` (e.g., `config/agents.yaml`, `config/tasks.yaml`); no inline Python agent definitions per adapter-crewai.
- **Tools**: Implement only whitelisted tools (template loader, markdown writer, validator); config JSON-serializable; secrets from env.
- **Monitoring**: Log each kickoff (crew, task ids, duration); optional metrics (prometheus) for task duration and token usage.
- **Degradation**: If CrewAI/LLM unavailable, return clear error and suggest retry; do not partial-write artifact.

### Authentication & Security Specifications

- **Authentication**: NextAuth.js for MVP; providers: credentials (email/password) and optionally OAuth (Google, Microsoft). Session: JWT or database session.
- **API keys**: LLM and other secrets in environment variables; never in repo; `.env.example` with placeholders; validate required env at startup.
- **Input validation**: Validate and sanitize all user input (message length, document title, IDs); use Zod or similar for request bodies.
- **Rate limiting**: Apply at API route level (e.g., 60 req/min per user for chat).
- **CORS and headers**: Restrict CORS to app origin; set security headers (X-Content-Type-Options, etc.).

---

## 5. DevOps & Deployment Architecture

### CI/CD Pipeline Requirements

- **GitHub Actions**: On push to `main`, run lint, typecheck, unit tests, and build; on success, deploy to AWS App Runner (or similar). Workflow file: `.github/workflows/deploy.yml`.
- **Build**: `next build` for Next.js; Python deps installed in same image or separate service. Build output optimized (static where possible).
- **Testing**: Unit (Jest/Vitest) for utilities and components; integration for API routes with mock CrewAI; E2E (Playwright) for critical path (login → chat → export).
- **Gates**: Deployment only after tests pass; optional manual approval for production.
- **Rollback**: Versioned deployments; rollback by redeploying previous image or reverting last workflow run.

### AWS App Runner Configuration Specification

- **Compute**: Single instance for MVP; 1 vCPU, 2 GB RAM minimum; increase if Python + Node in one container.
- **Scaling**: Min 1, max 3 for MVP; scale on request count or CPU.
- **Health**: HTTP GET `/api/health` returns 200 when app and DB (if used) are reachable.
- **Env and secrets**: Env vars from App Runner config or AWS Secrets Manager; include `AAMAD_ADAPTER`, `OPENAI_API_KEY` (or similar), `DATABASE_URL`.
- **Network**: Outbound for LLM and external APIs; inbound via App Runner URL with HTTPS.

### Infrastructure as Code Requirements

- **Terraform or CloudFormation**: Define App Runner service, ECR repo (if used), and any RDS/Redis for post-MVP; keep MVP minimal (App Runner + env).
- **Resource naming**: Consistent prefix (e.g., `bagana-*`) and tags (env, project).
- **Backup/DR**: DB backup strategy when moving to PostgreSQL; document RTO/RPO.
- **Cost and monitoring**: CloudWatch alarms for errors and latency; budget alert if applicable.
- **Environments**: Separate staging and production (e.g., different App Runner services or branches).

### Monitoring & Observability Specifications

- **APM**: Log request duration, status, and route; optional APM (Datadog, New Relic) for Node and Python.
- **Logs**: Aggregate logs to CloudWatch or similar; structured JSON for API and CrewAI layer.
- **User analytics**: Anonymous or consented events (e.g., “document_created”, “export_clicked”) for product metrics; respect privacy.
- **Alerting**: Alert on 5xx rate, latency p95 &gt; threshold, and CrewAI failures.
- **Dashboard**: Simple ops dashboard (request count, error rate, latency) for MVP.

---

## 6. Data Flow & Integration Architecture

### Request/Response Flow Specification

- **User request**: User types in assistant-ui → POST `/api/chat` with message and sessionId → Next.js validates and forwards to CrewAI layer (Python) → Python runs crew, streams output → Next.js streams to client → assistant-ui appends to thread.
- **Data transformation**: Frontend sends `{ message, sessionId }`; backend may attach stored context (previous messages, document draft) from DB before calling crew. Crew output (text or tool result) mapped to assistant-ui message types.
- **Streaming**: Python yields chunks; Next.js pipes to Response stream; client parses SSE or chunked body and updates UI.
- **Errors**: Exceptions in crew or API return error payload or message in stream; frontend shows error state and retry.
- **Caching**: Cache template definitions and static config; optional short TTL cache for identical “generate section” requests in MVP.

### External Integration Requirements

- **LLM**: OpenAI or Anthropic API; key from env; handle rate limits and timeouts with retry/backoff.
- **Web search (Phase 2)**: SerpAPI or Google Custom Search for Research agent; same env-based key and error handling.
- **Auth**: NextAuth.js with OAuth providers; callbacks and env configured per provider.
- **File storage (Phase 2)**: S3 or similar for document files and exports; MVP can store markdown in DB only.
- **Webhooks**: Not in MVP; future for Slack/Notion etc.

### Analytics & Feedback Architecture

- **Events**: Emit events (e.g., document_created, export_requested) from API or frontend; store in DB or send to analytics provider (e.g., Mixpanel) with user id and timestamp.
- **Feedback**: Optional feedback table (sessionId, messageId, rating, comment); display in admin or use for model improvement.
- **Privacy**: No PII in analytics without consent; anonymize where required (GDPR).
- **Dashboard**: MVP dashboard uses same Documents table; real-time optional (polling or SSE later).

---

## 7. Performance & Scalability Specifications

### Performance Requirements

- **Chat response**: &lt;3s p95 for first token or first complete reply.
- **Full PRD generation**: &lt;30s end-to-end.
- **Document list/load**: &lt;2s for list and for single document.
- **Export**: &lt;10s for PDF/Markdown export.
- **Concurrency (MVP)**: Support tens of concurrent users; design for hundreds with same stack (single instance or small scale-out).

### Scalability Architecture

- **Horizontal scaling**: App Runner or container replicas behind load balancer; stateless API; session and document state in DB.
- **Database**: SQLite → PostgreSQL for multi-instance; connection pooling (e.g., PgBouncer); read replicas for read-heavy workloads later.
- **Microservices**: MVP is monolith (Next.js + Python in one or two deployables); split Python crew to separate service if needed for scaling.
- **Containers**: Docker for Next.js (and optionally Python); orchestration via App Runner or ECS/EKS later.

### Resource Optimization Specifications

- **Memory/CPU**: Size App Runner instance to typical load; monitor and tune.
- **Token usage**: Limit context length and output tokens per task; cache repeated template content; track cost per document.
- **Bandwidth**: Compress API responses where beneficial; stream to avoid large buffers.
- **Storage**: Prune old messages/versions per retention; archive old documents if needed.
- **Cost**: Monitor LLM and infra cost; target &lt;$2 per document (MRD).

---

## 8. Security & Compliance Architecture

### Security Framework Requirements

- **Authentication**: NextAuth.js with secure session; HTTPS only; secure cookies.
- **Authorization**: User can access only own sessions and documents; check userId/sessionId in API.
- **Encryption**: TLS in transit; encryption at rest for DB and secrets (provider-managed).
- **API security**: Validate and sanitize inputs; rate limit; no sensitive data in URLs.
- **Vulnerability management**: Dependabot or similar for deps; periodic security review.
- **Incident response**: Log security-relevant events; document procedure for breach or abuse.

### Data Privacy & Compliance

- **User data**: Store only what’s needed (account, documents, messages); minimal PII.
- **GDPR**: Support data export and deletion (document procedures); consent for marketing/analytics where applicable.
- **Retention**: Configurable retention; delete or anonymize when past retention.
- **Audit log**: Log document create/update/export and auth events for compliance; retain per policy.
- **Consent**: Privacy policy and consent for cookies/analytics; optional consent field in user profile.

---

## 9. Testing & Quality Assurance Specifications

### Testing Strategy Requirements

- **Unit**: Utilities, formatters, and pure functions; mock external deps; coverage target &gt;80% for critical paths.
- **Integration**: API routes with mocked CrewAI and DB; test streaming and error paths.
- **E2E**: Playwright for: sign-in → new chat → send message → receive reply → generate PRD → export. Run in CI.
- **Performance**: Smoke test for chat and document generation under load (e.g., 10 concurrent); alert on regression.
- **Security**: Dependency scan; optional SAST; no secrets in code.

### Quality Gates & Validation

- **Code quality**: ESLint + Prettier; TypeScript strict; PR review required.
- **Deployment**: Smoke test after deploy (hit /api/health and one chat request).
- **UAT**: Beta users validate “create PRD in &lt;1 hour” and completeness; collect feedback.
- **Performance**: Benchmarks for chat &lt;3s and PRD &lt;30s; fail CI if regressed.
- **Accessibility**: axe or similar in E2E; WCAG 2.1 AA for chat and documents.

---

## 10. MVP Launch & Feedback Strategy

### Beta Testing Framework

- **Selection**: 50–100 agencies or power users; active PRD needs, team size 5–50.
- **Onboarding**: Short guide or checklist: set env, run app, create first PRD, export.
- **Feedback**: In-app feedback widget or link to survey; optional NPS; store in DB or sheet.
- **Feature flags**: Flag for “new chat model” or “validation step” to roll out gradually.
- **Success metrics**: Time to first PRD, completion rate, NPS; iterate every 2 weeks.

### User Experience Optimization

- **Onboarding**: First-time tooltip or short tour (chat, documents, export); help link to docs.
- **Help**: Docs for PRD/MRD workflow and AAMAD templates; FAQ.
- **Feedback loop**: Triage feedback; prioritize bugs and “blocker” UX issues; feature requests in backlog.
- **Retention**: Email or in-app nudge for “continue your PRD”; usage stats for product.
- **Support**: Support email or form; escalation path for enterprise (Phase 2).

### Business Metrics & Analytics

- **KPIs**: DAU/MAU, documents created, exports, NPS, time-to-first-PRD.
- **Funnel**: Sign-up → first message → first PRD → export; track drop-off.
- **Engagement**: Messages per session, sessions per user per week.
- **Competitive**: Optional survey on “vs. previous tool”; track positioning.
- **BI**: Simple dashboard (internal) for KPIs; export to spreadsheet or BI tool if needed.

---

## Implementation Guidance for AI Development Agents

### Phase 2 Development Priorities

1. **Foundation**: Next.js project with TypeScript, Tailwind, Prisma (SQLite), NextAuth.
2. **assistant-ui**: Chat page with streaming and tool components.
3. **CrewAI backend**: Python crew (YAML config), 1–2 agents for MVP; bridge from Next.js.
4. **API layer**: `/api/chat`, `/api/documents`, `/api/documents/[id]/export`.
5. **Database**: Prisma schema and migrations; seed if needed.
6. **Auth**: NextAuth with credentials and one OAuth provider.
7. **Testing**: Jest/Vitest + Playwright; one E2E flow.
8. **CI/CD**: GitHub Actions build and deploy to AWS App Runner.

### Critical Architecture Decisions to Implement

- Use Server Components for document list and static layout; Client Components for chat and interactive forms.
- Error boundaries and fallback UI for chat and document routes.
- Schema and migrations ready for PostgreSQL; avoid SQLite-only features.
- API routes stateless; session and document state in DB.
- assistant-ui configured for streaming and tool rendering.
- Shared TypeScript types for API payloads and DB models.

### MVP Scope Boundaries

- **In scope**: PRD-only workflow, chat with one combined or two agents, document save and export (Markdown/PDF), auth, single-user usage, SQLite, one region.
- **Out of scope (future)**: MRD workflow, Research agent, full 5-agent crew, executive dashboard, collaboration, SSO, Redis, multi-region, advanced analytics.

---

## Architecture Validation Checklist

- [x] PRD requirements mapped to architecture (chat, PRD creation, export, dashboard placeholder).
- [x] CrewAI agents scoped for PRD/agency domain (Requirements & Document; Validation optional).
- [x] assistant-ui used for chat and streaming.
- [x] Next.js App Router and structure defined.
- [x] Database schema supports documents, sessions, and future scaling.
- [x] API design with streaming and error handling.
- [x] Security and auth appropriate for MVP.
- [x] CI/CD and deployment (GitHub Actions, App Runner) specified.
- [x] Monitoring and feedback strategy defined.
- [x] Path from MVP to full production (PostgreSQL, more agents, dashboard) indicated.

---

## Sources

- **PRD**: `project-context/1.define/prd.md`
- **MRD**: `project-context/1.define/mrd.md`
- **Use case**: `usecase.txt`
- **SAD template**: `.cursor/templates/sad-template.md`
- **System Architect persona**: `.cursor/agents/system-arch.md`
- **AAMAD adapter**: `.cursor/rules/adapter-registry.mdc`, `.cursor/rules/adapter-crewai.mdc`

## Assumptions

1. Next.js 14+ and assistant-ui are available and suitable for production chat.
2. CrewAI can be invoked from Node (subprocess or HTTP) with streaming output.
3. MVP uses SQLite with Prisma; migration to PostgreSQL is straightforward with same schema.
4. AWS App Runner (or equivalent) is acceptable for MVP hosting.
5. Single-tenant usage in MVP; multi-tenant and RBAC deferred.
6. AAMAD_ADAPTER remains `crewai` for this release.

## Open Questions

1. **Python–Node boundary**: Prefer subprocess vs. separate HTTP service for CrewAI in same repo?
2. **Streaming protocol**: SSE vs. chunked JSON for assistant-ui compatibility?
3. **PDF export**: Client-side (e.g., browser print) vs. server-side (Puppeteer/React-PDF) for MVP?
4. **Beta cohort**: Exact criteria and recruitment channel for 50–100 users.

## Audit

| Field | Value |
|-------|--------|
| **Timestamp** | 2025-01-31 |
| **Persona ID** | system.arch |
| **Action** | create-sad |
| **Artifact** | `project-context/1.define/sad.md` |
| **Template** | `.cursor/templates/sad-template.md` |
| **AAMAD_ADAPTER** | crewai (default; resolved at execution) |
| **Status** | Complete |
| **Traceability** | SAD traces to PRD §§3–4, MRD technical sections, and usecase.txt. |
