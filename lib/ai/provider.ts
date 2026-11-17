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

const NVIDIA_MODEL_DEFAULT = "nvidia/nemotron-3.5-super-vl-120b-a12b";
const OPENAI_MODEL_DEFAULT = "gpt-4o-mini";

export class OpenAIProvider implements AIProvider {
  id = "openai";
  name = "OpenAI";

  constructor(private apiKey: string, private model = OPENAI_MODEL_DEFAULT) {}

  async chat(messages: ChatMessage[]): Promise<string> {
    const res = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${this.apiKey}`,
      },
      body: JSON.stringify({ model: this.model, messages }),
      signal: AbortSignal.timeout(90_000),
    });
    if (!res.ok) {
      throw new Error(`OpenAI request failed (${res.status})`);
    }
    const json = (await res.json()) as {
      choices?: { message?: { content?: string | null } }[];
    };
    const content = json.choices?.[0]?.message?.content;
    if (typeof content !== "string" || !content.trim()) {
      throw new Error("OpenAI returned an empty response");
    }
    return content;
  }
}

/** NVIDIA NIM exposes an OpenAI-compatible Chat Completions API. */
export class NvidiaNemotronProvider implements AIProvider {
  id = "nvidia";
  name = "NVIDIA Nemotron";

  constructor(
    private apiKey: string,
    private model = NVIDIA_MODEL_DEFAULT
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
      throw new Error(`NVIDIA NIM request failed (${res.status})`);
    }
    const json = (await res.json()) as {
      choices?: { message?: { content?: string | null } }[];
    };
    const content = json.choices?.[0]?.message?.content;
    if (typeof content !== "string" || !content.trim()) {
      throw new Error("NVIDIA NIM returned an empty response");
    }
    return content;
  }
}

/**
 * In auto mode, try NVIDIA first and fall back to OpenAI if NVIDIA fails.
 * The shared status object is updated so the API response reports the provider
 * that actually completed the request.
 */
class AutoFallbackProvider implements AIProvider {
  id = "auto";
  name = "Automatic provider";

  constructor(
    private primary: AIProvider,
    private fallback: AIProvider,
    private status: AIStatus
  ) {}

  async chat(messages: ChatMessage[]): Promise<string> {
    try {
      return await this.primary.chat(messages);
    } catch {
      try {
        const content = await this.fallback.chat(messages);
        this.status.provider = `${this.fallback.name} (fallback)`;
        this.status.model = OPENAI_MODEL_DEFAULT;
        return content;
      } catch {
        throw new Error("All configured AI providers failed. Check provider availability and server configuration.");
      }
    }
  }
}

/** AI_PROVIDER may be "nvidia", "openai", or "auto" (default). */
export function resolveProvider(): { provider: AIProvider | null; status: AIStatus } {
  const preferred = (process.env.AI_PROVIDER ?? "auto").toLowerCase();
  const nvidiaKey = process.env.NVIDIA_API_KEY;
  const openAIKey = process.env.OPENAI_API_KEY;

  if (!["auto", "nvidia", "openai"].includes(preferred)) {
    return {
      provider: null,
      status: {
        available: false,
        provider: "none",
        reason: "AI_PROVIDER must be auto, nvidia, or openai.",
      },
    };
  }

  if (preferred === "nvidia") {
    if (!nvidiaKey) {
      return {
        provider: null,
        status: {
          available: false,
          provider: "NVIDIA Nemotron",
          reason: "NVIDIA_API_KEY is not configured.",
        },
      };
    }
    const model = process.env.NVIDIA_MODEL ?? NVIDIA_MODEL_DEFAULT;
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
      status: { available: true, provider: "OpenAI", model: OPENAI_MODEL_DEFAULT },
    };
  }

  if (nvidiaKey && openAIKey) {
    const model = process.env.NVIDIA_MODEL ?? NVIDIA_MODEL_DEFAULT;
    const status: AIStatus = {
      available: true,
      provider: "NVIDIA Nemotron (OpenAI fallback enabled)",
      model,
    };
    return {
      provider: new AutoFallbackProvider(
        new NvidiaNemotronProvider(nvidiaKey, model),
        new OpenAIProvider(openAIKey),
        status
      ),
      status,
    };
  }

  if (nvidiaKey) {
    const model = process.env.NVIDIA_MODEL ?? NVIDIA_MODEL_DEFAULT;
    return {
      provider: new NvidiaNemotronProvider(nvidiaKey, model),
      status: { available: true, provider: "NVIDIA Nemotron", model },
    };
  }

  if (openAIKey) {
    return {
      provider: new OpenAIProvider(openAIKey),
      status: { available: true, provider: "OpenAI", model: OPENAI_MODEL_DEFAULT },
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
