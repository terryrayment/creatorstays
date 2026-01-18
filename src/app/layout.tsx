import type { Metadata } from 'next';
import { DM_Sans, Fraunces } from 'next/font/google';
import './globals.css';
import { Toaster } from '@/components/ui/toaster';

const dmSans = DM_Sans({
  subsets: ['latin'],
  variable: '--font-dm-sans',
  display: 'swap',
});

const fraunces = Fraunces({
  subsets: ['latin'],
  variable: '--font-fraunces',
  display: 'swap',
});

export const metadata: Metadata = {
  title: {
    default: 'CreatorStays - Connect Creators with Vacation Rentals',
    template: '%s | CreatorStays',
  },
  description:
    'The marketplace connecting content creators with short-term rental hosts. Earn commissions promoting amazing properties.',
  keywords: [
    'creator economy',
    'influencer marketing',
    'vacation rentals',
    'airbnb affiliate',
    'travel influencer',
    'content creator',
    'affiliate marketing',
  ],
  authors: [{ name: 'CreatorStays' }],
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://creatorstays.com',
    siteName: 'CreatorStays',
    title: 'CreatorStays - Connect Creators with Vacation Rentals',
    description:
      'The marketplace connecting content creators with short-term rental hosts. Earn commissions promoting amazing properties.',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'CreatorStays',
    description:
      'The marketplace connecting content creators with short-term rental hosts.',
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
    <html lang="en" className={`${dmSans.variable} ${fraunces.variable}`}>
      <body className="min-h-screen bg-background font-sans antialiased">
        {children}
        <Toaster />
      </body>
    </html>
  );
}
