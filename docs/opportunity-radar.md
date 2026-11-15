# IMRAN AI Opportunity Radar

## Purpose

Opportunity Radar is the intelligence-to-action register for the six IMRAN AI divisions. It records external signals that may create legal, editorial, commercial, operational or audience opportunities. It is distinct from the Business Development pipeline: a signal is not a qualified lead, revenue forecast or client relationship until a human converts it.

## Divisions

- `arefin-legal-corporate` — legal/regulatory change, judgments, compliance exposure and public legal literacy.
- `imran-arefin` — advocacy craft, leadership, founder insight and public-interest commentary.
- `arefin-avenue` — destinations, heritage, travel behaviour, local voices and experience design.
- `ia2-holdings` — SME conditions, governance, financing, sector shifts and operating models.
- `c3-lifestyle` — consumer behaviour, everyday utility, design, category and local-maker signals.
- `bold-cotton` — apparel demand, fabric/material shifts, fit, sourcing, garment care and product education.

## Signal record

The `public.opportunity_signals` table stores:

- Division and signal type.
- Title, summary, evidence summary and a separate hypothesis field.
- Source URLs as a JSON array.
- Evidence quality: `verified`, `corroborated`, `preliminary`, or `hypothesis`.
- Confidence, commercial potential and estimated effort.
- Recommended action, owner, due date and review notes.
- Status: `discovered`, `triaged`, `approved`, `in_progress`, `converted`, or `dismissed`.

## Evidence discipline

1. Prefer primary law, official gazettes, regulators, courts, official statistics and original company/platform announcements.
2. Record the publisher, publication date, access date and pinpoint where available.
3. Separate an established fact from interpretation and from a hypothesis. A social post or trend anecdote is a discovery signal, not proof of market size.
4. Mark stale, conflicting, geographically narrow or methodologically weak evidence explicitly.
5. Legal developments require jurisdiction, effective date, amendment status and authoritative text checks before publication or advice.
6. Commercial potential is a prioritisation judgement, not a promise of revenue.

## Triage

Score each signal qualitatively across:
- Strategic relevance to the division.
- Evidence quality and confidence.
- Audience or customer need.
- Commercial or reputational upside.
- Time sensitivity.
- Execution effort and dependencies.

A signal should be approved only when its evidence and proposed action are proportionate to the risk. Convert a commercial signal into a Business Development opportunity only after human qualification; do not auto-create a prospect or infer a client.

## Operating guardrails

- Radar may research, summarise, rank and draft internal recommendations.
- It must not publish, schedule, send messages, contact prospects, make legal representations or spend money.
- No legal solicitation, guaranteed outcomes, misleading professional claims or confidential client/case details.
- Do not invent market statistics, competitors, demand, revenue, sources or completed actions.
- Do not use another person's face as Imran Arefin. Founder imagery must preserve the approved reference identity.
- Review all time-sensitive signals before action; archive the source snapshot or stable official reference where possible.

## Research-register linkage

The `public.opportunity_signal_sources` join table links a Radar signal to one or more registered `research_sources` records. Each link is organisation-scoped, unique per signal/source pair, and protected by RLS policies that verify both linked records belong to the same organisation. The Radar form can select existing registered sources; it also retains direct source URLs for quick discovery. A registered source is not automatically verified: source reliability, exact reference and claim-level support remain explicit review tasks.

## Access model

The table is organisation-scoped. Row Level Security is enabled. Organisation members can read; owner/admin/lawyer/staff can create and update; owner/admin can delete. Anonymous access is revoked. The application UI and authenticated end-to-end tests remain separate implementation gates.
