import Link from "next/link"

export function Navbar() {
  return (
    <header className="fixed left-0 right-0 top-0 z-50 bg-black">
      <nav className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
        {/* Left - Logo icon */}
        <Link 
          href="/" 
          className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-white text-white transition-colors hover:bg-white hover:text-black"
        >
          <span className="text-[14px] font-bold">CS</span>
        </Link>

        {/* Center - Pill nav buttons */}
        <div className="hidden items-center gap-2 md:flex">
          {[
            { href: "/how-it-works", label: "How It Works" },
            { href: "/hosts", label: "For Hosts" },
            { href: "/creators", label: "Creators" },
            { href: "/help", label: "Help" },
          ].map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="rounded-full border-2 border-white bg-white px-5 py-2 text-[11px] font-bold uppercase tracking-wider text-black transition-all hover:bg-transparent hover:text-white"
            >
              {link.label}
            </Link>
          ))}
        </div>

        {/* Right - Launch App */}
        <Link
          href="/dashboard/host"
          className="rounded-full bg-white px-6 py-2.5 text-[11px] font-bold uppercase tracking-wider text-black transition-all hover:bg-white/90"
        >
          Launch App
        </Link>
      </nav>
    </header>
  )
}
