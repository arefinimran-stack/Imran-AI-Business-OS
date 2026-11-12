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
  model?: string;
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

/**
 * NVIDIA NIM exposes an OpenAI-compatible Chat Completions API.
 * Keep the API key server-side; never expose it to browser code.
 */
export class NvidiaNemotronProvider implements AIProvider {
  id = "nvidia";
  name = "NVIDIA Nemotron";

  constructor(
    private apiKey: string,
    private model = "nvidia/nemotron-3.5-super-vl-120b-a12b"
  ) {}

  async chat(messages: ChatMessage[]): Promise<string> {
    const res = await fetch("https://integrate.api.nvidia.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        Authorization: `Bearer ${this.apiKey}`,
      },
      body: JSON.stringify({
        model: this.model,
        messages,
        temperature: 1,
        top_p: 0.95,
        max_tokens: 4096,
        reasoning_effort: "high",
        stream: false,
      }),
      signal: AbortSignal.timeout(90_000),
    });

    if (!res.ok) {
      const body = await res.text();
      throw new Error(`NVIDIA NIM request failed (${res.status}): ${body.slice(0, 240)}`);
    }

    const json = (await res.json()) as {
      choices?: { message?: { content?: string | null } }[];
    };
    return json.choices?.[0]?.message?.content ?? "";
  }
}

/**
 * AI_PROVIDER may be "nvidia", "openai", or "auto".
 * Auto prefers NVIDIA when its key is configured, then falls back to OpenAI.
 */
export function resolveProvider(): { provider: AIProvider | null; status: AIStatus } {
  const preferred = (process.env.AI_PROVIDER ?? "auto").toLowerCase();
  const nvidiaKey = process.env.NVIDIA_API_KEY;
  const openAIKey = process.env.OPENAI_API_KEY;

  if (preferred === "nvidia") {
    if (!nvidiaKey) {
      return {
        provider: null,
        status: {
          available: false,
          provider: "NVIDIA Nemotron",
          reason: "NVIDIA_API_KEY is not configured. Add it as an encrypted server-side environment variable.",
        },
      };
    }
    const model = process.env.NVIDIA_MODEL ?? "nvidia/nemotron-3.5-super-vl-120b-a12b";
    return {
      provider: new NvidiaNemotronProvider(nvidiaKey, model),
      status: { available: true, provider: "NVIDIA Nemotron", model },
    };
  }

  if (preferred === "openai") {
    if (!openAIKey) {
      return {
        provider: null,
        status: {
          available: false,
          provider: "OpenAI",
          reason: "OPENAI_API_KEY is not configured.",
        },
      };
    }
    return {
      provider: new OpenAIProvider(openAIKey),
      status: { available: true, provider: "OpenAI", model: "gpt-4o-mini" },
    };
  }

  if (nvidiaKey) {
    const model = process.env.NVIDIA_MODEL ?? "nvidia/nemotron-3.5-super-vl-120b-a12b";
    return {
      provider: new NvidiaNemotronProvider(nvidiaKey, model),
      status: { available: true, provider: "NVIDIA Nemotron", model },
    };
  }

  if (openAIKey) {
    return {
      provider: new OpenAIProvider(openAIKey),
      status: { available: true, provider: "OpenAI", model: "gpt-4o-mini" },
    };
  }

  return {
    provider: null,
    status: {
      available: false,
      provider: "none",
      reason:
        "No AI provider configured. Add NVIDIA_API_KEY for NVIDIA Nemotron or OPENAI_API_KEY for OpenAI. The local planner and workflow engine work without a provider key.",
    },
  };
}
