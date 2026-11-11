# IMRAN AI Security Model

## Security boundary

The application uses Supabase Auth with cookie-backed server sessions. The browser receives only the Supabase project URL and publishable key. Secret/service-role credentials are never placed in browser code or committed to this repository.

All workspace tables in the `public` schema have Row Level Security enabled. Anonymous table grants have been revoked. Authenticated access is restricted by explicit grants and row policies.

## Workspace roles

| Role | Intended access |
| --- | --- |
| owner | Full workspace administration and membership control |
| admin | Workspace administration; cannot grant or revoke owner/admin roles |
| lawyer | Legal matters, contacts and operational tasks |
| staff | Contacts and operational tasks |
| finance | Reserved for finance module policies to be implemented |
| viewer | Read-only access to permitted workspace records |

Legal matters are restricted to owner, admin and lawyer roles. Contacts and tasks are available to approved operational roles. Audit events are readable by owners and admins; client-side writes are disabled.

## Tenant isolation

Every business record carries an `organization_id`. Membership checks run through private, fixed-search-path database functions. Composite foreign keys prevent contacts, matters, task assignees, task creators, and linked matters from crossing workspace boundaries.

## Sensitive legal information

- Do not use real client names, case details, pleadings, evidence, contact details or financial records in fixtures, screenshots, public issues or test data.
- Do not connect external AI processing to legal matter content until data handling, retention, confidentiality, privilege and access controls are reviewed.
- Keep matter attachments and document storage out of scope until private bucket policies and file-level authorization are implemented.
- Audit events are designed for trusted server-side writes; append-only event capture is still to be implemented.

## Current limitations

- The first owner membership has not yet been provisioned. Sign-up is intentionally not exposed.
- Authentication activates only after deployment environment variables are set.
- MFA enforcement, session revocation procedures, audit event triggers, document storage policies and backup/restore testing remain launch gates.
- The current founder dashboard is still a foundation preview and must not be treated as a production legal case management system.
