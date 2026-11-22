'use client';
import { useState } from 'react';
export default function ConsultationForm({initialService=''}) {
  const [form,setForm]=useState({name:'',email:'',phone:'',country:'',service:initialService,brief:'',preferred_time:'',consent:false,website:''});
  const [busy,setBusy]=useState(false);const [message,setMessage]=useState('');const [error,setError]=useState('');
  function update(key,value){setForm(v=>({...v,[key]:value}));}
  async function submit(event){event.preventDefault();setBusy(true);setError('');setMessage('');
    try{
      const response=await fetch('/api/consultation',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(form)});
      const data=await response.json();if(!response.ok)throw new Error(data.error||'Your enquiry could not be submitted.');
      setMessage('Your enquiry has been received. Reference: '+data.reference+'. Please keep this reference for follow-up.');
      setForm({name:'',email:'',phone:'',country:'',service:'',brief:'',preferred_time:'',consent:false,website:''});
    }catch(e){setError(e.message||'Submission failed. You may contact arefin.imran@gmail.com directly.');}
    finally{setBusy(false);}
  }
  return <form className="consultation-form" onSubmit={submit}>
    <div className="form-grid">
      <label>FULL NAME<input required maxLength={120} value={form.name} onChange={e=>update('name',e.target.value)} placeholder="Your name"/></label>
      <label>EMAIL ADDRESS<input required type="email" maxLength={180} value={form.email} onChange={e=>update('email',e.target.value)} placeholder="you@example.com"/></label>
      <label>PHONE / WHATSAPP (OPTIONAL)<input maxLength={40} value={form.phone} onChange={e=>update('phone',e.target.value)} placeholder="Include country code"/></label>
      <label>COUNTRY<input maxLength={80} value={form.country} onChange={e=>update('country',e.target.value)} placeholder="Your country"/></label>
      <label className="form-wide">SERVICE REQUIRED<select required value={form.service} onChange={e=>update('service',e.target.value)}><option value="">Select a service</option><option>Foreign Investment & International Business Advisory</option><option>Business Formation & Contracts</option><option>Corporate Compliance & Governance</option><option>Property & Real Estate</option><option>Personal & Family Legal Solutions</option><option>Litigation-Related Advisory</option><option>Document Review</option><option>Other / Not sure</option></select></label>
      <label className="form-wide">BRIEF DESCRIPTION<textarea required rows={5} maxLength={3000} value={form.brief} onChange={e=>update('brief',e.target.value)} placeholder="Briefly describe the issue, objective, relevant country and timeline. Do not include confidential details."/></label>
      <label className="form-wide">PREFERRED CONTACT TIME<input maxLength={100} value={form.preferred_time} onChange={e=>update('preferred_time',e.target.value)} placeholder="e.g. weekday afternoon, Bangladesh time"/></label>
      <label className="honeypot">Leave this field empty<input tabIndex="-1" autoComplete="off" value={form.website} onChange={e=>update('website',e.target.value)}/></label>
    </div>
    <label className="consent-row"><input type="checkbox" checked={form.consent} onChange={e=>update('consent',e.target.checked)} required/><span>I consent to THE ADVISOR using these details to respond to this enquiry. I understand this submission does not create a lawyer-client relationship.</span></label>
    <button className="button button-wine" disabled={busy}>{busy?'Submitting…':'Submit enquiry ↗'}</button>
    {error&&<p className="form-error" role="alert">{error} You can also email <a href="mailto:arefin.imran@gmail.com">arefin.imran@gmail.com</a>.</p>}
    {message&&<p className="form-success" role="status">{message}</p>}
  </form>;
}