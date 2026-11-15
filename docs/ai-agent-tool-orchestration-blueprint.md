# AI Agent & Tool Orchestration Blueprint

**System:** IMRAN AI Business OS  
**Status:** Architecture baseline committed; orchestration persistence and database guardrails deployed; runtime staged  
**Owner:** Founder Command Centre  
**Primary principle:** One orchestrator, bounded specialists, governed tools, auditable execution.

## 1. Objective

IMRAN AI is an operating system, not a collection of independent chatbots. The command orchestrator receives a founder request, classifies the work, selects an authorised specialist, grants only the tools needed for that task, supervises execution, checks outputs, and returns one consolidated result.

The seven registered agents are a starting roster, not seven autonomous production services. Registry status must never be presented as proof that a model runtime is deployed.

## 2. Target architecture

```text
Founder / approved trigger
        |
        v
Command interface (Founder Command Centre)
        |
        v
Orchestration API (authenticated Edge Function)
        |
        +--> Identity & organisation scope
        +--> Intent / risk classifier
        +--> Agent registry & capability resolver
        +--> Tool policy gateway
        +--> Approval gate
        |
        v
Run coordinator / job state machine
        |
        +--> Legal Research Assistant
        +--> Market Intelligence Specialist
        +--> Editorial & Content Producer
        +--> Business Development Analyst
        +--> Venture Research Specialist
        +--> Operations & Performance Analyst
        |
        v
Scoped tools / data services
        |
        v
Output validation + evidence checks
        |
        v
Audit trail + founder review queue + consolidated response
```

The Founder Command Orchestrator is the coordinator, not an eighth specialist. Specialists do not call arbitrary connectors directly. All tool access passes through the policy gateway.

## 3. Seven specialist agents

| Agent key | Responsibility | Initial posture |
|---|---|---|
| `legal-research` | Primary legal materials, propositions, citations, jurisdiction and currency flags | Human review; no legal advice or filing without Advocate review |
| `market-intelligence` | Six-division market, audience, competitor, platform and regulatory signals | Human review; evidence-linked findings |
| `editorial-production` | Convert approved research into drafts, scripts and platform adaptations | Draft only; never publish |
| `business-development` | Qualify opportunities and prepare internal pipeline notes | Human review; no prospect contact |
| `venture-specialist` | Sector research and venture planning across Arefin Avenue, IA² Holdings, C3 Lifestyle and Bold Cotton | Draft only |
| `operations-analyst` | KPI summaries, workflow audits, bottleneck and exception reports | Read only |
| `command-orchestrator` | Route tasks, enforce boundaries, supervise and consolidate | Human review for consequential work |

Agent definitions live in `public.ai_agents`. The live registry currently contains seven records. Only the orchestrator and market-intelligence records are marked configured; all others remain planned. This is configuration metadata, not evidence of a live model runtime.

## 4. Tool gateway and connection model

Every tool is registered by a stable key in `public.ai_tool_connections`. The current seven records are metadata for GitHub, scheduled intelligence, Notion, Supabase, Upload-Post, Vercel and web research.

A registry record is not an executable credential. The gateway must separately verify that:
1. The relevant provider account is connected in the runtime that will execute the call.
2. The required credential is present in server-side secret storage.
3. The requested action is included in the tool's permitted-action allowlist.
4. The calling agent is allowed to use that tool.
5. The user's organisation and role authorise the underlying record access.

Never store OAuth tokens, API keys, passwords, or service-role credentials in agent rows, browser code, prompts, run inputs, logs, or public repository files. Use server-side secrets and provider-specific least-privilege scopes.

### Initial tool policy

| Tool key | Permitted initial use | Explicitly excluded |
|---|---|---|
| `supabase` | Organisation-scoped reads and authorised writes under RLS | Browser-held service role; cross-organisation access |
| `web-research` | Public-source search and source capture | Treating snippets as verified legal authority |
| `github` | Read source, commit documentation, propose code changes | Secret extraction or unreviewed production changes |
| `vercel` | Inspect deployments and build status | Unreviewed domain, environment or production changes |
| `notion` | Search and read pages where permissions allow | Claiming task sync/write access that is not available |
| `upload-post` | Inspect profiles and prepare media | Publishing or scheduling without explicit founder approval and app-side credential validation |
| `notebook-automation` | Run the approved weekly intelligence brief | Expanding scope, publishing, contacting prospects or spending money |

ChatGPT-side connector availability and application-side credentials are separate. For example, the Upload-Post connector connected to ChatGPT does not automatically provide an API key to the deployed Vercel application.

## 5. Request lifecycle

1. **Intake:** accept a user request or an approved scheduled trigger; create a request ID.
2. **Authenticate:** validate the Supabase user JWT and resolve the active organisation from trusted membership records.
3. **Classify:** identify task type, division, data sensitivity, external side effects and required evidence.
4. **Plan:** select one primary specialist and only necessary supporting specialists. Avoid parallel agent calls unless tasks are genuinely independent.
5. **Authorise:** intersect agent allowlist, tool allowlist, organisation role and action risk policy. Deny by default.
6. **Execute:** call tools through server-side adapters with bounded inputs, timeouts, retry limits and idempotency keys.
7. **Validate:** check schema, evidence references, source quality, output completeness and policy compliance.
8. **Review:** pause for founder approval wherever an action is consequential or externally visible.
9. **Commit:** persist approved internal results and action receipts; do not infer success from a requested tool call.
10. **Report:** return a concise result, unresolved issues, sources, approval needs and next action.

## 6. Run state machine

Allowed states:

- `queued`
- `planning`
- `awaiting_approval`
- `running`
- `succeeded`
- `failed`
- `cancelled`

State transitions must be explicit and validated server-side. A failed or timed-out tool call must not be marked successful. Retries must reuse an idempotency key for the same intended action. Approval must be bound to a specific run, action payload, target and expiry; changing the payload invalidates the approval.

The existing `public.ai_agent_runs` table remains the specialist-level execution history. Three additional organisation-scoped tables are now deployed: `ai_orchestration_jobs` (request, risk class, state, idempotency and correlation), `ai_tool_call_receipts` (append-only tool outcomes and policy decisions), and `ai_approval_requests` (exact action payload, hash, target, expiry and decision). Database triggers enforce valid job-state transitions and prevent approval payload mutation after request creation. All three tables have RLS enabled; authenticated access is organisation-scoped, and anonymous privileges are revoked. The new tables currently contain zero execution records because the runtime is not yet deployed.

## 7. Approval and risk matrix

| Risk class | Examples | Default rule |
|---|---|---|
| Read-only | Search public sources, inspect internal permitted records, deployment status | May run within user/organisation permissions |
| Internal reversible write | Create draft brief, add research source, create internal task | Allowed only when agent and user permissions match; audit every write |
| Sensitive internal write | Legal matter, client data, finance records, permission changes | Require explicit human review; narrow scope |
| External side effect | Publish/schedule content, email/contact prospect, submit form, create booking | Explicit approval for exact action, destination, content and timing |
| Financial / irreversible | Spend, purchase, transfer, delete, production credential changes | Do not execute without explicit transaction-specific approval |

No agent may autonomously publish, schedule, contact a prospect, send an email, make a payment, change access controls, or file legal documents. Legal research outputs are working materials for Advocate review, not final legal advice.

## 8. Evidence and output contract

Every research-derived output should carry:
- source URL and publisher;
- publication date and access date where available;
- exact pinpoint (page, paragraph, section, timestamp or table);
- claim supported;
- evidence quality: verified, corroborated, preliminary or hypothesis;
- confidence and limitations;
- facts separated from interpretation and recommendations.

Legal work requires primary authority where available, current-law checks, jurisdiction, procedural posture and pinpoint citations. A search-result snippet alone is not sufficient authority.

## 9. Persistence and observability

Use the organisation-scoped Supabase schema as the system of record:
- `ai_agents`: agent definitions, version and policy.
- `ai_tool_connections`: provider metadata and permitted actions, never secrets.
- `ai_agent_runs`: run lifecycle and high-level result.
- Next increment: structured run payload/result, tool-call receipts, approval records and correlation IDs.

Every run should record request ID, trace ID, user ID, organisation ID, agent key/version, tool key/action, policy decision, start/end time, status, latency, retry count and redacted error. Tool receipts should record the target resource and provider response reference, not secret request headers or raw credentials.

Use append-only audit events for approvals and externally consequential actions. Logs must redact personal and confidential data not needed for debugging.

## 10. Failure handling

- Deny unknown agent keys, tool keys, actions and organisation IDs.
- Fail closed when permissions, credentials or provider status cannot be verified.
- Apply bounded retries only to transient failures; do not retry non-idempotent external actions blindly.
- Use per-provider timeouts and circuit breakers.
- Preserve partial outputs with explicit incomplete status; never fabricate completion.
- Surface connector write limitations (including Notion write access) as blockers rather than silently substituting a different workflow.

## 11. Delivery sequence

### Phase 0 — Architecture and registry baseline
- Preserve the seven-agent registry and seven tool records.
- Document routing, tool permissions, risk classes, approvals and run lifecycle.
- Keep all agent statuses honest.

### Phase 1 — Durable orchestration records
- Add structured orchestration jobs, approval decisions and tool-call receipts.
- Enforce organisation-scoped RLS and append-only audit semantics.
- Add database constraints and indexes for idempotency and run correlation.

### Phase 2 — Authenticated orchestration endpoint
- Deploy a JWT-protected Supabase Edge Function.
- Use caller-scoped Supabase access for user operations.
- Keep privileged access limited to server-side operations with explicit organisation checks.
- Do not expose model or connector secrets to the browser.

### Phase 3 — First live specialist
- Start with read-only Operations Analyst or Market Intelligence.
- Use one model provider adapter and a small tool allowlist.
- Record evidence and execution receipts.
- Run authenticated browser tests with the founder before enabling writes.

### Phase 4 — Controlled internal writes
- Add creation of internal research briefs and opportunity signals.
- Add idempotency and human review.
- Test RLS, cross-organisation denial, duplicate submissions and failure recovery.

### Phase 5 — Approval-gated integrations
- Connect Upload-Post app-side API key and other provider credentials through server-side secret storage.
- Add exact-action approval records.
- Keep publishing, outreach and financial actions disabled until separately tested and explicitly authorised.

### Phase 6 — Scale specialist coverage
- Add legal research, editorial, business development and venture agents one at a time.
- Expand only after each agent passes permission, evidence, reliability and audit tests.

## 12. Acceptance criteria before calling the orchestrator operational

- Unauthenticated requests are rejected.
- A user cannot access another organisation's runs or records.
- Agent/tool allowlists are enforced server-side, not merely hidden in the UI.
- Unknown tools/actions fail closed.
- Approval is bound to an immutable action payload and expires.
- Duplicate requests do not duplicate writes.
- Tool calls have durable receipts and trace IDs.
- Secrets never appear in client bundles, database metadata or logs.
- Failure and timeout states are visible and truthful.
- Signed-in browser tests pass for allowed and denied cases.
- No external side effect occurs without exact founder approval.

## 13. Current implementation truth

The database currently contains seven agent definitions and seven tool-connection metadata records. The three new orchestration tables are deployed and verified, but all job, receipt and approval tables are empty. The Founder Command Centre has a read-only registry view. The orchestration Edge Function, model provider adapter, server-side tool dispatcher, connected model credentials and live run/approval interface are not yet deployed. Signed-in browser tests are outstanding. This blueprint is the implementation contract; it is not a claim that autonomous agents are already running.
