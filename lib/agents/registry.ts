import type { AgentDef, AgentId } from "@/lib/types";

export const AGENTS: AgentDef[] = [
  { id: "executive", name: "Executive Agent", role: "Central coordination and decision support", department: "Command Centre", skills: ["Strategy", "Delegation", "Briefings", "Reporting"] },
  { id: "legal", name: "Legal Agent", role: "Legal research and drafting", department: "Arefin Legal & Corporate Group", skills: ["Research", "Drafting", "Case analysis", "Compliance"] },
  { id: "business", name: "Business Development Agent", role: "Prospecting and opportunities", department: "Business Development", skills: ["Prospect lists", "Proposals", "Pipeline analysis"] },
  { id: "crm", name: "CRM Agent", role: "Client management and follow-ups", department: "CRM", skills: ["Lead triage", "Follow-ups", "Relationship strength"] },
  { id: "content", name: "Content Agent", role: "Content creation and marketing", department: "Content", skills: ["Posts", "Articles", "Scripts", "Campaigns"] },
  { id: "social", name: "Social Media Agent", role: "Publishing and engagement monitoring", department: "Social Media", skills: ["Calendars", "Scheduling", "Hashtags", "Reporting"] },
  { id: "research", name: "Research Agent", role: "Market intelligence and research", department: "Research", skills: ["Market scans", "Competitors", "Summaries"] },
  { id: "finance", name: "Finance Agent", role: "Financial analysis and reporting", department: "Finance", skills: ["P&L analysis", "Cash flow", "Reporting"] },
  { id: "creative", name: "Creative Agent", role: "Image, video, audio and design generation", department: "Creative Studio", skills: ["Graphics briefs", "Brand assets", "Media production"] },
  { id: "automation", name: "Automation Agent", role: "Workflow creation and execution", department: "Autopilot", skills: ["Workflows", "Schedules", "Triggers", "Retries"] },
  { id: "developer", name: "Developer Agent", role: "Builds software, tools and integrations", department: "Tool Builder", skills: ["Tool specs", "Code generation", "Integrations"] },
];

export const agentById = (id: AgentId): AgentDef => AGENTS.find((a) => a.id === id) ?? AGENTS[0];
