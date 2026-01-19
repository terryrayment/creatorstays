import Link from "next/link"
import { FeatureScroller } from "@/components/marketing/feature-scroller"
import { RevealStack } from "@/components/marketing/reveal-stack"

// Simple icon tiles
function IconTile({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-12 w-12 items-center justify-center rounded-xl border-[3px] border-black bg-white transition-transform duration-200 hover:-translate-y-1">
      {children}
    </div>
  )
}

function HeroSection() {
  return (
    <section className="bg-black px-3 pb-2 pt-16 lg:px-4">
      <div className="mx-auto max-w-7xl">
        <div className="grid gap-2 lg:grid-cols-[1.5fr_1fr] lg:gap-3">
          {/* PRIMARY BLOCK - Yellow */}
          <div className="block-hover rounded-2xl border-[3px] border-black bg-[#FFD84A] p-5 lg:p-6">
            {/* Label */}
            <p className="text-[10px] font-black uppercase tracking-wider text-black">
              Now in beta
            </p>
            
            {/* Headline - heaviest weight, pure black */}
            <h1 className="mt-2 font-heading text-[3.5rem] leading-[0.82] tracking-[-0.04em] sm:text-[4.5rem] md:text-[5.5rem] lg:text-[5rem] xl:text-[6.5rem]" style={{ fontWeight: 900 }}>
              <span className="block text-black">GET MORE</span>
              <span className="block text-black" style={{ fontWeight: 400 }}>BOOKINGS</span>
            </h1>
            
            {/* Subhead - pure black */}
            <p className="mt-3 max-w-sm text-[13px] font-medium leading-snug text-black">
              Hire creators to showcase your vacation rental. They post, you get clicks and content.
            </p>
            
            {/* CTAs */}
            <div className="mt-5 flex flex-wrap gap-2">
              <Link
                href="/hosts"
                className="inline-flex h-10 items-center gap-2 rounded-full bg-black px-5 text-[10px] font-black uppercase tracking-wider text-white transition-transform duration-200 hover:-translate-y-0.5"
              >
                Start as Host
                <svg className="h-3 w-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                  <path d="M7 17L17 7M17 7H7M17 7V17" />
                </svg>
              </Link>
              <Link
                href="/waitlist"
                className="inline-flex h-10 items-center gap-2 rounded-full border-[3px] border-black bg-white px-5 text-[10px] font-black uppercase tracking-wider text-black transition-transform duration-200 hover:-translate-y-0.5"
              >
                Creator Waitlist
              </Link>
            </div>
          </div>

          {/* SECONDARY BLOCK - Blue */}
          <div className="block-hover flex flex-col justify-between rounded-2xl border-[3px] border-black bg-[#4AA3FF] p-5">
            <div>
              <h2 className="font-heading text-[2rem] leading-[0.85] tracking-[-0.02em] sm:text-[2.5rem]" style={{ fontWeight: 900 }}>
                <span className="block text-black">GET</span>
                <span className="block text-black" style={{ fontWeight: 400 }}>STARTED</span>
              </h2>
              <p className="mt-2 text-[12px] font-medium text-black">
                Sign up in 2 minutes. No contracts.
              </p>
            </div>

            {/* Guide links */}
            <div className="mt-3 space-y-0 border-t-2 border-black">
              {/* How it Works - underline sweep */}
              <Link
                href="/how-it-works"
                className="group relative flex items-center justify-between border-b-2 border-black py-2 text-[10px] font-bold uppercase tracking-wider text-black transition-transform duration-200 motion-safe:hover:-translate-y-0.5"
              >
                <span className="relative">
                  How it works
                  <span className="absolute -bottom-0.5 left-0 h-[2px] w-0 bg-black transition-all duration-300 motion-safe:group-hover:w-full" />
                </span>
                <span className="text-black transition-transform duration-200 motion-safe:group-hover:translate-x-1.5">→</span>
              </Link>
              
              {/* Browse Creators - magnetic feel */}
              <Link
                href="/creators"
                className="group relative flex items-center justify-between border-b-2 border-black py-2 text-[10px] font-bold uppercase tracking-wider text-black"
              >
                <span className="absolute inset-0 bg-black/0 transition-all duration-200 motion-safe:group-hover:bg-black/5" />
                <span className="relative transition-transform duration-200 motion-safe:group-hover:translate-x-1">
                  Browse creators
                </span>
                <span className="relative text-black transition-transform duration-200 motion-safe:group-hover:animate-arrow-wiggle">→</span>
              </Link>
              
              {/* Pricing - bounce emphasis */}
              <Link
                href="/pricing"
                className="group relative flex items-center justify-between border-b-2 border-black py-2 text-[10px] font-bold uppercase tracking-wider text-black transition-all duration-200 motion-safe:hover:-translate-y-0.5 motion-safe:hover:border-b-[3px]"
              >
                <span>Pricing</span>
                <span className="text-black transition-transform duration-200 motion-safe:group-hover:animate-arrow-pop">→</span>
              </Link>
            </div>

            <p className="mt-2 text-[9px] font-bold text-black">
              Free to start • Pay per post • Track traffic
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}

function HowItWorksSection() {
  return (
    <section className="bg-black px-3 py-2 lg:px-4">
      <div className="mx-auto max-w-7xl">
        <div className="grid gap-2 lg:grid-cols-[1fr_auto]">
          {/* How It Works block */}
          <div className="block-hover rounded-2xl border-[3px] border-black bg-white p-4">
            <p className="text-[9px] font-black uppercase tracking-wider text-black">
              Simple process
            </p>
            <h2 className="mt-1 font-heading text-[1.5rem] leading-[0.85] tracking-[-0.02em] sm:text-[2rem]" style={{ fontWeight: 900 }}>
              <span className="block text-black">HOW IT</span>
              <span className="block text-black" style={{ fontWeight: 400 }}>WORKS</span>
            </h2>
            <div className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
              {[
                { num: "01", title: "Add property", desc: "Paste Airbnb link" },
                { num: "02", title: "Hire creators", desc: "Pay per post" },
                { num: "03", title: "Track traffic", desc: "Real-time analytics" },
                { num: "04", title: "Pay easily", desc: "We handle payouts" },
              ].map((step) => (
                <div key={step.num} className="border-l-[3px] border-black pl-2">
                  <span className="font-heading text-[1rem] text-black" style={{ fontWeight: 900 }}>{step.num}</span>
                  <h4 className="text-[12px] font-bold text-black">{step.title}</h4>
                  <p className="text-[10px] text-black">{step.desc}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Icon tiles grid */}
          <div className="grid grid-cols-2 gap-1 self-start">
            <IconTile>
              <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="black" strokeWidth="2.5">
                <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
              </svg>
            </IconTile>
            <IconTile>
              <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="black" strokeWidth="2.5">
                <rect x="3" y="6" width="18" height="14" rx="2" />
                <circle cx="12" cy="13" r="4" />
              </svg>
            </IconTile>
            <IconTile>
              <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="black" strokeWidth="2.5">
                <path d="M12 2l2.4 7.4H22l-6 4.6 2.3 7L12 16.4 5.7 21l2.3-7-6-4.6h7.6L12 2z" />
              </svg>
            </IconTile>
            <IconTile>
              <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="black" strokeWidth="2.5">
                <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
              </svg>
            </IconTile>
          </div>
        </div>
      </div>
    </section>
  )
}

function CTASection() {
  return (
    <section className="bg-black px-3 py-2 lg:px-4">
      <div className="mx-auto grid max-w-7xl gap-2 md:grid-cols-2">
        {/* Hosts */}
        <div className="block-hover rounded-2xl border-[3px] border-black bg-[#FFD84A] p-4">
          <p className="text-[9px] font-black uppercase tracking-wider text-black">
            For property owners
          </p>
          <h3 className="mt-1 font-heading text-[1.5rem] leading-[0.85] tracking-[-0.02em] sm:text-[1.75rem]" style={{ fontWeight: 900 }}>
            <span className="block text-black">LIST YOUR</span>
            <span className="block text-black" style={{ fontWeight: 400 }}>PROPERTY</span>
          </h3>
          <p className="mt-2 max-w-xs text-[12px] font-medium text-black">
            Join hosts using creator marketing.
          </p>
          <Link
            href="/hosts"
            className="mt-3 inline-flex h-9 items-center gap-2 rounded-full bg-black px-4 text-[9px] font-black uppercase tracking-wider text-white transition-transform duration-200 hover:-translate-y-0.5"
          >
            Get Started
            <svg className="h-2.5 w-2.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
              <path d="M7 17L17 7M17 7H7M17 7V17" />
            </svg>
          </Link>
        </div>

        {/* Creators */}
        <div className="block-hover rounded-2xl border-[3px] border-black bg-[#4AA3FF] p-4">
          <p className="text-[9px] font-black uppercase tracking-wider text-black">
            For content creators
          </p>
          <h3 className="mt-1 font-heading text-[1.5rem] leading-[0.85] tracking-[-0.02em] sm:text-[1.75rem]" style={{ fontWeight: 900 }}>
            <span className="block text-black">ALWAYS</span>
            <span className="block text-black" style={{ fontWeight: 400 }}>HERE</span>
          </h3>
          <p className="mt-2 max-w-xs text-[12px] font-medium text-black">
            Questions? We have you covered.
          </p>
          <div className="mt-3 flex flex-wrap gap-1.5">
            <Link
              href="/waitlist"
              className="inline-flex h-9 items-center gap-2 rounded-full bg-black px-4 text-[9px] font-black uppercase tracking-wider text-white transition-transform duration-200 hover:-translate-y-0.5"
            >
              Creator Waitlist
            </Link>
            <Link
              href="/help"
              className="inline-flex h-9 items-center rounded-full border-[3px] border-black px-4 text-[9px] font-black uppercase tracking-wider text-black transition-transform duration-200 hover:-translate-y-0.5"
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
    <div className="mx-3 mb-3 mt-2 overflow-hidden rounded-2xl border-[3px] border-black bg-[#28D17C] py-2 lg:mx-4">
      <div className="marquee-track flex whitespace-nowrap">
        {[...Array(10)].map((_, i) => (
          <span key={i} className="mx-4 font-heading text-[1.75rem] tracking-[-0.02em] text-black sm:text-[2.5rem]">
            CREATORSTAYS
          </span>
        ))}
      </div>
    </div>
  )
}

export default function HomePage() {
  return (
    <div className="min-h-screen bg-black">
      <RevealStack baseDelay={80} stagger={100} duration={480}>
        <HeroSection />
        <FeatureScroller />
        <HowItWorksSection />
        <CTASection />
        <FooterMarquee />
      </RevealStack>
    </div>
  )
}
