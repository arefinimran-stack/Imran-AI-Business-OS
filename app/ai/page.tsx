"use client";

import { useMemo, useState } from "react";
import { useStore, newId } from "@/lib/store";
import { Card, SectionTitle, Field, inputClass, buttonClass, DeleteButton } from "@/components/ui";
import { formatBDT, daysUntil, todayISO } from "@/lib/format";
import type { Task } from "@/lib/types";

function buildBriefing(data: ReturnType<typeof useStore>["data"]): string[] {
  const lines: string[] = [];
  const nowMonth = todayISO().slice(0, 7);
  const monthTx = data.transactions.filter((t) => t.date.startsWith(nowMonth));
  const income = monthTx.filter((t) => t.amount > 0).reduce((s, t) => s + t.amount, 0);
  const expense = monthTx.filter((t) => t.amount < 0).reduce((s, t) => s + Math.abs(t.amount), 0);

  lines.push(`Finance: ${formatBDT(income)} income and ${formatBDT(expense)} expenses this month (net ${formatBDT(income - expense)}).`);

  const hearings = data.cases
    .filter((c) => c.status !== "closed" && daysUntil(c.nextHearing) !== null && (daysUntil(c.nextHearing) as number) >= 0 && (daysUntil(c.nextHearing) as number) <= 7)
    .sort((a, b) => a.nextHearing.localeCompare(b.nextHearing));
  if (hearings.length > 0) {
    lines.push(`Court: ${hearings.length} hearing${hearings.length > 1 ? "s" : ""} within 7 days — next: "${hearings[0].title}" (${hearings[0].nextHearing}).`);
  } else {
    lines.push("Court: no hearings in the next 7 days.");
  }

  const leads = data.contacts.filter((c) => c.status === "lead");
  if (leads.length > 0) {
    lines.push(`CRM: ${leads.length} lead${leads.length > 1 ? "s" : ""} awaiting follow-up — prioritise the highest value: ${leads.sort((a, b) => b.value - a.value)[0].name}.`);
  }

  const pipeline = data.opportunities.filter((o) => o.stage === "negotiation");
  if (pipeline.length > 0) {
    lines.push(`Business: ${formatBDT(pipeline.reduce((s, o) => s + o.value, 0))} in negotiation across ${pipeline.length} opportunit${pipeline.length > 1 ? "ies" : "y"}.`);
  }

  const dueTasks = data.tasks.filter((t) => !t.done && daysUntil(t.due) !== null && (daysUntil(t.due) as number) <= 1);
  if (dueTasks.length > 0) {
    lines.push(`Tasks: ${dueTasks.length} task${dueTasks.length > 1 ? "s" : ""} due today or tomorrow — start with "${dueTasks[0].title}".`);
  }

  const unpaid = data.cases.reduce((s, c) => s + (c.fee - c.feePaid), 0);
  if (unpaid > 0) lines.push(`Receivables: ${formatBDT(unpaid)} in legal fees outstanding.`);

  return lines;
}

export default function AIPage() {
  const { data, dispatch } = useStore();
  const briefing = useMemo(() => buildBriefing(data), [data]);
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [taskForm, setTaskForm] = useState({ title: "", due: todayISO() });

  const ask = () => {
    const q = question.toLowerCase();
    if (!q.trim()) return;
    let a = "I can answer questions about your finances, cases, leads, pipeline and tasks. Try: \"how much did I earn this month?\"";
    if (q.includes("earn") || q.includes("income") || q.includes("revenue")) {
      const m = data.transactions.filter((t) => t.date.startsWith(todayISO().slice(0, 7)) && t.amount > 0).reduce((s, t) => s + t.amount, 0);
      a = `This month you have earned ${formatBDT(m)} across ${data.transactions.filter((t) => t.date.startsWith(todayISO().slice(0, 7)) && t.amount > 0).length} income entries.`;
    } else if (q.includes("expense") || q.includes("spend")) {
      const m = data.transactions.filter((t) => t.date.startsWith(todayISO().slice(0, 7)) && t.amount < 0).reduce((s, t) => s + Math.abs(t.amount), 0);
      a = `Expenses this month total ${formatBDT(m)}.`;
    } else if (q.includes("case") || q.includes("court") || q.includes("hearing")) {
      const open = data.cases.filter((c) => c.status !== "closed");
      a = open.length > 0
        ? `You have ${open.length} active matter(s). Next hearing: "${open.sort((x, y) => x.nextHearing.localeCompare(y.nextHearing))[0].title}".`
        : "You have no active cases.";
    } else if (q.includes("lead") || q.includes("client") || q.includes("contact")) {
      a = `${data.contacts.filter((c) => c.status === "lead").length} leads and ${data.contacts.filter((c) => c.status === "client").length} clients in your CRM.`;
    } else if (q.includes("pipeline") || q.includes("opportunit")) {
      const open = data.opportunities.filter((o) => o.stage === "prospect" || o.stage === "negotiation");
      a = `Open pipeline is worth ${formatBDT(open.reduce((s, o) => s + o.value, 0))} across ${open.length} opportunities.`;
    } else if (q.includes("task")) {
      const open = data.tasks.filter((t) => !t.done);
      a = open.length > 0 ? `${open.length} open tasks. Most urgent: "${open.sort((x, y) => x.due.localeCompare(y.due))[0].title}".` : "No open tasks.";
    }
    setAnswer(a);
    setQuestion("");
  };

  const addTask = () => {
    if (!taskForm.title.trim()) return;
    const item: Task = {
      id: newId(),
      createdAt: new Date().toISOString().slice(0, 10),
      title: taskForm.title.trim(),
      department: "Executive",
      due: taskForm.due,
      done: false,
    };
    dispatch({ type: "addTask", item });
    setTaskForm({ title: "", due: todayISO() });
  };

  const openTasks = data.tasks.filter((t) => !t.done).sort((a, b) => a.due.localeCompare(b.due));
  const doneTasks = data.tasks.filter((t) => t.done).slice(0, 5);

  return (
    <div>
      <SectionTitle>Daily executive briefing</SectionTitle>
      <Card className="border-[var(--accent)]/30">
        <ul className="space-y-2">
          {briefing.map((line, i) => (
            <li key={i} className="flex gap-2 text-sm leading-snug">
              <span className="text-[var(--accent)]">▸</span>
              <span>{line}</span>
            </li>
          ))}
        </ul>
      </Card>

      <SectionTitle>Ask your OS</SectionTitle>
      <Card>
        <div className="flex gap-2">
          <input
            className={inputClass}
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && ask()}
            placeholder="e.g. how much did I earn this month?"
          />
          <button className={buttonClass} onClick={ask}>Ask</button>
        </div>
        {answer && <p className="mt-3 rounded-xl bg-[var(--surface2)] p-3 text-sm leading-snug">{answer}</p>}
        <p className="mt-2 text-[11px] text-[var(--muted)]">
          On-device assistant. Connect an OpenAI API key later for full conversational AI.
        </p>
      </Card>

      <SectionTitle>Tasks ({openTasks.length} open)</SectionTitle>
      <Card>
        <div className="flex gap-2">
          <input className={inputClass} value={taskForm.title} onChange={(e) => setTaskForm({ ...taskForm, title: e.target.value })} placeholder="New task…" />
          <input type="date" className={`${inputClass} w-36`} value={taskForm.due} onChange={(e) => setTaskForm({ ...taskForm, due: e.target.value })} />
        </div>
        <button className={`${buttonClass} mt-2`} onClick={addTask} disabled={!taskForm.title.trim()}>
          Add task
        </button>
      </Card>
      <div className="mt-2 space-y-2">
        {openTasks.map((t) => (
          <Card key={t.id}>
            <div className="flex items-center gap-2">
              <button
                onClick={() => dispatch({ type: "toggleTask", id: t.id })}
                className="h-5 w-5 shrink-0 rounded-full border border-white/20"
                aria-label="Complete task"
              />
              <div className="min-w-0 flex-1">
                <p className="text-sm truncate">{t.title}</p>
                <p className="text-[11px] text-[var(--muted)]">{t.department} · due {t.due}</p>
              </div>
              <DeleteButton onDelete={() => dispatch({ type: "removeTask", id: t.id })} />
            </div>
          </Card>
        ))}
        {doneTasks.map((t) => (
          <Card key={t.id} className="opacity-50">
            <div className="flex items-center gap-2">
              <button
                onClick={() => dispatch({ type: "toggleTask", id: t.id })}
                className="h-5 w-5 shrink-0 rounded-full bg-emerald-500 text-xs text-white"
                aria-label="Reopen task"
              >
                ✓
              </button>
              <p className="text-sm truncate line-through">{t.title}</p>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
