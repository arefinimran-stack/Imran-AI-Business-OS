'use client';
import { useCallback, useEffect, useState } from 'react';

export default function ConsultationInbox({org,supabase}){
 const [items,setItems]=useState([]);const [loading,setLoading]=useState(true);const [error,setError]=useState('');const [filter,setFilter]=useState('all');const [busyId,setBusyId]=useState('');
 const load=useCallback(async()=>{
  if(!org?.id)return;setLoading(true);setError('');
  const {data,error}=await supabase.from('adviser_consultation_requests').select('id,reference,created_at,name,email,phone,country,service,brief,preferred_time,status,consent_at').eq('organization_id',org.id).order('created_at',{ascending:false}).limit(100);
  if(error)setError(error.message);else setItems(data||[]);setLoading(false);
 },[org?.id,supabase]);
 useEffect(()=>{load();},[load]);
 async function updateStatus(id,status){
  setBusyId(id);setError('');
  const {data,error}=await supabase.from('adviser_consultation_requests').update({status}).eq('id',id).eq('organization_id',org.id).select('id,status').single();
  if(error)setError(error.message);else setItems(rows=>rows.map(row=>row.id===id?{...row,status:data.status}:row));
  setBusyId('');
 }
 const counts={new:items.filter(x=>x.status==='new').length,reviewing:items.filter(x=>x.status==='reviewing').length,contacted:items.filter(x=>x.status==='contacted').length,closed:items.filter(x=>x.status==='closed').length};
 const visible=filter==='all'?items:items.filter(x=>x.status===filter);
 return <section className="rc-inbox">
  <div className="rc-relay-heading"><div><span>THE ADVISER · PRIVATE INTAKE</span><h2>Consultation Inbox</h2><p>Public website enquiries are stored in Supabase and visible only to authorised legal-team members.</p></div><div className="rc-relay-mark">✉</div></div>
  <div className="rc-kpi-grid rc-inbox-kpis"><article><span>NEW</span><strong>{counts.new}</strong><small>Awaiting review</small></article><article><span>REVIEWING</span><strong>{counts.reviewing}</strong><small>Under assessment</small></article><article><span>CONTACTED</span><strong>{counts.contacted}</strong><small>Response initiated</small></article><article><span>CLOSED</span><strong>{counts.closed}</strong><small>Completed / archived</small></article></div>
  <div className="rc-inbox-toolbar"><div><span>ENQUIRY REGISTER</span><h3>{items.length} recent enquiries</h3></div><div><select value={filter} onChange={e=>setFilter(e.target.value)}><option value="all">All statuses</option><option value="new">New</option><option value="reviewing">Reviewing</option><option value="contacted">Contacted</option><option value="closed">Closed</option><option value="spam">Spam</option></select><button onClick={load} disabled={loading}>{loading?'Loading…':'↻ Refresh'}</button></div></div>
  {error&&<div className="rc-relay-error">{error}</div>}
  {loading?<div className="rc-health-empty">Loading enquiries…</div>:visible.length===0?<div className="rc-health-empty">No enquiries in this view.</div>:<div className="rc-inbox-list">{visible.map(item=><article className="rc-inbox-card" key={item.id}>
    <div className="rc-inbox-card-top"><div><span>{item.reference}</span><small>{new Date(item.created_at).toLocaleString('en-GB')}</small></div><select value={item.status} disabled={busyId===item.id} onChange={e=>updateStatus(item.id,e.target.value)}><option value="new">New</option><option value="reviewing">Reviewing</option><option value="contacted">Contacted</option><option value="closed">Closed</option><option value="spam">Spam</option></select></div>
    <h4>{item.name}</h4><div className="rc-inbox-contact"><a href={'mailto:'+item.email}>{item.email}</a>{item.phone&&<span>{item.phone}</span>}<span>{item.country||'Country not supplied'}</span></div>
    <b className="rc-inbox-service">{item.service}</b><p>{item.brief}</p>{item.preferred_time&&<small>Preferred time: {item.preferred_time}</small>}
  </article>)}</div>}
  <div className="rc-health-note">Enquiry details are personal information. Review only for the stated purpose, use a secure channel for follow-up and do not treat an enquiry as an accepted engagement.</div>
 </section>;
}