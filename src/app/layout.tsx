import './globals.css';
import type { Metadata } from 'next';

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  themeColor: '#000000',
};

export const metadata: Metadata = {
  title: 'Zoorich Bank | Private Banking & Vault Ledger',
  description: 'Swiss private digital banking platform powered by an ACID double-entry ledger, instant transfers, and Zoorich vault security.',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'Zoorich Bank',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/favicon.ico" />
      </head>
      <body>{children}</body>
    </html>
  );
}
