'use client';

import { useCallback, useEffect, useState } from 'react';

const statusLabel = value => (value || '').replaceAll('_', ' ');
const approvalLabel = value => ({ read_only: 'Read only', draft_only: 'Draft only', human_review: 'Human approval', restricted: 'Restricted' }[value] || value);

export default function AgentControlCentre({ org, supabase }) {
  const [agents, setAgents] = useState([]);
  const [tools, setTools] = useState([]);
  const [skills, setSkills] = useState([]);
  const [runs, setRuns] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    if (!org?.id) return;
    setLoading(true); setError('');
    const [a, t, r, j, s] = await Promise.all([
      supabase.from('ai_agents').select('id,agent_key,name,division_key,purpose,capabilities,allowed_tools,approval_policy,status,instructions_version').eq('organization_id', org.id).order('name'),
      supabase.from('ai_tool_connections').select('id,tool_key,display_name,provider,connection_type,status,scopes,permitted_actions,notes,last_verified_at').eq('organization_id', org.id).order('display_name'),
      supabase.from('ai_agent_runs').select('id,agent_id,status,trigger_type,input_summary,output_summary,approval_required,created_at,completed_at').eq('organization_id', org.id).order('created_at', { ascending: false }).limit(20),
      supabase.from('ai_orchestration_jobs').select('id,primary_agent_id,status,risk_class,request_text,correlation_id,created_at').eq('organization_id', org.id).order('created_at', { ascending: false }).limit(20),
      supabase.from('skill_library').select('id,skill_name,dept_key,deliverable_type,description,implementation_ref,is_verified,run_count,failure_count').eq('organization_id', org.id).order('skill_name'),
    ]);
    const failed = [a,t,r,j,s].find(x => x.error);
    if (failed) setError(failed.error.message);
    else { setAgents(a.data || []); setTools(t.data || []); setRuns(r.data || []); setJobs(j.data || []); setSkills(s.data || []); }
    setLoading(false);
  }, [org?.id, supabase]);

  useEffect(() => { load(); }, [load]);
  const runCounts = runs.reduce((acc, run) => { acc[run.status] = (acc[run.status] || 0) + 1; return acc; }, {});

  return <section className="os-panel">
    <div className="os-panel-head"><div><h2>Agent, Skill & Tool Registry</h2><p>Specialist roster, approved capabilities, connector register and execution history.</p></div><span className="os-count">{agents.length} agents · {tools.length} tools</span></div>
    <div className="os-attention"><div><b>Legacy Supabase intake: queue-only · primary Vercel/NVIDIA relay is in preview</b><small>This legacy Edge Function records authenticated queue requests only. The new Vercel/NVIDIA Command Relay is in the preview branch and must pass runtime tests before it is treated as operational. A queue receipt is never proof of execution.</small></div></div>
    {error && <div className="os-error" role="alert">{error}</div>}
    {loading ? <div className="os-empty">Loading agent and connector records…</div> : <>
      <div className="os-metrics">
        <article className="os-metric"><span>QUEUED REQUESTS</span><strong>{jobs.filter(j => ['queued','planning','awaiting_approval','running'].includes(j.status)).length}</strong><small>Durable intake records</small></article>
        <article className="os-metric"><span>REGISTERED AGENTS</span><strong>{agents.length}</strong><small>Specialist definitions</small></article>
        <article className="os-metric"><span>CONFIGURED</span><strong>{agents.filter(a => ['configured','testing','active'].includes(a.status)).length}</strong><small>Registry configuration only</small></article>
        <article className="os-metric"><span>TOOL RECORDS</span><strong>{tools.length}</strong><small>Connection metadata</small></article>
        <article className="os-metric"><span>VERIFIED SKILLS</span><strong>{skills.filter(s => s.is_verified).length}/{skills.length}</strong><small>Unverified skills stay draft-only</small></article>
        <article className="os-metric"><span>RUN RECORDS</span><strong>{runs.length}</strong><small>{Object.entries(runCounts).map(([k,v]) => k + ': ' + v).join(' · ') || 'No executions yet'}</small></article>
      </div>
      <div className="os-attention"><div><b>Primary command interface: Command Relay</b><small>Use the dedicated Command Relay screen for new instructions and YES / NO approvals. The legacy Supabase queue endpoint is retained for historical compatibility only; do not use it for new commands.</small></div></div>
      <div className="os-section-head"><div><h2>Recent command requests</h2><p>Queue receipts only. These records do not mean the specialist has executed.</p></div></div>
      {jobs.length ? <div className="os-task-list">{jobs.map(job => <article className="os-task-row" key={job.id}><div className="os-task-main"><b>{agents.find(a => a.id === job.primary_agent_id)?.name || 'Specialist'}</b><small>{job.request_text}</small><small>Trace: {job.correlation_id}</small></div><span className="os-chip">{statusLabel(job.status)}</span><small>{new Date(job.created_at).toLocaleString('en-GB')}</small></article>)}</div> : <div className="os-empty">No command requests have been queued.</div>}
      <div className="os-section-head"><div><h2>Specialist agents</h2><p>Each agent has a bounded responsibility and an explicit approval posture.</p></div></div>
      <div className="os-venture-grid">{agents.map(agent => <article className="os-venture" key={agent.id}>
        <div className="os-venture-top"><span>{agent.division_key || 'Central function'}</span><span className="os-chip">{statusLabel(agent.status)}</span></div>
        <h3>{agent.name}</h3><p>{agent.purpose}</p>
        <small>Approval: {approvalLabel(agent.approval_policy)}</small>
        <div className="os-attention"><div><b>Capabilities</b><small>{(agent.capabilities || []).join(' · ') || 'Not specified'}</small></div><div><b>Allowed tool keys</b><small>{(agent.allowed_tools || []).join(' · ') || 'None registered'}</small></div></div>
      </article>)}</div>
      <div className="os-section-head"><div><h2>Skill library</h2><p>Reusable procedures and internal tools. A skill remains unverified until its implementation passes tests.</p></div><span className="os-count">{skills.length} skills</span></div>
      <div className="os-venture-grid">{skills.map(skill => <article className="os-venture" key={skill.id}>
        <div className="os-venture-top"><span>{skill.dept_key}</span><span className="os-chip">{skill.is_verified ? 'verified' : 'unverified'}</span></div>
        <h3>{skill.skill_name.replaceAll('_', ' ')}</h3><p>{skill.description}</p>
        <small>{skill.deliverable_type || 'Internal skill'} · {skill.run_count} runs · {skill.failure_count} failures</small>
        {skill.implementation_ref && <small>Implementation: {skill.implementation_ref}</small>}
      </article>)}</div>
      <div className="os-section-head"><div><h2>Connected tool register</h2><p>ChatGPT-side connectors and app-side integrations are tracked separately.</p></div></div>
      <div className="os-table-wrap"><table className="os-table"><thead><tr><th>Tool</th><th>Provider</th><th>Connection type</th><th>Status</th><th>Permitted actions</th></tr></thead><tbody>{tools.map(tool => <tr key={tool.id}><td><b>{tool.display_name}</b><small>{tool.tool_key}</small></td><td>{tool.provider}</td><td>{statusLabel(tool.connection_type)}</td><td><span className="os-chip">{statusLabel(tool.status)}</span></td><td>{(tool.permitted_actions || []).join(' · ')}</td></tr>)}</tbody></table></div>
      <div className="os-section-head"><div><h2>Recent execution history</h2><p>Only actual persisted run records appear here. No test runs have been fabricated.</p></div></div>
      {runs.length ? <div className="os-task-list">{runs.map(run => <article className="os-task-row" key={run.id}><div className="os-task-main"><b>{agents.find(a => a.id === run.agent_id)?.name || 'Agent'}</b><small>{run.input_summary || 'No input summary'}</small></div><span className="os-chip">{statusLabel(run.status)}</span><small>{new Date(run.created_at).toLocaleString('en-GB')}</small></article>)}</div> : <div className="os-empty">No agent run records have been recorded yet. A command queue receipt is not an agent execution.</div>}
      <div className="os-panel-head"><div><p>Security note: this register stores connector metadata only. API keys, OAuth tokens and passwords must remain in server-side secret storage and must never be shown in this screen.</p></div><button className="os-link" onClick={load}>Refresh records ↻</button></div>
    </>}
  </section>;
}
