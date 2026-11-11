-- Scheduled worker: advances due workflow runs server-side so execution
-- continues when the app is closed. Schedule with pg_cron:
--   select cron.schedule('autopilot-tick', '*/5 * * * *', $$ select net.http_post(
--     'https://<project-ref>.functions.co/autopilot-tick', '{}', '{}',
--     '{"Authorization":"Bearer <anon-key>"}'::jsonb) $$);

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const TICK_LIMIT = 10;

Deno.serve(async () => {
  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
  );

  const { data: due, error } = await supabase
    .from("workflow_runs")
    .select("*")
    .in("status", ["running"])
    .order("updated_at", { ascending: true })
    .limit(TICK_LIMIT);

  if (error) return new Response(JSON.stringify({ error: error.message }), { status: 500 });

  const advanced: string[] = [];
  for (const run of due ?? []) {
    const steps = run.steps as { status: string }[];
    if (!steps.some((s) => s.status === "pending")) {
      await supabase.from("workflow_runs").update({ status: "completed", updated_at: new Date() }).eq("id", run.id);
      advanced.push(run.id);
      continue;
    }
    const next = steps.find((s) => s.status === "pending")!;
    if (next.needsApproval) {
      await supabase.from("approvals").insert({
        owner: run.owner,
        run_id: run.id,
        step_id: next.id,
        title: next.name,
        agent_id: next.agentId,
        summary: next.output ?? next.detail,
      });
      await supabase.from("workflow_runs").update({ status: "awaiting_approval", updated_at: new Date() }).eq("id", run.id);
      advanced.push(run.id);
      continue;
    }
    // Step execution: server-side agent workers fill in outputs here.
    // The step executor is shared with the client engine and is wired in the
    // next phase (server agent runtime).
    await supabase.from("workflow_runs").update({ updated_at: new Date() }).eq("id", run.id);
    advanced.push(run.id);
  }

  return new Response(JSON.stringify({ advanced }), { headers: { "Content-Type": "application/json" } });
});
