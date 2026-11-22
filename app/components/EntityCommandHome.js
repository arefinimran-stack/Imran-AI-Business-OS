'use client';

const entities = [
  {
    key: 'holdings', number: '01', mark: 'IA²', name: 'IA² HOLDINGS',
    category: 'PARENT HOLDING COMPANY',
    description: 'The parent group coordinating venture development, real estate, technology and AI, and its portfolio companies.',
    status: 'PARENT GROUP', tone: 'gold',
    url: 'https://ia2-holdings-h66tog2ln-arefinimran-1852.vercel.app',
    linkLabel: 'Open Holdings preview',
    note: 'Current Vercel preview. This is a review build, not a production launch.'
  },
  {
    key: 'venture', number: '02', mark: 'VC', name: 'IA² VENTURE',
    category: 'VENTURE DEVELOPMENT & CAPITAL',
    description: 'Opportunity discovery, feasibility, investment readiness and venture development.',
    status: 'PORTFOLIO UNIT', tone: 'wine', url: '',
    linkLabel: 'Open venture workspace',
    note: 'Internal workspace view; a separate public website is not yet deployed.'
  },
  {
    key: 'real-estate', number: '03', mark: 'RE', name: 'REAL ESTATE',
    category: 'PROPERTY & DEVELOPMENT',
    description: 'Property research, feasibility, due diligence and development coordination.',
    status: 'PORTFOLIO UNIT', tone: 'teal', url: '',
    linkLabel: 'Open real-estate workspace',
    note: 'Internal workspace view; a separate public website is not yet deployed.'
  },
  {
    key: 'technology', number: '04', mark: 'AI', name: 'TECHNOLOGY & AI',
    category: 'AI INTELLIGENCE & DIGITAL SYSTEMS',
    description: 'Technology products, AI workflows, automation and responsible digital transformation.',
    status: 'PORTFOLIO UNIT', tone: 'blue', url: '',
    linkLabel: 'Open technology workspace',
    note: 'Internal workspace view; provider connections and production workflows remain approval-gated.'
  },
  {
    key: 'c3', number: '05', mark: 'C3', name: 'C3 LIFESTYLE',
    category: 'LIFESTYLE & CONSUMER VENTURE',
    description: 'A portfolio venture for lifestyle and consumer opportunities.',
    status: 'RESEARCH ONLY', tone: 'violet', url: '',
    linkLabel: 'Open research workspace',
    note: 'Execution is on hold. Research only; no products, orders or commercial launch.'
  },
  {
    key: 'cotton', number: '06', mark: 'BC', name: 'BOLD COTTON',
    category: 'APPAREL & GARMENTS',
    description: 'An apparel and garment venture exploring buyer, category and product opportunities.',
    status: 'RESEARCH ONLY', tone: 'sand', url: '',
    linkLabel: 'Open research workspace',
    note: 'Execution is on hold. Research only; no products, orders or commercial launch.'
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
      <article><span>PORTFOLIO UNITS</span><strong>06</strong><small>Parent group + five portfolio units</small></article>
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
