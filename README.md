# Shield AI — Credential Layer for AI Agents

> Your agents act on your behalf. Stop handing them your keys.

---

## What Is This?

Shield AI is the credential layer for AI agents. A vault that stores API keys and injects scoped, short-lived credentials at agent runtime — so agents never handle raw keys, every action is logged, and any credential can be revoked in one click.

Existing secrets managers (HashiCorp Vault, Doppler, Infisical) were built for DevOps teams managing servers and pipelines. They work — but they require a security engineer to configure and operate, and they treat AI agents as just another service account.

Shield AI is built for the people actually deploying agents: founders, developers, and small teams who need credential governance without the operational overhead.

## Live Prototype

**[https://jaypast.github.io/shield-ai](https://jaypast.github.io/shield-ai)** — Interactive product demo (mobile + desktop)

**[https://jaypast.github.io/shield-ai/deck.html](https://jaypast.github.io/shield-ai/deck.html)** — Pitch deck (10 slides, keyboard/swipe nav)

**[https://jaypast.github.io/shield-ai/costs.html](https://jaypast.github.io/shield-ai/costs.html)** — Infrastructure cost model

## Core Product

**The Secrets Vault**

- AES-256-GCM encrypted credential storage
- Agents reference secrets by name (`{{GITHUB_PAT}}`) — credentials injected at runtime, never stored in code or environment files
- Each agent gets a scoped, short-lived credential per run — not a shared service account
- Full audit trail: every grant, action, and expiry logged and attributable
- Instant revocation — kill any credential in one click
- Real-time scanner intercepts accidentally-typed secrets before they reach the model

**Who it's for**

| Segment | Problem | How Shield AI solves it |
|---------|---------|------------------------|
| **Indie developers** | AI coding tools double baseline secret leak rates; one leaked key can trigger a $55K cloud bill | Keys never touch the codebase — runtime injection only, scoped to the current run |
| **Agencies & small teams** | All client credentials in a shared vault; one breach exposes every client simultaneously | Per-client credential namespaces — Client A's keys are architecturally isolated from Client B |
| **Platform builders** | Holding customer OAuth tokens in a flat backend database creates unlimited blast radius | Isolated vault namespaces per customer; runtime tokens instead of raw credentials |

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        SHIELD AI STACK                          │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌─────────────-┐  ┌──────────────┐  ┌────────────────────────┐ │
│  │   Frontend   │  │  WorkOS/Auth │  │   Vanta (Compliance)   │ │
│  │   (BUILD)    │  │    (BUY)     │  │        (BUY)           │ │
│  └──────┬───────┘  └──────────────┘  └────────────────────────┘ │
│         │                                                       │
│  ┌──────▼──────────────────────────────────────────────────────┐│
│  │           Guardrails AI / Prisma AIRS (BUY)                 ││
│  │           Prompt/Response Security Scanning                 ││
│  └──────┬──────────────────────────────────────────────────────┘│
│         │                                                       │
│  ┌──────▼──────────────────────────────────────────────────────┐│
│  │              LiteLLM Proxy — Self-Hosted (BUY)              ││
│  │     Model Routing / Fallbacks / Cost Tracking / Budgets     ││
│  └──────┬──────────────────────────────────────────────────────┘│
│         │                                                       │
│  ┌──────▼───────────────────────────────────────────┐          │
│  │        LangGraph — Self-Hosted (BUY)             │          │
│  │        Agent Orchestration Framework             │          │
│  │  ┌─────────────────────────────────────────────┐ │          │
│  │  │  Goal Orchestration Engine (BUILD — core IP)│ │          │
│  │  │  Plan → Execute → Verify / Lifecycle Mgmt   │ │          │
│  │  ├─────────────────────────────────────────────┤ │          │
│  │  │  Custom Agent Definitions (BUILD — core IP) │ │          │
│  │  │  Research / Code / Docs / Data / Workflow   │ │          │
│  │  └─────────────────────────────────────────────┘ │          │
│  └──────┬───────────────────────────────────────────┘          │
│         │                                                      │
│  ┌──────▼────────┐ ┌──────────────┐ ┌────────────────────────┐ │
│  │ E2B/Firecrackr│ │ Nango        │ │ Qdrant                 │ │
│  │ Code Sandbox  │ │ Integrations │ │ Vector Store           │ │
│  │    (BUY)      │ │   (BUY)      │ │   (BUY)                │ │
│  └───────────────┘ └──────────────┘ └────────────────────────┘ │
│                                                                │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │    Secrets Vault — libsodium/NaCl (BUILD — core IP)      │  │
│  │    AES-256-GCM · Runtime Injection · Audit Log           │  │
│  │    Per-Agent Scoping · Instant Revocation                │  │
│  └──────────────────────────────────────────────────────────┘  │
│                                                                │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │          Langfuse — Self-Hosted (BUY)                    │  │
│  │          Observability / Traces / Cost Analytics         │  │
│  └──────────────────────────────────────────────────────────┘  │
│                                                                │
└────────────────────────────────────────────────────────────────┘
```

## Repository Structure

```
shield-ai/
├── README.md
├── prototype/
│   ├── shield-ai-v2.jsx              # Responsive prototype (mobile + desktop)
│   ├── shield-ai-mobile.jsx          # Mobile prototype (archived)
│   └── shield-ai-prototype.jsx       # Desktop prototype (archived)
└── proposal/
    ├── shield-ai-build-vs-buy.md     # Component architecture decisions (12 components)
    ├── shield-ai-product-discovery.md # Assumptions, validation, decision gates
    ├── shield-ai-proposal.pptx       # 10-slide pitch deck for QQM leadership
    └── shield-ai-roi-proposal.md     # Full ROI proposal & pricing model
```

## Prototype Features

The working prototype demonstrates:

- **Secrets Vault** — AES-256-GCM encrypted storage with runtime injection and real-time secret scanner (intercepts keys pasted into chat before they reach the model)
- **Goals Engine** — Credential-aware autonomous agent orchestration with live audit logging
- **Code Sandbox** — Ephemeral containers with Vault integration (secrets injected at runtime, container destroyed after execution)
- **Agent Suite** — Specialized agents (Deep Research, Code Engineer, Doc Generator, Data Analyst, Workflow Bot, Web Navigator) deployed by the Goals Engine
- **Privacy Dashboard** — Live transparency into credential lifecycle, injection events, and audit trails

## Navigation

4 bottom tabs: **Chat** (with secret scanner), **Goals** (replaces agents catalog), **Code** (with `{{secret}}` injection), **Privacy** (sub-toggle: Secrets Vault + Architecture).

Settings (gear icon in header): Plans & Pricing, Model Preferences, Integrations, Account & Team, Notifications.

## Pricing Model (5 Tiers)

| Tier | Price | Vault | Goals | Status |
|------|-------|-------|-------|--------|
| Shield Free | $0/mo | 0 | — | Existing (Quack.ai) |
| Shield Plus | $9.99/mo | 3 | Basic | Existing (QQM subscription) |
| Shield Pro | $19.99/mo | 25 + auto-rotate | Full | Existing (QQM Pro) |
| **Shield Teams** | **$29.99/user/mo** | **Shared + RBAC** | **Full + audit** | **New revenue** |
| **Shield Enterprise** | **$5,000+/mo** | **Unlimited + HSM** | **Full + templates** | **New revenue** |

## Revenue Projections

- **Conservative** (0.5% conversion): $163M ARR — 1.6x current QQM revenue
- **Moderate** (2% conversion): $653M ARR — 6.5x current QQM revenue
- **Aggressive** (5% conversion): $1.63B ARR — 16x current QQM revenue

## How to Run the Prototype

1. Open `prototype/shield-ai-v2.jsx` in Claude.ai as an artifact
2. Or import the component as the default export in any React app
3. Required dependencies: `react` (no external icon libraries — all SVGs inline)
4. Responsive: auto-detects viewport width (mobile ≤700px, desktop >700px)

## Status

Pre-seed. Seeking design partners in security-conscious engineering teams. 

Contact: jasonrpast@gmail.com


**Key principle:** Every component that touches user data is self-hosted. Everything else can be SaaS. This makes "zero retention" provable rather than promissory.
