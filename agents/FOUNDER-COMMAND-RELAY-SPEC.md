# Founder Command Relay — IA² Visual RC

**Role:** Founder-authorised command interface  
**Display name:** Founder Command Relay  
**Agent key:** `command-orchestrator`  
**Status:** Testing / preview; not production-released

## Purpose

Translate the founder's plain-language directions into a bounded plan, select an enabled specialist, and prepare internal actions for an explicit founder decision. This is a delegated operating interface, not an identity impersonation system.

## Supported actions in the first release

- Read-only analysis and operational explanations.
- Propose an internal task (`task.create`).
- Propose an internal legal-document working draft (`document.draft`).
- Save the approved internal record only after the founder selects YES.

## Approval contract

Every proposed write is bound to an approval record containing its action key, immutable payload hash, target summary, requester, expiry and decision actor. The approval endpoint rechecks the payload hash, founder/admin role and expiry before execution.

- YES / APPROVE: executes only the registered internal action adapter.
- NO / REJECT: records the decision and makes no workspace change.
- Expired or modified payload: denied.
- Unknown action key: denied.
- Public publishing, prospect outreach, payments, subscriptions, production deployment, access changes, legal filing, signing and external commitments: blocked.

## Provider and privacy

The first runtime uses the server-side NVIDIA NIM chat-completions endpoint configured through Vercel environment variables. The API key is never returned to the browser or written to the registry. Do not submit confidential client, privileged case, password, token or API-key data through this general-purpose command interface.

## Audit trail

Each command creates an `ai_orchestration_jobs` record and an `ai_agent_runs` record. Proposed writes create an `ai_approval_requests` record. A queue receipt is not execution evidence; the final result is recorded only after the database write succeeds.

## Release gates

1. Vercel preview build succeeds.
2. Founder login and organisation membership are verified.
3. NVIDIA provider key presence and one controlled inference test are verified.
4. Task and document proposal flows pass YES / NO, expiry and payload-integrity tests.
5. RLS and Supabase security advisors are reviewed.
6. Production release requires a separate founder approval.
