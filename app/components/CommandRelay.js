'use client';

import { useState } from 'react';

export default function CommandRelay() {
  const [command, setCommand] = useState('');
  const [agentKey, setAgentKey] = useState('command-orchestrator');
  const [reply, setReply] = useState('');
  const [proposals, setProposals] = useState([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');

  async function submit(event) {
    event.preventDefault();
    if (!command.trim()) return;
    setBusy(true); setError(''); setNotice(''); setReply(''); setProposals([]);
    try {
      const response = await fetch('/api/command', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ command: command.trim(), agent_key: agentKey })
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'The command could not be processed.');
      setReply(data.reply || 'The command was received.');
      setProposals(data.proposals || []);
      setCommand('');
      if (!data.proposals?.length) setNotice('Analysis completed. No external action was taken.');
    } catch (e) {
      setError(e.message || 'Command relay unavailable.');
    } finally {
      setBusy(false);
    }
  }

  async function decide(proposal, decision) {
    setBusy(true); setError(''); setNotice('');
    try {
      const response = await fetch('/api/command/approval', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ approval_id: proposal.approval_id, decision })
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'The approval could not be processed.');
      setProposals(items => items.map(item => item.approval_id === proposal.approval_id
        ? { ...item, decision, outcome: data.message || (decision === 'approved' ? 'Approved and processed.' : 'Rejected.') }
        : item));
      setNotice(data.message || (decision === 'approved' ? 'Approved action processed.' : 'Action rejected.'));
    } catch (e) {
      setError(e.message || 'Approval action failed.');
    } finally {
      setBusy(false);
    }
  }

  return <section className="rc-relay">
    <div className="rc-relay-heading">
      <div><span>FOUNDER AUTHORITY GATE</span><h2>Command Relay</h2><p>Issue a direction in plain language. The system can analyse it, prepare internal drafts and ask you before permitted write actions.</p></div>
      <div className="rc-relay-mark">⌘</div>
    </div>

    <div className="rc-relay-safety">
      <b>Approval policy active</b>
      <span>Internal task creation and document drafts can be proposed for your approval. Public publishing, email, payments, legal filings, external commitments and access changes are not enabled by this relay.</span>
    </div>

    <form className="rc-command-form" onSubmit={submit}>
      <label htmlFor="rc-command-agent">DIRECT THE SPECIALIST</label>
      <select id="rc-command-agent" value={agentKey} onChange={e => setAgentKey(e.target.value)} disabled={busy}>
        <option value="command-orchestrator">Founder Command Orchestrator</option>
        <option value="market-intelligence">Market Intelligence</option>
      </select>
      <label htmlFor="rc-command-input">YOUR COMMAND</label>
      <textarea id="rc-command-input" rows={5} maxLength={5000} value={command} onChange={e => setCommand(e.target.value)} placeholder="Example: Review the current IA² entity status, identify the most important blocker, and prepare a task for the next verified action." required/>
      <div className="rc-command-bottom"><small>Do not enter confidential client information, passwords, API keys or privileged case material.</small><button type="submit" disabled={busy || !command.trim()}>{busy ? 'Processing…' : 'Send command ↗'}</button></div>
    </form>

    {error && <div className="rc-relay-error" role="alert">{error}</div>}
    {notice && <div className="rc-relay-notice" role="status">{notice}</div>}
    {reply && <section className="rc-relay-response"><span>COMMAND RESPONSE</span><p>{reply}</p></section>}

    {proposals.length > 0 && <section className="rc-approval-list">
      <div className="rc-section-title"><div><span>FOUNDER DECISION REQUIRED</span><h3>Review proposed actions</h3></div></div>
      {proposals.map(proposal => <article className="rc-approval-card" key={proposal.approval_id}>
        <div><span className="rc-approval-type">{proposal.action_key}</span><h4>{proposal.target_summary}</h4><p>{proposal.reason}</p></div>
        {proposal.decision
          ? <div className="rc-approval-result">{proposal.outcome || proposal.decision}</div>
          : <div className="rc-approval-actions">
              <button className="rc-yes" disabled={busy} onClick={() => decide(proposal, 'approved')}>YES · APPROVE</button>
              <button className="rc-no" disabled={busy} onClick={() => decide(proposal, 'rejected')}>NO · REJECT</button>
            </div>}
      </article>)}
    </section>}
  </section>;
}
