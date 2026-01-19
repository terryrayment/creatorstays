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

// 3D-style Link Chain illustration (for Tracked Links)
function LinkChainIcon() {
  return (
    <svg viewBox="0 0 100 100" fill="none" className="h-28 w-28 illus-float">
      <ellipse cx="54" cy="54" rx="28" ry="28" fill="#000" opacity="0.15" />
      <ellipse cx="50" cy="50" rx="28" ry="28" fill="white" stroke="black" strokeWidth="3" />
      {/* Link 1 */}
      <rect x="20" y="38" width="28" height="24" rx="12" fill="#4AA3FF" stroke="black" strokeWidth="3" />
      <rect x="28" y="44" width="12" height="12" rx="6" fill="white" stroke="black" strokeWidth="2" />
      {/* Link 2 */}
      <rect x="52" y="38" width="28" height="24" rx="12" fill="#FFD84A" stroke="black" strokeWidth="3" />
      <rect x="60" y="44" width="12" height="12" rx="6" fill="white" stroke="black" strokeWidth="2" />
      {/* Connection dot */}
      <circle cx="50" cy="50" r="6" fill="#28D17C" stroke="black" strokeWidth="2" />
    </svg>
  )
}

// 3D-style Handshake/Request illustration (for Creator Requests)
function HandshakeIcon() {
  return (
    <svg viewBox="0 0 100 100" fill="none" className="h-28 w-28 illus-float">
      <rect x="18" y="28" width="70" height="50" rx="8" fill="#000" opacity="0.15" />
      <rect x="12" y="22" width="70" height="50" rx="8" fill="white" stroke="black" strokeWidth="3" />
      {/* Left hand */}
      <path d="M20 50L35 42L45 50L35 58Z" fill="#D7B6FF" stroke="black" strokeWidth="2" />
      {/* Right hand */}
      <path d="M55 50L70 42L80 50L70 58Z" fill="#4AA3FF" stroke="black" strokeWidth="2" />
      {/* Handshake center */}
      <circle cx="50" cy="50" r="8" fill="#FFD84A" stroke="black" strokeWidth="2" />
      {/* Check mark */}
      <path d="M46 50L49 53L55 47" stroke="black" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

// 3D-style Document/Tax illustration (for Payments & Taxes)
function TaxDocIcon() {
  return (
    <svg viewBox="0 0 100 100" fill="none" className="h-28 w-28 illus-float">
      {/* Shadow */}
      <rect x="28" y="18" width="50" height="70" rx="4" fill="#000" opacity="0.15" />
      {/* Main doc */}
      <rect x="22" y="12" width="50" height="70" rx="4" fill="white" stroke="black" strokeWidth="3" />
      {/* Dollar badge */}
      <circle cx="62" cy="22" r="12" fill="#28D17C" stroke="black" strokeWidth="2" />
      <text x="62" y="27" textAnchor="middle" fontSize="14" fontWeight="bold" fill="black">$</text>
      {/* Lines */}
      <rect x="30" y="40" width="28" height="4" rx="2" fill="#4AA3FF" />
      <rect x="30" y="50" width="20" height="4" rx="2" fill="#D7B6FF" />
      <rect x="30" y="60" width="32" height="4" rx="2" fill="#FFD84A" />
      {/* 1099 badge */}
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

// Feature card data - UPDATED with new business features
const features = [
  {
    id: "traffic",
    title: "REAL TRAFFIC",
    subtitle: "Track every click",
    color: "#FFD84A",
    Icon: ChartTileIcon,
  },
  {
    id: "tracked-links",
    title: "TRACKED LINKS",
    subtitle: "Attribution that sticks",
    color: "#4AA3FF",
    Icon: LinkChainIcon,
  },
  {
    id: "reach",
    title: "TARGETED REACH",
    subtitle: "Real travelers who book",
    color: "#D7B6FF",
    Icon: RocketIcon,
  },
  {
    id: "creator-requests",
    title: "CREATOR REQUESTS",
    subtitle: "Creators approve terms",
    color: "#28D17C",
    Icon: HandshakeIcon,
  },
  {
    id: "payments-taxes",
    title: "PAYMENTS & TAXES",
    subtitle: "Payouts + 1099s via platform",
    color: "#FF5A1F",
    Icon: TaxDocIcon,
  },
  {
    id: "payouts",
    title: "INSTANT PAYOUTS",
    subtitle: "Direct to creators",
    color: "#E8D5E8",
    Icon: CardStackIcon,
  },
]

// Mini dashboard illustration
function DashboardPreview() {
  return (
    <div className="relative h-full w-full overflow-hidden rounded-xl border-[3px] border-black bg-white p-3">
      <div className="absolute bottom-3 left-3 top-3 w-10 rounded-lg border-2 border-black/20 bg-black/5 p-1.5">
        <div className="mb-2 h-5 w-5 rounded bg-black/20" />
        <div className="mb-1 h-4 w-4 rounded bg-black/10" />
        <div className="mb-1 h-4 w-4 rounded bg-black/10" />
      </div>
      <div className="ml-14 space-y-2">
        <div className="flex gap-2">
          <div className="flex-1 rounded-lg border-2 border-black/20 bg-[#FFD84A]/30 p-2">
            <div className="text-[8px] font-black text-black/50">CLICKS</div>
            <div className="font-heading text-[18px] text-black">1,247</div>
          </div>
          <div className="flex-1 rounded-lg border-2 border-black/20 bg-[#4AA3FF]/30 p-2">
            <div className="text-[8px] font-black text-black/50">UNIQUE</div>
            <div className="font-heading text-[18px] text-black">892</div>
          </div>
        </div>
        <div className="rounded-lg border-2 border-black/20 bg-black/5 p-2">
          <div className="flex h-10 items-end gap-1">
            {[40, 60, 35, 80, 55, 70, 90, 65].map((h, i) => (
              <div key={i} className="flex-1 rounded-sm bg-black/30" style={{ height: `${h}%` }} />
            ))}
          </div>
        </div>
        <div className="rounded-full border-2 border-black bg-black px-3 py-1.5 text-center text-[10px] font-black text-white">
          INVITE CREATOR
        </div>
      </div>
    </div>
  )
}

export function FeatureScroller() {
  const scrollRef = useRef<HTMLDivElement>(null)
  const [activeIndex, setActiveIndex] = useState(0)
  const [isPaused, setIsPaused] = useState(false)
  const [isTransitioning, setIsTransitioning] = useState(false)
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
      // Trigger whoosh blur effect
      if (!prefersReducedMotion && smooth) {
        setIsTransitioning(true)
        setTimeout(() => setIsTransitioning(false), 150)
      }
      
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
      const cardWidth = 380
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

  // Auto-loop carousel (5 seconds)
  useEffect(() => {
    if (prefersReducedMotion || isPaused) return

    const interval = setInterval(() => {
      const nextIndex = (activeIndex + 1) % features.length
      scrollToIndex(nextIndex)
    }, 5000)

    return () => clearInterval(interval)
  }, [activeIndex, isPaused, prefersReducedMotion, scrollToIndex])

  const goLeft = () => scrollToIndex(activeIndex - 1)
  const goRight = () => scrollToIndex(activeIndex + 1)

  return (
    <section 
      className="bg-black py-6"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onFocus={() => setIsPaused(true)}
      onBlur={() => setIsPaused(false)}
    >
      {/* Arrow buttons */}
      <div className="mx-auto mb-4 flex max-w-7xl items-center justify-end gap-2 px-4">
        <button
          onClick={goLeft}
          className="flex h-10 w-10 items-center justify-center rounded-full border-[3px] border-white bg-transparent text-white transition-all hover:bg-white hover:text-black"
          aria-label="Previous card"
        >
          <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
            <path d="M15 18L9 12L15 6" />
          </svg>
        </button>
        <button
          onClick={goRight}
          className="flex h-10 w-10 items-center justify-center rounded-full border-[3px] border-white bg-white text-black transition-all hover:bg-transparent hover:text-white"
          aria-label="Next card"
        >
          <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
            <path d="M9 18L15 12L9 6" />
          </svg>
        </button>
      </div>

      {/* Scroll container with whoosh blur */}
      <div
        ref={scrollRef}
        className={`scrollbar-hide flex snap-x snap-mandatory gap-4 overflow-x-auto px-4 pb-6 transition-[filter] duration-150 ${
          isTransitioning ? "blur-[2px]" : "blur-0"
        }`}
        style={{ scrollPaddingInline: "16px" }}
      >
        {features.map((feature, index) => {
          const isActive = index === activeIndex
          
          return (
            <div
              key={feature.id}
              className={`feature-card flex-shrink-0 snap-center rounded-2xl border-[3px] border-black p-6 transition-all ${
                prefersReducedMotion ? "duration-0" : "duration-500"
              } ${
                isActive 
                  ? "scale-100 opacity-100" 
                  : "scale-[0.92] opacity-70 blur-[1px]"
              }`}
              style={{
                backgroundColor: feature.color,
                width: "min(380px, 85vw)",
                height: "min(420px, 75vh)",
                transitionTimingFunction: prefersReducedMotion 
                  ? "ease" 
                  : "cubic-bezier(0.34, 1.56, 0.64, 1)",
              }}
            >
              <div className="flex h-full flex-col justify-between">
                <div>
                  {/* TITLE - TWICE AS BOLD with font-black (900) */}
                  <h3 className="font-heading text-[2.75rem] font-black leading-[0.82] tracking-[-0.04em] text-black sm:text-[3.25rem] md:text-[3.75rem]">
                    {feature.title}
                  </h3>
                  <p className="mt-3 text-[13px] font-semibold text-black/50">{feature.subtitle}</p>
                </div>
                <div className={`self-end transition-transform ${
                  prefersReducedMotion ? "duration-0" : "duration-500"
                } ${isActive ? "scale-100" : "scale-90"}`}
                style={{
                  transitionTimingFunction: prefersReducedMotion 
                    ? "ease" 
                    : "cubic-bezier(0.34, 1.56, 0.64, 1)",
                }}
                >
                  {feature.Icon && <feature.Icon />}
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Dot indicators */}
      <div className="flex justify-center gap-2">
        {features.map((_, index) => (
          <button
            key={index}
            onClick={() => scrollToIndex(index)}
            className={`h-2.5 w-2.5 rounded-full border-2 border-white transition-all duration-300 ${
              index === activeIndex ? "scale-125 bg-white" : "bg-transparent hover:bg-white/50"
            }`}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>
    </section>
  )
}
