export type ContactStatus = "lead" | "active" | "client" | "dormant";
export type CaseStatus = "open" | "pending" | "closed";
export type OpportunityStage = "prospect" | "negotiation" | "won" | "lost";
export type VideoStatus = "idea" | "scripting" | "filming" | "editing" | "published";
export type PostStatus = "draft" | "scheduled" | "posted";
export type ProjectStatus = "brief" | "design" | "review" | "delivered";
export type TrackStatus = "idea" | "recording" | "mixing" | "released";
export type Platform = "YouTube" | "Facebook" | "LinkedIn" | "Instagram" | "X";

export interface BaseEntity {
  id: string;
  createdAt: string;
}

export interface Contact extends BaseEntity {
  name: string;
  company: string;
  phone: string;
  email: string;
  status: ContactStatus;
  value: number;
  note: string;
}

export interface LegalCase extends BaseEntity {
  title: string;
  client: string;
  court: string;
  nextHearing: string;
  status: CaseStatus;
  fee: number;
  feePaid: number;
  notes: string;
}

export interface Opportunity extends BaseEntity {
  title: string;
  entity: string;
  value: number;
  stage: OpportunityStage;
  note: string;
}

export interface Video extends BaseEntity {
  title: string;
  status: VideoStatus;
  plannedDate: string;
  note: string;
}

export interface Post extends BaseEntity {
  platform: Platform;
  content: string;
  scheduledDate: string;
  status: PostStatus;
}

export interface CreativeProject extends BaseEntity {
  name: string;
  type: string;
  status: ProjectStatus;
  note: string;
}

export interface Track extends BaseEntity {
  title: string;
  genre: string;
  status: TrackStatus;
  note: string;
}

export interface Transaction extends BaseEntity {
  label: string;
  amount: number;
  category: string;
  date: string;
  entity: string;
}

export interface Task extends BaseEntity {
  title: string;
  department: string;
  due: string;
  done: boolean;
}

export type AgentId =
  | "executive"
  | "legal"
  | "business"
  | "crm"
  | "content"
  | "social"
  | "research"
  | "finance"
  | "creative"
  | "automation"
  | "developer";

export interface AgentDef {
  id: AgentId;
  name: string;
  role: string;
  department: string;
  skills: string[];
}

export type RunStepStatus = "pending" | "running" | "done" | "awaiting_approval" | "failed";

export interface RunStep {
  id: string;
  name: string;
  agentId: AgentId;
  detail: string;
  status: RunStepStatus;
  output?: string;
  needsApproval?: boolean;
}

export type RunStatus = "running" | "awaiting_approval" | "completed" | "failed" | "paused";

export interface WorkflowRun {
  id: string;
  workflowId: string;
  title: string;
  status: RunStatus;
  steps: RunStep[];
  createdAt: string;
  updatedAt: string;
  log: { ts: string; agentId: AgentId; message: string }[];
}

export interface WorkflowDef {
  id: string;
  name: string;
  description: string;
  trigger: "manual" | "schedule:daily" | "schedule:weekly" | "event:new-lead";
  steps: { name: string; agentId: AgentId; detail: string; needsApproval?: boolean }[];
}

export interface Approval {
  id: string;
  runId: string;
  stepId: string;
  title: string;
  agentId: AgentId;
  summary: string;
  status: "pending" | "approved" | "rejected";
  createdAt: string;
}

export interface AuditEntry {
  id: string;
  ts: string;
  actor: string;
  action: string;
  detail: string;
}

export interface AppData {
  contacts: Contact[];
  cases: LegalCase[];
  opportunities: Opportunity[];
  videos: Video[];
  posts: Post[];
  projects: CreativeProject[];
  tracks: Track[];
  transactions: Transaction[];
  tasks: Task[];
  workflows: WorkflowDef[];
  runs: WorkflowRun[];
  approvals: Approval[];
  audit: AuditEntry[];
  settings: {
    lockEnabled: boolean;
    pin: string;
    onboarded: boolean;
    lastVisit: string;
  };
}

export const BUSINESS_ENTITIES = [
  "Arefin Legal & Corporate Group",
  "IA² Holdings",
  "C3 Lifestyle",
  "Bold Cotton",
  "Independent",
] as const;

export const DEPARTMENTS = [
  { slug: "/", name: "Executive Dashboard", icon: "🏛️" },
  { slug: "/legal", name: "Legal Chamber", icon: "⚖️" },
  { slug: "/crm", name: "CRM", icon: "🤝" },
  { slug: "/business", name: "Business Development", icon: "📈" },
  { slug: "/youtube", name: "YouTube Studio", icon: "🎬" },
  { slug: "/social", name: "Social Media", icon: "📱" },
  { slug: "/creative", name: "Creative Studio", icon: "🎨" },
  { slug: "/music", name: "Music Studio", icon: "🎵" },
  { slug: "/finance", name: "Finance Manager", icon: "💰" },
  { slug: "/ai", name: "AI Control Centre", icon: "🤖" },
] as const;
