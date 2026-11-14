'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { createClient } from '../../lib/supabase/client';
import ExtendedModules from './ExtendedModules';
import { DIVISIONS, CENTRAL_FUNCTIONS } from '../lib/operating-model';

const nav = [
  ['Overview', '⌂'], ['Divisions', '▦'], ['Central functions', '✳'], ['Tasks', '☷'], ['Legal matters', '§'],
  ['Contacts', '◎'], ['Business development', '↗'], ['Projects', '▦'], ['Finance', '৳'], ['Content studio', '▣'], ['Ventures', '◇'], ['Documents', '▤'],
];
const dateLabel = value => value ? new Date(value).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : '—';
const priorityLabel = value => ({ urgent: 'Urgent', high: 'High', normal: 'Normal', low: 'Low' }[value] || value);
const statusLabel = value => ({ todo: 'To do', in_progress: 'In progress', blocked: 'Blocked', done: 'Done', cancelled: 'Cancelled', open: 'Open', pending: 'Pending', on_hold: 'On hold', closed: 'Closed', archived: 'Archived' }[value] || value);

export default function Dashboard() {
  const [active, setActive] = useState('Overview');
  const [user, setUser] = useState(null);
  const [org, setOrg] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [ventures, setVentures] = useState([]);
  const [contacts, setContacts] = useState([]);
  const [matters, setMatters] = useState([]);
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [taskTitle, setTaskTitle] = useState('');
  const [taskPriority, setTaskPriority] = useState('normal');
  const [contactName, setContactName] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [contactType, setContactType] = useState('prospect');
  const [matterTitle, setMatterTitle] = useState('');
  const [matterType, setMatterType] = useState('');
  const [matterCourt, setMatterCourt] = useState('');
  const [matterPriority, setMatterPriority] = useState('normal');

  const supabase = useMemo(() => createClient(), []);

  const load = useCallback(async () => {
    setLoading(true); setError('');
    try {
      const { data: authData, error: authError } = await supabase.auth.getUser();
      if (authError) throw authError;
      setUser(authData.user);
      const { data: orgData, error: orgError } = await supabase.from('organizations').select('id,name,slug').eq('slug', 'imran-ai').single();
      if (orgError) throw new Error(orgError.message === 'JSON object requested, multiple (or no) rows returned' ? 'Founder workspace access is not active for this account. Sign out and sign in again, or request founder access.' : orgError.message);
      setOrg(orgData);
      const [t, v, c, m, d] = await Promise.all([
        supabase.from('tasks').select('id,title,description,status,priority,due_at,created_at,related_matter_id').eq('organization_id', orgData.id).order('created_at', { ascending: false }).limit(100),
        supabase.from('ventures').select('id,name,slug,category,status,description').eq('organization_id', orgData.id).order('name'),
        supabase.from('contacts').select('id,full_name,organization_name,email,phone,contact_type,created_at').eq('organization_id', orgData.id).order('created_at', { ascending: false }).limit(100),
        supabase.from('legal_matters').select('id,reference_code,title,matter_type,court_or_forum,status,priority,next_hearing_at,confidential').eq('organization_id', orgData.id).order('next_hearing_at', { ascending: true, nullsFirst: false }).limit(100),
        supabase.from('legal_documents').select('id,title,template_key,language,status,created_at,matter_id').eq('organization_id', orgData.id).order('created_at', { ascending: false }).limit(100),
      ]);
      for (const result of [t, v, c, m, d]) if (result.error) throw result.error;
      setTasks(t.data || []); setVentures(v.data || []); setContacts(c.data || []);
      setMatters(m.data || []); setDocuments(d.data || []);
    } catch (e) { setError(e.message || 'Unable to load workspace data.'); }
    finally { setLoading(false); }
  }, [supabase]);

  useEffect(() => { load(); }, [load]);

  async function addTask(event) {
    event.preventDefault(); if (!taskTitle.trim() || !org) return;
    setSaving(true); setError(''); setNotice('');
    const { error: insertError } = await supabase.from('tasks').insert({ organization_id: org.id, title: taskTitle.trim(), priority: taskPriority, status: 'todo' });
    setSaving(false);
    if (insertError) { setError(insertError.message); return; }
    setTaskTitle(''); setNotice('Task saved to the workspace.'); await load();
  }

  async function changeTaskStatus(task, status) {
    const { error: updateError } = await supabase.from('tasks').update({ status }).eq('id', task.id);
    if (updateError) { setError(updateError.message); return; }
    setTasks(items => items.map(item => item.id === task.id ? { ...item, status } : item));
  }

  async function addContact(event) {
    event.preventDefault(); if (!contactName.trim() || !org) return;
    setSaving(true); setError(''); setNotice('');
    const { error: insertError } = await supabase.from('contacts').insert({
      organization_id: org.id, full_name: contactName.trim(), email: contactEmail.trim() || null,
      phone: contactPhone.trim() || null, contact_type: contactType,
    });
    setSaving(false);
    if (insertError) { setError(insertError.message); return; }
    setContactName(''); setContactEmail(''); setContactPhone(''); setNotice('Contact saved.'); await load();
  }

  async function addMatter(event) {
    event.preventDefault(); if (!matterTitle.trim() || !org) return;
    setSaving(true); setError(''); setNotice('');
    const code = 'IA-' + new Date().getFullYear() + '-' + Math.random().toString(36).slice(2, 7).toUpperCase();
    const { error: insertError } = await supabase.from('legal_matters').insert({
      organization_id: org.id, reference_code: code, title: matterTitle.trim(),
      matter_type: matterType.trim() || null, court_or_forum: matterCourt.trim() || null,
      priority: matterPriority, status: 'open', confidential: true,
    });
    setSaving(false);
    if (insertError) { setError(insertError.message); return; }
    setMatterTitle(''); setMatterType(''); setMatterCourt(''); setNotice('Confidential legal matter created.'); await load();
  }

  async function signOut() { await supabase.auth.signOut(); window.location.assign('/login'); }

  const openTasks = tasks.filter(t => !['done', 'cancelled'].includes(t.status));
  const openMatters = matters.filter(m => !['closed', 'archived'].includes(m.status));
  const overdue = tasks.filter(t => t.due_at && new Date(t.due_at) < new Date() && !['done', 'cancelled'].includes(t.status));
  const greeting = new Date().getHours() < 12 ? 'Good morning' : new Date().getHours() < 17 ? 'Good afternoon' : 'Good evening';

  return <main className="os-shell">
    <aside className="os-sidebar">
      <div className="os-brand"><div className="os-mark">IA</div><div><b>IMRAN AI</b><small>FOUNDER OPERATING SYSTEM</small></div></div>
      <div className="os-workspace-label">WORKSPACE</div>
      <nav className="os-nav">{nav.map(([label, icon]) => <button key={label} onClick={() => setActive(label)} className={active === label ? 'os-nav-item active' : 'os-nav-item'}><span>{icon}</span>{label}</button>)}</nav>
      <div className="os-sidebar-bottom"><div className="os-avatar">IA</div><div className="os-user"><b>{user?.user_metadata?.full_name || 'Founder'}</b><small>{user?.email || 'Founder account'}</small></div><button className="os-signout" onClick={signOut} title="Sign out">↗</button></div>
    </aside>
    <section className="os-main">
      <header className="os-topbar"><div className="os-crumb">IMRAN AI <span>/</span> <b>{active}</b></div><div className="os-top-right"><span className="os-live"><i/> Connected workspace</span><button className="os-refresh" onClick={load}>↻ Refresh</button></div></header>
      <div className="os-content">
        <div className="os-eyebrow">{new Date().toLocaleDateString('en-GB', { weekday: 'long', day: '2-digit', month: 'long', year: 'numeric' }).toUpperCase()} <span>•</span> PRIVATE FOUNDER WORKSPACE</div>
        <div className="os-hero"><div><h1>{greeting}, Imran.</h1><p>Your work, legal practice and ventures — connected in one place.</p></div><div className="os-hero-note">ONE INTELLIGENCE. MULTIPLE BUSINESSES.</div></div>
        {error && <div className="os-alert error">{error}</div>}
        {notice && <div className="os-alert success">{notice}</div>}
        {loading ? <div className="os-loading"><span className="os-spinner"/> Connecting to your live workspace…</div> : <>
          {active === 'Overview' && <Overview tasks={tasks} openTasks={openTasks} overdue={overdue} ventures={ventures} contacts={contacts} openMatters={openMatters} setActive={setActive} />}
          {active === 'Divisions' && <section className="os-panel">
            <PanelTitle title="Business divisions" sub="Four operating divisions coordinated by Central Command. Legal & Corporate is the first commercial priority." count={DIVISIONS.length + ' divisions'} />
            <div className="os-venture-grid">{DIVISIONS.map(d => <article className="os-venture" key={d.id}>
              <div className="os-venture-top"><span>Priority {d.priority}</span><span className="os-chip">{d.priority === 1 ? 'First priority' : 'Build phase'}</span></div>
              <h3>{d.name}</h3><p>{d.purpose}</p>
              <b>Workstreams</b><ul>{d.workstreams.map(w => <li key={w}>{w}</li>)}</ul>
              <div className="os-division-actions">
                {d.modules.map(m => <button key={m} className="os-chip-button" onClick={() => setActive(({ 'legal-matters':'Legal matters', documents:'Documents', contacts:'Contacts', 'business-development':'Business development', 'content-studio':'Content studio', projects:'Projects', finance:'Finance' })[m] || 'Overview')}>{m.replaceAll('-', ' ')}</button>)}
              </div>
              <small>Safeguard: {d.safeguards[0]}</small>
            </article>)}</div>
          </section>}
          {active === 'Central functions' && <section className="os-panel">
            <PanelTitle title="Central Command & shared functions" sub="Shared capabilities serving all four divisions, governed by one founder operating system." count={CENTRAL_FUNCTIONS.length + ' functions'} />
            <div className="os-venture-grid">{CENTRAL_FUNCTIONS.map(f => <article className="os-venture" key={f.id}>
              <div className="os-venture-top"><span>Central function</span><span className="os-chip">Shared</span></div>
              <h3>{f.name}</h3><ul>{f.capabilities.map(c => <li key={c}>{c}</li>)}</ul>
            </article>)}</div>
            <div className="os-attention"><div><b>Content production and revenue workflow</b><small>Research → Editorial brief → Writing → Script & creative → Founder / Advocate review → Approval → Scheduling → Publishing → Analytics → Lead attribution.</small></div></div>
          </section>}
          {active === 'Tasks' && <section className="os-panel"><PanelTitle title="Tasks & execution" sub="Create, prioritise and update work in the live workspace." count={openTasks.length + ' open'} />
            <form className="os-inline-form" onSubmit={addTask}><input value={taskTitle} onChange={e => setTaskTitle(e.target.value)} placeholder="Add a task or next action…" required/><select value={taskPriority} onChange={e => setTaskPriority(e.target.value)}><option value="normal">Normal</option><option value="high">High</option><option value="urgent">Urgent</option><option value="low">Low</option></select><button disabled={saving}>{saving ? 'Saving…' : 'Add task'}</button></form>
            <TaskList tasks={tasks} onStatus={changeTaskStatus}/></section>}
          {active === 'Legal matters' && <section className="os-panel"><PanelTitle title="Legal matters" sub="Restricted legal workspace. Matters are confidential by default." count={openMatters.length + ' open'} />
            <form className="os-form-grid" onSubmit={addMatter}><input value={matterTitle} onChange={e => setMatterTitle(e.target.value)} placeholder="Matter title / short description" required/><input value={matterType} onChange={e => setMatterType(e.target.value)} placeholder="Matter type (e.g. Civil, Criminal, Company)"/><input value={matterCourt} onChange={e => setMatterCourt(e.target.value)} placeholder="Court / forum"/><select value={matterPriority} onChange={e => setMatterPriority(e.target.value)}><option value="normal">Normal priority</option><option value="high">High priority</option><option value="urgent">Urgent priority</option><option value="low">Low priority</option></select><button disabled={saving}>{saving ? 'Saving…' : 'Create confidential matter'}</button></form>
            <MatterList matters={matters}/></section>}
          {active === 'Contacts' && <section className="os-panel"><PanelTitle title="Contacts & relationships" sub="Client, prospect, partner and professional relationship register." count={contacts.length + ' records'} />
            <form className="os-form-grid contact-form" onSubmit={addContact}><input value={contactName} onChange={e => setContactName(e.target.value)} placeholder="Full name" required/><input type="email" value={contactEmail} onChange={e => setContactEmail(e.target.value)} placeholder="Email address"/><input value={contactPhone} onChange={e => setContactPhone(e.target.value)} placeholder="Phone number"/><select value={contactType} onChange={e => setContactType(e.target.value)}><option value="prospect">Prospect</option><option value="client">Client</option><option value="partner">Partner</option><option value="vendor">Vendor</option><option value="investor">Investor</option><option value="other">Other</option></select><button disabled={saving}>{saving ? 'Saving…' : 'Add contact'}</button></form>
            <div className="os-table-wrap"><table className="os-table"><thead><tr><th>Name</th><th>Organisation</th><th>Type</th><th>Email / Phone</th></tr></thead><tbody>{contacts.map(c=><tr key={c.id}><td><b>{c.full_name}</b></td><td>{c.organization_name || '—'}</td><td><span className="os-chip">{c.contact_type}</span></td><td>{c.email || '—'}<small>{c.phone || ''}</small></td></tr>)}</tbody></table>{!contacts.length && <Empty text="No contacts yet. Add the first relationship above."/>}</div></section>}
          {active === 'Ventures' && <section className="os-panel"><PanelTitle title="Venture portfolio" sub="Core business units registered in the IMRAN AI workspace." count={ventures.length + ' ventures'} /><div className="os-venture-grid">{ventures.map(v=><article className="os-venture" key={v.id}><div className="os-venture-top"><span>{v.category || 'Business'}</span><span className="os-chip">{v.status}</span></div><h3>{v.name}</h3><p>{v.description || 'Business unit registered. Operating details and financial metrics are intentionally left blank until verified.'}</p><small>{v.slug}</small></article>)}</div>{!ventures.length && <Empty text="No ventures have been registered yet."/>}</section>}
          {['Projects','Business development','Finance','Content studio'].includes(active) && <ExtendedModules active={active} org={org} supabase={supabase} />}
          {active === 'Documents' && <section className="os-panel"><PanelTitle title="Legal documents" sub="Drafts and final documents linked to the legal workspace." count={documents.length + ' documents'} /><div className="os-table-wrap"><table className="os-table"><thead><tr><th>Document</th><th>Template</th><th>Language</th><th>Status</th><th>Created</th></tr></thead><tbody>{documents.map(d=><tr key={d.id}><td><b>{d.title}</b></td><td>{d.template_key}</td><td>{d.language}</td><td><span className="os-chip">{d.status}</span></td><td>{dateLabel(d.created_at)}</td></tr>)}</tbody></table>{!documents.length && <Empty text="No documents saved yet. Document drafting will be enabled after the secure workspace is fully validated."/>}</div></section>}
        </>}
        <footer className="os-footer"><span>IMRAN AI BUSINESS OS</span><span>PRIVATE WORKSPACE · LIVE DATA · BANGLADESH</span></footer>
      </div>
    </section>
  </main>;
}

function PanelTitle({ title, sub, count }) { return <div className="os-panel-head"><div><h2>{title}</h2><p>{sub}</p></div><span className="os-count">{count}</span></div>; }
function Empty({ text }) { return <div className="os-empty">{text}</div>; }
function TaskList({ tasks, onStatus }) {
  if (!tasks.length) return <Empty text="No tasks in this workspace yet. Add a task above to get started." />;
  return <div className="os-task-list">{tasks.map(t=><article className="os-task-row" key={t.id}><div className="os-task-main"><b>{t.title}</b><small>{t.description || 'No additional details'}</small></div><span className={'os-priority ' + t.priority}>{priorityLabel(t.priority)}</span><small className="os-due">{dateLabel(t.due_at)}</small><select value={t.status} onChange={e => onStatus(t, e.target.value)} aria-label={'Status for ' + t.title}><option value="todo">To do</option><option value="in_progress">In progress</option><option value="blocked">Blocked</option><option value="done">Done</option><option value="cancelled">Cancelled</option></select></article>)}</div>;
}
function MatterList({ matters }) {
  if (!matters.length) return <Empty text="No legal matters registered. New matters are marked confidential by default." />;
  return <div className="os-matter-list">{matters.map(m=><article className="os-matter-row" key={m.id}><div><b>{m.title}</b><small>{m.reference_code} · {m.matter_type || 'Matter type not set'} · {m.court_or_forum || 'Forum not set'}</small></div><span className={'os-priority ' + m.priority}>{priorityLabel(m.priority)}</span><span className="os-chip">{statusLabel(m.status)}</span><small>Next date: {dateLabel(m.next_hearing_at)}</small><span className="os-confidential">Confidential</span></article>)}</div>;
}
function Overview({ tasks, openTasks, overdue, ventures, contacts, openMatters, setActive }) {
  const metrics = [['OPEN TASKS', String(openTasks.length).padStart(2,'0'), 'Work requiring action'], ['LEGAL MATTERS', String(openMatters.length).padStart(2,'0'), 'Open and pending matters'], ['RELATIONSHIPS', String(contacts.length).padStart(2,'0'), 'Contacts and leads'], ['VENTURES', String(ventures.length).padStart(2,'0'), 'Registered business units']];
  return <>
    <div className="os-section-head"><div><h2>Executive overview</h2><p>Live records from your operating workspace.</p></div><span className="os-phase">CONNECTED · CORE MODULES</span></div>
    <div className="os-metrics">{metrics.map(([label,value,sub])=><article className="os-metric" key={label}><span>{label}</span><strong>{value}</strong><small>{sub}</small></article>)}</div>
    <div className="os-overview-grid"><section className="os-panel"><PanelTitle title="Priority desk" sub="Your most recent actions." count={openTasks.length + ' open'}/><TaskList tasks={tasks.slice(0,6)} onStatus={async (task,status)=>{const supabase=createClient();const {error}=await supabase.from('tasks').update({status}).eq('id',task.id);if(!error)window.location.reload();}}/><button className="os-link" onClick={()=>setActive('Tasks')}>Open task desk →</button></section>
      <section className="os-panel"><PanelTitle title="Founder attention" sub="Items that may need immediate review." count={overdue.length + ' overdue'}/><div className="os-attention"><div><b>{overdue.length ? 'Overdue tasks' : 'No overdue tasks'}</b><small>{overdue.length ? 'Review due dates and move blocked work forward.' : 'Your task register has no overdue items.'}</small></div><div><b>{openMatters.length} active legal matters</b><small>Keep court dates and client commitments current.</small></div><div><b>{ventures.length} registered ventures</b><small>Business metrics remain blank until verified.</small></div></div><button className="os-link" onClick={()=>setActive('Legal matters')}>Open legal desk →</button></section></div>
    <div className="os-section-head os-modules-head"><div><h2>Operating modules</h2><p>Navigate directly to live registers.</p></div></div>
    <div className="os-module-grid">{[['Legal matters','§','Confidential matter register'],['Tasks','☷','Daily execution and priorities'],['Contacts','◎','Clients, leads and relationships'],['Ventures','◇','Business unit portfolio'],['Documents','▤','Legal document register']].map(([name,icon,desc])=><button key={name} className="os-module" onClick={()=>setActive(name)}><span>{icon}</span><b>{name}</b><small>{desc}</small><i>↗</i></button>)}</div>
  </>;
}
