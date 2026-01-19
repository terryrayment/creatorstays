import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { Navbar } from "@/components/navigation/navbar"
import { Footer } from "@/components/navigation/footer"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "CreatorStays",
  description: "Connect creators with unique stays",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <div className="flex min-h-screen flex-col">
          <Navbar />
          <main className="flex-1">{children}</main>
          <Footer />
        </div>
      </body>
    </html>
  )
}
