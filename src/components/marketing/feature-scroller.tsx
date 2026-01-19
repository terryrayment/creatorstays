"use client"

import { useRef, useState, useEffect } from "react"

// 3D-style Phone + Link Tag illustration (like reference)
function PhoneLinkIcon() {
  return (
    <svg viewBox="0 0 100 100" fill="none" className="h-24 w-24">
      {/* Shadow layers */}
      <rect x="18" y="18" width="50" height="70" rx="8" fill="#000" opacity="0.15" />
      {/* Phone back */}
      <rect x="12" y="10" width="50" height="70" rx="8" fill="#E8D5E8" stroke="black" strokeWidth="3" />
      {/* Phone screen */}
      <rect x="16" y="16" width="42" height="58" rx="4" fill="white" stroke="black" strokeWidth="2" />
      {/* Link tag shadow */}
      <rect x="58" y="38" width="28" height="48" rx="6" fill="#000" opacity="0.15" />
      {/* Link tag */}
      <rect x="52" y="32" width="28" height="48" rx="6" fill="#28D17C" stroke="black" strokeWidth="3" />
      <circle cx="66" cy="44" r="4" fill="black" />
      {/* App icon shadow */}
      <rect x="42" y="8" width="22" height="22" rx="6" fill="#000" opacity="0.15" />
      {/* App icon */}
      <rect x="38" y="4" width="22" height="22" rx="6" fill="#4AA3FF" stroke="black" strokeWidth="3" />
      <path d="M46 15L52 10L56 15" stroke="black" strokeWidth="2" fill="none" />
    </svg>
  )
}

// 3D-style Rocket illustration
function RocketIcon() {
  return (
    <svg viewBox="0 0 100 100" fill="none" className="h-24 w-24">
      {/* Flame shadow */}
      <ellipse cx="54" cy="82" rx="12" ry="8" fill="#000" opacity="0.15" />
      {/* Flame */}
      <path d="M50 70L42 88L50 82L58 88L50 70Z" fill="#FF5A1F" stroke="black" strokeWidth="3" />
      {/* Rocket body shadow */}
      <ellipse cx="54" cy="44" rx="18" ry="32" fill="#000" opacity="0.15" />
      {/* Rocket body */}
      <ellipse cx="50" cy="40" rx="18" ry="32" fill="white" stroke="black" strokeWidth="3" />
      {/* Rocket tip */}
      <path d="M50 8L42 24H58L50 8Z" fill="#FF5A1F" stroke="black" strokeWidth="3" />
      {/* Window */}
      <circle cx="50" cy="36" r="8" fill="#4AA3FF" stroke="black" strokeWidth="2" />
      <circle cx="48" cy="34" r="2" fill="white" />
      {/* Left fin */}
      <path d="M32 52L24 68L36 60Z" fill="#D7B6FF" stroke="black" strokeWidth="2" />
      {/* Right fin */}
      <path d="M68 52L76 68L64 60Z" fill="#D7B6FF" stroke="black" strokeWidth="2" />
    </svg>
  )
}

// 3D-style Credit Card Stack illustration
function CardStackIcon() {
  return (
    <svg viewBox="0 0 100 100" fill="none" className="h-24 w-24">
      {/* Back card shadow */}
      <rect x="22" y="38" width="60" height="40" rx="6" fill="#000" opacity="0.15" />
      {/* Back card */}
      <rect x="16" y="32" width="60" height="40" rx="6" fill="#D7B6FF" stroke="black" strokeWidth="3" />
      {/* Middle card shadow */}
      <rect x="28" y="28" width="60" height="40" rx="6" fill="#000" opacity="0.15" />
      {/* Middle card */}
      <rect x="22" y="22" width="60" height="40" rx="6" fill="#4AA3FF" stroke="black" strokeWidth="3" />
      {/* Front card shadow */}
      <rect x="34" y="18" width="60" height="40" rx="6" fill="#000" opacity="0.15" />
      {/* Front card */}
      <rect x="28" y="12" width="60" height="40" rx="6" fill="#FFD84A" stroke="black" strokeWidth="3" />
      {/* Chip */}
      <rect x="36" y="22" width="14" height="10" rx="2" fill="#FFD84A" stroke="black" strokeWidth="2" />
      <line x1="40" y1="22" x2="40" y2="32" stroke="black" strokeWidth="1" />
      <line x1="46" y1="22" x2="46" y2="32" stroke="black" strokeWidth="1" />
      {/* Stripe */}
      <rect x="28" y="38" width="60" height="8" fill="black" />
    </svg>
  )
}

// 3D-style Chart Tile illustration  
function ChartTileIcon() {
  return (
    <svg viewBox="0 0 100 100" fill="none" className="h-24 w-24">
      {/* Tile shadow */}
      <rect x="18" y="18" width="70" height="70" rx="10" fill="#000" opacity="0.15" />
      {/* Tile background */}
      <rect x="12" y="12" width="70" height="70" rx="10" fill="white" stroke="black" strokeWidth="3" />
      {/* Bar 1 */}
      <rect x="22" y="50" width="12" height="24" rx="2" fill="#28D17C" stroke="black" strokeWidth="2" />
      {/* Bar 2 */}
      <rect x="40" y="36" width="12" height="38" rx="2" fill="#4AA3FF" stroke="black" strokeWidth="2" />
      {/* Bar 3 */}
      <rect x="58" y="24" width="12" height="50" rx="2" fill="#FFD84A" stroke="black" strokeWidth="2" />
      {/* Trend line */}
      <path d="M28 48L46 34L64 22" stroke="black" strokeWidth="3" strokeLinecap="round" />
      <circle cx="64" cy="22" r="4" fill="#FF5A1F" stroke="black" strokeWidth="2" />
    </svg>
  )
}

// Feature card data
const features = [
  {
    id: "traffic",
    title: "REAL TRAFFIC",
    subtitle: "Track every click",
    color: "#FFD84A",
    Icon: ChartTileIcon,
  },
  {
    id: "content",
    title: "CONTENT YOU OWN",
    subtitle: "Photos & videos forever",
    color: "#4AA3FF",
    Icon: PhoneLinkIcon,
  },
  {
    id: "reach",
    title: "TARGETED REACH",
    subtitle: "Real travelers who book",
    color: "#D7B6FF",
    Icon: RocketIcon,
  },
  {
    id: "dashboard",
    title: "YOUR DASHBOARD",
    subtitle: "Everything in one place",
    color: "#28D17C",
    Icon: null,
    isDashboard: true,
  },
  {
    id: "payouts",
    title: "INSTANT PAYOUTS",
    subtitle: "Direct to creators",
    color: "#FF5A1F",
    Icon: CardStackIcon,
  },
]

// Mini dashboard illustration
function DashboardPreview() {
  return (
    <div className="relative h-full w-full overflow-hidden rounded-lg border-[3px] border-black bg-white p-2">
      {/* Mini sidebar */}
      <div className="absolute bottom-2 left-2 top-2 w-8 rounded border-2 border-black/20 bg-black/5 p-1">
        <div className="mb-1.5 h-4 w-4 rounded bg-black/20" />
        <div className="mb-1 h-3 w-3 rounded bg-black/10" />
        <div className="mb-1 h-3 w-3 rounded bg-black/10" />
      </div>
      {/* Main area */}
      <div className="ml-10 space-y-1.5">
        {/* Metric tiles */}
        <div className="flex gap-1.5">
          <div className="flex-1 rounded border-2 border-black/20 bg-[#FFD84A]/30 p-1.5">
            <div className="text-[7px] font-bold text-black/50">CLICKS</div>
            <div className="font-heading text-[14px] text-black">1,247</div>
          </div>
          <div className="flex-1 rounded border-2 border-black/20 bg-[#4AA3FF]/30 p-1.5">
            <div className="text-[7px] font-bold text-black/50">UNIQUE</div>
            <div className="font-heading text-[14px] text-black">892</div>
          </div>
        </div>
        {/* Mini chart */}
        <div className="rounded border-2 border-black/20 bg-black/5 p-1.5">
          <div className="flex h-8 items-end gap-0.5">
            {[40, 60, 35, 80, 55, 70, 90, 65].map((h, i) => (
              <div key={i} className="flex-1 rounded-sm bg-black/30" style={{ height: `${h}%` }} />
            ))}
          </div>
        </div>
        {/* CTA button */}
        <div className="rounded-full border-2 border-black bg-black px-2 py-1 text-center text-[8px] font-bold text-white">
          INVITE CREATOR
        </div>
      </div>
    </div>
  )
}

export function FeatureScroller() {
  const scrollRef = useRef<HTMLDivElement>(null)
  const [activeIndex, setActiveIndex] = useState(0)

  useEffect(() => {
    const container = scrollRef.current
    if (!container) return

    const handleScroll = () => {
      const scrollLeft = container.scrollLeft
      const cardWidth = 280
      const newIndex = Math.round(scrollLeft / cardWidth)
      setActiveIndex(Math.min(newIndex, features.length - 1))
    }

    container.addEventListener("scroll", handleScroll, { passive: true })
    return () => container.removeEventListener("scroll", handleScroll)
  }, [])

  const scrollToIndex = (index: number) => {
    const container = scrollRef.current
    if (!container) return
    const cards = container.querySelectorAll(".feature-card")
    if (cards[index]) {
      cards[index].scrollIntoView({ behavior: "smooth", inline: "center", block: "nearest" })
    }
  }

  return (
    <section className="bg-black py-4">
      {/* Scroll container */}
      <div
        ref={scrollRef}
        className="scrollbar-hide flex snap-x snap-mandatory gap-3 overflow-x-auto px-4 pb-4"
        style={{ scrollPaddingInline: "16px" }}
      >
        {features.map((feature, index) => (
          <div
            key={feature.id}
            className={`feature-card flex-shrink-0 snap-center rounded-2xl border-[3px] border-black p-5 transition-all duration-300 ${
              index === activeIndex ? "scale-100 opacity-100" : "scale-[0.97] opacity-80"
            }`}
            style={{
              backgroundColor: feature.color,
              width: "min(280px, 75vw)",
              height: "min(280px, 75vw)",
            }}
          >
            {feature.isDashboard ? (
              <div className="flex h-full flex-col">
                <h3 className="font-heading text-[1.25rem] leading-[0.9] text-black">{feature.title}</h3>
                <p className="mt-1 text-[11px] text-black/60">{feature.subtitle}</p>
                <div className="mt-3 flex-1">
                  <DashboardPreview />
                </div>
              </div>
            ) : (
              <div className="flex h-full flex-col justify-between">
                <div>
                  <h3 className="font-heading text-[1.75rem] leading-[0.9] text-black sm:text-[2rem]">
                    {feature.title}
                  </h3>
                  <p className="mt-1 text-[12px] text-black/60">{feature.subtitle}</p>
                </div>
                <div className="self-end">{feature.Icon && <feature.Icon />}</div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Dot indicators */}
      <div className="flex justify-center gap-1.5">
        {features.map((_, index) => (
          <button
            key={index}
            onClick={() => scrollToIndex(index)}
            className={`h-2 w-2 rounded-full border-2 border-white transition-all ${
              index === activeIndex ? "bg-white" : "bg-transparent"
            }`}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>
    </section>
  )
}
