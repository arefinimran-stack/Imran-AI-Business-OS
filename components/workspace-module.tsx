"use client";

import { FormEvent, useEffect, useState } from "react";
import { AlertCircle, BriefcaseBusiness, Building2, ClipboardList, LoaderCircle, Plus, RefreshCw, Users } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

type RecordRow = {
  id: string;
  name?: string;
  full_name?: string;
  organization_name?: string | null;
  email?: string | null;
  phone?: string | null;
  contact_type?: string;
  category?: string;
  status?: string;
  title?: string;
  reference_code?: string;
  matter_type?: string | null;
  court_or_forum?: string | null;
  priority?: string;
  due_at?: string | null;
  next_hearing_at?: string | null;
};

type Props = { section: string; organizationId: string; role: string };

const sections: Record<string, { title: string; description: string; table: string; icon: typeof Users; fields: string[] }> = {
  "CRM & Relationships": { title: "Relationships", description: "A controlled register for clients, prospects, partners and other business relationships.", table: "contacts", icon: Users, fields: ["full_name", "organization_name", "email", "phone", "contact_type"] },
  "Legal Chamber": { title: "Legal matter register", description: "A restricted matter register. Matter access is limited to authorized legal roles.", table: "legal_matters", icon: BriefcaseBusiness, fields: ["reference_code", "title", "matter_type", "court_or_forum", "status", "priority", "next_hearing_at"] },
  "Business Ventures": { title: "Venture portfolio", description: "Track the ventures within the IMRAN AI workspace.", table: "ventures", icon: Building2, fields: ["name", "category", "status"] },
  "Tasks & Projects": { title: "Tasks & projects", description: "Operational work, priorities, assignments and deadlines.", table: "tasks", icon: ClipboardList, fields: ["title", "status", "priority", "due_at"] },
};

export default function WorkspaceModule({ section, organizationId, role }: Props) {
  const config = sections[section];
  const [records, setRecords] = useState<RecordRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [name, setName] = useState("");
  const [secondary, setSecondary] = useState("");
  const [category, setCategory] = useState("prospect");
  const [priority, setPriority] = useState("normal");

  const isOwner = ["owner", "admin"].includes(role);
  const canManage = section === "CRM & Relationships"
    ? ["owner", "admin", "lawyer", "staff"].includes(role)
    : section === "Legal Chamber"
      ? ["owner", "admin", "lawyer"].includes(role)
      : section === "Business Ventures"
        ? isOwner
        : ["owner", "admin", "lawyer", "staff"].includes(role);

  async function loadRecords() {
    if (!config) return;
    setLoading(true);
    setError("");
    try {
      const supabase = createClient();
      let result;
      if (section === "CRM & Relationships") {
        result = await supabase.from("contacts").select("id,full_name,organization_name,email,phone,contact_type").eq("organization_id", organizationId).order("created_at", { ascending: false }).limit(100);
      } else if (section === "Legal Chamber") {
        result = await supabase.from("legal_matters").select("id,reference_code,title,matter_type,court_or_forum,status,priority,next_hearing_at").eq("organization_id", organizationId).order("created_at", { ascending: false }).limit(100);
      } else if (section === "Business Ventures") {
        result = await supabase.from("ventures").select("id,name,category,status").eq("organization_id", organizationId).order("name");
      } else {
        result = await supabase.from("tasks").select("id,title,status,priority,due_at").eq("organization_id", organizationId).order("created_at", { ascending: false }).limit(100);
      }
      if (result.error) throw result.error;
      setRecords((result.data ?? []) as RecordRow[]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to load workspace records.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { void loadRecords(); }, [section, organizationId]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!config || !canManage || !name.trim()) return;
    setSaving(true);
    setError("");
    try {
      const supabase = createClient();
      let payload: Record<string, string | null> = { organization_id: organizationId };
      if (section === "CRM & Relationships") {
        payload = { ...payload, full_name: name.trim(), email: secondary.trim() || null, contact_type: category };
      } else if (section === "Legal Chamber") {
        payload = { ...payload, reference_code: secondary.trim(), title: name.trim(), status: "open", priority };
      } else if (section === "Business Ventures") {
        payload = { ...payload, name: name.trim(), slug: name.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, ""), category: "business", status: "planning" };
      } else {
        payload = { ...payload, title: name.trim(), status: "todo", priority };
      }
      const { error: insertError } = await supabase.from(config.table).insert(payload);
      if (insertError) throw insertError;
      setName("");
      setSecondary("");
      await loadRecords();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to save this record.");
    } finally {
      setSaving(false);
    }
  }

  if (!config) {
    return (
      <section className="rounded-2xl border border-slate-200 bg-white p-8 shadow-soft">
        <div className="text-xs font-semibold uppercase tracking-[.16em] text-[#47705f]">Workspace module</div>
        <h2 className="mt-2 text-xl font-semibold text-slate-900">{section}</h2>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">This module is reserved in the operating architecture. It will be activated after its data sources, access rules and operating workflow are connected.</p>
        <div className="mt-5 rounded-xl bg-slate-50 p-4 text-xs text-slate-500">No sample data is shown. This area is not yet connected to a live service.</div>
      </section>
    );
  }

  const Icon = config.icon;
  if (config && !organizationId) {
    return <section className="rounded-2xl border border-slate-200 bg-white p-8 shadow-soft"><h2 className="text-lg font-semibold text-slate-900">{config.title}</h2><p className="mt-2 text-sm text-slate-500">Connect the authenticated workspace before using this module. No data is loaded in preview mode.</p></section>;
  }
  return (
    <section className="space-y-5">
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
        <div><div className="mb-2 flex items-center gap-2 text-xs font-medium text-[#47705f]"><Icon size={14}/>{section}</div><h2 className="text-2xl font-semibold tracking-tight text-slate-950">{config.title}</h2><p className="mt-1.5 max-w-2xl text-sm text-slate-500">{config.description}</p></div>
        <button onClick={() => void loadRecords()} className="inline-flex h-9 items-center justify-center gap-2 self-start rounded-lg border border-slate-200 px-3 text-xs font-semibold text-slate-600 hover:bg-white"><RefreshCw size={13}/>Refresh</button>
      </div>

      {canManage && <form onSubmit={handleSubmit} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-soft">
        <div className="mb-4 flex items-center gap-2 text-xs font-semibold text-slate-800"><Plus size={15}/>Add a record</div>
        <div className="grid gap-3 md:grid-cols-2">
          <input required value={name} onChange={e => setName(e.target.value)} placeholder={section === "CRM & Relationships" ? "Full name" : section === "Legal Chamber" ? "Matter title" : section === "Business Ventures" ? "Venture name" : "Task title"} className="h-11 rounded-xl border border-slate-200 px-3 text-sm outline-none focus:border-[#315e50]"/>
          {section === "CRM & Relationships" && <input type="email" value={secondary} onChange={e => setSecondary(e.target.value)} placeholder="Email address (optional)" className="h-11 rounded-xl border border-slate-200 px-3 text-sm outline-none focus:border-[#315e50]"/>}
          {section === "Legal Chamber" && <input required value={secondary} onChange={e => setSecondary(e.target.value)} placeholder="Internal reference code" className="h-11 rounded-xl border border-slate-200 px-3 text-sm outline-none focus:border-[#315e50]"/>}
          {section === "CRM & Relationships" && <select value={category} onChange={e => setCategory(e.target.value)} className="h-11 rounded-xl border border-slate-200 px-3 text-sm text-slate-700"><option value="prospect">Prospect</option><option value="client">Client</option><option value="partner">Partner</option><option value="vendor">Vendor</option><option value="investor">Investor</option><option value="other">Other</option></select>}
          {(section === "Legal Chamber" || section === "Tasks & Projects") && <select value={priority} onChange={e => setPriority(e.target.value)} className="h-11 rounded-xl border border-slate-200 px-3 text-sm text-slate-700"><option value="normal">Normal priority</option><option value="low">Low priority</option><option value="high">High priority</option><option value="urgent">Urgent</option></select>}
        </div>
        <div className="mt-4 flex items-center justify-between gap-3"><p className="text-[10px] text-slate-400">Only enter information you are authorized to store in this workspace.</p><button disabled={saving} className="inline-flex h-10 items-center gap-2 rounded-xl bg-[#183b35] px-4 text-xs font-semibold text-white disabled:opacity-50">{saving && <LoaderCircle size={14} className="animate-spin" />}{saving ? "Saving…" : "Save record"}</button></div>
      </form>}

      {error && <div role="alert" className="flex items-start gap-2 rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs text-rose-700"><AlertCircle size={15} className="mt-0.5 shrink-0"/>{error}</div>}
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-soft">
        <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4"><div className="text-xs font-semibold text-slate-800">Workspace records</div><div className="text-[10px] text-slate-400">{records.length} loaded · max 100</div></div>
        {loading ? <div className="flex items-center justify-center gap-2 py-14 text-xs text-slate-400"><LoaderCircle size={16} className="animate-spin"/>Loading records…</div> : records.length === 0 ? <div className="px-5 py-14 text-center"><div className="text-sm font-semibold text-slate-700">No records yet</div><p className="mt-1 text-xs text-slate-400">The register is empty. Add the first record when you are ready.</p></div> : <div className="divide-y divide-slate-100">{records.map(record => <div key={record.id} className="flex flex-col gap-2 px-5 py-4 sm:flex-row sm:items-center sm:justify-between"><div className="min-w-0"><div className="truncate text-xs font-semibold text-slate-800">{section === "CRM & Relationships" ? record.full_name : section === "Legal Chamber" ? record.title : section === "Business Ventures" ? record.name : record.title}</div><div className="mt-1 text-[10px] text-slate-400">{section === "CRM & Relationships" ? [record.organization_name, record.email, record.contact_type].filter(Boolean).join(" · ") : section === "Legal Chamber" ? [record.reference_code, record.court_or_forum, record.matter_type].filter(Boolean).join(" · ") : section === "Business Ventures" ? record.category?.replaceAll("_", " ") : record.due_at ? new Date(record.due_at).toLocaleDateString() : "No due date"}</div></div><div className="flex shrink-0 items-center gap-2"><span className="rounded-full bg-slate-100 px-2.5 py-1 text-[9px] font-medium capitalize text-slate-600">{record.status ?? record.contact_type ?? "record"}</span>{record.priority && <span className="rounded-full bg-amber-50 px-2.5 py-1 text-[9px] font-medium capitalize text-amber-700">{record.priority}</span>}</div></div>)}</div>}
      </div>
      {!canManage && <p className="text-[10px] text-slate-400">This role has read-only access to this register. Write access is enforced by database policies.</p>}
    </section>
  );
}
