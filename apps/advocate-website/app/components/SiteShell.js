'use client';

import { createContext, useContext, useEffect, useMemo, useRef, useState } from 'react';

export const LanguageContext = createContext('en');
export const useSiteLanguage = () => useContext(LanguageContext);

const searchItems = [
  { title: 'About Imran Arefin', titleBn: 'ইমরান আরেফিন সম্পর্কে', detail: 'Professional profile and approach', detailBn: 'পেশাগত পরিচিতি ও কাজের পদ্ধতি', href: '/about', terms: 'advocate profile qualifications experience clarity strategy confidence' },
  { title: 'Advisory Services', titleBn: 'পরামর্শ সেবা', detail: 'Business, corporate, property, family and litigation-related advisory', detailBn: 'ব্যবসা, করপোরেট, সম্পত্তি, পারিবারিক ও মামলা-সংক্রান্ত পরামর্শ', href: '/advisory', terms: 'business formation contracts compliance governance property family litigation' },
  { title: 'Foreign Investment & International Business Advisory', titleBn: 'বিদেশি বিনিয়োগ ও আন্তর্জাতিক ব্যবসায়িক পরামর্শ', detail: 'Bangladesh market-entry and local coordination', detailBn: 'বাংলাদেশে বাজার প্রবেশ ও স্থানীয় সমন্বয়', href: '/international-advisory', terms: 'foreign investor investment bangladesh market entry joint venture' },
  { title: 'MY LEGAL LOUNGE', titleBn: 'আমার আইনি পাঠাগার', detail: 'Legal awareness and business insights', detailBn: 'আইনি সচেতনতা ও ব্যবসায়িক বিশ্লেষণ', href: '/legal-lounge', terms: 'articles guides legal awareness business property family compliance' },
  { title: 'AI Document Studio', titleBn: 'এআই ডকুমেন্ট স্টুডিও', detail: 'Self-help templates and working drafts', detailBn: 'স্ব-সহায়ক টেমপ্লেট ও প্রাথমিক খসড়া', href: '/document-studio', terms: 'nda demand notice company checklist agreement template' },
  { title: 'Contact the Practice', titleBn: 'চেম্বারে যোগাযোগ', detail: 'Send an enquiry with consent', detailBn: 'সম্মতিসহ যোগাযোগের অনুরোধ পাঠান', href: '/consultation', terms: 'contact consultation enquiry appointment' }
];

export default function SiteShell({ children }) {
  const [theme, setTheme] = useState('light');
  const [searchOpen, setSearchOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [language, setLanguage] = useState('en');
  const inputRef = useRef(null);

  useEffect(() => {
    try {
      const saved = localStorage.getItem('the-advisor-theme');
      const savedLanguage = localStorage.getItem('the-advisor-language');
      setLanguage(savedLanguage === 'bn' ? 'bn' : 'en');
      setTheme(saved || (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'));
    } catch {
      setTheme('light');
    }
  }, []);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    try { localStorage.setItem('the-advisor-theme', theme); } catch {}
  }, [theme]);

  useEffect(() => {
    document.documentElement.lang = language;
    document.documentElement.dataset.language = language;
    try { localStorage.setItem('the-advisor-language', language); } catch {}
  }, [language]);

  useEffect(() => {
    const onKeyDown = event => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault();
        setSearchOpen(true);
        window.setTimeout(() => inputRef.current?.focus(), 0);
      }
      if (event.key === 'Escape') {
        setSearchOpen(false);
        setQuery('');
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];
    return searchItems.filter(item => (item.title + ' ' + item.detail + ' ' + item.terms).toLowerCase().includes(q));
  }, [query]);

  return <>
    <header className="site-nav">
      <a className="site-brand" href="/" aria-label="THE ADVISOR home">
        <img src="/arefin-adviser-mark.svg" alt="" />
        <span><b>THE ADVISOR</b><small>Led by IMRAN AREFIN</small></span>
      </a>
      <nav aria-label="Main navigation">
        <a href="/about">{language === 'bn' ? 'পরিচিতি' : 'About'}</a>
        <a href="/advisory">{language === 'bn' ? 'পরামর্শ' : 'Advisory'}</a>
        <a href="/international-advisory">{language === 'bn' ? 'আন্তর্জাতিক' : 'International'}</a>
        <a href="/legal-lounge">{language === 'bn' ? 'আইনি পাঠাগার' : 'MY LEGAL LOUNGE'}</a>
        <a href="/document-studio">{language === 'bn' ? 'ডকুমেন্ট স্টুডিও' : 'Document Studio'}</a>
        <a href="/consultation">{language === 'bn' ? 'যোগাযোগ' : 'Contact'}</a>
      </nav>
      <div className="site-tools">
        <button className="language-toggle" type="button" onClick={() => setLanguage(current => current === 'bn' ? 'en' : 'bn')} aria-label={language === 'bn' ? 'Switch to English' : 'বাংলা ভাষায় দেখুন'}>{language === 'bn' ? 'EN' : 'বাংলা'}</button>
        <div className="site-search">
          <button className="search-trigger" type="button" aria-label="Open search" aria-expanded={searchOpen} onClick={() => {
            setSearchOpen(open => !open);
            if (!searchOpen) window.setTimeout(() => inputRef.current?.focus(), 0);
            else setQuery('');
          }}>⌕</button>
          {searchOpen && <input ref={inputRef} className="search-input" type="search" value={query} onChange={event => setQuery(event.target.value)} placeholder="Search THE ADVISOR…" aria-label="Search THE ADVISOR" />}
          {searchOpen && query.trim() && <div className="search-results">
            {results.length ? results.map(item => <a href={item.href} key={item.href}><b>{language === 'bn' ? item.titleBn : item.title}</b><small>{language === 'bn' ? item.detailBn : item.detail}</small></a>) : <p>{language === 'bn' ? 'মিল পাওয়া যায়নি।' : 'No exact match.'} <a href={'/consultation?query=' + encodeURIComponent(query)}>{language === 'bn' ? 'বিষয়টি পাঠান' : 'Send this topic to THE ADVISOR'}</a><small>{language === 'bn' ? 'সার্চ প্রকাশিত তথ্য বা যোগাযোগ ফর্মে নিয়ে যায়; এটি আইনি পরামর্শ নয়।' : 'Search routes you to published resources or the enquiry form; it does not provide legal advice.'}</small></p>}
          </div>}
        </div>
        <button className="theme-toggle" type="button" onClick={() => setTheme(current => current === 'dark' ? 'light' : 'dark')} aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'} title={theme === 'dark' ? (language === 'bn' ? 'হালকা · গ্লসি' : 'Light · Glossy') : (language === 'bn' ? 'গাঢ় · ম্যাট' : 'Dark · Matte')}>{theme === 'dark' ? '☼' : '◐'}</button>
      </div>
    </header>
    <LanguageContext.Provider value={language}>{children}</LanguageContext.Provider>
    <footer className="site-footer">
      <div className="footer-brand"><img src="/arefin-adviser-mark.svg" alt="" /><div><b>THE ADVISOR</b><small>Led by IMRAN AREFIN</small></div></div>
      <div className="footer-contact"><a href="mailto:arefin.imran@gmail.com">arefin.imran@gmail.com</a><span>{language === 'bn' ? 'ঢাকা, বাংলাদেশ · পূর্বনির্ধারিত সময়ে' : 'Dhaka, Bangladesh · By appointment'}</span></div>
      <div className="footer-note">{language === 'bn' ? 'এখানে প্রকাশিত তথ্য সাধারণ সচেতনতার জন্য। ওয়েবসাইট দেখা বা স্ব-সহায়ক টেমপ্লেট ব্যবহারে আইনজীবী-মক্কেল সম্পর্ক সৃষ্টি হয় না।' : 'General information only. No lawyer-client relationship is created by browsing this website or using a self-help template.'}</div>
      <div className="footer-bottom"><span>© {new Date().getFullYear()} THE ADVISOR</span><span>Privacy · Terms · Professional Disclaimer</span></div>
    </footer>
  </>;
}