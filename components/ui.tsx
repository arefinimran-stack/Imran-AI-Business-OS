"use client";

import React, { useState } from "react";

export function Card({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`rounded-2xl bg-[var(--surface)] border border-[var(--border)] p-4 ${className}`}>
      {children}
    </div>
  );
}

export function StatCard({ label, value, sub, tone = "default" }: { label: string; value: string; sub?: string; tone?: "default" | "good" | "warn" }) {
  const toneClass =
    tone === "good" ? "text-emerald-400" : tone === "warn" ? "text-amber-400" : "text-[var(--text)]";
  return (
    <Card className="flex-1 min-w-0">
      <p className="text-xs uppercase tracking-wide text-[var(--muted)]">{label}</p>
      <p className={`mt-1 text-xl font-semibold truncate ${toneClass}`}>{value}</p>
      {sub ? <p className="mt-0.5 text-xs text-[var(--muted)] truncate">{sub}</p> : null}
    </Card>
  );
}

export function SectionTitle({ children, action }: { children: React.ReactNode; action?: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between mt-6 mb-2">
      <h2 className="text-sm font-semibold uppercase tracking-wider text-[var(--muted)]">{children}</h2>
      {action}
    </div>
  );
}

const badgeTones: Record<string, string> = {
  lead: "bg-sky-500/15 text-sky-300",
  active: "bg-blue-500/15 text-blue-300",
  client: "bg-emerald-500/15 text-emerald-300",
  dormant: "bg-zinc-500/15 text-zinc-300",
  open: "bg-emerald-500/15 text-emerald-300",
  pending: "bg-amber-500/15 text-amber-300",
  closed: "bg-zinc-500/15 text-zinc-300",
  prospect: "bg-sky-500/15 text-sky-300",
  negotiation: "bg-amber-500/15 text-amber-300",
  won: "bg-emerald-500/15 text-emerald-300",
  lost: "bg-rose-500/15 text-rose-300",
  idea: "bg-zinc-500/15 text-zinc-300",
  scripting: "bg-sky-500/15 text-sky-300",
  filming: "bg-amber-500/15 text-amber-300",
  editing: "bg-violet-500/15 text-violet-300",
  published: "bg-emerald-500/15 text-emerald-300",
  released: "bg-emerald-500/15 text-emerald-300",
  recording: "bg-amber-500/15 text-amber-300",
  mixing: "bg-violet-500/15 text-violet-300",
  draft: "bg-zinc-500/15 text-zinc-300",
  scheduled: "bg-sky-500/15 text-sky-300",
  posted: "bg-emerald-500/15 text-emerald-300",
  brief: "bg-zinc-500/15 text-zinc-300",
  design: "bg-sky-500/15 text-sky-300",
  review: "bg-amber-500/15 text-amber-300",
  delivered: "bg-emerald-500/15 text-emerald-300",
};

export function Badge({ value }: { value: string }) {
  const tone = badgeTones[value] ?? "bg-white/10 text-[var(--text)]";
  return (
    <span className={`inline-block rounded-full px-2 py-0.5 text-[11px] font-medium capitalize ${tone}`}>
      {value}
    </span>
  );
}

export function EmptyState({ text }: { text: string }) {
  return <p className="text-sm text-[var(--muted)] py-6 text-center">{text}</p>;
}

export function DeleteButton({ onDelete }: { onDelete: () => void }) {
  const [confirming, setConfirming] = useState(false);
  if (!confirming) {
    return (
      <button
        onClick={() => setConfirming(true)}
        className="text-xs text-[var(--muted)] hover:text-rose-400 px-2 py-1"
        aria-label="Delete"
      >
        ✕
      </button>
    );
  }
  return (
    <span className="flex gap-1">
      <button onClick={onDelete} className="text-xs text-rose-400 px-1.5 py-1 font-medium">
        Delete
      </button>
      <button onClick={() => setConfirming(false)} className="text-xs text-[var(--muted)] px-1.5 py-1">
        No
      </button>
    </span>
  );
}

export const inputClass =
  "w-full rounded-xl bg-[var(--surface2)] border border-white/10 px-3 py-2.5 text-sm outline-none focus:border-[var(--accent)] placeholder:text-[var(--muted)]";

export const buttonClass =
  "rounded-xl bg-[var(--accent)] px-4 py-2.5 text-sm font-semibold text-[#0a1428] active:opacity-80 disabled:opacity-40";

export function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs text-[var(--muted)]">{label}</span>
      {children}
    </label>
  );
}
