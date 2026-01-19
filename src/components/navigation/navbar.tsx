import Link from "next/link"
import { Button } from "@/components/ui/button"

const navLinks = [
  { href: "/how-it-works", label: "How It Works" },
  { href: "/hosts", label: "For Hosts" },
  { href: "/waitlist", label: "Creators" },
]

export function Navbar() {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 px-4 py-4">
      {/* Edge blur glow behind navbar */}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-32 overflow-hidden" aria-hidden="true">
        <div className="absolute left-1/2 top-0 h-40 w-[600px] -translate-x-1/2 rounded-full bg-primary/8 blur-[80px]" />
      </div>
      
      {/* Pill container */}
      <nav className="relative mx-auto flex h-12 max-w-4xl items-center justify-between gap-4 rounded-full border border-white/60 bg-white/70 px-2 pl-5 shadow-lg shadow-black/[0.03] backdrop-blur-xl">
        <Link href="/" className="font-heading text-lg font-semibold tracking-tight">
          CreatorStays
        </Link>
        
        <ul className="hidden items-center gap-1 md:flex">
          {navLinks.map((link) => (
            <li key={link.href}>
              <Link
                href={link.href}
                className="rounded-full px-3 py-1.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-foreground/5 hover:text-foreground"
              >
                {link.label}
              </Link>
            </li>
          ))}
        </ul>
        
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" className="hidden rounded-full text-xs sm:inline-flex" asChild>
            <Link href="/waitlist">Join Creator Waitlist</Link>
          </Button>
          <Button size="sm" className="rounded-full text-xs" asChild>
            <Link href="/hosts">Host Signup</Link>
          </Button>
        </div>
      </nav>
    </header>
  )
}
