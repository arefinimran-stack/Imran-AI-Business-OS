"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useStore, newId } from "@/lib/store";
import { Card, SectionTitle, inputClass, buttonClass } from "@/components/ui";
import { AGENTS, agentById } from "@/lib/agents/registry";
import { planFromInstruction, BUILT_IN_WORKFLOWS } from "@/lib/agents/planner";
import { askAI } from "@/lib/ai/client";
import { createRun } from "@/lib/workflows/engine";
import type { WorkflowDef } from "@/lib/types";

interface ChatEntry {
  role: "user" | "assistant";
  content: string;
  source?: "provider" | "local";
  suggestedWorkflowId?: string;
}

export default function CommandCentrePage() {
  const { data, dispatch } = useStore();
  const router = useRouter();
  const [messages, setMessages] = useState<ChatEntry[]>([
    {
      role: "assistant",
      content:
        "Command Centre online. I coordinate all departments and agents. Give me an instruction — for example: \"Prepare a 30-day corporate legal awareness campaign for Arefin Legal & Corporate Group\" or \"Prepare my weekly executive report\".",
    },
  ]);
  const [input, setInput] = useState("");
  const [thinking, setThinking] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, thinking]);

  const send = async () => {
    const text = input.trim();
    if (!text || thinking) return;
    setInput("");
    setMessages((m) => [...m, { role: "user", content: text }]);
    setThinking(true);

    const plan = planFromInstruction(text);
    const result = await askAI(
      [...messages.map((m) => ({ role: m.role, content: m.content })), { role: "user", content: text }],
      () => plan.reply
    );

    setMessages((m) => [
      ...m,
      {
        role: "assistant",
        content: result.content,
        source: result.source === "provider" ? "provider" : "local",
        suggestedWorkflowId: result.source === "local" ? plan.workflow.id : undefined,
      },
    ]);
    setThinking(false);
  };

  const launchWorkflow = (id: string) => {
    const def = BUILT_IN_WORKFLOWS.find((w) => w.id === id);
    if (!def) return;
    const run = createRun(def);
    dispatch({ type: "addRun", item: run });
    dispatch({
      type: "addAudit",
      item: { id: newId(), ts: new Date().toISOString(), actor: "Founder", action: "workflow_started", detail: def.name },
    });
    router.push("/autopilot");
  };

  const allWorkflows: WorkflowDef[] = [...BUILT_IN_WORKFLOWS, ...data.workflows];

  return (
    <div>
      <SectionTitle>Agents ({AGENTS.length})</SectionTitle>
      <div className="grid grid-cols-2 gap-2">
        {AGENTS.map((a) => (
          <Card key={a.id} className="min-w-0">
            <p className="text-sm font-semibold leading-tight gold">{a.name}</p>
            <p className="mt-0.5 text-[11px] text-[var(--muted)] leading-snug">{a.role}</p>
          </Card>
        ))}
      </div>

      <SectionTitle>Conversation</SectionTitle>
      <Card>
        <div className="max-h-80 space-y-3 overflow-y-auto">
          {messages.map((m, i) => (
            <div key={i} className={m.role === "user" ? "text-right" : ""}>
              <div
                className={`inline-block max-w-[90%] rounded-2xl px-3 py-2 text-sm leading-snug ${
                  m.role === "user" ? "bg-[var(--accent)] text-[#0a1428] font-medium" : "bg-[var(--surface2)]"
                }`}
              >
                {m.content}
                {m.source === "local" && (
                  <span className="mt-1 block text-[10px] text-[var(--muted)]">local planner · no AI provider connected</span>
                )}
              </div>
              {m.suggestedWorkflowId && (
                <div className="mt-1.5 text-left">
                  <button
                    onClick={() => launchWorkflow(m.suggestedWorkflowId!)}
                    className="rounded-xl bg-[var(--accent)] px-3 py-2 text-xs font-semibold text-[#0a1428]"
                  >
                    ▶ Execute: {allWorkflows.find((w) => w.id === m.suggestedWorkflowId)?.name}
                  </button>
                </div>
              )}
            </div>
          ))}
          {thinking && <p className="text-xs text-[var(--muted)]">IMRAN AI is thinking…</p>}
          <div ref={bottomRef} />
        </div>
        <div className="mt-3 flex gap-2">
          <input
            className={inputClass}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && send()}
            placeholder="Instruct your organisation…"
          />
          <button className={buttonClass} onClick={send} disabled={thinking || !input.trim()}>
            Send
          </button>
        </div>
      </Card>

      <SectionTitle>Available workflows</SectionTitle>
      <div className="space-y-2">
        {allWorkflows.map((w) => (
          <Card key={w.id}>
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <p className="text-sm font-medium leading-tight">{w.name}</p>
                <p className="mt-0.5 text-[11px] text-[var(--muted)]">{w.description}</p>
              </div>
              <button onClick={() => launchWorkflow(w.id)} className="shrink-0 rounded-lg bg-[var(--accent)] px-2.5 py-1.5 text-[11px] font-semibold text-[#0a1428]">
                Run
              </button>
            </div>
            <p className="mt-1.5 text-[11px] text-[var(--muted)]">
              {w.trigger === "manual" ? "Manual" : w.trigger.replace("schedule:", "Scheduled ").replace("event:", "On ")} · {w.steps.length} steps · {w.steps.map((s) => agentById(s.agentId).name.replace(" Agent", "")).join(" → ")}
            </p>
          </Card>
        ))}
      </div>
    </div>
  );
}
