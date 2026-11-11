"use client";

import { useState } from "react";
import { useStore, newId } from "@/lib/store";
import { Card, SectionTitle, Badge, EmptyState, DeleteButton, Field, inputClass, buttonClass } from "@/components/ui";
import { formatBDT, formatDate, relativeDay } from "@/lib/format";
import type { LegalCase, CaseStatus } from "@/lib/types";

const statuses: CaseStatus[] = ["open", "pending", "closed"];

export default function LegalPage() {
  const { data, dispatch } = useStore();
  const [form, setForm] = useState({ title: "", client: "", court: "", nextHearing: "", fee: "", notes: "" });

  const add = () => {
    if (!form.title.trim()) return;
    const item: LegalCase = {
      id: newId(),
      createdAt: new Date().toISOString().slice(0, 10),
      title: form.title.trim(),
      client: form.client.trim(),
      court: form.court.trim(),
      nextHearing: form.nextHearing,
      status: "open",
      fee: Number(form.fee) || 0,
      feePaid: 0,
      notes: form.notes.trim(),
    };
    dispatch({ type: "addCase", item });
    setForm({ title: "", client: "", court: "", nextHearing: "", fee: "", notes: "" });
  };

  const openCases = data.cases.filter((c) => c.status !== "closed").sort((a, b) => a.nextHearing.localeCompare(b.nextHearing));
  const closedCases = data.cases.filter((c) => c.status === "closed");
  const unpaid = data.cases.reduce((s, c) => s + (c.fee - c.feePaid), 0);

  return (
    <div>
      <div className="mt-1 flex gap-2">
        <Card className="flex-1">
          <p className="text-xs text-[var(--muted)]">Active matters</p>
          <p className="text-xl font-semibold">{openCases.length}</p>
        </Card>
        <Card className="flex-1">
          <p className="text-xs text-[var(--muted)]">Unpaid fees</p>
          <p className="text-xl font-semibold text-amber-400">{formatBDT(unpaid)}</p>
        </Card>
      </div>

      <SectionTitle>Add case</SectionTitle>
      <Card>
        <div className="space-y-2">
          <Field label="Case title">
            <input className={inputClass} value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Case / matter title" />
          </Field>
          <div className="flex gap-2">
            <Field label="Client">
              <input className={inputClass} value={form.client} onChange={(e) => setForm({ ...form, client: e.target.value })} placeholder="Client" />
            </Field>
            <Field label="Court / forum">
              <input className={inputClass} value={form.court} onChange={(e) => setForm({ ...form, court: e.target.value })} placeholder="Court" />
            </Field>
          </div>
          <div className="flex gap-2">
            <Field label="Next hearing">
              <input type="date" className={inputClass} value={form.nextHearing} onChange={(e) => setForm({ ...form, nextHearing: e.target.value })} />
            </Field>
            <Field label="Fee (৳)">
              <input className={inputClass} value={form.fee} onChange={(e) => setForm({ ...form, fee: e.target.value })} placeholder="0" inputMode="numeric" />
            </Field>
          </div>
          <button className={buttonClass} onClick={add} disabled={!form.title.trim()}>
            Add case
          </button>
        </div>
      </Card>

      <SectionTitle>Court calendar</SectionTitle>
      <div className="space-y-2">
        {openCases.length === 0 && <EmptyState text="No active cases." />}
        {openCases.map((c) => (
          <Card key={c.id}>
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <p className="font-medium leading-tight">{c.title}</p>
                <p className="mt-0.5 text-xs text-[var(--muted)]">{[c.client, c.court].filter(Boolean).join(" · ") || "—"}</p>
              </div>
              <DeleteButton onDelete={() => dispatch({ type: "removeCase", id: c.id })} />
            </div>
            <div className="mt-2 flex flex-wrap items-center gap-2">
              <Badge value={c.status} />
              {c.nextHearing && (
                <span className="text-xs text-[var(--muted)]">
                  📅 {formatDate(c.nextHearing)} ({relativeDay(c.nextHearing)})
                </span>
              )}
            </div>
            <div className="mt-2 flex items-center justify-between text-xs">
              <span className="text-[var(--muted)]">
                Fees: {formatBDT(c.feePaid)} / {formatBDT(c.fee)}
              </span>
              {c.fee - c.feePaid > 0 && (
                <button
                  onClick={() => dispatch({ type: "updateCase", item: { ...c, feePaid: c.fee } })}
                  className="rounded-lg bg-emerald-500/15 px-2 py-1 text-emerald-300"
                >
                  Mark paid
                </button>
              )}
            </div>
            <div className="mt-2 flex gap-1.5">
              {statuses.map((s) => (
                <button
                  key={s}
                  onClick={() => dispatch({ type: "updateCase", item: { ...c, status: s } })}
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

      {closedCases.length > 0 && (
        <>
          <SectionTitle>Closed</SectionTitle>
          <div className="space-y-2">
            {closedCases.map((c) => (
              <Card key={c.id} className="opacity-60">
                <div className="flex items-center justify-between gap-2">
                  <p className="text-sm truncate">{c.title}</p>
                  <DeleteButton onDelete={() => dispatch({ type: "removeCase", id: c.id })} />
                </div>
              </Card>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
