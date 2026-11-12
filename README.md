# IMRAN AI BUSINESS OS

Personal AI Business Operating System for the founder's legal practice, business operations and digital ventures.

## Current build

This repository contains the mobile-first founder dashboard, department workspaces, local workflow engine and provider-independent AI interface.

**Production caution:** Authentication, persistent database records, role permissions, secure document storage and provider data-governance controls must be completed and tested before confidential client or financial information is entered or sent to an external AI provider.

## AI providers

The server-side AI adapter supports:
- NVIDIA NIM / Nemotron through the OpenAI-compatible Chat Completions endpoint.
- OpenAI as an alternative provider.
- The local deterministic planner when no provider credential is configured.

Configure these environment variables in the hosting platform (never in client-side code):

| Variable | Purpose |
| --- | --- |
| `NVIDIA_API_KEY` | Encrypted NVIDIA API key from NVIDIA Build |
| `NVIDIA_MODEL` | Optional model override; defaults to `nvidia/nemotron-3.5-super-vl-120b-a12b` |
| `AI_PROVIDER` | `nvidia`, `openai`, or `auto`; auto prefers NVIDIA when configured |
| `OPENAI_API_KEY` | Optional OpenAI fallback credential |

NVIDIA NIM endpoint: `https://integrate.api.nvidia.com/v1/chat/completions`.

The API key must be stored as an encrypted server-side environment variable in Vercel. Do not commit keys to Git or expose them through `NEXT_PUBLIC_*` variables. Provider selection is server-side.

**Legal confidentiality:** Do not submit privileged, confidential, personally identifiable or otherwise sensitive client material to a third-party model until the applicable client consent, professional obligations, data-processing terms, retention settings and access controls have been reviewed. AI output is a drafting/research aid and must be verified by counsel.

## Run locally

- Node.js 22+
- `npm install`
- `npm run dev`
- `npm run build`

## Deploy

The project is linked to Vercel through GitHub. A push to the configured production branch deploys automatically; feature branches can generate preview deployments.

## Project principles

- Keep IMRAN AI Business OS separate from Arefin Chambers Legal AI.
- Mobile-first, modular and cost-conscious.
- Do not store confidential client data until authentication, access control and secure persistence are implemented.
