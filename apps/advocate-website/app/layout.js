import './globals.css';
export const metadata={
  metadataBase:new URL('https://adv-imran-arefin.vercel.app'),
  title:{default:'THE ADVISER | Led by Imran Arefin',template:'%s | THE ADVISER'},
  description:'Legal and business advisory in Bangladesh, led by Imran Arefin. Foreign investment, international business, corporate, property and personal legal support.',
  openGraph:{title:'THE ADVISER — Led by Imran Arefin',description:'Clear legal and business advisory for Bangladesh and international clients.',type:'website',locale:'en_BD'},
  robots:{index:true,follow:true}
};
export default function RootLayout({children}){return <html lang="en"><body>{children}</body></html>}