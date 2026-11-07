# Imran AI Business OS

A Next.js starter for a personal business operating system, beginning with a legal-work workspace: an executive overview, a sample task list, and human-supervised workflow concepts.

## Run locally

Requirements: Node.js 18.17+ and npm.

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). To verify a production build:

```bash
npm run build
npm start
```

## What is included

- Responsive executive dashboard for desktop and mobile
- Demo task checklist with interactive completion and a view-all toggle
- New-enquiry workflow placeholder
- Suggested intake, deadline follow-up, and document-status workflows
- No database or external API required to run the demo

All displayed matter counts and tasks are fictional sample data. The interface does not persist entered information, send notifications, or carry out legal work automatically. It is a UI foundation, not a production case-management system.

## Legal-workforce automation: safe next steps

Build workflow automation as human-reviewed task orchestration, not autonomous legal judgment. A reasonable next phase is:

1. Define roles (administrator, lawyer, caseworker) and access boundaries.
2. Add secure sign-in and a database with tenant-aware access controls.
3. Implement matter intake with a human conflict-check gate before opening a matter.
4. Add assigned owners, due dates, and configurable reminders with escalation.
5. Track document requests and review status; keep legal approval with a qualified person.
6. Add immutable audit events, backup/restore, retention rules, and tested access policies.
7. Use only synthetic data until security and privacy controls have been independently reviewed.

Do not put real client names, case facts, identity documents, or privileged material into this demo. Before production, obtain qualified legal, security, and privacy review appropriate to the jurisdictions where it will be used. Do not treat generated outputs as legal advice or a substitute for professional review.

## Project roadmap

See [docs/ROADMAP.md](docs/ROADMAP.md). The initial repository contained planning documents; this branch adds the first runnable application foundation.
