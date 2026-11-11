# IMRAN AI BUSINESS OS

Personal AI Business Operating System for the founder's professional practice and business ecosystem.

## Current milestone

The Founder Command Centre is the first application slice. It is a responsive, data-honest dashboard shell. Metrics are intentionally shown as unavailable until their underlying systems are connected; no sample client, case, revenue, or financial records are fabricated.

## Technology

- Next.js App Router and React
- TypeScript
- Tailwind CSS
- Supabase planned for authentication and data
- OpenAI planned for AI-assisted workflows
- Vercel planned for deployment

## Local development

1. Install Node.js 20 or newer.
2. Install dependencies: `npm install`
3. Copy `.env.example` to `.env.local` when Supabase credentials are provisioned.
4. Start the development server: `npm run dev`
5. Open `http://localhost:3000`.

## Environment and security

- Never commit real credentials, API keys, service-role keys, client data, case files, or other confidential records.
- Put secrets in local ignored environment files and encrypted deployment environment settings.
- The Supabase service-role key is server-only and must never use the `NEXT_PUBLIC_` prefix.
- Authentication, row-level security, audit logging, and role design must be implemented before storing real client or matter data.
- This initial dashboard is a UI foundation, not a production-ready legal case management system.

## Repository documentation

- `docs/ROADMAP.md` — original milestone roadmap.
- `docs/FOUNDATION_ARCHITECTURE.md` — architecture principles and domain model.
- `docs/IMPLEMENTATION_BACKLOG.md` — sequenced delivery backlog.
