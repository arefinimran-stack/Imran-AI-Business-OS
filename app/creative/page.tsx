"use client";

import { useState } from "react";
import { useStore, newId } from "@/lib/store";
import { Card, SectionTitle, Badge, EmptyState, DeleteButton, Field, inputClass, buttonClass } from "@/components/ui";
import type { CreativeProject, ProjectStatus } from "@/lib/types";

const statuses: ProjectStatus[] = ["brief", "design", "review", "delivered"];

export default function CreativePage() {
  const { data, dispatch } = useStore();
  const [form, setForm] = useState({ name: "", type: "Branding", note: "" });

  const add = () => {
    if (!form.name.trim()) return;
    const item: CreativeProject = {
      id: newId(),
      createdAt: new Date().toISOString().slice(0, 10),
      name: form.name.trim(),
      type: form.type.trim() || "Design",
      status: "brief",
      note: form.note.trim(),
    };
    dispatch({ type: "addProject", item });
    setForm({ name: "", type: "Branding", note: "" });
  };

  return (
    <div>
      <SectionTitle>New project</SectionTitle>
      <Card>
        <div className="space-y-2">
          <Field label="Project name">
            <input className={inputClass} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Project name" />
          </Field>
          <Field label="Type">
            <input className={inputClass} value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })} placeholder="Branding, logo, web…" />
          </Field>
          <button className={buttonClass} onClick={add} disabled={!form.name.trim()}>
            Add project
          </button>
        </div>
      </Card>

      <SectionTitle>Projects ({data.projects.length})</SectionTitle>
      <div className="space-y-2">
        {data.projects.length === 0 && <EmptyState text="No projects yet." />}
        {data.projects.map((p) => (
          <Card key={p.id}>
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <p className="font-medium leading-tight">{p.name}</p>
                <p className="text-xs text-[var(--muted)]">{p.type}</p>
              </div>
              <DeleteButton onDelete={() => dispatch({ type: "removeProject", id: p.id })} />
            </div>
            <div className="mt-2">
              <Badge value={p.status} />
            </div>
            {p.note && <p className="mt-1 text-xs text-[var(--muted)]">{p.note}</p>}
            <div className="mt-2 flex gap-1.5">
              {statuses.map((s) => (
                <button
                  key={s}
                  onClick={() => dispatch({ type: "updateProject", item: { ...p, status: s } })}
                  className={`rounded-lg px-2 py-1 text-[11px] capitalize ${
                    p.status === s ? "bg-[var(--accent)] text-white" : "bg-white/5 text-[var(--muted)]"
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
