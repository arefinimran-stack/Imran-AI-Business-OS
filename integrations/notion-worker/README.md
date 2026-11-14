# IMRAN AI Notion Worker — task operations

This directory contains the Worker source for controlled operations against the existing Notion **Central Tasks & Activity Log**.

## Source-of-truth rules

- Notion remains authoritative.
- The existing database contains 22 task records and is not recreated.
- This worker does **not** declare a managed or attached sync database.
- Do not attach the production task database to a sync or run replace mode against it.
- The worker uses the existing Notion database ID: `b47cbe02-8fc6-4f24-ac8e-ea932d801a78`.
- Existing task pages are addressed by their Notion page IDs. No new Task ID column is required for updates.
- `createTask` checks exact task title + module before creating. This is a practical duplicate guard, not a transactional uniqueness constraint; concurrent simultaneous creates should be serialized by the calling agent.

## Tools

| Tool | Access | Purpose |
|---|---|---|
| `getTasks` | Read-only | Filter and paginate existing tasks |
| `getTask` | Read-only | Retrieve one task by Notion page ID |
| `createTask` | Write | Create a task after duplicate check |
| `updateTask` | Write | Update status, priority, deadline, notes or recommended action |

Write tools intentionally omit `readOnlyHint`, so Notion treats them as write operations and can request confirmation in the agent flow. No delete tool is provided.

## Why there is no sync yet

A Notion Worker sync is for pulling records from an **external upstream source into a Worker-managed Notion database**. The Central Tasks register is already the authoritative source; syncing it back into another managed database would create a competing task register. A sync should be added only when a concrete external source is selected (for example, an approved CRM or issue tracker) and its ownership, identifiers and deletion semantics are defined.

## Install into a Notion Worker project

1. Create or open the Worker project with the Notion CLI.
2. Copy this `src/index.ts` into the Worker project's `src/index.ts`.
3. Deploy with `ntn workers deploy`.
4. Attach the deployed Worker to the intended Notion Custom Agent and enable the four tools.
5. For local `ntn workers exec` testing, configure `NOTION_API_TOKEN` as a Worker secret or in the local ignored `.env` file. Do not commit or paste the token into source control.

## Required verification

- Run the read-only `getTasks` tool with pageSize 100.
- Confirm 22 records are returned and compare statuses to the live Notion view.
- Verify `getTask` with one returned pageId.
- Test `createTask` with a deliberately duplicated title/module and confirm it returns the existing page without creating a row.
- Test a new task only in a separately approved test database or after explicit approval.
- Test `updateTask` on an approved non-critical record; verify the changed property in Notion.
- Do not enable any sync against the existing task database.

## Database schema expected by this Worker

- `Task`: title
- `Status`: status
- `Priority`: select
- `Module`: select
- `Deadline`: date
- `Notes`, `Accountable AI`, `Recommended Action`, `Trigger`: rich text

The schema was inspected from the live Notion database on 14 November 2026.
