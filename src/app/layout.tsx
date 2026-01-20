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

export const metadata: Metadata = {
  title: "CreatorStays - Influencer Marketing for Vacation Rentals",
  description: "Connect vacation rental hosts with content creators. Get more bookings through creator marketing.",
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
