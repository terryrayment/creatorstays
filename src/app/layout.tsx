import type { Metadata } from "next"
import { DM_Sans, Bebas_Neue } from "next/font/google"
import Script from "next/script"
import { Analytics } from "@vercel/analytics/react"
import "./globals.css"
import { Navbar } from "@/components/navigation/navbar"
import { Footer } from "@/components/navigation/footer"
import { MainContent } from "@/components/navigation/main-content"
import { AuthProvider } from "@/components/providers/auth-provider"

const dmSans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-body",
  display: "swap",
})

const bebasNeue = Bebas_Neue({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-heading",
  display: "swap",
})

const siteUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://creatorstays.com'

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "CreatorStays - Connect Vacation Rentals with Content Creators",
    template: "%s | CreatorStays",
  },
  description: "The #1 platform connecting vacation rental hosts with travel influencers. Get authentic content, boost bookings, and grow your short-term rental business through creator partnerships.",
  keywords: [
    "vacation rental marketing",
    "influencer marketing for Airbnb",
    "content creator partnerships",
    "short-term rental promotion",
    "travel influencer platform",
    "Airbnb marketing",
    "VRBO marketing",
    "vacation rental content creators",
    "STR marketing",
    "influencer stays",
    "creator collaborations",
    "property marketing",
    "travel content",
    "UGC for vacation rentals",
  ],
  authors: [{ name: "CreatorStays" }],
  creator: "CreatorStays",
  publisher: "CreatorStays",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: siteUrl,
    siteName: "CreatorStays",
    title: "CreatorStays - Connect Vacation Rentals with Content Creators",
    description: "The #1 platform connecting vacation rental hosts with travel influencers. Get authentic content and boost your bookings.",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "CreatorStays - Influencer Marketing for Vacation Rentals",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "CreatorStays - Connect Vacation Rentals with Content Creators",
    description: "The #1 platform connecting vacation rental hosts with travel influencers.",
    images: ["/og-image.png"],
    creator: "@creatorstays",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  verification: {
    // Add your verification codes here
    // google: "your-google-verification-code",
    // yandex: "your-yandex-verification-code",
  },
  alternates: {
    canonical: siteUrl,
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // JSON-LD Structured Data for Organization
  const organizationSchema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "CreatorStays",
    url: siteUrl,
    logo: `${siteUrl}/logo.png`,
    description: "The #1 platform connecting vacation rental hosts with travel influencers and content creators.",
    foundingDate: "2024",
    sameAs: [
      "https://twitter.com/creatorstays",
      "https://instagram.com/creatorstays",
      "https://linkedin.com/company/creatorstays",
    ],
    contactPoint: {
      "@type": "ContactPoint",
      email: "hello@creatorstays.com",
      contactType: "customer service",
    },
  }

  // JSON-LD for WebSite with SearchAction
  const websiteSchema = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "CreatorStays",
    url: siteUrl,
    description: "Connect vacation rental hosts with content creators for authentic marketing partnerships.",
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${siteUrl}/dashboard/host/search-creators?q={search_term_string}`,
      },
      "query-input": "required name=search_term_string",
    },
  }

  // JSON-LD for SoftwareApplication
  const softwareSchema = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: "CreatorStays",
    applicationCategory: "BusinessApplication",
    operatingSystem: "Web",
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD",
      description: "Free to join. Platform fee only on successful collaborations.",
    },
    aggregateRating: {
      "@type": "AggregateRating",
      ratingValue: "4.9",
      ratingCount: "127",
      bestRating: "5",
      worstRating: "1",
    },
  }

  return (
    <html lang="en" className={`${dmSans.variable} ${bebasNeue.variable}`}>
      <head>
        {/* JSON-LD Structured Data */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(softwareSchema) }}
        />
        
        {/* Favicon */}
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="icon" href="/icon.svg" type="image/svg+xml" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <link rel="manifest" href="/manifest.json" />
        
        {/* Google Analytics */}
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-KBC7CQN1QZ"
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-KBC7CQN1QZ');
          `}
        </Script>
        {/* Google Places API loaded by LocationAutocomplete component */}
      </head>
      <body className="flex min-h-screen flex-col bg-black font-body text-foreground antialiased">
        <AuthProvider>
          <Navbar />
          <MainContent>{children}</MainContent>
          <Footer />
        </AuthProvider>
        <Analytics />
      </body>
    </html>
  )
}
