"use client";

import { useState } from "react";
import {
  Activity, ArrowDownRight, ArrowUpRight, Bell, BriefcaseBusiness, CalendarDays,
  ChevronDown, CircleHelp, Command, FileText, FolderKanban, LayoutDashboard,
  Menu, MessageSquareText, Plus, Search, Settings2, ShieldCheck, Sparkles,
  Users, Wallet, X, Zap
} from "lucide-react";

const navigation = [
  { label: "Overview", icon: LayoutDashboard, active: true },
  { label: "CRM & Relationships", icon: Users },
  { label: "Legal Chamber", icon: BriefcaseBusiness },
  { label: "Business Ventures", icon: FolderKanban },
  { label: "Finance", icon: Wallet },
  { label: "Content & Creative", icon: FileText },
];
const tasks = [
  { title: "Review priority client matters", detail: "Legal Chamber · Today", tag: "Priority", color: "amber" },
  { title: "Follow up on qualified leads", detail: "CRM · Today", tag: "Business", color: "green" },
  { title: "Prepare weekly venture review", detail: "IA² Holdings · Tomorrow", tag: "Planning", color: "slate" },
];
const ventures = [
  { name: "Arefin Legal & Corporate", type: "Professional practice", initials: "AL", color: "bg-[#e8eee9]" },
  { name: "IA² Holdings", type: "Investment & ventures", initials: "IA", color: "bg-[#f1ebdf]" },
  { name: "C3 Lifestyle", type: "Lifestyle & consumer", initials: "C3", color: "bg-[#e9edf5]" },
  { name: "Bold Cotton", type: "Apparel & commerce", initials: "BC", color: "bg-[#f3e9e7]" },
];

function SectionTitle({ title, action }: { title: string; action?: string }) {
  return <div className="mb-4 flex items-center justify-between"><h2 className="text-sm font-semibold text-slate-900">{title}</h2>{action && <button className="text-xs font-medium text-[#315e50] hover:underline">{action}</button>}</div>;
}

export default function Dashboard() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [activeNav, setActiveNav] = useState("Overview");
  const [showBrief, setShowBrief] = useState(true);
  return (
    <div className="min-h-screen bg-[#f5f6f8]">
      <aside className={`fixed inset-y-0 left-0 z-40 flex w-[258px] flex-col border-r border-slate-200 bg-white transition-transform lg:translate-x-0 ${menuOpen ? "translate-x-0" : "-translate-x-full"}`}>
        <div className="flex h-[76px] items-center gap-3 border-b border-slate-100 px-6">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#183b35] text-sm font-bold tracking-tight text-white">IA</div>
          <div><div className="text-[15px] font-bold tracking-wide text-slate-900">IMRAN AI</div><div className="text-[10px] font-medium uppercase tracking-[.18em] text-slate-400">Business operating system</div></div>
          <button onClick={() => setMenuOpen(false)} className="ml-auto rounded-lg p-2 text-slate-400 lg:hidden" aria-label="Close menu"><X size={18}/></button>
        </div>
        <div className="px-4 pt-6">
          <div className="mb-3 px-3 text-[10px] font-semibold uppercase tracking-[.16em] text-slate-400">Workspace</div>
          <nav className="space-y-1">{navigation.map(({label,icon:Icon}) => <button key={label} onClick={() => {setActiveNav(label);setMenuOpen(false);}} className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-[13px] font-medium transition ${activeNav===label ? "bg-[#edf3ef] text-[#214b3e]" : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"}`}><Icon size={17}/>{label}{label==="Legal Chamber" && <span className="ml-auto h-1.5 w-1.5 rounded-full bg-[#c9a86a]"/>}</button>)}</nav>
        </div>
        <div className="mt-8 px-4"><div className="mb-3 px-3 text-[10px] font-semibold uppercase tracking-[.16em] text-slate-400">Intelligence</div>
          <button className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-[13px] font-medium text-slate-500 hover:bg-slate-50"><Sparkles size={17}/>AI Control Centre</button>
          <button className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-[13px] font-medium text-slate-500 hover:bg-slate-50"><Zap size={17}/>Automations</button>
          <button className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-[13px] font-medium text-slate-500 hover:bg-slate-50"><Activity size={17}/>Reports & Insights</button>
        </div>
        <div className="mt-auto p-4">
          <div className="rounded-2xl bg-[#f5f7f5] p-4"><div className="mb-2 flex items-center gap-2 text-xs font-semibold text-[#315e50]"><ShieldCheck size={15}/>Private workspace</div><p className="text-[11px] leading-5 text-slate-500">Designed for controlled access to professional and business information.</p></div>
          <button className="mt-4 flex w-full items-center gap-3 px-3 py-2 text-xs font-medium text-slate-500"><Settings2 size={16}/>Settings <span className="ml-auto">⌘ ,</span></button>
        </div>
      </aside>
      {menuOpen && <button aria-label="Close navigation overlay" onClick={() => setMenuOpen(false)} className="fixed inset-0 z-30 bg-slate-950/30 lg:hidden"/>}
      <main className="min-h-screen lg:pl-[258px]">
        <header className="sticky top-0 z-20 flex h-[76px] items-center justify-between border-b border-slate-200/80 bg-white/90 px-4 backdrop-blur md:px-8">
          <div className="flex items-center gap-3"><button onClick={() => setMenuOpen(true)} className="rounded-lg p-2 text-slate-500 lg:hidden" aria-label="Open menu"><Menu size={20}/></button><div><div className="text-[11px] font-medium text-slate-400">Founder workspace / <span className="text-slate-600">{activeNav}</span></div><div className="mt-0.5 text-sm font-semibold text-slate-900">Command Centre</div></div></div>
          <div className="flex items-center gap-2 md:gap-4"><button className="hidden h-9 items-center gap-2 rounded-lg border border-slate-200 px-3 text-xs text-slate-400 sm:flex"><Search size={14}/>Search workspace <span className="ml-5 rounded border border-slate-200 px-1.5 py-0.5 text-[10px]">⌘ K</span></button><button className="relative rounded-lg p-2 text-slate-500 hover:bg-slate-100" aria-label="Notifications"><Bell size={18}/><span className="absolute right-1.5 top-1.5 h-1.5 w-1.5 rounded-full bg-[#c9a86a]"/></button><div className="hidden h-8 w-px bg-slate-200 sm:block"/><button className="flex items-center gap-2"><div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#e9eee9] text-xs font-bold text-[#315e50]">IA</div><div className="hidden text-left sm:block"><div className="text-xs font-semibold text-slate-800">Founder</div><div className="text-[10px] text-slate-400">Administrator</div></div><ChevronDown size={14} className="hidden text-slate-400 sm:block"/></button></div>
        </header>
        <div className="mx-auto max-w-[1440px] px-4 py-7 md:px-8 md:py-9">
          <div className="mb-7 flex flex-col justify-between gap-4 sm:flex-row sm:items-end"><div><div className="mb-2 flex items-center gap-2 text-xs font-medium text-[#47705f]"><span className="h-2 w-2 rounded-full bg-emerald-500"/>Your operating overview</div><h1 className="text-[26px] font-semibold tracking-tight text-slate-950 md:text-[30px]">Good evening, Imran.</h1><p className="mt-1.5 text-sm text-slate-500">A clear view of your practice, ventures and priorities.</p></div><button className="inline-flex h-10 items-center justify-center gap-2 self-start rounded-xl bg-[#183b35] px-4 text-xs font-semibold text-white shadow-sm transition hover:bg-[#245448] sm:self-auto"><Plus size={15}/>Quick create</button></div>
          {showBrief && <section className="relative mb-7 overflow-hidden rounded-2xl bg-[#183b35] p-5 text-white shadow-soft md:p-6"><button onClick={() => setShowBrief(false)} aria-label="Dismiss briefing" className="absolute right-4 top-4 rounded-lg p-1 text-white/50 hover:bg-white/10 hover:text-white"><X size={16}/></button><div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between"><div className="max-w-2xl"><div className="mb-3 flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[.18em] text-[#d7c08f]"><Sparkles size={13}/>Founder briefing · Preview</div><h2 className="text-lg font-semibold tracking-tight md:text-xl">Build with focus. Operate with clarity.</h2><p className="mt-2 text-sm leading-6 text-white/65">Your command centre is being established. Start with the essentials: relationships, priority matters, cash visibility and the next action that moves each venture forward.</p></div><div className="flex shrink-0 items-center gap-2 rounded-xl border border-white/15 bg-white/5 px-4 py-3"><CalendarDays size={17} className="text-[#d7c08f]"/><div><div className="text-xs font-semibold">Wednesday, 11 November</div><div className="mt-0.5 text-[10px] text-white/50">Bangladesh · UTC+6</div></div></div></div></section>}
          <div className="mb-7 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {[
              {label:"Active relationships",value:"—",note:"CRM connection pending",icon:Users,trend:"No data yet"},
              {label:"Open legal matters",value:"—",note:"Matter register pending",icon:BriefcaseBusiness,trend:"No data yet"},
              {label:"Active ventures",value:"04",note:"Defined in your blueprint",icon:FolderKanban,trend:"Portfolio"},
              {label:"Monthly cash position",value:"—",note:"Finance connection pending",icon:Wallet,trend:"No data yet"}
            ].map(({label,value,note,icon:Icon,trend})=><div key={label} className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-soft"><div className="flex items-center justify-between"><span className="text-xs font-medium text-slate-500">{label}</span><span className="rounded-lg bg-slate-50 p-2 text-slate-500"><Icon size={16}/></span></div><div className="mt-4 text-[27px] font-semibold tracking-tight text-slate-900">{value}</div><div className="mt-1 flex items-center justify-between gap-2"><span className="text-[10px] text-slate-400">{note}</span><span className="text-[10px] text-slate-400">{trend}</span></div></div>)}
          </div>
          <div className="grid gap-6 xl:grid-cols-[1.35fr_1fr]">
            <section className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-soft md:p-6"><SectionTitle title="Priority actions" action="View task centre"/><div className="mb-4 flex items-center gap-2 rounded-xl bg-[#f7f8f7] px-3 py-2.5 text-[11px] text-slate-500"><Command size={14}/> Your next actions will appear here as tasks are connected.</div><div className="space-y-2">{tasks.map((task,i)=><div key={task.title} className="flex items-center gap-3 rounded-xl border border-slate-100 p-3.5"><div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-slate-50 text-xs font-semibold text-slate-500">0{i+1}</div><div className="min-w-0 flex-1"><div className="truncate text-xs font-semibold text-slate-800">{task.title}</div><div className="mt-1 text-[10px] text-slate-400">{task.detail}</div></div><span className={`rounded-full px-2.5 py-1 text-[9px] font-semibold ${task.color==="amber"?"bg-amber-50 text-amber-700":task.color==="green"?"bg-emerald-50 text-emerald-700":"bg-slate-100 text-slate-500"}`}>{task.tag}</span></div>)}</div></section>
            <section className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-soft md:p-6"><SectionTitle title="Business ecosystem" action="Manage ventures"/><div className="space-y-2">{ventures.map(v=><div key={v.name} className="flex items-center gap-3 rounded-xl p-2.5 transition hover:bg-slate-50"><div className={`flex h-10 w-10 items-center justify-center rounded-xl text-[11px] font-bold text-slate-700 ${v.color}`}>{v.initials}</div><div className="min-w-0 flex-1"><div className="truncate text-xs font-semibold text-slate-800">{v.name}</div><div className="mt-1 text-[10px] text-slate-400">{v.type}</div></div><span className="rounded-full bg-slate-100 px-2 py-1 text-[9px] font-medium text-slate-500">Planned</span></div>)}</div></section>
          </div>
          <div className="mt-6 grid gap-6 lg:grid-cols-2">
            <section className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-soft md:p-6"><SectionTitle title="Recent activity"/><div className="flex items-start gap-3 py-2"><div className="rounded-lg bg-[#edf3ef] p-2 text-[#315e50]"><MessageSquareText size={15}/></div><div><div className="text-xs font-medium text-slate-700">Foundation architecture documented</div><div className="mt-1 text-[10px] text-slate-400">Project setup · Draft pull request opened</div></div></div><div className="mt-2 flex items-start gap-3 border-t border-slate-100 pt-4"><div className="rounded-lg bg-[#f5f1e8] p-2 text-[#967849]"><FileText size={15}/></div><div><div className="text-xs font-medium text-slate-700">Implementation backlog established</div><div className="mt-1 text-[10px] text-slate-400">Delivery planning · Initial milestone</div></div></div></section>
            <section className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-soft md:p-6"><SectionTitle title="System readiness"/><div className="space-y-4">{[{name:"Application foundation",state:"In progress",width:"25%"},{name:"Database & authentication",state:"Not connected",width:"0%"},{name:"CRM & legal operations",state:"Planned",width:"0%"},{name:"AI & automations",state:"Planned",width:"0%"}].map(item=><div key={item.name}><div className="mb-2 flex items-center justify-between gap-2"><span className="text-xs font-medium text-slate-700">{item.name}</span><span className="text-[10px] text-slate-400">{item.state}</span></div><div className="h-1.5 overflow-hidden rounded-full bg-slate-100"><div className="h-full rounded-full bg-[#47705f]" style={{width:item.width}}/></div></div>)}</div></section>
          </div>
          <footer className="mt-8 flex flex-col gap-2 border-t border-slate-200 pt-5 text-[10px] text-slate-400 sm:flex-row sm:items-center sm:justify-between"><span>IMRAN AI Business OS · Founder workspace</span><span className="flex items-center gap-1.5"><CircleHelp size={12}/>Foundation preview · Data integrations not yet connected</span></footer>
        </div>
      </main>
    </div>
  );
}
