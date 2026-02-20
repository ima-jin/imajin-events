import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: {
    default: 'Imajin Events',
    template: '%s | Imajin Events',
  },
  description: 'Create and discover events on the sovereign network. No platform lock-in. You own your identity.',
  keywords: ['events', 'tickets', 'sovereign', 'decentralized', 'imajin'],
  authors: [{ name: 'Imajin', url: 'https://imajin.ai' }],
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://events.imajin.ai',
    siteName: 'Imajin Events',
    title: 'Imajin Events',
    description: 'Create and discover events on the sovereign network',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Imajin Events',
    description: 'Create and discover events on the sovereign network',
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-black">
        <main className="container mx-auto px-4 py-8">
          {children}
        </main>
      </body>
    </html>
  );
}
