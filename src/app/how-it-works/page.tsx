import Link from "next/link"

const steps = [
  {
    num: "01",
    title: "ADD YOUR",
    subtitle: "PROPERTY",
    content: "Paste your Airbnb listing URL. We automatically import your photos, description, amenities, and pricing. Your listing goes live in under 60 seconds.",
    color: "#FFD84A",
  },
  {
    num: "02",
    title: "BROWSE",
    subtitle: "CREATORS",
    content: "Search our directory by niche, platform, and audience size. Filter for travel, lifestyle, or luxury creators. View portfolios and past collaborations before reaching out.",
    color: "#4AA3FF",
  },
  {
    num: "03",
    title: "SEND",
    subtitle: "OFFERS",
    content: "Set your budget, deliverables, and timeline. Creators receive your offer and can accept, counter, or decline. No cold DMs or awkward negotiations.",
    color: "#D7B6FF",
  },
  {
    num: "04",
    title: "THEY POST",
    subtitle: "YOUR LINK",
    content: "Each creator gets a unique tracked link. When they post content, every click is attributed to your listing. Real reach with real attribution.",
    color: "#28D17C",
  },
  {
    num: "05",
    title: "WATCH",
    subtitle: "TRAFFIC",
    content: "See clicks, unique visitors, and referral sources in real time. Know exactly which creators drive results. Optimize future campaigns with data.",
    color: "#FF5A1F",
  },
  {
    num: "06",
    title: "PAY VIA",
    subtitle: "PLATFORM",
    content: "Approve completed work and pay through Stripe. We handle contracts, invoices, and 1099 tax forms. Clean paperwork, every time.",
    color: "#E8D5E8",
  },
]

export default function HowItWorksPage() {
  return (
    <div className="min-h-screen bg-black px-3 pb-8 pt-20 lg:px-4">
      <div className="mx-auto max-w-5xl">
        
        {/* Hero Block */}
        <div className="block-hover rounded-2xl border-[3px] border-black bg-[#FFD84A] p-6">
          <h1 className="font-heading text-[2.5rem] leading-[0.85] tracking-[-0.03em] sm:text-[3.5rem] md:text-[4.5rem]" style={{ fontWeight: 900 }}>
            <span className="block text-black">HOW IT</span>
            <span className="block text-black" style={{ fontWeight: 400 }}>WORKS</span>
          </h1>
          <p className="mt-4 max-w-lg text-[15px] font-medium leading-snug text-black">
            CreatorStays connects vacation rental hosts with content creators. You get traffic and content. They get paid. Everyone wins.
          </p>
        </div>

        {/* Quick Links */}
        <div className="mt-3 grid gap-2 sm:grid-cols-3">
          <Link 
            href="/hosts"
            className="block-hover flex items-center justify-between rounded-xl border-[3px] border-black bg-white p-4 transition-transform duration-200"
          >
            <span className="text-[12px] font-black uppercase tracking-wider text-black">
              Start as Host
            </span>
            <span className="text-black">→</span>
          </Link>
          <Link 
            href="/waitlist"
            className="block-hover flex items-center justify-between rounded-xl border-[3px] border-black bg-white p-4 transition-transform duration-200"
          >
            <span className="text-[12px] font-black uppercase tracking-wider text-black">
              Creator Waitlist
            </span>
            <span className="text-black">→</span>
          </Link>
          <Link 
            href="/pricing"
            className="block-hover flex items-center justify-between rounded-xl border-[3px] border-black bg-white p-4 transition-transform duration-200"
          >
            <span className="text-[12px] font-black uppercase tracking-wider text-black">
              View Pricing
            </span>
            <span className="text-black">→</span>
          </Link>
        </div>

        {/* Steps */}
        <div className="mt-8">
          <p className="mb-3 text-[10px] font-black uppercase tracking-wider text-white">
            The Process
          </p>
          <div className="grid gap-2 md:grid-cols-2">
            {steps.map((step) => (
              <div
                key={step.num}
                className="block-hover rounded-2xl border-[3px] border-black p-5 transition-transform duration-200"
                style={{ backgroundColor: step.color }}
              >
                <span className="font-heading text-[2.5rem] leading-none text-black" style={{ fontWeight: 900 }}>
                  {step.num}
                </span>
                <h2 className="mt-2 font-heading text-[1.5rem] leading-[0.85] tracking-[-0.02em] sm:text-[1.75rem]">
                  <span className="block text-black" style={{ fontWeight: 900 }}>{step.title}</span>
                  <span className="block text-black" style={{ fontWeight: 400 }}>{step.subtitle}</span>
                </h2>
                <p className="mt-3 text-[13px] font-medium leading-snug text-black">
                  {step.content}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom CTA */}
        <div className="mt-8 grid gap-2 sm:grid-cols-2">
          <div className="block-hover rounded-2xl border-[3px] border-black bg-[#28D17C] p-5">
            <h3 className="font-heading text-[1.25rem] text-black" style={{ fontWeight: 900 }}>
              READY TO START?
            </h3>
            <p className="mt-2 text-[13px] font-medium text-black">
              List your property in 60 seconds. No contracts, no upfront fees.
            </p>
            <Link 
              href="/hosts"
              className="mt-4 inline-flex h-9 items-center gap-2 rounded-full bg-black px-4 text-[10px] font-black uppercase tracking-wider text-white transition-transform duration-200 hover:-translate-y-0.5"
            >
              Get Started →
            </Link>
          </div>
          <div className="block-hover rounded-2xl border-[3px] border-black bg-white p-5">
            <h3 className="font-heading text-[1.25rem] text-black" style={{ fontWeight: 900 }}>
              QUESTIONS?
            </h3>
            <p className="mt-2 text-[13px] font-medium text-black">
              Check our help center or message support directly.
            </p>
            <Link 
              href="/help"
              className="mt-4 inline-flex h-9 items-center gap-2 rounded-full border-[3px] border-black bg-white px-4 text-[10px] font-black uppercase tracking-wider text-black transition-transform duration-200 hover:-translate-y-0.5"
            >
              Help Center →
            </Link>
          </div>
        </div>

      </div>
    </div>
  )
}
