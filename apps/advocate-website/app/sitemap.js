export default function sitemap(){
  const base='https://adv-imran-arefin.vercel.app';
  const paths=[
    '/', '/about', '/advisory', '/international-advisory', '/legal-lounge',
    '/legal-lounge/bangladesh-market-entry',
    '/legal-lounge/company-formation',
    '/legal-lounge/foreign-investment-repatriation',
    '/legal-lounge/tax-vat-registration',
    '/downloads/bangladesh-market-entry-guide',
    '/document-studio', '/app', '/consultation',
    '/advisory/business-formation', '/advisory/corporate-compliance',
    '/advisory/property-real-estate', '/advisory/personal-family',
    '/advisory/litigation-advisory'
  ];
  return paths.map(path=>({
    url:base+path,
    lastModified:new Date(),
    changeFrequency:path==='/'?'weekly':'monthly',
    priority:path==='/'?1:path==='/international-advisory'||path==='/legal-lounge/bangladesh-market-entry'?0.95:path==='/legal-lounge'?0.9:0.7
  }));
}