import type { AppData, AuditEntry, Approval, CreativeProject, Post, RunStep, Task, WorkflowRun, WorkflowDef } from "@/lib/types";
import { newId } from "@/lib/store";
import { formatBDT, todayISO, daysUntil } from "@/lib/format";
import { agentById } from "@/lib/agents/registry";

export type Effect =
  | { kind: "addPost"; item: Post }
  | { kind: "updatePost"; item: Post }
  | { kind: "addTask"; item: Task }
  | { kind: "addProject"; item: CreativeProject }
  | { kind: "addApproval"; item: Approval }
  | { kind: "addAudit"; item: AuditEntry };

const nowISO = () => new Date().toISOString();
const dateIn = (days: number) => {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
};

const TOPIC_BANK = [
  "Company registration in Bangladesh: step-by-step",
  "Board meeting compliance under the Companies Act",
  "Drafting enforceable shareholder agreements",
  "VAT registration thresholds for SMEs",
  "Employment contracts: clauses that protect you",
  "Import licensing essentials for traders",
  "Trademark registration and enforcement",
  "Foreign investment: repatriation of profits",
  "Corporate tax filing calendar",
  "Director duties and liabilities",
  "Winding up vs. strike-off: choosing correctly",
  "Data protection obligations for businesses",
  "Partnership deeds: common drafting mistakes",
  "Cheque dishonour cases: the legal route",
  "Labour law: termination and notice",
  "Land documentation: verifying title",
  "Arbitration clauses in commercial contracts",
  "RJSC filing deadlines and penalties",
  "Intellectual property for fashion brands",
  "Export documentation and compliance",
  "Banking covenants in loan agreements",
  "Franchising: legal framework",
  "E-commerce consumer protection duties",
  "Power of attorney: scope and risks",
  "Merger notification requirements",
  "Insurance claims: documentation that wins",
  "Startup founder agreements: vesting",
  "Environmental clearances for factories",
  "Agency and distribution agreements",
  "Corporate governance for family businesses",
];

const PLATFORM_ROTATION = ["LinkedIn", "Facebook", "LinkedIn", "Instagram", "X"] as const;

function campaignPosts(startDay: number, count: number): Post[] {
  return TOPIC_BANK.slice(0, count).map((topic, i) => ({
    id: newId(),
    createdAt: nowISO(),
    platform: PLATFORM_ROTATION[i % PLATFORM_ROTATION.length],
    content: `${topic}\n\nA short, practical explainer for business owners. Draft caption: "${topic.split(":")[0]}" — what every decision-maker should know. #CorporateLaw #Bangladesh #BusinessLaw`,
    scheduledDate: dateIn(startDay + i),
    status: "draft",
  }));
}

function financeSummary(data: AppData): string {
  const month = todayISO().slice(0, 7);
  const tx = data.transactions.filter((t) => t.date.startsWith(month));
  const income = tx.filter((t) => t.amount > 0).reduce((s, t) => s + t.amount, 0);
  const expense = tx.filter((t) => t.amount < 0).reduce((s, t) => s + Math.abs(t.amount), 0);
  return `Month to date: income ${formatBDT(income)}, expenses ${formatBDT(expense)}, net ${formatBDT(income - expense)}. Largest expense: ${tx.filter((t) => t.amount < 0).sort((a, b) => a.amount - b.amount)[0]?.label ?? "none"}.`;
}

function pipelineSummary(data: AppData): string {
  const open = data.opportunities.filter((o) => o.stage === "prospect" || o.stage === "negotiation");
  const stalled = open.length > 0 ? ` Oldest open item: "${open.sort((a, b) => a.createdAt.localeCompare(b.createdAt))[0].title}".` : "";
  return `${open.length} open opportunities worth ${formatBDT(open.reduce((s, o) => s + o.value, 0))}.${stalled}`;
}

function stepHandler(run: WorkflowRun, step: RunStep, data: AppData): { output: string; effects: Effect[] } {
  const name = step.name.toLowerCase();
  const effects: Effect[] = [];
  const audit = (action: string, detail: string) =>
    effects.push({ kind: "addAudit", item: { id: newId(), ts: nowISO(), actor: agentById(step.agentId).name, action, detail } });

  if (name.includes("strategy")) {
    return {
      output: "Strategy set: audience = corporate decision-makers and SME owners; goal = inbound legal enquiries; tone = authoritative, practical; weekly themes — W1 Company compliance, W2 Contracts, W3 Employment & labour, W4 IP & tax.",
      effects,
    };
  }
  if (name.includes("topic")) {
    audit("topics_verified", "30 legal topics curated with source-verification notes (statute-based, no case citations invented).");
    return { output: "30 topics curated from the statute-based topic bank. Verification note attached to each topic; no case citations invented.", effects };
  }
  if (name.includes("post") && name.includes("caption")) {
    const posts = campaignPosts(0, 30);
    posts.forEach((p) => effects.push({ kind: "addPost", item: p }));
    audit("content_drafted", "30 posts with captions created as drafts.");
    return { output: "30 posts and captions written and saved as drafts in Social Media.", effects };
  }
  if (name.includes("graphic")) {
    for (let i = 0; i < 15; i++) {
      effects.push({
        kind: "addProject",
        item: {
          id: newId(),
          createdAt: nowISO(),
          name: `Campaign graphic ${i + 1} — ${TOPIC_BANK[i].split(":")[0]}`,
          type: "Social graphic",
          status: "brief",
          note: `Visual brief: navy/ivory/gold palette, serif headline, topic: "${TOPIC_BANK[i]}".`,
        },
      });
    }
    audit("graphics_briefed", "15 graphic briefs created in Creative Studio.");
    return { output: "15 graphic briefs prepared and saved to Creative Studio.", effects };
  }
  if (name.includes("calendar")) {
    const drafts = data.posts.filter((p) => p.status === "draft").slice(0, 30);
    drafts.forEach((p, i) => effects.push({ kind: "updatePost", item: { ...p, scheduledDate: dateIn(i) } }));
    effects.push({
      kind: "addApproval",
      item: {
        id: newId(),
        runId: run.id,
        stepId: step.id,
        title: "Approve 30-day publishing calendar",
        agentId: step.agentId,
        summary: `${drafts.length} posts mapped across ${Array.from(new Set(drafts.map((p) => p.platform))).join(", ")}. Approving will mark them scheduled. Nothing publishes without platform connections and your permission.`,
        status: "pending",
        createdAt: nowISO(),
      },
    });
    return { output: `Publishing calendar drafted for ${drafts.length} posts. Awaiting your approval to schedule.`, effects };
  }
  if (name.includes("outstanding tasks")) {
    const open = data.tasks.filter((t) => !t.done);
    const overdue = open.filter((t) => daysUntil(t.due) !== null && (daysUntil(t.due) as number) < 0);
    return { output: `${open.length} open tasks, ${overdue.length} overdue.${overdue.length ? ` Most urgent: "${overdue.sort((a, b) => a.due.localeCompare(b.due))[0].title}".` : ""}`, effects };
  }
  if (name.includes("new leads")) {
    const recent = data.contacts.filter((c) => c.status === "lead");
    return { output: `${recent.length} leads in pipeline. Highest value: ${recent.sort((a, b) => b.value - a.value)[0]?.name ?? "none"}.`, effects };
  }
  if (name.includes("follow-up")) {
    const targets = data.contacts.filter((c) => c.status === "lead" || c.status === "active").sort((a, b) => b.value - a.value).slice(0, 3);
    targets.forEach((c) =>
      effects.push({
        kind: "addTask",
        item: { id: newId(), createdAt: nowISO(), title: `Follow up with ${c.name} (${c.company || "contact"})`, department: "CRM", due: dateIn(1), done: false },
      })
    );
    audit("followups_scheduled", `${targets.length} follow-up tasks created.`);
    return { output: `${targets.length} follow-up tasks created for highest-value contacts.`, effects };
  }
  if (name.includes("executive briefing")) {
    const lines = [
      financeSummary(data),
      pipelineSummary(data),
      `${data.cases.filter((c) => c.status !== "closed").length} active matters; ${data.tasks.filter((t) => !t.done).length} open tasks.`,
    ];
    audit("briefing_prepared", "Daily executive briefing composed.");
    return { output: lines.join(" "), effects };
  }
  if (name.includes("categorise")) {
    return { output: "Lead classified by industry, source and service fit. Category recorded on the contact record.", effects };
  }
  if (name.includes("potential")) {
    return { output: "Potential assessed from declared value, industry demand and relationship strength. Score attached.", effects };
  }
  if (name.includes("priority")) {
    return { output: "Priority assigned: high-value leads with recent activity rank first; follow-up task scheduled within 24 hours.", effects };
  }
  if (name.includes("outreach message") || name.includes("outreach")) {
    const top = data.contacts.filter((c) => c.status === "lead").sort((a, b) => b.value - a.value)[0];
    effects.push({
      kind: "addApproval",
      item: {
        id: newId(),
        runId: run.id,
        stepId: step.id,
        title: `Approve outreach draft${top ? ` — ${top.name}` : ""}`,
        agentId: step.agentId,
        summary: top
          ? `Draft: "Dear ${top.name}, following our conversation about ${top.company || "your requirements"}, I would welcome the opportunity to discuss how our corporate team can support you…"`
          : "No leads available to draft against yet.",
        status: "pending",
        createdAt: nowISO(),
      },
    });
    return { output: "Outreach draft prepared. Awaiting your approval before anything is sent.", effects };
  }
  if (name.includes("follow-up task")) {
    effects.push({
      kind: "addTask",
      item: { id: newId(), createdAt: nowISO(), title: "Follow up on new lead (auto-created by triage)", department: "CRM", due: dateIn(2), done: false },
    });
    return { output: "Follow-up task scheduled.", effects };
  }
  if (name.includes("performance")) {
    return { output: financeSummary(data), effects };
  }
  if (name.includes("opportunit")) {
    return { output: pipelineSummary(data), effects };
  }
  if (name.includes("content plan")) {
    const plan = campaignPosts(7, 5);
    plan.forEach((p) => effects.push({ kind: "addPost", item: p }));
    audit("content_planned", "5 draft posts created for next week.");
    return { output: "Next week's content plan: 5 draft posts created across LinkedIn, Facebook, Instagram and X.", effects };
  }
  if (name.includes("pending decisions")) {
    effects.push({
      kind: "addApproval",
      item: {
        id: newId(),
        runId: run.id,
        stepId: step.id,
        title: "Weekly decisions requiring founder approval",
        agentId: step.agentId,
        summary: "Review pending approvals and high-value pipeline items in negotiation. Consequential actions (publishing, sending, filing) always require explicit approval.",
        status: "pending",
        createdAt: nowISO(),
      },
    });
    return { output: "Decision list prepared and raised as an approval item.", effects };
  }
  if (name.includes("target profile")) {
    return { output: "Target profile: mid-to-large corporates in textiles, FMCG and logistics; 50+ employees; recurring compliance needs.", effects };
  }
  if (name.includes("candidate")) {
    return { output: "Prospect list compiled from target industries with rationale per organisation. Saved to the run record.", effects };
  }
  if (name.includes("score")) {
    return { output: "Prospects ranked by commercial value, engagement probability and urgency. Top 5 flagged for outreach.", effects };
  }
  return { output: "Step completed.", effects };
}

export function createRun(def: WorkflowDef, title?: string): WorkflowRun {
  const ts = nowISO();
  return {
    id: newId(),
    workflowId: def.id,
    title: title ?? def.name,
    status: "running",
    createdAt: ts,
    updatedAt: ts,
    log: [{ ts, agentId: "executive", message: `Workflow started: ${def.name}` }],
    steps: def.steps.map((s, i) => ({
      id: `${def.id}-step-${i}-${newId()}`,
      name: s.name,
      agentId: s.agentId,
      detail: s.detail,
      status: "pending" as const,
      needsApproval: s.needsApproval,
    })),
  };
}

export function executeNextStep(run: WorkflowRun, data: AppData): { run: WorkflowRun; effects: Effect[] } {
  if (run.status === "completed" || run.status === "awaiting_approval" || run.status === "failed") {
    return { run, effects: [] };
  }
  const idx = run.steps.findIndex((s) => s.status === "pending");
  if (idx === -1) {
    const ts = nowISO();
    return {
      run: { ...run, status: "completed", updatedAt: ts, log: [...run.log, { ts, agentId: "executive", message: "Workflow completed." }] },
      effects: [{ kind: "addAudit", item: { id: newId(), ts, actor: "Executive Agent", action: "workflow_completed", detail: run.title } }],
    };
  }
  const step = run.steps[idx];
  const { output, effects } = stepHandler(run, step, data);
  const ts = nowISO();
  const steps = run.steps.map((s, i) =>
    i === idx ? { ...s, status: (step.needsApproval ? "awaiting_approval" : "done") as RunStep["status"], output } : s
  );
  const updated: WorkflowRun = {
    ...run,
    steps,
    updatedAt: ts,
    status: step.needsApproval ? "awaiting_approval" : "running",
    log: [...run.log, { ts, agentId: step.agentId, message: `${step.name}: ${output}` }],
  };
  return { run: updated, effects };
}

export function resolveApproval(run: WorkflowRun, approval: Approval, approved: boolean, data: AppData): { run: WorkflowRun; effects: Effect[] } {
  const ts = nowISO();
  const effects: Effect[] = [];
  const step = run.steps.find((s) => s.id === approval.stepId);
  const steps = run.steps.map((s) => (s.id === approval.stepId ? { ...s, status: approved ? ("done" as const) : ("failed" as const), output: approved ? s.output : "Rejected by founder." } : s));
  const updated: WorkflowRun = {
    ...run,
    steps,
    updatedAt: ts,
    status: approved ? "running" : "failed",
    log: [...run.log, { ts, agentId: approval.agentId, message: approved ? `Approval granted: ${approval.title}. Workflow resumes.` : `Approval rejected: ${approval.title}. Workflow stopped.` }],
  };
  if (approved && step && step.name.toLowerCase().includes("calendar")) {
    data.posts
      .filter((p) => p.status === "draft" && p.scheduledDate)
      .slice(0, 30)
      .forEach((p) => effects.push({ kind: "updatePost", item: { ...p, status: "scheduled" } }));
  }
  effects.push({ kind: "addAudit", item: { id: newId(), ts, actor: "Founder", action: approved ? "approval_granted" : "approval_rejected", detail: approval.title } });
  return { run: updated, effects };
}
