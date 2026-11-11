"use client";

import { useState } from "react";
import { useStore, newId } from "@/lib/store";
import { Card, SectionTitle, EmptyState, DeleteButton, Field, inputClass, buttonClass } from "@/components/ui";
import { formatBDT, formatDate, todayISO } from "@/lib/format";
import { BUSINESS_ENTITIES, type Transaction } from "@/lib/types";

export default function FinancePage() {
  const { data, dispatch } = useStore();
  const [form, setForm] = useState({ label: "", amount: "", category: "Legal fees", date: todayISO(), entity: BUSINESS_ENTITIES[0] as string, kind: "income" as "income" | "expense" });

  const add = () => {
    const amount = Number(form.amount);
    if (!form.label.trim() || !amount) return;
    const item: Transaction = {
      id: newId(),
      createdAt: new Date().toISOString().slice(0, 10),
      label: form.label.trim(),
      amount: form.kind === "expense" ? -Math.abs(amount) : Math.abs(amount),
      category: form.category.trim() || "General",
      date: form.date,
      entity: form.entity,
    };
    dispatch({ type: "addTransaction", item });
    setForm({ ...form, label: "", amount: "" });
  };

  const income = data.transactions.filter((t) => t.amount > 0).reduce((s, t) => s + t.amount, 0);
  const expense = data.transactions.filter((t) => t.amount < 0).reduce((s, t) => s + Math.abs(t.amount), 0);
  const nowMonth = todayISO().slice(0, 7);
  const monthNet = data.transactions
    .filter((t) => t.date.startsWith(nowMonth))
    .reduce((s, t) => s + t.amount, 0);

  const sorted = [...data.transactions].sort((a, b) => b.date.localeCompare(a.date));

  return (
    <div>
      <div className="mt-1 flex gap-2">
        <Card className="flex-1">
          <p className="text-xs text-[var(--muted)]">Total income</p>
          <p className="text-xl font-semibold text-emerald-400">{formatBDT(income)}</p>
        </Card>
        <Card className="flex-1">
          <p className="text-xs text-[var(--muted)]">Total expense</p>
          <p className="text-xl font-semibold text-rose-400">{formatBDT(expense)}</p>
        </Card>
      </div>
      <Card className="mt-2">
        <p className="text-xs text-[var(--muted)]">Net this month</p>
        <p className={`text-xl font-semibold ${monthNet >= 0 ? "text-emerald-400" : "text-rose-400"}`}>{formatBDT(monthNet)}</p>
      </Card>

      <SectionTitle>Record transaction</SectionTitle>
      <Card>
        <div className="space-y-2">
          <div className="flex gap-2">
            {(["income", "expense"] as const).map((k) => (
              <button
                key={k}
                onClick={() => setForm({ ...form, kind: k })}
                className={`flex-1 rounded-xl py-2 text-sm font-medium capitalize ${
                  form.kind === k ? "bg-[var(--accent)] text-white" : "bg-white/5 text-[var(--muted)]"
                }`}
              >
                {k}
              </button>
            ))}
          </div>
          <Field label="Description">
            <input className={inputClass} value={form.label} onChange={(e) => setForm({ ...form, label: e.target.value })} placeholder="Description" />
          </Field>
          <div className="flex gap-2">
            <Field label="Amount (৳)">
              <input className={inputClass} value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} placeholder="0" inputMode="decimal" />
            </Field>
            <Field label="Date">
              <input type="date" className={inputClass} value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} />
            </Field>
          </div>
          <div className="flex gap-2">
            <Field label="Category">
              <input className={inputClass} value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} placeholder="Category" />
            </Field>
            <Field label="Entity">
              <select className={inputClass} value={form.entity} onChange={(e) => setForm({ ...form, entity: e.target.value })}>
                {BUSINESS_ENTITIES.map((e) => (
                  <option key={e} value={e}>{e}</option>
                ))}
              </select>
            </Field>
          </div>
          <button className={buttonClass} onClick={add} disabled={!form.label.trim() || !Number(form.amount)}>
            Save transaction
          </button>
        </div>
      </Card>

      <SectionTitle>Transactions ({sorted.length})</SectionTitle>
      <div className="space-y-2">
        {sorted.length === 0 && <EmptyState text="No transactions yet." />}
        {sorted.map((t) => (
          <Card key={t.id}>
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <p className="text-sm font-medium truncate">{t.label}</p>
                <p className="text-xs text-[var(--muted)] truncate">
                  {formatDate(t.date)} · {t.category} · {t.entity}
                </p>
              </div>
              <div className="flex items-center gap-1.5 shrink-0">
                <span className={`text-sm font-semibold ${t.amount >= 0 ? "text-emerald-400" : "text-rose-400"}`}>
                  {formatBDT(t.amount)}
                </span>
                <DeleteButton onDelete={() => dispatch({ type: "removeTransaction", id: t.id })} />
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
