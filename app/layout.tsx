import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Imran AI Business OS | Legal Workspace',
  description: 'A practical workspace starter for legal matters, deadlines, and team follow-ups.',
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
