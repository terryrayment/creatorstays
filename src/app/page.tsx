import Link from "next/link"

// Slush-style sticker SVGs with thick black stroke
function HouseSticker({ className = "" }: { className?: string }) {
  return (
    <svg className={`sticker-float ${className}`} viewBox="0 0 80 80" fill="none">
      <rect x="2" y="2" width="76" height="76" rx="16" fill="#FFE566" stroke="black" strokeWidth="3"/>
      <path d="M40 18L58 32V58H22V32L40 18Z" fill="white" stroke="black" strokeWidth="3" strokeLinejoin="round"/>
      <rect x="34" y="42" width="12" height="16" fill="#FFE566" stroke="black" strokeWidth="2"/>
      <circle cx="52" cy="26" r="6" fill="white" stroke="black" strokeWidth="2"/>
    </svg>
  )
}

function CameraSticker({ className = "" }: { className?: string }) {
  return (
    <svg className={`sticker-float ${className}`} viewBox="0 0 80 80" fill="none" style={{ animationDelay: '1s' }}>
      <rect x="2" y="2" width="76" height="76" rx="16" fill="#5DADE2" stroke="black" strokeWidth="3"/>
      <rect x="16" y="28" width="48" height="36" rx="4" fill="white" stroke="black" strokeWidth="3"/>
      <circle cx="40" cy="46" r="12" fill="#5DADE2" stroke="black" strokeWidth="3"/>
      <circle cx="40" cy="46" r="6" fill="white" stroke="black" strokeWidth="2"/>
      <rect x="30" y="20" width="20" height="10" rx="2" fill="white" stroke="black" strokeWidth="2"/>
    </svg>
  )
}

function RocketSticker({ className = "" }: { className?: string }) {
  return (
    <svg className={`sticker-float ${className}`} viewBox="0 0 80 80" fill="none" style={{ animationDelay: '2s' }}>
      <rect x="2" y="2" width="76" height="76" rx="16" fill="#DDA0DD" stroke="black" strokeWidth="3"/>
      <path d="M40 14C40 14 52 26 52 42C52 54 40 66 40 66C40 66 28 54 28 42C28 26 40 14 40 14Z" fill="white" stroke="black" strokeWidth="3"/>
      <circle cx="40" cy="38" r="6" fill="#5DADE2" stroke="black" strokeWidth="2"/>
      <path d="M28 50L20 58L28 54" fill="#FF6B6B" stroke="black" strokeWidth="2" strokeLinejoin="round"/>
      <path d="M52 50L60 58L52 54" fill="#FF6B6B" stroke="black" strokeWidth="2" strokeLinejoin="round"/>
      <path d="M36 58L40 70L44 58" fill="#FF6B6B" stroke="black" strokeWidth="2" strokeLinejoin="round"/>
    </svg>
  )
}

// Pill navigation button
function PillNav({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link 
      href={href}
      className="rounded-full border-2 border-white/30 px-4 py-2 text-[11px] font-semibold uppercase tracking-wider text-white transition-all hover:border-white hover:bg-white hover:text-black"
    >
      {children}
    </Link>
  )
}

function HeroSection() {
  return (
    <section className="relative min-h-screen bg-black pt-8">
      {/* Pill nav row */}
      <div className="mx-auto flex max-w-7xl flex-wrap justify-center gap-3 px-6 pb-12">
        <PillNav href="/how-it-works">How It Works</PillNav>
        <PillNav href="/hosts">Hosts</PillNav>
        <PillNav href="/creators">Creators</PillNav>
        <PillNav href="/help">Help</PillNav>
      </div>

      {/* Main hero grid */}
      <div className="mx-auto grid max-w-7xl gap-6 px-6 pb-20 lg:grid-cols-2">
        {/* Left - Headline */}
        <div className="flex flex-col justify-center">
          <h1 className="font-heading text-[4rem] leading-[0.9] tracking-tight text-white sm:text-[5.5rem] md:text-[7rem] lg:text-[6rem] xl:text-[8rem]">
            <span className="block">CREATOR</span>
            <span className="block">STAYS</span>
          </h1>
          <p className="mt-8 max-w-md text-[16px] leading-relaxed text-white/60">
            The marketplace connecting vacation rental hosts with content creators. Get traffic, get content.
          </p>
          
          {/* Slush-style CTAs */}
          <div className="mt-10 flex flex-wrap gap-4">
            <Link 
              href="/hosts"
              className="inline-flex h-14 items-center gap-2 rounded-full bg-white px-8 text-[13px] font-semibold uppercase tracking-wide text-black transition-transform hover:scale-105"
            >
              Start as Host
              <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M7 17L17 7M17 7H7M17 7V17"/>
              </svg>
            </Link>
            <Link 
              href="/waitlist"
              className="inline-flex h-14 items-center gap-2 rounded-full border-2 border-white px-8 text-[13px] font-semibold uppercase tracking-wide text-white transition-all hover:bg-white hover:text-black"
            >
              Join Creator Waitlist
            </Link>
          </div>
        </div>

        {/* Right - Color blocks with guide */}
        <div className="relative flex items-center justify-center lg:justify-end">
          {/* Yellow block */}
          <div className="relative h-[400px] w-full max-w-[400px] rounded-3xl border-[3px] border-black bg-[#FFE566] p-8 lg:h-[500px]">
            <h2 className="font-heading text-[2.5rem] leading-[0.95] tracking-tight text-black sm:text-[3rem]">
              GET MORE<br/>BOOKINGS
            </h2>
            <p className="mt-4 text-[14px] leading-relaxed text-black/70">
              Hire vetted creators to showcase your property. They post, you get clicks.
            </p>
            
            {/* Guide menu */}
            <div className="mt-8 space-y-3">
              <Link href="/how-it-works" className="flex items-center justify-between border-b-2 border-black/20 pb-3 text-[13px] font-semibold uppercase tracking-wide text-black hover:border-black">
                How it works
                <span>→</span>
              </Link>
              <Link href="/creators" className="flex items-center justify-between border-b-2 border-black/20 pb-3 text-[13px] font-semibold uppercase tracking-wide text-black hover:border-black">
                Browse creators
                <span>→</span>
              </Link>
              <Link href="/pricing" className="flex items-center justify-between text-[13px] font-semibold uppercase tracking-wide text-black hover:opacity-70">
                View pricing
                <span>→</span>
              </Link>
            </div>
          </div>
          
          {/* Floating stickers */}
          <HouseSticker className="absolute -left-8 top-10 h-20 w-20 lg:-left-16 lg:h-24 lg:w-24" />
          <CameraSticker className="absolute -right-4 top-1/3 h-16 w-16 lg:-right-10 lg:h-20 lg:w-20" />
          <RocketSticker className="absolute -bottom-4 left-1/4 h-[72px] w-[72px] lg:h-[88px] lg:w-[88px]" />
        </div>
      </div>
    </section>
  )
}

function ValueCardsSection() {
  return (
    <section className="bg-black px-6 py-20">
      <div className="mx-auto max-w-7xl">
        {/* Three color cards */}
        <div className="grid gap-6 md:grid-cols-3">
          {/* Card 1 - Yellow */}
          <div className="relative overflow-hidden rounded-3xl border-[3px] border-black bg-[#FFE566] p-8">
            <h3 className="font-heading text-[2rem] italic leading-[0.95] tracking-tight text-black">
              REAL<br/>TRAFFIC
            </h3>
            <p className="mt-4 text-[13px] text-black/70">
              Creators drive real clicks to your listing. Track every visit.
            </p>
            <div className="absolute -bottom-4 -right-4 h-24 w-24 rounded-2xl border-[3px] border-black bg-white/50" />
          </div>
          
          {/* Card 2 - Blue */}
          <div className="relative overflow-hidden rounded-3xl border-[3px] border-black bg-[#5DADE2] p-8">
            <RocketSticker className="absolute -right-6 -top-6 h-20 w-20 rotate-12" />
            <h3 className="font-heading text-[2rem] italic leading-[0.95] tracking-tight text-black">
              CONTENT<br/>YOU OWN
            </h3>
            <p className="mt-4 text-[13px] text-black/70">
              Photos and videos created for your property. Yours forever.
            </p>
          </div>
          
          {/* Card 3 - Purple/Pink */}
          <div className="relative overflow-hidden rounded-3xl border-[3px] border-black bg-[#DDA0DD] p-8">
            <h3 className="font-heading text-[2rem] italic leading-[0.95] tracking-tight text-black">
              TARGETED<br/>REACH
            </h3>
            <p className="mt-4 text-[13px] text-black/70">
              Real travelers who actually book, not random followers.
            </p>
            <div className="absolute -bottom-2 -right-2 h-16 w-32 rounded-xl border-[3px] border-black bg-white/30" />
          </div>
        </div>
      </div>
    </section>
  )
}

function HowItWorksSection() {
  const steps = [
    { num: "01", title: "Add your property", desc: "Paste your Airbnb link to get started" },
    { num: "02", title: "Find creators", desc: "Browse by niche, audience size & location" },
    { num: "03", title: "Track traffic", desc: "Real-time click analytics on every link" },
    { num: "04", title: "Pay & settle", desc: "Direct payouts to creators through Stripe" },
  ]

  return (
    <section className="bg-white px-6 py-24">
      <div className="mx-auto max-w-7xl">
        <div className="grid gap-16 lg:grid-cols-2">
          {/* Left - Title */}
          <div>
            <h2 className="font-heading text-[3.5rem] leading-[0.9] tracking-tight text-black sm:text-[4.5rem]">
              HOW IT<br/>WORKS
            </h2>
          </div>
          
          {/* Right - Steps */}
          <div className="space-y-8">
            {steps.map((step) => (
              <div key={step.num} className="flex gap-6 border-b-2 border-black/10 pb-6">
                <span className="font-heading text-[2rem] text-black/30">{step.num}</span>
                <div>
                  <h3 className="text-[18px] font-semibold text-black">{step.title}</h3>
                  <p className="mt-1 text-[14px] text-black/60">{step.desc}</p>
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
    <section className="bg-black px-6 py-20">
      <div className="mx-auto max-w-7xl">
        <div className="grid gap-6 md:grid-cols-2">
          {/* Subscribe / Hosts block - Yellow */}
          <div className="relative overflow-hidden rounded-3xl border-[3px] border-black bg-[#FFE566] p-10">
            <h3 className="font-heading text-[2.5rem] leading-[0.9] tracking-tight text-black sm:text-[3rem]">
              LIST YOUR<br/><em>PROPERTY</em>
            </h3>
            <p className="mt-4 max-w-sm text-[14px] text-black/70">
              Join hosts using creator marketing to drive more bookings to their vacation rentals.
            </p>
            <div className="mt-8">
              <Link 
                href="/hosts"
                className="inline-flex h-12 items-center gap-2 rounded-full bg-black px-6 text-[12px] font-semibold uppercase tracking-wide text-white"
              >
                Host Signup
                <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M7 17L17 7M17 7H7M17 7V17"/>
                </svg>
              </Link>
            </div>
            <HouseSticker className="absolute -bottom-6 -right-6 h-28 w-28 rotate-12" />
          </div>
          
          {/* Support / Creators block - Blue */}
          <div className="relative overflow-hidden rounded-3xl border-[3px] border-black bg-[#5DADE2] p-10">
            <h3 className="font-heading text-[2.5rem] leading-[0.9] tracking-tight text-black sm:text-[3rem]">
              ALWAYS <em>HERE</em><br/>TO HELP
            </h3>
            <p className="mt-4 max-w-sm text-[14px] text-black/70">
              Whether you&apos;re a host or creator, our support team has you covered.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link 
                href="/waitlist"
                className="inline-flex h-12 items-center gap-2 rounded-full bg-black px-6 text-[12px] font-semibold uppercase tracking-wide text-white"
              >
                Creator Waitlist
                <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M7 17L17 7M17 7H7M17 7V17"/>
                </svg>
              </Link>
              <Link 
                href="/help"
                className="inline-flex h-12 items-center gap-2 rounded-full border-2 border-black px-6 text-[12px] font-semibold uppercase tracking-wide text-black"
              >
                Get Support
              </Link>
            </div>
            <CameraSticker className="absolute -bottom-8 -right-8 h-32 w-32 -rotate-12" />
          </div>
        </div>
      </div>
    </section>
  )
}

function FooterMarquee() {
  return (
    <section className="overflow-hidden bg-[#5DADE2] py-6">
      <div className="marquee-track flex whitespace-nowrap">
        {[...Array(6)].map((_, i) => (
          <span key={i} className="mx-8 font-heading text-[4rem] tracking-tight text-black sm:text-[6rem]">
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
