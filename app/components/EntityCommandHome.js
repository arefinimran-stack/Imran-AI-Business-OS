'use client';

import { useState } from 'react';

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
  const [openFolders, setOpenFolders] = useState({});
  const [activeRcTab, setActiveRcTab] = useState('Dashboard');
  const [commandOpen, setCommandOpen] = useState(false);
  const [commandQuery, setCommandQuery] = useState('');
  const commandEntities = [
    { name: 'Command Center', kind: 'Control node', tab: 'Dashboard', detail: 'IA² Visual RC interface' },
    { name: 'RC Vehicle', kind: 'Fleet entity', tab: 'Fleet Control', detail: 'Hardware connection pending' },
    { name: 'Battery', kind: 'Vehicle component', tab: 'Fleet Control', detail: 'Battery telemetry not connected' },
    { name: 'Sensors', kind: 'Vehicle subsystem', tab: 'Fleet Control', detail: 'Sensor feed not connected' },
    { name: 'Camera Feed', kind: 'Vision entity', tab: 'AI Vision (ODR)', detail: 'Camera source not connected' },
    { name: 'ODR Engine', kind: 'AI vision subsystem', tab: 'AI Vision (ODR)', detail: 'Inference provider not connected' },
    { name: 'Cloud', kind: 'Infrastructure entity', tab: 'Settings', detail: 'Cloud telemetry not connected' }
  ];
  const commandResults = commandEntities.filter(item => (item.name + ' ' + item.kind + ' ' + item.detail).toLowerCase().includes(commandQuery.trim().toLowerCase()));
  const counts = [
    { label: 'TO DO', value: tasks.filter(t => t.status === 'todo').length },
    { label: 'IN PROGRESS', value: tasks.filter(t => t.status === 'in_progress').length },
    { label: 'BLOCKED', value: tasks.filter(t => t.status === 'blocked').length },
    { label: 'DONE', value: tasks.filter(t => t.status === 'done').length }
  ];
  const maxCount = Math.max(1, ...counts.map(x => x.value));

  return <div className="rc-home" data-rc-view={activeRcTab}>\n    <div className="rc-command-tabs" role="tablist" aria-label="IA² Visual RC primary navigation">
      {['Dashboard', 'Fleet Control', 'AI Vision (ODR)', 'Analytics', 'Settings'].map(tab => <button key={tab} type="button" role="tab" aria-selected={activeRcTab === tab} className={'rc-command-tab' + (activeRcTab === tab ? ' active' : '')} onClick={() => setActiveRcTab(tab)}>{tab}</button>)}
      <div className="rc-command-search">
        <button type="button" className="rc-search-toggle" aria-expanded={commandOpen} onClick={() => { setCommandOpen(value => !value); setCommandQuery(''); }}>⌕ <span>Search</span></button>
        {commandOpen && <div className="rc-command-popover">
          <input autoFocus value={commandQuery} onChange={event => setCommandQuery(event.target.value)} placeholder="Search entities: Battery, Camera Feed…" aria-label="Search operational entities"/>
          <div className="rc-command-results">
            {(commandQuery.trim() ? commandResults : commandEntities.slice(0, 4)).map(item => <button type="button" key={item.name} onClick={() => { setActiveRcTab(item.tab); setCommandOpen(false); setCommandQuery(''); }}>
              <span><b>{item.name}</b><small>{item.kind} · {item.detail}</small></span><i>↗</i>
            </button>)}
            {commandQuery.trim() && !commandResults.length && <p>No matching entity found.</p>}
          </div>
        </div>}
      </div>
    </div>
    {activeRcTab !== 'Dashboard' && <section className="rc-command-view" role="tabpanel">
      <header><div><span>IA² VISUAL RC · {activeRcTab.toUpperCase()}</span><h3>{activeRcTab === 'Fleet Control' ? 'Fleet control' : activeRcTab === 'AI Vision (ODR)' ? 'AI vision & object detection' : activeRcTab === 'Analytics' ? 'Operational analytics' : 'System settings'}</h3><p>Interface components are ready. Hardware and provider feeds remain unconnected until configured and verified.</p></div><b className="rc-disconnected-badge">NO LIVE TELEMETRY</b></header>
      {activeRcTab === 'Fleet Control' && <div className="rc-operational-grid">
        {['RC Unit 01', 'Battery', 'Motor & Drive', 'Sensors'].map((name, index) => <article className="rc-operational-card" key={name}><span>{['VEHICLE','POWER','MOTION','INPUT'][index]}</span><b>{name}</b><strong>Not connected</strong><small>No live hardware data available</small></article>)}
      </div>}
      {activeRcTab === 'AI Vision (ODR)' && <div className="rc-operational-grid">
        {['Camera Feed', 'AI Vision Engine', 'ODR Analysis'].map(name => <article className="rc-operational-card" key={name}><span>VISION SUBSYSTEM</span><b>{name}</b><strong>Not connected</strong><small>Camera or inference source required</small></article>)}
      </div>}
      {activeRcTab === 'Analytics' && <div className="rc-analytics-empty"><b>Analytics waiting for verified telemetry</b><p>Charts, event history, vehicle performance and ODR metrics will appear here after a real data source is connected. No sample figures are being presented as live data.</p></div>}
      {activeRcTab === 'Settings' && <div className="rc-operational-grid">
        <article className="rc-operational-card"><span>INTERFACE</span><b>Visual theme</b><strong>Light · 3D embossed</strong><small>Dark-mode configuration remains separate</small></article>
        <article className="rc-operational-card"><span>CONNECTIVITY</span><b>Hardware & cloud</b><strong>Setup required</strong><small>No credentials or device endpoints configured in this build</small></article>
      </div>}
      <div className="rc-system-flow"><span>COMMAND CENTER</span><i>→</i><span>RC VEHICLE</span><i>→</i><span>SENSORS</span><i>→</i><span>CLOUD</span></div>
    </section>}

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
        <button
          className={'rc-folder-button' + (openFolders[entity.key] ? ' is-open' : '')}
          type="button"
          aria-label={(openFolders[entity.key] ? 'Close ' : 'Open ') + entity.name + ' folder'}
          aria-expanded={!!openFolders[entity.key]}
          onClick={() => setOpenFolders(current => ({ ...current, [entity.key]: !current[entity.key] }))}
        >
          <span className="rc-folder-scene" aria-hidden="true">
            <span className="rc-folder-back"></span>
            <span className="rc-folder-paper"></span>
            <span className="rc-folder-body"></span>
            <span className="rc-folder-flap"></span>
            <span className="rc-folder-clasp"></span>
          </span>
          <span className="rc-folder-hint">{openFolders[entity.key] ? 'FOLDER OPEN' : 'OPEN FOLDER'}</span>
        </button>
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
