# IMRAN AI — Architecture

## Status legend
- **Completed** — built, tested, working today.
- **Partial** — core exists, needs credentials/deployment or further phases.
- **Planned** — specified in the master instruction, not yet built.

## System overview

```
┌────────────────────────────────────────────────────┐
│                  IMRAN AI (Next.js)                │
│                                                    │
│  Executive Dashboard ── Command Centre (/ai)       │
│         │                    │                     │
│  Department workspaces   Agent layer (11 agents)   │
│  (legal, CRM, finance,   Planner → Workflow engine │
│   content, creative…)        │                     │
│  Autopilot (/autopilot) ─────┘                     │
└───────────────┬────────────────────────────────────┘
                │
     ┌──────────┴──────────┐
     │  Data layer         │  lib/store.tsx (on-device, resumable)
     │  ─────────────────  │  Supabase/PostgreSQL (cloud, RLS) —
     │  persistence        │  schema in supabase/migrations
     └──────────┬──────────┘
                │
     ┌──────────┴──────────┐
     │  AI provider layer  │  lib/ai/provider.ts (provider-independent)
     │  OpenAI today; any  │  app/api/ai (server) + local planner
     │  provider swappable │  fallback (works with no key)
     └─────────────────────┘
```

## AI agent architecture (Completed — rule-based runtime)

Eleven agents are defined in `lib/agents/registry.ts` (Executive, Legal,
Business Development, CRM, Content, Social Media, Research, Finance, Creative,
Automation, Developer). The planner (`lib/agents/planner.ts`) maps natural
language instructions to departments and workflow plans. Agents delegate by
executing workflow steps; every step is attributed to an agent in the run log.

With an `OPENAI_API_KEY` configured, the Command Centre answers generatively
through `app/api/ai` (system prompt encodes the ecosystem context). Without a
key, the deterministic planner answers and proposes workflows — clearly
labelled in the UI. No fake functionality is presented as AI generation.

## Workflow engine / Autopilot (Completed — local runtime; Partial — 24/7 server runtime)

`lib/workflows/engine.ts` is a resumable state machine:

- Runs persist `steps[]` with per-step status (`pending → running → done / awaiting_approval / failed`) and a full log.
- Interrupted runs resume from the last persisted state — nothing is lost on reload.
- Steps produce real artifacts: draft posts with captions, graphic briefs, follow-up tasks, briefings — written into the department stores.
- Approval gates pause the run and raise an approval item. Consequential actions (publishing, sending) never execute without explicit founder approval.
- While the app is open, active runs auto-advance (Autopilot page).

**Honest limitation:** browser-only execution advances only while the app is
open. True 24/7 autonomy requires the deployed backend:
`supabase/migrations/0001_init.sql` persists identical run state in PostgreSQL
(RLS per user), and `supabase/functions/autopilot-tick` is the scheduled
server worker (pg_cron every 5 min) that advances due runs. The server-side
step executor is the next phase of work.

## Data layer (Completed — on-device; Partial — cloud sync)

All state lives in a typed reducer store (`lib/store.tsx`) persisted to
localStorage. The Supabase schema mirrors every table with row-level security;
`lib/supabase.ts` detects configuration. Swapping/mirroring the store to
Supabase does not touch UI code.

## Security and governance (Partial)

- PIN app-lock (Completed, on-device).
- Human approval gates on every consequential workflow step (Completed).
- Audit log of all agent and founder actions (Completed).
- PostgreSQL RLS on all tables (Completed, in migrations).
- Supabase Auth, role-based access, encrypted storage, backups (Planned — requires Supabase project).
- Hard prohibitions encoded: agents never transfer money, sign, file court documents, or send binding notices autonomously (enforced by approval gates; restated in the AI system prompt).

## Generation Studio (Completed — documents & graphics; Planned — video/audio/music)

`app/studio` generates real files client-side with zero dependencies:
- AI Writer: provider-backed via `app/api/ai` when `OPENAI_API_KEY` is set, otherwise structured template drafts — the source (AI vs template) is always labelled.
- Social graphics: deterministic branded SVG (navy/gold) with PNG export via canvas.
- Documents: dependency-free PDF writer (`lib/studio/generators.ts`, Latin script — documented limitation), Word-compatible HTML `.doc`, CSV.
- Creation library: every artifact is saved to the store and re-downloadable.

Video, audio and music generation require a connected generation provider and
remain Planned. `lib/ai/provider.ts` stays provider-independent: new providers
implement the interface without touching callers.

## What is intentionally not built yet

Per the master instruction's phase discipline, these remain Planned:
Supabase Auth wiring, knowledge repository uploads, platform publishing
integrations (Facebook/Instagram/LinkedIn/YouTube/TikTok/X APIs), Tool
Builder marketplace, voice input, and file analysis.
