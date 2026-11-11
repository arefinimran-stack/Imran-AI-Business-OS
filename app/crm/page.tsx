"use client";

import { useState } from "react";
import { useStore, newId } from "@/lib/store";
import { Card, SectionTitle, Badge, EmptyState, DeleteButton, Field, inputClass, buttonClass } from "@/components/ui";
import { formatBDT } from "@/lib/format";
import type { Contact, ContactStatus } from "@/lib/types";

const statuses: ContactStatus[] = ["lead", "active", "client", "dormant"];

export default function CRMPage() {
  const { data, dispatch } = useStore();
  const [form, setForm] = useState({ name: "", company: "", phone: "", email: "", value: "", note: "" });

  const add = () => {
    if (!form.name.trim()) return;
    const item: Contact = {
      id: newId(),
      createdAt: new Date().toISOString().slice(0, 10),
      name: form.name.trim(),
      company: form.company.trim(),
      phone: form.phone.trim(),
      email: form.email.trim(),
      status: "lead",
      value: Number(form.value) || 0,
      note: form.note.trim(),
    };
    dispatch({ type: "addContact", item });
    setForm({ name: "", company: "", phone: "", email: "", value: "", note: "" });
  };

  const setStatus = (c: Contact, status: ContactStatus) =>
    dispatch({ type: "updateContact", item: { ...c, status } });

  return (
    <div>
      <SectionTitle>Add contact</SectionTitle>
      <Card>
        <div className="space-y-2">
          <Field label="Name">
            <input className={inputClass} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Full name" />
          </Field>
          <Field label="Company">
            <input className={inputClass} value={form.company} onChange={(e) => setForm({ ...form, company: e.target.value })} placeholder="Company" />
          </Field>
          <div className="flex gap-2">
            <Field label="Phone">
              <input className={inputClass} value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="Phone" inputMode="tel" />
            </Field>
            <Field label="Est. value (৳)">
              <input className={inputClass} value={form.value} onChange={(e) => setForm({ ...form, value: e.target.value })} placeholder="0" inputMode="numeric" />
            </Field>
          </div>
          <Field label="Email">
            <input className={inputClass} value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="Email" inputMode="email" />
          </Field>
          <button className={buttonClass} onClick={add} disabled={!form.name.trim()}>
            Add contact
          </button>
        </div>
      </Card>

      <SectionTitle>Contacts ({data.contacts.length})</SectionTitle>
      <div className="space-y-2">
        {data.contacts.length === 0 && <EmptyState text="No contacts yet." />}
        {data.contacts.map((c) => (
          <Card key={c.id}>
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <p className="font-medium truncate">{c.name}</p>
                <p className="text-xs text-[var(--muted)] truncate">{c.company || "—"}</p>
              </div>
              <DeleteButton onDelete={() => dispatch({ type: "removeContact", id: c.id })} />
            </div>
            <div className="mt-2 flex flex-wrap items-center gap-2">
              <Badge value={c.status} />
              {c.value > 0 && <span className="text-xs text-emerald-400">{formatBDT(c.value)}</span>}
            </div>
            {(c.phone || c.email) && (
              <p className="mt-1.5 text-xs text-[var(--muted)] truncate">
                {[c.phone, c.email].filter(Boolean).join(" · ")}
              </p>
            )}
            {c.note && <p className="mt-1 text-xs text-[var(--muted)]">{c.note}</p>}
            <div className="mt-2 flex gap-1.5">
              {statuses.map((s) => (
                <button
                  key={s}
                  onClick={() => setStatus(c, s)}
                  className={`rounded-lg px-2 py-1 text-[11px] capitalize ${
                    c.status === s ? "bg-[var(--accent)] text-white" : "bg-white/5 text-[var(--muted)]"
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
