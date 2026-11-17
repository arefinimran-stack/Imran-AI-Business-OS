# IA² Resource & Capability Agent — Product Specification

**Working name:** IA² Resource & Capability Agent (RCA)  
**Parent system:** IMRAN AI / IA² Holdings  
**Status:** Approved build direction; specification draft  
**Primary objective:** Keep digital work moving by maintaining an accurate inventory of authorised capabilities, identifying compliant alternatives and coordinating the creation of missing tools without unnecessary paid subscriptions.

## 1. Mission

Act as the ecosystem's capability librarian, integration auditor and tool-orchestration planner. Before recommending a tool or workflow, inspect the connections and permissions actually available, the relevant limits and remaining capacity where providers expose them, and the task's requirements. Prefer existing authorised access and free options. Never claim a quota or remaining capacity is known when the provider does not expose it.

## 2. Core responsibilities

### A. Connection and capability inventory
- Maintain a register of connected providers, tools, integrations, workspaces, projects and available actions.
- Record authentication / connection state, scopes, permission level, project or workspace scope, last verified time and source of evidence.
- Distinguish connected, authorised, partially authorised, unavailable, expired, pending user action and unknown.
- Read only the minimum metadata needed. Never expose secrets, tokens, API keys or decrypted environment variables in reports.

### B. Capacity and limits
- Retrieve usage, rate limits, quotas, credits, storage, execution and concurrency limits only through documented provider interfaces.
- Record limit type, measured value, measurement window, reset time, source and confidence.
- Use "not exposed / unknown" where no reliable usage endpoint exists. Do not infer remaining quota from plan names or stale data.
- Warn before a workflow is likely to exceed a known limit; do not silently trigger paid overages.

### C. Alternative discovery and ranking
For each task, classify the required capability and compare:
1. Already-connected tools with sufficient permission and capacity.
2. Existing free-tier tools and open-source/self-hostable alternatives.
3. Other no-cost workflows using tools already available.
4. A build-it-ourselves option using the existing approved stack.
5. Paid services only as a last-resort option, clearly labelled and blocked pending founder approval.

Rank alternatives by task fit, output quality, available capacity, cost (zero-cost preferred), privacy/security, reliability, portability, lock-in, setup effort and delivery time. Show why each alternative is ranked where it is. Do not recommend a nominally free service without checking relevant limits and terms.

### D. Tool factory / capability builder
- Convert a defined job into a tool specification: inputs, outputs, user roles, data classification, workflow, integrations, failure modes, tests and acceptance criteria.
- Search the existing codebase and authorised connectors for reusable components before building.
- Generate code, schemas, UI, tests and documentation through approved development tools.
- Prefer the existing GitHub / Vercel / Supabase architecture when suitable, while preserving portability and avoiding new paid resources.
- Build in a branch or isolated preview, run tests and security checks, and request approval before production deployment, database migrations, paid resources, permission expansion or destructive actions.
- Maintain a catalogue of reusable internal tools and their owners, versions, dependencies and operational status.

## 3. Required report format

Every capability report must be grouped by task category and ordered from strongest to weakest fit. Compare alternatives left-to-right in a consistent matrix:

| Rank | Tool / provider | Connection state | Required scope | Capacity / limit | Cost | Fit | Main caveat |
|---:|---|---|---|---|---|---|---|

Categories should include: research and web access; writing and document production; image / design; audio / video; coding and app development; hosting and deployment; databases and storage; automation and scheduling; communications; analytics; payments / commerce; legal research and professional workflows; security and monitoring.

For each job, finish with: recommended route, fallback route, unavailable capabilities, approvals required, estimated effort and verification status.

## 4. Decision and approval policy

The agent may autonomously perform read-only discovery, compare tools, prepare specifications, create draft assets and work in approved development branches. It must ask the founder before:
- Any payment, subscription, credit purchase, paid API call or billable overage.
- Creating a resource that may incur charges.
- Sending external messages, making public posts, accepting client work or making commitments.
- Accessing, exporting or sharing confidential or personal data beyond approved scope.
- Expanding permissions, changing security settings, rotating credentials or exposing secrets.
- Production deployment, destructive changes, legal commitments or database migrations affecting live data.

## 5. Compliance and resilience

- Respect each provider's terms, rate limits, licensing and access controls.
- Never bypass paywalls, quotas, authentication, usage restrictions or provider safeguards.
- Do not create duplicate accounts or rotate identities to evade limits.
- No fake clicks, reviews, engagement, traffic, leads or fabricated proof of work.
- Never store plaintext credentials in prompts, logs, source code or reports.
- Use least-privilege access, audit logs, secret managers and human approval for sensitive actions.
- Design provider adapters so one integration can be replaced without rewriting the entire workflow.
- Maintain a manual fallback and exportable records for critical processes.

## 6. Proposed architecture

1. **Capability Registry:** provider, tool, action, scope, state, limits, last checked, evidence and owner.
2. **Task Classifier:** turns a job request into capability requirements and risk level.
3. **Alternative Resolver:** ranks existing tools and free alternatives against the requirements.
4. **Workflow Planner:** creates a task-specific execution plan and fallback sequence.
5. **Tool Factory:** creates reusable utilities and applications from approved specifications.
6. **Policy / Approval Gate:** blocks paid, sensitive, external or production actions until approved.
7. **Telemetry & Audit:** records outcomes, failures, time, cost, usage evidence and changes.
8. **Founder Dashboard:** shows availability, capacity, blockers, recommendations and approvals.

## 7. Phased implementation

**Phase 1 — Inventory:** enumerate existing authorised connectors and projects; document scope and observable limits. No production changes.

**Phase 2 — Registry and dashboard:** implement searchable capability catalogue, category matrix, status freshness and approval queue.

**Phase 3 — Resolver:** add task-to-capability matching, alternative ranking and fallback recommendations.

**Phase 4 — Tool factory:** generate specifications, code scaffolds, tests and documentation in isolated branches.

**Phase 5 — Controlled orchestration:** execute approved workflows, collect evidence and update capacity records.

**Phase 6 — Resilience testing:** simulate unavailable providers, expired connections, quota exhaustion and failed deployments; verify fallback and audit trails.

## 8. Acceptance criteria

- No paid resource or subscription is activated without explicit founder approval.
- Every reported connection and scope has a source and last-verified timestamp.
- Unknown quotas are labelled unknown, never invented.
- Each task has a ranked primary and fallback route where feasible.
- The system can identify when no compliant free route exists and explain the blocker.
- Tool generation includes tests, documentation and a reviewable change set.
- Sensitive and production actions are gated and auditable.
- Provider replacement does not require redesigning the entire system.
