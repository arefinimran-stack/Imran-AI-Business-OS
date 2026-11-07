'use client';

import { useMemo, useState } from 'react';

type Task = { id: number; title: string; detail: string; due: string; priority: 'Today' | 'Upcoming'; done: boolean };

const initialTasks: Task[] = [
  { id: 1, title: 'Review new client intake', detail: 'New enquiry · Intake checklist', due: 'Today', priority: 'Today', done: false },
  { id: 2, title: 'Prepare hearing file checklist', detail: 'Matter L-024 · Court preparation', due: 'Today', priority: 'Today', done: false },
  { id: 3, title: 'Follow up on outstanding documents', detail: 'Matter L-018 · Client follow-up', due: 'Tomorrow', priority: 'Upcoming', done: false },
  { id: 4, title: 'Confirm next consultation', detail: 'Prospective client · Scheduling', due: '12 Nov', priority: 'Upcoming', done: true },
];

const workflows = [
  { title: 'New enquiry → intake checklist', step: 'STEP 1 OF 4', detail: 'Capture contact details, requested service, urgency, and a conflict-check reminder.' },
  { title: 'Matter → deadline follow-up', step: 'READY', detail: 'Track a due date and assign a human owner for review and reminders.' },
  { title: 'Document request → status check', step: 'READY', detail: 'Use a checklist to note requested, received, and reviewed documents.' },
];

export default function LegalWorkspace() {
  const [tasks, setTasks] = useState(initialTasks);
  const [showAll, setShowAll] = useState(false);
  const [intakeCreated, setIntakeCreated] = useState(false);
  const openCount = useMemo(() => tasks.filter((task) => !task.done).length, [tasks]);
  const visibleTasks = showAll ? tasks : tasks.slice(0, 3);

  function toggleTask(id: number) {
    setTasks((current) => current.map((task) => task.id === id ? { ...task, done: !task.done } : task));
  }

  return (
    <div className="shell">
      <aside className="sidebar">
        <div className="brand"><div className="brand-mark">IA</div><div><h1>IMRAN AI BUSINESS OS</h1><p>Personal business workspace</p></div></div>
        <nav aria-label="Main navigation">
          <div className="nav-label">Workspace</div>
          <div className="nav-item active">▦ &nbsp; Executive overview</div>
          <div className="nav-item">◉ &nbsp; Legal matters</div>
          <div className="nav-item">✓ &nbsp; Tasks & deadlines</div>
          <div className="nav-item">♧ &nbsp; Clients & intake</div>
          <div className="nav-label">Coming next</div>
          <div className="nav-item">▤ &nbsp; Documents</div>
          <div className="nav-item">◷ &nbsp; Calendar</div>
        </nav>
        <div className="sidebar-note"><strong>Private workspace starter</strong><br />Demo content only. Connect secure storage and access controls before using client information.</div>
      </aside>

      <main>
        <div className="topbar"><span className="eyebrow">Legal Chamber / Executive overview</span><div className="topbar-right"><span>Advocate workspace</span><span className="avatar" aria-label="Imran Arefin">IA</span></div></div>
        <div className="heading-row"><div><h2>Good morning, Imran</h2><p className="subtitle">A clear view of your legal work and next actions.</p></div><div className="date-pill">◷ &nbsp; Saturday, 7 November 2026</div></div>

        <section className="stats" aria-label="Workspace summary">
          <div className="card stat"><div className="stat-label">Open matters</div><div className="stat-value">12</div><div className="stat-foot">Across active work</div></div>
          <div className="card stat"><div className="stat-label">Tasks to complete</div><div className="stat-value">{openCount}</div><div className="stat-foot">Demo task list</div></div>
          <div className="card stat"><div className="stat-label">Upcoming deadlines</div><div className="stat-value">3</div><div className="stat-foot">Human review required</div></div>
          <div className="card stat"><div className="stat-label">New enquiries</div><div className="stat-value">2</div><div className="stat-foot">Intake follow-up needed</div></div>
        </section>

        <div className="content-grid">
          <section className="card panel">
            <div className="panel-head"><div><h3 className="panel-title">Priority tasks</h3><p className="panel-caption">A sample list for today and the days ahead.</p></div><button className="text-button" onClick={() => setShowAll(!showAll)}>{showAll ? 'Show less' : 'View all'}</button></div>
            <div className="task-list">{visibleTasks.map((task) => <label className="task" key={task.id}><input type="checkbox" checked={task.done} onChange={() => toggleTask(task.id)} aria-label={`Mark ${task.title} ${task.done ? 'incomplete' : 'complete'}`} /><div className="task-copy"><strong style={{ textDecoration: task.done ? 'line-through' : 'none', color: task.done ? '#8a958f' : undefined }}>{task.title}</strong><span>{task.detail}</span></div><span className={`badge ${task.priority === 'Today' ? 'urgent' : ''}`}>{task.due}</span></label>)}</div>
          </section>
          <section className="card panel">
            <div className="panel-head"><div><h3 className="panel-title">Workflow automations</h3><p className="panel-caption">Suggested human-supervised workflows.</p></div></div>
            <div className="workflow-list">{workflows.map((workflow) => <div className="workflow" key={workflow.title}><div className="workflow-top"><strong>{workflow.title}</strong><span className="workflow-step">{workflow.step}</span></div><p>{workflow.detail}</p></div>)}</div>
          </section>
        </div>

        <section className="card intake"><div className="intake-row"><div><h3 className="panel-title">Start a new enquiry</h3><p>{intakeCreated ? 'Demo intake started. No client information was saved.' : 'Create a placeholder intake workflow; details are not stored in this demo.'}</p></div><button className="primary-button" onClick={() => setIntakeCreated(true)}>{intakeCreated ? 'Intake started ✓' : '+ Start intake workflow'}</button></div></section>
        <div className="notice"><strong>Important:</strong> This is a front-end starter using fictional sample data. It does not store data, send reminders, perform conflict checks, provide legal advice, or protect confidential client information. Add authentication, role-based access, encrypted persistence, audit logs, backups, and jurisdiction-appropriate privacy controls before production use.</div>
        <p className="footer-note">Imran AI Business OS · Phase 1 foundation · Sample interface only</p>
      </main>
    </div>
  );
}
