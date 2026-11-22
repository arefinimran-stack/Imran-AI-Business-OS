import SiteShell from './components/SiteShell';

const services = [
  ['01','Foreign Investment & International Business Advisory','Bangladesh market entry, local legal coordination, corporate structuring and investment-related support.','/international-advisory'],
  ['02','Business Formation & Contracts','Company formation support, commercial agreements, partnership documents and contract review.','/advisory/business-formation'],
  ['03','Corporate Compliance & Governance','Governance frameworks, statutory compliance coordination, board documentation and corporate risk review.','/advisory/corporate-compliance'],
  ['04','Property & Real Estate','Property document review, due-diligence coordination, title-related support and transaction guidance.','/advisory/property-real-estate'],
  ['05','Personal & Family Legal Solutions','Practical legal support for personal, family, succession and property-related matters.','/advisory/personal-family'],
  ['06','Litigation-Related Advisory','Case assessment, legal research, drafting, litigation strategy and preparation for formal representation.','/advisory/litigation-advisory']
];

export default function Home() {
  return <SiteShell>
    <main>
      <section className="advisor-hero">
        <div className="hero-copy">
          <span className="eyebrow">ADVOCATE IMRAN AREFIN · DHAKA, BANGLADESH</span>
          <h1>Better decisions begin with <em>clear advice.</em></h1>
          <p>Legal and business advisory led by Advocate Imran Arefin. Explore professional services, practical legal resources and technology-enabled tools designed to make complex matters easier to understand.</p>
          <div className="hero-actions">
            <a className="button button-wine" href="/advisory">Explore advisory services <span>↗</span></a>
            <a className="button button-outline" href="/consultation">Request a consultation</a>
          </div>
          <div className="hero-meta"><span>BUSINESS & CORPORATE</span><i></i><span>PROPERTY & PERSONAL</span><i></i><span>INTERNATIONAL CLIENTS</span></div>
        </div>
        <aside className="founder-panel">
          <div className="founder-art"><div className="founder-initials">IA</div><span>ADVOCATE</span></div>
          <div className="founder-caption"><b>Imran Arefin</b><small>Legal & Business Advisory · Bangladesh</small></div>
          <p>Clarity of scope. Careful preparation. Practical direction.</p>
        </aside>
        <div className="hero-bottom"><span>THE ADVISOR — Led by IMRAN AREFIN</span><span>LOCAL KNOWLEDGE · INTERNATIONAL OUTLOOK</span></div>
      </section>

      <section className="trust-strip">
        <span>Bangladesh-based advisory</span><i></i><span>Individuals & families</span><i></i><span>Entrepreneurs & SMEs</span><i></i><span>International businesses</span><i></i><span>English · বাংলা</span>
      </section>

      <section className="services-section" id="services">
        <div className="section-heading"><div><span className="section-kicker">01 / ADVISORY SERVICES</span><h2>Clear direction for <em>important decisions.</em></h2></div><p>Each engagement begins with the facts, the objective, the relevant jurisdiction and a clearly defined scope of work.</p></div>
        <div className="service-grid">{services.map(item => <article className="service-card" key={item[0]}>
          <span className="service-number">{item[0]}</span><h3>{item[1]}</h3><p>{item[2]}</p><a href={item[3]}>Explore service ↗</a>
        </article>)}</div>
      </section>

      <section className="international-banner">
        <div><span className="section-kicker">02 / INTERNATIONAL ADVISORY DESK</span><h2>Doing business in Bangladesh? <em>Start with a clear legal map.</em></h2><p>Support for overseas founders, investors and companies assessing a Bangladesh presence, local operating arrangements, corporate structures and legal coordination.</p><a className="button button-sand" href="/international-advisory">Explore Bangladesh market-entry support ↗</a></div>
        <div className="banner-seal"><span>BD</span><small>LEGAL DESK</small></div>
      </section>

      <section className="founder-strip">
        <div className="founder-mark">IA</div>
        <div><span className="section-kicker">03 / THE ADVISOR</span><h2>Led by <em>Imran Arefin.</em></h2><p>A practical advisory approach that connects legal analysis with the commercial, personal and procedural context behind each matter.</p><a href="/about">Learn about the practice ↗</a></div>
      </section>

      <section className="lounge-section">
        <div className="lounge-heading"><div><span className="section-kicker">04 / KNOWLEDGE & INSIGHT</span><h2>MY LEGAL <em>LOUNGE.</em></h2></div><p>Accessible legal awareness, business briefings and carefully sourced commentary. Published material will be reviewed before release.</p></div>
        <div className="lounge-grid">
          <article className="lounge-feature"><span>EDITORIAL DESK · IN PREPARATION</span><h3>Legal clarity should be accessible, practical and properly sourced.</h3><p>Explore the planned editorial themes and resource library.</p><a href="/legal-lounge">Enter MY LEGAL LOUNGE ↗</a></article>
          <article><span>BUSINESS</span><h3>Company formation and commercial foundations</h3><p>Practical checklists and explainers for entrepreneurs.</p></article>
          <article><span>INTERNATIONAL</span><h3>Bangladesh market-entry questions</h3><p>Issues to scope before committing capital or selecting a structure.</p></article>
        </div>
      </section>

      <section className="studio-section">
        <div className="folder-visual"><div className="folder-back"></div><div className="folder-front"><span>LEGAL</span><b>DOCS</b></div><div className="folder-tab"></div></div>
        <div><span className="section-kicker">05 / SELF-HELP DOCUMENT STUDIO</span><h2>Start with a structured <em>document.</em></h2><p>Explore guided template tools for common business and personal documents. Templates are starting points only and are not individualized legal advice.</p><a className="button button-wine" href="/document-studio">Open Document Studio ↗</a></div>
      </section>

      <section className="process-section">
        <span className="section-kicker">06 / HOW WE WORK</span><h2>Understand first. <em>Advise with purpose.</em></h2>
        <div className="process-grid">{[['01','Understand','Clarify the facts, objectives and jurisdiction.'],['02','Assess','Review documents, risks and applicable requirements.'],['03','Advise','Define options, scope, priorities and next steps.'],['04','Support','Deliver agreed drafting, coordination or representation.']].map(x=><article key={x[0]}><span>{x[0]}</span><h3>{x[1]}</h3><p>{x[2]}</p></article>)}</div>
      </section>

      <section className="final-cta"><div><span className="section-kicker">07 / START A CONVERSATION</span><h2>Make the next decision <em>with clarity.</em></h2><p>Share a brief outline of the matter. Do not send confidential documents until a secure channel and engagement scope have been agreed.</p></div><a className="button button-sand" href="/consultation">Request a consultation ↗</a></section>
      <div className="legal-disclaimer">THE ADVISOR provides general information through this website. No legal advice, representation or lawyer-client relationship arises unless a formal engagement is accepted. Services are subject to conflict checks, scope confirmation and applicable professional requirements.</div>
    </main>
  </SiteShell>;
}