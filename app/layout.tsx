import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "IMRAN AI | Founder Command Centre",
  description: "The personal AI Business Operating System command centre.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
