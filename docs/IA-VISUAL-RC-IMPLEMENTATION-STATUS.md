# IA² Visual RC — Implementation Status

**Build branch:** `feature/ia-visual-rc-rebuild`  
**Deployment:** Preview only; production release not authorised  
**Source of truth:** GitHub repository  
**Hosting:** Vercel  
**Database and identity:** Supabase  
**Optional:** Notion, Canva and other ChatGPT-side connectors

## Product direction

IA² Visual RC is the visual headquarters for four operating entities:

1. THE ADVISER — Legal & Corporate.
2. IA² Holdings — parent group.
3. Bold Cotton — apparel venture.
4. C3 Lifestyle — lifestyle venture.

Each entity has its own identity and digital presence. IA² Visual RC is the group-level launchpad and control plane, not a task-list-first dashboard.

## Work completed on the branch

- Added entity-first launchpad and direct preview links.
- Added Command Relay UI and a server-side NVIDIA NIM route.
- Added a founder approval endpoint for internal task and document-draft actions.
- Added a System Fixer diagnostics page and server-side provider-configuration check.
- Added a skill library view to the agent/tool registry.
- Updated the command-centre branding and login metadata.
- Renamed the Vercel project to `ia-visual-rc`.
- Mapped Vercel projects to their separate monorepo roots:
  - `ia-visual-rc` → repository root.
  - `the-adviser` → `apps/advocate-website`.
  - `ia2-holdings` → `apps/ia2-website`.
  - `the-chamber` → `apps/lawyer-workbench`.

## Not yet verified

- Vercel preview build and runtime.
- NVIDIA key availability and live inference.
- YES / NO approval flow and action-hash integrity against the live database.
- Document and task downloads from the asset library.
- Per-entity analytics and traffic feeds.
- Canva, Adobe, video/audio and social publishing adapters inside the deployed app.
- Production access and public-domain protection settings.

## Non-negotiable controls

- Notion is not required for runtime or task execution.
- ChatGPT-side connector access does not automatically become app-side API access.
- Provider credentials remain server-side and are never displayed in the UI.
- All public, financial, legal, external and destructive actions require explicit founder approval.
- No fabricated revenue, traffic, client leads, testimonials, legal credentials or execution evidence.
- No existing documents or repositories are deleted until their purpose, ownership and dependencies are reviewed.
