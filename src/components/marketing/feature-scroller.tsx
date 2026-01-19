"use client"

import { useRef, useState, useEffect, useCallback } from "react"

// 3D-style Chart Tile illustration  
function ChartTileIcon() {
  return (
    <svg viewBox="0 0 100 100" fill="none" className="h-28 w-28 illus-float">
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

// 3D-style Link Chain illustration
function LinkChainIcon() {
  return (
    <svg viewBox="0 0 100 100" fill="none" className="h-28 w-28 illus-float">
      <ellipse cx="54" cy="54" rx="28" ry="28" fill="#000" opacity="0.15" />
      <ellipse cx="50" cy="50" rx="28" ry="28" fill="white" stroke="black" strokeWidth="3" />
      <rect x="20" y="38" width="28" height="24" rx="12" fill="#4AA3FF" stroke="black" strokeWidth="3" />
      <rect x="28" y="44" width="12" height="12" rx="6" fill="white" stroke="black" strokeWidth="2" />
      <rect x="52" y="38" width="28" height="24" rx="12" fill="#FFD84A" stroke="black" strokeWidth="3" />
      <rect x="60" y="44" width="12" height="12" rx="6" fill="white" stroke="black" strokeWidth="2" />
      <circle cx="50" cy="50" r="6" fill="#28D17C" stroke="black" strokeWidth="2" />
    </svg>
  )
}

// 3D-style Handshake illustration
function HandshakeIcon() {
  return (
    <svg viewBox="0 0 100 100" fill="none" className="h-28 w-28 illus-float">
      <rect x="18" y="28" width="70" height="50" rx="8" fill="#000" opacity="0.15" />
      <rect x="12" y="22" width="70" height="50" rx="8" fill="white" stroke="black" strokeWidth="3" />
      <path d="M20 50L35 42L45 50L35 58Z" fill="#D7B6FF" stroke="black" strokeWidth="2" />
      <path d="M55 50L70 42L80 50L70 58Z" fill="#4AA3FF" stroke="black" strokeWidth="2" />
      <circle cx="50" cy="50" r="8" fill="#FFD84A" stroke="black" strokeWidth="2" />
      <path d="M46 50L49 53L55 47" stroke="black" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

// 3D-style Tax Doc illustration
function TaxDocIcon() {
  return (
    <svg viewBox="0 0 100 100" fill="none" className="h-28 w-28 illus-float">
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

// 3D-style Rocket illustration
function RocketIcon() {
  return (
    <svg viewBox="0 0 100 100" fill="none" className="h-28 w-28 illus-float">
      <ellipse cx="54" cy="82" rx="12" ry="8" fill="#000" opacity="0.15" />
      <path d="M50 70L42 88L50 82L58 88L50 70Z" fill="#FF5A1F" stroke="black" strokeWidth="3" />
      <ellipse cx="54" cy="44" rx="18" ry="32" fill="#000" opacity="0.15" />
      <ellipse cx="50" cy="40" rx="18" ry="32" fill="white" stroke="black" strokeWidth="3" />
      <path d="M50 8L42 24H58L50 8Z" fill="#FF5A1F" stroke="black" strokeWidth="3" />
      <circle cx="50" cy="36" r="8" fill="#4AA3FF" stroke="black" strokeWidth="2" />
      <circle cx="48" cy="34" r="2" fill="white" />
      <path d="M32 52L24 68L36 60Z" fill="#D7B6FF" stroke="black" strokeWidth="2" />
      <path d="M68 52L76 68L64 60Z" fill="#D7B6FF" stroke="black" strokeWidth="2" />
    </svg>
  )
}

// 3D-style Credit Card Stack illustration
function CardStackIcon() {
  return (
    <svg viewBox="0 0 100 100" fill="none" className="h-28 w-28 illus-float">
      <rect x="22" y="38" width="60" height="40" rx="6" fill="#000" opacity="0.15" />
      <rect x="16" y="32" width="60" height="40" rx="6" fill="#D7B6FF" stroke="black" strokeWidth="3" />
      <rect x="28" y="28" width="60" height="40" rx="6" fill="#000" opacity="0.15" />
      <rect x="22" y="22" width="60" height="40" rx="6" fill="#4AA3FF" stroke="black" strokeWidth="3" />
      <rect x="34" y="18" width="60" height="40" rx="6" fill="#000" opacity="0.15" />
      <rect x="28" y="12" width="60" height="40" rx="6" fill="#FFD84A" stroke="black" strokeWidth="3" />
      <rect x="36" y="22" width="14" height="10" rx="2" fill="#FFD84A" stroke="black" strokeWidth="2" />
      <line x1="40" y1="22" x2="40" y2="32" stroke="black" strokeWidth="1" />
      <line x1="46" y1="22" x2="46" y2="32" stroke="black" strokeWidth="1" />
      <rect x="28" y="38" width="60" height="8" fill="black" />
    </svg>
  )
}

// Feature card data with split titles (line1 = bold 900, line2 = regular 400)
const features = [
  {
    id: "traffic",
    line1: "REAL",
    line2: "TRAFFIC",
    subtitle: "Track every click",
    color: "#FFD84A",
    Icon: ChartTileIcon,
  },
  {
    id: "tracked-links",
    line1: "TRACKED",
    line2: "LINKS",
    subtitle: "Attribution that sticks",
    color: "#4AA3FF",
    Icon: LinkChainIcon,
  },
  {
    id: "reach",
    line1: "TARGETED",
    line2: "REACH",
    subtitle: "Real travelers who book",
    color: "#D7B6FF",
    Icon: RocketIcon,
  },
  {
    id: "creator-requests",
    line1: "CREATOR",
    line2: "REQUESTS",
    subtitle: "Creators approve terms",
    color: "#28D17C",
    Icon: HandshakeIcon,
  },
  {
    id: "payments-taxes",
    line1: "PAYMENTS",
    line2: "& TAXES",
    subtitle: "Payouts + 1099s via platform",
    color: "#FF5A1F",
    Icon: TaxDocIcon,
  },
  {
    id: "payouts",
    line1: "INSTANT",
    line2: "PAYOUTS",
    subtitle: "Direct to creators",
    color: "#E8D5E8",
    Icon: CardStackIcon,
  },
]

export function FeatureScroller() {
  const scrollRef = useRef<HTMLDivElement>(null)
  const [activeIndex, setActiveIndex] = useState(0)
  const [isPaused, setIsPaused] = useState(false)
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false)

  // Check for reduced motion preference
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
    
    const wrappedIndex = ((index % features.length) + features.length) % features.length
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

  // Handle scroll to update active index
  useEffect(() => {
    const container = scrollRef.current
    if (!container) return

    const handleScroll = () => {
      const scrollLeft = container.scrollLeft
      const cardWidth = 340
      const newIndex = Math.round(scrollLeft / cardWidth)
      setActiveIndex(Math.min(Math.max(newIndex, 0), features.length - 1))
    }

    container.addEventListener("scroll", handleScroll, { passive: true })
    return () => container.removeEventListener("scroll", handleScroll)
  }, [])

  // Arrow key navigation
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

  // Auto-loop carousel (3 seconds)
  useEffect(() => {
    if (prefersReducedMotion || isPaused) return

    const interval = setInterval(() => {
      const nextIndex = (activeIndex + 1) % features.length
      scrollToIndex(nextIndex)
    }, 3000)

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
      {/* Arrow buttons - tighter spacing */}
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

      {/* Scroll container - tighter gaps, no blur on inactive cards */}
      <div
        ref={scrollRef}
        className="scrollbar-hide flex snap-x snap-mandatory gap-2 overflow-x-auto px-2 pb-3"
        style={{ scrollPaddingInline: "8px" }}
      >
        {features.map((feature) => (
          <div
            key={feature.id}
            className="feature-card flex-shrink-0 snap-center rounded-2xl border-[3px] border-black p-5"
            style={{
              backgroundColor: feature.color,
              width: "min(340px, 80vw)",
              height: "min(380px, 70vh)",
            }}
          >
            <div className="flex h-full flex-col justify-between">
              <div>
                {/* Split title: line1 = extra bold (900), line2 = regular (400) */}
                <h3 className="font-heading leading-[0.82] tracking-[-0.04em] text-black">
                  <span 
                    className="block text-[2.5rem] sm:text-[3rem] md:text-[3.5rem]" 
                    style={{ fontWeight: 900 }}
                  >
                    {feature.line1}
                  </span>
                  <span 
                    className="block text-[2.5rem] sm:text-[3rem] md:text-[3.5rem]" 
                    style={{ fontWeight: 400 }}
                  >
                    {feature.line2}
                  </span>
                </h3>
                {/* Subtitle - all black, no grey */}
                <p className="mt-2 text-[13px] font-medium text-black">{feature.subtitle}</p>
              </div>
              <div className="self-end">
                {feature.Icon && <feature.Icon />}
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
