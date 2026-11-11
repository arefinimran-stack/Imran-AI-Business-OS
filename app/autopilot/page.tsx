"use client";

import { useEffect, useRef } from "react";
import { useStore, newId } from "@/lib/store";
import { Card, SectionTitle, Badge, EmptyState } from "@/components/ui";
import { agentById } from "@/lib/agents/registry";
import { BUILT_IN_WORKFLOWS } from "@/lib/agents/planner";
import { createRun, executeNextStep, resolveApproval } from "@/lib/workflows/engine";

export default function AutopilotPage() {
  const { data, dispatch, ready } = useStore();
  const advancing = useRef(false);

  const applyEffects = (effects: ReturnType<typeof executeNextStep>["effects"]) => {
    for (const e of effects) {
      switch (e.kind) {
        case "addPost":
          dispatch({ type: "addPost", item: e.item });
          break;
        case "updatePost":
          dispatch({ type: "updatePost", item: e.item });
          break;
        case "addTask":
          dispatch({ type: "addTask", item: e.item });
          break;
        case "addProject":
          dispatch({ type: "addProject", item: e.item });
          break;
        case "addApproval":
          dispatch({ type: "addApproval", item: e.item });
          break;
        case "addAudit":
          dispatch({ type: "addAudit", item: e.item });
          break;
      }
    }
  };

  const advance = (runId: string) => {
    const run = data.runs.find((r) => r.id === runId);
    if (!run) return;
    const { run: updated, effects } = executeNextStep(run, data);
    dispatch({ type: "updateRun", item: updated });
    applyEffects(effects);
  };

  useEffect(() => {
    if (!ready) return;
    const timer = setInterval(() => {
      if (advancing.current) return;
      const active = data.runs.find((r) => r.status === "running");
      if (!active) return;
      advancing.current = true;
      const { run: updated, effects } = executeNextStep(active, data);
      dispatch({ type: "updateRun", item: updated });
      applyEffects(effects);
      advancing.current = false;
    }, 3000);
    return () => clearInterval(timer);
  }, [data, dispatch, ready]);

  const decide = (approvalId: string, approved: boolean) => {
    const approval = data.approvals.find((a) => a.id === approvalId);
    if (!approval) return;
    const run = data.runs.find((r) => r.id === approval.runId);
    dispatch({ type: "updateApproval", item: { ...approval, status: approved ? "approved" : "rejected" } });
    if (run) {
      const { run: updated, effects } = resolveApproval(run, approval, approved, data);
      dispatch({ type: "updateRun", item: updated });
      applyEffects(effects);
    } else {
      dispatch({ type: "addAudit", item: { id: newId(), ts: new Date().toISOString(), actor: "Founder", action: approved ? "approval_granted" : "approval_rejected", detail: approval.title } });
    }
  };

  const pendingApprovals = data.approvals.filter((a) => a.status === "pending");
  const activeRuns = data.runs.filter((r) => r.status === "running" || r.status === "awaiting_approval");
  const pastRuns = data.runs.filter((r) => r.status === "completed" || r.status === "failed");

  return (
    <div>
      <Card className="border-[var(--accent)]/40">
        <p className="text-sm font-semibold gold">Autopilot status</p>
        <p className="mt-1 text-xs leading-relaxed text-[var(--muted)]">
          Runs advance automatically while the app is open, and every step is persisted — interrupted workflows resume where they stopped.
          For 24/7 execution with the app closed, deploy the Supabase backend (see <span className="gold">docs/ARCHITECTURE.md</span>): the same run state is processed by a scheduled server worker.
        </p>
      </Card>

      <SectionTitle>Pending approvals ({pendingApprovals.length})</SectionTitle>
      {pendingApprovals.length === 0 && <EmptyState text="Nothing awaiting your approval." />}
      <div className="space-y-2">
        {pendingApprovals.map((a) => (
          <Card key={a.id} className="border-amber-500/30">
            <p className="text-sm font-medium">{a.title}</p>
            <p className="mt-1 text-xs text-[var(--muted)] leading-snug">{a.summary}</p>
            <p className="mt-1 text-[10px] text-[var(--muted)]">{agentById(a.agentId).name} · run step approval</p>
            <div className="mt-2 flex gap-2">
              <button onClick={() => decide(a.id, true)} className="rounded-lg bg-emerald-500/20 px-3 py-1.5 text-xs font-semibold text-emerald-300">
                Approve
              </button>
              <button onClick={() => decide(a.id, false)} className="rounded-lg bg-rose-500/15 px-3 py-1.5 text-xs font-semibold text-rose-300">
                Reject
              </button>
            </div>
          </Card>
        ))}
      </div>

      <SectionTitle>Active runs ({activeRuns.length})</SectionTitle>
      {activeRuns.length === 0 && <EmptyState text="No active runs. Start a workflow from the Command Centre or below." />}
      <div className="space-y-3">
        {activeRuns.map((r) => {
          const done = r.steps.filter((s) => s.status === "done").length;
          return (
            <Card key={r.id}>
              <div className="flex items-start justify-between gap-2">
                <p className="text-sm font-semibold leading-tight">{r.title}</p>
                <Badge value={r.status === "awaiting_approval" ? "pending" : "active"} />
              </div>
              <div className="mt-2 h-1.5 w-full rounded-full bg-white/10">
                <div className="h-1.5 rounded-full bg-[var(--accent)]" style={{ width: `${(done / r.steps.length) * 100}%` }} />
              </div>
              <div className="mt-3 space-y-2">
                {r.steps.map((s) => (
                  <div key={s.id} className="rounded-xl bg-[var(--surface2)] p-2.5">
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-xs font-medium leading-tight">{s.name}</p>
                      <span
                        className={`shrink-0 text-[10px] font-semibold uppercase ${
                          s.status === "done" ? "text-emerald-400" : s.status === "awaiting_approval" ? "text-amber-400" : s.status === "failed" ? "text-rose-400" : "text-[var(--muted)]"
                        }`}
                      >
                        {s.status === "done" ? "✓ done" : s.status === "awaiting_approval" ? "⏸ approval" : s.status === "failed" ? "✕ rejected" : s.status}
                      </span>
                    </div>
                    <p className="mt-0.5 text-[10px] text-[var(--muted)]">{agentById(s.agentId).name}</p>
                    {s.output && <p className="mt-1 text-[11px] leading-snug text-[var(--text)]/80">{s.output}</p>}
                  </div>
                ))}
              </div>
              {r.status === "running" && (
                <button onClick={() => advance(r.id)} className="mt-2 rounded-lg bg-white/10 px-3 py-1.5 text-xs font-medium">
                  Advance now
                </button>
              )}
            </Card>
          );
        })}
      </div>

      <SectionTitle>Start a workflow</SectionTitle>
      <div className="space-y-2">
        {BUILT_IN_WORKFLOWS.map((w) => (
          <Card key={w.id}>
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <p className="text-sm font-medium leading-tight">{w.name}</p>
                <p className="mt-0.5 text-[11px] text-[var(--muted)]">
                  {w.trigger === "manual" ? "Manual" : w.trigger.replace("schedule:", "Scheduled ").replace("event:", "On ")} · {w.steps.length} steps
                </p>
              </div>
              <button
                onClick={() => {
                  const run = createRun(w);
                  dispatch({ type: "addRun", item: run });
                  dispatch({ type: "addAudit", item: { id: newId(), ts: new Date().toISOString(), actor: "Founder", action: "workflow_started", detail: w.name } });
                }}
                className="shrink-0 rounded-lg bg-[var(--accent)] px-2.5 py-1.5 text-[11px] font-semibold text-[#0a1428]"
              >
                Run
              </button>
            </div>
          </Card>
        ))}
      </div>

      {pastRuns.length > 0 && (
        <>
          <SectionTitle>Completed runs</SectionTitle>
          <div className="space-y-2">
            {pastRuns.map((r) => (
              <Card key={r.id} className="opacity-70">
                <div className="flex items-center justify-between gap-2">
                  <p className="text-sm">{r.title}</p>
                  <span className={`text-xs ${r.status === "completed" ? "text-emerald-400" : "text-rose-400"}`}>{r.status}</span>
                </div>
                <p className="mt-0.5 text-[10px] text-[var(--muted)]">{r.steps.filter((s) => s.status === "done").length}/{r.steps.length} steps · updated {new Date(r.updatedAt).toLocaleString()}</p>
              </Card>
            ))}
          </div>
        </>
      )}

      <SectionTitle>Execution history</SectionTitle>
      <Card>
        {data.audit.length === 0 ? (
          <p className="text-sm text-[var(--muted)]">No activity recorded yet.</p>
        ) : (
          <ul className="space-y-1.5">
            {data.audit.slice(0, 15).map((e) => (
              <li key={e.id} className="text-[11px] leading-snug">
                <span className="text-[var(--muted)]">{new Date(e.ts).toLocaleTimeString()} · </span>
                <span className="gold">{e.actor}</span> — {e.detail}
              </li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  );
}
