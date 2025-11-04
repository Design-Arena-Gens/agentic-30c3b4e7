import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Backlink Automation Agent',
  description: 'Autonomous backlink creation pipeline for growing your domain authority.'
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
