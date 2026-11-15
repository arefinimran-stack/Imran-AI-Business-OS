# IMRAN AI — Agent and Tool Orchestration Architecture

**Status:** Foundation registered; runtime orchestration is not yet deployed  
**Workspace:** IMRAN AI Business OS  
**Operating timezone:** Asia/Dhaka

## 1. Design decision

IMRAN AI is the control plane for a small, governed team of specialist AI agents and connected tools. It is not a collection of autonomous bots with unrestricted access. The founder dashboard owns work routing, permissions, review queues, auditability and consolidated status. Specialist agents perform bounded research or drafting tasks and return structured outputs to the workspace.

The first objective is dependable execution, not the maximum number of agents.

## 2. Initial specialist roster

| Agent key | Responsibility | Initial access posture |
|---|---|---|
| `command-orchestrator` | Route work, coordinate specialists and report status | Human review for actions |
| `legal-research` | Find primary law, judgments and official regulatory materials; extract propositions and citations | Human advocate review; no client advice or filing |
| `market-intelligence` | Monitor six-division market, audience, competitor, platform and regulatory signals | Human review before approval |
| `editorial-production` | Convert approved evidence into scripts, articles, carousels and platform adaptations | Draft only; no publishing |
| `business-development` | Research and qualify commercial opportunities for internal review | No prospect contact or outreach |
| `operations-analyst` | Read workspace records, report KPIs and identify bottlenecks | Read only |
| `venture-specialist` | Support division-specific sector and product research | Draft only |

The six business divisions remain separate editorial and operating contexts: Arefin Legal & Corporate Group, Imran Arefin, Arefin Avenue, IA² Holdings, C3 Lifestyle and Bold Cotton.

## 3. Tool connection register

The `ai_tool_connections` table is a capability and connection-status register, not a credential store. It records provider, connection type, scopes, permitted actions and verification notes. It must never contain raw API keys, OAuth refresh tokens, passwords, cookies or private credentials.

Current recorded posture:

- Supabase: workspace database; row-level security is the access boundary.
- GitHub and Vercel: connected to the assistant's tool environment for repository and deployment work. This does not mean the deployed Next.js runtime has those credentials.
- Notion: connected for reading; task write/synchronisation remains unverified.
- Upload-Post: ChatGPT connector is connected. The app's own server-side API key and publishing route are not configured or verified.
- Web research: available in the assistant environment, not a separately deployed app integration.
- Weekly intelligence automation: enabled in ChatGPT Automations; this is not an app-side cron worker.

Connection status must be evidence-based. A connected ChatGPT connector is not automatically an application integration.

## 4. Database foundation

Three organisation-scoped tables were added:

- `public.ai_agents`: specialist identity, division, purpose, capabilities, allowed tool names, approval policy and lifecycle status.
- `public.ai_tool_connections`: provider, connection type, scopes, permitted actions, status, secret reference label and verification notes. No secret values.
- `public.ai_agent_runs`: requester, agent, trigger, lifecycle state, input/output summaries, evidence references, tool-call metadata and approval fields.

All three tables have RLS enabled. Organisation members can read. Only owners/admins can manage agent definitions and tool connection metadata. Owner/admin/lawyer/staff can create and update run records. Run creation is constrained to the authenticated requester and an agent belonging to the same organisation. Anonymous grants are revoked.

Seven initial agents and seven tool connection records are seeded for the founder organisation. Agent statuses distinguish configured/planned from active. The registry does not itself execute agents.

## 5. Run lifecycle

Recommended lifecycle:

`queued → running → needs_review → succeeded`

Failure and cancellation are explicit terminal alternatives. A run should include:
1. A bounded objective and division context.
2. Allowed tools and permitted actions.
3. Input summary with links to workspace records, not duplicated confidential data.
4. Source/evidence references and tool-call metadata.
5. Output summary, unresolved questions and limitations.
6. Approval requirement and reviewer identity/time.
7. Completion state and safe error summary.

A run must not be marked successful merely because a model returned text. Success means the requested bounded task completed and its output was persisted or delivered to the intended workspace location.

## 6. Permission tiers

- **Read only:** retrieve and summarise authorised workspace/public information.
- **Draft only:** prepare internal drafts; cannot send, publish, schedule or alter external records.
- **Human review:** can prepare an action proposal; a human must approve the consequential step.
- **Restricted:** disabled until an explicit, tested permission boundary exists.

Default deny. Each tool call must be checked against the agent's allowlist, the user's organisation role, the action's risk tier and any record-level policy. Do not let an LLM choose its own permissions.

## 7. External action gates

The following always require explicit founder or authorised human approval at the point of action:
- Publish or schedule social content.
- Send email, direct messages or prospect outreach.
- Make or accept legal representations, submit filings or give case-specific legal advice.
- Spend money, purchase services or change billing.
- Delete records, change access or expose confidential client material.
- Make public claims about the founder, a client, a product or a venture.

The system may research, draft, compare, queue an approval request and report status without taking those actions.

## 8. Integration sequence

1. **Registry and policy layer** — completed as database foundation; verify authenticated UI access.
2. **Agent run service** — implement a server-side orchestration endpoint with schema validation, role checks, per-agent allowlists, timeouts, rate limits and idempotency.
3. **Audit trail** — persist run lifecycle and each tool call; redact secrets and sensitive payloads.
4. **Read-only specialists** — launch operations analyst and market/legal research workflows first.
5. **Draft-only production** — connect research briefs to content drafts and require evidence/review gates.
6. **Approved external actions** — add publishing and outreach only after server-side credentials, approval records, idempotency and rollback/reconciliation paths are tested.
7. **Evaluation** — test access denial, cross-organisation isolation, prompt injection in retrieved sources, duplicate execution, provider failure, timeout, retries and audit completeness.

## 9. Runtime integration requirements

The Next.js app must call server-side routes or server actions for model and external provider access. Never place service-role keys, provider API keys or OAuth refresh tokens in browser code, public environment variables, database rows or Git. Store credentials in Vercel encrypted environment variables or a dedicated secret manager. Use least-privilege scopes and rotate credentials.

Do not execute arbitrary SQL, shell commands, code, URLs or tool arguments produced by an agent. Validate all arguments against typed schemas and fixed tool adapters. Treat web pages, documents, emails and tool outputs as untrusted data; instructions embedded in retrieved content must never override system policy.

## 10. Current limitations and test gate

The database registry is present, but there is not yet a deployed agent execution service, model-provider integration, tool dispatcher, agent run UI or automated evaluation suite. No agent is to be described as autonomously operational until these are implemented and tested.

The next browser test should verify:
- Founder can see the seven agents and seven tool records.
- Non-admin members cannot edit the registry.
- A permitted user can create a test run for an agent in their organisation.
- Cross-organisation run creation is rejected.
- Tool credentials are never displayed in the browser.
- Run history and approval metadata are visible and correctly scoped.

## 11. Founder identity and content rules

Public founder identity is Imran Arefin. If a founder portrait is generated or edited, preserve the approved reference face; do not substitute another person's face. Use only the founder-approved email and phone in approved public contact blocks. Legal content remains educational, evidence-led and subject to advocate review and professional conduct rules.
