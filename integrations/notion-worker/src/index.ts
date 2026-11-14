import { Worker } from "@notionhq/workers";

const worker = new Worker();
export default worker;

/**
 * IMRAN AI Task Worker
 *
 * The existing Notion Central Tasks & Activity Log database remains authoritative.
 * This worker uses the Notion API client; it intentionally does not declare a
 * managed/attached sync database, because syncing the task register would take
 * ownership away from the existing Notion workflow.
 */
const TASKS_DATABASE_ID = "b47cbe02-8fc6-4f24-ac8e-ea932d801a78";
const TASKS_DATA_SOURCE_ID = "66277fb7-83a8-456e-9097-669a8e50458d";

const MODULES = ["CRM", "Legal", "IA² Holdings", "Content", "Finance", "General"] as const;
const PRIORITIES = ["P0", "P1", "P2", "P3"] as const;
const STATUSES = ["To Do", "In Progress", "Waiting Approval", "Done"] as const;

type TaskPage = {
  id: string;
  url?: string;
  properties?: Record<string, any>;
};

function richTextValue(value: any): string {
  const items = Array.isArray(value) ? value : [];
  return items.map((item) => item?.plain_text ?? item?.text?.content ?? "").join("");
}

function normalizeTask(page: TaskPage) {
  const properties = page.properties ?? {};
  const title = properties.Task?.title ?? [];
  const status = properties.Status?.status?.name ?? properties.Status?.select?.name ?? null;
  const priority = properties.Priority?.select?.name ?? null;
  const module = properties.Module?.select?.name ?? null;
  const deadline = properties.Deadline?.date?.start ?? null;

  return {
    pageId: page.id,
    url: page.url ?? null,
    task: richTextValue(title),
    status,
    priority,
    module,
    deadline,
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

worker.tool("getTasks", {
  title: "Get IMRAN AI Tasks",
  description:
    "Read tasks from the authoritative Central Tasks & Activity Log. Supports optional status, module and priority filters. Use the returned pageId for later updates.",
  schema: {
    type: "object",
    properties: {
      status: { type: "string", enum: [...STATUSES] },
      module: { type: "string", enum: [...MODULES] },
      priority: { type: "string", enum: [...PRIORITIES] },
      pageSize: { type: "integer", minimum: 1, maximum: 100, default: 50 },
      startCursor: { type: "string" },
    },
    additionalProperties: false,
  },
  hints: { readOnlyHint: true },
  execute: async ({ status, module, priority, pageSize = 50, startCursor }, { notion }) => {
    const filters: any[] = [];
    if (status) filters.push({ property: "Status", status: { equals: status } });
    if (module) filters.push({ property: "Module", select: { equals: module } });
    if (priority) filters.push({ property: "Priority", select: { equals: priority } });

    const response = await notion.databases.query({
      database_id: TASKS_DATABASE_ID,
      page_size: pageSize,
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
  schema: {
    type: "object",
    properties: {
      pageId: { type: "string", minLength: 32 },
    },
    required: ["pageId"],
    additionalProperties: false,
  },
  hints: { readOnlyHint: true },
  execute: async ({ pageId }, { notion }) => {
    const page = await notion.pages.retrieve({ page_id: pageId }) as any;
    const parent = page.parent ?? {};
    const belongsToTasks = parent.database_id === TASKS_DATABASE_ID
      || parent.data_source_id === TASKS_DATA_SOURCE_ID;
    if (!belongsToTasks) {
      throw new Error("The supplied page is not in the IMRAN AI Central Tasks & Activity Log.");
    }
    return normalizeTask(page);
  },
});

worker.tool("createTask", {
  title: "Create IMRAN AI Task",
  description:
    "Create a task in the authoritative Central Tasks & Activity Log. Checks for an existing exact task title and module first; returns the existing record instead of creating a duplicate.",
  schema: {
    type: "object",
    properties: {
      task: { type: "string", minLength: 1, maxLength: 200 },
      module: { type: "string", enum: [...MODULES] },
      priority: { type: "string", enum: [...PRIORITIES] },
      deadline: { type: "string", format: "date" },
      notes: { type: "string", maxLength: 1800 },
      accountableAI: { type: "string", maxLength: 500 },
      recommendedAction: { type: "string", maxLength: 1800 },
      trigger: { type: "string", maxLength: 500 },
    },
    required: ["task", "module", "priority"],
    additionalProperties: false,
  },
  execute: async (
    { task, module, priority, deadline, notes, accountableAI, recommendedAction, trigger },
    { notion },
  ) => {
    const cleanTask = task.trim();
    if (!cleanTask) {
      throw new Error("Task title cannot be empty or whitespace.");
    }

    // Scan the selected module rather than relying on a case-sensitive title
    // filter. The current register is small, and this catches case/spacing
    // variants before creating another row.
    let duplicateCursor: string | undefined;
    let duplicate: any;
    do {
      const duplicateCheck = await notion.databases.query({
        database_id: TASKS_DATABASE_ID,
        page_size: 100,
        ...(duplicateCursor ? { start_cursor: duplicateCursor } : {}),
        filter: { property: "Module", select: { equals: module } },
      });

      duplicate = duplicateCheck.results.find((page: any) => {
        const existing = normalizeTask(page);
        return existing.task.trim().toLocaleLowerCase() === cleanTask.toLocaleLowerCase()
          && existing.module === module;
      });

      duplicateCursor = duplicateCheck.has_more
        ? duplicateCheck.next_cursor ?? undefined
        : undefined;
    } while (!duplicate && duplicateCursor);

    if (duplicate) {
      return {
        created: false,
        duplicatePrevented: true,
        message: "An exact task with this title and module already exists.",
        task: normalizeTask(duplicate as any),
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
      parent: { database_id: TASKS_DATABASE_ID },
      properties,
    }) as any;

    return {
      created: true,
      duplicatePrevented: false,
      task: normalizeTask(page),
    };
  },
});

worker.tool("updateTask", {
  title: "Update IMRAN AI Task",
  description:
    "Update selected fields on an existing task. Requires the exact Notion pageId returned by Get IMRAN AI Tasks; cannot update pages outside the authoritative task database.",
  schema: {
    type: "object",
    properties: {
      pageId: { type: "string", minLength: 32 },
      task: { type: "string", minLength: 1, maxLength: 200 },
      status: { type: "string", enum: [...STATUSES] },
      module: { type: "string", enum: [...MODULES] },
      priority: { type: "string", enum: [...PRIORITIES] },
      deadline: { type: ["string", "null"], format: "date" },
      notes: { type: "string", maxLength: 1800 },
      accountableAI: { type: "string", maxLength: 500 },
      recommendedAction: { type: "string", maxLength: 1800 },
      trigger: { type: "string", maxLength: 500 },
    },
    required: ["pageId"],
    additionalProperties: false,
  },
  execute: async (
    { pageId, task, status, module, priority, deadline, notes, accountableAI, recommendedAction, trigger },
    { notion },
  ) => {
    const existing = await notion.pages.retrieve({ page_id: pageId }) as any;
    const parent = existing.parent ?? {};
    const belongsToTasks = parent.database_id === TASKS_DATABASE_ID
      || parent.data_source_id === TASKS_DATA_SOURCE_ID;
    if (!belongsToTasks) {
      throw new Error("The supplied page is not in the IMRAN AI Central Tasks & Activity Log.");
    }

    const properties: Record<string, any> = {};
    if (task !== undefined) {
      const cleanTask = task.trim();
      if (!cleanTask) throw new Error("Task title cannot be empty or whitespace.");
      properties.Task = titleProperty(cleanTask);
    }
    if (status !== undefined) properties.Status = { status: { name: status } };
    if (module !== undefined) properties.Module = { select: { name: module } };
    if (priority !== undefined) properties.Priority = { select: { name: priority } };
    if (deadline !== undefined) properties.Deadline = deadline
      ? { date: { start: deadline } }
      : { date: null };
    if (notes !== undefined) properties.Notes = richTextProperty(notes);
    if (accountableAI !== undefined) properties["Accountable AI"] = richTextProperty(accountableAI);
    if (recommendedAction !== undefined) {
      properties["Recommended Action"] = richTextProperty(recommendedAction);
    }
    if (trigger !== undefined) properties.Trigger = richTextProperty(trigger);

    if (Object.keys(properties).length === 0) {
      throw new Error("Provide at least one field to update.");
    }

    const updated = await notion.pages.update({ page_id: pageId, properties }) as any;
    return { updated: true, task: normalizeTask(updated) };
  },
});
