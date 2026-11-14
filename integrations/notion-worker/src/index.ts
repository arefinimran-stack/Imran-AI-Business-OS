import { Worker } from "@notionhq/workers";
import { j } from "@notionhq/workers/schema-builder";

const worker = new Worker();
export default worker;

/**
 * IMRAN AI Task Worker
 *
 * Notion remains the source of truth. This worker reads and writes the existing
 * Central Tasks & Activity Log through the authenticated Notion API client.
 * It deliberately declares no sync database: the task register is not an
 * external mirror and must not be placed under sync ownership.
 */
const TASKS_DATABASE_ID = "b47cbe02-8fc6-4f24-ac8e-ea932d801a78";
const TASKS_DATA_SOURCE_ID = "66277fb7-83a8-456e-9097-669a8e50458d";

const MODULES = ["CRM", "Legal", "IA² Holdings", "Content", "Finance", "General"] as const;
const PRIORITIES = ["P0", "P1", "P2", "P3"] as const;
const STATUSES = ["To Do", "In Progress", "Waiting Approval", "Done"] as const;

type TaskPage = {
  id: string;
  url?: string;
  parent?: {
    database_id?: string;
    data_source_id?: string;
  };
  properties?: Record<string, any>;
};

function richTextValue(value: any): string {
  const items = Array.isArray(value) ? value : [];
  return items.map((item) => item?.plain_text ?? item?.text?.content ?? "").join("");
}

function normalizeTask(page: TaskPage) {
  const properties = page.properties ?? {};
  const title = properties.Task?.title ?? [];
  return {
    pageId: page.id,
    url: page.url ?? null,
    task: richTextValue(title),
    status: properties.Status?.status?.name ?? properties.Status?.select?.name ?? null,
    priority: properties.Priority?.select?.name ?? null,
    module: properties.Module?.select?.name ?? null,
    deadline: properties.Deadline?.date?.start ?? null,
    accountableAI: richTextValue(properties["Accountable AI"]?.rich_text),
    notes: richTextValue(properties.Notes?.rich_text),
    recommendedAction: richTextValue(properties["Recommended Action"]?.rich_text),
    trigger: richTextValue(properties.Trigger?.rich_text),
  };
}

function richTextProperty(value: string) {
  return { rich_text: [{ type: "text", text: { content: value } }] };
}

function titleProperty(value: string) {
  return { title: [{ type: "text", text: { content: value } }] };
}

function assertTaskDatabase(page: TaskPage): void {
  const parent = page.parent ?? {};
  if (
    parent.database_id !== TASKS_DATABASE_ID
    && parent.data_source_id !== TASKS_DATA_SOURCE_ID
  ) {
    throw new Error("The supplied page is not in the IMRAN AI Central Tasks & Activity Log.");
  }
}

async function findDuplicateTask(
  notion: any,
  taskName: string,
  module: string,
  excludePageId?: string,
): Promise<TaskPage | undefined> {
  const normalizedName = taskName.trim().toLocaleLowerCase();
  let cursor: string | undefined;

  do {
    const response = await notion.dataSources.query({
      data_source_id: TASKS_DATA_SOURCE_ID,
      page_size: 100,
      ...(cursor ? { start_cursor: cursor } : {}),
      filter: { property: "Module", select: { equals: module } },
    });

    const duplicate = response.results.find((candidate: any) => {
      if (candidate.id === excludePageId) return false;
      const current = normalizeTask(candidate);
      return current.task.trim().toLocaleLowerCase() === normalizedName
        && current.module === module;
    });

    if (duplicate) return duplicate as TaskPage;
    cursor = response.has_more ? response.next_cursor ?? undefined : undefined;
  } while (cursor);

  return undefined;
}

worker.tool("getTasks", {
  title: "Get IMRAN AI Tasks",
  description:
    "Read tasks from the authoritative Central Tasks & Activity Log. Use optional filters and pagination to retrieve current task records.",
  schema: j.object({
    status: j.enum(...STATUSES).nullable().describe("Filter by task status, or null for all statuses."),
    module: j.enum(...MODULES).nullable().describe("Filter by business module, or null for all modules."),
    priority: j.enum(...PRIORITIES).nullable().describe("Filter by priority, or null for all priorities."),
    pageSize: j.integer().nullable().describe("Page size from 1 to 100; null uses 50."),
    startCursor: j.string().nullable().describe("Pagination cursor from the previous response, or null for the first page."),
  }),
  hints: { readOnlyHint: true },
  execute: async ({ status, module, priority, pageSize, startCursor }, { notion }) => {
    const limit = pageSize ?? 50;
    if (limit < 1 || limit > 100) {
      throw new Error("pageSize must be between 1 and 100.");
    }

    const filters: any[] = [];
    if (status) filters.push({ property: "Status", status: { equals: status } });
    if (module) filters.push({ property: "Module", select: { equals: module } });
    if (priority) filters.push({ property: "Priority", select: { equals: priority } });

    const response = await notion.dataSources.query({
      data_source_id: TASKS_DATA_SOURCE_ID,
      page_size: limit,
      ...(startCursor ? { start_cursor: startCursor } : {}),
      ...(filters.length === 1
        ? { filter: filters[0] }
        : filters.length > 1
          ? { filter: { and: filters } }
          : {}),
    });

    return {
      database: "Central Tasks & Activity Log",
      tasks: response.results.map((page: any) => normalizeTask(page)),
      hasMore: response.has_more,
      nextCursor: response.next_cursor ?? null,
    };
  },
});

worker.tool("getTask", {
  title: "Get IMRAN AI Task",
  description: "Retrieve one task by its Notion page ID from the authoritative task database.",
  schema: j.object({
    pageId: j.string().describe("Notion page ID returned by Get IMRAN AI Tasks."),
  }),
  hints: { readOnlyHint: true },
  execute: async ({ pageId }, { notion }) => {
    const page = await notion.pages.retrieve({ page_id: pageId }) as any;
    assertTaskDatabase(page);
    return normalizeTask(page);
  },
});

worker.tool("createTask", {
  title: "Create IMRAN AI Task",
  description:
    "Create a task in the authoritative Central Tasks & Activity Log. Checks all pages in the selected module for a case-insensitive title duplicate before creating.",
  schema: j.object({
    task: j.string().describe("Task title; leading and trailing whitespace is removed."),
    module: j.enum(...MODULES).describe("Business module for this task."),
    priority: j.enum(...PRIORITIES).describe("Task priority."),
    deadline: j.date().nullable().describe("Optional deadline in YYYY-MM-DD format, or null."),
    notes: j.string().nullable().describe("Optional task notes, or null."),
    accountableAI: j.string().nullable().describe("Optional accountable AI/owner label, or null."),
    recommendedAction: j.string().nullable().describe("Optional recommended next action, or null."),
    trigger: j.string().nullable().describe("Optional trigger or review cadence, or null."),
  }),
  execute: async (
    { task, module, priority, deadline, notes, accountableAI, recommendedAction, trigger },
    { notion },
  ) => {
    const cleanTask = task.trim();
    if (!cleanTask) throw new Error("Task title cannot be empty or whitespace.");

    const duplicate = await findDuplicateTask(notion, cleanTask, module);
    if (duplicate) {
      return {
        created: false,
        duplicatePrevented: true,
        message: "An existing task with this title and module was found; no new page was created.",
        task: normalizeTask(duplicate),
      };
    }

    const properties: Record<string, any> = {
      Task: titleProperty(cleanTask),
      Module: { select: { name: module } },
      Priority: { select: { name: priority } },
      Status: { status: { name: "To Do" } },
    };
    if (deadline) properties.Deadline = { date: { start: deadline } };
    if (notes) properties.Notes = richTextProperty(notes);
    if (accountableAI) properties["Accountable AI"] = richTextProperty(accountableAI);
    if (recommendedAction) properties["Recommended Action"] = richTextProperty(recommendedAction);
    if (trigger) properties.Trigger = richTextProperty(trigger);

    const page = await notion.pages.create({
      parent: { data_source_id: TASKS_DATA_SOURCE_ID },
      properties,
    }) as any;

    return {
      created: true,
      duplicatePrevented: false,
      message: "Task created successfully.",
      task: normalizeTask(page),
    };
  },
});

worker.tool("updateTask", {
  title: "Update IMRAN AI Task",
  description:
    "Update selected fields on an existing task. Requires a pageId from the authoritative task database. Prevents duplicate titles when renaming or moving a task between modules.",
  schema: j.object({
    pageId: j.string().describe("Notion page ID returned by Get IMRAN AI Tasks."),
    task: j.string().nullable().describe("New task title, or null to leave unchanged."),
    status: j.enum(...STATUSES).nullable().describe("New status, or null to leave unchanged."),
    module: j.enum(...MODULES).nullable().describe("New module, or null to leave unchanged."),
    priority: j.enum(...PRIORITIES).nullable().describe("New priority, or null to leave unchanged."),
    deadline: j.date().nullable().describe("New YYYY-MM-DD deadline, or null to leave unchanged."),
    clearDeadline: j.boolean().describe("Set true to remove the existing deadline; otherwise false."),
    notes: j.string().nullable().describe("Replace notes, empty string clears them, null leaves unchanged."),
    accountableAI: j.string().nullable().describe("Replace accountable AI label, empty string clears it, null leaves unchanged."),
    recommendedAction: j.string().nullable().describe("Replace recommended action, empty string clears it, null leaves unchanged."),
    trigger: j.string().nullable().describe("Replace trigger, empty string clears it, null leaves unchanged."),
  }),
  execute: async (
    { pageId, task, status, module, priority, deadline, clearDeadline, notes, accountableAI, recommendedAction, trigger },
    { notion },
  ) => {
    if (clearDeadline && deadline) {
      throw new Error("Provide either a new deadline or clearDeadline=true, not both.");
    }

    const existing = await notion.pages.retrieve({ page_id: pageId }) as any;
    assertTaskDatabase(existing);

    const properties: Record<string, any> = {};
    if (task !== null || module !== null) {
      const cleanTask = (task ?? normalizeTask(existing).task).trim();
      if (!cleanTask) throw new Error("Task title cannot be empty or whitespace.");

      const targetModule = module ?? existing.properties?.Module?.select?.name;
      if (!targetModule) throw new Error("Cannot validate this task change because its module is missing.");

      const duplicate = await findDuplicateTask(notion, cleanTask, targetModule, pageId);
      if (duplicate) {
        throw new Error("Another task with this title already exists in the selected module.");
      }

      if (task !== null) properties.Task = titleProperty(cleanTask);
      if (module !== null) properties.Module = { select: { name: module } };
    }

    if (status !== null) properties.Status = { status: { name: status } };
    if (priority !== null) properties.Priority = { select: { name: priority } };
    if (clearDeadline) properties.Deadline = { date: null };
    else if (deadline !== null) properties.Deadline = { date: { start: deadline } };
    if (notes !== null) properties.Notes = richTextProperty(notes);
    if (accountableAI !== null) properties["Accountable AI"] = richTextProperty(accountableAI);
    if (recommendedAction !== null) properties["Recommended Action"] = richTextProperty(recommendedAction);
    if (trigger !== null) properties.Trigger = richTextProperty(trigger);

    if (Object.keys(properties).length === 0) {
      throw new Error("Provide at least one field to update.");
    }

    const updated = await notion.pages.update({ page_id: pageId, properties }) as any;
    return { updated: true, task: normalizeTask(updated) };
  },
});
