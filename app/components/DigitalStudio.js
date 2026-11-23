'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { DIVISIONS } from '../lib/operating-model';

const ENTITY_OPTIONS = [
  ['arefin-legal-corporate', 'Arefin Legal & Corporate'],
  ['ia2-holdings', 'IA² Holdings'],
  ['c3-lifestyle', 'C3 Lifestyle · research only'],
  ['bold-cotton', 'Bold Cotton · research only'],
];
const DELIVERABLE_TYPES = ['pdf', 'digital_product', 'document', 'article', 'website', 'webapp', 'image', 'video', 'audio', 'qualified_lead', 'ministry_solution'];
const COMMERCIAL_ROLES = [
  ['free_lead_magnet', 'Free lead magnet'],
  ['paid_product_candidate', 'Paid product candidate'],
  ['service_asset', 'Service delivery asset'],
  ['internal_research', 'Internal research only'],
];
const label = value => String(value || '').replaceAll('_', ' ');
const statusTone = value => {
  const v = String(value || '').toLowerCase();
  if (['active', 'connected', 'ready', 'live', 'settled', 'verified', 'approved'].includes(v)) return 'good';
  if (['degraded', 'disconnected', 'failed', 'rejected', 'blocked'].includes(v)) return 'bad';
  return 'watch';
};

export default function DigitalStudio({ org, supabase, setActive }) {
  const [departments, setDepartments] = useState([]);
  const [skills, setSkills] = useState([]);
  const [deliverables, setDeliverables] = useState([]);
  const [sources, setSources] = useState([]);
  const [claims, setClaims] = useState([]);
  const [briefs, setBriefs] = useState([]);
  const [content, setContent] = useState([]);
  const [signals, setSignals] = useState([]);
  const [agents, setAgents] = useState([]);
  const [tools, setTools] = useState([]);
  const [runs, setRuns] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [ventures, setVentures] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [checkedAt, setCheckedAt] = useState(null);
  const [showCreate, setShowCreate] = useState(false);
  const [title, setTitle] = useState('');
  const [entityKey, setEntityKey] = useState('arefin-legal-corporate');
  const [deptKey, setDeptKey] = useState('RESEARCH_AI');
  const [deliverableType, setDeliverableType] = useState('pdf');
  const [commercialRole, setCommercialRole] = useState('free_lead_magnet');
  const [audience, setAudience] = useState('');
  const [language, setLanguage] = useState('English and Bangla');

  const load = useCallback(async () => {
    if (!org?.id || !supabase) return;
    setLoading(true);
    setError('');
    const queries = await Promise.all([
      supabase.from('specialist_departments').select('id,dept_key,dept_name,responsibilities,example_deliverables,is_active').eq('organization_id', org.id).order('dept_name'),
      supabase.from('skill_library').select('id,skill_name,dept_key,deliverable_type,description,implementation_ref,required_packages,is_verified,run_count,failure_count').eq('organization_id', org.id).order('skill_name'),
      supabase.from('deliverables_factory').select('id,title,dept_key,deliverable_type,status,asset_url,cost_usd,revenue_usd,verification_evidence,metadata,created_at').eq('organization_id', org.id).order('created_at', { ascending: false }).limit(100),
      supabase.from('research_sources').select('id,title,publisher,source_url,source_type,brand_key,accessed_at').eq('organization_id', org.id).limit(200),
      supabase.from('research_claims').select('id,evidence_status').eq('organization_id', org.id).limit(300),
      supabase.from('research_briefs').select('id,brand_key,title,review_status,evidence_gate').eq('organization_id', org.id).limit(200),
      supabase.from('content_items').select('id,brand_key,status,published_url,asset_url').eq('organization_id', org.id).limit(500),
      supabase.from('opportunity_signals').select('id,brand_key,status,signal_type').eq('organization_id', org.id).limit(300),
      supabase.from('ai_agents').select('id,status').eq('organization_id', org.id),
      supabase.from('ai_tool_connections').select('id,status').eq('organization_id', org.id),
      supabase.from('ai_agent_runs').select('id,status').eq('organization_id', org.id).limit(200),
      supabase.from('ai_orchestration_jobs').select('id,status').eq('organization_id', org.id).limit(200),
      supabase.from('ventures').select('id,name,slug,operating_mode,focus_areas').eq('organization_id', org.id).order('name'),
    ]);
    const failed = queries.find(result => result.error);
    if (failed) {
      setError(failed.error.message || 'The Digital Studio register could not be loaded.');
    } else {
      setDepartments(queries[0].data || []);
      setSkills(queries[1].data || []);
      setDeliverables(queries[2].data || []);
      setSources(queries[3].data || []);
      setClaims(queries[4].data || []);
      setBriefs(queries[5].data || []);
      setContent(queries[6].data || []);
      setSignals(queries[7].data || []);
      setAgents(queries[8].data || []);
      setTools(queries[9].data || []);
      setRuns(queries[10].data || []);
      setJobs(queries[11].data || []);
      setVentures(queries[12].data || []);
      setCheckedAt(new Date().toISOString());
    }
    setLoading(false);
  }, [org?.id, supabase]);

  useEffect(() => { load(); }, [load]);

  const stats = useMemo(() => ({
    activeDepartments: departments.filter(x => x.is_active).length,
    verifiedSkills: skills.filter(x => x.is_verified).length,
    readyAssets: deliverables.filter(x => ['Ready', 'Live', 'Settled'].includes(x.status)).length,
    withFiles: deliverables.filter(x => x.asset_url).length,
    researchVerified: claims.filter(x => x.evidence_status === 'verified').length,
    approvedBriefs: briefs.filter(x => ['approved', 'published'].includes(x.review_status)).length,
    currentContent: content.filter(x => x.brand_key !== 'historical-social-import').length,
    historicalImports: content.filter(x => x.brand_key === 'historical-social-import').length,
    publishedLinks: content.filter(x => x.published_url).length,
    connectedTools: tools.filter(x => ['active', 'connected'].includes(x.status)).length,
    configuredAgents: agents.filter(x => x.status === 'configured').length,
    testingAgents: agents.filter(x => x.status === 'testing').length,
    activeRuns: runs.filter(x => ['running', 'succeeded', 'completed'].includes(x.status)).length,
    completedJobs: jobs.filter(x => ['succeeded', 'completed'].includes(x.status)).length,
  }), [departments, skills, deliverables, claims, briefs, content, tools, agents, runs, jobs]);

  async function createDeliverable(event) {
    event.preventDefault();
    if (!org?.id || !title.trim()) return;
    setSaving(true);
    setError('');
    setNotice('');
    const venture = ventures.find(item => item.slug === entityKey);
    const badge = deliverableType === 'pdf' ? 'PDF' : deliverableType === 'digital_product' ? 'KIT' : deliverableType.toUpperCase().slice(0, 6);
    const isResearch = commercialRole === 'internal_research' || ['c3-lifestyle', 'bold-cotton'].includes(entityKey);
    const payload = {
      organization_id: org.id,
      venture_id: venture?.id || null,
      dept_key: deptKey || null,
      title: title.trim(),
      deliverable_type: deliverableType,
      icon_badge: badge,
      status: 'Processing',
      cost_usd: 0,
      revenue_usd: 0,
      verification_evidence: { status: 'not_verified', asset_created: false, publicly_published: false },
      metadata: {
        entity_key: entityKey,
        commercial_role: isResearch ? 'internal_research' : commercialRole,
        stage: 'scope_definition',
        audience: audience.trim() || 'To be defined',
        languages: language,
        execution_mode: isResearch ? 'RESEARCH_ONLY' : 'ACTIVE_BUILD',
        review_required: 'Human review before publication, sale or external delivery',
        asset_state: 'No file attached yet',
        note: 'Internal production record only. Not published, sold or delivered.',
      },
    };
    const { error: insertError } = await supabase.from('deliverables_factory').insert(payload);
    setSaving(false);
    if (insertError) {
      setError('The production record was not saved: ' + insertError.message);
      return;
    }
    setTitle('');
    setAudience('');
    setShowCreate(false);
    setNotice('Production record added. It remains in Processing until an asset is created and reviewed.');
    await load();
  }

  const testingTools = tools.filter(x => x.status === 'testing').length;
  const degradedTools = tools.filter(x => ['degraded', 'disconnected'].includes(x.status)).length;
  const pendingContent = content.filter(x => x.status === 'idea' || x.status === 'draft').length;

  return <section className="os-panel">
    <div className="os-panel-head">
      <div><h2>IA² Digital Studio</h2><p>Shared creative, research, technology and operating production for all four business divisions.</p></div>
      <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
        <span className="os-count">{departments.length} departments</span>
        <button type="button" className="os-refresh" onClick={load} disabled={loading}>{loading ? 'Checking…' : '↻ Refresh'}</button>
      </div>
    </div>

    <div className="os-attention"><div><b>Operating rule: one shared studio, entity-specific queues</b><small>Research → Brief → Create → Human QA → Founder / Advocate approval → Publish or deliver → Measure. Public publishing, paid activity, legal advice and external commitments remain approval-gated.</small></div></div>
    {error && <div className="os-error" role="alert">{error}</div>}
    {notice && <div className="os-alert success" role="status">{notice}</div>}
    {loading ? <div className="os-loading"><span className="os-spinner"/> Reading the live studio registers…</div> : <>
      <div className="os-metrics">
        <article className="os-metric"><span>ACTIVE DEPARTMENTS</span><strong>{stats.activeDepartments}/{departments.length}</strong><small>Configured specialist scopes</small></article>
        <article className="os-metric"><span>VERIFIED SKILLS</span><strong>{stats.verifiedSkills}/{skills.length}</strong><small>Only verified skills can be called operational</small></article>
        <article className="os-metric"><span>DELIVERABLES READY</span><strong>{stats.readyAssets}/{deliverables.length}</strong><small>{stats.withFiles} records have an attached asset</small></article>
        <article className="os-metric"><span>RESEARCH EVIDENCE</span><strong>{stats.researchVerified}/{claims.length}</strong><small>Verified claims in the evidence register</small></article>
        <article className="os-metric"><span>CONNECTED TOOLS</span><strong>{stats.connectedTools}/{tools.length}</strong><small>{testingTools} testing · {degradedTools} degraded / disconnected</small></article>
        <article className="os-metric"><span>AGENT EXECUTION</span><strong>{stats.activeRuns}</strong><small>{stats.configuredAgents} configured · {stats.testingAgents} testing · {stats.completedJobs} completed jobs</small></article>
      </div>

      <div className="os-section-head"><div><h2>Shared specialist departments</h2><p>Live department register from the central workspace database.</p></div><span className="os-count">{skills.length} skills · {stats.verifiedSkills} verified</span></div>
      <div className="os-venture-grid">
        {departments.map(dept => {
          const deptSkills = skills.filter(skill => skill.dept_key === dept.dept_key);
          const verified = deptSkills.filter(skill => skill.is_verified).length;
          return <article className="os-venture" key={dept.id}>
            <div className="os-venture-top"><span>{dept.dept_key}</span><span className={'os-chip ' + statusTone(dept.is_active ? 'active' : 'inactive')}>{dept.is_active ? 'Scope active' : 'Inactive'}</span></div>
            <h3>{dept.dept_name}</h3>
            <p>{dept.responsibilities}</p>
            <small>Outputs: {dept.example_deliverables || 'To be defined'}</small>
            <div className="os-attention"><div><b>{deptSkills.length} skills · {verified} verified</b><small>{deptSkills.length ? deptSkills.map(skill => skill.skill_name).join(' · ') : 'No skill implementation registered yet.'}</small></div></div>
          </article>;
        })}
      </div>

      <div className="os-section-head"><div><h2>Entity production queues</h2><p>Shared departments serve every division; execution priority remains controlled by the group plan.</p></div></div>
      <div className="os-venture-grid">
        {DIVISIONS.map(division => <article className="os-venture" key={division.id}>
          <div className="os-venture-top"><span>Priority {division.priority}</span><span className="os-chip">{division.queueLabel}</span></div>
          <h3>{division.name}</h3><p>{division.purpose}</p>
          <ul>{division.workstreams.map(work => <li key={work}>{work}</li>)}</ul>
          {division.id === 'ia2-holdings' && <small>Sub-streams: Venture Capital · Real Estate · Technology & AI · Group operations.</small>}
          {['c3-lifestyle', 'bold-cotton'].includes(division.id) && <div className="os-attention"><div><b>Research only · execution on hold</b><small>Continue trend, buyer and opportunity research. No public launch or production spend.</small></div></div>}
        </article>)}
      </div>

      <div className="os-section-head"><div><h2>Research and content continuity</h2><p>Research stays active even while selected ventures remain on execution hold.</p></div></div>
      <div className="os-metrics">
        <article className="os-metric"><span>RESEARCH SOURCES</span><strong>{sources.length}</strong><small>Registered sources</small></article>
        <article className="os-metric"><span>RESEARCH CLAIMS</span><strong>{claims.length}</strong><small>{stats.researchVerified} verified · {claims.length - stats.researchVerified} unverified</small></article>
        <article className="os-metric"><span>RESEARCH BRIEFS</span><strong>{briefs.length}</strong><small>{stats.approvedBriefs} approved · {briefs.length - stats.approvedBriefs} awaiting review</small></article>
        <article className="os-metric"><span>OPPORTUNITY SIGNALS</span><strong>{signals.length}</strong><small>Market and business signals</small></article>
        <article className="os-metric"><span>CONTENT PIPELINE</span><strong>{stats.currentContent}</strong><small>{pendingContent} idea / draft records</small></article>
        <article className="os-metric"><span>HISTORICAL IMPORT</span><strong>{stats.historicalImports}</strong><small>No external post URL recorded; not independently verified as published</small></article>
      </div>
      <div className="os-division-actions" style={{ marginBottom: 20 }}>
        <button className="os-chip-button" onClick={() => setActive('Content studio')}>Open Content Studio</button>
        <button className="os-chip-button" onClick={() => setActive('Opportunity Radar')}>Open Opportunity Radar</button>
        <button className="os-chip-button" onClick={() => setActive('AI Agents & Tools')}>Open Agent & Tool Registry</button>
      </div>

      <div className="os-section-head"><div><h2>Commercial product and service pipeline</h2><p>Initial production records are created. They are not sale-ready until the asset exists, quality checks pass and the required human review is complete.</p></div><button className="os-refresh" onClick={() => setShowCreate(value => !value)}>{showCreate ? 'Close form' : '+ Add deliverable'}</button></div>
      {showCreate && <form className="os-form-grid" onSubmit={createDeliverable}>
        <input value={title} onChange={event => setTitle(event.target.value)} placeholder="Deliverable or product title" required/>
        <select value={entityKey} onChange={event => setEntityKey(event.target.value)}>{ENTITY_OPTIONS.map(([value, text]) => <option key={value} value={value}>{text}</option>)}</select>
        <select value={deptKey} onChange={event => setDeptKey(event.target.value)}>{departments.map(dept => <option key={dept.dept_key} value={dept.dept_key}>{dept.dept_name}</option>)}</select>
        <select value={deliverableType} onChange={event => setDeliverableType(event.target.value)}>{DELIVERABLE_TYPES.map(value => <option key={value} value={value}>{label(value)}</option>)}</select>
        <select value={commercialRole} onChange={event => setCommercialRole(event.target.value)}>{COMMERCIAL_ROLES.map(([value, text]) => <option key={value} value={value}>{text}</option>)}</select>
        <input value={audience} onChange={event => setAudience(event.target.value)} placeholder="Target audience (optional)"/>
        <select value={language} onChange={event => setLanguage(event.target.value)}><option>English and Bangla</option><option>English</option><option>Bangla</option></select>
        <button disabled={saving || !title.trim()}>{saving ? 'Saving…' : 'Create internal production record'}</button>
      </form>}
      <div className="os-table-wrap">
        <table className="os-table"><thead><tr><th>Deliverable</th><th>Entity</th><th>Type / Department</th><th>Status</th><th>Asset</th><th>Revenue</th></tr></thead>
          <tbody>{deliverables.map(item => <tr key={item.id}>
            <td><b>{item.title}</b><small>{item.metadata?.note || item.metadata?.stage || 'Production record'}</small></td>
            <td>{ENTITY_OPTIONS.find(([key]) => key === item.metadata?.entity_key)?.[1] || 'IA² group'}</td>
            <td>{label(item.deliverable_type)}<small>{item.dept_key || 'Unassigned'}</small></td>
            <td><span className={'os-chip ' + statusTone(item.status)}>{item.status}</span></td>
            <td>{item.asset_url ? <a href={item.asset_url} target="_blank" rel="noreferrer">Open asset ↗</a> : 'Not attached'}</td>
            <td>{item.revenue_usd ? '$' + Number(item.revenue_usd).toFixed(2) : '$0.00'}</td>
          </tr>)}</tbody>
        </table>
        {!deliverables.length && <div className="os-empty">No deliverables registered yet. Add the first internal production record above.</div>}
      </div>

      <div className="os-attention"><div><b>Current operational truth</b><small>{stats.readyAssets} sale-ready deliverables; {stats.withFiles} files attached; {stats.verifiedSkills} verified skills; {stats.activeRuns} agent executions. The studio structure and database registers exist, but production automation and quality verification are not yet complete.</small></div></div>
      <div className="os-health-toolbar"><small>{checkedAt ? 'Last verified from database: ' + new Date(checkedAt).toLocaleString('en-GB') : 'Not yet checked'}</small><span className="os-count">{stats.publishedLinks} content records have an external URL</span></div>
    </>}
  </section>;
}
