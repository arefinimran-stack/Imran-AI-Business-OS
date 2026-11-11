"use client";

import { useState } from "react";
import { useStore, newId } from "@/lib/store";
import { Card, SectionTitle, Badge, EmptyState, DeleteButton, Field, inputClass, buttonClass } from "@/components/ui";
import { formatBDT } from "@/lib/format";
import { BUSINESS_ENTITIES, type Opportunity, type OpportunityStage } from "@/lib/types";

const stages: OpportunityStage[] = ["prospect", "negotiation", "won", "lost"];

export default function BusinessPage() {
  const { data, dispatch } = useStore();
  const [form, setForm] = useState({ title: "", entity: BUSINESS_ENTITIES[0] as string, value: "", note: "" });

  const add = () => {
    if (!form.title.trim()) return;
    const item: Opportunity = {
      id: newId(),
      createdAt: new Date().toISOString().slice(0, 10),
      title: form.title.trim(),
      entity: form.entity,
      value: Number(form.value) || 0,
      stage: "prospect",
      note: form.note.trim(),
    };
    dispatch({ type: "addOpportunity", item });
    setForm({ title: "", entity: BUSINESS_ENTITIES[0], value: "", note: "" });
  };

  const byStage = (s: OpportunityStage) => data.opportunities.filter((o) => o.stage === s);
  const total = (list: Opportunity[]) => list.reduce((s, o) => s + o.value, 0);

  return (
    <div>
      <div className="mt-1 flex gap-2">
        <Card className="flex-1">
          <p className="text-xs text-[var(--muted)]">Open pipeline</p>
          <p className="text-xl font-semibold">{formatBDT(total(byStage("prospect")) + total(byStage("negotiation")))}</p>
        </Card>
        <Card className="flex-1">
          <p className="text-xs text-[var(--muted)]">Won</p>
          <p className="text-xl font-semibold text-emerald-400">{formatBDT(total(byStage("won")))}</p>
        </Card>
      </div>

      <SectionTitle>New opportunity</SectionTitle>
      <Card>
        <div className="space-y-2">
          <Field label="Opportunity">
            <input className={inputClass} value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Title" />
          </Field>
          <Field label="Business entity">
            <select className={inputClass} value={form.entity} onChange={(e) => setForm({ ...form, entity: e.target.value })}>
              {BUSINESS_ENTITIES.map((e) => (
                <option key={e} value={e}>{e}</option>
              ))}
            </select>
          </Field>
          <Field label="Value (৳)">
            <input className={inputClass} value={form.value} onChange={(e) => setForm({ ...form, value: e.target.value })} placeholder="0" inputMode="numeric" />
          </Field>
          <button className={buttonClass} onClick={add} disabled={!form.title.trim()}>
            Add opportunity
          </button>
        </div>
      </Card>

      {(["prospect", "negotiation", "won", "lost"] as OpportunityStage[]).map((stage) => {
        const list = byStage(stage);
        if (list.length === 0) return null;
        return (
          <div key={stage}>
            <SectionTitle>
              {stage} · {formatBDT(total(list))}
            </SectionTitle>
            <div className="space-y-2">
              {list.map((o) => (
                <Card key={o.id}>
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="font-medium leading-tight">{o.title}</p>
                      <p className="text-xs text-[var(--muted)]">{o.entity}</p>
                    </div>
                    <DeleteButton onDelete={() => dispatch({ type: "removeOpportunity", id: o.id })} />
                  </div>
                  <div className="mt-2 flex items-center gap-2">
                    <Badge value={o.stage} />
                    <span className="text-xs text-emerald-400">{formatBDT(o.value)}</span>
                  </div>
                  {o.note && <p className="mt-1 text-xs text-[var(--muted)]">{o.note}</p>}
                  <div className="mt-2 flex gap-1.5">
                    {stages.map((s) => (
                      <button
                        key={s}
                        onClick={() => dispatch({ type: "updateOpportunity", item: { ...o, stage: s } })}
                        className={`rounded-lg px-2 py-1 text-[11px] capitalize ${
                          o.stage === s ? "bg-[var(--accent)] text-white" : "bg-white/5 text-[var(--muted)]"
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
      })}
      {data.opportunities.length === 0 && <EmptyState text="No opportunities yet." />}
    </div>
  );
}
