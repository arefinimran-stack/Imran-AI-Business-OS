"use client";

import type { ChatMessage } from "./provider";

export interface AskResult {
  content: string;
  source: "provider" | "local" | "error";
}

export async function askAI(messages: ChatMessage[], localFallback: (lastUserMessage: string) => string): Promise<AskResult> {
  try {
    const res = await fetch("/api/ai", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ messages }),
    });
    if (!res.ok) {
      const body = (await res.json().catch(() => null)) as { error?: string } | null;
      if (res.status === 503) {
        return { content: localFallback(messages.filter((m) => m.role === "user").pop()?.content ?? ""), source: "local" };
      }
      return { content: body?.error ?? "The AI request failed.", source: "error" };
    }
    const json = (await res.json()) as { content?: string };
    return { content: json.content ?? "", source: "provider" };
  } catch {
    return { content: localFallback(messages.filter((m) => m.role === "user").pop()?.content ?? ""), source: "local" };
  }
}
