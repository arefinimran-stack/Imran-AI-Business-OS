# IMRAN AI Business OS — Foundation Architecture

**Status:** Working architecture baseline  
**Branch:** `foundation/operating-blueprint`  
**Date:** 11 November 2026

## 1. Product objective

IMRAN AI Business OS is the founder's integrated operating environment for coordinating the Arefin business ecosystem. It should provide one secure command centre for visibility, decisions, execution, and measurement across legal practice, holding/investment activities, consumer ventures, and future businesses.

The first release is an operational foundation—not a collection of disconnected mock screens.

## 2. Operating principles

1. **One source of truth:** shared entities (people, organisations, opportunities, matters, projects, tasks, transactions) should be referenced rather than duplicated.
2. **Modular by domain:** legal, CRM, finance, content, and venture operations have clear boundaries while sharing identity and core records.
3. **Founder-first visibility:** the home dashboard surfaces priorities, deadlines, pipeline, cash position, risks, and decisions requiring attention.
4. **Security by default:** least-privilege access, secure authentication, audit trails for sensitive actions, and separation of legal/client data from general business data.
5. **Human approval for consequential actions:** legal submissions, financial transfers, external communications, publication, and destructive operations require explicit authorization.
6. **Mobile-responsive:** core review and task workflows must work on phone screens as well as desktop.
7. **Evidence-based status:** distinguish planned, in progress, blocked, tested, deployed, and verified. Never represent a mock integration as live.
8. **Bangladesh-aware configuration:** support BDT, Asia/Dhaka time, local date formats, and configurable Bangladesh legal/court workflows without hard-coding assumptions that may change.

## 3. Business domains

- **Founder Command Centre:** daily briefing, KPI summary, priorities, approvals, alerts, cross-venture view.
- **Arefin Legal & Corporate Group:** client/matter records, hearing calendar, deadlines, documents, billing and fee tracking. Legal records require stricter access controls.
- **IA² Holdings:** entities, investments, portfolio monitoring, capital commitments, performance and risk.
- **C3 Lifestyle:** venture operations, products/services, campaigns, sales and customer experience.
- **Bold Cotton:** product/catalogue operations, orders, inventory, marketing and sales.
- **Shared services:** CRM, contacts, tasks, projects, documents, finance, reporting, content, research, integrations and AI agents.

## 4. Proposed logical architecture

Keep implementation technology-agnostic until the existing repository and deployment environment have been fully assessed.

- **Presentation layer:** responsive web application; role-aware navigation and dashboard widgets.
- **Application layer:** domain services and validated workflows; avoid embedding business rules only in UI components.
- **Data layer:** relational source of truth with explicit ownership, timestamps, status, and audit metadata.
- **Identity and authorization:** authenticated users, role-based permissions, domain-level access checks, and least privilege.
- **Integration layer:** isolated adapters for GitHub, Notion, automation platform, analytics/marketing tools, and future external services.
- **AI layer:** bounded agents with named responsibilities, scoped data access, tool allowlists, logging, and approval gates.

## 5. Core information model

Initial shared entities to validate during implementation:

- User, Role, Permission
- BusinessEntity, Venture, Department
- Person, Organisation, Contact, Relationship
- Lead, Opportunity, Activity, FollowUp
- LegalClient, LegalMatter, Hearing, Deadline, LegalDocument, FeeRecord
- Project, Task, Milestone, Approval
- Account, Transaction, Budget, Invoice, Payment
- ContentAsset, Campaign, Channel, Publication
- Agent, Workflow, Integration, ExecutionLog
- AuditEvent, Notification, DashboardMetric

Sensitive legal and financial records should have explicit access policies and retention rules. Do not store passwords, API keys, or credentials in source control.

## 6. Founder dashboard — first usable milestone

The first dashboard should answer:

- What requires my attention today?
- Which deadlines or hearings are approaching?
- Which leads and opportunities need follow-up?
- What is happening across each venture?
- What is the current cash/income/expense position, based on entered and reconciled data?
- Which projects are blocked, overdue, or awaiting approval?
- Which AI/automation runs failed or need human review?

Every metric must disclose its source and last-updated time. Empty data must be shown as “not yet configured” rather than fabricated.

## 7. Security and governance baseline

- Use environment variables or a managed secret store; never commit secrets.
- Enforce server-side authorization for every protected operation.
- Separate legal matter access from general CRM access where required.
- Record actor, action, target, timestamp, and outcome for sensitive changes.
- Require explicit confirmation for deletion, external publication, financial actions, and legal filings.
- Use synthetic/demo records in development; do not put real client confidential information into test fixtures.
- Back up production data and document restoration procedures before launch.

## 8. Delivery sequence

1. Repository and deployment audit; confirm current stack and hosting.
2. Application shell, authentication, navigation, responsive layout.
3. Founder dashboard with truthful empty states and configurable widgets.
4. Shared contacts, CRM, tasks, and project records.
5. Legal operations with stricter permissions and auditability.
6. Venture operations and finance.
7. AI agents, integrations, automation, reporting and growth workflows.

## 9. Decisions deliberately left open

The repository audit must establish the existing framework, database, hosting, authentication, and CI/CD before selecting or replacing technologies. Data residency, backup provider, user roles, legal retention, and production access policy also require validation. Avoid premature migrations or destructive architectural changes.

## 10. Definition of done for the foundation

- Application builds reproducibly from documented instructions.
- Authentication and server-side authorization are tested.
- Main navigation works on mobile and desktop.
- Dashboard uses real persisted data or clearly labelled empty states.
- Core records have validation and audit metadata.
- Automated checks pass; deployment and rollback instructions exist.
- No secrets or real confidential client data are committed.
