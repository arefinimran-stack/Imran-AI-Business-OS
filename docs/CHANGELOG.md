# Changelog

## 0.2.0 — AI Command Centre, Autopilot, executive redesign

### Completed
- Executive design system: deep navy, ivory, metallic gold; gold rules and accents throughout.
- AI Command Centre (`/ai`): conversational interface, 11-agent registry, natural-language planner mapping instructions to departments and workflows, one-tap workflow execution.
- AI Autopilot (`/autopilot`): workflow engine with persistent, resumable run state; multi-agent workflows (5 built-in: 30-day legal awareness campaign, morning briefing, new-lead triage, weekly business review, client prospecting); steps generate real artifacts (draft posts, captions, graphic briefs, follow-up tasks, briefings); approval gates pause runs; execution history log.
- "Since Last Visit" executive briefing on the dashboard: completed work, new drafts, new tasks, pending approvals, active runs.
- Provider-independent AI layer (`lib/ai/provider.ts`, `app/api/ai`): OpenAI integration activates with `OPENAI_API_KEY`; deterministic local planner fallback otherwise (clearly labelled — no fake AI claims).
- Supabase backend foundation: full PostgreSQL schema with row-level security (`supabase/migrations/0001_init.sql`), scheduled server worker scaffold (`supabase/functions/autopilot-tick`), env template (`.env.example`).
- Pending approvals surfaced on Autopilot and dashboard; approve/reject resumes or stops runs.

### Partial
- 24/7 background execution: run state is server-persisted via migrations and the edge worker scaffold exists; server-side step executor needs a deployed Supabase project.
- Cloud sync/auth: schema ready; Supabase Auth wiring next.

### Completed (added in this update)
- **AI Creation Studio** (`/studio`): AI Writer (scripts, articles, proposals, legal-draft templates, LinkedIn posts — AI provider when configured, structured template fallback otherwise, always labelled); branded Social Graphic generator (real SVG + PNG export, navy/gold executive design); real PDF generator (dependency-free, multi-page); Word-compatible .doc export; CSV spreadsheet export; central Creation library with re-download and delete.

### Planned
- Video/audio/music generation (needs a connected generation provider), knowledge repository, platform publishing integrations, Tool Builder marketplace, voice input.

## 0.1.0 — iOS app foundation
- Mobile-first Next.js PWA; all 10 departments with on-device CRUD; PWA manifest/service worker/icons; Capacitor config + iOS build guide; PIN app-lock.
