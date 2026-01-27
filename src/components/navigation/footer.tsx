"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"

export function Footer() {
  const pathname = usePathname()
  const [email, setEmail] = useState("")
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle")

  // Don't render Footer on dashboard pages - they have their own layouts
  const isDashboardPage = pathname?.startsWith('/dashboard') || pathname?.startsWith('/beta/dashboard')
  if (isDashboardPage) {
    return null
  }

  const handleNewsletterSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email) return

    setStatus("loading")
    try {
      const res = await fetch("/api/waitlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          email, 
          userType: "newsletter",
          source: "footer" 
        }),
      })
      
      if (res.ok) {
        setStatus("success")
        setEmail("")
      } else {
        setStatus("error")
      }
    } catch {
      setStatus("error")
    }

    // Reset status after 3 seconds
    setTimeout(() => setStatus("idle"), 3000)
  }

  return (
    <footer className="bg-black px-3 pb-4 pt-2 lg:px-4">
      <div className="mx-auto max-w-7xl">
        {/* Newsletter Bar */}
        <div className="mb-2 rounded-2xl border-[3px] border-black bg-[#FFD84A] p-5">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-[9px] font-black uppercase tracking-wider text-black/60">
                Stay in the loop
              </p>
              <p className="mt-1 text-lg font-black text-black">
                Get the latest creator marketing tips & platform updates
              </p>
            </div>
            <form onSubmit={handleNewsletterSubmit} className="flex w-full gap-2 md:w-auto">
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="you@email.com"
                className="h-11 flex-1 rounded-full border-[3px] border-black bg-white px-4 text-sm font-medium text-black placeholder:text-black/40 focus:outline-none md:w-64"
                required
              />
              <button
                type="submit"
                disabled={status === "loading"}
                className="h-11 whitespace-nowrap rounded-full border-[3px] border-black bg-black px-6 text-[11px] font-black uppercase tracking-wider text-white transition-transform hover:-translate-y-0.5 disabled:opacity-50"
              >
                {status === "loading" ? "..." : status === "success" ? "✓ Subscribed!" : "Subscribe"}
              </button>
            </form>
          </div>
          {status === "error" && (
            <p className="mt-2 text-xs font-bold text-red-600">Something went wrong. Try again!</p>
          )}
        </div>

        <div className="grid gap-2 md:grid-cols-[1.5fr_1fr_1fr]">
          {/* Brand block - Green */}
          <div className="rounded-2xl border-[3px] border-black bg-[#28D17C] p-5">
            <h3 className="font-heading text-[2rem] leading-[0.85] tracking-[-0.02em] text-black sm:text-[2.5rem]">
              CREATOR
              <br />
              <span className="text-black/40">STAYS</span>
            </h3>
            <p className="mt-3 max-w-xs text-[12px] font-medium text-black/60">
              The marketplace connecting vacation rental hosts with content creators.
            </p>
            <p className="mt-4 text-[10px] font-bold text-black/40">
              © {new Date().getFullYear()} Wolfpup, Inc. All rights reserved.
            </p>
            <p className="mt-2 text-[10px] font-bold text-black/60">
              <a 
                href="https://wolfpup.xyz" 
                target="_blank" 
                rel="noopener noreferrer"
                className="underline hover:text-black transition-colors"
              >
                A WOLFPUP PROJECT
              </a>
            </p>
          </div>

          {/* Links block - White */}
          <div className="rounded-2xl border-[3px] border-black bg-white p-5">
            <p className="text-[9px] font-black uppercase tracking-wider text-black/40">
              Navigate
            </p>
            <div className="mt-3 space-y-2">
              {[
                { href: "/how-it-works", label: "How It Works" },
                { href: "/how-to/hosts", label: "How To (Hosts)" },
                { href: "/how-to/creators", label: "How To (Creators)" },
                { href: "/creators", label: "Browse Creators" },
                { href: "/pricing", label: "Pricing" },
                { href: "/careers", label: "Careers" },
              ].map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="block text-[11px] font-bold uppercase tracking-wider text-black transition-colors hover:text-black/60"
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>

          {/* CTA block - Blue */}
          <div className="rounded-2xl border-[3px] border-black bg-[#4AA3FF] p-5">
            <p className="text-[9px] font-black uppercase tracking-wider text-black/40">
              Get Started
            </p>
            <div className="mt-3 space-y-2">
              <Link
                href="/hosts"
                className="flex h-9 items-center justify-center gap-2 rounded-full bg-black text-[9px] font-black uppercase tracking-wider text-white transition-transform duration-200 hover:-translate-y-0.5"
              >
                Host Signup
                <svg className="h-2.5 w-2.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                  <path d="M7 17L17 7M17 7H7M17 7V17" />
                </svg>
              </Link>
              <Link
                href="/waitlist"
                className="flex h-9 items-center justify-center gap-2 rounded-full border-[3px] border-black bg-white text-[9px] font-black uppercase tracking-wider text-black transition-transform duration-200 hover:-translate-y-0.5"
              >
                Creator Waitlist
              </Link>
              <Link
                href="/help"
                className="flex h-9 items-center justify-center rounded-full border-[3px] border-black text-[9px] font-black uppercase tracking-wider text-black transition-transform duration-200 hover:-translate-y-0.5"
              >
                Help Center
              </Link>
            </div>
          </div>
        </div>
        
        {/* Legal links - subtle at bottom */}
        <div className="mt-3 flex items-center justify-center gap-4 text-[9px] text-white/30">
          <Link href="/terms" className="hover:text-white/50 transition-colors">Terms & Conditions</Link>
          <span>·</span>
          <Link href="/privacy" className="hover:text-white/50 transition-colors">Privacy Policy</Link>
          <span>·</span>
          <Link href="/careers" className="hover:text-white/50 transition-colors">Careers</Link>
          <span>·</span>
          <span>Not affiliated with Airbnb, Inc.</span>
        </div>
      </div>
    </footer>
  )
}
