'use client';
import { useMemo, useState } from 'react';

const templateNames={nda:'Non-Disclosure Agreement',service:'Service Agreement',rental:'Rental Agreement',demand:'Demand Notice',board:'Board Resolution',poa:'Power of Attorney'};
const fieldSets={
  nda:[['partyA','Disclosing party'],['partyB','Receiving party'],['purpose','Purpose of disclosure'],['date','Effective date'],['duration','Confidentiality period']],
  service:[['partyA','Service provider'],['partyB','Client'],['service','Description of services'],['fee','Fee / payment terms'],['date','Start date']],
  rental:[['partyA','Landlord'],['partyB','Tenant'],['property','Property address / description'],['rent','Rent and payment date'],['term','Tenancy period']],
  demand:[['partyA','Sender / claimant'],['partyB','Recipient'],['subject','Subject of demand'],['amount','Amount / obligation (if applicable)'],['deadline','Requested response date']],
  board:[['company','Company name'],['meeting','Meeting date'],['attendees','Attendees / directors'],['resolution','Resolution proposed'],['effective','Effective date']],
  poa:[['principal','Principal'],['attorney','Attorney / agent'],['powers','Specific powers granted'],['duration','Duration / termination'],['date','Execution date']]
};
function buildDraft(type, values, language) {
  const title=templateNames[type].toUpperCase();
  const details=Object.entries(values).filter(([,v])=>String(v||'').trim()).map(([k,v])=>k.replaceAll('_',' ').toUpperCase()+': '+v).join('\n');
  if(language==='Bangla') return 'নমুনা দলিল — আইনজীবীর পর্যালোচনা প্রয়োজন\n\n'+title+'\n\nপ্রদত্ত তথ্য:\n'+details+'\n\nশর্তাবলি, প্রযোজ্য আইন, স্ট্যাম্প, নিবন্ধন ও স্বাক্ষরের প্রয়োজনীয়তা নির্দিষ্ট ঘটনার ভিত্তিতে আইনজীবীর মাধ্যমে যাচাই করতে হবে। এই খসড়া ব্যক্তিগত আইনি পরামর্শ নয়।';
  return title+'\n\nWORKING TEMPLATE — SUBJECT TO LEGAL REVIEW\n\nPARTIES AND KEY DETAILS\n'+details+'\n\n1. PURPOSE AND SCOPE\nThe parties intend to record the arrangement described above. The precise rights, obligations, representations and conditions must be completed and reviewed against the transaction and applicable law.\n\n2. OBLIGATIONS\nEach party shall perform the obligations expressly agreed in the final reviewed document. Insert detailed obligations, timelines, deliverables and remedies before execution.\n\n3. TERM AND TERMINATION\nThe term and any termination rights must be completed to reflect the parties’ agreement and applicable law.\n\n4. GOVERNING LAW AND DISPUTES\nInsert the applicable governing law, jurisdiction and dispute-resolution mechanism only after legal review.\n\n5. EXECUTION\nThe parties should sign the final version only after confirming identity, authority, stamp duty, registration and any required formalities.\n\nIMPORTANT: This is a self-help starting template, not individualized legal advice. It may be incomplete or unsuitable for your facts. Obtain review by a qualified lawyer before signing, serving or relying on it.';
}
export default function DocumentStudioApp(){
  const [type,setType]=useState('nda');const [language,setLanguage]=useState('English');const [values,setValues]=useState({});const [draft,setDraft]=useState('');
  const fields=fieldSets[type];const canGenerate=fields.some(([key])=>String(values[key]||'').trim());
  function update(key,value){setValues(v=>({...v,[key]:value}));}
  function generate(){setDraft(buildDraft(type,values,language));}
  function download(){if(!draft)return;const blob=new Blob([draft],{type:'text/plain;charset=utf-8'});const url=URL.createObjectURL(blob);const a=document.createElement('a');a.href=url;a.download=templateNames[type].toLowerCase().replaceAll(' ','-')+'-working-draft.txt';a.click();URL.revokeObjectURL(url);}
  const printReady=useMemo(()=>draft.length>0,[draft]);
  return <div className="doc-builder">
    <div className="doc-builder-form">
      <label>DOCUMENT TYPE<select value={type} onChange={e=>{setType(e.target.value);setDraft('');setValues({});}}>{Object.entries(templateNames).map(([key,name])=><option key={key} value={key}>{name}</option>)}</select></label>
      <label>LANGUAGE<select value={language} onChange={e=>{setLanguage(e.target.value);setDraft('');}}><option>English</option><option>Bangla</option></select></label>
      {fields.map(([key,label])=><label key={key}>{label.toUpperCase()}<input value={values[key]||''} onChange={e=>update(key,e.target.value)} placeholder={'Enter '+label.toLowerCase()}/></label>)}
      <button className="button button-wine" onClick={generate} disabled={!canGenerate}>Generate working draft ↗</button>
      <small>Information stays in this browser session; this tool does not upload your entries.</small>
    </div>
    <div className="doc-builder-preview">
      <div className="preview-head"><span>EDITABLE PREVIEW</span><b>{draft?'DRAFT READY':'AWAITING INPUT'}</b></div>
      {draft?<pre>{draft}</pre>:<div className="preview-empty"><span>▤</span><b>Your document preview will appear here.</b><small>Complete the relevant fields and generate a working template.</small></div>}
      {printReady&&<div className="preview-actions"><button onClick={download}>Download TXT</button><button onClick={()=>window.print()}>Print / Save PDF</button><a href="/consultation?service=Document%20Review">Request lawyer review ↗</a></div>}
    </div>
  </div>;
}