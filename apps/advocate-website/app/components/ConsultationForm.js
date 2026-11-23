'use client';
import { useState } from 'react';
import { useSiteLanguage } from './SiteShell';
export default function ConsultationForm({initialService=''}) {
  const language = useSiteLanguage();
  const bn = language === 'bn';
  const [form,setForm]=useState({name:'',email:'',phone:'',country:'',service:initialService,brief:'',preferred_time:'',consent:false,website:''});
  const [busy,setBusy]=useState(false);const [message,setMessage]=useState('');const [error,setError]=useState('');
  function update(key,value){setForm(v=>({...v,[key]:value}));}
  async function submit(event){event.preventDefault();setBusy(true);setError('');setMessage('');
    try{
      const response=await fetch('/api/consultation',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(form)});
      const data=await response.json();if(!response.ok)throw new Error(data.error||(bn?'আপনার অনুসন্ধান জমা দেওয়া যায়নি।':'Your enquiry could not be submitted.'));
      setMessage((bn?'আপনার অনুসন্ধান গ্রহণ করা হয়েছে। রেফারেন্স: ':'Your enquiry has been received. Reference: ')+data.reference+(bn?'। পরবর্তী যোগাযোগের জন্য রেফারেন্সটি সংরক্ষণ করুন।':'. Please keep this reference for follow-up.'));
      setForm({name:'',email:'',phone:'',country:'',service:'',brief:'',preferred_time:'',consent:false,website:''});
    }catch(e){setError(e.message||(bn?'জমা দেওয়া যায়নি। আপনি সরাসরি ইমেইল করতে পারেন।':'Submission failed. You may contact arefin.imran@gmail.com directly.'));}
    finally{setBusy(false);}
  }
  return <form className="consultation-form" onSubmit={submit}>
    <div className="form-grid">
      <label>{bn?'পূর্ণ নাম':'FULL NAME'}<input required maxLength={120} value={form.name} onChange={e=>update('name',e.target.value)} placeholder={bn?'আপনার নাম':'Your name'}/></label>
      <label>{bn?'ইমেইল ঠিকানা':'EMAIL ADDRESS'}<input required type="email" maxLength={180} value={form.email} onChange={e=>update('email',e.target.value)} placeholder="you@example.com"/></label>
      <label>{bn?'ফোন / হোয়াটসঅ্যাপ (ঐচ্ছিক)':'PHONE / WHATSAPP (OPTIONAL)'}<input maxLength={40} value={form.phone} onChange={e=>update('phone',e.target.value)} placeholder={bn?'দেশের কোডসহ নম্বর':'Include country code'}/></label>
      <label>{bn?'দেশ':'COUNTRY'}<input maxLength={80} value={form.country} onChange={e=>update('country',e.target.value)} placeholder={bn?'আপনার দেশ':'Your country'}/></label>
      <label className="form-wide">{bn?'কী ধরনের সেবা প্রয়োজন':'SERVICE REQUIRED'}<select required value={form.service} onChange={e=>update('service',e.target.value)}><option value="">{bn?'সেবা নির্বাচন করুন':'Select a service'}</option><option value="Foreign Investment & International Business Advisory">{bn?'বিদেশি বিনিয়োগ ও আন্তর্জাতিক ব্যবসায়িক পরামর্শ':'Foreign Investment & International Business Advisory'}</option><option value="Business Formation & Contracts">{bn?'ব্যবসা গঠন ও চুক্তি':'Business Formation & Contracts'}</option><option value="Corporate Compliance & Governance">{bn?'করপোরেট কমপ্লায়েন্স ও সুশাসন':'Corporate Compliance & Governance'}</option><option value="Property & Real Estate">{bn?'সম্পত্তি ও রিয়েল এস্টেট':'Property & Real Estate'}</option><option value="Personal & Family Legal Solutions">{bn?'ব্যক্তিগত ও পারিবারিক আইনি সমাধান':'Personal & Family Legal Solutions'}</option><option value="Litigation-Related Advisory">{bn?'মামলা-সংক্রান্ত পরামর্শ':'Litigation-Related Advisory'}</option><option value="Document Review">{bn?'ডকুমেন্ট পর্যালোচনা':'Document Review'}</option><option value="Other / Not sure">{bn?'অন্যান্য / নিশ্চিত নই':'Other / Not sure'}</option></select></label>
      <label className="form-wide">{bn?'বিষয়ের সংক্ষিপ্ত বিবরণ':'BRIEF DESCRIPTION'}<textarea required rows={5} maxLength={3000} value={form.brief} onChange={e=>update('brief',e.target.value)} placeholder={bn?'সমস্যা, উদ্দেশ্য, সংশ্লিষ্ট দেশ এবং সময়সীমা সংক্ষেপে লিখুন। গোপনীয় তথ্য দেবেন না।':'Briefly describe the issue, objective, relevant country and timeline. Do not include confidential details.'}/></label>
      <label className="form-wide">{bn?'যোগাযোগের পছন্দের সময়':'PREFERRED CONTACT TIME'}<input maxLength={100} value={form.preferred_time} onChange={e=>update('preferred_time',e.target.value)} placeholder={bn?'যেমন: কর্মদিবসে বিকেল, বাংলাদেশ সময়':'e.g. weekday afternoon, Bangladesh time'}/></label>
      <label className="honeypot">{bn?'এই ঘরটি খালি রাখুন':'Leave this field empty'}<input tabIndex="-1" autoComplete="off" value={form.website} onChange={e=>update('website',e.target.value)}/></label>
    </div>
    <label className="consent-row"><input type="checkbox" checked={form.consent} onChange={e=>update('consent',e.target.checked)} required/><span>{bn?'আমি সম্মতি দিচ্ছি যে THE ADVISOR এই তথ্য ব্যবহার করে আমার অনুসন্ধানের উত্তর দিতে পারবে। আমি বুঝি, এই ফর্ম জমা দিলে আইনজীবী-মক্কেল সম্পর্ক তৈরি হয় না।':'I consent to THE ADVISOR using these details to respond to this enquiry. I understand this submission does not create a lawyer-client relationship.'}</span></label>
    <button className="button button-wine" disabled={busy}>{busy?(bn?'জমা হচ্ছে…':'Submitting…'):(bn?'অনুসন্ধান জমা দিন ↗':'Submit enquiry ↗')}</button>
    {error&&<p className="form-error" role="alert">{error} {bn?'সরাসরি ইমেইল করুন:':'You can also email'} <a href="mailto:arefin.imran@gmail.com">arefin.imran@gmail.com</a>.</p>}
    {message&&<p className="form-success" role="status">{message}</p>}
  </form>;
}