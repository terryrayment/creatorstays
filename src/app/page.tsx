import Link from "next/link"

// Refined sticker - House (simpler, thicker stroke)
function HouseSticker({ className = "" }: { className?: string }) {
  return (
    <svg className={`sticker-float ${className}`} viewBox="0 0 72 72" fill="none">
      <rect x="2" y="2" width="68" height="68" rx="14" fill="#FFE566" stroke="black" strokeWidth="4"/>
      <path d="M36 16L56 30V54H16V30L36 16Z" fill="white" stroke="black" strokeWidth="4" strokeLinejoin="round"/>
      <rect x="30" y="40" width="12" height="14" fill="#FFE566" stroke="black" strokeWidth="3"/>
    </svg>
  )
}

// Refined sticker - Camera (simpler)
function CameraSticker({ className = "" }: { className?: string }) {
  return (
    <svg className={`sticker-float ${className}`} viewBox="0 0 72 72" fill="none" style={{ animationDelay: '2s' }}>
      <rect x="2" y="2" width="68" height="68" rx="14" fill="#4ECDC4" stroke="black" strokeWidth="4"/>
      <rect x="14" y="26" width="44" height="32" rx="4" fill="white" stroke="black" strokeWidth="4"/>
      <circle cx="36" cy="42" r="10" fill="#4ECDC4" stroke="black" strokeWidth="4"/>
    </svg>
  )
}

function HeroSection() {
  return (
    <section className="min-h-screen bg-black px-6 pb-16 pt-8 lg:px-12">
      {/* Pill nav - tighter */}
      <nav className="mx-auto mb-16 flex max-w-6xl flex-wrap justify-center gap-2">
        {[
          { href: "/how-it-works", label: "How It Works" },
          { href: "/hosts", label: "Hosts" },
          { href: "/creators", label: "Creators" },
          { href: "/help", label: "Help" },
        ].map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="rounded-full border-2 border-white/20 px-5 py-2 text-[11px] font-semibold uppercase tracking-widest text-white transition-all hover:border-white hover:bg-white hover:text-black"
          >
            {item.label}
          </Link>
        ))}
      </nav>

      {/* Hero grid - 1 dominant, 1 supporting */}
      <div className="mx-auto grid max-w-6xl gap-8 lg:grid-cols-[1.2fr_1fr] lg:items-center">
        {/* Left - Dominant headline block */}
        <div>
          <h1 className="font-heading text-[4.5rem] leading-[0.85] tracking-[-0.02em] text-white sm:text-[6rem] md:text-[7.5rem] lg:text-[6.5rem] xl:text-[8rem]">
            CREATOR
            <br />
            <span className="text-white/40">STAYS</span>
          </h1>
          
          <p className="mt-8 max-w-sm text-[15px] leading-relaxed text-white/50">
            Vacation rental marketing powered by creators.
          </p>

          {/* CTAs - Slush-style pills */}
          <div className="mt-10 flex flex-wrap gap-3">
            <Link
              href="/hosts"
              className="group inline-flex h-12 items-center gap-2 rounded-full bg-white px-7 text-[12px] font-semibold uppercase tracking-widest text-black transition-transform hover:scale-[1.02]"
            >
              Start as Host
              <svg className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M7 17L17 7M17 7H7M17 7V17" />
              </svg>
            </Link>
            <Link
              href="/waitlist"
              className="inline-flex h-12 items-center gap-2 rounded-full border-2 border-white px-7 text-[12px] font-semibold uppercase tracking-widest text-white transition-all hover:bg-white hover:text-black"
            >
              Creator Waitlist
            </Link>
          </div>
        </div>

        {/* Right - Supporting color block */}
        <div className="relative">
          <div className="relative rounded-2xl border-4 border-black bg-[#FFE566] p-8 lg:p-10">
            <h2 className="font-heading text-[2.5rem] leading-[0.9] tracking-[-0.01em] text-black sm:text-[3rem]">
              GET MORE
              <br />
              BOOKINGS
            </h2>
            <p className="mt-4 text-[14px] leading-relaxed text-black/60">
              Creators showcase your property. You get traffic and content.
            </p>

            {/* Guide links */}
            <div className="mt-8 space-y-0 border-t-2 border-black/10">
              {[
                { href: "/how-it-works", label: "How it works" },
                { href: "/creators", label: "Browse creators" },
                { href: "/pricing", label: "Pricing" },
              ].map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="flex items-center justify-between border-b-2 border-black/10 py-3 text-[12px] font-semibold uppercase tracking-widest text-black transition-colors hover:border-black"
                >
                  {link.label}
                  <span className="text-black/40">→</span>
                </Link>
              ))}
            </div>
          </div>

          {/* Single sticker - purposeful placement */}
          <HouseSticker className="absolute -left-6 -top-6 h-16 w-16 lg:-left-10 lg:-top-10 lg:h-20 lg:w-20" />
        </div>
      </div>
    </section>
  )
}

function ValueCardsSection() {
  return (
    <section className="bg-black px-6 pb-20 lg:px-12">
      <div className="mx-auto grid max-w-6xl gap-4 md:grid-cols-3">
        {/* Card 1 */}
        <div className="rounded-2xl border-4 border-black bg-[#FFE566] p-6">
          <h3 className="font-heading text-[1.75rem] italic leading-[0.9] text-black">
            REAL
            <br />
            TRAFFIC
          </h3>
          <p className="mt-3 text-[13px] text-black/60">
            Track every click to your listing.
          </p>
        </div>

        {/* Card 2 */}
        <div className="relative rounded-2xl border-4 border-black bg-[#4ECDC4] p-6">
          <h3 className="font-heading text-[1.75rem] italic leading-[0.9] text-black">
            CONTENT
            <br />
            YOU OWN
          </h3>
          <p className="mt-3 text-[13px] text-black/60">
            Photos and videos. Yours forever.
          </p>
          <CameraSticker className="absolute -bottom-4 -right-4 h-14 w-14" />
        </div>

        {/* Card 3 */}
        <div className="rounded-2xl border-4 border-black bg-[#DDA0DD] p-6">
          <h3 className="font-heading text-[1.75rem] italic leading-[0.9] text-black">
            TARGETED
            <br />
            REACH
          </h3>
          <p className="mt-3 text-[13px] text-black/60">
            Real travelers who actually book.
          </p>
        </div>
      </div>
    </section>
  )
}

function HowItWorksSection() {
  const steps = [
    { num: "01", title: "Add property", desc: "Paste your Airbnb link" },
    { num: "02", title: "Find creators", desc: "Browse by niche and audience" },
    { num: "03", title: "Track traffic", desc: "Real-time click analytics" },
    { num: "04", title: "Pay creators", desc: "Direct payouts via Stripe" },
  ]

  return (
    <section className="bg-white px-6 py-20 lg:px-12">
      <div className="mx-auto max-w-6xl">
        <div className="grid gap-12 lg:grid-cols-[1fr_1.2fr] lg:gap-20">
          {/* Left */}
          <h2 className="font-heading text-[3.5rem] leading-[0.85] tracking-[-0.02em] text-black sm:text-[4.5rem]">
            HOW IT
            <br />
            <span className="text-black/30">WORKS</span>
          </h2>

          {/* Right */}
          <div className="space-y-0 border-t-2 border-black/10">
            {steps.map((step) => (
              <div key={step.num} className="flex gap-5 border-b-2 border-black/10 py-5">
                <span className="font-heading text-[1.5rem] text-black/20">{step.num}</span>
                <div>
                  <h3 className="text-[16px] font-semibold text-black">{step.title}</h3>
                  <p className="mt-0.5 text-[13px] text-black/50">{step.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

function CTASection() {
  return (
    <section className="bg-black px-6 py-20 lg:px-12">
      <div className="mx-auto grid max-w-6xl gap-4 md:grid-cols-2">
        {/* Hosts block */}
        <div className="relative overflow-hidden rounded-2xl border-4 border-black bg-[#FFE566] p-8 lg:p-10">
          <h3 className="font-heading text-[2.5rem] leading-[0.85] text-black sm:text-[3rem]">
            LIST YOUR
            <br />
            <em>PROPERTY</em>
          </h3>
          <p className="mt-4 max-w-xs text-[14px] text-black/60">
            Join hosts using creator marketing.
          </p>
          <Link
            href="/hosts"
            className="group mt-6 inline-flex h-11 items-center gap-2 rounded-full bg-black px-6 text-[11px] font-semibold uppercase tracking-widest text-white"
          >
            Host Signup
            <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M7 17L17 7M17 7H7M17 7V17" />
            </svg>
          </Link>
        </div>

        {/* Support block */}
        <div className="relative overflow-hidden rounded-2xl border-4 border-black bg-[#4ECDC4] p-8 lg:p-10">
          <h3 className="font-heading text-[2.5rem] leading-[0.85] text-black sm:text-[3rem]">
            ALWAYS
            <br />
            <em>HERE</em>
          </h3>
          <p className="mt-4 max-w-xs text-[14px] text-black/60">
            Questions? Our team has you covered.
          </p>
          <div className="mt-6 flex flex-wrap gap-2">
            <Link
              href="/waitlist"
              className="inline-flex h-11 items-center gap-2 rounded-full bg-black px-6 text-[11px] font-semibold uppercase tracking-widest text-white"
            >
              Creator Waitlist
              <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M7 17L17 7M17 7H7M17 7V17" />
              </svg>
            </Link>
            <Link
              href="/help"
              className="inline-flex h-11 items-center rounded-full border-2 border-black px-6 text-[11px] font-semibold uppercase tracking-widest text-black"
            >
              Help
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}

function FooterMarquee() {
  return (
    <section className="overflow-hidden bg-[#4ECDC4] py-5">
      <div className="marquee-track flex whitespace-nowrap">
        {[...Array(8)].map((_, i) => (
          <span key={i} className="mx-6 font-heading text-[3.5rem] tracking-tight text-black sm:text-[5rem]">
            CREATORSTAYS
          </span>
        ))}
      </div>
    </section>
  )
}

export default function HomePage() {
  return (
    <div className="-mt-20">
      <HeroSection />
      <ValueCardsSection />
      <HowItWorksSection />
      <CTASection />
      <FooterMarquee />
    </div>
  )
}
