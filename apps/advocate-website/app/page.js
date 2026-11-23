import SiteShell from './components/SiteShell';
import BilingualText from './components/BilingualText';

const services = [
  ['01','Foreign Investment & International Business Advisory','Bangladesh market entry, local legal coordination, corporate structuring and investment-related support.','/international-advisory','বিদেশি বিনিয়োগ ও আন্তর্জাতিক ব্যবসায়িক পরামর্শ','বাংলাদেশে বাজার প্রবেশ, স্থানীয় আইনি সমন্বয়, করপোরেট কাঠামো ও বিনিয়োগ-সংক্রান্ত সহায়তা।'],
  ['02','Business Formation & Contracts','Company formation support, commercial agreements, partnership documents and contract review.','/advisory/business-formation','ব্যবসা গঠন ও চুক্তি','কোম্পানি গঠন-সংক্রান্ত সহায়তা, বাণিজ্যিক চুক্তি, অংশীদারিত্বের দলিল ও চুক্তি পর্যালোচনা।'],
  ['03','Corporate Compliance & Governance','Governance frameworks, statutory compliance coordination, board documentation and corporate risk review.','/advisory/corporate-compliance','করপোরেট কমপ্লায়েন্স ও সুশাসন','গভর্ন্যান্স কাঠামো, আইনগত কমপ্লায়েন্স সমন্বয়, বোর্ডের নথিপত্র ও করপোরেট ঝুঁকি পর্যালোচনা।'],
  ['04','Property & Real Estate','Property document review, due-diligence coordination, title-related support and transaction guidance.','/advisory/property-real-estate','সম্পত্তি ও রিয়েল এস্টেট','সম্পত্তির দলিল পর্যালোচনা, যথাযথ যাচাই সমন্বয়, স্বত্ব-সংক্রান্ত সহায়তা ও লেনদেনের দিকনির্দেশনা।'],
  ['05','Personal & Family Legal Solutions','Practical legal support for personal, family, succession and property-related matters.','/advisory/personal-family','ব্যক্তিগত ও পারিবারিক আইনি সমাধান','ব্যক্তিগত, পারিবারিক, উত্তরাধিকার ও সম্পত্তি-সংক্রান্ত বিষয়ে বাস্তবভিত্তিক আইনি সহায়তা।'],
  ['06','Litigation-Related Advisory','Case assessment, legal research, drafting, litigation strategy and preparation for formal representation.','/advisory/litigation-advisory','মামলা-সংক্রান্ত পরামর্শ','মামলা মূল্যায়ন, আইনি গবেষণা, খসড়া প্রণয়ন, মামলা পরিচালনার কৌশল ও আনুষ্ঠানিক প্রতিনিধিত্বের প্রস্তুতি।']
];

const articles = [
  ['INTERNATIONAL','Bangladesh market entry: the first legal and regulatory map','A practical starting checklist for foreign investors and overseas businesses.','বাংলাদেশে বাজার প্রবেশ: প্রাথমিক আইনি ও নিয়ন্ত্রক রূপরেখা','বিদেশি বিনিয়োগকারী ও আন্তর্জাতিক ব্যবসার জন্য প্রাথমিক যাচাইতালিকা।','/legal-lounge/bangladesh-market-entry'],
  ['BUSINESS','Company formation: what promoters should prepare','A source-led overview of name clearance, incorporation documents and post-registration steps.','কোম্পানি গঠন: উদ্যোক্তাদের কী প্রস্তুত রাখা উচিত','নামের ছাড়পত্র, নিবন্ধনের নথি ও নিবন্ধন-পরবর্তী পদক্ষেপের তথ্যভিত্তিক আলোচনা।','/legal-lounge/company-formation'],
  ['INVESTMENT','Foreign capital, dividends and repatriation','Why banking-channel documentation and current Bangladesh Bank rules matter.','বিদেশি মূলধন, লভ্যাংশ ও অর্থ প্রত্যাবাসন','ব্যাংকিং চ্যানেলের নথিপত্র ও বাংলাদেশ ব্যাংকের হালনাগাদ বিধির গুরুত্ব।','/legal-lounge/foreign-investment-repatriation'],
  ['TAX & VAT','Business tax and VAT registration: questions to verify','A practical guide to checking current TIN, BIN and turnover-based obligations.','ব্যবসায়িক কর ও ভ্যাট নিবন্ধন: যে বিষয়গুলো যাচাই করতে হবে','ই-টিআইএন, বিআইএন ও টার্নওভারভিত্তিক দায়বদ্ধতা যাচাইয়ের ব্যবহারিক নির্দেশনা।','/legal-lounge/tax-vat-registration']
];

export default function Home() {
  const whatsappNumber = (process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '').replace(/[^0-9]/g, '');
  const whatsappHref = whatsappNumber ? 'https://wa.me/' + whatsappNumber + '?text=' + encodeURIComponent('I would like to make a professional enquiry to THE ADVISOR.') : '';
  return <SiteShell>
    <main>
      <section className="advisor-hero">
        <div className="hero-copy">
          <span className="eyebrow">THE ADVISOR · DHAKA, BANGLADESH</span>
          <div className="credential-line"><BilingualText en="Advocate, Supreme Court of Bangladesh (High Court Division) · Enrolled with Bangladesh Bar Council" bn="বাংলাদেশ সুপ্রিম কোর্টের হাইকোর্ট বিভাগের আইনজীবী · বাংলাদেশ বার কাউন্সিলে তালিকাভুক্ত" /></div>
          <h1><BilingualText en="Better decisions begin with" bn="গুরুত্বপূর্ণ সিদ্ধান্ত শুরু হোক" /> <em><BilingualText en="clear advice." bn="স্পষ্ট পরামর্শের মাধ্যমে।" /></em></h1>
          <p><BilingualText as="span" en="Legal and business advisory led by Advocate Imran Arefin. Explore professional services, practical legal resources and technology-enabled tools designed to make complex matters easier to understand." bn="অ্যাডভোকেট ইমরান আরেফিনের নেতৃত্বে আইনি ও ব্যবসায়িক পরামর্শ। জটিল বিষয় সহজে বোঝার জন্য পেশাগত সেবা, ব্যবহারিক আইনি তথ্য ও প্রযুক্তিনির্ভর টুল সম্পর্কে জানুন।" /></p>
          <div className="hero-actions">
            <a className="button button-wine" href="/advisory"><BilingualText en="Explore advisory services" bn="পরামর্শ সেবা দেখুন" /> <span>↗</span></a>
            <a className="button button-outline" href="/consultation"><BilingualText en="Send a professional enquiry" bn="পেশাগত অনুসন্ধান পাঠান" /></a>
            <a className="button button-outline" href="mailto:arefin.imran@gmail.com"><BilingualText en="Email" bn="ইমেইল" /></a>
            {whatsappHref && <a className="button button-outline" href={whatsappHref} target="_blank" rel="noreferrer">WhatsApp ↗</a>}
          </div>
          <div className="hero-meta"><span><BilingualText en="BUSINESS & CORPORATE" bn="ব্যবসা ও করপোরেট" /></span><i></i><span><BilingualText en="PROPERTY & PERSONAL" bn="সম্পত্তি ও ব্যক্তিগত" /></span><i></i><span><BilingualText en="INTERNATIONAL CLIENTS" bn="আন্তর্জাতিক ক্লায়েন্ট" /></span></div>
        </div>
        <aside className="founder-panel">
          <div className="founder-art"><div className="founder-initials">IA</div><span>ADVOCATE</span></div>
          <div className="founder-caption"><b>Imran Arefin</b><small><BilingualText en="Supreme Court Advocate · Bangladesh" bn="সুপ্রিম কোর্টের আইনজীবী · বাংলাদেশ" /></small></div>
          <p><BilingualText en="Clarity of scope. Careful preparation. Practical direction." bn="কাজের পরিধিতে স্বচ্ছতা। সতর্ক প্রস্তুতি। বাস্তবসম্মত দিকনির্দেশনা।" /></p>
        </aside>
        <div className="hero-bottom"><span>THE ADVISOR — Led by IMRAN AREFIN</span><span><BilingualText en="LOCAL KNOWLEDGE · INTERNATIONAL OUTLOOK" bn="স্থানীয় জ্ঞান · আন্তর্জাতিক দৃষ্টিভঙ্গি" /></span></div>
      </section>

      <section className="trust-strip">
        <span><BilingualText en="Bangladesh-based advisory" bn="বাংলাদেশভিত্তিক পরামর্শ" /></span><i></i><span><BilingualText en="Individuals & families" bn="ব্যক্তি ও পরিবার" /></span><i></i><span><BilingualText en="Entrepreneurs & SMEs" bn="উদ্যোক্তা ও এসএমই" /></span><i></i><span><BilingualText en="International businesses" bn="আন্তর্জাতিক ব্যবসা" /></span><i></i><span><BilingualText en="English · বাংলা" bn="ইংরেজি · বাংলা" /></span>
      </section>

      <section className="services-section" id="services">
        <div className="section-heading"><div><span className="section-kicker">01 / <BilingualText en="ADVISORY SERVICES" bn="পরামর্শ সেবা" /></span><h2><BilingualText en="Clear direction for" bn="গুরুত্বপূর্ণ সিদ্ধান্তে" /> <em><BilingualText en="important decisions." bn="স্পষ্ট দিকনির্দেশনা।" /></em></h2></div><p><BilingualText en="Each engagement begins with the facts, the objective, the relevant jurisdiction and a clearly defined scope of work." bn="প্রতিটি কাজের শুরু হয় তথ্য, উদ্দেশ্য, প্রাসঙ্গিক এখতিয়ার এবং কাজের সুস্পষ্ট পরিধি নির্ধারণের মাধ্যমে।" /></p></div>
        <div className="service-grid">{services.map(item => <article className="service-card" key={item[0]}>
          <span className="service-number">{item[0]}</span><h3><BilingualText en={item[1]} bn={item[4]} /></h3><p><BilingualText en={item[2]} bn={item[5]} /></p><a href={item[3]}><BilingualText en="Explore service" bn="সেবার বিস্তারিত" /> ↗</a>
        </article>)}</div>
      </section>

      <section className="international-banner">
        <div><span className="section-kicker">02 / <BilingualText en="INTERNATIONAL ADVISORY DESK" bn="আন্তর্জাতিক পরামর্শ ডেস্ক" /></span><h2><BilingualText en="Doing business in Bangladesh?" bn="বাংলাদেশে ব্যবসা করতে চান?" /> <em><BilingualText en="Start with a clear legal map." bn="শুরু করুন পরিষ্কার আইনি ধারণা নিয়ে।" /></em></h2><p><BilingualText en="Support for overseas founders, investors and companies assessing a Bangladesh presence, local operating arrangements, corporate structures and legal coordination." bn="বাংলাদেশে ব্যবসায়িক উপস্থিতি, স্থানীয় পরিচালন ব্যবস্থা, করপোরেট কাঠামো ও আইনি সমন্বয় মূল্যায়নকারী বিদেশি উদ্যোক্তা, বিনিয়োগকারী ও প্রতিষ্ঠানের জন্য সহায়তা।" /></p><a className="button button-sand" href="/international-advisory"><BilingualText en="Explore Bangladesh market-entry support" bn="বাংলাদেশে বাজার প্রবেশ সহায়তা দেখুন" /> ↗</a></div>
        <div className="banner-seal"><span>BD</span><small>LEGAL DESK</small></div>
      </section>

      <section className="founder-strip">
        <div className="founder-mark">IA</div>
        <div><span className="section-kicker">03 / <BilingualText en="THE ADVISOR" bn="দ্য অ্যাডভাইজর" /></span><h2><BilingualText en="Led by" bn="নেতৃত্বে" /> <em>Imran Arefin.</em></h2><p><BilingualText en="A practical advisory approach that connects legal analysis with the commercial, personal and procedural context behind each matter." bn="প্রতিটি বিষয়ের পেছনের বাণিজ্যিক, ব্যক্তিগত ও প্রক্রিয়াগত বাস্তবতার সঙ্গে আইনি বিশ্লেষণকে যুক্ত করে ব্যবহারিক পরামর্শ দেওয়ার পদ্ধতি।" /></p><a href="/about"><BilingualText en="Learn about the practice" bn="পেশাগত পরিচিতি জানুন" /> ↗</a></div>
      </section>

      <section className="lounge-section">
        <div className="lounge-heading"><div><span className="section-kicker">04 / <BilingualText en="KNOWLEDGE & INSIGHT" bn="জ্ঞান ও বিশ্লেষণ" /></span><h2>MY LEGAL <em><BilingualText en="LOUNGE." bn="পাঠাগার।" /></em></h2></div><p><BilingualText en="Practical legal awareness and business briefings with official source links, publication dates and clear scope notes." bn="সরকারি উৎসের লিংক, প্রকাশের তারিখ এবং কাজের সীমা উল্লেখসহ ব্যবহারিক আইনি সচেতনতা ও ব্যবসায়িক ব্রিফিং।" /></p></div>
        <div className="lounge-grid lounge-article-grid">
          {articles.map((article,index)=><article className={index===0?'lounge-feature':''} key={article[5]}>
            <span>{article[0]}</span><h3><BilingualText en={article[1]} bn={article[3]} /></h3><p><BilingualText en={article[2]} bn={article[4]} /></p><a href={article[5]}><BilingualText en="Read the guide" bn="নির্দেশিকা পড়ুন" /> ↗</a>
          </article>)}
        </div>
      </section>

      <section className="studio-section">
        <div className="folder-visual"><div className="folder-back"></div><div className="folder-front"><span>LEGAL</span><b>DOCS</b></div><div className="folder-tab"></div></div>
        <div><span className="section-kicker">05 / <BilingualText en="SELF-HELP DOCUMENT STUDIO" bn="স্ব-সহায়ক ডকুমেন্ট স্টুডিও" /></span><h2><BilingualText en="Start with a structured" bn="সুশৃঙ্খলভাবে শুরু করুন" /> <em><BilingualText en="document." bn="একটি ডকুমেন্ট।" /></em></h2><p><BilingualText en="Explore guided template tools for common business and personal documents. Templates are starting points only and are not individualized legal advice." bn="সাধারণ ব্যবসায়িক ও ব্যক্তিগত নথির জন্য নির্দেশিত টেমপ্লেট ব্যবহার করুন। এগুলো কেবল প্রাথমিক খসড়া; ব্যক্তিগত আইনি পরামর্শ নয়।" /></p><a className="button button-wine" href="/document-studio"><BilingualText en="Open Document Studio" bn="ডকুমেন্ট স্টুডিও খুলুন" /> ↗</a></div>
      </section>

      <section className="process-section">
        <span className="section-kicker">06 / <BilingualText en="HOW WE WORK" bn="আমাদের কাজের পদ্ধতি" /></span><h2><BilingualText en="Understand first." bn="প্রথমে বুঝি।" /> <em><BilingualText en="Advise with purpose." bn="উদ্দেশ্যভিত্তিক পরামর্শ দিই।" /></em></h2>
        <div className="process-grid">{[['01','Understand','Clarify the facts, objectives and jurisdiction.','বুঝে নেওয়া','তথ্য, উদ্দেশ্য ও প্রাসঙ্গিক এখতিয়ার পরিষ্কার করা।'],['02','Assess','Review documents, risks and applicable requirements.','মূল্যায়ন','নথি, ঝুঁকি ও প্রযোজ্য শর্ত পর্যালোচনা।'],['03','Advise','Define options, scope, priorities and next steps.','পরামর্শ','বিকল্প, কাজের পরিধি, অগ্রাধিকার ও পরবর্তী পদক্ষেপ নির্ধারণ।'],['04','Support','Deliver agreed drafting, coordination or representation.','সহায়তা','সম্মত খসড়া, সমন্বয় বা প্রতিনিধিত্বের কাজ সম্পন্ন করা।']].map(x=><article key={x[0]}><span>{x[0]}</span><h3><BilingualText en={x[1]} bn={x[3]} /></h3><p><BilingualText en={x[2]} bn={x[4]} /></p></article>)}</div>
      </section>

      <section className="final-cta"><div><span className="section-kicker">07 / <BilingualText en="PROFESSIONAL ENQUIRIES" bn="পেশাগত যোগাযোগ" /></span><h2><BilingualText en="Make the next decision" bn="পরবর্তী সিদ্ধান্ত নিন" /> <em><BilingualText en="with clarity." bn="স্পষ্ট ধারণা নিয়ে।" /></em></h2><p><BilingualText en="Share a brief outline of the matter. Do not send confidential documents until a secure channel and engagement scope have been agreed." bn="বিষয়টির সংক্ষিপ্ত বিবরণ পাঠান। নিরাপদ যোগাযোগের মাধ্যম ও কাজের পরিধি নির্ধারিত না হওয়া পর্যন্ত গোপনীয় নথি পাঠাবেন না।" /></p></div><div className="final-cta-actions"><a className="button button-sand" href="/consultation"><BilingualText en="Send an enquiry" bn="অনুসন্ধান পাঠান" /> ↗</a><a className="final-email" href="mailto:arefin.imran@gmail.com">arefin.imran@gmail.com</a>{whatsappHref&&<a className="final-email" href={whatsappHref} target="_blank" rel="noreferrer">WhatsApp ↗</a>}</div></section>
      <div className="legal-disclaimer"><BilingualText en="THE ADVISOR provides general information through this website. No legal advice, representation or lawyer-client relationship arises unless a formal engagement is accepted. Services are subject to conflict checks, scope confirmation and applicable professional requirements." bn="THE ADVISOR এই ওয়েবসাইটে সাধারণ তথ্য প্রদান করে। আনুষ্ঠানিকভাবে কাজ গ্রহণ না করা পর্যন্ত কোনো আইনি পরামর্শ, প্রতিনিধিত্ব বা আইনজীবী-মক্কেল সম্পর্ক সৃষ্টি হয় না। সেবা প্রদান স্বার্থের সংঘাত যাচাই, কাজের পরিধি নিশ্চিতকরণ এবং প্রযোজ্য পেশাগত বিধির অধীন।" /></div>
    </main>
  </SiteShell>;
}
