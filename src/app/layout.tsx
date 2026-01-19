import type { Metadata } from "next"
import { DM_Sans, Fraunces } from "next/font/google"
import "./globals.css"
import { Navbar } from "@/components/navigation/navbar"
import { Footer } from "@/components/navigation/footer"

const dmSans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-body",
  display: "swap",
})

const fraunces = Fraunces({
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
    <html lang="en" className={`${dmSans.variable} ${fraunces.variable}`}>
      <body className="hero-atmosphere flex min-h-screen flex-col font-body text-foreground antialiased">
        <Navbar />
        <main className="flex-1 pt-20">{children}</main>
        <Footer />
      </body>
    </html>
  )
}
