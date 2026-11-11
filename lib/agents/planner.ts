import type { AgentId, WorkflowDef } from "@/lib/types";

interface PlanMatch {
  department: string;
  workflow: WorkflowDef;
  reply: string;
}

const wf = (
  id: string,
  name: string,
  description: string,
  trigger: WorkflowDef["trigger"],
  steps: WorkflowDef["steps"]
): WorkflowDef => ({ id, name, description, trigger, steps });

export const BUILT_IN_WORKFLOWS: WorkflowDef[] = [
  wf("wf-campaign", "Legal Awareness Campaign (30-day)", "Full multi-agent campaign: strategy, verified topics, posts, graphics, calendar, approval gate.", "manual", [
    { name: "Develop campaign strategy", agentId: "executive", detail: "Define audience, goals, tone and 4 weekly themes." },
    { name: "Select and verify legal topics", agentId: "legal", detail: "Curate 30 corporate-law topics with source-verification notes." },
    { name: "Write 30 posts and captions", agentId: "content", detail: "Draft one post per topic with platform-specific captions." },
    { name: "Prepare graphics briefs", agentId: "creative", detail: "Create design briefs for each post's visual." },
    { name: "Build publishing calendar", agentId: "social", detail: "Map 30 posts to a day-by-day publishing schedule.", needsApproval: true },
  ]),
  wf("wf-morning", "Morning Executive Briefing", "Reviews tasks, leads, follow-ups and hearings; produces a prioritised briefing.", "schedule:daily", [
    { name: "Review outstanding tasks", agentId: "executive", detail: "Collect overdue and due-today tasks." },
    { name: "Check new leads", agentId: "crm", detail: "Identify leads added in the last 24 hours." },
    { name: "Identify urgent follow-ups", agentId: "crm", detail: "Flag high-value contacts with no recent activity." },
    { name: "Prepare executive briefing", agentId: "executive", detail: "Compose prioritised daily briefing." },
  ]),
  wf("wf-lead", "New Lead Triage", "Categorises a new lead, scores potential, drafts outreach, creates follow-up.", "event:new-lead", [
    { name: "Categorise lead", agentId: "crm", detail: "Classify by industry, type and source." },
    { name: "Analyse potential", agentId: "research", detail: "Assess commercial value and probability." },
    { name: "Assign priority", agentId: "crm", detail: "Set follow-up priority from value and urgency." },
    { name: "Draft outreach message", agentId: "content", detail: "Prepare a personalised communication draft.", needsApproval: true },
    { name: "Create follow-up task", agentId: "automation", detail: "Schedule the follow-up task." },
  ]),
  wf("wf-weekly", "Weekly Business Review", "Performance analysis, opportunity scan, content plan and pending decisions.", "schedule:weekly", [
    { name: "Review business performance", agentId: "finance", detail: "Analyse income, expenses and net by entity." },
    { name: "Analyse opportunities", agentId: "business", detail: "Review pipeline movement and stalled deals." },
    { name: "Generate content plan", agentId: "content", detail: "Propose next week's content across platforms." },
    { name: "Identify pending decisions", agentId: "executive", detail: "List matters awaiting founder approval.", needsApproval: true },
  ]),
  wf("wf-prospects", "Corporate Client Prospecting", "Researches and lists potential corporate clients with outreach drafts.", "manual", [
    { name: "Define target profile", agentId: "business", detail: "Industry, size and service fit." },
    { name: "Research candidate organisations", agentId: "research", detail: "Compile prospect list with rationale." },
    { name: "Score and prioritise", agentId: "business", detail: "Rank by value, probability and urgency." },
    { name: "Draft outreach messages", agentId: "content", detail: "Prepare personalised first-contact drafts.", needsApproval: true },
  ]),
];

interface Intent {
  keywords: string[];
  workflowId: string;
  reply: string;
}

const INTENTS: Intent[] = [
  { keywords: ["campaign", "awareness", "legal awareness"], workflowId: "wf-campaign", reply: "I will run the Legal Awareness Campaign workflow: strategy first, then verified topics, content, graphics and a publishing calendar. You will approve the calendar before anything is scheduled." },
  { keywords: ["client", "prospect", "find", "corporate clients", "leads for"], workflowId: "wf-prospects", reply: "Starting the Corporate Client Prospecting workflow. Research will compile a target list, scored and prioritised, with outreach drafts for your approval." },
  { keywords: ["briefing", "morning", "report", "weekly", "performance", "analyse", "analyze"], workflowId: "wf-weekly", reply: "I will prepare an executive review: financial performance, pipeline analysis, a content plan, and a list of decisions awaiting you." },
  { keywords: ["follow-up", "follow up", "pending"], workflowId: "wf-morning", reply: "Running the briefing workflow, which includes identifying urgent follow-ups and new leads." },
];

export function planFromInstruction(instruction: string): PlanMatch {
  const q = instruction.toLowerCase();
  for (const intent of INTENTS) {
    if (intent.keywords.some((k) => q.includes(k))) {
      const workflow = BUILT_IN_WORKFLOWS.find((w) => w.id === intent.workflowId)!;
      return { department: "Command Centre", workflow, reply: intent.reply };
    }
  }
  const fallback = BUILT_IN_WORKFLOWS.find((w) => w.id === "wf-morning")!;
  return {
    department: "Command Centre",
    workflow: fallback,
    reply:
      "I could not map that to a specific workflow yet. I can start a built-in workflow for you: a 30-day legal awareness campaign, corporate client prospecting, a morning briefing, a weekly business review, or new-lead triage. Connect an AI provider in Settings to unlock free-form planning.",
  };
}

export function detectAgents(instruction: string): AgentId[] {
  const q = instruction.toLowerCase();
  const map: [string[], AgentId][] = [
    [["legal", "case", "court", "statute", "contract"], "legal"],
    [["client", "lead", "crm", "follow"], "crm"],
    [["post", "content", "article", "script"], "content"],
    [["social", "linkedin", "facebook", "instagram", "youtube"], "social"],
    [["finance", "revenue", "expense", "profit", "cash"], "finance"],
    [["graphic", "design", "image", "video", "audio", "music"], "creative"],
    [["research", "market", "competitor"], "research"],
    [["automate", "workflow", "schedule", "trigger"], "automation"],
    [["tool", "build", "app", "integration"], "developer"],
    [["invest", "opportunit", "proposal", "partnership"], "business"],
  ];
  const found = map.filter(([kws]) => kws.some((k) => q.includes(k))).map(([, id]) => id);
  return found.length > 0 ? found : ["executive"];
}
