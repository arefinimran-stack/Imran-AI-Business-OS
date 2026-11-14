'use client';

import { useCallback, useEffect, useState } from 'react';

const money = (amount, currency) => new Intl.NumberFormat('en-BD', { style: 'currency', currency: currency === 'Other' ? 'BDT' : currency, maximumFractionDigits: 2 }).format(Number(amount || 0));
const dateText = value => value ? new Date(value).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : '—';

export default function ExtendedModules({ active, org, supabase }) {
  const [rows, setRows] = useState([]);
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
  const [platforms, setPlatforms] = useState('Facebook, YouTube');
  const [format, setFormat] = useState('Short video');

  const config = {
    Projects: { table: 'projects', select: 'id,name,description,status,priority,target_date,created_at', order: 'created_at' },
    'Business development': { table: 'business_opportunities', select: 'id,title,stage,estimated_value,currency,next_follow_up_at,notes,created_at', order: 'next_follow_up_at' },
    Finance: { table: 'finance_entries', select: 'id,entry_type,description,amount,currency,category,transaction_date,status,created_at', order: 'transaction_date' },
    'Content studio': { table: 'content_items', select: 'id,title,platforms,format,status,scheduled_at,script,published_url,created_at', order: 'created_at' },
  }[active];

  const load = useCallback(async () => {
    if (!org || !config) return;
    setLoading(true); setError('');
    const { data, error: queryError } = await supabase.from(config.table).select(config.select).eq('organization_id', org.id).order(config.order, { ascending: false, nullsFirst: false }).limit(100);
    if (queryError) setError(queryError.message);
    else setRows(data || []);
    setLoading(false);
  }, [org, supabase, config?.table, config?.select, config?.order]);

  useEffect(() => { load(); }, [load]);

  async function save(event) {
    event.preventDefault(); if (!org) return;
    setSaving(true); setError(''); setNotice('');
    let payload;
    if (active === 'Projects') payload = { organization_id: org.id, name: name.trim(), description: description.trim() || null, priority, status: 'planning' };
    if (active === 'Business development') payload = { organization_id: org.id, title: name.trim(), stage, estimated_value: value ? Number(value) : null, currency, notes: description.trim() || null };
    if (active === 'Finance') payload = { organization_id: org.id, entry_type: entryType, description: name.trim(), amount: Number(value), currency, category: category.trim() || null, status: 'confirmed' };
    if (active === 'Content studio') payload = { organization_id: org.id, title: name.trim(), platforms: platforms.split(',').map(x => x.trim()).filter(Boolean), format, status: 'idea', script: description.trim() || null };
    const { error: insertError } = await supabase.from(config.table).insert(payload);
    setSaving(false);
    if (insertError) { setError(insertError.message); return; }
    setName(''); setDescription(''); setValue(''); setCategory('');
    setNotice(active + ' record saved.'); await load();
  }

  async function updateRow(row, field, nextValue) {
    const { error: updateError } = await supabase.from(config.table).update({ [field]: nextValue }).eq('id', row.id);
    if (updateError) { setError(updateError.message); return; }
    setRows(current => current.map(item => item.id === row.id ? { ...item, [field]: nextValue } : item));
  }

  if (!config) return null;
  const title = active === 'Projects' ? 'Projects & delivery' : active === 'Business development' ? 'Business development pipeline' : active === 'Finance' ? 'Finance register' : 'Content studio';
  const sub = active === 'Projects' ? 'Objectives, milestones and execution status.' : active === 'Business development' ? 'Opportunities, proposals and follow-up.' : active === 'Finance' ? 'Income and expense records. Only verified figures belong here.' : 'Plan, prepare and track publishing across your channels.';
  const income = rows.filter(r => r.entry_type === 'income' && r.status !== 'void' && r.currency === currency).reduce((s,r)=>s+Number(r.amount||0),0);
  const expense = rows.filter(r => r.entry_type === 'expense' && r.status !== 'void' && r.currency === currency).reduce((s,r)=>s+Number(r.amount||0),0);

  return <section className="os-panel">
    <div className="os-panel-head"><div><h2>{title}</h2><p>{sub}</p></div><span className="os-count">{rows.length} records</span></div>
    {error && <div className="os-alert error">{error}</div>}
    {notice && <div className="os-alert success">{notice}</div>}
    {active === 'Finance' && <div className="os-finance-summary"><article><small>RECORDED INCOME · {currency}</small><b>{money(income,currency)}</b></article><article><small>RECORDED EXPENSE · {currency}</small><b>{money(expense,currency)}</b></article><article><small>NET · {currency} ONLY</small><b>{money(income-expense,currency)}</b></article></div>}
    <form className="os-form-grid os-extended-form" onSubmit={save}>
      <input value={name} onChange={e=>setName(e.target.value)} placeholder={active === 'Projects' ? 'Project name' : active === 'Business development' ? 'Opportunity title' : active === 'Finance' ? 'Transaction description' : 'Content title / topic'} required/>
      {active === 'Projects' && <select value={priority} onChange={e=>setPriority(e.target.value)}><option value="normal">Normal priority</option><option value="high">High priority</option><option value="urgent">Urgent priority</option><option value="low">Low priority</option></select>}
      {active === 'Business development' && <><select value={stage} onChange={e=>setStage(e.target.value)}><option value="new">New</option><option value="qualified">Qualified</option><option value="proposal">Proposal</option><option value="negotiation">Negotiation</option><option value="won">Won</option><option value="lost">Lost</option></select><input type="number" min="0" step="0.01" value={value} onChange={e=>setValue(e.target.value)} placeholder="Estimated value (optional)"/><select value={currency} onChange={e=>setCurrency(e.target.value)}><option>BDT</option><option>USD</option><option>GBP</option><option>EUR</option><option>Other</option></select></>}
      {active === 'Finance' && <><select value={entryType} onChange={e=>setEntryType(e.target.value)}><option value="income">Income</option><option value="expense">Expense</option></select><input type="number" min="0.01" step="0.01" value={value} onChange={e=>setValue(e.target.value)} placeholder="Amount" required/><select value={currency} onChange={e=>setCurrency(e.target.value)}><option>BDT</option><option>USD</option><option>GBP</option><option>EUR</option><option>Other</option></select><input value={category} onChange={e=>setCategory(e.target.value)} placeholder="Category (optional)"/></>}
      {active === 'Content studio' && <><input value={platforms} onChange={e=>setPlatforms(e.target.value)} placeholder="Platforms, comma separated"/><select value={format} onChange={e=>setFormat(e.target.value)}><option>Short video</option><option>Long video</option><option>Post</option><option>Article</option><option>Carousel</option><option>Live</option></select></>}
      {active !== 'Finance' && <textarea value={description} onChange={e=>setDescription(e.target.value)} placeholder={active === 'Content studio' ? 'Draft script / production notes (optional)' : 'Description / notes (optional)'} rows={2}/>}
      <button disabled={saving}>{saving ? 'Saving…' : 'Add ' + (active === 'Content studio' ? 'content idea' : active === 'Finance' ? 'transaction' : active === 'Business development' ? 'opportunity' : 'project')}</button>
    </form>
    {loading ? <div className="os-loading">Loading live records…</div> : <>
      {active === 'Projects' && <div className="os-table-wrap"><table className="os-table"><thead><tr><th>Project</th><th>Priority</th><th>Status</th><th>Target date</th></tr></thead><tbody>{rows.map(r=><tr key={r.id}><td><b>{r.name}</b><small>{r.description || ''}</small></td><td>{r.priority}</td><td><select value={r.status} onChange={e=>updateRow(r,'status',e.target.value)}><option value="planning">Planning</option><option value="active">Active</option><option value="on_hold">On hold</option><option value="completed">Completed</option><option value="archived">Archived</option></select></td><td>{dateText(r.target_date)}</td></tr>)}</tbody></table>{!rows.length && <Empty text="No projects yet. Add the first project above."/>}</div>}
      {active === 'Business development' && <div className="os-table-wrap"><table className="os-table"><thead><tr><th>Opportunity</th><th>Stage</th><th>Estimated value</th><th>Next follow-up</th></tr></thead><tbody>{rows.map(r=><tr key={r.id}><td><b>{r.title}</b><small>{r.notes || ''}</small></td><td><select value={r.stage} onChange={e=>updateRow(r,'stage',e.target.value)}><option value="new">New</option><option value="qualified">Qualified</option><option value="proposal">Proposal</option><option value="negotiation">Negotiation</option><option value="won">Won</option><option value="lost">Lost</option></select></td><td>{r.estimated_value == null ? '—' : money(r.estimated_value,r.currency)}</td><td>{dateText(r.next_follow_up_at)}</td></tr>)}</tbody></table>{!rows.length && <Empty text="No opportunities yet. Add a lead or opportunity above."/>}</div>}
      {active === 'Finance' && <div className="os-table-wrap"><table className="os-table"><thead><tr><th>Date</th><th>Type</th><th>Description</th><th>Category</th><th>Amount</th><th>Status</th></tr></thead><tbody>{rows.map(r=><tr key={r.id}><td>{dateText(r.transaction_date)}</td><td><span className="os-chip">{r.entry_type}</span></td><td><b>{r.description}</b></td><td>{r.category || '—'}</td><td>{money(r.amount,r.currency)}</td><td>{r.status}</td></tr>)}</tbody></table>{!rows.length && <Empty text="No finance entries yet. Add verified income or expense records above."/>}</div>}
      {active === 'Content studio' && <div className="os-table-wrap"><table className="os-table"><thead><tr><th>Content</th><th>Platforms</th><th>Format</th><th>Status</th></tr></thead><tbody>{rows.map(r=><tr key={r.id}><td><b>{r.title}</b><small>{r.script || ''}</small></td><td>{(r.platforms || []).join(', ') || '—'}</td><td>{r.format || '—'}</td><td><select value={r.status} onChange={e=>updateRow(r,'status',e.target.value)}><option value="idea">Idea</option><option value="draft">Draft</option><option value="review">Review</option><option value="approved">Approved</option><option value="scheduled">Scheduled</option><option value="published">Published</option><option value="archived">Archived</option></select></td></tr>)}</tbody></table>{!rows.length && <Empty text="No content items yet. Add a video or post idea above."/>}</div>}
    </>}
  </section>;
}

function Empty({ text }) { return <div className="os-empty">{text}</div>; }
