"use client"

import { useRef, useState, useEffect } from "react"
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

// Triple the array for seamless infinite scroll
const infiniteSteps = [...steps, ...steps, ...steps]

export function FeatureScroller() {
  const scrollRef = useRef<HTMLDivElement>(null)
  const [isPaused, setIsPaused] = useState(false)
  const [activeIndex, setActiveIndex] = useState(0)
  const animationRef = useRef<number>()
  const scrollPositionRef = useRef(0)
  
  const CARD_WIDTH = 368 // card width + gap
  const TOTAL_WIDTH = CARD_WIDTH * steps.length
  const SCROLL_SPEED = 0.5 // pixels per frame

  useEffect(() => {
    const container = scrollRef.current
    if (!container) return

    // Start in the middle set
    scrollPositionRef.current = TOTAL_WIDTH
    container.scrollLeft = TOTAL_WIDTH

    const animate = () => {
      if (!isPaused && container) {
        scrollPositionRef.current += SCROLL_SPEED
        
        // Reset to middle when we've scrolled through one full set
        if (scrollPositionRef.current >= TOTAL_WIDTH * 2) {
          scrollPositionRef.current = TOTAL_WIDTH
        }
        
        container.scrollLeft = scrollPositionRef.current
        
        // Calculate which card is most centered for the scale effect
        const centerPosition = scrollPositionRef.current + container.clientWidth / 2
        const newActiveIndex = Math.floor(centerPosition / CARD_WIDTH) % steps.length
        setActiveIndex(newActiveIndex)
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

  const scrollBy = (direction: number) => {
    scrollPositionRef.current += direction * CARD_WIDTH
  }

  return (
    <section 
      className="bg-black py-4 overflow-hidden"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onFocus={() => setIsPaused(true)}
      onBlur={() => setIsPaused(false)}
    >
      {/* Arrow buttons */}
      <div className="mx-auto mb-2 flex max-w-7xl items-center justify-end gap-1.5 px-2">
        <button
          onClick={() => scrollBy(-1)}
          className="flex h-9 w-9 items-center justify-center rounded-full border-[3px] border-white bg-transparent text-white transition-all hover:bg-white hover:text-black"
          aria-label="Previous card"
        >
          <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
            <path d="M15 18L9 12L15 6" />
          </svg>
        </button>
        <button
          onClick={() => scrollBy(1)}
          className="flex h-9 w-9 items-center justify-center rounded-full border-[3px] border-white bg-white text-black transition-all hover:bg-transparent hover:text-white"
          aria-label="Next card"
        >
          <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
            <path d="M9 18L15 12L9 6" />
          </svg>
        </button>
      </div>

      {/* Scroll container */}
      <div
        ref={scrollRef}
        className="scrollbar-hide flex gap-2 overflow-x-hidden px-2"
        style={{ 
          height: "min(440px, 78vh)",
        }}
      >
        {infiniteSteps.map((step, index) => {
          const isActive = index % steps.length === activeIndex
          return (
            <div
              key={`${step.id}-${index}`}
              className="feature-card relative flex-shrink-0 rounded-2xl border-[3px] border-black overflow-hidden transition-transform duration-500 ease-out"
              style={{
                width: "360px",
                height: "min(420px, 75vh)",
                transform: isActive ? "scale(1.02)" : "scale(0.98)",
                opacity: isActive ? 1 : 0.85,
                zIndex: isActive ? 10 : 1,
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
                    className="font-heading text-[3.5rem] leading-none tracking-[-0.04em] text-black drop-shadow-sm"
                    style={{ fontWeight: 900 }}
                  >
                    {step.number}
                  </span>
                  {/* Split title */}
                  <h3 className="mt-1 font-heading leading-[0.82] tracking-[-0.04em]">
                    <span 
                      className="block text-[1.75rem] text-black drop-shadow-sm sm:text-[2rem] md:text-[2.25rem]" 
                      style={{ fontWeight: 900 }}
                    >
                      {step.line1}
                    </span>
                    <span 
                      className="block text-[1.75rem] text-black drop-shadow-sm sm:text-[2rem] md:text-[2.25rem]" 
                      style={{ fontWeight: 400 }}
                    >
                      {step.line2}
                    </span>
                  </h3>
                  {/* Explanatory copy */}
                  <p className="mt-3 text-[13px] font-medium leading-snug text-black drop-shadow-sm">
                    {step.copy}
                  </p>
                  {/* Micro-benefit */}
                  <p className="mt-2 text-[11px] font-bold uppercase tracking-wide text-black drop-shadow-sm">
                    {step.benefit}
                  </p>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </section>
  )
}
