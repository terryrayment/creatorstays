"use client"

import { useRef, useState, useEffect, useCallback } from "react"
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
    color: "#FFD84A",
    image: "/images/hp-step-1.jpg",
  },
  {
    id: "step-2",
    number: "02",
    line1: "INVITE A",
    line2: "CREATOR",
    copy: "Browse creators by niche and audience. Send collaboration offers with your terms and budget.",
    benefit: "No cold DMs. No guesswork.",
    color: "#4AA3FF",
    image: "/images/hp-step-2.jpg",
  },
  {
    id: "step-3",
    number: "03",
    line1: "THEY POST",
    line2: "YOUR LINK",
    copy: "Creators share your tracked link in their content. Every click is attributed to you.",
    benefit: "Real reach. Real attribution.",
    color: "#28D17C",
    image: "/images/hp-step-3.jpg",
  },
  {
    id: "step-4",
    number: "04",
    line1: "WATCH",
    line2: "TRAFFIC GROW",
    copy: "See clicks, unique visitors, and traffic sources in real time. Know exactly what's working.",
    benefit: "More bookings, without learning ads.",
    color: "#D7B6FF",
    image: "/images/hp-step-4.jpg",
  },
  {
    id: "step-5",
    number: "05",
    line1: "PAY THROUGH",
    line2: "PLATFORM",
    copy: "Pay creators via Stripe. We handle contracts, payouts, and 1099s at year-end.",
    benefit: "Clean paperwork. Repeatable outreach.",
    color: "#FF5A1F",
    image: "/images/hp-step-5.jpg",
  },
]

export function FeatureScroller() {
  const scrollRef = useRef<HTMLDivElement>(null)
  const [activeIndex, setActiveIndex] = useState(0)
  const [isPaused, setIsPaused] = useState(false)
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false)

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)")
    setPrefersReducedMotion(mq.matches)
    const handler = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches)
    mq.addEventListener("change", handler)
    return () => mq.removeEventListener("change", handler)
  }, [])

  const scrollToIndex = useCallback((index: number, smooth = true) => {
    const container = scrollRef.current
    if (!container) return
    
    const wrappedIndex = ((index % steps.length) + steps.length) % steps.length
    const cardWidth = 360 + 8 // card width + gap
    const scrollTarget = wrappedIndex * cardWidth
    
    container.scrollTo({
      left: scrollTarget,
      behavior: smooth && !prefersReducedMotion ? "smooth" : "auto"
    })
    setActiveIndex(wrappedIndex)
  }, [prefersReducedMotion])

  useEffect(() => {
    const container = scrollRef.current
    if (!container) return

    const handleScroll = () => {
      const scrollLeft = container.scrollLeft
      const cardWidth = 360
      const newIndex = Math.round(scrollLeft / cardWidth)
      setActiveIndex(Math.min(Math.max(newIndex, 0), steps.length - 1))
    }

    container.addEventListener("scroll", handleScroll, { passive: true })
    return () => container.removeEventListener("scroll", handleScroll)
  }, [])

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") {
        scrollToIndex(activeIndex - 1)
      } else if (e.key === "ArrowRight") {
        scrollToIndex(activeIndex + 1)
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [activeIndex, scrollToIndex])

  useEffect(() => {
    if (prefersReducedMotion || isPaused) return

    const interval = setInterval(() => {
      const nextIndex = (activeIndex + 1) % steps.length
      scrollToIndex(nextIndex)
    }, 2000)

    return () => clearInterval(interval)
  }, [activeIndex, isPaused, prefersReducedMotion, scrollToIndex])

  const goLeft = () => scrollToIndex(activeIndex - 1)
  const goRight = () => scrollToIndex(activeIndex + 1)

  return (
    <section 
      className="bg-black py-4"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onFocus={() => setIsPaused(true)}
      onBlur={() => setIsPaused(false)}
    >
      {/* Arrow buttons */}
      <div className="mx-auto mb-2 flex max-w-7xl items-center justify-end gap-1.5 px-2">
        <button
          onClick={goLeft}
          className="flex h-9 w-9 items-center justify-center rounded-full border-[3px] border-white bg-transparent text-white transition-all hover:bg-white hover:text-black"
          aria-label="Previous card"
        >
          <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
            <path d="M15 18L9 12L15 6" />
          </svg>
        </button>
        <button
          onClick={goRight}
          className="flex h-9 w-9 items-center justify-center rounded-full border-[3px] border-white bg-white text-black transition-all hover:bg-transparent hover:text-white"
          aria-label="Next card"
        >
          <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
            <path d="M9 18L15 12L9 6" />
          </svg>
        </button>
      </div>

      {/* Scroll container - fixed height to prevent layout shift */}
      <div
        ref={scrollRef}
        className="scrollbar-hide flex snap-x snap-mandatory gap-2 overflow-x-auto overflow-y-hidden px-2"
        style={{ 
          scrollPaddingInline: "8px",
          height: "min(440px, 78vh)",
          willChange: "scroll-position"
        }}
      >
        {steps.map((step) => (
          <div
            key={step.id}
            className="feature-card relative flex-shrink-0 snap-center rounded-2xl border-[3px] border-black overflow-hidden"
            style={{
              width: "min(360px, 82vw)",
              height: "min(420px, 75vh)",
              willChange: "transform"
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
              <div className="rounded-xl bg-white/90 backdrop-blur-sm p-3 self-start">
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
