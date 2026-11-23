'use client';
import { useEffect, useMemo, useState } from 'react';
import { useSiteLanguage } from './SiteShell';

const templateNames={nda:'Non-Disclosure Agreement',service:'Service Agreement',rental:'Rental Agreement',demand:'Demand Notice',board:'Board Resolution',poa:'Power of Attorney'};
const templateNamesBn={nda:'গোপনীয়তা চুক্তি',service:'সেবা চুক্তি',rental:'ভাড়া চুক্তি',demand:'দাবি-সংক্রান্ত নোটিশ',board:'বোর্ড রেজল্যুশন',poa:'আমমোক্তারনামা'};
const fieldSets={
  nda:[['partyA','Disclosing party'],['partyB','Receiving party'],['purpose','Purpose of disclosure'],['date','Effective date'],['duration','Confidentiality period']],
  service:[['partyA','Service provider'],['partyB','Client'],['service','Description of services'],['fee','Fee / payment terms'],['date','Start date']],
  rental:[['partyA','Landlord'],['partyB','Tenant'],['property','Property address / description'],['rent','Rent and payment date'],['term','Tenancy period']],
  demand:[['partyA','Sender / claimant'],['partyB','Recipient'],['subject','Subject of demand'],['amount','Amount / obligation (if applicable)'],['deadline','Requested response date']],
  board:[['company','Company name'],['meeting','Meeting date'],['attendees','Attendees / directors'],['resolution','Resolution proposed'],['effective','Effective date']],
  poa:[['principal','Principal'],['attorney','Attorney / agent'],['powers','Specific powers granted'],['duration','Duration / termination'],['date','Execution date']]
};
const fieldLabelsBn={
 nda:{partyA:'তথ্য প্রকাশকারী পক্ষ',partyB:'তথ্য গ্রহণকারী পক্ষ',purpose:'তথ্য প্রকাশের উদ্দেশ্য',date:'কার্যকর হওয়ার তারিখ',duration:'গোপনীয়তার মেয়াদ'},
 service:{partyA:'সেবা প্রদানকারী',partyB:'গ্রাহক',service:'সেবার বিবরণ',fee:'ফি / পেমেন্টের শর্ত',date:'শুরুর তারিখ'},
 rental:{partyA:'বাড়িওয়ালা',partyB:'ভাড়াটিয়া',property:'সম্পত্তির ঠিকানা / বিবরণ',rent:'ভাড়া ও পরিশোধের তারিখ',term:'ভাড়ার মেয়াদ'},
 demand:{partyA:'প্রেরক / দাবিদার',partyB:'প্রাপক',subject:'দাবির বিষয়',amount:'পরিমাণ / দায়বদ্ধতা (প্রযোজ্য হলে)',deadline:'জবাবের অনুরোধকৃত তারিখ'},
 board:{company:'কোম্পানির নাম',meeting:'সভারের তারিখ',attendees:'উপস্থিত / পরিচালকবৃন্দ',resolution:'প্রস্তাবিত রেজল্যুশন',effective:'কার্যকর হওয়ার তারিখ'},
 poa:{principal:'আমমোক্তারদাতা',attorney:'আমমোক্তার / প্রতিনিধি',powers:'প্রদত্ত নির্দিষ্ট ক্ষমতা',duration:'মেয়াদ / সমাপ্তি',date:'সম্পাদনের তারিখ'}
};
function buildDraft(type, values, language) {
  const title=(language==='Bangla'?templateNamesBn[type]:templateNames[type]).toUpperCase();
  const details=Object.entries(values).filter(([,v])=>String(v||'').trim()).map(([k,v])=>(language==='Bangla'?(fieldLabelsBn[type]?.[k]||k):k.replaceAll('_',' ').toUpperCase())+': '+v).join('\n');
  if(language==='Bangla') return 'নমুনা দলিল — আইনজীবীর পর্যালোচনা প্রয়োজন\n\n'+title+'\n\nপ্রদত্ত তথ্য:\n'+details+'\n\nশর্তাবলি, প্রযোজ্য আইন, স্ট্যাম্প, নিবন্ধন ও স্বাক্ষরের প্রয়োজনীয়তা নির্দিষ্ট ঘটনার ভিত্তিতে আইনজীবীর মাধ্যমে যাচাই করতে হবে। এই খসড়া ব্যক্তিগত আইনি পরামর্শ নয়।';
  return title+'\n\nWORKING TEMPLATE — SUBJECT TO LEGAL REVIEW\n\nPARTIES AND KEY DETAILS\n'+details+'\n\n1. PURPOSE AND SCOPE\nThe parties intend to record the arrangement described above. The precise rights, obligations, representations and conditions must be completed and reviewed against the transaction and applicable law.\n\n2. OBLIGATIONS\nEach party shall perform the obligations expressly agreed in the final reviewed document. Insert detailed obligations, timelines, deliverables and remedies before execution.\n\n3. TERM AND TERMINATION\nThe term and any termination rights must be completed to reflect the parties’ agreement and applicable law.\n\n4. GOVERNING LAW AND DISPUTES\nInsert the applicable governing law, jurisdiction and dispute-resolution mechanism only after legal review.\n\n5. EXECUTION\nThe parties should sign the final version only after confirming identity, authority, stamp duty, registration and any required formalities.\n\nIMPORTANT: This is a self-help starting template, not individualized legal advice. It may be incomplete or unsuitable for your facts. Obtain review by a qualified lawyer before signing, serving or relying on it.';
}
export default function DocumentStudioApp(){
  const siteLanguage=useSiteLanguage();
  const [type,setType]=useState('nda');const [language,setLanguage]=useState(siteLanguage==='bn'?'Bangla':'English');const [values,setValues]=useState({});const [draft,setDraft]=useState('');
  useEffect(()=>{setLanguage(siteLanguage==='bn'?'Bangla':'English');setDraft('');},[siteLanguage]);
  const bn=language==='Bangla';
  const fields=fieldSets[type];const canGenerate=fields.some(([key])=>String(values[key]||'').trim());
  function update(key,value){setValues(v=>({...v,[key]:value}));}
  function generate(){setDraft(buildDraft(type,values,language));}
  function download(){if(!draft)return;const blob=new Blob([draft],{type:'text/plain;charset=utf-8'});const url=URL.createObjectURL(blob);const a=document.createElement('a');a.href=url;a.download=(bn?templateNamesBn[type]:templateNames[type]).toLowerCase().replaceAll(' ','-')+'-working-draft.txt';a.click();URL.revokeObjectURL(url);}
  const printReady=useMemo(()=>draft.length>0,[draft]);
  return <div className="doc-builder">
    <div className="doc-builder-form">
      <label>{bn?'ডকুমেন্টের ধরন':'DOCUMENT TYPE'}<select value={type} onChange={e=>{setType(e.target.value);setDraft('');setValues({});}}>{Object.entries(templateNames).map(([key,name])=><option key={key} value={key}>{bn?templateNamesBn[key]:name}</option>)}</select></label>
      <label>{bn?'ভাষা':'LANGUAGE'}<select value={language} onChange={e=>{setLanguage(e.target.value);setDraft('');}}><option value="English">English</option><option value="Bangla">বাংলা</option></select></label>
      {fields.map(([key,fieldLabel])=><label key={key}>{(bn?(fieldLabelsBn[type]?.[key]||fieldLabel):fieldLabel).toUpperCase()}<input value={values[key]||''} onChange={e=>update(key,e.target.value)} placeholder={(bn?'লিখুন: ':'Enter ')+((bn?(fieldLabelsBn[type]?.[key]||fieldLabel):fieldLabel).toLowerCase())}/></label>)}
      <button className="button button-wine" onClick={generate} disabled={!canGenerate}>{bn?'খসড়া তৈরি করুন ↗':'Generate working draft ↗'}</button>
      <small>{bn?'তথ্য এই ব্রাউজার সেশনে থাকে; এই টুল আপনার ইনপুট সার্ভারে আপলোড করে না।':'Information stays in this browser session; this tool does not upload your entries.'}</small>
    </div>
    <div className="doc-builder-preview">
      <div className="preview-head"><span>{bn?'সম্পাদনাযোগ্য প্রিভিউ':'EDITABLE PREVIEW'}</span><b>{draft?(bn?'খসড়া প্রস্তুত':'DRAFT READY'):(bn?'তথ্যের অপেক্ষায়':'AWAITING INPUT')}</b></div>
      {draft?<pre>{draft}</pre>:<div className="preview-empty"><span>▤</span><b>{bn?'আপনার ডকুমেন্টের প্রিভিউ এখানে দেখা যাবে।':'Your document preview will appear here.'}</b><small>{bn?'প্রাসঙ্গিক তথ্য পূরণ করে খসড়া তৈরি করুন।':'Complete the relevant fields and generate a working template.'}</small></div>}
      {printReady&&<div className="preview-actions"><button onClick={download}>{bn?'TXT ডাউনলোড':'Download TXT'}</button><button onClick={()=>window.print()}>{bn?'প্রিন্ট / PDF সংরক্ষণ':'Print / Save PDF'}</button><a href="/consultation?service=Document%20Review">{bn?'ডকুমেন্ট পর্যালোচনা সম্পর্কে যোগাযোগ ↗':'Contact about document review ↗'}</a></div>}
    </div>
  </div>;
}