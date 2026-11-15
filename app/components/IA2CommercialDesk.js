'use client';

import { useCallback, useEffect, useState } from 'react';

const GRADES = ['A - Verified intent', 'B - Verified buyer fit', 'C - Discovery only'];
const BUYER_TYPES = ['Brand / retailer', 'Importer / wholesaler', 'Sourcing office', 'Private label', 'Uniform / workwear buyer', 'Manufacturer / investor', 'Other'];
const PRODUCTS = ['Knitwear', 'Woven garments', 'Denim', 'Sportswear', 'Workwear / uniforms', 'Home textiles', 'Man-made fibre / technical textiles', 'Accessories / packaging', 'Other'];
const STAGES = ['new', 'qualified', 'proposal', 'negotiation', 'won', 'lost'];
const META_MARKER = '[IA2_LEAD_META]';

function readMeta(notes) {
  if (!notes || !notes.includes(META_MARKER)) return {};
  try { return JSON.parse(notes.split(META_MARKER)[1].split('\n\n')[0]); } catch { return {}; }
}
function money(value, currency) {
  if (value == null || value === '') return 'Not estimated';
  try { return new Intl.NumberFormat('en-US', { style: 'currency', currency: currency === 'Other' ? 'USD' : currency, maximumFractionDigits: 0 }).format(Number(value)); }
  catch { return String(currency) + ' ' + String(value); }
}
function dateLabel(value) { return value ? new Date(value).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : 'No follow-up set'; }
function PanelTitle({ title, sub, count }) {
  return <div className="os-panel-head"><div><h2>{title}</h2><p>{sub}</p></div>{count && <span className="os-count">{count}</span>}</div>;
}
function CompanyProfile() {
  return <div className="os-ia2-profile">
    <div className="os-ia2-cover"><span>IA² HOLDINGS</span><h2>Venture Development · Investment Facilitation · AI Intelligence</h2><p>Bangladesh-focused commercial intelligence and business facilitation platform.</p></div>
    <div className="os-ia2-profile-grid">
      <article><small>LEAD EXECUTION DEPARTMENT</small><h3>Arefin Legal & Corporate Group</h3><p>Corporate structuring, company formation, joint-venture documentation, legal due diligence and market-entry support, within professional scope and written mandates.</p></article>
      <article><small>ACTIVE COMMERCIAL PRIORITY</small><h3>International Buyer & Market Entry Desk</h3><p>Find and qualify overseas garment buyers and companies seeking to source from, establish in or expand within Bangladesh.</p></article>
      <article><small>VENTURE & CAPITAL</small><h3>Investment Readiness</h3><p>Opportunity screening, market validation, financial modelling, investor materials and strategic introductions. No claim of operating a licensed investment fund.</p></article>
      <article><small>AI INTELLIGENCE</small><h3>Public Problem-Solving Lab</h3><p>Evidence-led research and AI-enabled workflow pilots for measurable institutional and public-service problems.</p></article>
      <article><small>PLANNED VERTICAL</small><h3>Real Estate & Housing</h3><p>Market research, feasibility, due-diligence coordination and partner discovery. Not presented as an active brokerage or development operation.</p></article>
      <article className="is-hold"><small>RESEARCH ONLY · EXECUTION ON HOLD</small><h3>C3 Lifestyle & Bold Cotton</h3><p>Continue product, buyer and market research. No execution, capital commitment or operating build-out until separately approved.</p></article>
    </div>
    <div className="os-ia2-disclaimer">Working company profile. Registered entity details, licences, operating capabilities, team, partners, credentials and track record must be verified before this profile is circulated externally.</div>
  </div>;
}

export default function IA2CommercialDesk({ org, supabase }) {
  const [tab, setTab] = useState('buyers');
  const [contacts, setContacts] = useState([]);
  const [opportunities, setOpportunities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [company, setCompany] = useState('');
  const [person, setPerson] = useState('');
  const [country, setCountry] = useState('');
  const [website, setWebsite] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [buyerType, setBuyerType] = useState(BUYER_TYPES[0]);
  const [product, setProduct] = useState(PRODUCTS[0]);
  const [grade, setGrade] = useState(GRADES[2]);
  const [intent, setIntent] = useState('');
  const [evidenceUrl, setEvidenceUrl] = useState('');
  const [evidenceSummary, setEvidenceSummary] = useState('');
  const [opportunityTitle, setOpportunityTitle] = useState('');
  const [value, setValue] = useState('');
  const [currency, setCurrency] = useState('USD');
  const [followUp, setFollowUp] = useState('');
  const [notes, setNotes] = useState('');
  const [stageFilter, setStageFilter] = useState('all');
  const [search, setSearch] = useState('');

  const load = useCallback(async () => {
    if (!org || !org.id) return;
    setLoading(true); setError('');
    const results = await Promise.all([
      supabase.from('contacts').select('id,full_name,organization_name,email,phone,contact_type,notes,created_at').eq('organization_id', org.id).order('created_at', { ascending: false }).limit(250),
      supabase.from('business_opportunities').select('id,title,contact_id,stage,estimated_value,currency,next_follow_up_at,notes,created_at,venture_id').eq('organization_id', org.id).order('created_at', { ascending: false }).limit(250),
    ]);
    if (results[0].error) setError(results[0].error.message); else setContacts(results[0].data || []);
    if (results[1].error) setError(results[1].error.message); else setOpportunities(results[1].data || []);
    setLoading(false);
  }, [org, supabase]);

  useEffect(() => { load(); }, [load]);

  async function addBuyer(event) {
    event.preventDefault();
    if (!org || !org.id || !company.trim()) return;
    setSaving(true); setError(''); setNotice('');
    let parsedEvidence = null;
    if (evidenceUrl.trim()) {
      try {
        const u = new URL(evidenceUrl.trim());
        if (!['http:', 'https:'].includes(u.protocol)) throw new Error('Invalid protocol');
        parsedEvidence = u.toString();
      } catch {
        setSaving(false); setError('Evidence URL must be a valid http or https address.'); return;
      }
    }
    const meta = {
      schema: 'ia2-buyer-v1',
      country: country.trim() || null,
      website: website.trim() || null,
      buyer_type: buyerType,
      product_focus: product,
      verification_grade: grade,
      bangladesh_intent: intent.trim() || null,
      evidence_url: parsedEvidence,
      evidence_summary: evidenceSummary.trim() || null,
      contact_source: 'Founder-entered / public business source; verify before outreach',
      outreach_status: 'not_contacted',
    };
    const contactNotes = META_MARKER + '\n' + JSON.stringify(meta) + '\n\n' + (notes.trim() || 'International buyer / market-entry prospect.');
    const { data: contact, error: contactError } = await supabase.from('contacts').insert({
      organization_id: org.id,
      full_name: person.trim() || 'Procurement / Business Development Team',
      organization_name: company.trim(),
      email: email.trim() || null,
      phone: phone.trim() || null,
      contact_type: 'prospect',
      notes: contactNotes,
    }).select('id').single();
    if (contactError) { setSaving(false); setError(contactError.message); return; }
    const { error: oppError } = await supabase.from('business_opportunities').insert({
      organization_id: org.id,
      title: opportunityTitle.trim() || (company.trim() + ' — Bangladesh buyer / market-entry opportunity'),
      contact_id: contact.id,
      stage: 'new',
      estimated_value: value ? Number(value) : null,
      currency: currency,
      next_follow_up_at: followUp ? new Date(followUp + 'T09:00:00').toISOString() : null,
      notes: 'IA² buyer lead · ' + grade + '\nProduct focus: ' + product + '\nBangladesh intent: ' + (intent.trim() || 'Not yet verified') + '\nEvidence: ' + (parsedEvidence || 'Not supplied') + '\nEvidence summary: ' + (evidenceSummary.trim() || 'Not supplied') + '\nNo outreach sent. Founder approval required.',
    });
    setSaving(false);
    if (oppError) {
      setError('Contact saved, but opportunity creation failed: ' + oppError.message + '. Refresh before retrying to avoid duplicates.');
      await load(); return;
    }
    setCompany(''); setPerson(''); setCountry(''); setWebsite(''); setEmail(''); setPhone(''); setIntent(''); setEvidenceUrl(''); setEvidenceSummary(''); setOpportunityTitle(''); setValue(''); setFollowUp(''); setNotes('');
    setNotice('Buyer prospect and linked opportunity saved. No external message was sent.');
    await load();
  }

  async function updateStage(item, nextStage) {
    const { error: updateError } = await supabase.from('business_opportunities').update({ stage: nextStage }).eq('id', item.id).eq('organization_id', org.id);
    if (updateError) { setError(updateError.message); return; }
    setOpportunities(current => current.map(x => x.id === item.id ? { ...x, stage: nextStage } : x));
    setNotice('Opportunity stage updated.');
  }

  const contactById = Object.fromEntries(contacts.map(c => [c.id, c]));
  const filtered = opportunities.filter(o => (stageFilter === 'all' || o.stage === stageFilter) && (o.title + ' ' + (contactById[o.contact_id] ? contactById[o.contact_id].organization_name || '' : '')).toLowerCase().includes(search.toLowerCase()));
  const activeCount = opportunities.filter(o => !['won', 'lost'].includes(o.stage)).length;
  const qualified = opportunities.filter(o => ['qualified', 'proposal', 'negotiation'].includes(o.stage)).length;
  const won = opportunities.filter(o => o.stage === 'won').length;

  return <section className="os-panel">
    <PanelTitle title="IA² Holdings — Commercial Desk" sub="International buyer CRM, Bangladesh market-entry pipeline and venture intelligence." count={opportunities.length + ' opportunities'} />
    <div className="os-ia2-tabs">
      <button className={tab === 'buyers' ? 'active' : ''} onClick={() => setTab('buyers')}>Buyer CRM</button>
      <button className={tab === 'profile' ? 'active' : ''} onClick={() => setTab('profile')}>Company profile</button>
    </div>
    {error && <div className="os-alert error">{error}</div>}
    {notice && <div className="os-alert success">{notice}</div>}
    {tab === 'profile' ? <CompanyProfile /> : <>
      <div className="os-finance-summary os-ia2-kpis">
        <article><small>OPEN PIPELINE</small><b>{activeCount}</b></article>
        <article><small>QUALIFIED / PROPOSAL</small><b>{qualified}</b></article>
        <article><small>WON OPPORTUNITIES</small><b>{won}</b></article>
      </div>
      <div className="os-attention"><div><b>Lead-quality rule</b><small>A real company is not automatically a real buyer. Keep evidence of Bangladesh intent, buyer authority and product requirement. Grade C is discovery only. Do not send outreach until manually reviewed and approved.</small></div></div>
      <form className="os-form-grid os-ia2-form" onSubmit={addBuyer}>
        <h3>Register international buyer / market-entry prospect</h3>
        <input value={company} onChange={e => setCompany(e.target.value)} placeholder="Company / buyer legal name" required />
        <input value={person} onChange={e => setPerson(e.target.value)} placeholder="Named contact / role (if verified)" />
        <input value={country} onChange={e => setCountry(e.target.value)} placeholder="Country" />
        <input value={website} onChange={e => setWebsite(e.target.value)} placeholder="Official company website" />
        <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="Official business email" />
        <input value={phone} onChange={e => setPhone(e.target.value)} placeholder="Business phone / switchboard" />
        <select value={buyerType} onChange={e => setBuyerType(e.target.value)}>{BUYER_TYPES.map(x => <option key={x}>{x}</option>)}</select>
        <select value={product} onChange={e => setProduct(e.target.value)}>{PRODUCTS.map(x => <option key={x}>{x}</option>)}</select>
        <select value={grade} onChange={e => setGrade(e.target.value)}>{GRADES.map(x => <option key={x}>{x}</option>)}</select>
        <input value={intent} onChange={e => setIntent(e.target.value)} placeholder="Evidence of Bangladesh sourcing / expansion intent" />
        <input value={evidenceUrl} onChange={e => setEvidenceUrl(e.target.value)} placeholder="Evidence URL (required for Grade A)" />
        <input value={evidenceSummary} onChange={e => setEvidenceSummary(e.target.value)} placeholder="What exactly does the source establish?" />
        <input value={opportunityTitle} onChange={e => setOpportunityTitle(e.target.value)} placeholder="Opportunity title (optional)" />
        <input type="number" min="0" step="0.01" value={value} onChange={e => setValue(e.target.value)} placeholder="Potential deal value (optional)" />
        <select value={currency} onChange={e => setCurrency(e.target.value)}><option>USD</option><option>BDT</option><option>GBP</option><option>EUR</option><option>Other</option></select>
        <label className="os-ia2-date">Next follow-up <input type="date" value={followUp} onChange={e => setFollowUp(e.target.value)} /></label>
        <textarea value={notes} onChange={e => setNotes(e.target.value)} placeholder="Qualification notes, requirement, volume, certifications, target price, decision-maker and risks." rows={3} />
        <button disabled={saving}>{saving ? 'Saving buyer…' : 'Save buyer & opportunity'}</button>
      </form>
      <div className="os-content-filters">
        <input type="search" value={search} onChange={e => setSearch(e.target.value)} placeholder="Search company or opportunity…" />
        <select value={stageFilter} onChange={e => setStageFilter(e.target.value)}><option value="all">All stages</option>{STAGES.map(x => <option key={x}>{x}</option>)}</select>
        <button type="button" className="os-chip-button" onClick={load}>Refresh CRM</button>
      </div>
      {loading ? <div className="os-loading">Loading international buyer pipeline…</div> : <div className="os-ia2-lead-list">
        {filtered.map(item => {
          const contact = contactById[item.contact_id];
          const meta = readMeta(contact ? contact.notes : '');
          return <article className="os-ia2-lead" key={item.id}>
            <div className="os-venture-top"><span>{(contact && contact.organization_name) || 'Unlinked prospect'} · {meta.country || 'Country not recorded'}</span><span className="os-chip">{item.stage}</span></div>
            <h3>{item.title}</h3>
            <p>{meta.product_focus || 'Product not classified'} · {meta.buyer_type || 'Buyer type not set'} · {meta.verification_grade || 'Grade not set'}</p>
            {meta.bangladesh_intent && <p><b>Bangladesh intent:</b> {meta.bangladesh_intent}</p>}
            {meta.evidence_summary && <p><b>Evidence:</b> {meta.evidence_summary}</p>}
            {meta.evidence_url && <a href={meta.evidence_url} target="_blank" rel="noreferrer">Open evidence source ↗</a>}
            <div className="os-ia2-lead-foot"><span>{(contact && contact.email) || 'No email'} · {(contact && contact.phone) || 'No phone'}</span><b>{money(item.estimated_value, item.currency)}</b></div>
            <div className="os-ia2-lead-foot"><small>Next follow-up: {dateLabel(item.next_follow_up_at)}</small><label>Stage <select value={item.stage} onChange={e => updateStage(item, e.target.value)}>{STAGES.map(x => <option key={x}>{x}</option>)}</select></label></div>
          </article>;
        })}
        {!filtered.length && <div className="os-empty">No matching opportunities. Add a verified prospect above or change the filters.</div>}
      </div>}
    </>}
  </section>;
}
