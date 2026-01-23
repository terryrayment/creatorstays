"use client"

import Image from "next/image"

// Process steps with expanded host-focused copy
const steps = [
  {
    id: "step-1",
    number: "01",
    line1: "ADD YOUR",
    line2: "PROPERTY",
    copy: "Paste your Airbnb link. We pull in your photos, description, and details automatically.",
    benefit: "Live in 60 seconds.",
    image: "/images/hp-step-1.jpg",
  },
  {
    id: "step-2",
    number: "02",
    line1: "INVITE A",
    line2: "CREATOR",
    copy: "Browse creators by niche and audience. Send collaboration offers with your terms and budget.",
    benefit: "No cold DMs. No guesswork.",
    image: "/images/hp-step-2.jpg",
  },
  {
    id: "step-3",
    number: "03",
    line1: "THEY POST",
    line2: "YOUR LINK",
    copy: "Creators share your tracked link in their content. Every click is attributed to you.",
    benefit: "Real reach. Real attribution.",
    image: "/images/hp-step-3.jpg",
  },
  {
    id: "step-4",
    number: "04",
    line1: "WATCH",
    line2: "TRAFFIC GROW",
    copy: "See clicks, unique visitors, and traffic sources in real time. Know exactly what's working.",
    benefit: "More bookings, without learning ads.",
    image: "/images/hp-step-4.jpg",
  },
  {
    id: "step-5",
    number: "05",
    line1: "PAY THROUGH",
    line2: "PLATFORM",
    copy: "Pay creators via Stripe. We handle contracts, payouts, and 1099s at year-end.",
    benefit: "Clean paperwork. Repeatable outreach.",
    image: "/images/hp-step-5.jpg",
  },
]

export function FeatureScroller() {
  return (
    <section className="bg-black py-4 overflow-hidden">
      {/* Scroll container */}
      <div
        className="scrollbar-hide flex gap-2 overflow-x-auto px-2"
        style={{ 
          height: "min(440px, 78vh)",
        }}
      >
        {steps.map((step) => (
          <div
            key={step.id}
            className="feature-card relative flex-shrink-0 rounded-2xl border-[3px] border-black overflow-hidden transition-transform duration-300 ease-out hover:scale-105 cursor-pointer"
            style={{
              width: "360px",
              height: "min(420px, 75vh)",
            }}
          >
            {/* Full-bleed background image */}
            <Image 
              src={step.image} 
              alt={step.line1 + " " + step.line2}
              fill
              className="object-cover"
            />
            {/* Content overlay */}
            <div className="relative z-10 flex h-full flex-col justify-between p-4">
              <div>
                {/* Big number */}
                <span 
                  className="font-heading text-[3.5rem] leading-none tracking-[-0.04em] text-black"
                  style={{ fontWeight: 900 }}
                >
                  {step.number}
                </span>
                {/* Split title */}
                <h3 className="mt-1 font-heading leading-[0.82] tracking-[-0.04em]">
                  <span 
                    className="block text-[1.75rem] text-black sm:text-[2rem] md:text-[2.25rem]" 
                    style={{ fontWeight: 900 }}
                  >
                    {step.line1}
                  </span>
                  <span 
                    className="block text-[1.75rem] text-black sm:text-[2rem] md:text-[2.25rem]" 
                    style={{ fontWeight: 400 }}
                  >
                    {step.line2}
                  </span>
                </h3>
                {/* Explanatory copy */}
                <p className="mt-3 text-[13px] font-medium leading-snug text-black">
                  {step.copy}
                </p>
                {/* Micro-benefit */}
                <p className="mt-2 text-[11px] font-bold uppercase tracking-wide text-black">
                  {step.benefit}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
