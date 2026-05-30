# Shield AI — Build vs. Buy Architecture Decision Record

## Purpose

This document maps every major component of the Shield AI platform to a build/buy/integrate decision with specific vendor recommendations, cost estimates, and privacy implications. The goal is to reduce the custom engineering surface area to only the parts that create defensible differentiation, and buy or integrate everything else.

---

## Decision Framework

Every component is evaluated on three axes:

**Differentiation** — Does building this in-house create competitive advantage that a competitor can't replicate by buying the same vendor solution? If not, buy it.

**Privacy Compatibility** — Can the vendor's solution operate within DDG's zero-retention architecture? If the vendor requires telemetry, logging, or data access that violates the privacy guarantee, either self-host the open-source version or build it.

**Time-to-Market** — How many engineering months does building save vs. buying? If buying saves 3+ months, the default is buy unless differentiation or privacy forces a build.

---

## Component Decisions

### 1. MODEL ROUTING LAYER

What it does: Accepts user queries, selects the optimal model, routes the request, handles fallbacks, retries, load balancing, and cost tracking across 100+ LLM providers.

**Decision: BUY — LiteLLM (self-hosted open source)**

LiteLLM is the production standard for multi-model routing in 2026. It supports 100+ providers via an OpenAI-compatible API, includes virtual keys, budget controls, rate limits, team management, fallback routing, and cost tracking out of the box. Self-hosting is critical for privacy compliance — the managed LiteLLM Cloud sends telemetry to LiteLLM's servers, which violates zero-retention. The open-source version runs entirely within DDG's infrastructure.

What to build on top: The "intelligent auto-routing" logic — the layer that analyzes query intent and selects the best model automatically. LiteLLM handles the mechanical routing; the intelligence layer is custom. This is approximately 2–4 weeks of engineering and is the defensible differentiator.

Cost: $0 (open source) + ~$3,500/month infrastructure (Redis, Postgres, compute for the proxy at scale)
Saves: 3–4 months of engineering vs. building a routing proxy from scratch
Privacy: Compatible when self-hosted. Do not use LiteLLM Cloud.
Alternative considered: Portkey (managed, better observability, but SaaS-only — violates zero-retention), OpenRouter (marketplace model, takes a 5.5% fee and logs queries)

---

### 2. AI SECURITY & GUARDRAILS

What it does: Scans prompts and responses for prompt injection attacks, sensitive data leakage (PII, credit cards, SSNs), toxic/harmful content, jailbreak attempts, and insecure model outputs.

**Decision: BUY — Palo Alto Networks Prisma AIRS (API Intercept mode)**

Prisma AIRS is the most comprehensive AI security platform available in 2026. It prevents 30+ prompt injection techniques, scans for 1,000+ sensitive data patterns, filters 8 categories of toxic content, and provides agent identity management with RBAC. The API Intercept mode embeds security-as-code directly into the application — every prompt and response passes through Prisma's scan API before reaching or leaving the model. This is critical for the enterprise tier where customers need provable security guarantees.

What to build on top: Integration wiring between LiteLLM's routing layer and Prisma's scan API, so every query is scanned pre-model and every response is scanned post-model. Also build the privacy compliance dashboard that surfaces Prisma's scan results in a user-friendly format.

Cost: Enterprise pricing (quote-based, typically $50K–$150K/year depending on volume). Worth it for enterprise credibility — "Secured by Palo Alto Networks" is a procurement door-opener.
Saves: 6+ months vs. building a custom guardrails system
Privacy: Compatible. Prisma AIRS can be deployed in the customer's VPC. The API Intercept mode processes data in-transit without storage.
Alternative considered: Guardrails AI (open source, lighter weight, good for MVP but lacks the enterprise certification story), OWASP LLM Guard (free, basic, no enterprise support)

**Phase strategy:** Use Guardrails AI (open source) for the MVP/beta phase to keep costs low. Migrate to Prisma AIRS when launching Shield Enterprise, where the Palo Alto brand and certifications justify the cost.

---

### 3. AGENT ORCHESTRATION FRAMEWORK

What it does: Manages multi-step autonomous workflows — chains of model calls, tool use, file operations, web browsing, and code execution with state persistence, error recovery, and human-in-the-loop checkpoints.

**Decision: BUY — LangGraph (open source, self-hosted)**

LangGraph is the production standard for stateful agent workflows in 2026. It models agents as directed graphs with explicit state, conditional branching, checkpointing, and time-travel debugging. It's used by Klarna, LinkedIn, and Uber in production. The graph-based architecture maps cleanly to audit trail requirements (critical for enterprise) and provides the debugging visibility that role-based frameworks like CrewAI lack.

What to build on top: The specific agent personas (Deep Research, Code Engineer, Doc Generator, Data Analyst, Workflow Bot, Web Navigator) are custom implementations on top of LangGraph's primitives. Each agent is a graph definition with custom tools, prompts, and state schemas. This is the core product IP — approximately 4–6 weeks per agent.

Cost: $0 (open source). LangSmith (observability add-on) is $39/seat/month for Plus, with a self-hosted option for enterprise.
Saves: 4–6 months vs. building a custom orchestration engine
Privacy: Compatible when self-hosted. Do not send traces to LangSmith Cloud — either self-host LangSmith or use an alternative observability layer (see Component 5).
Alternative considered: CrewAI (faster prototyping but teams frequently migrate to LangGraph for production), Anthropic Agent SDK (strong but locks you to Claude models), OpenAI Agents SDK (locks you to OpenAI models)

---

### 4. CODE EXECUTION SANDBOX

What it does: Spins up isolated containers for users to execute AI-generated code safely, with zero data persistence after the session ends.

**Decision: BUY — E2B (managed) or Firecracker (self-hosted)**

E2B is purpose-built for AI agent code execution. It uses Firecracker microVMs for hardware-level isolation, achieves 150ms cold starts, provides Python and TypeScript SDKs designed for agent workflows, and is used by Perplexity, Hugging Face, and Groq. The managed service handles infrastructure, scaling, and security patching.

However, E2B's managed service runs on E2B's infrastructure, which means user code temporarily executes on third-party servers. For Shield AI's zero-retention promise, this requires either contractual guarantees from E2B (similar to DDG's model provider contracts) or self-hosting Firecracker directly.

**Recommended approach:** Use E2B's managed service for the beta phase with contractual zero-retention terms. For Shield Enterprise (on-prem/VPC customers), deploy Firecracker directly within the customer's infrastructure using E2B's open-source core.

Cost: E2B Pro at $150/month for development, scaling based on usage. Self-hosted Firecracker is infrastructure cost only (~$2,000–$5,000/month at scale).
Saves: 3–4 months vs. building a custom sandbox system
Privacy: Requires contractual agreement with E2B for managed, or self-host for full control.
Alternative considered: Modal (better GPU support but gVisor isolation instead of Firecracker, Python-only), Daytona (full dev environments but heavier than needed), Cloudflare Sandboxes (fastest cold starts at sub-50ms but limited runtime capabilities)

---

### 5. OBSERVABILITY & MONITORING

What it does: Traces every model call, agent step, and tool invocation for debugging, cost tracking, latency monitoring, and audit trails.

**Decision: BUY — LangSmith (self-hosted) or Langfuse (open source)**

Agent workflows can involve 10–50 LLM calls per task. Without observability, debugging failures is impossible. Two strong options exist:

**LangSmith** is the native observability layer for LangGraph. It provides trace visualization, prompt versioning, evaluation datasets, and cost tracking. A self-hosted option exists for enterprise customers who cannot send traces to LangChain's cloud.

**Langfuse** is the open-source alternative. It's model-agnostic, integrates with LangGraph via the LangChain callback, and can be self-hosted entirely within DDG's infrastructure. It provides traces, prompt management, evaluations, and cost analytics.

**Recommended approach:** Langfuse (self-hosted) for maximum privacy compatibility. It's free, fully open source, and keeps all trace data within DDG's infrastructure.

Cost: $0 (Langfuse self-hosted) + ~$500/month infrastructure
Saves: 2–3 months vs. building custom tracing
Privacy: Fully compatible when self-hosted.
Alternative considered: Datadog LLM Observability (comprehensive but SaaS-only, sends all traces to Datadog's cloud), Helicone (good proxy-based approach but managed-only)

---

### 6. DOCUMENT GENERATION

What it does: Creates PDFs, PowerPoint decks, Word documents, and structured reports from AI-generated content.

**Decision: BUILD (thin layer) + BUY (rendering libraries)**

Document generation is primarily a formatting problem. The AI model generates the content; the rendering pipeline converts it to the target format. Use existing open-source libraries for the rendering and build a thin orchestration layer on top.

Specific libraries: python-pptx for PowerPoint, python-docx for Word, ReportLab or WeasyPrint for PDF, Pandoc for format conversion. These are all mature, well-documented, and free.

What to build: The template system (pre-designed document templates for common use cases), the content-to-format mapping layer, and the integration with the agent framework so agents can output documents natively.

Cost: $0 (open-source libraries) + 3–4 weeks engineering
Privacy: Fully compatible — all processing happens in-memory within DDG's infrastructure.
Alternative considered: Gotenberg (Docker-based document conversion API, good for self-hosting), Carbone.io (template-based, but SaaS pricing at scale)

---

### 7. ENTERPRISE INTEGRATIONS

What it does: Connects Shield AI to external tools (Slack, Google Drive, GitHub, Jira, Notion, Gmail, Teams, Confluence) so agents can read from and write to users' existing workflows.

**Decision: BUY — Nango or Merge.dev (integration platform)**

Building and maintaining OAuth flows, API wrappers, rate limit handling, and webhook management for 50+ integrations is a massive engineering surface. Integration platforms abstract this entirely.

**Nango** is open source, self-hostable, and handles OAuth, token refresh, rate limiting, and unified API access for 250+ integrations. Self-hosting keeps all credentials and data within DDG's infrastructure.

**Merge.dev** is a managed unified API that normalizes data models across categories (HRIS, ATS, CRM, ticketing, file storage). It's more polished but SaaS-only.

**Recommended approach:** Nango (self-hosted) for privacy compliance. It provides pre-built integrations for all target platforms (Slack, Drive, GitHub, Jira, Notion, Gmail, Confluence, Teams) and keeps all OAuth tokens and API data within DDG's infrastructure.

Cost: $0 (Nango open source) + infrastructure for the integration server (~$1,000/month)
Saves: 6+ months vs. building 50+ custom integrations
Privacy: Fully compatible when self-hosted. Nango never sees the data — it manages the auth and API layer.
Alternative considered: Unified.to (unified API, SaaS-only), Paragon (embedded integration platform, SaaS-only), Zapier/Make (consumer-grade, not embeddable, not privacy-compatible)

---

### 8. VECTOR STORE / RAG

What it does: Enables "Chat with Docs" — users upload documents, the system chunks and embeds them, and the AI retrieves relevant context during conversations.

**Decision: BUY — Qdrant (self-hosted) or Weaviate (self-hosted)**

Both are production-grade open-source vector databases that can be self-hosted. Qdrant is written in Rust (fast, low resource usage) and has a simpler API. Weaviate has a broader feature set including hybrid search and multi-tenancy.

**Recommended approach:** Qdrant (self-hosted) for its performance characteristics and simpler operational profile. Critical privacy requirement: all vectors and document chunks must be ephemeral — destroyed when the user session ends (for free/Plus tiers) or stored encrypted per-tenant (for Teams/Enterprise tiers with opt-in persistence).

Cost: $0 (open source) + ~$1,000–$3,000/month infrastructure
Saves: 2–3 months vs. building custom vector search
Privacy: Compatible when self-hosted with ephemeral storage policy.
Alternative considered: Pinecone (managed, excellent performance, but SaaS-only), Chroma (simpler, good for prototyping, less production-ready at scale), pgvector (PostgreSQL extension, fewer features but zero additional infrastructure if already running Postgres)

---

### 9. AUTHENTICATION & TEAM MANAGEMENT

What it does: Handles user authentication, SSO/SAML for enterprise, team workspaces, role-based access control, and audit logging.

**Decision: BUY — WorkOS or Auth0**

Authentication is a solved problem with significant security liability. Do not build it.

**WorkOS** specializes in enterprise-ready auth: SSO, SCIM directory sync, SAML, and admin portals. It's designed to get SaaS products enterprise-ready with minimal engineering. Pricing scales with enterprise SSO connections.

**Auth0** (Okta) is the broader platform with more features but higher complexity and cost.

**Recommended approach:** WorkOS for the enterprise auth features (SSO, SAML, SCIM) that Shield Teams and Enterprise require. DDG's existing auth system handles consumer tiers.

Cost: WorkOS starts at $0 for up to 1M MAUs on the free plan, with SSO connections priced per connection (~$125/connection/month).
Saves: 2–3 months vs. building enterprise auth
Privacy: WorkOS processes auth tokens only, not user data. Compatible with zero-retention architecture.
Alternative considered: Clerk (developer-friendly but less enterprise-focused), Stytch (good alternative, similar pricing)

---

### 10. COMPLIANCE & CERTIFICATION

What it does: Achieves SOC 2 Type II, HIPAA, and GDPR compliance certification for the Shield Enterprise tier.

**Decision: BUY — Vanta or Drata (compliance automation)**

SOC 2 and HIPAA certification are required for enterprise sales in regulated industries. Compliance automation platforms continuously monitor infrastructure, generate evidence, and streamline auditor workflows.

**Vanta** is the market leader for startups and growth-stage companies. It automates evidence collection for SOC 2, HIPAA, ISO 27001, and GDPR, integrates with AWS/GCP/Azure, and connects to your CI/CD pipeline.

Cost: Vanta starts at ~$10,000/year. SOC 2 Type II audit costs an additional $20,000–$50,000. Total first-year compliance cost: $30,000–$60,000.
Saves: 6+ months of manual compliance work
Privacy: Vanta monitors infrastructure configuration, not user data.
Alternative considered: Drata (comparable features, competitive pricing), Secureframe (good alternative, slightly less market penetration)

---

### 11. SECRETS MANAGEMENT

What it does: Encrypts, stores, and manages user credentials (API keys, tokens, passwords, DSNs). Provides runtime injection into ephemeral E2B sandboxes so agents can authenticate with external services without exposing secrets in chat, logs, or model context. Includes real-time scanning to intercept secrets accidentally typed in conversation.

**Decision: BUILD — Custom vault layer using libsodium/NaCl**

This is a build decision for three reasons. First, privacy compliance — no third-party secrets manager (HashiCorp Vault, AWS Secrets Manager, Doppler) can guarantee zero-retention if secrets transit through their infrastructure, which violates DDG's core privacy contract. Second, the real-time chat scanner is a novel feature that doesn't exist in any off-the-shelf product — it requires deep integration with the chat input pipeline. Third, the runtime injection model (secrets resolved by name and injected as environment variables into E2B sandboxes) is specific to Shield's agent architecture.

Architecture: AES-256-GCM encryption via libsodium with per-secret unique nonces. Master key derived from user credentials using Argon2id. Encrypted blobs stored in Postgres alongside metadata. Runtime injection resolves `{{SECRET_NAME}}` references, decrypts in memory, injects as environment variables into the E2B container, and wipes the decrypted value after injection. Client-side regex scanner intercepts known credential patterns (GitHub PATs, AWS keys, Slack tokens) on every keystroke before the message is sent. Auto-rotation worker calls provider token refresh APIs on a configurable schedule. Team-shared secrets use envelope encryption for the Teams/Enterprise tiers.

What to build: Vault CRUD API, chat scanner module + interception UI, E2B injection bridge, auto-rotation worker, team key management layer.

Cost: $0 (libsodium is open source, Postgres already in the stack) + 4–6 weeks backend engineering + 1–2 weeks frontend
Privacy: Fully compatible by design — secrets never leave DDG's infrastructure in plaintext.
Alternative considered: HashiCorp Vault (separate infrastructure, audit log conflicts with zero-retention), Infisical (open source but adds an unnecessary dependency), AWS Secrets Manager (managed service, violates zero-retention)

---

### 12. GOAL ORCHESTRATION ENGINE

What it does: Accepts user-defined objectives (not prompts), decomposes them into multi-step execution plans, runs a recursive Plan → Execute → Verify loop, manages goal lifecycle (pause, resume, abort, inspect), selects which agents to deploy per step, handles blocker detection and human escalation, and enforces structured constraints.

**Decision: BUILD — Custom orchestration layer on top of LangGraph**

This is the core differentiator. The Goal Engine is not a wrapper around an LLM — it's a state machine that coordinates multiple agents, manages secrets injection, enforces user-defined constraints, and produces structured blocker reports when it can't proceed. No off-the-shelf framework provides this combination. LangGraph provides the graph execution primitives (state management, checkpointing, conditional branching); the goal-specific logic is entirely custom.

Architecture: Every goal is defined by six components enforced by the UI — Outcome, Verification, Constraints, Boundaries, Iteration Policy, and Stop Condition. The Plan → Execute → Verify loop is implemented as a LangGraph graph with conditional edges. If verification fails, the engine loops back to Plan with failure context. Agent selection maps outcome intent to the appropriate agents per step. Blocker reports surface evidence, describe what was attempted, and present specific action options. Lifecycle management uses LangGraph's Postgres-backed checkpointing for pause/resume. MCP plugin architecture handles external tool access within defined boundaries.

What to build: Goal schema parser/validator, Plan → Execute → Verify graph, agent selector, blocker report generator, lifecycle controller, real-time status API (WebSocket/SSE), chat integration for goal creation, secrets bridge for `{{}}` reference resolution.

Cost: $0 (LangGraph is open source) + ~$2,500–$5,500/month infra (checkpointing, concurrent execution) + 8–12 weeks for 2 senior engineers
Privacy: Fully compatible — goal state in DDG's Postgres, execution in ephemeral E2B containers, secrets injected at runtime and destroyed post-execution.
Alternative considered: OpenAI Codex (closed-source, SaaS-only, violates zero-retention), CrewAI (lacks goal lifecycle and structured schemas), AutoGen (lacks human escalation protocol)

---

## Architecture Summary

```
┌─────────────────────────────────────────────────────────────────┐
│                        SHIELD AI STACK                          │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌─────────────┐  ┌──────────────┐  ┌────────────────────────┐ │
│  │   Frontend   │  │  WorkOS/Auth │  │   Vanta (Compliance)   │ │
│  │   (BUILD)    │  │    (BUY)     │  │        (BUY)           │ │
│  └──────┬───────┘  └──────────────┘  └────────────────────────┘ │
│         │                                                       │
│  ┌──────▼──────────────────────────────────────────────────────┐│
│  │              DDG Anonymization Relay (EXISTS)                ││
│  │              PII Stripping Pipeline (EXISTS)                 ││
│  └──────┬──────────────────────────────────────────────────────┘│
│         │                                                       │
│  ┌──────▼──────────────────────────────────────────────────────┐│
│  │           Prisma AIRS / Guardrails AI (BUY)                 ││
│  │           Prompt/Response Security Scanning                  ││
│  └──────┬──────────────────────────────────────────────────────┘│
│         │                                                       │
│  ┌──────▼──────────────────────────────────────────────────────┐│
│  │              LiteLLM Proxy — Self-Hosted (BUY)              ││
│  │     Model Routing / Fallbacks / Cost Tracking / Budgets     ││
│  │  ┌──────────────────────────────────────────────────────┐   ││
│  │  │     Auto-Route Intelligence Layer (BUILD — custom)   │   ││
│  │  └──────────────────────────────────────────────────────┘   ││
│  └──────┬──────────────────────────────────────────────────────┘│
│         │                                                       │
│  ┌──────▼───────────────────────────────────────────┐          │
│  │        LangGraph — Self-Hosted (BUY)             │          │
│  │        Agent Orchestration Framework              │          │
│  │  ┌─────────────────────────────────────────────┐ │          │
│  │  │  Goal Orchestration Engine (BUILD — core IP) │ │          │
│  │  │  Plan → Execute → Verify / Lifecycle Mgmt   │ │          │
│  │  ├─────────────────────────────────────────────┤ │          │
│  │  │  Custom Agent Definitions (BUILD — core IP) │ │          │
│  │  │  Research / Code / Docs / Data / Workflow   │ │          │
│  │  └─────────────────────────────────────────────┘ │          │
│  └──────┬───────────────────────────────────────────┘          │
│         │                                                       │
│  ┌──────▼────────┐ ┌──────────────┐ ┌────────────────────────┐ │
│  │ E2B/Firecrackr│ │ Nango        │ │ Qdrant                 │ │
│  │ Code Sandbox  │ │ Integrations │ │ Vector Store           │ │
│  │    (BUY)      │ │   (BUY)      │ │   (BUY)                │ │
│  └───────────────┘ └──────────────┘ └────────────────────────┘ │
│                                                                 │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │       Secrets Vault — libsodium/NaCl (BUILD)             │  │
│  │       AES-256-GCM / Runtime Injection / Chat Scanner     │  │
│  └──────────────────────────────────────────────────────────┘  │
│                                                                 │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │          Langfuse — Self-Hosted (BUY)                    │  │
│  │          Observability / Traces / Cost Analytics          │  │
│  └──────────────────────────────────────────────────────────┘  │
│                                                                 │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │         Doc Rendering: pptx / docx / ReportLab (BUY)    │  │
│  │         Template System (BUILD)                           │  │
│  └──────────────────────────────────────────────────────────┘  │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## What You BUILD (Core IP)

These are the only components that require custom engineering, and they are the defensible moat:

The **auto-route intelligence layer** sits on top of LiteLLM and analyzes query intent to select the optimal model. This is 2–4 weeks of engineering.

The **custom agent definitions** are the specific agent personas (Research, Code, Docs, Data, Workflow, Browser) built as LangGraph graphs with custom tools, prompts, and state schemas. This is 4–6 weeks per agent, approximately 6 months total for all six.

The **goal orchestration engine** sits on top of LangGraph and adds the Plan → Execute → Verify loop, structured goal schemas, lifecycle management (pause/resume/abort), agent selection per step, and structured blocker reporting with human escalation. This is the layer that turns Shield from an AI assistant into an AI coworker. Approximately 8–12 weeks for 2 senior engineers.

The **secrets vault** provides encrypted credential storage (AES-256-GCM), runtime injection into E2B sandboxes, real-time chat scanning to intercept accidentally-typed secrets, auto-rotation, and team-shared secrets with envelope encryption. Approximately 4–6 weeks backend + 1–2 weeks frontend.

The **privacy compliance dashboard** is the real-time transparency UI showing users exactly how their data flows (or doesn't). This is 2–3 weeks of engineering and is a key brand differentiator.

The **frontend applications** (web, mobile, browser extension) are the user-facing interfaces. This is 3–4 months of engineering.

The **document template system** maps AI-generated content to professional document formats. This is 3–4 weeks of engineering.

The **integration wiring** connects all the bought components into a cohesive pipeline and ensures the zero-retention guarantee holds end-to-end. This is 2–3 months of engineering.

Total custom engineering: approximately 10–12 months for a 12-person team, consistent with the $1.7–3.3M estimate. The Secrets Vault and Goal Orchestration Engine add approximately 14–18 weeks of engineering across Phases 1–2, absorbed by expanding the team from 10 to 12.

---

## What You BUY (and self-host)

| Component | Vendor | License | Monthly Cost | Self-Hosted? |
|-----------|--------|---------|-------------|-------------|
| Model routing | LiteLLM | Open source | $3,500 infra | Yes (required) |
| AI security | Guardrails AI → Prisma AIRS | OSS → Enterprise | $0 → $4K–$12K | Yes (API mode) |
| Agent orchestration | LangGraph | Open source | $0 | Yes (required) |
| Code sandbox | E2B / Firecracker | Managed / OSS | $150 → $3K | Contractual / Yes |
| Observability | Langfuse | Open source | $500 infra | Yes (required) |
| Integrations | Nango | Open source | $1,000 infra | Yes (required) |
| Vector store | Qdrant | Open source | $1,500 infra | Yes (required) |
| Auth / SSO | WorkOS | Commercial | $0–$2K | No (SaaS, auth only) |
| Compliance | Vanta | Commercial | $800 | No (SaaS, config only) |
| Doc rendering | python-pptx/docx/ReportLab | Open source | $0 | Yes (library) |
| Secrets vault | libsodium/NaCl | Open source | $0 | Yes (built in) |
| Goal engine infra | LangGraph checkpointing | Open source | $2,500–$5,500 | Yes (required) |

**Total monthly vendor/infra cost at scale: approximately $14,500–$30,500/month**

This is dramatically lower than building equivalent functionality from scratch, and every privacy-sensitive component is self-hosted.

---

## Phase Strategy

**Phase 1 (MVP, Months 1–3):** LiteLLM (self-hosted) + LangGraph + Guardrails AI (open source) + Langfuse + Qdrant. Ship Shield Teams beta to 1,000 DDG power users. Core deliverables: auto-route intelligence layer, 2 agents (Research + Docs), ephemeral code sandbox via E2B, Secrets Vault (core CRUD, chat scanner, sandbox injection), basic Goals Engine (Plan/Execute/Verify loop with 2 agents), and the privacy compliance dashboard. Monthly vendor cost: approximately $9,000.

**Phase 2 (Platform, Months 4–6):** Add Nango for 50+ enterprise integrations, WorkOS for SSO/SAML, E2B at scale for code sandbox. Expand to 10,000 beta users. Build remaining 4 agents (Code Engineer, Data Analyst, Workflow Bot, Web Navigator), goal lifecycle management (pause/resume/abort), auto-rotation for Vault secrets, team workspaces, and admin controls. Monthly vendor cost: approximately $14,500.

**Phase 3 (Enterprise, Months 7–9):** Upgrade to Palo Alto Prisma AIRS for AI security. Deploy Vanta for compliance automation. Complete SOC 2 Type II and HIPAA certification. Launch Shield Enterprise with on-premise/VPC deployment option. Team-shared Vault with envelope encryption. HSM integration option. Goal audit logging for compliance. Begin dedicated enterprise sales motion. Monthly vendor cost: approximately $25,000.

---

## Key Principle

Every component that touches user data must be self-hostable. Every component that doesn't touch user data (auth tokens, compliance monitoring, cost tracking) can be SaaS. This is the architectural line that makes "zero retention" provable rather than promissory.
