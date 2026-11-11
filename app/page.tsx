"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { useStore, newId } from "@/lib/store";
import { Card, SectionTitle, StatCard, inputClass } from "@/components/ui";
import { formatBDT, todayISO, daysUntil } from "@/lib/format";
import { DEPARTMENTS } from "@/lib/types";

export default function DashboardPage() {
  const { data, dispatch, ready } = useStore();
  const [taskTitle, setTaskTitle] = useState("");
  const visitRecorded = useRef(false);

  const lastVisit = data.settings.lastVisit;

  const sinceLast = {
    audit: data.audit.filter((e) => new Date(e.ts) > new Date(lastVisit)),
    approvals: data.approvals.filter((a) => a.status === "pending"),
    completedRuns: data.runs.filter((r) => r.status === "completed" && new Date(r.updatedAt) > new Date(lastVisit)),
    newPosts: data.posts.filter((p) => new Date(p.createdAt) > new Date(lastVisit)),
    newTasks: data.tasks.filter((t) => new Date(t.createdAt) > new Date(lastVisit) && !t.done),
  };

  useEffect(() => {
    if (!ready || visitRecorded.current) return;
    visitRecorded.current = true;
    const timer = setTimeout(() => dispatch({ type: "setLastVisit", ts: new Date().toISOString() }), 1500);
    return () => clearTimeout(timer);
  }, [ready, dispatch]);

  if (!ready) return null;

  const nowMonth = todayISO().slice(0, 7);
  const monthTx = data.transactions.filter((t) => t.date.startsWith(nowMonth));
  const income = monthTx.filter((t) => t.amount > 0).reduce((s, t) => s + t.amount, 0);
  const expense = monthTx.filter((t) => t.amount < 0).reduce((s, t) => s + Math.abs(t.amount), 0);
  const net = income - expense;

  const openCases = data.cases.filter((c) => c.status !== "closed");
  const activeLeads = data.contacts.filter((c) => c.status === "lead" || c.status === "active");
  const upcomingHearings = openCases
    .filter((c) => daysUntil(c.nextHearing) !== null && (daysUntil(c.nextHearing) as number) >= 0)
    .sort((a, b) => a.nextHearing.localeCompare(b.nextHearing));
  const openTasks = data.tasks.filter((t) => !t.done).sort((a, b) => a.due.localeCompare(b.due));
  const pipelineValue = data.opportunities
    .filter((o) => o.stage === "prospect" || o.stage === "negotiation")
    .reduce((s, o) => s + o.value, 0);
  const activeRuns = data.runs.filter((r) => r.status === "running" || r.status === "awaiting_approval");

  const addTask = () => {
    if (!taskTitle.trim()) return;
    dispatch({
      type: "addTask",
      item: { id: newId(), createdAt: new Date().toISOString(), title: taskTitle.trim(), department: "Executive", due: todayISO(), done: false },
    });
    setTaskTitle("");
  };

  const awayMinutes = Math.max(0, Math.round((Date.now() - new Date(lastVisit).getTime()) / 60000));

  return (
    <div>
      <p className="text-sm text-[var(--muted)]">
        {new Date().toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long" })}
      </p>

      <SectionTitle>Since last visit</SectionTitle>
      <Card className="border-[var(--accent)]/40">
        {awayMinutes < 1 && sinceLast.audit.length === 0 && sinceLast.approvals.length === 0 ? (
          <p className="text-sm text-[var(--muted)]">Welcome back. Nothing new has happened since your last visit.</p>
        ) : (
          <ul className="space-y-1.5 text-sm leading-snug">
            {sinceLast.completedRuns.length > 0 && (
              <li>✅ {sinceLast.completedRuns.length} workflow{sinceLast.completedRuns.length > 1 ? "s" : ""} completed while you were away.</li>
            )}
            {sinceLast.newPosts.length > 0 && (
              <li>📝 {sinceLast.newPosts.length} content item{sinceLast.newPosts.length > 1 ? "s" : ""} drafted by your agents.</li>
            )}
            {sinceLast.newTasks.length > 0 && (
              <li>📌 {sinceLast.newTasks.length} new task{sinceLast.newTasks.length > 1 ? "s" : ""} created for you.</li>
            )}
            {sinceLast.approvals.length > 0 && (
              <li className="text-amber-300">⏸ {sinceLast.approvals.length} item{sinceLast.approvals.length > 1 ? "s" : ""} awaiting your approval.</li>
            )}
            {sinceLast.audit.length > 0 && (
              <li className="text-[var(--muted)] text-xs">Latest: {sinceLast.audit[0].actor} — {sinceLast.audit[0].detail}</li>
            )}
            {activeRuns.length > 0 && (
              <li className="text-xs text-[var(--muted)]">🤖 {activeRuns.length} workflow run{activeRuns.length > 1 ? "s" : ""} currently in progress.</li>
            )}
          </ul>
        )}
        <Link href="/autopilot" className="mt-2 inline-block text-xs font-semibold gold">
          Open Autopilot →
        </Link>
      </Card>

      <div className="mt-3 flex gap-2">
        <StatCard label="Net this month" value={formatBDT(net)} tone={net >= 0 ? "good" : "warn"} />
        <StatCard label="Pipeline" value={formatBDT(pipelineValue)} sub={`${data.opportunities.filter((o) => o.stage !== "won" && o.stage !== "lost").length} open`} />
      </div>
      <div className="mt-2 flex gap-2">
        <StatCard label="Open cases" value={String(openCases.length)} sub={upcomingHearings[0] ? `Next: ${upcomingHearings[0].nextHearing}` : "No hearings"} />
        <StatCard label="Active leads" value={String(activeLeads.length)} sub={`${data.contacts.length} total contacts`} />
      </div>

      <SectionTitle>Today&apos;s tasks</SectionTitle>
      <Card>
        <div className="flex gap-2">
          <input className={inputClass} value={taskTitle} onChange={(e) => setTaskTitle(e.target.value)} onKeyDown={(e) => e.key === "Enter" && addTask()} placeholder="Add a task…" />
          <button onClick={addTask} className="rounded-xl bg-[var(--accent)] px-3 text-sm font-semibold text-[#0a1428]" disabled={!taskTitle.trim()}>
            Add
          </button>
        </div>
        {openTasks.length === 0 ? (
          <p className="mt-3 text-sm text-[var(--muted)]">All clear. Nothing pending.</p>
        ) : (
          <ul className="mt-3 space-y-2">
            {openTasks.slice(0, 4).map((t) => (
              <li key={t.id} className="flex items-center justify-between gap-2 text-sm">
                <span className="truncate">{t.title}</span>
                <span className={`shrink-0 text-xs ${daysUntil(t.due) !== null && (daysUntil(t.due) as number) <= 1 ? "text-amber-400" : "text-[var(--muted)]"}`}>
                  {t.due}
                </span>
              </li>
            ))}
          </ul>
        )}
      </Card>

      <SectionTitle>Departments</SectionTitle>
      <div className="grid grid-cols-2 gap-2">
        {DEPARTMENTS.filter((d) => d.slug !== "/").map((d) => (
          <Link key={d.slug} href={d.slug}>
            <Card className="active:bg-[var(--surface2)]">
              <p className="text-2xl">{d.icon}</p>
              <p className="mt-1 text-sm font-medium leading-tight">{d.name}</p>
            </Card>
          </Link>
        ))}
        <Link href="/autopilot">
          <Card className="active:bg-[var(--surface2)]">
            <p className="text-2xl">🛰️</p>
            <p className="mt-1 text-sm font-medium leading-tight">AI Autopilot</p>
          </Card>
        </Link>
      </div>
    </div>
  );
}
