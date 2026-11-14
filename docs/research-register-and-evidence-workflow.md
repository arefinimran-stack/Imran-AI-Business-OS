# Research Register and Evidence Workflow

## Purpose
This workflow connects source collection, claim verification and production briefs to the central Content Studio. It is designed for all six divisions and keeps the evidence trail attached to the work it supports.

## Database objects
- `research_sources`: canonical source record, publisher, URL, source class, jurisdiction, pinpoint citation, reliability and limitations.
- `research_claims`: one discrete claim, linked to its supporting source, pinpoint reference, evidence status, confidence, reviewer notes and verification metadata.
- `research_briefs`: audience, objective, research question, editorial angle, genre, format, language, evidence gate, script outline, visual direction, platform adaptations, risk notes and review history.
- `research_brief_claims`: explicit many-to-many links between each production brief and the claims it relies on. Database policies verify that both records belong to the same organisation.
- `content_items`: existing editorial calendar and publishing record. A brief can be linked to a content item as production proceeds.

All three research tables are organisation-scoped. RLS is enabled. Authenticated members can read records; owner/admin/staff can create and update; owner/admin can delete. Claim creation and update also verify that the linked source belongs to the same organisation.

## Source classification
Use primary law, official data, official guidance, judgments and regulator material wherever the subject requires it. Academic and reputable secondary sources provide context. Industry reports and social signals help identify questions and trends but must not be promoted into verified facts without corroboration.

Reliability is assessed separately from source type:
- `high`: authoritative, directly relevant and current for the claim.
- `medium`: credible but limited by scope, method, date or indirectness.
- `low`: weakly supported or materially incomplete.
- `discovery_only`: useful for finding leads, not for substantiating publication claims.
- `unassessed`: not yet reviewed.

## Claim verification
Register one testable proposition per claim. Record the exact paragraph, page, statutory section, case paragraph, table or dataset field. Mark claims as:
- `unverified`
- `supported`
- `partially_supported`
- `contradicted`
- `outdated`
- `needs_primary_source`

Do not mark a claim supported merely because a source mentions a related subject. Confirm that the source actually supports the wording, population, jurisdiction, date and scope of the claim. Record uncertainty and limitations.

## Production gates
1. `not_started`: no research work has begun.
2. `researching`: sources and claims are being assembled.
3. `evidence_checked`: claims have been checked against cited material; unresolved caveats remain visible.
4. `needs_review`: an editor or subject-matter reviewer must examine the brief.
5. `approved_for_production`: the brief may move into production.

Approval for production is not approval to publish. The separate Content Studio editorial review and publishing controls remain in force. No source, claim or brief action automatically publishes or schedules a post.

## Operational sequence
1. Select the correct division/brand before adding a source.
2. Save the canonical URL and exact pinpoint reference. Preserve publication and access dates when available.
3. Split the proposed script into discrete factual, legal, market and product claims.
4. Link each claim to one or more sources; add a second independent source where material risk or uncertainty warrants it.
5. Resolve contradictions, current-status questions and missing primary sources.
6. Create a production brief with a defined audience, objective, research question and editorial angle.
7. Add format, genre, visual direction, platform adaptations and risks.
8. Move the evidence gate only when the stated criteria are met. Subject-matter review is required for legal/regulatory claims and other high-impact claims.
9. Convert the approved production brief into a Content Studio item. Keep publication approval separate.

## Division-specific safeguards
- **Arefin Legal & Corporate:** use current legislation, gazettes, judgments and regulator publications; check amendments, commencement, jurisdiction and subsequent treatment. Advocate review is mandatory before public release. Educational information only; no solicitation, guarantees or confidential matter details.
- **Imran Arefin:** do not invent personal history, credentials, opinions or first-person anecdotes. Verify or confirm any founder-specific assertion.
- **Arefin Avenue:** verify access, hours, prices, transport and safety close to publication; obtain consent for identifiable local voices.
- **IA² Holdings:** distinguish market evidence from estimates and forecasts. Do not promise finance, investment returns or credit approval.
- **C3 Lifestyle:** confirm the actual product/category and its claims before research; do not assume a category from the brand name.
- **Bold Cotton:** use labels, supplier documentation, test reports or inspection for fibre, GSM, origin, certification and performance claims. Do not invent specifications.

## Founder identity and creative integrity
Where the founder is presented as author, advocate, speaker or subject, use the approved name and only the contact details explicitly supplied for that purpose. If a portrait is required, use the founder's approved reference image and preserve his recognisable face; style, lighting, clothing and background may change, but another person's face must not be substituted.

## Current implementation boundary
The Supabase schema and Content Studio research forms are committed. The UI reads and writes source, claim and brief records through the signed-in Supabase client. The production deployment must complete successfully before the feature can be considered live. A live authenticated end-to-end test is still required after deployment. No public posts are created or scheduled by this workflow.
