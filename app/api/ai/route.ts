import { NextResponse } from "next/server";
import { resolveProvider, type ChatMessage } from "@/lib/ai/provider";

export const runtime = "nodejs";

export async function POST(request: Request) {
  let body: { messages?: ChatMessage[] };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }
  const messages = body.messages;
  if (!Array.isArray(messages) || messages.length === 0) {
    return NextResponse.json({ error: "messages array is required" }, { status: 400 });
  }

  const { provider, status } = resolveProvider();
  if (!provider) {
    return NextResponse.json({ error: status.reason, providerStatus: status }, { status: 503 });
  }

  try {
    const content = await provider.chat([
      {
        role: "system",
        content:
          "You are IMRAN AI, the central intelligence of Imran Arefin's business operating system. You coordinate departments: Arefin Legal & Corporate Group, Supreme Advocacy Hub, IA² Holdings, C3 Lifestyle, Bold Cotton, and future ventures. Be precise, executive-grade, and concise. Never invent statutes, cases or citations.",
      },
      ...messages,
    ]);
    return NextResponse.json({ content, providerStatus: status });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "AI provider request failed" },
      { status: 502 }
    );
  }
}
