"use client";

import Link from "next/link";
import { useStore } from "@/lib/store";
import { Card, SectionTitle, StatCard } from "@/components/ui";
import { formatBDT, todayISO, daysUntil } from "@/lib/format";
import { DEPARTMENTS } from "@/lib/types";

export default function DashboardPage() {
  const { data, ready } = useStore();

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

  return (
    <div>
      <p className="text-sm text-[var(--muted)]">
        {new Date().toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long" })}
      </p>

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
        {openTasks.length === 0 ? (
          <p className="text-sm text-[var(--muted)]">All clear. Nothing pending.</p>
        ) : (
          <ul className="space-y-2">
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
      </div>
    </div>
  );
}
