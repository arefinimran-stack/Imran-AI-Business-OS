'use client';

import { useState } from 'react';

const initialTasks = [
  { id: 1, title: 'Review priority client follow-ups', area: 'Legal Chamber', due: 'Today', done: false },
  { id: 2, title: 'Prepare weekly content outline', area: 'Media & Growth', due: 'Today', done: false },
  { id: 3, title: 'Update business development pipeline', area: 'Business', due: 'Tomorrow', done: true },
];
const modules = [
  ['01', 'Legal Chamber', 'Clients, matters, court dates and documents', 'Legal operations'],
  ['02', 'CRM & Relationships', 'Contacts, leads and follow-up history', 'Growth'],
  ['03', 'Business Development', 'Opportunities, proposals and revenue', 'Growth'],
  ['04', 'Finance', 'Income, expenses and financial overview', 'Operations'],
  ['05', 'Content Studio', 'YouTube, Facebook and publishing calendar', 'Media'],
  ['06', 'AI Control Centre', 'Research, briefs and assisted workflows', 'Intelligence'],
  ['07', 'Portfolio', 'IA² Holdings, C3 Lifestyle and Bold Cotton', 'Ventures'],
  ['08', 'Projects & Tasks', 'Priorities, milestones and execution', 'Operations'],
];
export default function Home() {
  const [tasks, setTasks] = useState(initialTasks);
  const [active, setActive] = useState('Overview');
  const [query, setQuery] = useState('');
  const toggle = id => setTasks(items => items.map(t => t.id === id ? {...t, done: !t.done} : t));
  const filtered = modules.filter(m => m[1].toLowerCase().includes(query.toLowerCase()) || m[2].toLowerCase().includes(query.toLowerCase()));
  return <main className="shell">
    <aside className="sidebar"><div className="brand"><div className="brand-mark">IA</div><div><b>IMRAN AI</b><small>BUSINESS OS</small></div></div>
      <div className="workspace-label">WORKSPACE</div><nav>{['Overview','Legal Chamber','CRM & Relationships','Business Development','Finance','Content Studio','AI Control Centre','Portfolio','Projects & Tasks'].map((item,i)=><button key={item} onClick={()=>setActive(item)} className={active===item?'nav-item selected':'nav-item'}><span>{['⌂','§','◎','↗','৳','▣','✳','◇','☷'][i]}</span>{item}</button>)}</nav>
      <div className="sidebar-bottom"><div className="avatar">IA</div><div><b>Imran Arefin</b><small>Founder workspace</small></div><span className="online-dot"/></div>
    </aside>
    <section className="main"><header className="topbar"><div className="crumb">Personal <span>/</span> <b>{active}</b></div><div className="top-actions"><span className="status"><i/> Workspace preview</span><div className="avatar small">IA</div></div></header>
      <div className="content"><div className="eyebrow">THURSDAY, 13 NOVEMBER 2026 <span>•</span> FOUNDER WORKSPACE</div><div className="hero"><div><h1>Good morning, Imran.</h1><p>Your work, businesses and priorities in one command centre.</p></div><div className="hero-tag">ONE INTELLIGENCE. MULTIPLE BUSINESSES.</div></div>
      <div className="section-head"><div><h2>Executive overview</h2><p>A clear view of the work that matters.</p></div><span className="muted">Phase 1 · Foundation</span></div>
      <div className="metrics"><article className="metric"><span>OPEN PRIORITIES</span><strong>{tasks.filter(t=>!t.done).length.toString().padStart(2,'0')}</strong><small>Tasks requiring attention</small></article><article className="metric"><span>BUSINESS UNITS</span><strong>04</strong><small>Core ecosystem entities</small></article><article className="metric"><span>WORKSTREAMS</span><strong>08</strong><small>Connected operating areas</small></article><article className="metric accent"><span>OPERATING MODE</span><strong>BUILD</strong><small>Foundation and execution</small></article></div>
      <div className="two-col"><section className="panel"><div className="panel-head"><div><h3>Priority desk</h3><p>Keep the next actions moving.</p></div><span className="counter">{tasks.filter(t=>!t.done).length} open</span></div><div className="task-list">{tasks.map(t=><label className={t.done?'task done':'task'} key={t.id}><input type="checkbox" checked={t.done} onChange={()=>toggle(t.id)}/><span className="task-copy"><b>{t.title}</b><small>{t.area}</small></span><em>{t.due}</em></label>)}</div><div className="panel-foot">Task changes here are local preview state, not yet saved to a database.</div></section>
      <section className="panel brief"><div className="panel-head"><div><h3>Founder’s focus</h3><p>Execution principles</p></div><span className="spark">✳</span></div><div className="focus-item"><b>01</b><div><strong>Protect core legal work</strong><small>Keep client service and court commitments central.</small></div></div><div className="focus-item"><b>02</b><div><strong>Build repeatable revenue</strong><small>Prioritise qualified leads and consistent publishing.</small></div></div><div className="focus-item"><b>03</b><div><strong>Spend only against evidence</strong><small>Keep the technology stack lean until usage proves demand.</small></div></div></section></div>
      <div className="section-head modules-head"><div><h2>Operating areas</h2><p>The foundation for the wider IMRAN AI ecosystem.</p></div><input className="search" placeholder="Find a workspace…" value={query} onChange={e=>setQuery(e.target.value)}/></div>
      <div className="module-grid">{filtered.map(m=><button className="module" key={m[0]} onClick={()=>setActive(m[1])}><div className="module-top"><span>{m[0]}</span><span>↗</span></div><h3>{m[1]}</h3><p>{m[2]}</p><small>{m[3]}</small></button>)}</div>
      <footer>IMRAN AI BUSINESS OS <span>PRIVATE FOUNDER WORKSPACE · FOUNDATION BUILD</span></footer></div>
    </section>
  </main>;
}
