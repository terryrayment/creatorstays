import Link from "next/link"

export function Navbar() {
  return (
    <header className="fixed left-0 right-0 top-0 z-50 bg-black">
      <nav className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4 lg:px-6">
        {/* Left - Logo icon */}
        <Link 
          href="/" 
          className="flex h-9 w-9 items-center justify-center rounded-full border-2 border-white text-white transition-colors hover:bg-white hover:text-black"
        >
          <span className="text-[13px] font-bold">CS</span>
        </Link>

        {/* Center - Pill nav buttons */}
        <div className="hidden items-center gap-1.5 md:flex">
          {[
            { href: "/how-it-works", label: "How It Works" },
            { href: "/hosts", label: "For Hosts" },
            { href: "/creators", label: "Creators" },
            { href: "/help", label: "Help" },
          ].map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="rounded-full border-2 border-white bg-white px-4 py-1.5 text-[10px] font-bold uppercase tracking-wider text-black transition-all hover:bg-transparent hover:text-white"
            >
              {link.label}
            </Link>
          ))}
        </div>

        {/* Right - Login dropdown + CTA */}
        <div className="flex items-center gap-2">
          {/* Login dropdown */}
          <div className="group relative">
            <button className="rounded-full border-2 border-white/50 px-4 py-1.5 text-[10px] font-bold uppercase tracking-wider text-white transition-all hover:border-white">
              Login ▾
            </button>
            <div className="invisible absolute right-0 top-full z-50 mt-2 w-44 rounded-xl border-2 border-black bg-white p-1.5 opacity-0 shadow-xl transition-all group-hover:visible group-hover:opacity-100">
              <Link 
                href="/dev-login?role=host" 
                className="flex items-center gap-2 rounded-lg px-3 py-2 text-[11px] font-semibold text-black transition-colors hover:bg-black/5"
              >
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#FFD84A] text-[9px] font-bold">H</span>
                Host Login
              </Link>
              <Link 
                href="/dev-login?role=creator" 
                className="flex items-center gap-2 rounded-lg px-3 py-2 text-[11px] font-semibold text-black transition-colors hover:bg-black/5"
              >
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#4AA3FF] text-[9px] font-bold">C</span>
                Creator Login
              </Link>
            </div>
          </div>
          
          <Link
            href="/hosts#signup"
            className="rounded-full bg-white px-5 py-1.5 text-[10px] font-bold uppercase tracking-wider text-black transition-all hover:bg-white/90"
          >
            Host Signup
          </Link>
        </div>
      </nav>
    </header>
  )
}
