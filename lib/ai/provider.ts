export interface ChatMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

export interface AIProvider {
  id: string;
  name: string;
  chat(messages: ChatMessage[]): Promise<string>;
}

export interface AIStatus {
  available: boolean;
  provider: string;
  reason?: string;
}

export class OpenAIProvider implements AIProvider {
  id = "openai";
  name = "OpenAI";
  constructor(private apiKey: string, private model = "gpt-4o-mini") {}

  async chat(messages: ChatMessage[]): Promise<string> {
    const res = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${this.apiKey}`,
      },
      body: JSON.stringify({ model: this.model, messages }),
    });
    if (!res.ok) {
      const body = await res.text();
      throw new Error(`OpenAI request failed (${res.status}): ${body.slice(0, 200)}`);
    }
    const json = (await res.json()) as { choices?: { message?: { content?: string } }[] };
    return json.choices?.[0]?.message?.content ?? "";
  }
}

export function resolveProvider(): { provider: AIProvider | null; status: AIStatus } {
  const key = process.env.OPENAI_API_KEY;
  if (!key) {
    return {
      provider: null,
      status: {
        available: false,
        provider: "none",
        reason:
          "No AI provider configured. Set OPENAI_API_KEY (or extend lib/ai/provider.ts with another provider) to enable generative responses. The rule-based planner and workflow engine work without it.",
      },
    };
  }
  return { provider: new OpenAIProvider(key), status: { available: true, provider: "OpenAI" } };
}
