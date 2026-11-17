import test from "node:test";
import assert from "node:assert/strict";
import { readFile, mkdtemp, writeFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { pathToFileURL } from "node:url";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const ts = require("typescript");
const source = await readFile(new URL("../lib/ai/provider.ts", import.meta.url), "utf8");
const compiled = ts.transpileModule(source, {
  compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 },
}).outputText;
const tempDir = await mkdtemp(join(tmpdir(), "imran-ai-provider-"));
const modulePath = join(tempDir, "provider.mjs");
await writeFile(modulePath, compiled);
const { resolveProvider } = await import(pathToFileURL(modulePath).href);

function clearProviderEnv() {
  delete process.env.AI_PROVIDER;
  delete process.env.NVIDIA_API_KEY;
  delete process.env.NVIDIA_MODEL;
  delete process.env.OPENAI_API_KEY;
}

test("auto mode falls back to OpenAI when NVIDIA inference fails", async () => {
  clearProviderEnv();
  process.env.NVIDIA_API_KEY = "nvidia-test-key";
  process.env.OPENAI_API_KEY = "openai-test-key";
  const originalFetch = globalThis.fetch;
  const urls = [];
  globalThis.fetch = async (url) => {
    urls.push(String(url));
    if (String(url).includes("integrate.api.nvidia.com")) {
      return { ok: false, status: 503 };
    }
    return {
      ok: true,
      json: async () => ({ choices: [{ message: { content: "fallback response" } }] }),
    };
  };
  try {
    const { provider, status } = resolveProvider();
    assert.equal(await provider.chat([{ role: "user", content: "hello" }]), "fallback response");
    assert.deepEqual(urls, [
      "https://integrate.api.nvidia.com/v1/chat/completions",
      "https://api.openai.com/v1/chat/completions",
    ]);
    assert.equal(status.provider, "OpenAI (fallback)");
    assert.equal(status.model, "gpt-4o-mini");
  } finally {
    globalThis.fetch = originalFetch;
    clearProviderEnv();
  }
});

test("explicit NVIDIA mode does not silently switch providers", async () => {
  clearProviderEnv();
  process.env.AI_PROVIDER = "nvidia";
  process.env.NVIDIA_API_KEY = "nvidia-test-key";
  process.env.OPENAI_API_KEY = "openai-test-key";
  const originalFetch = globalThis.fetch;
  let calls = 0;
  globalThis.fetch = async () => {
    calls += 1;
    return { ok: false, status: 503 };
  };
  try {
    const { provider } = resolveProvider();
    await assert.rejects(provider.chat([{ role: "user", content: "hello" }]));
    assert.equal(calls, 1);
  } finally {
    globalThis.fetch = originalFetch;
    clearProviderEnv();
  }
});

test("auto mode uses OpenAI when no NVIDIA key is configured", async () => {
  clearProviderEnv();
  process.env.OPENAI_API_KEY = "openai-test-key";
  const { provider, status } = resolveProvider();
  assert.equal(provider.id, "openai");
  assert.equal(status.provider, "OpenAI");
  clearProviderEnv();
});

test("invalid provider selection fails closed", () => {
  clearProviderEnv();
  process.env.AI_PROVIDER = "unknown";
  const { provider, status } = resolveProvider();
  assert.equal(provider, null);
  assert.equal(status.available, false);
  clearProviderEnv();
});

test("test module cleanup", async () => {
  await rm(tempDir, { recursive: true, force: true });
});
