'use client';

const entities = [
  {
    key: 'adviser',
    number: '01',
    mark: '⚖',
    name: 'THE ADVISER',
    category: 'LEGAL & CORPORATE',
    description: 'The legal advisory website and client-facing app, led by Advocate Imran Arefin.',
    status: 'BUILD STREAM',
    tone: 'wine',
    url: 'https://adv-imran-arefin.vercel.app',
    linkLabel: 'Open protected preview',
    note: 'Vercel project has been mapped to its own website source folder. New preview build is pending.'
  },
  {
    key: 'holdings',
    number: '02',
    mark: 'IA²',
    name: 'IA² HOLDINGS',
    category: 'PARENT GROUP',
    description: 'The group identity, portfolio overview, governance and venture coordination.',
    status: 'BUILD STREAM',
    tone: 'gold',
    url: 'https://ia2-holdings.vercel.app',
    linkLabel: 'Open protected preview',
    note: 'Separate website source mapping has been corrected. New preview build is pending.'
  },
  {
    key: 'cotton',
    number: '03',
    mark: 'BC',
    name: 'BOLD COTTON',
    category: 'APPAREL & GARMENTS',
    description: 'Independent apparel identity, product presence and buyer-facing digital channel.',
    status: 'RESEARCH / QUEUED',
    tone: 'teal',
    url: null,
    linkLabel: 'View venture record',
    note: 'Its own digital presence is in the entity build queue; commercial execution remains controlled.'
  },
  {
    key: 'c3',
    number: '04',
    mark: 'C3',
    name: 'C3 LIFESTYLE',
    category: 'LIFESTYLE VENTURE',
    description: 'Independent lifestyle identity, curated products and content-led presence.',
    status: 'RESEARCH / QUEUED',
    tone: 'blue',
    url: null,
    linkLabel: 'View venture record',
    note: 'Its own digital presence is in the entity build queue; commercial execution remains controlled.'
  }
];

const flow = [
  ['01', 'DETECT'],
  ['02', 'PLAN'],
  ['03', 'CREATE'],
  ['04', 'REVIEW'],
  ['05', 'APPROVE'],
  ['06', 'PUBLISH'],
  ['07', 'MEASURE']
];

export default function EntityCommandHome({ tasks = [], openTasks = [], overdue = [], ventures = [], contacts = [], openMatters = [], setActive }) {
  const counts = [
    { label: 'TO DO', value: tasks.filter(t => t.status === 'todo').length },
    { label: 'IN PROGRESS', value: tasks.filter(t => t.status === 'in_progress').length },
    { label: 'BLOCKED', value: tasks.filter(t => t.status === 'blocked').length },
    { label: 'DONE', value: tasks.filter(t => t.status === 'done').length }
  ];
  const maxCount = Math.max(1, ...counts.map(x => x.value));

  return <div className="rc-home">
    <section className="rc-hero">
      <div className="rc-hero-copy">
        <div className="rc-kicker">IA² HOLDINGS · PRIVATE OPERATING ENVIRONMENT</div>
        <h2>One command.<br/><em>Every entity in view.</em></h2>
        <p>Launch the businesses, review the operating signals, access prepared work and direct the specialist agents from one visual command centre.</p>
        <div className="rc-hero-actions">
          <button className="rc-primary" onClick={() => setActive('Command Relay')}>Open Command Relay <span>↗</span></button>
          <button className="rc-secondary" onClick={() => setActive('System Health')}>System Fixer & Diagnostics</button>
        </div>
      </div>
      <div className="rc-hero-emblem">
        <div>IA<sup>2</sup></div>
        <span>VISUAL RC</span>
        <small>PLAN · DIRECT · APPROVE</small>
      </div>
    </section>

    <div className="rc-kpi-grid">
      <article><span>CORE ENTITIES</span><strong>04</strong><small>Separate digital identities</small></article>
      <article><span>OPEN WORK</span><strong>{openTasks.length}</strong><small>{overdue.length} overdue · internal register</small></article>
      <article><span>LEGAL MATTERS</span><strong>{openMatters.length}</strong><small>Confidential workspace records</small></article>
      <article><span>RELATIONSHIPS</span><strong>{contacts.length}</strong><small>CRM contacts and leads</small></article>
    </div>

    <div className="rc-section-title">
      <div><span>ENTITY LAUNCHPAD</span><h3>Your operating portfolio</h3></div>
      <button onClick={() => setActive('Ventures')}>Portfolio records ↗</button>
    </div>
    <div className="rc-entity-grid">
      {entities.map(entity => <article className={'rc-entity-card ' + entity.tone} key={entity.key}>
        <div className="rc-entity-top"><span>{entity.number} / IA² PORTFOLIO</span><span className="rc-entity-status">{entity.status}</span></div>
        <div className="rc-entity-heading">
          <div className="rc-entity-mark">{entity.mark}</div>
          <div><small>{entity.category}</small><h4>{entity.name}</h4></div>
        </div>
        <p>{entity.description}</p>
        <div className="rc-entity-foot">
          {entity.url
            ? <a href={entity.url} target="_blank" rel="noreferrer">{entity.linkLabel} ↗</a>
            : <button onClick={() => setActive('Ventures')}>{entity.linkLabel} ↗</button>}
        </div>
        <small className="rc-entity-note">{entity.note}</small>
      </article>)}
    </div>

    <div className="rc-dashboard-grid">
      <section className="rc-panel rc-flow-panel">
        <header><div><span>GOVERNED WORKFLOW</span><h3>From command to verified result</h3></div><b>CONTROLLED</b></header>
        <div className="rc-flow">
          {flow.map((step, index) => <div className="rc-flow-step" key={step[0]}>
            <span>{step[0]}</span><b>{step[1]}</b>
            {index < flow.length - 1 && <i/>}
          </div>)}
        </div>
        <p>External publishing, prospect outreach, payments, legal representations and destructive changes remain behind explicit founder approval.</p>
      </section>

      <section className="rc-panel">
        <header><div><span>EXECUTION PULSE</span><h3>Work moving through the system</h3></div><b>{openTasks.length} OPEN</b></header>
        <div className="rc-bars">
          {counts.map(item => <div className="rc-bar-row" key={item.label}>
            <span>{item.label}</span>
            <div className="rc-bar-track"><i style={{width: ((item.value / maxCount) * 100) + '%'}}/></div>
            <b>{item.value}</b>
          </div>)}
        </div>
        <button className="rc-panel-link" onClick={() => setActive('Tasks')}>Open work register ↗</button>
      </section>

      <section className="rc-panel">
        <header><div><span>FINANCIAL CONTROL</span><h3>Verified financial pulse</h3></div><b>DATA-LED</b></header>
        <div className="rc-empty-visual"><span>৳</span><div><b>Finance feed ready for records</b><small>Revenue and expense charts will show verified entries only. No estimated or invented figures are displayed.</small></div></div>
        <button className="rc-panel-link" onClick={() => setActive('Finance')}>Open finance desk ↗</button>
      </section>

      <section className="rc-panel">
        <header><div><span>TRAFFIC & GROWTH</span><h3>Digital performance</h3></div><b>CONNECT FEED</b></header>
        <div className="rc-empty-visual"><span>↗</span><div><b>Analytics feed not yet connected</b><small>Visitor, source, conversion and enquiry charts will populate separately for each entity after the analytics adapter is verified.</small></div></div>
        <button className="rc-panel-link" onClick={() => setActive('System Health')}>Check integration status ↗</button>
      </section>
    </div>

    <div className="rc-section-title rc-quick-title">
      <div><span>DIRECT ACCESS</span><h3>Open your working areas</h3></div>
    </div>
    <div className="rc-quick-grid">
      <button onClick={() => setActive('Documents')}><span>▤</span><b>Document Vault</b><small>Prepared documents and drafts</small></button>
      <button onClick={() => setActive('Content studio')}><span>✦</span><b>Content Studio</b><small>Articles, campaigns and media</small></button>
      <button onClick={() => setActive('Command Relay')}><span>⌘</span><b>Founder Command Relay</b><small>Give instructions and approve actions</small></button>
      <button onClick={() => setActive('AI Agents & Tools')}><span>◈</span><b>Agents, Skills & Tools</b><small>Specialists and capability register</small></button>
      <button onClick={() => setActive('System Health')}><span>⚙</span><b>System Fixer</b><small>Diagnose blockers and next actions</small></button>
    </div>
  </div>;
}
