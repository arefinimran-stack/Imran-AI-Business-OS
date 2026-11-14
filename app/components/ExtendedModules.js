'use client';

import { useCallback, useEffect, useState } from 'react';

const money = (amount, currency) => new Intl.NumberFormat('en-BD', { style: 'currency', currency: currency === 'Other' ? 'BDT' : currency, maximumFractionDigits: 2 }).format(Number(amount || 0));
const dateText = value => value ? new Date(value).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : '—';
const dateTimeText = value => value ? new Date(value).toLocaleString('en-GB', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' }) : '—';

const BRAND_OPTIONS = [
  { key: 'arefin-legal-corporate', label: 'Arefin Legal & Corporate' },
  { key: 'imran-arefin', label: 'Imran Arefin' },
  { key: 'arefin-avenue', label: 'Arefin Avenue' },
  { key: 'ia2-holdings', label: 'IA² Holdings' },
  { key: 'c3-lifestyle', label: 'C3 Lifestyle' },
  { key: 'bold-cotton', label: 'Bold Cotton' },
];
const PLATFORM_OPTIONS = ['facebook', 'instagram', 'youtube', 'linkedin'];
const CONTENT_FORMATS = ['Short video', 'Documentary short', 'Long video', 'Podcast / interview', 'Photo essay', 'Post', 'Article', 'Newsletter', 'Carousel', 'Infographic', 'FAQ / Q&A', 'Product demonstration', 'Live', 'Document'];
const GENRES = {
  'arefin-legal-corporate': ['Judgment brief', 'Statute explainer', 'Legal myth check', 'Procedure guide', 'Regulatory update', 'Corporate governance note', 'Legal history', 'Research analysis', 'Public-interest Q&A', 'Legal glossary'],
  'imran-arefin': ['Founder field note', 'Advocacy craft', 'Leadership essay', 'Learning brief', 'Public-interest commentary', 'Behind-the-work documentary', 'Book / report response', 'Interview'],
  'arefin-avenue': ['Destination field guide', 'Mini-documentary', 'Local voices interview', 'Heritage explainer', 'Food and craft story', 'Travel diary', 'Itinerary comparison', 'Seasonal travel brief', 'Photo essay', 'Responsible travel guide'],
  'ia2-holdings': ['Boardroom brief', 'SME operating playbook', 'Market pulse', 'Business model analysis', 'Capital discipline', 'Governance explainer', 'Sector map', 'Operator interview', 'Scenario analysis', 'Quarterly outlook'],
  'c3-lifestyle': ['Curated edit', 'How-it-works explainer', 'Everyday ritual', 'Design note', 'Comparison guide', 'Local maker story', 'Seasonal living guide', 'Consumer myth check', 'Editorial moodboard', 'Product review'],
  'bold-cotton': ['Fabric school', 'Texture macro', 'Fit and silhouette guide', 'Styling edit', 'Garment care guide', 'Product detail film', 'Collection story', 'Behind the garment', 'Material comparison', 'Customer FAQ', 'Seasonal capsule']
};
const PILLARS = {
  'arefin-legal-corporate': ['Legal literacy', 'Judgment analysis', 'Legislative updates', 'Procedure and rights', 'Corporate governance'],
  'imran-arefin': ['Founder thought leadership', 'Advocacy craft', 'Leadership and execution', 'Public-interest commentary'],
  'arefin-avenue': ['Culture and travel storytelling', 'People and places', 'Documentary features', 'Culture and society'],
  'ia2-holdings': ['Business governance', 'Business fundamentals', 'Group strategy', 'Entrepreneurship and market education'],
  'c3-lifestyle': ['Lifestyle education', 'Lifestyle curation', 'Everyday design', 'Brand stories'],
  'bold-cotton': ['Product education', 'Fabric and fit', 'Product care and utility', 'Collection stories'],
};

export default function ExtendedModules({ active, org, supabase }) {
  const [rows, setRows] = useState([]);
  const [ventures, setVentures] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState('normal');
  const [stage, setStage] = useState('new');
  const [value, setValue] = useState('');
  const [currency, setCurrency] = useState('BDT');
  const [entryType, setEntryType] = useState('income');
  const [category, setCategory] = useState('');
  const [platforms, setPlatforms] = useState(['facebook', 'youtube']);
  const [format, setFormat] = useState('Short video');
  const [genre, setGenre] = useState('Judgment brief');
  const [audienceSegment, setAudienceSegment] = useState('');
  const [editorialAngle, setEditorialAngle] = useState('');
  const [researchStatus, setResearchStatus] = useState('needs_research');
  const [sourceNotes, setSourceNotes] = useState('');
  const [visualDirection, setVisualDirection] = useState('');
  const [platformAdaptations, setPlatformAdaptations] = useState('');
  const [factCheckNotes, setFactCheckNotes] = useState('');
  const [scheduledAt, setScheduledAt] = useState('');
  const [publishedUrl, setPublishedUrl] = useState('');
  const [brandKey, setBrandKey] = useState('arefin-legal-corporate');
  const [pillar, setPillar] = useState('Legal literacy');
  const [language, setLanguage] = useState('Bangla');
  const [brandFilter, setBrandFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [search, setSearch] = useState('');

  const config = {
    Projects: { table: 'projects', select: 'id,name,description,status,priority,target_date,created_at', order: 'created_at' },
    'Business development': { table: 'business_opportunities', select: 'id,title,stage,estimated_value,currency,next_follow_up_at,notes,created_at', order: 'next_follow_up_at' },
    Finance: { table: 'finance_entries', select: 'id,entry_type,description,amount,currency,category,transaction_date,status,created_at', order: 'transaction_date' },
    'Content studio': { table: 'content_items', select: 'id,title,platforms,format,status,scheduled_at,script,published_url,reach,engagement,leads,revenue,currency,created_at,brand_key,venture_id,content_pillar,language,review_status,source_platform,external_post_id,external_permalink,thumbnail_url,published_at,source_notes,metadata', order: 'created_at' },
  }[active];

  const load = useCallback(async () => {
    if (!org || !config) return;
    setLoading(true); setError('');
    if (active === 'Content studio') {
      const [contentResult, ventureResult] = await Promise.all([
        supabase.from('content_items').select(config.select).eq('organization_id', org.id).order('created_at', { ascending: false }).limit(250),
        supabase.from('ventures').select('id,name,slug').eq('organization_id', org.id).order('name'),
      ]);
      if (contentResult.error) setError(contentResult.error.message);
      else setRows(contentResult.data || []);
      if (ventureResult.error) setError(ventureResult.error.message);
      else setVentures(ventureResult.data || []);
    } else {
      const { data, error: queryError } = await supabase.from(config.table).select(config.select).eq('organization_id', org.id).order(config.order, { ascending: false, nullsFirst: false }).limit(100);
      if (queryError) setError(queryError.message);
      else setRows(data || []);
    }
    setLoading(false);
  }, [org, supabase, active, config?.table, config?.select, config?.order]);

  useEffect(() => { load(); }, [load]);

  useEffect(() => {
    const choices = PILLARS[brandKey] || [];
    if (choices.length && !choices.includes(pillar)) setPillar(choices[0]);
    const genreChoices = GENRES[brandKey] || [];
    if (genreChoices.length && !genreChoices.includes(genre)) setGenre(genreChoices[0]);
  }, [brandKey, pillar, genre]);

  function togglePlatform(platform) {
    setPlatforms(current => current.includes(platform) ? current.filter(item => item !== platform) : [...current, platform]);
  }

  async function save(event) {
    event.preventDefault(); if (!org) return;
    setSaving(true); setError(''); setNotice('');
    let payload;
    if (active === 'Projects') payload = { organization_id: org.id, name: name.trim(), description: description.trim() || null, priority, status: 'planning' };
    if (active === 'Business development') payload = { organization_id: org.id, title: name.trim(), stage, estimated_value: value ? Number(value) : null, currency, notes: description.trim() || null };
    if (active === 'Finance') payload = { organization_id: org.id, entry_type: entryType, description: name.trim(), amount: Number(value), currency, category: category.trim() || null, status: 'confirmed' };
    if (active === 'Content studio') {
      const venture = ventures.find(v => v.slug === brandKey);
      payload = {
        organization_id: org.id,
        venture_id: venture?.id || null,
        title: name.trim(),
        brand_key: brandKey,
        content_pillar: pillar,
        language,
        platforms,
        format: format.toLowerCase().replaceAll(' ', '_'),
        status: 'idea',
        review_status: 'pending',
        script: description.trim() || null,
        source_notes: sourceNotes.trim() || null,
        scheduled_at: scheduledAt ? new Date(scheduledAt).toISOString() : null,
        published_url: publishedUrl.trim() || null,
        campaign: 'editorial-calendar',
        metadata: { genre, audience_segment: audienceSegment.trim() || null, editorial_angle: editorialAngle.trim() || null, research_status: researchStatus, visual_direction: visualDirection.trim() || null, platform_adaptations: platformAdaptations.trim() || null, fact_check_notes: factCheckNotes.trim() || null, editorial_standard: 'premium_evidence_led', author_name: 'Imran Arefin' },
        
      };
    }
    const { error: insertError } = await supabase.from(config.table).insert(payload);
    setSaving(false);
    if (insertError) { setError(insertError.message); return; }
    setName(''); setDescription(''); setValue(''); setCategory(''); setScheduledAt(''); setPublishedUrl(''); setAudienceSegment(''); setEditorialAngle(''); setResearchStatus('needs_research'); setSourceNotes(''); setVisualDirection(''); setPlatformAdaptations(''); setFactCheckNotes('');
    setNotice(active === 'Content studio' ? 'Content idea saved to the central editorial calendar.' : active + ' record saved.');
    await load();
  }

  async function updateRow(row, field, nextValue) {
    if (active === 'Content studio') {
      if (field === 'status' && nextValue === 'scheduled' && row.review_status !== 'approved') {
        setError('Approve this content item before adding it to the publishing calendar.'); return;
      }
      if (field === 'status' && nextValue === 'published' && !(row.external_permalink || row.published_url)) {
        setError('A live post URL is required before this record can be marked published.'); return;
      }
    }
    const { error: updateError } = await supabase.from(config.table).update({ [field]: nextValue }).eq('id', row.id).eq('organization_id', org.id);
    if (updateError) { setError(updateError.message); return; }
    setRows(current => current.map(item => item.id === row.id ? { ...item, [field]: nextValue } : item));
    setError('');
    setNotice('Record updated.');
  }

  async function approveContent(row) {
    const { data: authData, error: authError } = await supabase.auth.getUser();
    if (authError || !authData?.user) { setError('Sign in again before approving content.'); return; }
    const patch = { review_status: 'approved', approved_at: new Date().toISOString(), approved_by: authData.user.id };
    const { error: updateError } = await supabase.from('content_items').update(patch).eq('id', row.id).eq('organization_id', org.id);
    if (updateError) { setError(updateError.message); return; }
    setRows(current => current.map(item => item.id === row.id ? { ...item, ...patch } : item));
    setNotice('Editorial review recorded. Scheduling still requires an explicit publishing action in the connected provider.');
  }

  if (!config) return null;
  const title = active === 'Projects' ? 'Projects & delivery' : active === 'Business development' ? 'Business development pipeline' : active === 'Finance' ? 'Finance register' : 'Central content operations';
  const sub = active === 'Projects' ? 'Objectives, milestones and execution status.' : active === 'Business development' ? 'Opportunities, proposals and follow-up.' : active === 'Finance' ? 'Income and expense records. Only verified figures belong here.' : 'One editorial desk across every division, with brand-specific genres, review gates, scheduling plans and a historical social archive.';
  const income = rows.filter(r => r.entry_type === 'income' && r.status !== 'void' && r.currency === currency).reduce((s,r)=>s+Number(r.amount||0),0);
  const expense = rows.filter(r => r.entry_type === 'expense' && r.status !== 'void' && r.currency === currency).reduce((s,r)=>s+Number(r.amount||0),0);
  const visibleRows = active === 'Content studio' ? rows.filter(r => {
    const matchesBrand = brandFilter === 'all' || r.brand_key === brandFilter;
    const matchesStatus = statusFilter === 'all' || r.status === statusFilter;
    const q = search.trim().toLowerCase();
    const matchesSearch = !q || [r.title,r.script,r.content_pillar,r.external_permalink,r.source_platform].some(v => String(v || '').toLowerCase().includes(q));
    return matchesBrand && matchesStatus && matchesSearch;
  }) : rows;
  const archiveCount = rows.filter(r => r.brand_key === 'historical-social-import').length;
  const ideaCount = rows.filter(r => r.status === 'idea').length;
  const pendingReviewCount = rows.filter(r => r.review_status === 'pending').length;
  const brandCounts = BRAND_OPTIONS.map(b => ({ ...b, count: rows.filter(r => r.brand_key === b.key).length }));

  return <section className="os-panel">
    <div className="os-panel-head"><div><h2>{title}</h2><p>{sub}</p></div><span className="os-count">{rows.length} records</span></div>
    {error && <div className="os-alert error">{error}</div>}
    {notice && <div className="os-alert success">{notice}</div>}
    {active === 'Finance' && <div className="os-finance-summary"><article><small>RECORDED INCOME · {currency}</small><b>{money(income,currency)}</b></article><article><small>RECORDED EXPENSE · {currency}</small><b>{money(expense,currency)}</b></article><article><small>NET · {currency} ONLY</small><b>{money(income-expense,currency)}</b></article></div>}
    {active === 'Content studio' && <>
      <div className="os-finance-summary">
        <article><small>HISTORICAL SOCIAL ARCHIVE</small><b>{archiveCount}</b></article>
        <article><small>EDITORIAL IDEAS</small><b>{ideaCount}</b></article>
        <article><small>AWAITING REVIEW</small><b>{pendingReviewCount}</b></article>
      </div>
      <div className="os-venture-grid">
        {brandCounts.map(b => <article className="os-venture" key={b.key}><div className="os-venture-top"><span>Editorial scope</span><span className="os-chip">{b.count} items</span></div><h3>{b.label}</h3><p>{(PILLARS[b.key] || []).join(' · ')}</p></article>)}
      </div>
      <div className="os-attention"><div><b>Publishing connection status</b><small>Upload-Post is connected in ChatGPT. The deployed app still needs its own server-side provider credential before it can publish or schedule directly. Calendar records and approval controls below are live in Supabase; no public post is sent from this screen.</small></div></div>
    </>}
    <form className="os-form-grid os-extended-form" onSubmit={save}>
      <input value={name} onChange={e=>setName(e.target.value)} placeholder={active === 'Projects' ? 'Project name' : active === 'Business development' ? 'Opportunity title' : active === 'Finance' ? 'Transaction description' : 'Content title / topic'} required/>
      {active === 'Projects' && <select value={priority} onChange={e=>setPriority(e.target.value)}><option value="normal">Normal priority</option><option value="high">High priority</option><option value="urgent">Urgent priority</option><option value="low">Low priority</option></select>}
      {active === 'Business development' && <><select value={stage} onChange={e=>setStage(e.target.value)}><option value="new">New</option><option value="qualified">Qualified</option><option value="proposal">Proposal</option><option value="negotiation">Negotiation</option><option value="won">Won</option><option value="lost">Lost</option></select><input type="number" min="0" step="0.01" value={value} onChange={e=>setValue(e.target.value)} placeholder="Estimated value (optional)"/><select value={currency} onChange={e=>setCurrency(e.target.value)}><option>BDT</option><option>USD</option><option>GBP</option><option>EUR</option><option>Other</option></select></>}
      {active === 'Finance' && <><select value={entryType} onChange={e=>setEntryType(e.target.value)}><option value="income">Income</option><option value="expense">Expense</option></select><input type="number" min="0.01" step="0.01" value={value} onChange={e=>setValue(e.target.value)} placeholder="Amount" required/><select value={currency} onChange={e=>setCurrency(e.target.value)}><option>BDT</option><option>USD</option><option>GBP</option><option>EUR</option><option>Other</option></select><input value={category} onChange={e=>setCategory(e.target.value)} placeholder="Category (optional)"/></>}
      {active === 'Content studio' && <>
        <select value={brandKey} onChange={e=>setBrandKey(e.target.value)}>{BRAND_OPTIONS.map(b=><option key={b.key} value={b.key}>{b.label}</option>)}</select>
        <select value={pillar} onChange={e=>setPillar(e.target.value)}>{(PILLARS[brandKey] || []).map(p=><option key={p}>{p}</option>)}</select>
        <select value={genre} onChange={e=>setGenre(e.target.value)}>{(GENRES[brandKey] || []).map(g=><option key={g}>{g}</option>)}</select>
        <input value={audienceSegment} onChange={e=>setAudienceSegment(e.target.value)} placeholder="Intended audience segment (optional)"/>
        <input value={editorialAngle} onChange={e=>setEditorialAngle(e.target.value)} placeholder="Editorial angle / central question (optional)"/>
        <select value={researchStatus} onChange={e=>setResearchStatus(e.target.value)}><option value="needs_research">Needs research</option><option value="research_in_progress">Research in progress</option><option value="evidence_ready">Evidence ready</option><option value="fact_checked">Fact-checked</option></select>
        <textarea value={sourceNotes} onChange={e=>setSourceNotes(e.target.value)} placeholder="Research sources, URLs and evidence notes…" rows={2}/>
        <textarea value={factCheckNotes} onChange={e=>setFactCheckNotes(e.target.value)} placeholder="Fact-check notes: claim, evidence, date checked, unresolved caveats…" rows={2}/>
        <textarea value={visualDirection} onChange={e=>setVisualDirection(e.target.value)} placeholder="Creative direction: composition, imagery, typography, colour and visual treatment…" rows={2}/>
        <textarea value={platformAdaptations} onChange={e=>setPlatformAdaptations(e.target.value)} placeholder="Platform adaptations: hook, caption, CTA, length and format changes per channel…" rows={2}/>
        <select value={language} onChange={e=>setLanguage(e.target.value)}><option>Bangla</option><option>English</option><option>Bangla + English</option></select>
        <div className="os-platform-picks">{PLATFORM_OPTIONS.map(p=><label key={p}><input type="checkbox" checked={platforms.includes(p)} onChange={()=>togglePlatform(p)}/>{p}</label>)}</div>
        <select value={format} onChange={e=>setFormat(e.target.value)}>{CONTENT_FORMATS.map(f=><option key={f}>{f}</option>)}</select>
        <input type="datetime-local" value={scheduledAt} onChange={e=>setScheduledAt(e.target.value)} aria-label="Planned publish date and time (optional)"/>
        <input type="url" value={publishedUrl} onChange={e=>setPublishedUrl(e.target.value)} placeholder="Source / published URL (optional)"/>
      </>}
      {active !== 'Finance' && <textarea value={description} onChange={e=>setDescription(e.target.value)} placeholder={active === 'Content studio' ? 'Research brief, draft script, sources and production notes…' : 'Description / notes (optional)'} rows={2}/>}
      <button disabled={saving || (active === 'Content studio' && platforms.length === 0)}>{saving ? 'Saving…' : 'Add ' + (active === 'Content studio' ? 'editorial item' : active === 'Finance' ? 'transaction' : active === 'Business development' ? 'opportunity' : 'project')}</button>
    </form>
    {loading ? <div className="os-loading">Loading live records…</div> : <>
      {active === 'Content studio' && <div className="os-content-filters">
        <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search title, brief, source…"/>
        <select value={brandFilter} onChange={e=>setBrandFilter(e.target.value)}><option value="all">All brands</option>{BRAND_OPTIONS.map(b=><option key={b.key} value={b.key}>{b.label}</option>)}<option value="historical-social-import">Historical archive</option></select>
        <select value={statusFilter} onChange={e=>setStatusFilter(e.target.value)}><option value="all">All statuses</option>{['idea','draft','review','approved','scheduled','published','archived'].map(s=><option key={s}>{s}</option>)}</select>
      </div>}
      {active === 'Projects' && <div className="os-table-wrap"><table className="os-table"><thead><tr><th>Project</th><th>Priority</th><th>Status</th><th>Target date</th></tr></thead><tbody>{rows.map(r=><tr key={r.id}><td><b>{r.name}</b><small>{r.description || ''}</small></td><td>{r.priority}</td><td><select value={r.status} onChange={e=>updateRow(r,'status',e.target.value)}><option value="planning">Planning</option><option value="active">Active</option><option value="on_hold">On hold</option><option value="completed">Completed</option><option value="archived">Archived</option></select></td><td>{dateText(r.target_date)}</td></tr>)}</tbody></table>{!rows.length && <Empty text="No projects yet. Add the first project above."/>}</div>}
      {active === 'Business development' && <div className="os-table-wrap"><table className="os-table"><thead><tr><th>Opportunity</th><th>Stage</th><th>Estimated value</th><th>Next follow-up</th></tr></thead><tbody>{rows.map(r=><tr key={r.id}><td><b>{r.title}</b><small>{r.notes || ''}</small></td><td><select value={r.stage} onChange={e=>updateRow(r,'stage',e.target.value)}><option value="new">New</option><option value="qualified">Qualified</option><option value="proposal">Proposal</option><option value="negotiation">Negotiation</option><option value="won">Won</option><option value="lost">Lost</option></select></td><td>{r.estimated_value == null ? '—' : money(r.estimated_value,r.currency)}</td><td>{dateText(r.next_follow_up_at)}</td></tr>)}</tbody></table>{!rows.length && <Empty text="No opportunities yet. Add a lead or opportunity above."/>}</div>}
      {active === 'Finance' && <div className="os-table-wrap"><table className="os-table"><thead><tr><th>Date</th><th>Type</th><th>Description</th><th>Category</th><th>Amount</th><th>Status</th></tr></thead><tbody>{rows.map(r=><tr key={r.id}><td>{dateText(r.transaction_date)}</td><td><span className="os-chip">{r.entry_type}</span></td><td><b>{r.description}</b></td><td>{r.category || '—'}</td><td>{money(r.amount,r.currency)}</td><td>{r.status}</td></tr>)}</tbody></table>{!rows.length && <Empty text="No finance entries yet. Add verified income or expense records above."/>}</div>}
      {active === 'Content studio' && <div className="os-table-wrap"><table className="os-table"><thead><tr><th>Editorial item</th><th>Brand / genre</th><th>Channels</th><th>Review</th><th>Workflow</th><th>Schedule / published</th><th>Action</th></tr></thead><tbody>{visibleRows.map(r=><tr key={r.id}>
        <td><b>{r.title}</b><small>{r.script || ''}</small>{r.source_platform && <small>Imported from {r.source_platform} · {r.external_post_id}</small>}</td>
        <td><b>{BRAND_OPTIONS.find(b=>b.key===r.brand_key)?.label || (r.brand_key === 'historical-social-import' ? 'Historical archive' : r.brand_key)}</b><small>{r.content_pillar || '—'} · {r.metadata?.genre || 'Genre not set'}</small><small>{r.metadata?.audience_segment || 'Audience not set'} · {r.metadata?.research_status || 'Research status not set'}</small>{r.metadata?.editorial_angle && <small>Angle: {r.metadata.editorial_angle}</small>}{r.source_notes && <small>Sources: {r.source_notes}</small>}{r.metadata?.fact_check_notes && <small>Fact-check: {r.metadata.fact_check_notes}</small>}{r.metadata?.visual_direction && <small>Visual: {r.metadata.visual_direction}</small>}{r.metadata?.platform_adaptations && <small>Adaptations: {r.metadata.platform_adaptations}</small>}</td>
        <td>{(r.platforms || []).join(', ') || '—'}</td>
        <td><span className="os-chip">{r.review_status || '—'}</span></td>
        <td><select value={r.status} onChange={e=>updateRow(r,'status',e.target.value)}><option value="idea">Idea</option><option value="draft">Draft</option><option value="review">Review</option><option value="approved">Approved</option><option value="scheduled">Calendar planned</option><option value="published">Published</option><option value="archived">Archived</option></select></td>
        <td>{r.scheduled_at ? dateTimeText(r.scheduled_at) : dateText(r.published_at)}{(r.external_permalink || r.published_url) && <small><a href={r.external_permalink || r.published_url} target="_blank" rel="noreferrer">Open original post</a></small>}</td>
        <td>{r.review_status === 'pending' && <button type="button" className="os-chip-button" onClick={()=>approveContent(r)}>Approve</button>}{r.status === 'scheduled' && <small>Calendar plan only — provider scheduling is separate.</small>}</td>
      </tr>)}</tbody></table>{!visibleRows.length && <Empty text="No matching content records. Change the filters or add a new editorial item above."/>}</div>}
    </>}
  </section>;
}

function Empty({ text }) { return <div className="os-empty">{text}</div>; }
