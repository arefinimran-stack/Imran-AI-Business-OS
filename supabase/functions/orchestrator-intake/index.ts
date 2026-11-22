import { createClient } from "npm:@supabase/supabase-js@2";
import {
  isValidIdempotencyKey,
  isValidOrganizationId,
  readQuotaDecision,
} from "./policy.ts";

const allowedOrigins = new Set([
  "https://imran-ai-business-os.vercel.app",
  "http://localhost:3000",
]);

function corsHeaders(origin: string | null) {
  const headers: Record<string, string> = {
    "Vary": "Origin",
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-idempotency-key",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Expose-Headers": "Retry-After",
  };
  if (origin && allowedOrigins.has(origin)) headers["Access-Control-Allow-Origin"] = origin;
  return headers;
}

function json(body: unknown, status: number, origin: string | null, extraHeaders: Record<string, string> = {}) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders(origin), ...extraHeaders, "Content-Type": "application/json" },
  });
}

Deno.serve(async (req: Request) => {
  const origin = req.headers.get("Origin");
  if (req.method === "OPTIONS") {
    if (origin && !allowedOrigins.has(origin)) return new Response("origin not allowed", { status: 403 });
    return new Response("ok", { headers: corsHeaders(origin) });
  }
  if (req.method !== "POST") return json({ error: "method_not_allowed" }, 405, origin);
  if (origin && !allowedOrigins.has(origin)) return json({ error: "origin_not_allowed" }, 403, origin);
  if (!req.headers.get("Content-Type")?.toLowerCase().includes("application/json")) {
    return json({ error: "content_type_must_be_json" }, 415, origin);
  }

  const authorization = req.headers.get("Authorization");
  if (!authorization?.startsWith("Bearer ")) return json({ error: "authentication_required" }, 401, origin);

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const keyMapRaw = Deno.env.get("SUPABASE_PUBLISHABLE_KEYS");
    if (!supabaseUrl || !keyMapRaw) return json({ error: "server_configuration_incomplete" }, 503, origin);
    const keyMap = JSON.parse(keyMapRaw);
    const keyEnvName = keyMap?.default;
    const publishableKey = typeof keyEnvName === "string" ? Deno.env.get(keyEnvName) : null;
    if (!publishableKey) return json({ error: "publishable_key_unavailable" }, 503, origin);

    const supabase = createClient(supabaseUrl, publishableKey, {
      global: { headers: { Authorization: authorization } },
      auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
    });

    const { data: authData, error: authError } = await supabase.auth.getUser();
    if (authError || !authData.user) return json({ error: "invalid_session" }, 401, origin);

    const raw = await req.text();
    if (raw.length > 16000) return json({ error: "request_too_large" }, 413, origin);
    const body = JSON.parse(raw);
    const organizationId = body.organization_id;
    const agentKey = typeof body.agent_key === "string" ? body.agent_key : "market-intelligence";
    const requestText = typeof body.request_text === "string" ? body.request_text.trim() : "";
    const idempotencyKey = req.headers.get("x-idempotency-key") || body.idempotency_key;

    if (!isValidOrganizationId(organizationId) || !/^[a-z0-9-]{2,80}$/.test(agentKey)
      || !requestText || requestText.length > 6000 || !isValidIdempotencyKey(idempotencyKey)) {
      return json({ error: "invalid_request" }, 400, origin);
    }

    const { data: membership, error: membershipError } = await supabase
      .from("organization_members")
      .select("organization_id, role")
      .eq("organization_id", organizationId)
      .eq("user_id", authData.user.id)
      .eq("is_active", true)
      .maybeSingle();
    if (membershipError || !membership || !["owner", "admin", "lawyer", "staff"].includes(membership.role)) {
      return json({ error: "organisation_access_denied" }, 403, origin);
    }

    const { data: agent, error: agentError } = await supabase
      .from("ai_agents")
      .select("id, agent_key, name, status")
      .eq("organization_id", organizationId)
      .eq("agent_key", agentKey)
      .in("status", ["configured", "testing", "active"])
      .maybeSingle();
    if (agentError || !agent) return json({ error: "agent_not_enabled" }, 409, origin);

    // Return an existing request before consuming quota, so client retries remain idempotent.
    const { data: existing, error: existingError } = await supabase
      .from("ai_orchestration_jobs")
      .select("id, correlation_id, status, risk_class, created_at")
      .eq("organization_id", organizationId)
      .eq("idempotency_key", idempotencyKey)
      .maybeSingle();
    if (existingError) return json({ error: "idempotency_check_failed" }, 503, origin);
    if (existing) {
      return json({ job: existing, agent: agent.name, replayed: true, execution_started: false }, 200, origin);
    }

    const { data: quotaData, error: quotaError } = await supabase.rpc(
      "consume_ai_orchestration_intake_quota",
      { p_organization_id: organizationId },
    );
    if (quotaError) {
      console.error("orchestration_quota_check_failed", quotaError.code);
      return json({ error: "intake_temporarily_unavailable" }, 503, origin);
    }
    const quota = readQuotaDecision(quotaData);
    if (!quota) return json({ error: "intake_quota_response_invalid" }, 503, origin);
    if (!quota.allowed) {
      return json(
        { error: "rate_limit_exceeded", retry_after_seconds: quota.retryAfterSeconds },
        429,
        origin,
        { "Retry-After": String(quota.retryAfterSeconds) },
      );
    }

    const { data: job, error: insertError } = await supabase
      .from("ai_orchestration_jobs")
      .insert({
        organization_id: organizationId,
        requested_by: authData.user.id,
        primary_agent_id: agent.id,
        request_text: requestText,
        request_type: "manual",
        status: "queued",
        risk_class: "read_only",
        plan: { intake: "authenticated", agent_key: agent.agent_key, runtime: "not_attached" },
        idempotency_key: idempotencyKey,
      })
      .select("id, correlation_id, status, risk_class, created_at")
      .single();

    if (insertError) {
      if (insertError.code === "23505") {
        const { data: replay } = await supabase
          .from("ai_orchestration_jobs")
          .select("id, correlation_id, status, risk_class, created_at")
          .eq("organization_id", organizationId)
          .eq("idempotency_key", idempotencyKey)
          .maybeSingle();
        if (replay) return json({ job: replay, agent: agent.name, replayed: true, execution_started: false }, 200, origin);
      }
      console.error("orchestration_job_insert_failed", insertError.code);
      return json({ error: "job_creation_failed" }, 500, origin);
    }

    return json({
      job,
      agent: agent.name,
      replayed: false,
      execution_started: false,
      message: "Request safely queued. The model runtime and tool dispatcher are not yet enabled.",
    }, 202, origin);
  } catch (error) {
    console.error("orchestrator_intake_error", error instanceof Error ? error.message : "unknown");
    return json({ error: "invalid_orchestration_request" }, 400, origin);
  }
});
