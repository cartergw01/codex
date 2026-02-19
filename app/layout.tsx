import './globals.css';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'NewsLoom',
  description: 'AI curated personalized news reader and aggregator'
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
