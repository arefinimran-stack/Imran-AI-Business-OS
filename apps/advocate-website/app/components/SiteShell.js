'use client';

import { useEffect, useMemo, useRef, useState } from 'react';

const searchItems = [
  { title: 'About Imran Arefin', detail: 'Professional profile and approach', href: '/about', terms: 'advocate profile qualifications experience clarity strategy confidence' },
  { title: 'Advisory Services', detail: 'Business, corporate, property, family and litigation-related advisory', href: '/advisory', terms: 'business formation contracts compliance governance property family litigation' },
  { title: 'Foreign Investment & International Business Advisory', detail: 'Bangladesh market-entry and local coordination', href: '/international-advisory', terms: 'foreign investor investment bangladesh market entry joint venture' },
  { title: 'MY LEGAL LOUNGE', detail: 'Legal awareness and business insights', href: '/legal-lounge', terms: 'articles guides legal awareness business property family compliance' },
  { title: 'AI Document Studio', detail: 'Self-help templates and working drafts', href: '/document-studio', terms: 'nda demand notice company checklist agreement template' },
  { title: 'Request a Consultation', detail: 'Send an enquiry with consent', href: '/consultation', terms: 'contact consultation enquiry appointment' }
];

export default function SiteShell({ children }) {
  const [theme, setTheme] = useState('light');
  const [searchOpen, setSearchOpen] = useState(false);
  const [query, setQuery] = useState('');
  const inputRef = useRef(null);

  useEffect(() => {
    try {
      const saved = localStorage.getItem('the-advisor-theme');
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
        <a href="/about">About</a>
        <a href="/advisory">Advisory</a>
        <a href="/international-advisory">International</a>
        <a href="/legal-lounge">MY LEGAL LOUNGE</a>
        <a href="/document-studio">Document Studio</a>
        <a href="/consultation">Contact</a>
      </nav>
      <div className="site-tools">
        <div className="site-search">
          <button className="search-trigger" type="button" aria-label="Open search" aria-expanded={searchOpen} onClick={() => {
            setSearchOpen(open => !open);
            if (!searchOpen) window.setTimeout(() => inputRef.current?.focus(), 0);
            else setQuery('');
          }}>⌕</button>
          {searchOpen && <input ref={inputRef} className="search-input" type="search" value={query} onChange={event => setQuery(event.target.value)} placeholder="Search THE ADVISOR…" aria-label="Search THE ADVISOR" />}
          {searchOpen && query.trim() && <div className="search-results">
            {results.length ? results.map(item => <a href={item.href} key={item.href}><b>{item.title}</b><small>{item.detail}</small></a>) : <p>No exact match. <a href={'/consultation?query=' + encodeURIComponent(query)}>Send this topic to THE ADVISOR</a><small>Search routes you to published resources or the consultation form; it does not provide legal advice.</small></p>}
          </div>}
        </div>
        <button className="theme-toggle" type="button" onClick={() => setTheme(current => current === 'dark' ? 'light' : 'dark')} aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'} title={theme === 'dark' ? 'Light · Glossy' : 'Dark · Matte'}>{theme === 'dark' ? '☼' : '◐'}</button>
      </div>
    </header>
    {children}
    <footer className="site-footer">
      <div className="footer-brand"><img src="/arefin-adviser-mark.svg" alt="" /><div><b>THE ADVISOR</b><small>Led by IMRAN AREFIN</small></div></div>
      <div className="footer-contact"><a href="mailto:arefin.imran@gmail.com">arefin.imran@gmail.com</a><span>Dhaka, Bangladesh · By appointment</span></div>
      <div className="footer-note">General information only. No lawyer-client relationship is created by browsing this website or using a self-help template.</div>
      <div className="footer-bottom"><span>© {new Date().getFullYear()} THE ADVISOR</span><span>Privacy · Terms · Professional Disclaimer</span></div>
    </footer>
  </>;
}