import { Container } from "@/components/layout/container"
import { Button } from "@/components/ui/button"
import Link from "next/link"

function HeroCollage() {
  return (
    <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden" aria-hidden="true">
      {/* Gradient base */}
      <div className="absolute inset-0 bg-gradient-to-br from-sky-50 via-white to-violet-50/50" />
      
      {/* Large floating gradient orbs - 3D feel */}
      <div className="hero-float-1 absolute -left-32 top-0 h-[500px] w-[500px] rounded-full bg-gradient-to-br from-cyan-400/40 to-blue-600/30 blur-3xl" />
      <div className="hero-float-2 absolute -right-20 top-20 h-[400px] w-[400px] rounded-full bg-gradient-to-br from-pink-400/35 to-rose-500/25 blur-3xl" />
      <div className="hero-float-3 absolute bottom-0 left-1/3 h-[350px] w-[350px] rounded-full bg-gradient-to-br from-amber-300/30 to-orange-500/20 blur-3xl" />
      <div className="hero-float-4 absolute -bottom-20 right-1/4 h-[300px] w-[300px] rounded-full bg-gradient-to-br from-violet-400/35 to-purple-600/25 blur-3xl" />
      
      {/* Floating 3D cards */}
      <div className="hero-card-float absolute left-[5%] top-[20%] h-24 w-32 rounded-2xl bg-white/80 shadow-2xl shadow-cyan-500/20 backdrop-blur-sm" style={{ animationDelay: '0.2s' }}>
        <div className="absolute inset-3 rounded-xl bg-gradient-to-br from-cyan-400 to-blue-500" />
      </div>
      <div className="hero-card-float absolute right-[8%] top-[15%] h-20 w-28 rounded-2xl bg-white/80 shadow-2xl shadow-pink-500/20 backdrop-blur-sm" style={{ animationDelay: '0.4s' }}>
        <div className="absolute inset-3 rounded-xl bg-gradient-to-br from-pink-400 to-rose-500" />
      </div>
      <div className="hero-card-float absolute left-[8%] bottom-[25%] h-16 w-24 rounded-2xl bg-white/80 shadow-2xl shadow-amber-500/20 backdrop-blur-sm" style={{ animationDelay: '0.6s' }}>
        <div className="absolute inset-3 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500" />
      </div>
      <div className="hero-card-float absolute right-[12%] bottom-[30%] h-20 w-20 rounded-2xl bg-white/80 shadow-2xl shadow-violet-500/20 backdrop-blur-sm" style={{ animationDelay: '0.8s' }}>
        <div className="absolute inset-3 rounded-xl bg-gradient-to-br from-violet-400 to-purple-500" />
      </div>
      
      {/* Floating icons with 3D depth */}
      <div className="hero-icon-pop absolute left-[15%] top-[40%]" style={{ animationDelay: '0.5s' }}>
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white shadow-xl shadow-blue-500/30">
          <svg className="h-7 w-7 text-blue-500" viewBox="0 0 24 24" fill="currentColor">
            <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"/>
          </svg>
        </div>
      </div>
      <div className="hero-icon-pop absolute right-[18%] top-[35%]" style={{ animationDelay: '0.7s' }}>
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white shadow-xl shadow-pink-500/30">
          <svg className="h-6 w-6 text-pink-500" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2l2.4 7.4H22l-6 4.6 2.3 7-6.3-4.6L5.7 21l2.3-7-6-4.6h7.6L12 2z"/>
          </svg>
        </div>
      </div>
      <div className="hero-icon-pop absolute left-[75%] bottom-[40%]" style={{ animationDelay: '0.9s' }}>
        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white shadow-xl shadow-amber-500/30">
          <svg className="h-5 w-5 text-amber-500" viewBox="0 0 24 24" fill="currentColor">
            <path d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2v11z"/>
            <circle cx="12" cy="13" r="4"/>
          </svg>
        </div>
      </div>
      
      {/* Decorative rings */}
      <div className="hero-ring absolute left-[20%] bottom-[15%] h-20 w-20 rounded-full border-4 border-cyan-400/30" style={{ animationDelay: '1s' }} />
      <div className="hero-ring absolute right-[25%] top-[60%] h-16 w-16 rounded-full border-4 border-pink-400/30" style={{ animationDelay: '1.2s' }} />
      
      {/* Sparkle dots */}
      <div className="hero-sparkle absolute left-[30%] top-[25%] h-2 w-2 rounded-full bg-cyan-400" style={{ animationDelay: '0.3s' }} />
      <div className="hero-sparkle absolute right-[30%] top-[20%] h-3 w-3 rounded-full bg-pink-400" style={{ animationDelay: '0.5s' }} />
      <div className="hero-sparkle absolute left-[60%] bottom-[25%] h-2 w-2 rounded-full bg-amber-400" style={{ animationDelay: '0.7s' }} />
      <div className="hero-sparkle absolute right-[40%] bottom-[35%] h-2.5 w-2.5 rounded-full bg-violet-400" style={{ animationDelay: '0.9s' }} />
    </div>
  )
}

function HeroSection() {
  return (
    <section className="relative min-h-[85vh] overflow-hidden flex items-center">
      <HeroCollage />
      <Container>
        <div className="relative flex flex-col items-center text-center">
          {/* Badge - slides down */}
          <span className="hero-slide-down text-label mb-4 inline-block rounded-full border border-primary/20 bg-white/80 px-4 py-1.5 text-sm font-medium text-primary shadow-lg shadow-primary/10 backdrop-blur-sm">
            ✨ Influencer marketing for vacation rentals
          </span>
          
          {/* Main headline - fades up with scale */}
          <h1 className="hero-fade-up font-heading text-[2.75rem] font-bold leading-[1.05] tracking-tight sm:text-6xl md:text-7xl lg:text-[5rem]" style={{ animationDelay: '0.15s' }}>
            <span className="block">Get more bookings</span>
            <span className="block mt-1 bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent bg-[length:200%_auto] animate-gradient-x">
              with creator marketing
            </span>
          </h1>
          
          {/* Subheadline - fades up */}
          <p className="hero-fade-up mt-6 max-w-xl text-lg text-muted-foreground md:text-xl" style={{ animationDelay: '0.3s' }}>
            Hire vetted creators to showcase your property. They post, you get clicks and stunning content.
          </p>
          
          {/* CTAs - pop in */}
          <div className="hero-fade-up mt-8 flex flex-col gap-4 sm:flex-row" style={{ animationDelay: '0.45s' }}>
            <Button size="lg" asChild className="hero-btn px-10 py-6 text-base font-semibold shadow-2xl shadow-primary/30 hover:shadow-primary/40 hover:scale-105 transition-all duration-300">
              <Link href="/hosts">Start as Host</Link>
            </Button>
            <Button size="lg" variant="outline" asChild className="hero-btn px-10 py-6 text-base font-semibold bg-white/90 backdrop-blur-sm border-2 hover:bg-white hover:scale-105 transition-all duration-300">
              <Link href="/waitlist">Join as Creator</Link>
            </Button>
          </div>
          
          {/* Trust indicators - fade in last */}
          <div className="hero-fade-up mt-12 flex items-center gap-6 text-sm text-muted-foreground" style={{ animationDelay: '0.6s' }}>
            <span className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              Free to start
            </span>
            <span className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              No contracts
            </span>
            <span className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              Pay per result
            </span>
          </div>
        </div>
      </Container>
    </section>
  )
}

function EdgeBlur({ className = "" }: { className?: string }) {
  return (
    <div 
      className={`absolute inset-0 -z-10 overflow-hidden ${className}`}
      aria-hidden="true"
    >
      <div className="absolute -top-1/4 right-0 h-[500px] w-[600px] rounded-full bg-accent/[0.04] blur-[120px]" />
      <div className="absolute -bottom-1/4 left-0 h-[400px] w-[500px] rounded-full bg-primary/[0.03] blur-[100px]" />
    </div>
  )
}

const hostReasons = [
  {
    title: "More Traffic",
    description: "Creators drive real clicks to your listing. Track every visit.",
  },
  {
    title: "Professional Content",
    description: "Scroll-stopping photos and videos. Yours to keep forever.",
  },
  {
    title: "Targeted Reach",
    description: "Real travelers who actually book, not random followers.",
  }
]

function WhyHostsSection() {
  return (
    <section className="py-10">
      <Container>
        <div className="mb-6 opacity-0 reveal">
          <h2 className="text-2xl font-semibold tracking-tight text-foreground md:text-3xl">
            Why hosts use CreatorStays
          </h2>
        </div>
        <div className="relative">
          {/* Edge blur behind pills */}
          <div className="pointer-events-none absolute -inset-20 -z-10" aria-hidden="true">
            <div className="absolute left-1/4 top-0 h-[400px] w-[500px] rounded-full bg-[hsl(199,89%,48%)]/[0.08] blur-[180px]" />
            <div className="absolute bottom-0 right-1/4 h-[350px] w-[450px] rounded-full bg-[hsl(213,94%,45%)]/[0.06] blur-[160px]" />
          </div>
          <div className="focus-group flex flex-col gap-3">
            {hostReasons.map((reason, i) => (
              <div 
                key={reason.title}
                className="marketing-pill focus-card opacity-0 reveal"
                style={{ animationDelay: `${(i + 1) * 100}ms` }}
              >
                <div className="marketing-pill-glow" aria-hidden="true" />
                <div className="relative z-10 flex flex-1 items-center justify-between gap-4">
                  <h3 className="text-[15px] font-semibold tracking-tight md:text-base">{reason.title}</h3>
                  <p className="text-[12px] text-muted-foreground/70 md:text-[13px]">{reason.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </Container>
    </section>
  )
}

const steps = [
  { number: "1", title: "Add property", description: "Paste your Airbnb link to get started" },
  { number: "2", title: "Find creators", description: "Browse by niche, audience size & location" },
  { number: "3", title: "Track traffic", description: "Real-time click analytics on every link" },
  { number: "4", title: "Pay & settle", description: "Direct payouts to creators through Stripe" },
]

function HowItWorksSection() {
  return (
    <section className="py-8">
      <Container>
        <div className="mb-6 opacity-0 reveal">
          <h2 className="text-xl font-semibold tracking-tight text-foreground md:text-2xl">
            How it works
          </h2>
        </div>
        <div className="relative">
          {/* Edge blur behind pills */}
          <div className="pointer-events-none absolute -inset-16 -z-10" aria-hidden="true">
            <div className="absolute left-0 top-1/2 h-[300px] w-[400px] -translate-y-1/2 rounded-full bg-[hsl(199,89%,48%)]/[0.07] blur-[160px]" />
            <div className="absolute right-0 top-1/2 h-[280px] w-[380px] -translate-y-1/2 rounded-full bg-[hsl(213,94%,45%)]/[0.05] blur-[140px]" />
          </div>
          <div className="focus-group flex flex-col gap-2">
            {steps.map((step, i) => (
              <div 
                key={step.number}
                className="marketing-pill focus-card opacity-0 reveal"
                style={{ animationDelay: `${(i + 1) * 80}ms` }}
              >
                <div className="marketing-pill-glow" aria-hidden="true" />
                <div className="relative z-10 flex flex-1 items-center gap-4">
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
                    {step.number}
                  </span>
                  <div className="flex flex-1 items-center justify-between gap-4">
                    <h3 className="text-[14px] font-semibold tracking-tight md:text-[15px]">{step.title}</h3>
                    <p className="text-[11px] text-muted-foreground/60 md:text-[12px]">{step.description}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </Container>
    </section>
  )
}

const creatorTypes = [
  { category: "Travel", description: "Destination & adventure content" },
  { category: "Lifestyle", description: "Home & living inspiration" },
  { category: "Photography", description: "Stunning visual storytelling" },
  { category: "Vlog", description: "Day-in-the-life experiences" },
  { category: "Food & Hospitality", description: "Culinary & hosting content" },
  { category: "Adventure", description: "Outdoor & exploration content" },
]

function BetaSection() {
  return (
    <section className="py-16">
      <Container>
        <div className="text-center opacity-0 reveal">
          <span className="inline-block rounded-full border border-accent/20 bg-accent/10 px-4 py-1.5 text-sm font-medium text-accent">
            Now in Beta
          </span>
          <h2 className="mt-4 text-2xl font-semibold tracking-tight sm:text-3xl">
            CreatorStays is launching soon
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-sm text-muted-foreground">
            The marketplace connecting vacation rental hosts with content creators.
          </p>
        </div>

        {/* For Hosts / For Creators - Clean two-column layout */}
        <div className="relative mt-12">
          {/* Background blur */}
          <div className="pointer-events-none absolute -inset-10 -z-10" aria-hidden="true">
            <div className="absolute left-1/4 top-1/2 h-[200px] w-[300px] -translate-y-1/2 rounded-full bg-[hsl(213,94%,45%)]/[0.05] blur-[100px]" />
            <div className="absolute right-1/4 top-1/2 h-[180px] w-[280px] -translate-y-1/2 rounded-full bg-[hsl(199,89%,48%)]/[0.04] blur-[90px]" />
          </div>
          
          <div className="beta-card-group grid gap-px overflow-hidden rounded-2xl border border-foreground/[0.04] bg-foreground/[0.02] md:grid-cols-2">
            {/* Hosts - Primary */}
            <div className="beta-card group relative p-8 opacity-0 reveal" style={{ animationDelay: '100ms' }}>
              <div className="beta-card-glow" aria-hidden="true" />
              <div className="relative z-10">
                <span className="text-[10px] font-semibold uppercase tracking-widest text-primary/70">For property owners</span>
                <h3 className="mt-2 text-xl font-semibold tracking-tight">Hosts</h3>
                <p className="mt-3 text-[13px] leading-relaxed text-muted-foreground/70">
                  List your property and connect with creators who drive real traffic through authentic content.
                </p>
                <div className="mt-6">
                  <Button size="sm" className="text-xs" asChild>
                    <Link href="/hosts">Host Signup</Link>
                  </Button>
                </div>
              </div>
            </div>

            {/* Creators - Secondary */}
            <div className="beta-card group relative border-t border-foreground/[0.04] p-8 opacity-0 reveal md:border-l md:border-t-0" style={{ animationDelay: '200ms' }}>
              <div className="beta-card-glow" aria-hidden="true" />
              <div className="relative z-10">
                <span className="text-[10px] font-semibold uppercase tracking-widest text-accent/70">For content creators</span>
                <h3 className="mt-2 text-xl font-semibold tracking-tight">Creators</h3>
                <p className="mt-3 text-[13px] leading-relaxed text-muted-foreground/70">
                  Get early access to browse properties and receive collaboration offers from hosts.
                </p>
                <div className="mt-6">
                  <Button size="sm" variant="outline" className="text-xs" asChild>
                    <Link href="/waitlist">Join Creator Waitlist</Link>
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Creator categories - Clean grid */}
        <div className="mt-14">
          <p className="mb-6 text-center text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/50">
            Creator categories we&apos;re recruiting
          </p>
          <div className="category-grid grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {creatorTypes.map((type, i) => (
              <div 
                key={type.category}
                className="category-item group relative rounded-xl p-4 opacity-0 reveal"
                style={{ animationDelay: `${(i + 1) * 50}ms` }}
              >
                <div className="category-item-glow" aria-hidden="true" />
                <div className="relative z-10 flex items-start gap-3">
                  <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-primary/10 to-accent/10 text-[9px] font-bold text-primary/70">
                    {type.category[0]}
                  </span>
                  <div className="min-w-0">
                    <p className="text-[13px] font-medium leading-tight text-foreground/90">{type.category}</p>
                    <p className="mt-0.5 text-[11px] text-muted-foreground/50">{type.description}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </Container>
    </section>
  )
}

function FinalCTASection() {
  return (
    <section className="relative overflow-hidden py-24">
      <EdgeBlur />
      <Container>
        <div className="relative rounded-3xl border border-primary/10 bg-gradient-to-br from-primary/5 via-transparent to-accent/5 p-12 text-center md:p-16 opacity-0 reveal">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl">
            Get early access
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-muted-foreground">
            Be among the first to use CreatorStays when we launch.
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Button size="lg" asChild className="px-8">
              <Link href="/hosts">Host Signup</Link>
            </Button>
            <Button size="lg" variant="outline" asChild className="px-8">
              <Link href="/waitlist">Creator Waitlist</Link>
            </Button>
          </div>
        </div>
      </Container>
    </section>
  )
}

export default function HomePage() {
  return (
    <>
      <HeroSection />
      <WhyHostsSection />
      <HowItWorksSection />
      <BetaSection />
      <FinalCTASection />
    </>
  )
}
