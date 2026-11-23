'use client';

import { useCallback, useEffect, useState } from 'react';

const statusTone = value => {
  const text = String(value || '').toLowerCase();
  if (text.includes('ready') || text.includes('active') || text.includes('connected')) return 'good';
  if (text.includes('blocked') || text.includes('missing') || text.includes('expired') || text.includes('failed')) return 'bad';
  return 'watch';
};

export default function SystemHealth({ org, supabase }) {
  const [health, setHealth] = useState(null);
  const [agents, setAgents] = useState([]);
  const [tools, setTools] = useState([]);
  const [skills, setSkills] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [approvals, setApprovals] = useState([]);
  const [incidents, setIncidents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [checkedAt, setCheckedAt] = useState(null);

  const load = useCallback(async () => {
    if (!org?.id) return;
    setLoading(true); setError('');
    try {
      const [a, t, s, j, p, i, h] = await Promise.all([
        supabase.from('ai_agents').select('id,name,agent_key,status,approval_policy').eq('organization_id', org.id).order('name'),
        supabase.from('ai_tool_connections').select('id,display_name,provider,status,connection_type,last_verified_at,notes').eq('organization_id', org.id).order('display_name'),
        supabase.from('skill_library').select('id,skill_name,dept_key,is_verified,implementation_ref').eq('organization_id', org.id).order('skill_name'),
        supabase.from('ai_orchestration_jobs').select('id,status,risk_class,created_at,error_code,error_summary').eq('organization_id', org.id).order('created_at', { ascending: false }).limit(10),
        supabase.from('ai_approval_requests').select('id,decision,action_key,target_summary,expires_at,created_at').eq('organization_id', org.id).order('created_at', { ascending: false }).limit(10),
        supabase.from('incident_logs').select('id,component,error_category,diagnostic_evidence,minimum_founder_action,created_at').eq('organization_id', org.id).is('resolved_at', null).order('created_at', { ascending: false }).limit(10),
        fetch('/api/system/health', { cache: 'no-store' }).then(r => r.json())
      ]);
      const failed = [a, t, s, j, p, i].find(x => x.error);
      if (failed) throw new Error(failed.error.message);
      setAgents(a.data || []);
      setTools(t.data || []);
      setSkills(s.data || []);
      setJobs(j.data || []);
      setApprovals(p.data || []);
      setIncidents(i.data || []);
      setHealth(h);
      setCheckedAt(new Date().toISOString());
    } catch (e) {
      setError(e.message || 'Diagnostics could not be completed.');
    } finally {
      setLoading(false);
    }
  }, [org?.id, supabase]);

  useEffect(() => { load(); }, [load]);

  const pendingApprovals = approvals.filter(x => x.decision === 'pending').length;
  const queuedJobs = jobs.filter(x => ['queued', 'planning', 'running', 'awaiting_approval'].includes(x.status)).length;
  const verifiedSkills = skills.filter(x => x.is_verified).length;
  const configuredAgents = agents.filter(x => x.status === 'configured').length;
  const testingAgents = agents.filter(x => x.status === 'testing').length;
  const activeAgents = agents.filter(x => x.status === 'active').length;
  const providerReady = Boolean(health?.provider_key_present);
  const databaseReady = !loading && !error && Boolean(org?.id);

  return <section className="rc-health">
    <div className="rc-relay-heading">
      <div><span>OPERATIONS · SECURITY · RECOVERY</span><h2>System Fixer</h2><p>Inspect the real operating state, isolate blockers and present the shortest safe recovery path.</p></div>
      <div className="rc-relay-mark">⚙</div>
    </div>
    <div className="rc-health-toolbar"><small>{checkedAt ? 'Last checked ' + new Date(checkedAt).toLocaleString('en-GB') : 'Diagnostics not yet run'}</small><button onClick={load} disabled={loading}>{loading ? 'Checking…' : '↻ Run diagnostics'}</button></div>
    {error && <div className="rc-relay-error" role="alert">{error}</div>}

    <div className="rc-health-grid">
      <article className="rc-health-card"><span>DATABASE</span><b className={statusTone(health?.supabase_configured ? 'connected' : 'unknown')}>{databaseReady ? 'Connected' : 'Not verified'}</b><small>Supabase session and workspace records</small></article>
      <article className="rc-health-card"><span>AI PROVIDER</span><b className={statusTone(providerReady ? 'ready' : 'missing')}>{providerReady ? 'NVIDIA key present' : 'NVIDIA key not detected'}</b><small>{health?.model || 'Model not configured'}</small></article>
      <article className="rc-health-card"><span>AGENT RUNTIME</span><b className="watch">Limited / staged</b><small>New Vercel relay is being prepared; legacy Supabase worker is readiness-only.</small></article>
      <article className="rc-health-card"><span>APPROVAL GATE</span><b className={pendingApprovals ? 'watch' : 'good'}>{pendingApprovals} pending</b><small>Founder decisions awaiting action</small></article>
    </div>

    <div className="rc-health-columns">
      <section className="rc-panel">
        <header><div><span>CAPABILITY REGISTRY</span><h3>Agents, tools and skills</h3></div></header>
        <div className="rc-health-metrics">
          <div><b>{agents.length}</b><small>Agents registered</small></div>
          <div><b>{configuredAgents}</b><small>Configured agents</small></div>
          <div><b>{testingAgents}</b><small>Testing agents</small></div>
          <div><b>{activeAgents}</b><small>Active agents</small></div>
          <div><b>{tools.length}</b><small>Tool records</small></div>
          <div><b>{verifiedSkills}/{skills.length}</b><small>Verified skills</small></div>
        </div>
        <p className="rc-health-note">A registry record is not proof of a working app-side integration. Provider credentials and action permissions are verified separately.</p>
        <div className="rc-health-list">
          {tools.map(tool => <div key={tool.id}><span>{tool.display_name}</span><b className={statusTone(tool.status)}>{tool.status}</b><small>{tool.provider} · {tool.connection_type} · {tool.last_verified_at ? 'verified ' + new Date(tool.last_verified_at).toLocaleDateString('en-GB') : 'app-side access unverified'}</small><small>{tool.notes || 'No connection note recorded.'}</small></div>)}
        </div>
      </section>

      <section className="rc-panel">
        <header><div><span>BLOCKER REGISTER</span><h3>Open incidents & recovery</h3></div><b>{incidents.length} OPEN</b></header>
        {incidents.length ? incidents.map(item => <article className="rc-incident" key={item.id}>
          <div><b>{item.component} · {item.error_category}</b><small>{item.diagnostic_evidence}</small></div>
          <p><strong>Minimum action:</strong> {item.minimum_founder_action}</p>
        </article>) : <div className="rc-health-empty">No open incidents are recorded in the workspace.</div>}
        <div className="rc-health-note">The legacy Supabase worker currently checks for an OpenAI key and a separate dispatcher flag. The new command relay is being moved to the existing Vercel/NVIDIA environment; do not add a second provider key unless diagnostics show it is needed.</div>
      </section>
    </div>

    <div className="rc-health-columns">
      <section className="rc-panel">
        <header><div><span>EXECUTION QUEUE</span><h3>Recent system requests</h3></div><b>{queuedJobs} ACTIVE</b></header>
        {jobs.length ? jobs.map(job => <div className="rc-health-row" key={job.id}><b>{job.status}</b><span>{job.risk_class}</span><small>{new Date(job.created_at).toLocaleString('en-GB')}</small></div>) : <div className="rc-health-empty">No orchestration jobs have been recorded.</div>}
      </section>
      <section className="rc-panel">
        <header><div><span>REPAIR POLICY</span><h3>What the fixer can do</h3></div></header>
        <ul className="rc-repair-list">
          <li>Recheck database, agent registry, approval queue and server-side provider configuration.</li>
          <li>Identify expired or unverified connectors and route you to the correct provider reauthorization flow.</li>
          <li>Prepare safe internal fixes and queue write actions for your YES / NO approval.</li>
          <li>Never bypass provider permissions, quotas, paid limits or legal/professional safeguards.</li>
        </ul>
      </section>
    </div>
  </section>;
}
