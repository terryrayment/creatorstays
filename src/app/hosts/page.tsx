"use client"

import Link from "next/link"
import { HostSignupForm } from "@/components/hosts/host-signup-form"
import { RevealStack } from "@/components/marketing/reveal-stack"

function HeroSection() {
  return (
    <section className="bg-black px-3 pb-2 pt-16 lg:px-4">
      <div className="mx-auto max-w-7xl">
        <div className="grid gap-2 lg:grid-cols-[1.5fr_1fr] lg:gap-3">
          {/* PRIMARY BLOCK - Yellow */}
          <div className="block-hover rounded-2xl border-[3px] border-black bg-[#FFD84A] p-5 lg:p-6">
            <p className="text-[10px] font-black uppercase tracking-wider text-black">
              The first creator marketplace for STRs
            </p>
            
            <h1 className="mt-2 font-heading text-[3rem] leading-[0.82] tracking-[-0.04em] sm:text-[4rem] md:text-[5rem] lg:text-[4.5rem] xl:text-[5.5rem]" style={{ fontWeight: 900 }}>
              <span className="block text-black">GET MORE</span>
              <span className="block text-black" style={{ fontWeight: 400 }}>BOOKINGS</span>
              <span className="block text-black">WITH CREATORS</span>
            </h1>
            
            <p className="mt-3 max-w-md text-[13px] font-medium leading-snug text-black">
              Creators post about your property. You pay per post, track every click, and own the content. That's it.
            </p>
            
            <div className="mt-5 flex flex-wrap gap-2">
              <a
                href="#signup"
                className="inline-flex h-10 items-center gap-2 rounded-full bg-black px-5 text-[10px] font-black uppercase tracking-wider text-white transition-transform duration-200 hover:-translate-y-0.5"
              >
                Start as Host
                <svg className="h-3 w-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                  <path d="M7 17L17 7M17 7H7M17 7V17" />
                </svg>
              </a>
              <Link
                href="/creators"
                className="inline-flex h-10 items-center gap-2 rounded-full border-[3px] border-black bg-white px-5 text-[10px] font-black uppercase tracking-wider text-black transition-transform duration-200 hover:-translate-y-0.5"
              >
                Browse Creators
              </Link>
            </div>
          </div>

          {/* SECONDARY BLOCK - Green */}
          <div className="block-hover flex flex-col justify-between rounded-2xl border-[3px] border-black bg-[#28D17C] p-5">
            <div>
              <div className="mb-3 inline-flex items-center gap-2 rounded-full border-[2px] border-black bg-white px-3 py-1">
                <svg className="h-4 w-4 text-black" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="text-[10px] font-black text-black">One-time $199 • Lifetime access</span>
              </div>
              
              <h2 className="font-heading text-[2rem] leading-[0.85] tracking-[-0.02em] sm:text-[2.5rem]" style={{ fontWeight: 900 }}>
                <span className="block text-black">WHAT YOU</span>
                <span className="block text-black" style={{ fontWeight: 400 }}>GET</span>
              </h2>
            </div>

            <div className="mt-3 space-y-0 border-t-2 border-black">
              {[
                { label: "Real content", desc: "Photos & videos" },
                { label: "Real traffic", desc: "Tracked clicks" },
                { label: "Full rights", desc: "Use anywhere" },
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
      title: "ADD YOUR PROPERTY",
      desc: "Upload photos, add details, connect your calendar. We sync availability so creators see when you're open.",
      color: "#4AA3FF",
    },
    {
      num: "02",
      title: "HIRE CREATORS",
      desc: "Browse our directory. Set your rate per post. Send offers directly to creators.",
      color: "#FFD84A",
    },
    {
      num: "03",
      title: "TRACK TRAFFIC",
      desc: "Every creator gets a unique link. See clicks and traffic sources in real-time.",
      color: "#28D17C",
    },
    {
      num: "04",
      title: "PAY & GET CONTENT",
      desc: "We handle payouts and tax docs. You get photos and videos you own forever.",
      color: "#FF6B6B",
    },
  ]

  return (
    <section className="bg-black px-3 py-2 lg:px-4">
      <div className="mx-auto max-w-7xl">
        <div className="block-hover rounded-2xl border-[3px] border-black bg-white p-4 lg:p-5">
          <p className="text-[9px] font-black uppercase tracking-wider text-black">
            Simple 4-step process
          </p>
          <h2 className="mt-1 font-heading text-[1.75rem] leading-[0.85] tracking-[-0.02em] sm:text-[2.5rem]" style={{ fontWeight: 900 }}>
            <span className="block text-black">HOW IT</span>
            <span className="block text-black" style={{ fontWeight: 400 }}>WORKS</span>
          </h2>
          
          <div className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
            {steps.map((step) => (
              <div
                key={step.num}
                className="rounded-xl border-[3px] border-black p-3 transition-transform duration-200 hover:-translate-y-1"
                style={{ backgroundColor: step.color }}
              >
                <span className="font-heading text-[2rem] text-black" style={{ fontWeight: 900 }}>{step.num}</span>
                <h4 className="mt-1 text-[12px] font-black uppercase tracking-wide text-black">{step.title}</h4>
                <p className="mt-1 text-[11px] font-medium leading-snug text-black">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

function ImageSection() {
  return (
    <section className="bg-black px-3 py-2 lg:px-4">
      <div className="mx-auto max-w-7xl">
        <div className="grid gap-2 md:grid-cols-2 lg:items-stretch">
          {/* Video block - Creator Support */}
          <div className="block-hover relative overflow-hidden rounded-2xl border-[3px] border-black bg-[#F5E6D3]" style={{ minHeight: '400px' }}>
            <video
              src="/videos/creator-support.mp4"
              autoPlay
              loop
              muted
              playsInline
              className="h-full w-full object-cover transition-transform duration-200 hover:scale-[1.03]"
            />
          </div>
          {/* Image block - Phone Tripod */}
          <div className="block-hover relative overflow-hidden rounded-2xl border-[3px] border-black bg-[#E8E8E8]" style={{ minHeight: '400px' }}>
            <img
              src="/images/phone-tripod.png"
              alt="Phone on tripod for content creation"
              className="h-full w-full object-contain p-8 transition-transform duration-200 hover:scale-[1.03]"
            />
          </div>
        </div>
      </div>
    </section>
  )
}

function BenefitsSection() {
  const benefits = [
    {
      title: "TRACKED CLICKS",
      desc: "Every creator gets a unique link. You see exactly what's working.",
      color: "#4AA3FF",
      icon: (
        <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="black" strokeWidth="2.5">
          <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
        </svg>
      ),
    },
    {
      title: "CONTENT YOU OWN",
      desc: "Photos and videos of your property. Use them on your listing, ads, anywhere. They're yours.",
      color: "#FFD84A",
      icon: (
        <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="black" strokeWidth="2.5">
          <rect x="3" y="6" width="18" height="14" rx="2" />
          <circle cx="12" cy="13" r="4" />
        </svg>
      ),
    },
    {
      title: "RIGHT AUDIENCE",
      desc: "Travel creators with engaged followers. Their audience is already looking for places to stay.",
      color: "#28D17C",
      icon: (
        <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="black" strokeWidth="2.5">
          <circle cx="12" cy="12" r="10" />
          <circle cx="12" cy="12" r="6" />
          <circle cx="12" cy="12" r="2" />
        </svg>
      ),
    },
    {
      title: "EASY PAYOUTS",
      desc: "Pay through the platform. We handle the 1099s.",
      color: "#FF6B6B",
      icon: (
        <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="black" strokeWidth="2.5">
          <rect x="2" y="5" width="20" height="14" rx="2" />
          <path d="M2 10h20" />
        </svg>
      ),
    },
  ]

  return (
    <section className="bg-black px-3 py-2 lg:px-4">
      <div className="mx-auto max-w-7xl">
        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
          {benefits.map((benefit, i) => (
            <div
              key={i}
              className="block-hover rounded-2xl border-[3px] border-black p-4 transition-transform duration-200 hover:-translate-y-1"
              style={{ backgroundColor: benefit.color }}
            >
              <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg border-[2px] border-black bg-white">
                {benefit.icon}
              </div>
              <h3 className="text-[12px] font-black uppercase tracking-wide text-black">{benefit.title}</h3>
              <p className="mt-2 text-[11px] font-medium leading-snug text-black">{benefit.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

function SignupSection() {
  return (
    <section id="signup" className="scroll-mt-20 bg-black px-3 py-2 lg:px-4">
      <div className="mx-auto max-w-7xl">
        <div className="grid gap-2 lg:grid-cols-[1fr_1.2fr]">
          {/* Left info block */}
          <div className="block-hover rounded-2xl border-[3px] border-black bg-[#4AA3FF] p-5">
            <p className="text-[9px] font-black uppercase tracking-wider text-black">
              Join now
            </p>
            <h2 className="mt-1 font-heading text-[2rem] leading-[0.85] tracking-[-0.02em] sm:text-[2.5rem]" style={{ fontWeight: 900 }}>
              <span className="block text-black">CREATE YOUR</span>
              <span className="block text-black" style={{ fontWeight: 400 }}>HOST PROFILE</span>
            </h2>
            <p className="mt-3 text-[12px] font-medium text-black">
              Sign up in 2 minutes. No contracts. Cancel anytime.
            </p>
            
            <div className="mt-4 space-y-2">
              {[
                "Add your property & photos",
                "Connect your availability calendar",
                "Start receiving creator applications",
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-2">
                  <div className="flex h-5 w-5 items-center justify-center rounded-full border-2 border-black bg-white text-[10px] font-black">
                    {i + 1}
                  </div>
                  <span className="text-[11px] font-bold text-black">{item}</span>
                </div>
              ))}
            </div>

            <p className="mt-4 text-[10px] font-medium text-black">
              Are you a creator? <Link href="/waitlist" className="font-black underline">Join the Creator Waitlist</Link>
            </p>
          </div>

          {/* Signup form block */}
          <div className="block-hover rounded-2xl border-[3px] border-black bg-white p-5 lg:p-6">
            <HostSignupForm />
          </div>
        </div>
      </div>
    </section>
  )
}

function FooterMarquee() {
  return (
    <div className="mx-3 mb-3 mt-2 overflow-hidden rounded-2xl border-[3px] border-black bg-[#FFD84A] py-2 lg:mx-4">
      <div className="marquee-track flex whitespace-nowrap">
        {[...Array(10)].map((_, i) => (
          <span key={i} className="mx-4 font-heading text-[1.75rem] tracking-[-0.02em] text-black sm:text-[2.5rem]">
            CREATORSTAYS • FOR HOSTS •
          </span>
        ))}
      </div>
    </div>
  )
}

export default function HostsPage() {
  return (
    <div className="min-h-screen bg-black">
      <RevealStack baseDelay={80} stagger={100} duration={480}>
        <HeroSection />
        <ProcessSection />
        <ImageSection />
        <BenefitsSection />
        <SignupSection />
        <FooterMarquee />
      </RevealStack>
    </div>
  )
}
