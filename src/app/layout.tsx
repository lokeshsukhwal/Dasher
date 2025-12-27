import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({ 
  subsets: ['latin'],
  variable: '--font-inter',
});

export const metadata: Metadata = {
  title: 'Business Hours Comparator | DoorDash Operations',
  description: 'Compare and verify business hour changes for DoorDash delivery operations. Generate professional verification remarks instantly.',
  keywords: ['business hours', 'comparison', 'verification', 'DoorDash', 'operations'],
  authors: [{ name: 'Operations Team' }],
  viewport: 'width=device-width, initial-scale=1',
  themeColor: '#2563eb',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={inter.variable}>
      <body className={inter.className}>{children}</body>
    </html>
  );
}