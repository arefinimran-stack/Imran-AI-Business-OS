# IMRAN AI BUSINESS OS

Personal AI Business Operating System for Imran Arefin's legal practice, founder operations and six-division venture ecosystem.

## Current build

The application is a Next.js 15 / React 19 founder workspace using Supabase Auth and a Supabase Postgres database with organisation-scoped Row Level Security.

Current workspace modules include:
- Founder dashboard and six-division operating model.
- Tasks, legal matters, contacts, projects, ventures, finance and documents.
- Business Development pipeline and Opportunity Radar.
- Content Studio with division-specific formats, genres and editorial metadata.
- Research desk with source register, claim register, research briefs and brief-to-claim links.
- Opportunity Radar linked to registered research sources and Business Development conversion.
- Agent and tool connection registry foundation (seven specialist agent definitions and seven tool records).

## Agent and tool architecture

IMRAN AI is designed as a governed control plane for specialist agents and connected tools. The database registry and access policies are in place, but the server-side agent execution service, tool dispatcher, model-provider integration and agent run UI are not yet deployed. See [Agent and Tool Orchestration Architecture](docs/ai-agent-and-tool-orchestration.md).

A connector available in ChatGPT is not automatically available to the deployed application. Application integrations require their own server-side credentials, routes, permissions and tests. Never put secrets in browser code, public environment variables, Git or database metadata.

## Research and content standards

- [Opportunity Radar](docs/opportunity-radar.md)
- [Content Operations](docs/content-operations.md)
- [Brand Visual System](docs/brand-visual-system.md)
- [Market Intelligence and Content Genres](docs/market-intelligence-and-content-genres.md)
- [Research-to-Production Brief Standard](docs/research-to-production-brief-standard.md)
- [Research Register and Evidence Workflow](docs/research-register-and-evidence-workflow.md)

## Security and operational principles

- Mobile-first, modular and cost-conscious.
- Organisation-scoped RLS is the data access boundary; never rely on hidden UI controls alone.
- Do not enter confidential client material until the relevant access, retention, encryption, backup and audit controls have been reviewed and tested.
- Legal research is not legal advice; primary sources and advocate review are required.
- Research outputs must distinguish verified facts, interpretation and hypotheses.
- No public publishing, prospect outreach, legal filing, spending or destructive action without explicit authorised human approval.
- No fabricated connections, metrics, completed actions or agent capabilities.

## Local development

- Node.js 22+
- `npm install`
- `npm run dev`
- `npm run build`
- `npm start` (production server on port 8080)

## Deployment

The current production project is deployed on Vercel and connected to the GitHub repository. Confirm deployment state in Vercel after each commit; a successful deployment does not replace authenticated browser testing.
