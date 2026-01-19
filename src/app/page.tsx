import Link from "next/link"
import { FeatureScroller } from "@/components/marketing/feature-scroller"

// Simple icon tiles like Slush footer
function IconTile({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-12 w-12 items-center justify-center rounded-xl border-[3px] border-black bg-white">
      {children}
    </div>
  )
}

function HeroSection() {
  return (
    <section className="bg-black px-4 pb-3 pt-18 lg:px-6">
      <div className="mx-auto max-w-6xl">
        <div className="grid gap-3 lg:grid-cols-[1.4fr_1fr] lg:gap-4">
          {/* PRIMARY BLOCK - Yellow */}
          <div className="rounded-2xl border-[3px] border-black bg-[#FFD84A] p-6 lg:p-8">
            {/* Label */}
            <p className="text-[10px] font-bold uppercase tracking-wider text-black/50">
              Now in beta
            </p>
            
            {/* Headline - reverted to original messaging */}
            <h1 className="mt-3 font-heading text-[2.75rem] leading-[0.88] text-black sm:text-[3.5rem] md:text-[4.5rem] lg:text-[4rem] xl:text-[5rem]">
              GET MORE
              <br />
              <span className="text-black/40">BOOKINGS</span>
            </h1>
            
            {/* Subhead */}
            <p className="mt-4 max-w-sm text-[14px] leading-snug text-black/60">
              Hire creators to showcase your vacation rental. They post, you get clicks and content.
            </p>
            
            {/* CTAs */}
            <div className="mt-6 flex flex-wrap gap-2">
              <Link
                href="/hosts"
                className="inline-flex h-11 items-center gap-2 rounded-full bg-black px-6 text-[11px] font-bold uppercase tracking-wider text-white transition-transform hover:scale-[1.02]"
              >
                Start as Host
                <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M7 17L17 7M17 7H7M17 7V17" />
                </svg>
              </Link>
              <Link
                href="/waitlist"
                className="inline-flex h-11 items-center gap-2 rounded-full border-[3px] border-black bg-white px-6 text-[11px] font-bold uppercase tracking-wider text-black"
              >
                Creator Waitlist
              </Link>
            </div>
          </div>

          {/* SECONDARY BLOCK - Blue */}
          <div className="flex flex-col justify-between rounded-2xl border-[3px] border-black bg-[#4AA3FF] p-6">
            <div>
              <h2 className="font-heading text-[2rem] leading-[0.88] text-black sm:text-[2.5rem]">
                GET
                <br />
                <span className="text-black/40">STARTED</span>
              </h2>
              <p className="mt-2 text-[13px] text-black/60">
                Sign up in 2 minutes. No contracts.
              </p>
            </div>

            {/* Guide links */}
            <div className="mt-4 space-y-0 border-t-2 border-black/10">
              {[
                { href: "/how-it-works", label: "How it works" },
                { href: "/creators", label: "Browse creators" },
                { href: "/pricing", label: "Pricing" },
              ].map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="flex items-center justify-between border-b-2 border-black/10 py-2.5 text-[11px] font-semibold uppercase tracking-wider text-black hover:border-black"
                >
                  {link.label}
                  <span className="text-black/40">→</span>
                </Link>
              ))}
            </div>

            <p className="mt-3 text-[10px] font-medium text-black/40">
              Free to start • Pay per result • Track links
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}

function HowItWorksSection() {
  return (
    <section className="bg-black px-4 py-3 lg:px-6">
      <div className="mx-auto max-w-6xl">
        <div className="grid gap-3 lg:grid-cols-[1fr_auto]">
          {/* How It Works block */}
          <div className="rounded-2xl border-[3px] border-black bg-white p-5">
            <p className="text-[10px] font-bold uppercase tracking-wider text-black/40">
              Simple process
            </p>
            <h2 className="mt-1 font-heading text-[1.75rem] leading-[0.88] text-black sm:text-[2.25rem]">
              HOW IT
              <br />
              <span className="text-black/30">WORKS</span>
            </h2>
            <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {[
                { num: "01", title: "Add property", desc: "Paste Airbnb link" },
                { num: "02", title: "Find creators", desc: "Browse directory" },
                { num: "03", title: "Track clicks", desc: "Real-time analytics" },
                { num: "04", title: "Pay creators", desc: "Via Stripe" },
              ].map((step) => (
                <div key={step.num} className="border-l-[3px] border-black/10 pl-3">
                  <span className="font-heading text-[1rem] text-black/20">{step.num}</span>
                  <h4 className="text-[13px] font-semibold text-black">{step.title}</h4>
                  <p className="text-[11px] text-black/50">{step.desc}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Icon tiles grid */}
          <div className="grid grid-cols-2 gap-1.5 self-start">
            <IconTile>
              <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="black" strokeWidth="2.5">
                <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
              </svg>
            </IconTile>
            <IconTile>
              <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="black" strokeWidth="2.5">
                <rect x="3" y="6" width="18" height="14" rx="2" />
                <circle cx="12" cy="13" r="4" />
              </svg>
            </IconTile>
            <IconTile>
              <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="black" strokeWidth="2.5">
                <path d="M12 2l2.4 7.4H22l-6 4.6 2.3 7L12 16.4 5.7 21l2.3-7-6-4.6h7.6L12 2z" />
              </svg>
            </IconTile>
            <IconTile>
              <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="black" strokeWidth="2.5">
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
    <section className="bg-black px-4 py-3 lg:px-6">
      <div className="mx-auto grid max-w-6xl gap-3 md:grid-cols-2">
        {/* Hosts */}
        <div className="rounded-2xl border-[3px] border-black bg-[#FFD84A] p-5">
          <p className="text-[10px] font-bold uppercase tracking-wider text-black/40">
            For property owners
          </p>
          <h3 className="mt-1 font-heading text-[1.5rem] leading-[0.88] text-black sm:text-[1.75rem]">
            LIST YOUR
            <br />
            <em className="text-black/50">PROPERTY</em>
          </h3>
          <p className="mt-2 max-w-xs text-[13px] text-black/60">
            Join hosts using creator marketing.
          </p>
          <Link
            href="/hosts"
            className="mt-4 inline-flex h-10 items-center gap-2 rounded-full bg-black px-5 text-[10px] font-bold uppercase tracking-wider text-white"
          >
            Get Started
            <svg className="h-3 w-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M7 17L17 7M17 7H7M17 7V17" />
            </svg>
          </Link>
        </div>

        {/* Creators */}
        <div className="rounded-2xl border-[3px] border-black bg-[#4AA3FF] p-5">
          <p className="text-[10px] font-bold uppercase tracking-wider text-black/40">
            For content creators
          </p>
          <h3 className="mt-1 font-heading text-[1.5rem] leading-[0.88] text-black sm:text-[1.75rem]">
            ALWAYS
            <br />
            <em className="text-black/50">HERE</em>
          </h3>
          <p className="mt-2 max-w-xs text-[13px] text-black/60">
            Questions? We&apos;ve got you covered.
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            <Link
              href="/waitlist"
              className="inline-flex h-10 items-center gap-2 rounded-full bg-black px-5 text-[10px] font-bold uppercase tracking-wider text-white"
            >
              Creator Waitlist
            </Link>
            <Link
              href="/help"
              className="inline-flex h-10 items-center rounded-full border-[3px] border-black px-5 text-[10px] font-bold uppercase tracking-wider text-black"
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
    <div className="mx-4 mb-4 mt-3 overflow-hidden rounded-2xl border-[3px] border-black bg-[#28D17C] py-3 lg:mx-6">
      <div className="marquee-track flex whitespace-nowrap">
        {[...Array(8)].map((_, i) => (
          <span key={i} className="mx-4 font-heading text-[2rem] text-black sm:text-[2.5rem]">
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
      <HeroSection />
      <FeatureScroller />
      <HowItWorksSection />
      <CTASection />
      <FooterMarquee />
    </div>
  )
}
