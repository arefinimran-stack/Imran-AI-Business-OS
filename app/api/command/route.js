import { NextResponse } from 'next/server';
import { randomUUID, createHash } from 'node:crypto';
import { createClient } from '../../../lib/supabase/server.js';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const ALLOWED_ACTIONS = new Set(['task.create', 'document.draft']);

function stableStringify(value) {
  if (Array.isArray(value)) return '[' + value.map(stableStringify).join(',') + ']';
  if (value && typeof value === 'object') {
    return '{' + Object.keys(value).sort().map(key => JSON.stringify(key) + ':' + stableStringify(value[key])).join(',') + '}';
  }
  return JSON.stringify(value);
}

function parseModelJson(raw) {
  const text = String(raw || '').trim();
  const start = text.indexOf('{');
  const end = text.lastIndexOf('}');
  if (start < 0 || end <= start) return { reply: text, proposals: [] };
  try {
    const value = JSON.parse(text.slice(start, end + 1));
    return {
      reply: typeof value.reply === 'string' ? value.reply : text,
      proposals: Array.isArray(value.proposals) ? value.proposals : [],
      blocked_actions: Array.isArray(value.blocked_actions) ? value.blocked_actions : []
    };
  } catch {
    return { reply: text, proposals: [] };
  }
}

function sanitizeProposal(item) {
  if (!item || !ALLOWED_ACTIONS.has(item.action_key)) return null;
  if (item.action_key === 'task.create') {
    const payload = item.payload || {};
    const title = typeof payload.title === 'string' ? payload.title.trim().slice(0, 180) : '';
    if (!title) return null;
    const priority = ['low', 'normal', 'high', 'urgent'].includes(payload.priority) ? payload.priority : 'normal';
    return {
      action_key: 'task.create',
      target_summary: String(item.target_summary || title).slice(0, 240),
      reason: String(item.reason || 'Create an internal task at the founder’s request.').slice(0, 600),
      payload: {
        title,
        description: typeof payload.description === 'string' ? payload.description.slice(0, 3000) : '',
        priority
      }
    };
  }
  const payload = item.payload || {};
  const title = typeof payload.title === 'string' ? payload.title.trim().slice(0, 180) : '';
  const content = typeof payload.content === 'string' ? payload.content.trim().slice(0, 12000) : '';
  if (!title || !content) return null;
  return {
    action_key: 'document.draft',
    target_summary: String(item.target_summary || 'Save a document draft: ' + title).slice(0, 240),
    reason: String(item.reason || 'Save a working draft for founder review.').slice(0, 600),
    payload: {
      title,
      content,
      language: payload.language === 'Bangla' ? 'Bangla' : 'English',
      template_key: typeof payload.template_key === 'string' ? payload.template_key.slice(0, 80) : 'custom',
      matter_type: typeof payload.matter_type === 'string' ? payload.matter_type.slice(0, 80) : null,
      prompt: typeof payload.prompt === 'string' ? payload.prompt.slice(0, 3000) : null
    }
  };
}

export async function POST(request) {
  let jobId = null;
  let runId = null;
  let supabase = null;
  try {
    const body = await request.json();
    const command = typeof body.command === 'string' ? body.command.trim() : '';
    const agentKey = typeof body.agent_key === 'string' ? body.agent_key : 'command-orchestrator';
    if (!command || command.length > 6000) return NextResponse.json({ error: 'Enter a command between 1 and 6,000 characters.' }, { status: 400 });

    supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) return NextResponse.json({ error: 'Sign in to use the Command Relay.' }, { status: 401 });

    const { data: org, error: orgError } = await supabase.from('organizations').select('id').eq('slug', 'imran-ai').single();
    if (orgError || !org) return NextResponse.json({ error: 'Founder workspace is unavailable.' }, { status: 503 });

    const { data: membership, error: membershipError } = await supabase
      .from('organization_members').select('role')
      .eq('organization_id', org.id).eq('user_id', user.id).eq('is_active', true).maybeSingle();
    if (membershipError || !membership || !['owner', 'admin', 'lawyer', 'staff'].includes(membership.role)) {
      return NextResponse.json({ error: 'Your workspace role does not permit command intake.' }, { status: 403 });
    }

    const { data: agent, error: agentError } = await supabase
      .from('ai_agents').select('id,name,agent_key,status')
      .eq('organization_id', org.id).eq('agent_key', agentKey)
      .in('status', ['configured', 'testing', 'active']).maybeSingle();
    if (agentError || !agent) return NextResponse.json({ error: 'That specialist is not enabled for execution.' }, { status: 409 });

    const apiKey = process.env.NVIDIA_API_KEY;
    if (!apiKey) return NextResponse.json({ error: 'NVIDIA_API_KEY is not configured in the IA² Visual RC Vercel environment. No command was sent to an AI provider.' }, { status: 503 });
    const model = process.env.NVIDIA_MODEL || 'nvidia/nemotron-3.5-super-vl-120b-a12b';

    const idempotencyKey = randomUUID();
    const { data: job, error: jobError } = await supabase.from('ai_orchestration_jobs').insert({
      organization_id: org.id,
      requested_by: user.id,
      primary_agent_id: agent.id,
      request_text: command,
      request_type: 'manual',
      status: 'queued',
      risk_class: 'read_only',
      plan: { runtime: 'vercel-nvidia', agent_key: agentKey, action_policy: 'founder-approval-v1' },
      idempotency_key: idempotencyKey
    }).select('id,correlation_id,status').single();
    if (jobError || !job) return NextResponse.json({ error: 'Could not create the command audit record.' }, { status: 500 });
    jobId = job.id;

    const { data: run, error: runError } = await supabase.from('ai_agent_runs').insert({
      organization_id: org.id,
      agent_id: agent.id,
      requested_by: user.id,
      status: 'running',
      trigger_type: 'manual',
      input_summary: command.slice(0, 1200),
      approval_required: true,
      tool_calls: [{ job_id: job.id }],
      started_at: new Date().toISOString()
    }).select('id').single();
    if (runError || !run) throw new Error('Could not create the agent run audit record.');
    runId = run.id;

    await supabase.from('ai_orchestration_jobs').update({ status: 'planning' }).eq('id', job.id).eq('organization_id', org.id);
    await supabase.from('ai_orchestration_jobs').update({ status: 'running', started_at: new Date().toISOString() }).eq('id', job.id).eq('organization_id', org.id);

    const systemPrompt = [
      'You are the IA² Founder Command Relay operating inside a private business command centre.',
      'Your role is to understand the founder command, plan carefully, and propose only safe internal actions.',
      'Return ONLY one valid JSON object with keys: reply (string), proposals (array), blocked_actions (array). No markdown fences.',
      'Allowed proposal action_key values are ONLY task.create and document.draft.',
      'Only propose task.create when the founder explicitly asks to create a task or action item.',
      'Only propose document.draft when the founder explicitly asks to prepare or save an internal working draft.',
      'For task.create payload use title, description, priority. Priority must be low, normal, high, or urgent.',
      'For document.draft payload use title, content, language, template_key, matter_type, prompt.',
      'Never propose publishing, posting, messaging, emailing, spending money, purchasing, changing permissions, deleting data, deploying to production, filing legal documents, signing, accepting clients, or making legal commitments.',
      'If such an action is requested, explain in reply that the relevant provider adapter and founder approval workflow are not yet enabled; add its name to blocked_actions.',
      'Do not claim you executed an action. A proposal is not an approval and an approval is not proof of execution.',
      'For legal topics, provide only an internal working draft for advocate review. Never invent legal authorities, citations, statutes, facts, or procedural requirements.',
      'Do not ask for or repeat passwords, API keys, tokens, or confidential client information.',
      'Keep the reply concise, direct and operational.'
    ].join('\n');

    const modelResponse = await fetch('https://integrate.api.nvidia.com/v1/chat/completions', {
      method: 'POST',
      headers: { Authorization: 'Bearer ' + apiKey, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model,
        messages: [{ role: 'system', content: systemPrompt }, { role: 'user', content: command }],
        temperature: 0.2,
        max_tokens: 1800,
        stream: false
      }),
      signal: AbortSignal.timeout(45000)
    });

    const modelData = await modelResponse.json().catch(() => ({}));
    if (!modelResponse.ok) {
      if (runId) await supabase.from('ai_agent_runs').update({ status: 'failed', error_code: 'NVIDIA_PROVIDER_ERROR', error_summary: 'NVIDIA inference did not complete.', completed_at: new Date().toISOString() }).eq('id', runId).eq('organization_id', org.id);
      await supabase.from('ai_orchestration_jobs').update({
        status: 'failed',
        error_code: 'NVIDIA_PROVIDER_ERROR',
        error_summary: 'The configured AI provider did not complete the request.',
        completed_at: new Date().toISOString()
      }).eq('id', job.id).eq('organization_id', org.id);
      return NextResponse.json({ error: 'NVIDIA inference failed. Check provider quota, model access and environment configuration.' }, { status: 502 });
    }

    const raw = modelData?.choices?.[0]?.message?.content || '';
    const parsed = parseModelJson(raw);
    const validProposals = parsed.proposals.map(sanitizeProposal).filter(Boolean).slice(0, 1);
    const approvalCards = [];

    for (const proposal of validProposals) {
      const actionHash = createHash('sha256').update(stableStringify(proposal.payload)).digest('hex');
      const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
      const { data: approval, error: approvalError } = await supabase.from('ai_approval_requests').insert({
        organization_id: org.id,
        job_id: job.id,
        requested_by: user.id,
        action_key: proposal.action_key,
        action_payload: proposal.payload,
        action_hash: actionHash,
        target_summary: proposal.target_summary,
        reason: proposal.reason,
        expires_at: expiresAt
      }).select('id,action_key,target_summary,reason,decision,expires_at').single();
      if (approvalError || !approval) throw new Error('The proposal could not be saved to the founder approval queue.');
      approvalCards.push({
        approval_id: approval.id,
        action_key: approval.action_key,
        target_summary: approval.target_summary,
        reason: approval.reason,
        decision: approval.decision,
        expires_at: approval.expires_at
      });
    }

    const finalReply = String(parsed.reply || raw || 'Command processed.').slice(0, 6000);
    const blocked = parsed.blocked_actions.filter(x => typeof x === 'string').slice(0, 5);
    const result = { reply: finalReply, approval_ids: approvalCards.map(x => x.approval_id), blocked_actions: blocked, provider: 'nvidia', model };
    if (runId) await supabase.from('ai_agent_runs').update({ status: approvalCards.length ? 'needs_review' : 'succeeded', output_summary: finalReply.slice(0, 3000), approval_required: approvalCards.length > 0, completed_at: new Date().toISOString() }).eq('id', runId).eq('organization_id', org.id);
    await supabase.from('ai_orchestration_jobs').update({
      status: approvalCards.length ? 'awaiting_approval' : 'succeeded',
      risk_class: approvalCards.length ? 'internal_write' : 'read_only',
      result,
      completed_at: new Date().toISOString()
    }).eq('id', job.id).eq('organization_id', org.id);

    return NextResponse.json({
      job_id: job.id,
      correlation_id: job.correlation_id,
      reply: finalReply + (blocked.length ? '\n\nNot enabled: ' + blocked.join(', ') + '. These actions remain blocked until their adapters are tested.' : ''),
      proposals: approvalCards,
      execution_started: true,
      provider: 'NVIDIA',
      model
    }, { headers: { 'Cache-Control': 'no-store' } });
  } catch (error) {
    if (supabase && runId) await supabase.from('ai_agent_runs').update({ status: 'failed', error_code: 'COMMAND_RELAY_ERROR', error_summary: 'The command relay could not complete the request.', completed_at: new Date().toISOString() }).eq('id', runId);
    if (supabase && jobId) {
      await supabase.from('ai_orchestration_jobs').update({
        status: 'failed',
        error_code: 'COMMAND_RELAY_ERROR',
        error_summary: 'The command relay could not complete the request.',
        completed_at: new Date().toISOString()
      }).eq('id', jobId);
    }
    return NextResponse.json({ error: error.message || 'Command Relay failed.' }, { status: 500 });
  }
}
