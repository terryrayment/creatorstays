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
          {/* Demo login links */}
          <div className="group relative">
            <Button variant="ghost" size="sm" className="rounded-full text-xs">
              Demo Login ▾
            </Button>
            <div className="invisible absolute right-0 top-full z-50 mt-2 w-48 rounded-xl border border-foreground/10 bg-white/95 p-2 opacity-0 shadow-xl backdrop-blur-sm transition-all group-hover:visible group-hover:opacity-100">
              <Link 
                href="/dashboard/host" 
                className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition-colors hover:bg-foreground/5"
              >
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/10 text-[10px] font-bold text-primary">H</span>
                Host Dashboard
              </Link>
              <Link 
                href="/dashboard/creator" 
                className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition-colors hover:bg-foreground/5"
              >
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-accent/10 text-[10px] font-bold text-accent">C</span>
                Creator Dashboard
              </Link>
            </div>
          </div>
          <Button size="sm" className="rounded-full text-xs" asChild>
            <Link href="/hosts">Host Signup</Link>
          </Button>
        </div>
      </nav>
    </header>
  )
}
