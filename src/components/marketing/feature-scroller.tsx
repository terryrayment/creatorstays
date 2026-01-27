"use client"

import { useRef, useEffect, useState } from "react"
import Image from "next/image"

// Process steps with expanded host-focused copy
const steps = [
  {
    id: "step-1",
    number: "01",
    line1: "ADD YOUR",
    line2: "PROPERTY",
    copy: "Upload photos, add details, and connect your availability calendar. Your listing is ready in minutes.",
    benefit: "LIVE IN 5 MINUTES.",
    image: "/images/hp-step-1.jpg",
  },
  {
    id: "step-2",
    number: "02",
    line1: "INVITE A",
    line2: "CREATOR",
    copy: "Browse creators by niche and audience. Send collaboration offers with your terms and budget.",
    benefit: "NO COLD DMS. NO GUESSWORK.",
    image: "/images/hp-step-2.jpg",
  },
  {
    id: "step-3",
    number: "03",
    line1: "THEY POST",
    line2: "YOUR LINK",
    copy: "Creators share your tracked link in their content. Every click is attributed to you.",
    benefit: "REAL REACH. REAL ATTRIBUTION.",
    image: "/images/hp-step-3.jpg",
  },
  {
    id: "step-4",
    number: "04",
    line1: "WATCH",
    line2: "TRAFFIC GROW",
    copy: "See clicks, unique visitors, and traffic sources in real time. Know exactly what's working.",
    benefit: "MORE BOOKINGS, WITHOUT LEARNING ADS.",
    image: "/images/hp-step-4.jpg",
  },
  {
    id: "step-5",
    number: "05",
    line1: "PAY THROUGH",
    line2: "PLATFORM",
    copy: "Pay creators via Stripe. We handle contracts, payouts, and 1099s at year-end.",
    benefit: "CLEAN PAPERWORK. REPEATABLE OUTREACH.",
    image: "/images/hp-step-5.jpg",
  },
]

export function FeatureScroller() {
  const scrollRef = useRef<HTMLDivElement>(null)
  const animationRef = useRef<number>()
  const scrollPosition = useRef(0)
  const [isPaused, setIsPaused] = useState(false)
  
  // Triple the cards for seamless infinite scroll
  const tripleSteps = [...steps, ...steps, ...steps]
  const CARD_WIDTH = 368 // 360px card + 8px gap
  const TOTAL_WIDTH = CARD_WIDTH * steps.length

  useEffect(() => {
    const container = scrollRef.current
    if (!container) return

    // Start in the middle set
    scrollPosition.current = TOTAL_WIDTH
    container.scrollLeft = scrollPosition.current

    const animate = () => {
      if (container && !isPaused) {
        scrollPosition.current += 0.25 // Speed: 50% slower (was 0.5)
        
        // Reset to middle set when reaching end
        if (scrollPosition.current >= TOTAL_WIDTH * 2) {
          scrollPosition.current = TOTAL_WIDTH
        }
        
        container.scrollLeft = scrollPosition.current
      }
      animationRef.current = requestAnimationFrame(animate)
    }

    animationRef.current = requestAnimationFrame(animate)

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }
  }, [isPaused])

  return (
    <section className="bg-black py-6 overflow-hidden">
      {/* Scroll container with extra padding for hover scale */}
      <div
        ref={scrollRef}
        className="scrollbar-hide flex gap-2 overflow-x-hidden px-4"
        style={{ 
          paddingTop: "20px",
          paddingBottom: "20px",
        }}
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
      >
        {tripleSteps.map((step, index) => (
          <div
            key={`${step.id}-${index}`}
            className="feature-card relative flex-shrink-0 rounded-2xl border-[3px] border-black overflow-hidden transition-all duration-300 ease-out hover:-translate-y-3 hover:shadow-2xl hover:z-10"
            style={{
              width: "360px",
              height: "420px",
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
