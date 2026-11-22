export default function SiteShell({ children }) {
  return <>
    <header className="site-nav">
      <a className="site-brand" href="/" aria-label="THE ADVISER home">
        <img src="/arefin-adviser-mark.svg" alt="" />
        <span><b>THE ADVISER</b><small>LED BY IMRAN AREFIN</small></span>
      </a>
      <nav aria-label="Main navigation">
        <a href="/about">About</a>
        <a href="/advisory">Advisory</a>
        <a href="/international-advisory">International</a>
        <a href="/legal-lounge">MY LEGAL LOUNGE</a>
        <a href="/document-studio">Document Studio</a>
      </nav>
      <a className="site-nav-cta" href="/consultation">Request a consultation <span>↗</span></a>
    </header>
    {children}
    <footer className="site-footer">
      <div className="footer-brand"><img src="/arefin-adviser-mark.svg" alt="" /><div><b>THE ADVISER</b><small>LED BY IMRAN AREFIN</small></div></div>
      <div className="footer-contact"><a href="mailto:arefin.imran@gmail.com">arefin.imran@gmail.com</a><span>Dhaka, Bangladesh · By appointment</span></div>
      <div className="footer-note">General information only. No lawyer-client relationship is created by browsing this website or using a self-help template.</div>
      <div className="footer-bottom"><span>© {new Date().getFullYear()} THE ADVISER</span><span>Privacy · Terms · Professional Disclaimer</span></div>
    </footer>
  </>;
}