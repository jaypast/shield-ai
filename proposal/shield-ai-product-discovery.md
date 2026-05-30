# Shield AI — Product Discovery Document

## Purpose

This document maps every critical assumption in the Shield AI thesis, rates each by risk and impact, and prescribes the cheapest, fastest experiment to validate or kill it before committing engineering resources. The goal is to derisk the $1.5–3M build investment by spending $15–30K and 4–6 weeks on validation first.

The build-vs-buy architecture decision (detailed in the separate Architecture Decision Record) reduces Shield AI's custom engineering to approximately 30% of the total platform. The remaining 70% is bought and self-hosted using LiteLLM, LangGraph, E2B, Nango, Langfuse, and Qdrant. This document now includes vendor-specific assumptions that must be validated alongside demand, product, pricing, and competitive assumptions.

---

## Assumption Map

### CATEGORY 1: DEMAND ASSUMPTIONS

These assumptions answer the question: does the market we're targeting actually exist at the size we claim?

---

**Assumption 1.1: QQM users want AI platform features beyond basic chat**

We assume that Quack.ai's current user base — people who already chose a privacy-first search engine — will also want agents, code execution, document generation, and enterprise integrations from the same provider. This is the foundational demand assumption. If QQM users only want simple Q&A chat, Shield AI has no market.

Risk: HIGH
Impact: CRITICAL — the entire product depends on this

How to validate: Run a survey to 2,000–5,000 existing Quack.ai users via QQM's email list or in-product prompt. The survey should present five feature concepts (multi-model routing, autonomous agents, code sandbox, document generation, enterprise integrations) and ask respondents to rank them by likelihood of use. Include a willingness-to-pay question using the Van Westendorp price sensitivity model. Success threshold: 40%+ of respondents express interest in at least 2 features beyond basic chat, and 20%+ indicate willingness to pay $20+/month.

Backup validation: Analyze Quack.ai usage logs (if accessible) to identify power users who hit daily limits consistently. These users are the natural early adopters. If fewer than 5% of Quack.ai users hit rate limits regularly, demand for a premium tier may be weaker than projected.

Timeline: 2 weeks
Cost: $500–$2,000 (survey platform + incentives)

---

**Assumption 1.2: Privacy is a purchase driver for AI tools, not just search**

We assume the privacy preference that drove users to QQM for search will transfer to AI tool purchasing decisions. This is not guaranteed — users may compartmentalize privacy concerns (caring about search privacy but not AI chat privacy), or may prioritize capability over privacy when choosing AI tools.

Risk: MEDIUM-HIGH
Impact: HIGH — undermines the entire positioning if false

How to validate: Design a conjoint analysis experiment. Present 500+ respondents with hypothetical AI tool bundles that vary across four dimensions: feature set (basic vs. advanced), price ($10 vs. $20 vs. $30), brand (known AI brand vs. privacy brand vs. unknown), and privacy architecture (standard data collection vs. anonymized vs. zero retention). Measure which attribute combinations drive purchase intent. Success threshold: privacy architecture ranks as the #1 or #2 decision driver for at least 35% of respondents.

Backup validation: Run two identical landing pages for a "private AI platform" — one emphasizing features, one emphasizing privacy guarantees. Measure click-through on "Join Waitlist" to see which framing converts higher. A/B test with $2,000 in targeted ads to QQM browser users.

Timeline: 3 weeks
Cost: $3,000–$5,000 (conjoint platform + ad spend)

---

**Assumption 1.3: Enterprise buyers will pay a premium for privacy-certified AI**

We cited a "3.2x willingness-to-pay premium" from Gartner for privacy-certified AI tools. We assume regulated industries (healthcare, legal, finance, government) are actively looking for solutions and will pay $29.99/user/month or $5,000+/month for enterprise tiers. This may be true in theory but blocked in practice by procurement cycles, existing vendor relationships, or internal build-vs-buy preferences.

Risk: MEDIUM
Impact: HIGH — the enterprise tier is where the real revenue scales

How to validate: Conduct 15–20 customer discovery interviews with IT decision-makers and compliance officers in regulated industries. Use a screening survey on LinkedIn or through industry associations to find people who have evaluated or rejected AI tools due to privacy concerns. In the interviews, validate the specific pain points, current workarounds, budget authority, and whether "QuackQuackMoo" as a brand carries trust in enterprise contexts. Also test whether "Secured by Palo Alto Networks Prisma AIRS" (our planned Phase 3 security layer) resonates as a procurement signal. Success threshold: 10+ of 20 interviewees confirm they have budget allocated for privacy-compliant AI tools and would evaluate a QQM-branded solution.

Backup validation: Post a "Shield AI Enterprise" landing page targeting regulated industries. Run $3,000 in LinkedIn ads targeting CISO, CTO, and compliance officer titles at companies with 200+ employees. Measure demo request conversions. If cost-per-lead exceeds $200, enterprise demand may be softer than projected.

Timeline: 4 weeks
Cost: $3,000–$6,000 (LinkedIn ads + interview incentives)

---

### CATEGORY 2: PRODUCT ASSUMPTIONS

These assumptions answer the question: are we building the right thing?

---

**Assumption 2.1: Multi-model routing delivers real value over single-model access**

We assume users benefit from intelligent routing across 100+ models (via self-hosted LiteLLM) rather than just picking one good model. This is a pattern that Abacus AI validated with strong market traction. However, most users may not care which model answers their query — they just want a good answer. The auto-route intelligence layer we're building on top of LiteLLM could be engineering overhead that doesn't move the needle on user satisfaction.

Risk: MEDIUM
Impact: MEDIUM — if false, we simplify the architecture but LiteLLM still provides fallbacks and cost optimization

How to validate: Build a lightweight A/B test within the prototype. Give 200 beta users two modes: "auto-route" (our custom intelligence layer picks the model) and "manual select" (user picks from the LiteLLM model list). Track which mode users prefer after 2 weeks of usage, and measure satisfaction scores for both. Success threshold: auto-route is preferred by 60%+ of users AND receives equal or higher quality ratings.

If validation fails: The auto-route intelligence layer is only 2–4 weeks of engineering. If users don't value it, drop it and let LiteLLM handle basic routing with fallbacks. The cost savings are minimal but it simplifies the product.

Timeline: 3 weeks (requires beta users)
Cost: $1,000–$2,000 (API costs for running multiple models)

---

**Assumption 2.2: Autonomous agents are a must-have, not a nice-to-have**

We assume the agent framework (multi-step workflows built on LangGraph, like "research X, build a deck, email it to my team") is a key differentiator that justifies the price jump from $19.99 to $29.99. However, agent technology across the industry is still unreliable. LangGraph is the most production-ready framework available (used by Klarna, LinkedIn, Uber), but even production-grade agents fail at meaningful rates. If agents fail 30%+ of the time, users will lose trust quickly and revert to manual chat.

Risk: HIGH
Impact: HIGH — agents are the primary feature differentiator for Shield Teams

How to validate: Before building custom agent definitions on LangGraph, create a "Wizard of Oz" test. Set up 50 beta users with a chat interface that appears to have agent capabilities, but behind the scenes a human operator executes the multi-step workflows using existing AI tools. Measure completion rates, user satisfaction, and the types of workflows users actually request. Success threshold: 70%+ of agent tasks are completable, and users rate agent outputs as "useful" or "very useful" 60%+ of the time.

Critical insight to capture: What are the top 10 workflows users actually request? This data shapes which of the six custom agent personas (Research, Code, Docs, Data, Workflow, Browser) to build first on LangGraph, and which can wait for Phase 2.

Timeline: 3 weeks
Cost: $3,000–$5,000 (operator labor + beta user incentives)

---

**Assumption 2.3: The code sandbox is a meaningful feature for QQM's user base**

We assume QQM users include enough developers and technical users to justify integrating E2B (Firecracker microVM sandbox) for ephemeral code execution. QQM's user demographics skew male, 25–34, higher income — which correlates with technical roles. But if QQM's core audience is primarily privacy-conscious consumers rather than developers, the sandbox may serve a small fraction of the user base.

Risk: MEDIUM
Impact: LOW-MEDIUM — sandbox is one of five pillars and can be deprioritized. E2B integration is approximately 2 weeks of engineering, so the cost of being wrong is low.

How to validate: Add a feature-interest question to the Assumption 1.1 survey, specifically asking about code execution. Also analyze the demographic breakdown of Quack.ai power users (if QQM shares data). Success threshold: 25%+ of surveyed users express interest in code execution features.

If validation fails: Deprioritize E2B integration to Phase 3 or later. The product still works with routing + agents + doc generation + integrations. The $150/month E2B cost is not incurred until the feature ships.

Timeline: included in Assumption 1.1 survey
Cost: $0 incremental

---

**Assumption 2.4: Users will trust QuackQuackMoo for enterprise integrations**

We assume users will connect their Slack, Google Drive, GitHub, and other workplace tools to a QQM-branded product via Nango (self-hosted integration platform). This requires a different kind of trust than search privacy — it means granting OAuth access to proprietary business data. Even with Nango self-hosted (so all tokens and API data stay within QQM's infrastructure), users may be uncomfortable granting those permissions.

Risk: MEDIUM-HIGH
Impact: MEDIUM — integrations are key for Teams tier stickiness

How to validate: In the customer discovery interviews (Assumption 1.3), specifically ask: "Would you connect your company's Slack/Drive/GitHub to a QuackQuackMoo AI product? What would you need to see before doing so?" Track the specific objections and requirements (SOC2 cert, security audit, on-prem option, etc.). Success threshold: 60%+ of interviewees say they would connect integrations given appropriate security certifications.

Timeline: included in Assumption 1.3 interviews
Cost: $0 incremental

---

### CATEGORY 3: PRICING ASSUMPTIONS

These assumptions answer the question: will people pay what we're charging?

---

**Assumption 3.1: $29.99/user/month is the right price for Shield Teams**

We set this price to sit above QQM Pro ($19.99) but below individual AI subscriptions stacked together ($60+). However, we have no data on whether this price point maximizes revenue. Too high and we lose conversion; too low and we leave money on the table. The buy-vs-buy stack keeps vendor costs at $12–25K/month total, so even at modest subscriber counts the unit economics work — but optimal pricing maximizes total ARR.

Risk: MEDIUM
Impact: HIGH — directly determines ARR

How to validate: Use the Van Westendorp price sensitivity data from the Assumption 1.1 survey to find the optimal price range. Additionally, run a Gabor-Granger price test: show 500 respondents the Shield Teams feature set and ask purchase intent at $14.99, $19.99, $24.99, $29.99, and $39.99. Plot the demand curve. Success threshold: identify a price point where 25%+ of respondents express "definitely would subscribe" or "probably would subscribe."

Timeline: included in Assumption 1.1 survey
Cost: $0 incremental

---

**Assumption 3.2: The conversion rates (0.5%–5%) are achievable**

We projected 0.5% (conservative) to 5% (aggressive) conversion from QQM's 80M users to Shield Teams subscribers. These rates are based on general SaaS benchmarks, not QQM-specific data. QQM's actual free-to-paid conversion on their current subscription is unknown publicly — if it's below 0.5%, our conservative case may still be optimistic.

Risk: HIGH
Impact: CRITICAL — revenue projections depend entirely on this

How to validate: If QQM shares their current Plus/Pro conversion data, benchmark against it. If not, estimate from external signals: QQM has ~80M users and the subscription launched in 2024. Industry benchmarks for privacy-tool freemium conversion are 2–4%. For a more expensive tier ($29.99 vs. $9.99), apply a 60–70% discount to the base conversion rate. Also, run a pre-launch waitlist with a "$29.99/month" price displayed. Measure the ratio of landing page visitors to waitlist signups. Success threshold: waitlist conversion rate of 8%+ from landing page visitors suggests viable demand.

Timeline: 2 weeks
Cost: $2,000–$4,000 (landing page + ad spend)

---

### CATEGORY 4: TECHNICAL ASSUMPTIONS

These assumptions answer the question: can the chosen technology stack support the product?

---

**Assumption 4.1: QQM's anonymization relay can handle platform-level load through LiteLLM**

We assume QQM's existing PII-stripping relay can handle not just simple chat queries but also the amplified load from LiteLLM routing to multiple providers with fallbacks, agent workflows via LangGraph (which may involve 10–50 API calls per user session), E2B sandbox provisioning, and Nango integration sync. The current relay was built for stateless chat — Shield AI routes significantly more traffic per user through the same pipeline.

Risk: MEDIUM
Impact: HIGH — if the relay becomes a bottleneck, latency degrades and the "only 12ms privacy overhead" claim fails

How to validate: Model the expected load profile for a Shield Teams user session: average 15 model calls per agent workflow (LangGraph), 5 workflows per day, 3 integration syncs (Nango), and 2 sandbox sessions (E2B) per user per day, at 50,000 concurrent users. Compare against known QQM relay capacity. If QQM grants infrastructure access, run a load test with synthetic traffic through the relay into LiteLLM. Success threshold: p99 latency through the relay stays under 50ms at projected load.

Timeline: 1 week (modeling), or 2–3 weeks (if QQM grants infra access)
Cost: $0–$2,000

---

**Assumption 4.2: E2B's Firecracker microVMs meet the zero-retention latency and privacy bar**

E2B claims 150ms cold starts with Firecracker microVM isolation, and is used by Perplexity and Hugging Face for agent code execution. We assume this performance holds under our usage patterns and that E2B's managed service can operate within QQM's zero-retention architecture — either through contractual guarantees or by self-hosting E2B's open-source core with Firecracker directly.

Risk: LOW-MEDIUM
Impact: MEDIUM — affects code sandbox experience. If E2B fails, Modal (gVisor-based, Python-only) or self-hosted Firecracker are fallback options.

How to validate: Run a 1-week proof-of-concept with E2B's managed service. Benchmark cold-start latency with typical Shield AI workloads (Python data analysis, JS web scraping, multi-file projects). Simultaneously, negotiate zero-retention contractual terms with E2B's enterprise team. Success threshold: cold start under 300ms at p95, full teardown confirmed under 1 second, and E2B agrees to contractual zero-retention terms. If contractual terms fail, benchmark self-hosted Firecracker as a fallback.

Timeline: 1–2 weeks
Cost: $500 (E2B Pro plan + cloud compute for Firecracker benchmark)

---

**Assumption 4.3: LiteLLM self-hosted is production-reliable at Shield AI's scale**

LiteLLM is the default open-source model routing proxy, but self-hosting it in production requires managing Redis, Postgres, and the proxy cluster. At scale (50,000+ concurrent users, 100+ model endpoints with fallback chains), the operational overhead could be significant. Reviews note that LiteLLM "requires engineering ownership" and can introduce serialization overhead at high throughput.

Risk: MEDIUM
Impact: HIGH — LiteLLM is the backbone of the entire routing layer. If it's unreliable, every feature breaks.

How to validate: Deploy a self-hosted LiteLLM proxy in a staging environment during Phase 1. Run synthetic load at 2x projected peak traffic. Measure request failure rates, p99 latency, and Redis memory usage under sustained load. Also evaluate the fallback behavior: when one model provider goes down, does LiteLLM reroute correctly without dropping requests? Success threshold: 99.9% request success rate, p99 latency under 200ms, and clean fallback behavior across all configured providers.

Backup plan: If LiteLLM fails at scale, evaluate Portkey (managed, better observability, but requires privacy architecture review) or build a thin custom routing layer using the OpenAI-compatible API format. Custom routing is approximately 6–8 weeks of engineering — significant but not project-killing.

Timeline: 2–3 weeks (during Phase 1)
Cost: $1,000–$2,000 (staging infrastructure)

---

**Assumption 4.4: LangGraph supports the agent complexity Shield AI requires**

LangGraph is the production standard for stateful agent workflows, but Shield AI's custom agents (particularly Deep Research and Workflow Bot) involve complex multi-step graphs with parallel execution, external tool calls (to LiteLLM, E2B, Nango), and human-in-the-loop checkpoints. We assume LangGraph's graph primitives, checkpointing, and state management can handle this complexity without excessive boilerplate or performance degradation.

Risk: LOW-MEDIUM
Impact: HIGH — LangGraph powers all six agent personas. Migration to a different framework mid-build would cost 2–3 months.

How to validate: Build the simplest agent first (Doc Generator) as a LangGraph proof-of-concept during the first 2 weeks of Phase 1. This agent involves a linear workflow (query → model call → format → output) and validates the basic integration between LangGraph, LiteLLM, and the document rendering libraries. Then build the most complex agent (Deep Research) as the second proof-of-concept — this involves parallel web searches, multi-source synthesis, and iterative refinement, which stress-tests LangGraph's branching and state management. Success threshold: both agents complete 90%+ of test tasks correctly, with LangGraph overhead under 500ms per graph traversal.

Timeline: 3–4 weeks (during Phase 1)
Cost: $0 incremental (part of Phase 1 development)

---

**Assumption 4.5: The $1.7–3.3M build cost estimate holds with the buy-vs-build stack**

We estimated a 12-person team over 6 months, with 70% of the platform bought and self-hosted. This assumes LiteLLM, LangGraph, E2B, Nango, Langfuse, and Qdrant all integrate cleanly and don't require significant custom wrappers or workarounds. It also assumes the Secrets Vault and Goal Orchestration Engine can be built within the estimated 14–18 weeks by the 2 additional engineers. If integration proves harder than expected (incompatible APIs, missing features, self-hosting complexity), custom engineering hours increase and the cost estimate grows.

Risk: MEDIUM
Impact: MEDIUM — cost overruns affect the ROI pitch, but the buy-vs-build approach provides natural escape valves (drop a vendor, build a simpler version)

How to validate: During the Phase 1 proof-of-concept (weeks 1–4), track actual engineering hours per integration. If LiteLLM integration takes 3 weeks instead of 1, or Nango requires significant custom wrappers, extrapolate the impact on total build cost. Get independent sanity-check estimates from 2–3 senior engineers who have worked with these specific tools. Success threshold: independent estimates fall within 1.5x of the $1.7–3.3M range, and Phase 1 integration hours track within 20% of plan.

Timeline: 4 weeks (Phase 1 actuals) + 2 weeks (advisor review)
Cost: $2,000–$5,000 (advisor fees)

---

**Assumption 4.6: libsodium/NaCl provides sufficient cryptographic primitives for the Secrets Vault**

We assume libsodium's AES-256-GCM implementation is secure and performant enough for secret encryption at scale. This is a low-risk assumption — libsodium is the industry-standard cryptographic library used by Signal, WhatsApp, and Cloudflare.

Risk: LOW
Impact: HIGH — the entire Vault feature depends on it

How to validate: Security audit of the encryption implementation during Phase 1. Use established test vectors for AES-256-GCM. Engage a third-party cryptography reviewer before launch. Success threshold: third-party reviewer confirms implementation follows cryptographic best practices with no vulnerabilities.

Timeline: 2 weeks (during Phase 1)
Cost: $5,000–$10,000 (third-party review)

---

**Assumption 4.7: LangGraph checkpointing supports goal lifecycle management at scale**

We assume LangGraph's Postgres-backed checkpointing can handle thousands of concurrent paused goals without degrading database performance or checkpoint integrity. LangGraph checkpointing is designed for this use case, but we haven't benchmarked it at Shield's projected scale.

Risk: MEDIUM
Impact: MEDIUM — if checkpointing degrades, we can limit concurrent paused goals per user

How to validate: Load test LangGraph checkpointing with 5,000 concurrent paused graphs during Phase 1. Measure checkpoint size, restore latency, and Postgres load. Success threshold: checkpoint restore under 500ms at p95, Postgres CPU under 70% with 5,000 concurrent paused graphs.

Timeline: 1 week (during Phase 1)
Cost: $500 (cloud compute for load testing)

---

**Assumption 4.8: Real-time chat scanning doesn't degrade input latency**

We assume client-side regex matching against ~20 credential patterns adds negligible latency to the chat input. Modern browsers execute simple regex matches in microseconds, but this needs validation on low-end mobile devices.

Risk: LOW
Impact: LOW — worst case, scanner runs on debounced input (every 300ms) instead of every keystroke

How to validate: Benchmark on iPhone SE, Pixel 4a, and a low-end Android device during frontend development. Success threshold: scanner adds less than 5ms to input processing on all test devices.

Timeline: 1 day
Cost: $0

---

### CATEGORY 5: VENDOR & INTEGRATION ASSUMPTIONS

These assumptions answer the question: will the bought components work together as a coherent platform?

---

**Assumption 5.1: Nango covers all required integrations with acceptable auth complexity**

We assume Nango's self-hosted platform provides pre-built OAuth flows and API wrappers for all priority integrations: Slack, Google Drive, Gmail, GitHub, Jira, Notion, Confluence, and Microsoft Teams. If any critical integration is missing or the OAuth flow is unreliable, we either build a custom connector (2–4 weeks per integration) or drop the integration from the launch.

Risk: LOW-MEDIUM
Impact: MEDIUM — missing integrations reduce Teams tier stickiness but don't kill the product

How to validate: Deploy Nango self-hosted in a staging environment. Test the OAuth flow and basic CRUD operations for all 8 priority integrations. Specifically test: token refresh reliability over 7 days, rate limit handling, and webhook delivery consistency. Success threshold: all 8 integrations complete OAuth and basic operations successfully, with token refresh working over a 7-day test period.

Timeline: 1 week
Cost: $0 (Nango is open source, uses staging infrastructure)

---

**Assumption 5.2: Langfuse self-hosted provides sufficient observability without data leakage**

We assume Langfuse can capture LangGraph traces, LiteLLM cost data, and E2B sandbox execution logs in a unified dashboard — all self-hosted with zero data leaving QQM's infrastructure. If Langfuse's self-hosted version lacks critical features available only in the managed cloud (e.g., advanced analytics, alerting), we may need to supplement with custom tooling.

Risk: LOW
Impact: LOW-MEDIUM — observability is important for debugging but not user-facing

How to validate: Deploy Langfuse self-hosted during Phase 1. Verify that LangGraph callback integration captures full agent traces, LiteLLM cost tracking feeds into Langfuse dashboards, and the self-hosted version includes alerting on cost spikes and error rate thresholds. Success threshold: end-to-end trace visibility from user query through LiteLLM routing through LangGraph agent execution through E2B sandbox, all visible in a single Langfuse dashboard.

Timeline: 1 week (during Phase 1)
Cost: $0 incremental

---

**Assumption 5.3: Prisma AIRS API Intercept mode adds acceptable latency**

In Phase 3, we upgrade from open-source Guardrails AI to Palo Alto Prisma AIRS for enterprise-grade AI security. Prisma AIRS scans every prompt and response via its API Intercept — but this adds a synchronous network call to every user interaction. We assume this latency is acceptable (under 100ms per scan) and doesn't degrade the user experience relative to the security benefit.

Risk: LOW-MEDIUM
Impact: MEDIUM — only affects Phase 3 (Enterprise tier). Free/Plus/Pro tiers continue using Guardrails AI.

How to validate: During Phase 3 planning, run Prisma AIRS in shadow mode — scan prompts and responses in parallel with the live response, without blocking the user. Measure scan latency and compare p95 response times with and without Prisma AIRS inline. Success threshold: Prisma AIRS adds under 100ms at p95 and catches at least 95% of prompt injection test cases.

Backup plan: If latency is unacceptable, run Prisma AIRS asynchronously (scan after response delivery) and flag/quarantine problematic interactions retroactively. This reduces real-time protection but eliminates the latency hit.

Timeline: 2 weeks (during Phase 3)
Cost: included in Prisma AIRS enterprise contract

---

**Assumption 5.4: Open-source vendor lock-in risk is manageable**

We chose open-source tools (LiteLLM, LangGraph, Nango, Langfuse, Qdrant) specifically to avoid vendor lock-in. However, "open source" doesn't eliminate lock-in — it shifts it to API surface lock-in. If LangGraph changes its graph API, or LiteLLM deprecates a feature we depend on, migration costs could be significant. We assume the open-source ecosystem remains stable enough over the 12-month build-and-scale period.

Risk: LOW
Impact: MEDIUM — migration from any single vendor is 4–8 weeks but doesn't kill the product

How to validate: Assess each vendor's release cadence, breaking change history, and community governance. Prioritize vendors with stable v1.0+ releases (LangGraph hit v1.0 in late 2025, LiteLLM is mature). Pin dependency versions and maintain a "vendor health" monitoring process. Success threshold: no critical breaking changes in any vendor's last 6 months of release history, and all chosen tools are at v1.0+ stability.

Timeline: 1 week (initial assessment), ongoing monitoring
Cost: $0

---

### CATEGORY 6: COMPETITIVE ASSUMPTIONS

These assumptions answer the question: will the market window stay open?

---

**Assumption 6.1: No competitor will ship "privacy-first AI platform" in the next 18 months**

We assume QQM has an 18-month window to own this category. However, enterprise security companies (CrowdStrike, Palo Alto Networks, Zscaler), privacy-focused browsers (Brave), privacy email providers (Proton), or well-funded startups could enter this space. Notably, Palo Alto Networks (our Phase 3 security vendor) already has the infrastructure — if they build a consumer-facing AI platform on top of Prisma AIRS, they'd be a formidable competitor.

Risk: MEDIUM
Impact: HIGH — first-mover advantage is central to the thesis

How to validate: Conduct a competitive intelligence sweep every 2 weeks. Monitor Crunchbase for funding rounds in "private AI" or "secure AI" startups. Track product announcements from Brave, Proton, and enterprise security companies. Set Google Alerts for "privacy AI platform," "zero retention AI," and "HIPAA AI assistant." Specifically monitor Palo Alto Networks for any consumer AI product announcements beyond Prisma AIRS. Success threshold: no funded competitor announces a comparable product within the first 6 months of development.

Timeline: ongoing
Cost: $0 (monitoring only)

---

**Assumption 6.2: Abacus AI won't add a privacy layer**

We're betting that Abacus AI's lack of privacy positioning is structural, not strategic — that their architecture makes zero-retention impossible to bolt on. If Abacus ships a "privacy mode" with anonymized queries, they neutralize Shield AI's primary differentiator while having a 3-year head start on platform features. Their credit system, user profiling, and upsell model all depend on tracking usage — zero retention would undermine their business model.

Risk: LOW-MEDIUM
Impact: MEDIUM — would force repositioning but not kill the product (QQM brand trust still wins)

How to validate: Monitor Abacus AI product announcements, job postings (look for privacy/compliance engineering hires), and patent filings. Also assess architecturally: if Abacus adopts a buy-vs-build approach similar to ours, they could integrate Prisma AIRS or a competing security layer — but without a privacy-first brand, the market positioning would be derivative.

Timeline: ongoing
Cost: $0

---

## Validation Priority Matrix

Ordered by risk multiplied by impact, highest priority first:

Priority 1 — Validate before any engineering ($6K–$12K, weeks 1–3):
- Assumption 1.1: QQM users want platform features beyond chat
- Assumption 3.2: Conversion rates are achievable
- Assumption 1.2: Privacy drives AI purchase decisions

Priority 2 — Validate in parallel with early development ($3K–$5K, weeks 2–5):
- Assumption 2.2: Agents are a must-have (Wizard of Oz test)
- Assumption 1.3: Enterprise buyers will pay the premium
- Assumption 3.1: $29.99 is the right price point

Priority 3 — Validate during Phase 1 build ($6K–$14K, weeks 1–8):
- Assumption 4.3: LiteLLM is production-reliable at scale
- Assumption 4.4: LangGraph handles agent complexity
- Assumption 4.6: libsodium provides sufficient crypto for Vault ($5K–$10K review)
- Assumption 4.7: LangGraph checkpointing supports goal lifecycle at scale
- Assumption 4.8: Chat scanner latency is acceptable
- Assumption 4.2: E2B meets latency and privacy bar
- Assumption 4.1: QQM relay handles platform-level load
- Assumption 5.1: Nango covers all required integrations
- Assumption 4.5: Build cost estimate holds

Priority 4 — Validate during Phase 3 ($0, weeks 28–36):
- Assumption 5.3: Prisma AIRS latency is acceptable
- Assumption 2.4: Users trust QQM for integrations

Priority 5 — Monitor ongoing ($0):
- Assumption 6.1: No competitor enters within 18 months
- Assumption 6.2: Abacus doesn't add privacy
- Assumption 5.4: Open-source vendor lock-in is manageable
- Assumption 2.3: Code sandbox matters to this audience
- Assumption 5.2: Langfuse self-hosted is sufficient
- Assumption 2.1: Multi-model routing adds value

---

## Validation Budget Summary

Total estimated validation cost: $20,000–$40,000
Total estimated timeline: 4–6 weeks (most experiments run in parallel)

This represents approximately 1% of the projected build cost and can confirm or kill the project before committing engineering resources. The vendor-specific assumptions (Category 4 and 5) are validated during Phase 1 development at near-zero incremental cost, since they're proven through the same proof-of-concept work that produces the beta product. The exception is the Secrets Vault cryptographic review ($5,000–$10,000), which requires a third-party specialist.

---

## Decision Gates

**Gate 1 — Week 3: Demand Signal**
If Assumptions 1.1, 1.2, and 3.2 all fail validation, stop the project. The market does not exist at the size or price point we need. Total investment at risk: $6,000–$12,000.

**Gate 2 — Week 5: Product-Market Fit Signal**
If Assumptions 2.2 and 1.3 fail, pivot the product scope. Drop agents and enterprise integrations. Ship a simpler "Shield Plus+" that adds LiteLLM multi-model routing to the existing QQM subscription without LangGraph agents or Nango integrations. This reduces the build to $300K–$600K (3-person team, 3 months) and targets the consumer segment only.

**Gate 3 — Week 8: Technical Confidence**
If LiteLLM or LangGraph fail their Phase 1 proof-of-concept (Assumptions 4.3 and 4.4), assess migration cost. LiteLLM failure: evaluate Portkey or a custom routing layer (6–8 weeks). LangGraph failure: evaluate CrewAI with Flows (4–6 weeks migration) or a custom orchestration layer. If both fail simultaneously, the build cost estimate doubles and the project should be rescoped or paused.

**Gate 4 — Week 12: Integration Confidence**
If Assumption 4.5 (build cost) comes back at 2x+ the original estimate based on Phase 1 actuals, renegotiate scope and phasing. Consider shipping a 2-pillar MVP (routing + one agent) rather than all five pillars simultaneously. This still delivers a differentiated product at a fraction of the full cost.

Passing all four gates with positive signals means the project has earned the right to proceed to full engineering investment with high confidence.
