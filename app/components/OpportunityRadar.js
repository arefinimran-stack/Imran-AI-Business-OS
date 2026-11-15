'use client';

import { useCallback, useEffect, useState } from 'react';

const BRANDS = [
  ['arefin-legal-corporate','Arefin Legal & Corporate'],
  ['imran-arefin','Imran Arefin'],
  ['arefin-avenue','Arefin Avenue'],
  ['ia2-holdings','IA² Holdings'],
  ['c3-lifestyle','C3 Lifestyle'],
  ['bold-cotton','Bold Cotton'],
];
const TYPES = ['legal_regulatory','market','audience','competitor','platform','cultural','commercial','operational'];
const STATUSES = ['discovered','triaged','approved','in_progress','converted','dismissed'];
const selectClass = 'os-radar-select';

function sourceHostname(value) {
  try { return new URL(value).hostname; } catch { return 'Open source'; }
}

export default function OpportunityRadar({ org, supabase }) {
  const [items,setItems] = useState([]);
  const [loading,setLoading] = useState(true);
  const [saving,setSaving] = useState(false);
  const [error,setError] = useState('');
  const [notice,setNotice] = useState('');
  const [brand,setBrand] = useState(BRANDS[0][0]);
  const [type,setType] = useState('market');
  const [title,setTitle] = useState('');
  const [summary,setSummary] = useState('');
  const [evidence,setEvidence] = useState('');
  const [hypothesis,setHypothesis] = useState('');
  const [sources,setSources] = useState('');
  const [quality,setQuality] = useState('preliminary');
  const [confidence,setConfidence] = useState('unassessed');
  const [potential,setPotential] = useState('unassessed');
  const [effort,setEffort] = useState('unassessed');
  const [action,setAction] = useState('');
  const [statusFilter,setStatusFilter] = useState('all');
  const [brandFilter,setBrandFilter] = useState('all');

  const load = useCallback(async () => {
    if (!org?.id) return;
    setLoading(true); setError('');
    const { data, error: queryError } = await supabase.from('opportunity_signals')
      .select('id,brand_key,signal_type,title,summary,evidence_summary,hypothesis,source_urls,evidence_quality,confidence,commercial_potential,estimated_effort,recommended_action,status,due_at,created_at')
      .eq('organization_id',org.id).order('created_at',{ascending:false}).limit(250);
    if (queryError) setError(queryError.message); else setItems(data || []);
    setLoading(false);
  },[org?.id,supabase]);

  useEffect(()=>{load();},[load]);

  async function createSignal(event) {
    event.preventDefault();
    if (!org?.id || !title.trim()) return;
    setSaving(true); setError(''); setNotice('');
    const sourceUrls = sources.split(/\n|,/).map(x=>x.trim()).filter(Boolean);
    const invalid = sourceUrls.find(x=>{try { const u=new URL(x); return !['http:','https:'].includes(u.protocol); } catch { return true; }});
    if (invalid) { setSaving(false); setError('Each source must be a valid http or https URL.'); return; }
    const { error: insertError } = await supabase.from('opportunity_signals').insert({
      organization_id:org.id, brand_key:brand, signal_type:type, title:title.trim(),
      summary:summary.trim()||null, evidence_summary:evidence.trim()||null,
      hypothesis:hypothesis.trim()||null, source_urls:sourceUrls,
      evidence_quality:quality, confidence, commercial_potential:potential,
      estimated_effort:effort, recommended_action:action.trim()||null, status:'discovered'
    });
    setSaving(false);
    if (insertError) {setError(insertError.message);return;}
    setTitle('');setSummary('');setEvidence('');setHypothesis('');setSources('');setAction('');
    setNotice('Signal saved. It remains discovered until reviewed.'); await load();
  }

  async function changeStatus(item,next) {
    const {error:updateError}=await supabase.from('opportunity_signals')
      .update({status:next}).eq('id',item.id).eq('organization_id',org.id);
    if(updateError){setError(updateError.message);return;}
    setItems(current=>current.map(x=>x.id===item.id?{...x,status:next}:x));
    setNotice('Signal status updated.');
  }

  async function convertToBusinessDevelopment(item) {
    if (item.status !== 'approved' || !org?.id) return;
    setError(''); setNotice('');
    const marker = '[Radar signal: ' + item.id + ']';
    const { data: existing, error: lookupError } = await supabase.from('business_opportunities')
      .select('id').eq('organization_id', org.id).ilike('notes', '%' + marker + '%').limit(1);
    if (lookupError) { setError(lookupError.message); return; }
    if (!existing?.length) {
      const ventureByBrand = {
        'arefin-legal-corporate': '351a6cda-ab10-4147-a46a-ea021fdfe644',
        'ia2-holdings': '958deedc-1a85-4147-9f6d-b53f427b04f1',
        'c3-lifestyle': 'd5ac75fc-4472-4959-a542-dad7c998e548',
        'bold-cotton': '26e76c6f-e12c-4b1b-a704-220c9151bdb7'
      };
      const notes = [
        marker,
        'Origin: Opportunity Radar',
        'Division: ' + label(item.brand_key),
        'Signal type: ' + item.signal_type,
        'Evidence quality: ' + item.evidence_quality,
        'Evidence: ' + (item.evidence_summary || 'Not supplied'),
        'Hypothesis: ' + (item.hypothesis || 'Not supplied'),
        'Sources: ' + ((item.source_urls || []).join(', ') || 'Not supplied'),
        'Recommended action: ' + (item.recommended_action || 'Review and qualify manually')
      ].join('\n');
      const { error: insertError } = await supabase.from('business_opportunities').insert({
        organization_id: org.id,
        title: item.title,
        stage: 'new',
        currency: 'BDT',
        venture_id: ventureByBrand[item.brand_key] || null,
        notes
      });
      if (insertError) { setError(insertError.message); return; }
    }
    const { error: updateError } = await supabase.from('opportunity_signals')
      .update({ status: 'converted' }).eq('id', item.id).eq('organization_id', org.id);
    if (updateError) {
      setError('Business Development record created or already present, but Radar status update failed. Refresh and retry safely.');
      return;
    }
    setItems(current => current.map(x => x.id === item.id ? { ...x, status: 'converted' } : x));
    setNotice(existing?.length ? 'Existing Business Development record linked; signal marked converted.' : 'Approved signal converted into a new Business Development opportunity.');
  }

  const visible=items.filter(x=>(statusFilter==='all'||x.status===statusFilter)&&(brandFilter==='all'||x.brand_key===brandFilter));
  const counts=STATUSES.map(s=>({status:s,count:items.filter(x=>x.status===s).length}));
  const label=(key)=>BRANDS.find(x=>x[0]===key)?.[1]||key;

  return <section className="os-panel">
    <div className="os-panel-head"><div><h2>Opportunity Radar</h2><p>Capture market, legal, audience and platform signals. Evidence is separated from interpretation and hypotheses.</p></div><span className="os-count">{items.length} signals</span></div>
    {error&&<div className="os-alert error">{error}</div>}
    {notice&&<div className="os-alert success">{notice}</div>}
    <div className="os-finance-summary">{counts.map(x=><article key={x.status}><small>{x.status.replaceAll('_',' ').toUpperCase()}</small><b>{x.count}</b></article>)}</div>
    <div className="os-attention"><div><b>Evidence rule</b><small>A source link is not automatic verification. Record what the source establishes, keep hypotheses separate, and review before acting. A signal is not a qualified client lead or revenue forecast.</small></div></div>
    <form className="os-form-grid" onSubmit={createSignal}>
      <h3>Capture a new signal</h3>
      <select value={brand} onChange={e=>setBrand(e.target.value)}>{BRANDS.map(x=><option key={x[0]} value={x[0]}>{x[1]}</option>)}</select>
      <select value={type} onChange={e=>setType(e.target.value)}>{TYPES.map(x=><option key={x} value={x}>{x.replaceAll('_',' ')}</option>)}</select>
      <input value={title} onChange={e=>setTitle(e.target.value)} placeholder="Signal title" required/>
      <textarea value={summary} onChange={e=>setSummary(e.target.value)} placeholder="Concise signal summary" rows={2}/>
      <textarea value={evidence} onChange={e=>setEvidence(e.target.value)} placeholder="What the evidence actually establishes (facts only)" rows={3}/>
      <textarea value={hypothesis} onChange={e=>setHypothesis(e.target.value)} placeholder="Interpretation / hypothesis (keep separate from facts)" rows={2}/>
      <textarea value={sources} onChange={e=>setSources(e.target.value)} placeholder="Source URLs — one per line" rows={2}/>
      <select value={quality} onChange={e=>setQuality(e.target.value)}>{['verified','corroborated','preliminary','hypothesis'].map(x=><option key={x}>{x}</option>)}</select>
      <select value={confidence} onChange={e=>setConfidence(e.target.value)}>{['unassessed','high','medium','low'].map(x=><option key={x}>{x}</option>)}</select>
      <select value={potential} onChange={e=>setPotential(e.target.value)}>{['unassessed','high','medium','low'].map(x=><option key={x}>{x}</option>)}</select>
      <select value={effort} onChange={e=>setEffort(e.target.value)}>{['unassessed','low','medium','high'].map(x=><option key={x}>{x}</option>)}</select>
      <textarea value={action} onChange={e=>setAction(e.target.value)} placeholder="Recommended next action" rows={2}/>
      <button disabled={saving}>{saving?'Saving…':'Add signal to Radar'}</button>
    </form>
    <div className="os-content-filters">
      <select className={selectClass} value={brandFilter} onChange={e=>setBrandFilter(e.target.value)}><option value="all">All divisions</option>{BRANDS.map(x=><option key={x[0]} value={x[0]}>{x[1]}</option>)}</select>
      <select className={selectClass} value={statusFilter} onChange={e=>setStatusFilter(e.target.value)}><option value="all">All stages</option>{STATUSES.map(x=><option key={x}>{x.replaceAll('_',' ')}</option>)}</select>
      <button type="button" className="os-chip-button" onClick={load}>Refresh signals</button>
    </div>
    {loading?<div className="os-loading">Loading opportunity signals…</div>:<div className="os-venture-grid">
      {visible.map(item=><article className="os-venture" key={item.id}>
        <div className="os-venture-top"><span>{label(item.brand_key)}</span><span className="os-chip">{item.status.replaceAll('_',' ')}</span></div>
        <h3>{item.title}</h3><p>{item.summary||'No summary supplied.'}</p>
        {item.evidence_summary&&<p><b>Evidence:</b> {item.evidence_summary}</p>}
        {item.hypothesis&&<p><b>Hypothesis:</b> {item.hypothesis}</p>}
        <small>{item.signal_type.replaceAll('_',' ')} · Evidence: {item.evidence_quality} · Confidence: {item.confidence}</small>
        <small>Commercial potential: {item.commercial_potential} · Effort: {item.estimated_effort}</small>
        {item.recommended_action&&<p><b>Next action:</b> {item.recommended_action}</p>}
        {!!item.source_urls?.length&&<div className="os-radar-sources"><b>Sources</b>{item.source_urls.map((url,i)=><a key={url+i} href={url} target="_blank" rel="noreferrer">{sourceHostname(url)}</a>)}</div>}
        {item.status === 'approved' && <button type="button" className="os-chip-button" onClick={()=>convertToBusinessDevelopment(item)}>Convert to Business Development</button>}<label className="os-radar-status">Workflow stage<select value={item.status} onChange={e=>changeStatus(item,e.target.value)}>{STATUSES.filter(s=>s!=='converted').map(s=><option key={s} value={s}>{s.replaceAll('_',' ')}</option>)}{item.status==='converted'&&<option value="converted">converted</option>}</select></label>
      </article>)}
      {!visible.length&&<div className="os-empty">No signals match these filters. Capture the first signal above.</div>}
    </div>}
  </section>;
}
