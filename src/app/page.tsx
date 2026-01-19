import { Container } from "@/components/layout/container"
import { Button } from "@/components/ui/button"
import Link from "next/link"

function HeroCollage() {
  return (
    <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden" aria-hidden="true">
      {/* Vibrant gradient base */}
      <div className="absolute inset-0 bg-gradient-to-br from-sky-50 via-white to-rose-50" />
      
      {/* Large animated color blobs - cel style */}
      <div className="cel-blob absolute -left-20 top-10 h-80 w-80 rounded-full bg-gradient-to-br from-cyan-400/30 to-blue-500/20" style={{ animationDelay: '0s' }} />
      <div className="cel-blob absolute -right-10 top-20 h-96 w-96 rounded-full bg-gradient-to-br from-pink-400/25 to-rose-500/15" style={{ animationDelay: '0.5s' }} />
      <div className="cel-blob absolute left-1/4 -bottom-20 h-72 w-72 rounded-full bg-gradient-to-br from-amber-300/30 to-orange-400/20" style={{ animationDelay: '1s' }} />
      <div className="cel-blob absolute right-1/4 bottom-10 h-64 w-64 rounded-full bg-gradient-to-br from-violet-400/25 to-purple-500/15" style={{ animationDelay: '1.5s' }} />
      <div className="cel-blob absolute left-1/2 top-0 h-56 w-56 rounded-full bg-gradient-to-br from-emerald-400/20 to-teal-500/15" style={{ animationDelay: '0.8s' }} />
      
      {/* Floating shapes - hand-drawn feel */}
      <div className="cel-shape cel-shape-1 absolute left-[8%] top-[15%]">
        <svg width="60" height="60" viewBox="0 0 60 60" className="cel-wiggle">
          <circle cx="30" cy="30" r="25" fill="none" stroke="url(#grad1)" strokeWidth="3" strokeDasharray="8 4" />
          <defs><linearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stopColor="#06b6d4" /><stop offset="100%" stopColor="#3b82f6" /></linearGradient></defs>
        </svg>
      </div>
      
      <div className="cel-shape cel-shape-2 absolute right-[12%] top-[20%]">
        <svg width="50" height="50" viewBox="0 0 50 50" className="cel-spin">
          <path d="M25 5 L30 20 L45 25 L30 30 L25 45 L20 30 L5 25 L20 20 Z" fill="none" stroke="url(#grad2)" strokeWidth="2.5" strokeLinejoin="round" />
          <defs><linearGradient id="grad2" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stopColor="#f472b6" /><stop offset="100%" stopColor="#ec4899" /></linearGradient></defs>
        </svg>
      </div>
      
      <div className="cel-shape cel-shape-3 absolute left-[5%] bottom-[25%]">
        <svg width="55" height="55" viewBox="0 0 55 55" className="cel-bounce">
          <rect x="10" y="10" width="35" height="35" rx="8" fill="none" stroke="url(#grad3)" strokeWidth="3" transform="rotate(15 27.5 27.5)" />
          <defs><linearGradient id="grad3" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stopColor="#fbbf24" /><stop offset="100%" stopColor="#f97316" /></linearGradient></defs>
        </svg>
      </div>
      
      <div className="cel-shape cel-shape-4 absolute right-[8%] bottom-[30%]">
        <svg width="45" height="45" viewBox="0 0 45 45" className="cel-wiggle" style={{ animationDelay: '0.3s' }}>
          <polygon points="22.5,5 40,40 5,40" fill="none" stroke="url(#grad4)" strokeWidth="2.5" strokeLinejoin="round" />
          <defs><linearGradient id="grad4" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stopColor="#a78bfa" /><stop offset="100%" stopColor="#8b5cf6" /></linearGradient></defs>
        </svg>
      </div>
      
      {/* Sparkle dots */}
      <div className="cel-sparkle absolute left-[20%] top-[35%] h-3 w-3 rounded-full bg-cyan-400" style={{ animationDelay: '0s' }} />
      <div className="cel-sparkle absolute right-[25%] top-[15%] h-2 w-2 rounded-full bg-pink-400" style={{ animationDelay: '0.2s' }} />
      <div className="cel-sparkle absolute left-[75%] top-[45%] h-2.5 w-2.5 rounded-full bg-amber-400" style={{ animationDelay: '0.4s' }} />
      <div className="cel-sparkle absolute left-[30%] bottom-[20%] h-2 w-2 rounded-full bg-violet-400" style={{ animationDelay: '0.6s' }} />
      <div className="cel-sparkle absolute right-[15%] bottom-[40%] h-3 w-3 rounded-full bg-emerald-400" style={{ animationDelay: '0.8s' }} />
      <div className="cel-sparkle absolute left-[45%] top-[10%] h-2 w-2 rounded-full bg-rose-400" style={{ animationDelay: '1s' }} />
      <div className="cel-sparkle absolute right-[40%] bottom-[15%] h-2.5 w-2.5 rounded-full bg-blue-400" style={{ animationDelay: '1.2s' }} />
      
      {/* Squiggly lines */}
      <svg className="cel-squiggle absolute left-[15%] top-[55%] opacity-40" width="80" height="30" viewBox="0 0 80 30" style={{ animationDelay: '0s' }}>
        <path d="M5 15 Q 15 5, 25 15 T 45 15 T 65 15 T 75 15" fill="none" stroke="#06b6d4" strokeWidth="3" strokeLinecap="round" />
      </svg>
      <svg className="cel-squiggle absolute right-[10%] top-[60%] opacity-40" width="70" height="25" viewBox="0 0 70 25" style={{ animationDelay: '0.5s' }}>
        <path d="M5 12 Q 12 2, 20 12 T 35 12 T 50 12 T 65 12" fill="none" stroke="#f472b6" strokeWidth="2.5" strokeLinecap="round" />
      </svg>
      
      {/* Home icon - bold cel style */}
      <div className="cel-icon absolute left-[10%] top-[25%]" style={{ animationDelay: '0.2s' }}>
        <svg width="56" height="56" viewBox="0 0 56 56" className="drop-shadow-lg">
          <path d="M28 8 L48 26 L48 48 L8 48 L8 26 Z" fill="white" stroke="url(#homeGrad)" strokeWidth="3.5" strokeLinejoin="round" />
          <rect x="22" y="32" width="12" height="16" fill="url(#homeGrad)" rx="2" />
          <defs><linearGradient id="homeGrad" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stopColor="#3b82f6" /><stop offset="100%" stopColor="#06b6d4" /></linearGradient></defs>
        </svg>
      </div>
      
      {/* Camera icon - bold cel style */}
      <div className="cel-icon absolute right-[12%] top-[30%]" style={{ animationDelay: '0.7s' }}>
        <svg width="52" height="52" viewBox="0 0 52 52" className="drop-shadow-lg">
          <rect x="6" y="16" width="40" height="30" rx="4" fill="white" stroke="url(#camGrad)" strokeWidth="3" />
          <circle cx="26" cy="31" r="9" fill="none" stroke="url(#camGrad)" strokeWidth="3" />
          <rect x="18" y="10" width="16" height="8" rx="2" fill="url(#camGrad)" />
          <defs><linearGradient id="camGrad" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stopColor="#ec4899" /><stop offset="100%" stopColor="#f472b6" /></linearGradient></defs>
        </svg>
      </div>
      
      {/* Star burst */}
      <div className="cel-icon absolute left-[80%] bottom-[35%]" style={{ animationDelay: '1.2s' }}>
        <svg width="48" height="48" viewBox="0 0 48 48" className="drop-shadow-lg">
          <path d="M24 4 L28 18 L42 18 L30 28 L34 42 L24 34 L14 42 L18 28 L6 18 L20 18 Z" fill="white" stroke="url(#starGrad)" strokeWidth="3" strokeLinejoin="round" />
          <defs><linearGradient id="starGrad" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stopColor="#fbbf24" /><stop offset="100%" stopColor="#f97316" /></linearGradient></defs>
        </svg>
      </div>
    </div>
  )
}

function HeroSection() {
  return (
    <section className="relative overflow-hidden py-16 md:py-20">
      <HeroCollage />
      <Container>
        <div className="relative flex flex-col items-center text-center opacity-0 reveal">
          {/* Subtle backdrop for text readability */}
          <div className="absolute inset-0 -mx-8 -my-4 rounded-3xl bg-white/40 backdrop-blur-[2px]" />
          
          <span className="relative text-label mb-3 inline-block rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-primary">
            Influencer marketing for vacation rentals
          </span>
          <h1 className="relative font-heading text-[2.5rem] font-normal leading-[1.05] tracking-tight sm:text-5xl md:text-6xl lg:text-[4.25rem]">
            <span className="whitespace-nowrap">Get more bookings with</span>{" "}
            <span className="whitespace-nowrap bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">creator marketing</span>
          </h1>
          <p className="relative mt-4 max-w-xl text-base text-muted-foreground md:text-lg">
            Hire vetted creators to showcase your property. They post, you get clicks and stunning content.
          </p>
          <div className="relative mt-6 flex flex-col gap-3 sm:flex-row">
            <Button size="lg" asChild className="px-8 shadow-lg shadow-primary/20">
              <Link href="/hosts">Host Signup</Link>
            </Button>
            <Button size="lg" variant="outline" asChild className="bg-white/80 px-8 backdrop-blur-sm">
              <Link href="/waitlist">Creator Waitlist</Link>
            </Button>
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
