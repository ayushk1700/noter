import type { Metadata, Viewport } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Fokus - The Sanctuary for Raw Ideas',
  description: 'A beautiful note-taking application to capture and organize your thoughts',
  keywords: ['notes', 'productivity', 'writing', 'organization'],
  authors: [{ name: 'Fokus Team' }],
  creator: 'Fokus',
  manifest: '/manifest.json',
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://fokus.app',
    siteName: 'Fokus',
    title: 'Fokus - The Sanctuary for Raw Ideas',
    description: 'A beautiful note-taking application to capture and organize your thoughts',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  colorScheme: 'light',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="Fokus" />
        <meta name="theme-color" content="#FF7D54" />
      </head>
      <body className="bg-[#F9F8F6]">{children}</body>
    </html>
  );
}
