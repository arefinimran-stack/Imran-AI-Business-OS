# IMRAN AI — Content Operations Standard

**Status:** Operating standard, version 1.0  
**Workspace:** IMRAN AI Workspace  
**Publishing timezone:** Asia/Dhaka  
**Publishing provider:** Upload-Post profile `default`  
**Connected channels verified:** Instagram, YouTube, LinkedIn and Facebook (Facebook media-history query currently returns no items).

## 1. Operating principle

One central editorial desk; separate brand identities, audiences, voice, approval rules and performance reporting. A post belongs to one primary brand/division even when adapted for several platforms. Cross-posting must be adapted to the platform rather than blindly duplicated.

## 2. Brand and division taxonomy

| Brand key | Division / identity | Editorial purpose | Core genres |
|---|---|---|---|
| `arefin-legal-corporate` | Arefin Legal & Corporate | Public legal literacy and institutional credibility | Legal explainers, judgment-reading guides, legislative updates, procedural education, corporate governance education |
| `imran-arefin` | Imran Arefin — founder/professional profile | Personal thought leadership and professional perspective | Advocacy craft, leadership notes, public-interest commentary, learning reflections, founder operating principles |
| `arefin-avenue` | Arefin Avenue | Audience-led media and storytelling | Bangladesh travel, culture, people and places, documentary shorts, interviews, reflective storytelling |
| `ia2-holdings` | IA² Holdings | Group-level business and governance thinking | Group strategy, governance, capital discipline, operating models, entrepreneurship and market education |
| `c3-lifestyle` | C3 Lifestyle | Lifestyle editorial and consumer discovery | Everyday living, considered choices, product curation, useful guides, brand stories |
| `bold-cotton` | Bold Cotton | Apparel brand education and product storytelling | Fabric education, fit and styling, garment care, collection stories, product demonstrations |

Each item must have a primary `brand_key`. Historical imports remain under `historical-social-import` until classified; do not infer a brand from personal or family content.

## 3. Professional editorial genres

- **Explainer:** one question, a clear answer, plain-language structure and source notes.
- **Analysis:** a defined issue, evidence, competing considerations, reasoned conclusion and limitations.
- **How-to / checklist:** practical steps, scope limits and an explicit note where requirements vary.
- **Case or example study:** only public, verified, permission-safe facts; anonymise where appropriate.
- **Founder / leadership essay:** first-person perspective, concrete lesson, no fabricated achievements.
- **Documentary / interview:** fact-checked names, locations, dates, permissions and captions.
- **Product education:** verified specifications, real samples, clear commercial disclosures.
- **Community / culture story:** respectful representation, context, consent and no unverified claims.

## 4. Legal and professional safeguards

The Bangladesh Bar Council's published Canons state that an Advocate shall not solicit professional employment by advertisement or other means. Accordingly, Arefin Legal & Corporate content is configured as educational and public-interest communication, not client acquisition advertising. Do not use guarantees, superiority claims, sensational case promises, fee inducements, client testimonials as solicitation, or calls to hire/DM for representation. Do not disclose client identities, privileged information, non-public case details or confidential documents. Verify the current applicable rules and any later directions before publication.

Legal posts require:
1. Primary source (statute, rule, judgment, official circular or court record) and exact citation.
2. Verification of current status, amendments, overruling or subsequent treatment where relevant.
3. Clear separation between law, interpretation and general information.
4. No individualised legal advice in public comments.
5. Founder/advocate review before any post is marked approved.

## 5. Research and fact-checking standard

For every factual post, save source title, issuing body/author, publication date, URL, access date and the exact proposition supported. Prefer primary sources; use reputable secondary sources for context only. Verify statistics against the original dataset. Label estimates and opinions. Never invent citations, case names, client results, testimonials, product specifications, partnerships or audience metrics.

## 6. Platform adaptation

- **Instagram:** visual-first Reels/carousels; strong opening frame; readable captions; native-safe creative; use the Professional Dashboard's current Best Practices guidance and account-specific insights.
- **Facebook:** community-oriented explainers, video and shareable visuals; adapt copy to the Page audience; verify the target Page before publishing.
- **YouTube:** distinct Shorts and long-form packaging; accurate title/thumbnail promise; deliver the promised value early; review appeal, engagement and satisfaction/retention signals.
- **LinkedIn:** professional insight, useful frameworks, industry context, document/carousel posts and substantive discussion; use a small relevant hashtag set; avoid generic engagement bait.

One source asset may produce several derivatives: a long-form article/video, short vertical clips, a carousel, a concise professional post and a Q&A. Keep each derivative faithful to the original research.

## 7. Workflow and status controls

`idea → draft → review → approved → scheduled → published`

Additional terminal states: `archived`; rejected work remains recorded with its reason. Do not schedule legal material unless `review_status = approved`. Store the source notes, content pillar, language, target platforms, scheduled time and owner. Record provider job/request IDs and platform post IDs when the application integration is implemented.

## 8. Publishing queue

Upload-Post queue timezone is set to `Asia/Dhaka`. Existing slots retained at 09:00, 12:00 and 17:00, every day, maximum one post per slot. Queue is currently empty. These are operational defaults, not claims about optimal audience times; refine them using account-level audience activity and post analytics.

## 9. Archive and backup policy

The initial import archived 79 social post records: 52 Instagram, 14 YouTube and 13 LinkedIn. The Facebook media-history endpoint returned zero items. The archive stores captions where available, source platform, platform post ID, permalink, publication timestamp and thumbnail URL where supplied. It is a **metadata archive**, not a binary backup of original photos/videos. CDN thumbnail and media URLs may expire. A durable media backup requires downloading original assets into controlled object storage, recording checksums, storage keys, rights/consent and retention rules. Do not claim media files are backed up until this is verified.

## 10. Performance review

Track per-brand and per-platform reach/impressions, views, watch time/retention, saves, shares, comments, follower growth, profile actions, qualified enquiries (only where ethically appropriate), and attributable revenue where available. Compare like-for-like formats and time windows. Do not optimise solely for views; use audience fit, trust, quality and business outcomes. Treat missing or stale provider metrics as unavailable, not zero.

## 11. Release gate

Before any public post:
- Correct brand and account selected.
- Research and claims verified.
- Legal/professional review complete where applicable.
- Media rights, consent, music and privacy checked.
- Platform-specific title, caption, thumbnail, tags and accessibility text reviewed.
- Schedule/timezone confirmed.
- Publishing result and live permalink captured.
- Post-publication metrics checked after a suitable interval.
