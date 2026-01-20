import type { Metadata } from "next"
import { DM_Sans, Bebas_Neue } from "next/font/google"
import Script from "next/script"
import "./globals.css"
import { Navbar } from "@/components/navigation/navbar"
import { Footer } from "@/components/navigation/footer"
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
  title: {
    default: "CreatorStays - Influencer Marketing for Vacation Rentals",
    template: "%s | CreatorStays",
  },
  description: "Connect vacation rental hosts with content creators. Get more bookings through creator marketing. Pay per post, track every click, own the content forever.",
  keywords: ["vacation rental marketing", "airbnb marketing", "influencer marketing", "content creators", "STR marketing", "vacation rental bookings"],
  authors: [{ name: "CreatorStays" }],
  creator: "CreatorStays",
  publisher: "Wolfpup, Inc.",
  
  // Favicon
  icons: {
    icon: [
      { url: "/favicon.svg", type: "image/svg+xml" },
    ],
    apple: [
      { url: "/apple-touch-icon.svg", type: "image/svg+xml" },
    ],
  },
  
  // Open Graph
  openGraph: {
    type: "website",
    locale: "en_US",
    url: siteUrl,
    siteName: "CreatorStays",
    title: "CreatorStays - Influencer Marketing for Vacation Rentals",
    description: "Connect vacation rental hosts with content creators. Get more bookings through creator marketing.",
    images: [
      {
        url: `${siteUrl}/og-image.svg`,
        width: 1200,
        height: 630,
        alt: "CreatorStays - Influencer Marketing for Vacation Rentals",
      },
    ],
  },
  
  // Twitter
  twitter: {
    card: "summary_large_image",
    title: "CreatorStays - Influencer Marketing for Vacation Rentals",
    description: "Connect vacation rental hosts with content creators. Get more bookings through creator marketing.",
    images: [`${siteUrl}/og-image.svg`],
  },
  
  // Robots
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
  
  // Verification (add your IDs when ready)
  // verification: {
  //   google: "your-google-verification-code",
  // },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={`${dmSans.variable} ${bebasNeue.variable}`}>
      <head>
        {/* Google Analytics */}
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-01XZB7MKG9"
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-01XZB7MKG9');
          `}
        </Script>
        {/* Google Places API for location autocomplete */}
        {process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY && (
          <Script
            src={`https://maps.googleapis.com/maps/api/js?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}&libraries=places`}
            strategy="afterInteractive"
          />
        )}
      </head>
      <body className="flex min-h-screen flex-col bg-black font-body text-foreground antialiased">
        <AuthProvider>
          <Navbar />
          <main className="flex-1 bg-black pt-14">{children}</main>
          <Footer />
        </AuthProvider>
      </body>
    </html>
  )
}
