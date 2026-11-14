# IMRAN AI Notion Worker — task operations

Standalone Notion Worker project for controlled operations against the existing **Central Tasks & Activity Log**.

## Source-of-truth and safety rules

- Notion remains authoritative.
- The live task data source is `66277fb7-83a8-456e-9097-669a8e50458d`, under database `b47cbe02-8fc6-4f24-ac8e-ea932d801a78`.
- The existing register was verified with 22 task records on 14 November 2026.
- This Worker does not declare a managed/attached sync database and does not change the existing schema or rows.
- Do not add a sync against the production task register. Replace mode can delete rows not returned by a complete upstream snapshot.
- Existing task pages are addressed by their Notion page IDs. No new Task ID property is required.
- No delete operation is exposed.
- `createTask` scans the selected module and checks a normalized title before creating. This reduces duplicates but is not a transactional uniqueness constraint; serialize concurrent create requests.

## Tools

| Tool | Access | Purpose |
|---|---|---|
| `getTasks` | Read-only | Filter and paginate existing tasks |
| `getTask` | Read-only | Retrieve one task by Notion page ID |
| `createTask` | Write | Create after duplicate checking |
| `updateTask` | Write | Update title, module, status, priority, deadline and operational notes |

Write tools omit `readOnlyHint`; Notion Custom Agents therefore request permission before executing them under the default policy.

## Runtime and requirements

- Node.js 22+
- npm 10+
- Notion CLI (`ntn`)
- A Notion workspace with Workers enabled. Notion currently documents Workers as a Business/Enterprise capability subject to workspace enablement.
- The signed-in Notion identity must be allowed to deploy Workers and access the target database.

## Install, validate and deploy

Run these commands from this directory:

```bash
npm install
npm run typecheck
ntn login
npm run deploy
```

The deploy script runs:

```bash
ntn workers deploy --name "IMRAN AI Task Worker"
```

The CLI creates the Worker on first deploy and writes its local `workers.json` identity/configuration file. That file is deliberately git-ignored because it is workspace-specific.

After deployment, verify the read path:

```bash
ntn workers exec getTasks -d '{"status":null,"module":null,"priority":null,"pageSize":100,"startCursor":null}'
```

Expected verification: all 22 current task rows are returned (subject to the live database not having changed since the last inspection). Follow `nextCursor` if `hasMore` is true.

Then test one task lookup using a returned `pageId`:

```bash
ntn workers exec getTask -d '{"pageId":"<PAGE_ID_FROM_GET_TASKS>"}'
```

The schema builder marks every object field as required. For optional fields, pass `null` explicitly. Example duplicate-safe create test (use an existing task title and module):

```bash
ntn workers exec createTask -d '{"task":"<EXISTING_TASK_TITLE>","module":"General","priority":"P2","deadline":null,"notes":null,"accountableAI":null,"recommendedAction":null,"trigger":null}'
```

Example no-op-safe update shape (replace the page ID; set one field to a new value):

```bash
ntn workers exec updateTask -d '{"pageId":"<PAGE_ID_FROM_GET_TASKS>","task":null,"status":null,"module":null,"priority":null,"deadline":null,"clearDeadline":false,"notes":null,"accountableAI":null,"recommendedAction":null,"trigger":null}'
```

## Connect to the Custom Agent

In Notion, open the intended Custom Agent's tool configuration, connect **IMRAN AI Task Worker**, and enable:

1. Get IMRAN AI Tasks
2. Get IMRAN AI Task
3. Create IMRAN AI Task
4. Update IMRAN AI Task

The Worker's Notion API client runs with the permissions of the Custom Agent. Confirm the agent can open the Central Tasks & Activity Log database before enabling write tools.

## Production acceptance tests

1. `getTasks` returns exactly the live record count and valid pagination metadata.
2. `getTask` accepts a task page ID from that result and rejects a page outside the task database.
3. `createTask` called with an existing title/module returns the existing record and creates no row.
4. Create one new task only in an approved test database or after explicit approval.
5. `updateTask` changes only the requested fields on an approved test record.
6. Confirm no existing rows, properties, or relations were lost.
7. Inspect Worker logs after each execution.

Do not treat the website's Vercel/Netlify deployment checks as Worker deployment or runtime tests. Those are separate systems.

## Why no sync is declared

A Worker sync imports an external upstream dataset into a Worker-managed Notion database. The Central Tasks register is already authoritative. A second synced task database would fragment operations; attaching or locking the live register is intentionally avoided. Add syncs only when a concrete external source, stable upstream key, deletion policy, and destination database have been approved.

## Existing application integration

The Founder Command Centre already has task API routes, but its previous backend integration returned HTTP 403 because its configured internal integration did not have access to the Central Tasks database. Worker Custom Agent execution uses the permissions of the connected Custom Agent; this does not automatically repair the separate AppDeploy backend token. Keep that permission issue tracked separately.
