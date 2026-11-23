'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';

const STATUS_OPTIONS = [
  { value: 'new', label: 'New' },
  { value: 'reviewing', label: 'Reviewing' },
  { value: 'contacted', label: 'Contacted' },
  { value: 'closed', label: 'Closed' },
  { value: 'spam', label: 'Spam' },
];

const dateLabel = value => value
  ? new Date(value).toLocaleString('en-GB', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })
  : '—';

export default function ConsultationInbox({ org, supabase }) {
  const [requests, setRequests] = useState([]);
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState('');
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');

  const load = useCallback(async () => {
    if (!org?.id || !supabase) return;
    setLoading(true);
    setError('');
    const { data, error: queryError } = await supabase
      .from('adviser_consultation_requests')
      .select('id,reference,name,email,phone,country,service,brief,preferred_time,status,source,created_at,consent_at')
      .eq('organization_id', org.id)
      .order('created_at', { ascending: false })
      .limit(100);
    if (queryError) {
      setError('Consultation requests could not be loaded. Check the signed-in account role and database access.');
    } else {
      setRequests(data || []);
    }
    setLoading(false);
  }, [org?.id, supabase]);

  useEffect(() => { load(); }, [load]);

  async function changeStatus(request, status) {
    if (!org?.id || savingId) return;
    setSavingId(request.id);
    setError('');
    setNotice('');
    const { data, error: updateError } = await supabase
      .from('adviser_consultation_requests')
      .update({ status })
      .eq('id', request.id)
      .eq('organization_id', org.id)
      .select('id,status')
      .single();
    setSavingId('');
    if (updateError || !data) {
      setError('The request status was not changed. Refresh and try again.');
      return;
    }
    setRequests(items => items.map(item => item.id === request.id ? { ...item, status: data.status } : item));
    setNotice(request.reference + ' status updated to ' + status + '.');
  }

  const visible = useMemo(() => {
    const term = search.trim().toLowerCase();
    return requests.filter(item =>
      (filter === 'all' || item.status === filter) &&
      (!term || [item.reference, item.name, item.email, item.country, item.service, item.brief]
        .filter(Boolean).join(' ').toLowerCase().includes(term))
    );
  }, [requests, filter, search]);

  const counts = useMemo(() => STATUS_OPTIONS.reduce((acc, item) => {
    acc[item.value] = requests.filter(request => request.status === item.value).length;
    return acc;
  }, {}), [requests]);

  return (
    <section className="os-panel">
      <div className="os-panel-head">
        <div>
          <h2>Consultation inbox</h2>
          <p>Private review of enquiries submitted through The Adviser website. Treat all enquiry details as confidential.</p>
        </div>
        <span className="os-count">{requests.length} requests</span>
      </div>

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, alignItems: 'center', margin: '16px 0' }}>
        <input
          aria-label="Search consultation requests"
          value={search}
          onChange={event => setSearch(event.target.value)}
          placeholder="Search name, reference, service or brief…"
          style={{ flex: '1 1 230px', minWidth: 0, height: 40, padding: '0 12px', border: '1px solid var(--os-border, #e3e3dc)', borderRadius: 8, background: 'var(--os-surface, #fff)', color: 'inherit' }}
        />
        <select aria-label="Filter consultation status" value={filter} onChange={event => setFilter(event.target.value)} style={{ height: 40, padding: '0 10px', border: '1px solid var(--os-border, #e3e3dc)', borderRadius: 8, background: 'var(--os-surface, #fff)', color: 'inherit' }}>
          <option value="all">All statuses ({requests.length})</option>
          {STATUS_OPTIONS.map(option => <option key={option.value} value={option.value}>{option.label} ({counts[option.value] || 0})</option>)}
        </select>
        <button type="button" className="os-refresh" onClick={load} disabled={loading}>{loading ? 'Loading…' : '↻ Refresh'}</button>
      </div>

      {error && <div className="os-alert error" role="alert">{error}</div>}
      {notice && <div className="os-alert success" role="status">{notice}</div>}
      {loading ? (
        <div className="os-loading"><span className="os-spinner" /> Loading private enquiries…</div>
      ) : visible.length ? (
        <div style={{ display: 'grid', gap: 12 }}>
          {visible.map(request => (
            <article key={request.id} style={{ padding: 16, border: '1px solid var(--os-border, #e5e5dd)', borderRadius: 10, background: 'var(--os-surface, #fff)' }}>
              <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12 }}>
                <div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 8 }}>
                    <strong style={{ fontSize: 14 }}>{request.name}</strong>
                    <span className="os-chip">{request.reference}</span>
                  </div>
                  <small style={{ display: 'block', marginTop: 5, opacity: .7 }}>{dateLabel(request.created_at)} · {request.country || 'Country not supplied'} · {request.source || 'Website'}</small>
                </div>
                <select
                  aria-label={'Update status for ' + request.reference}
                  value={request.status}
                  disabled={savingId === request.id}
                  onChange={event => changeStatus(request, event.target.value)}
                  style={{ height: 36, padding: '0 9px', border: '1px solid var(--os-border, #e3e3dc)', borderRadius: 7, background: 'var(--os-surface, #fff)', color: 'inherit' }}
                >
                  {STATUS_OPTIONS.map(option => <option key={option.value} value={option.value}>{option.label}</option>)}
                </select>
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, margin: '12px 0', fontSize: 12 }}>
                <a href={'mailto:' + encodeURIComponent(request.email)}>{request.email}</a>
                {request.phone && <a href={'tel:' + request.phone}>{request.phone}</a>}
                <strong>{request.service}</strong>
              </div>
              <p style={{ margin: 0, fontSize: 12, lineHeight: 1.7, whiteSpace: 'pre-wrap', overflowWrap: 'anywhere' }}>{request.brief}</p>
              {request.preferred_time && <small style={{ display: 'block', marginTop: 10, opacity: .7 }}>Preferred contact time: {request.preferred_time}</small>}
              <small style={{ display: 'block', marginTop: 8, opacity: .55 }}>Consent recorded: {dateLabel(request.consent_at)}</small>
            </article>
          ))}
        </div>
      ) : (
        <div className="os-empty">{requests.length ? 'No enquiries match this filter.' : 'No website enquiries have been received yet. New submissions will appear here after the public intake form is used.'}</div>
      )}
      <p style={{ margin: '16px 0 0', fontSize: 11, opacity: .65, lineHeight: 1.6 }}>Do not paste privileged documents, identity records or confidential case material into public channels. This inbox is for initial enquiry triage, not a substitute for conflict checks or a formal engagement process.</p>
    </section>
  );
}
