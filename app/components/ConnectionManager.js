'use client';
import { useCallback, useEffect, useMemo, useState } from 'react';

const links={
 github:['https://github.com/arefinimran-stack/Imran-AI-Business-OS','Open GitHub repository'],
 vercel:['https://vercel.com/dashboard','Open Vercel dashboard'],
 supabase:['https://supabase.com/dashboard/project/efdkkegrcxjjuuigecbf','Open Supabase project'],
 appdeploy:['https://dashboard.appdeploy.ai','Open AppDeploy dashboard'],
 notion:['https://www.notion.so','Open Notion'],
 canva:['https://www.canva.com','Open Canva'],
 adobe:['https://www.adobe.com/creativecloud.html','Open Adobe'],
 figma:['https://www.figma.com','Open Figma'],
 elevenlabs:['https://elevenlabs.io','Open ElevenLabs'],
 pixverse:['https://pixverse.ai','Open PixVerse'],
 runway:['https://runwayml.com','Open Runway'],
 'nvidia-nim':['https://build.nvidia.com','Open NVIDIA NIM']
};
const icons={github:'⌘',vercel:'▲',supabase:'◈',appdeploy:'⧉',notion:'▤',canva:'✦',adobe:'◩',figma:'◫',elevenlabs:'◖',pixverse:'✧',runway:'▧','upload-post':'↗','nvidia-nim':'✺'};
const tone={github:'ink',vercel:'ink',supabase:'teal',appdeploy:'sand',notion:'ink',canva:'violet',adobe:'red',figma:'violet',elevenlabs:'blue',pixverse:'blue',runway:'ink','upload-post':'teal','nvidia-nim':'green'};
function statusLabel(s){return ({active:'Active',connected:'Connected',testing:'Testing',degraded:'Degraded',disconnected:'Disconnected',error:'Needs attention',blocked:'Blocked',expired:'Expired'})[s]||s||'Unknown';}
export default function ConnectionManager({org,supabase}){
 const [rows,setRows]=useState([]);const [loading,setLoading]=useState(true);const [busy,setBusy]=useState(false);const [apiKey,setApiKey]=useState('');const [showKey,setShowKey]=useState(false);const [message,setMessage]=useState('');const [error,setError]=useState('');
 const load=useCallback(async()=>{if(!org?.id)return;setLoading(true);const {data,error}=await supabase.from('ai_tool_connections').select('id,tool_key,display_name,provider,connection_type,status,model,last_verified_at,last_error,notes,scopes,permitted_actions').eq('organization_id',org.id).order('display_name');if(error)setError(error.message);else setRows(data||[]);setLoading(false);},[org?.id,supabase]);
 useEffect(()=>{load();},[load]);
 const nvidia=useMemo(()=>rows.find(x=>x.tool_key==='nvidia-nim'),[rows]);
 async function providerAction(action){
  setBusy(true);setError('');setMessage('');
  try{
   if(action==='connect'&&apiKey.trim().length<20)throw new Error('Enter your NVIDIA NIM API key first.');
   const {data,error}=await supabase.functions.invoke('provider-vault',{body:{action,provider:'nvidia',api_key:action==='connect'?apiKey.trim():undefined,model:'moonshotai/kimi-k2.5'}});
   setApiKey('');
   if(error){let detail=error.message||'Provider request failed.';try{const payload=await error.context?.json();if(payload?.error)detail=payload.error;}catch{}throw new Error(detail);}
   if(!data?.success&&action!=='status')throw new Error(data?.error||'Provider connection failed.');
   setMessage(data?.message||'Provider status refreshed.');
   await load();
  }catch(e){setError(e.message||'Provider action failed.');await load();}
  finally{setBusy(false);}
 }
 async function disconnect(){if(!window.confirm('Disconnect NVIDIA NIM and delete its stored key from Supabase Vault?'))return;await providerAction('disconnect');}
 const cards=rows.filter(x=>x.tool_key!=='nvidia-nim');
 return <section className="rc-connections">
  <div className="rc-relay-heading"><div><span>IA² VISUAL RC · CONNECTION CONTROL</span><h2>Connections & Providers</h2><p>One control surface for provider credentials, connected tools and operational fallbacks. Secret values are never displayed.</p></div><div className="rc-relay-mark">⛓</div></div>
  {message&&<div className="rc-connection-message">{message}</div>}{error&&<div className="rc-relay-error">{error}</div>}
  <article className="rc-provider-card">
   <div className="rc-provider-top"><div className="rc-connection-icon green">✺</div><div className="rc-provider-title"><span>AI INFERENCE PROVIDER</span><h3>NVIDIA NIM</h3><small>Shared by IA² Visual RC and THE ADVISER</small></div><span className={'rc-connection-status '+(nvidia?.status||'disconnected')}>{statusLabel(nvidia?.status||'disconnected')}</span></div>
   <p>Connect the provider key once. It is stored encrypted in Supabase Vault and used only by server-side Edge Functions. The key is never returned to the browser or saved in this form.</p>
   <div className="rc-provider-meta"><span>Model: <b>{nvidia?.model||'moonshotai/kimi-k2.5'}</b></span><span>Last verified: <b>{nvidia?.last_verified_at?new Date(nvidia.last_verified_at).toLocaleString():'Not yet verified'}</b></span></div>
   {nvidia?.last_error&&<div className="rc-provider-error">{nvidia.last_error}</div>}
   {nvidia?.status==='connected'?<div className="rc-provider-actions"><button className="rc-action-primary" disabled={busy} onClick={()=>providerAction('test')}>{busy?'Checking…':'Test connection'}</button><button className="rc-action-danger" disabled={busy} onClick={disconnect}>Disconnect & delete key</button></div>:<div className="rc-provider-connect"><label>NVIDIA NIM API KEY<input type={showKey?'text':'password'} autoComplete="off" spellCheck="false" value={apiKey} onChange={e=>setApiKey(e.target.value)} placeholder="Paste the provider key here"/></label><button className="rc-action-secondary" onClick={()=>setShowKey(v=>!v)} type="button">{showKey?'Hide key':'Show key'}</button><button className="rc-action-primary" disabled={busy||apiKey.trim().length<20} onClick={()=>providerAction('connect')}>{busy?'Connecting & testing…':'Connect and verify'}</button></div>}
   <small className="rc-provider-footnote">The first connection requires you to paste the existing key once. After that, Connect / Test / Disconnect are managed here. Do not paste the key into chat.</small>
  </article>
  <div className="rc-connection-section-head"><div><span>CONNECTED TOOLS & WORKSPACE SERVICES</span><h3>Integration register</h3></div><button onClick={load} disabled={loading}>↻ Refresh</button></div>
  {loading?<div className="rc-health-empty">Loading connection register…</div>:<div className="rc-connection-grid">{cards.map(row=>{const link=links[row.tool_key];return <article className="rc-connection-card" key={row.tool_key}><div className={'rc-connection-icon '+(tone[row.tool_key]||'ink')}>{icons[row.tool_key]||'◇'}</div><div className="rc-connection-card-main"><div className="rc-connection-card-top"><b>{row.display_name}</b><span className={'rc-connection-status '+row.status}>{statusLabel(row.status)}</span></div><small>{row.provider} · {row.connection_type.replaceAll('_',' ')}</small><p>{row.notes||'No connection note recorded.'}</p><div className="rc-connection-card-actions">{link&&<a href={link[0]} target="_blank" rel="noreferrer">{link[1]} ↗</a>}{row.connection_type==='native_connector'&&<a href="https://chatgpt.com/settings/apps" target="_blank" rel="noreferrer">Connector settings ↗</a>}</div></div></article>})}</div>}
  <div className="rc-connection-governance"><b>Connection governance</b><p>ChatGPT-side connectors and application-runtime integrations are different permissions. OAuth connections must be approved in the provider or ChatGPT settings. IA² Visual RC cannot silently grant those permissions. Core runtime uses GitHub, Vercel and Supabase; Notion and AppDeploy are not critical dependencies.</p></div>
 </section>;
}