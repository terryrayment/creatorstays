import Link from "next/link"
import { ImageBlock, MARKETING_IMAGES } from "@/components/marketing/image-block"

// Select images for this page (seed based on page name)
const pageImages = (() => {
  const seed = 19 // unique seed for how-it-works page
  const shuffled = [...MARKETING_IMAGES]
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = (seed * (i + 1) * 17) % (i + 1)
    ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
  }
  return shuffled.slice(0, 2)
})()

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
    title: "HIRE",
    subtitle: "CREATORS",
    content: "Browse our directory by niche, platform, and audience size. View portfolios and rates. Pay creators per post—simple flat pricing.",
    color: "#4AA3FF",
  },
  {
    num: "03",
    title: "SEND",
    subtitle: "OFFERS",
    content: "Set your base pay per deliverable. Optionally add traffic bonuses when tracked links perform. Creators can accept, counter, or decline.",
    color: "#D7B6FF",
  },
  {
    num: "04",
    title: "THEY POST",
    subtitle: "YOUR LINK",
    content: "Each creator gets a unique tracked link. When they post content, every click is tracked. Real reach with real attribution.",
    color: "#28D17C",
  },
  {
    num: "05",
    title: "TRACK",
    subtitle: "TRAFFIC",
    content: "See clicks, unique visitors, and referral sources in real time. We track link clicks—not Airbnb bookings. You approve bonuses when thresholds are hit.",
    color: "#FF5A1F",
  },
  {
    num: "06",
    title: "PAY VIA",
    subtitle: "PLATFORM",
    content: "We handle payouts and 1099 tax forms. You pay for content. Traffic bonuses are optional add-ons. Clean paperwork, every time.",
    color: "#E8D5E8",
  },
]

export default function HowItWorksPage() {
  return (
    <div className="min-h-screen bg-black px-3 pb-8 pt-20 lg:px-4">
      <div className="mx-auto max-w-5xl">
        
        {/* Hero Block */}
        <div className="block-hover rounded-2xl border-[3px] border-black bg-[#FFD84A] p-6">
          <p className="text-[10px] font-black uppercase tracking-wider text-black">
            The first creator marketplace for short-term rentals
          </p>
          <h1 className="mt-2 font-heading text-[2.5rem] leading-[0.85] tracking-[-0.03em] sm:text-[3.5rem] md:text-[4.5rem]" style={{ fontWeight: 900 }}>
            <span className="block text-black">HOW IT</span>
            <span className="block text-black" style={{ fontWeight: 400 }}>WORKS</span>
          </h1>
          <p className="mt-4 max-w-lg text-[15px] font-medium leading-snug text-black">
            A huge opportunity for both hosts and creators. Pay creators per post, add traffic bonuses when links perform. We handle payouts and paperwork.
          </p>
        </div>

        {/* Pay Model Explainer */}
        <div className="mt-3 grid gap-2 sm:grid-cols-2">
          <div className="block-hover rounded-xl border-[3px] border-black bg-white p-4">
            <p className="text-[10px] font-black uppercase tracking-wider text-black">Base Pay</p>
            <p className="mt-1 text-[13px] font-medium text-black">
              Pay a flat rate per deliverable set (posts, reels, stories). Simple, predictable pricing.
            </p>
          </div>
          <div className="block-hover rounded-xl border-[3px] border-black bg-[#28D17C] p-4">
            <p className="text-[10px] font-black uppercase tracking-wider text-black">Traffic Bonus (Optional)</p>
            <p className="mt-1 text-[13px] font-medium text-black">
              Add bonuses when links hit click thresholds. You approve payouts after reviewing analytics.
            </p>
          </div>
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

        {/* Image Block */}
        <div className="mt-8">
          <ImageBlock src="/images/creator-laptop-support.jpg" aspectRatio="aspect-[21/9]" />
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
