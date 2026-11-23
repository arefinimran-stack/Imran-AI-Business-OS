'use client';

import { useSiteLanguage } from './SiteShell';

export default function BilingualText({ en, bn, as = 'span', className, ...props }) {
  const language = useSiteLanguage();
  const Tag = as;
  return <Tag className={className} {...props}>{language === 'bn' ? (bn || en) : en}</Tag>;
}
