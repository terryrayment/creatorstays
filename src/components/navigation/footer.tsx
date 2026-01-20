import Link from "next/link"

export function Footer() {
  return (
    <footer className="bg-black px-3 pb-4 pt-2 lg:px-4">
      <div className="mx-auto max-w-7xl">
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
