# IMRAN AI Business OS — Initial Implementation Backlog

**Status:** Proposed execution backlog  
**Branch:** `foundation/operating-blueprint`

This backlog is intentionally ordered by dependencies. Items are not marked complete until implementation and verification evidence exist.

## P0 — Establish a reliable engineering baseline

- [ ] Inventory repository files, branches, workflows, dependencies, and current deployment.
- [ ] Identify the existing application framework and supported runtime versions.
- [ ] Document local setup, environment variables, and safe secret handling.
- [ ] Run existing tests, lint, type checks, and production build; record baseline failures.
- [ ] Confirm deployment target, preview workflow, and rollback process.
- [ ] Add or repair CI checks without exposing secrets.

**Exit criteria:** reproducible build and documented baseline; no unverified claims about deployment.

## P1 — Application shell and founder experience

- [ ] Establish responsive application shell and navigation.
- [ ] Implement authentication using the selected platform's secure supported approach.
- [ ] Define initial user roles and server-side authorization policy.
- [ ] Build Founder Command Centre layout.
- [ ] Add truthful empty states, timestamps, and data-source labels.
- [ ] Add accessible loading, error, and no-data states.

**Exit criteria:** authenticated user can navigate the application on desktop and mobile; protected routes and actions enforce permissions.

## P2 — Shared operating records

- [ ] Define and migrate shared contact and organisation records.
- [ ] Implement lead and opportunity pipeline.
- [ ] Implement activities, reminders, and follow-ups.
- [ ] Implement projects, tasks, owners, due dates, and status transitions.
- [ ] Add audit metadata and change history for important records.
- [ ] Add search, filtering, pagination, and validation.

**Exit criteria:** a user can create, update, find, and track a lead and task with authorization and persistence.

## P3 — Legal Chamber

- [ ] Define legal-client and legal-matter data model.
- [ ] Define matter-level access rules and confidentiality boundaries.
- [ ] Implement hearing calendar and deadline tracking.
- [ ] Implement document metadata and secure document access.
- [ ] Implement fee records and matter-level billing status.
- [ ] Add audit events for access and changes to sensitive records.

**Exit criteria:** legal workflows are permission-tested; no confidential matter data is exposed to unauthorized roles.

## P4 — Venture and finance operations

- [ ] Model ventures and business entities.
- [ ] Add venture-level dashboards and operating KPIs.
- [ ] Implement budgets, invoices, income and expense records.
- [ ] Add investment/portfolio records for IA² Holdings.
- [ ] Define product/order/inventory scope for C3 Lifestyle and Bold Cotton.
- [ ] Add reconciled reporting and export controls.

**Exit criteria:** venture reporting is traceable to persisted records and clearly distinguishes actuals from estimates.

## P5 — AI, integrations and automation

- [ ] Define agent registry, owner, scope, tools, and audit log.
- [ ] Implement human approval gates for consequential actions.
- [ ] Add integration health checks and execution logs.
- [ ] Connect approved knowledge sources with access controls.
- [ ] Add daily founder briefing from verified system data.
- [ ] Add failure alerts, retry policy, and run history.

**Exit criteria:** every agent has a bounded purpose, scoped permissions, traceable actions, and safe failure behavior.

## P6 — Growth and external-facing assets

- [ ] Prepare business development pipeline and outreach tracking.
- [ ] Build content calendar and approval workflow.
- [ ] Prepare venture-specific marketing plans and reusable campaign briefs.
- [ ] Prepare investor materials only from verified financial and business information.
- [ ] Add KPI reporting for acquisition, conversion, revenue, and retention.

**Exit criteria:** published or investor-facing claims are evidence-backed and approved by the responsible owner.

## Operating rules

- Work on feature branches; do not push directly to `main` unless explicitly agreed.
- Keep changes small and reviewable; use pull requests for integration.
- Run relevant checks before requesting review.
- Do not commit secrets, access tokens, production data, or confidential legal documents.
- Never fabricate customer, case, revenue, investment, or performance data.
- Ask for founder approval before production migrations, paid services, external publication, financial actions, or irreversible changes.
