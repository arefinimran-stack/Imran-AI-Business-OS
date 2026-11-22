import './globals.css';
import './os.css';

export const metadata = {
  title: 'IA² Visual RC | Founder Command Centre',
  description: 'Private visual command centre for IA² Holdings, its operating entities, founder approvals and digital operations.',
};

export default function RootLayout({ children }) {
  return <html lang="en"><body>{children}</body></html>;
}
