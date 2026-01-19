"use client"

import Link from "next/link"
import { RevealStack } from "@/components/marketing/reveal-stack"

// 3D Sticker: Money/Coin
function CoinSticker() {
  return (
    <svg className="h-16 w-16" viewBox="0 0 64 64" fill="none">
      {/* Shadow/depth layer */}
      <ellipse cx="34" cy="36" rx="20" ry="20" fill="black" />
      {/* Main coin */}
      <ellipse cx="30" cy="32" rx="20" ry="20" fill="#FFD84A" stroke="black" strokeWidth="3" />
      {/* Dollar sign */}
      <text x="30" y="40" textAnchor="middle" fontSize="24" fontWeight="900" fill="black">$</text>
    </svg>
  )
}

// 3D Sticker: Link/Chain
function LinkSticker() {
  return (
    <svg className="h-14 w-14" viewBox="0 0 56 56" fill="none">
      {/* Shadow layer */}
      <path d="M22 38l-4 4a8 8 0 010-11.3l8-8a8 8 0 0111.3 0" stroke="black" strokeWidth="6" strokeLinecap="round" transform="translate(4,4)" />
      {/* Main link */}
      <path d="M22 38l-4 4a8 8 0 010-11.3l8-8a8 8 0 0111.3 0" stroke="#4AA3FF" strokeWidth="4" strokeLinecap="round" />
      <path d="M34 18l4-4a8 8 0 010 11.3l-8 8a8 8 0 01-11.3 0" stroke="black" strokeWidth="6" strokeLinecap="round" transform="translate(4,4)" />
      <path d="M34 18l4-4a8 8 0 010 11.3l-8 8a8 8 0 01-11.3 0" stroke="#28D17C" strokeWidth="4" strokeLinecap="round" />
    </svg>
  )
}

function HeroSection() {
  return (
    <section className="bg-black px-3 pb-2 pt-16 lg:px-4">
      <div className="mx-auto max-w-7xl">
        <div className="grid gap-2 lg:grid-cols-[1.5fr_1fr] lg:gap-3">
          {/* PRIMARY BLOCK - Blue */}
          <div className="block-hover relative rounded-2xl border-[3px] border-black bg-[#4AA3FF] p-5 lg:p-6">
            {/* Beta badge */}
            <div className="mb-3 inline-flex items-center gap-1.5 rounded-full border-[2px] border-black bg-white px-3 py-1">
              <span className="h-2 w-2 rounded-full bg-[#28D17C]" />
              <span className="text-[10px] font-black uppercase tracking-wider text-black">Beta</span>
            </div>
            
            <h1 className="font-heading text-[2.5rem] leading-[0.85] tracking-[-0.04em] sm:text-[3.5rem] md:text-[4.5rem] lg:text-[4rem] xl:text-[5rem]" style={{ fontWeight: 900 }}>
              <span className="block text-black">CREATORS</span>
              <span className="block text-black" style={{ fontWeight: 400 }}>GET PAID</span>
              <span className="block text-black">PER POST</span>
            </h1>
            
            <p className="mt-3 max-w-md text-[13px] font-medium leading-snug text-black">
              Get paid per post, plus optional traffic-based bonuses. Share your tracked link. We handle all payouts and tax docs.
            </p>
            
            <div className="mt-5 flex flex-wrap gap-2">
              <Link
                href="/waitlist"
                className="inline-flex h-10 items-center gap-2 rounded-full bg-black px-5 text-[10px] font-black uppercase tracking-wider text-white transition-transform duration-200 hover:-translate-y-0.5"
              >
                Join Creator Waitlist
                <svg className="h-3 w-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                  <path d="M7 17L17 7M17 7H7M17 7V17" />
                </svg>
              </Link>
              <Link
                href="/dev-login?role=creator"
                className="inline-flex h-10 items-center gap-2 rounded-full border-[3px] border-black bg-white px-5 text-[10px] font-black uppercase tracking-wider text-black transition-transform duration-200 hover:-translate-y-0.5"
              >
                View Dashboard Demo
              </Link>
            </div>

            {/* Sticker decoration */}
            <div className="absolute bottom-4 right-4 rotate-12 opacity-80 lg:bottom-6 lg:right-6">
              <CoinSticker />
            </div>
          </div>

          {/* SECONDARY BLOCK - Yellow */}
          <div className="block-hover flex flex-col justify-between rounded-2xl border-[3px] border-black bg-[#FFD84A] p-5">
            <div>
              <h2 className="font-heading text-[2rem] leading-[0.85] tracking-[-0.02em] sm:text-[2.5rem]" style={{ fontWeight: 900 }}>
                <span className="block text-black">HOW YOU</span>
                <span className="block text-black" style={{ fontWeight: 400 }}>EARN</span>
              </h2>
              <p className="mt-2 text-[12px] font-medium text-black">
                Guaranteed pay per post. Optional traffic bonuses.
              </p>
            </div>

            <div className="mt-3 space-y-0 border-t-2 border-black">
              {[
                { label: "Base rate", desc: "Per post payout" },
                { label: "Traffic bonus", desc: "Based on clicks" },
                { label: "Post-for-stay", desc: "Trade content" },
              ].map((item, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between border-b-2 border-black py-2"
                >
                  <span className="text-[11px] font-bold uppercase tracking-wider text-black">{item.label}</span>
                  <span className="text-[10px] font-medium text-black">{item.desc}</span>
                </div>
              ))}
            </div>

            <p className="mt-2 text-[9px] font-bold text-black">
              1099 tax docs • Stripe payouts • Link analytics
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}

function ProcessSection() {
  const steps = [
    {
      num: "01",
      title: "JOIN THE WAITLIST",
      desc: "Sign up with your email. We review applications and onboard creators in batches.",
      color: "#FFD84A",
    },
    {
      num: "02",
      title: "SET YOUR RATE",
      desc: "Set your base rate per post. Define deliverables: reels, posts, stories, videos.",
      color: "#4AA3FF",
    },
    {
      num: "03",
      title: "CONNECT PLATFORMS",
      desc: "Link Instagram, TikTok, or YouTube. We display your follower counts to hosts.",
      color: "#28D17C",
    },
    {
      num: "04",
      title: "APPROVE HOST REQUESTS",
      desc: "Hosts send you offers. Review the property, terms, and dates. Accept, counter, or decline.",
      color: "#FF6B6B",
    },
    {
      num: "05",
      title: "POST & GET PAID",
      desc: "Share your tracked link. Get paid per post. Earn traffic bonuses based on link performance.",
      color: "#A855F7",
    },
  ]

  return (
    <section className="bg-black px-3 py-2 lg:px-4">
      <div className="mx-auto max-w-7xl">
        <div className="block-hover relative rounded-2xl border-[3px] border-black bg-white p-4 lg:p-5">
          <p className="text-[9px] font-black uppercase tracking-wider text-black">
            Your journey
          </p>
          <h2 className="mt-1 font-heading text-[1.75rem] leading-[0.85] tracking-[-0.02em] sm:text-[2.5rem]" style={{ fontWeight: 900 }}>
            <span className="block text-black">HOW IT</span>
            <span className="block text-black" style={{ fontWeight: 400 }}>WORKS</span>
          </h2>
          
          <div className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-5">
            {steps.map((step) => (
              <div
                key={step.num}
                className="rounded-xl border-[3px] border-black p-3 transition-transform duration-200 hover:-translate-y-1"
                style={{ backgroundColor: step.color }}
              >
                <span className="font-heading text-[2rem] text-black" style={{ fontWeight: 900 }}>{step.num}</span>
                <h4 className="mt-1 text-[11px] font-black uppercase tracking-wide text-black">{step.title}</h4>
                <p className="mt-1 text-[10px] font-medium leading-snug text-black">{step.desc}</p>
              </div>
            ))}
          </div>

          {/* Sticker decoration */}
          <div className="absolute right-4 top-4 -rotate-12 opacity-70 lg:right-6 lg:top-6">
            <LinkSticker />
          </div>
        </div>
      </div>
    </section>
  )
}

function ControlSection() {
  const controls = [
    {
      title: "YOUR RATE",
      desc: "Set your base rate per post. Add optional traffic bonus tiers. Change anytime.",
      color: "#FFD84A",
      icon: (
        <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="black" strokeWidth="2.5">
          <path d="M12 2v20M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6" />
        </svg>
      ),
    },
    {
      title: "WHO YOU WORK WITH",
      desc: "Review every host request. See the property, location, and offer details. Accept, counter, or decline.",
      color: "#4AA3FF",
      icon: (
        <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="black" strokeWidth="2.5">
          <path d="M9 12l2 2 4-4" />
          <circle cx="12" cy="12" r="10" />
        </svg>
      ),
    },
    {
      title: "YOUR ANALYTICS",
      desc: "Track every click on your link. See traffic sources and performance. Links track traffic, not bookings.",
      color: "#28D17C",
      icon: (
        <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="black" strokeWidth="2.5">
          <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
        </svg>
      ),
    },
  ]

  return (
    <section className="bg-black px-3 py-2 lg:px-4">
      <div className="mx-auto max-w-7xl">
        <div className="mb-2 block-hover rounded-2xl border-[3px] border-black bg-[#A855F7] p-4">
          <h2 className="font-heading text-[1.5rem] leading-[0.85] tracking-[-0.02em] sm:text-[2rem]" style={{ fontWeight: 900 }}>
            <span className="block text-black">WHAT YOU</span>
            <span className="block text-black" style={{ fontWeight: 400 }}>CONTROL</span>
          </h2>
          <p className="mt-2 text-[12px] font-medium text-black">
            Your profile. Your rates. Your decisions.
          </p>
        </div>

        <div className="grid gap-2 sm:grid-cols-3">
          {controls.map((control, i) => (
            <div
              key={i}
              className="block-hover rounded-2xl border-[3px] border-black p-4 transition-transform duration-200 hover:-translate-y-1"
              style={{ backgroundColor: control.color }}
            >
              <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg border-[2px] border-black bg-white">
                {control.icon}
              </div>
              <h3 className="text-[12px] font-black uppercase tracking-wide text-black">{control.title}</h3>
              <p className="mt-2 text-[11px] font-medium leading-snug text-black">{control.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

function CTASection() {
  return (
    <section className="bg-black px-3 py-2 lg:px-4">
      <div className="mx-auto max-w-7xl">
        <div className="grid gap-2 md:grid-cols-2">
          {/* Join CTA */}
          <div className="block-hover rounded-2xl border-[3px] border-black bg-[#28D17C] p-5">
            <p className="text-[9px] font-black uppercase tracking-wider text-black">
              Ready to earn?
            </p>
            <h3 className="mt-1 font-heading text-[1.75rem] leading-[0.85] tracking-[-0.02em] sm:text-[2.5rem]" style={{ fontWeight: 900 }}>
              <span className="block text-black">JOIN THE</span>
              <span className="block text-black" style={{ fontWeight: 400 }}>WAITLIST</span>
            </h3>
            <p className="mt-2 max-w-xs text-[12px] font-medium text-black">
              We onboard creators in batches. Get early access and priority placement.
            </p>
            <Link
              href="/waitlist"
              className="mt-4 inline-flex h-10 items-center gap-2 rounded-full bg-black px-5 text-[10px] font-black uppercase tracking-wider text-white transition-transform duration-200 hover:-translate-y-0.5"
            >
              Apply Now
              <svg className="h-3 w-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                <path d="M7 17L17 7M17 7H7M17 7V17" />
              </svg>
            </Link>
          </div>

          {/* Questions CTA */}
          <div className="block-hover rounded-2xl border-[3px] border-black bg-white p-5">
            <p className="text-[9px] font-black uppercase tracking-wider text-black">
              Have questions?
            </p>
            <h3 className="mt-1 font-heading text-[1.75rem] leading-[0.85] tracking-[-0.02em] sm:text-[2.5rem]" style={{ fontWeight: 900 }}>
              <span className="block text-black">WE'VE GOT</span>
              <span className="block text-black" style={{ fontWeight: 400 }}>ANSWERS</span>
            </h3>
            <p className="mt-2 max-w-xs text-[12px] font-medium text-black">
              Check our creator guide or browse the help center.
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              <Link
                href="/how-to/creators"
                className="inline-flex h-9 items-center rounded-full bg-black px-4 text-[9px] font-black uppercase tracking-wider text-white transition-transform duration-200 hover:-translate-y-0.5"
              >
                Creator Guide
              </Link>
              <Link
                href="/help"
                className="inline-flex h-9 items-center rounded-full border-[3px] border-black px-4 text-[9px] font-black uppercase tracking-wider text-black transition-transform duration-200 hover:-translate-y-0.5"
              >
                Help Center
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

function FooterMarquee() {
  return (
    <div className="mx-3 mb-3 mt-2 overflow-hidden rounded-2xl border-[3px] border-black bg-[#4AA3FF] py-2 lg:mx-4">
      <div className="marquee-track flex whitespace-nowrap">
        {[...Array(10)].map((_, i) => (
          <span key={i} className="mx-4 font-heading text-[1.75rem] tracking-[-0.02em] text-black sm:text-[2.5rem]">
            CREATORSTAYS • FOR CREATORS •
          </span>
        ))}
      </div>
    </div>
  )
}

export default function CreatorsPage() {
  return (
    <div className="min-h-screen bg-black">
      <RevealStack baseDelay={80} stagger={100} duration={480}>
        <HeroSection />
        <ProcessSection />
        <ControlSection />
        <CTASection />
        <FooterMarquee />
      </RevealStack>
    </div>
  )
}
