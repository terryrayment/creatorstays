"use client"

import { useRef, useState, useEffect, useCallback } from "react"

// Step 1: House icon
function HouseIcon() {
  return (
    <svg viewBox="0 0 100 100" fill="none" className="h-20 w-20">
      <rect x="18" y="38" width="70" height="50" rx="4" fill="#000" opacity="0.15" />
      <rect x="12" y="32" width="70" height="50" rx="4" fill="white" stroke="black" strokeWidth="3" />
      <path d="M12 42L47 12L82 42" stroke="black" strokeWidth="3" fill="none" />
      <rect x="38" y="52" width="18" height="30" rx="2" fill="#4AA3FF" stroke="black" strokeWidth="2" />
      <circle cx="52" cy="67" r="2" fill="black" />
      <rect x="20" y="45" width="12" height="12" rx="1" fill="#FFD84A" stroke="black" strokeWidth="2" />
      <rect x="62" y="45" width="12" height="12" rx="1" fill="#FFD84A" stroke="black" strokeWidth="2" />
    </svg>
  )
}

// Step 2: Person/Creator icon
function CreatorIcon() {
  return (
    <svg viewBox="0 0 100 100" fill="none" className="h-20 w-20">
      <circle cx="54" cy="38" r="18" fill="#000" opacity="0.15" />
      <circle cx="50" cy="34" r="18" fill="#D7B6FF" stroke="black" strokeWidth="3" />
      <circle cx="44" cy="30" r="3" fill="black" />
      <circle cx="56" cy="30" r="3" fill="black" />
      <path d="M44 40Q50 46 56 40" stroke="black" strokeWidth="2" fill="none" />
      <rect x="28" y="58" width="50" height="34" rx="6" fill="#000" opacity="0.15" />
      <rect x="24" y="54" width="50" height="34" rx="6" fill="#4AA3FF" stroke="black" strokeWidth="3" />
      <circle cx="34" cy="64" r="4" fill="#FFD84A" stroke="black" strokeWidth="2" />
    </svg>
  )
}

// Step 3: Link/Chain icon
function LinkIcon() {
  return (
    <svg viewBox="0 0 100 100" fill="none" className="h-20 w-20">
      <ellipse cx="54" cy="54" rx="28" ry="28" fill="#000" opacity="0.15" />
      <ellipse cx="50" cy="50" rx="28" ry="28" fill="white" stroke="black" strokeWidth="3" />
      <rect x="20" y="38" width="28" height="24" rx="12" fill="#28D17C" stroke="black" strokeWidth="3" />
      <rect x="28" y="44" width="12" height="12" rx="6" fill="white" stroke="black" strokeWidth="2" />
      <rect x="52" y="38" width="28" height="24" rx="12" fill="#FFD84A" stroke="black" strokeWidth="3" />
      <rect x="60" y="44" width="12" height="12" rx="6" fill="white" stroke="black" strokeWidth="2" />
      <circle cx="50" cy="50" r="6" fill="#4AA3FF" stroke="black" strokeWidth="2" />
    </svg>
  )
}

// Step 4: Chart/Analytics icon
function ChartIcon() {
  return (
    <svg viewBox="0 0 100 100" fill="none" className="h-20 w-20">
      <rect x="18" y="18" width="70" height="70" rx="10" fill="#000" opacity="0.15" />
      <rect x="12" y="12" width="70" height="70" rx="10" fill="white" stroke="black" strokeWidth="3" />
      <rect x="22" y="50" width="12" height="24" rx="2" fill="#28D17C" stroke="black" strokeWidth="2" />
      <rect x="40" y="36" width="12" height="38" rx="2" fill="#4AA3FF" stroke="black" strokeWidth="2" />
      <rect x="58" y="24" width="12" height="50" rx="2" fill="#FFD84A" stroke="black" strokeWidth="2" />
      <path d="M28 48L46 34L64 22" stroke="black" strokeWidth="3" strokeLinecap="round" />
      <circle cx="64" cy="22" r="4" fill="#FF5A1F" stroke="black" strokeWidth="2" />
    </svg>
  )
}

// Step 5: Payment/Doc icon
function PaymentIcon() {
  return (
    <svg viewBox="0 0 100 100" fill="none" className="h-20 w-20">
      <rect x="28" y="18" width="50" height="70" rx="4" fill="#000" opacity="0.15" />
      <rect x="22" y="12" width="50" height="70" rx="4" fill="white" stroke="black" strokeWidth="3" />
      <circle cx="62" cy="22" r="12" fill="#28D17C" stroke="black" strokeWidth="2" />
      <text x="62" y="27" textAnchor="middle" fontSize="14" fontWeight="bold" fill="black">$</text>
      <rect x="30" y="40" width="28" height="4" rx="2" fill="#4AA3FF" />
      <rect x="30" y="50" width="20" height="4" rx="2" fill="#D7B6FF" />
      <rect x="30" y="60" width="32" height="4" rx="2" fill="#FFD84A" />
      <rect x="30" y="68" width="24" height="10" rx="2" fill="black" />
      <text x="42" y="76" textAnchor="middle" fontSize="7" fontWeight="bold" fill="white">1099</text>
    </svg>
  )
}

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
    Icon: HouseIcon,
  },
  {
    id: "step-2",
    number: "02",
    line1: "INVITE A",
    line2: "CREATOR",
    copy: "Browse creators by niche and audience. Send collaboration offers with your terms and budget.",
    benefit: "No cold DMs. No guesswork.",
    color: "#4AA3FF",
    Icon: CreatorIcon,
  },
  {
    id: "step-3",
    number: "03",
    line1: "THEY POST",
    line2: "YOUR LINK",
    copy: "Creators share your tracked link in their content. Every click is attributed to you.",
    benefit: "Real reach. Real attribution.",
    color: "#28D17C",
    Icon: LinkIcon,
  },
  {
    id: "step-4",
    number: "04",
    line1: "WATCH",
    line2: "TRAFFIC GROW",
    copy: "See clicks, unique visitors, and traffic sources in real time. Know exactly what's working.",
    benefit: "More bookings, without learning ads.",
    color: "#D7B6FF",
    Icon: ChartIcon,
  },
  {
    id: "step-5",
    number: "05",
    line1: "PAY THROUGH",
    line2: "PLATFORM",
    copy: "Pay creators via Stripe. We handle contracts, payouts, and 1099s at year-end.",
    benefit: "Clean paperwork. Repeatable outreach.",
    color: "#FF5A1F",
    Icon: PaymentIcon,
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
    const cards = container.querySelectorAll(".feature-card")
    
    if (cards[wrappedIndex]) {
      cards[wrappedIndex].scrollIntoView({ 
        behavior: smooth && !prefersReducedMotion ? "smooth" : "auto", 
        inline: "center", 
        block: "nearest" 
      })
      setActiveIndex(wrappedIndex)
    }
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

      {/* Scroll container */}
      <div
        ref={scrollRef}
        className="scrollbar-hide flex snap-x snap-mandatory gap-2 overflow-x-auto px-2 pb-3"
        style={{ scrollPaddingInline: "8px" }}
      >
        {steps.map((step) => (
          <div
            key={step.id}
            className="feature-card flex-shrink-0 snap-center rounded-2xl border-[3px] border-black p-4"
            style={{
              backgroundColor: step.color,
              width: "min(360px, 82vw)",
              height: "min(420px, 75vh)",
            }}
          >
            <div className="flex h-full flex-col justify-between">
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
              <div className="self-end">
                {step.Icon && <step.Icon />}
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
