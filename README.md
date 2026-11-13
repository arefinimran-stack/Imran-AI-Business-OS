# IMRAN AI BUSINESS OS

Personal AI Business Operating System for the founder's legal practice, business operations and digital ventures.

## Current build

This repository contains the first browser dashboard foundation, built with Next.js. The dashboard provides a responsive founder overview, operating-area navigation, a local task preview and portfolio/workstream entry points.

**Important:** This is a foundation UI, not yet a production business system. Authentication, persistent database records, role permissions, file storage, AI provider integration and live business metrics must be implemented and tested before sensitive client or financial information is entered.

## Run locally

- Node.js 22+
- `npm install`
- `npm run dev`
- `npm run build`
- `npm start` (production server on port 8080)

## Deploy to Fly.io

The repository includes a production Dockerfile and `fly.toml` for the existing `imran-ai-business-os` Fly app. From this repository root, run `fly deploy` after authenticating with Fly.io.

## Project principles

- Keep IMRAN AI Business OS separate from Arefin Chambers Legal AI.
- Mobile-first, modular and cost-conscious.
- Do not store confidential client data until authentication, access control and secure persistence are implemented.
