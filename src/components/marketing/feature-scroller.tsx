"use client"

import { useRef, useState, useEffect } from "react"

// Feature card data
const features = [
  {
    id: "traffic",
    title: "REAL TRAFFIC",
    subtitle: "Track every click",
    color: "#FFD84A",
    icon: (
      <svg viewBox="0 0 80 80" fill="none" className="h-20 w-20">
        <rect x="10" y="50" width="12" height="20" fill="white" stroke="black" strokeWidth="3" />
        <rect x="28" y="35" width="12" height="35" fill="white" stroke="black" strokeWidth="3" />
        <rect x="46" y="20" width="12" height="50" fill="white" stroke="black" strokeWidth="3" />
        <path d="M16 45L34 30L52 15L65 25" stroke="black" strokeWidth="3" fill="none" />
        <circle cx="65" cy="25" r="5" fill="#FF5A1F" stroke="black" strokeWidth="2" />
      </svg>
    ),
  },
  {
    id: "content",
    title: "CONTENT YOU OWN",
    subtitle: "Photos & videos forever",
    color: "#4AA3FF",
    icon: (
      <svg viewBox="0 0 80 80" fill="none" className="h-20 w-20">
        <rect x="12" y="20" width="56" height="40" rx="4" fill="white" stroke="black" strokeWidth="3" />
        <circle cx="40" cy="40" r="14" fill="#4AA3FF" stroke="black" strokeWidth="3" />
        <circle cx="40" cy="40" r="6" fill="white" stroke="black" strokeWidth="2" />
        <rect x="28" y="12" width="24" height="10" rx="2" fill="white" stroke="black" strokeWidth="2" />
        <circle cx="56" cy="30" r="3" fill="black" />
      </svg>
    ),
  },
  {
    id: "reach",
    title: "TARGETED REACH",
    subtitle: "Real travelers who book",
    color: "#D7B6FF",
    icon: (
      <svg viewBox="0 0 80 80" fill="none" className="h-20 w-20">
        <circle cx="40" cy="40" r="28" fill="white" stroke="black" strokeWidth="3" />
        <circle cx="40" cy="40" r="18" stroke="black" strokeWidth="2" fill="none" />
        <circle cx="40" cy="40" r="8" fill="#FF5A1F" stroke="black" strokeWidth="2" />
        <path d="M40 8V16M40 64V72M8 40H16M64 40H72" stroke="black" strokeWidth="2" />
      </svg>
    ),
  },
  {
    id: "dashboard",
    title: "YOUR DASHBOARD",
    subtitle: "Everything in one place",
    color: "#28D17C",
    icon: null,
    isDashboard: true,
  },
  {
    id: "payouts",
    title: "INSTANT PAYOUTS",
    subtitle: "Direct to creators",
    color: "#FF5A1F",
    icon: (
      <svg viewBox="0 0 80 80" fill="none" className="h-20 w-20">
        <rect x="10" y="24" width="60" height="40" rx="4" fill="white" stroke="black" strokeWidth="3" />
        <rect x="10" y="32" width="60" height="8" fill="black" />
        <rect x="18" y="48" width="20" height="8" rx="2" fill="#FFD84A" stroke="black" strokeWidth="2" />
        <circle cx="58" cy="52" r="6" fill="#D7B6FF" stroke="black" strokeWidth="2" />
      </svg>
    ),
  },
]

// Mini dashboard illustration
function DashboardPreview() {
  return (
    <div className="relative h-full w-full overflow-hidden rounded-xl border-[3px] border-black bg-white p-2">
      {/* Mini sidebar */}
      <div className="absolute bottom-2 left-2 top-2 w-10 rounded-lg border-2 border-black/20 bg-black/5 p-1">
        <div className="mb-2 h-6 w-6 rounded bg-black/20" />
        <div className="mb-1 h-4 w-4 rounded bg-black/10" />
        <div className="mb-1 h-4 w-4 rounded bg-black/10" />
        <div className="h-4 w-4 rounded bg-black/10" />
      </div>
      {/* Main area */}
      <div className="ml-12 space-y-2">
        {/* Metric tiles */}
        <div className="flex gap-2">
          <div className="flex-1 rounded-lg border-2 border-black/20 bg-[#FFD84A]/30 p-2">
            <div className="text-[8px] font-bold text-black/50">CLICKS</div>
            <div className="font-heading text-[16px] text-black">1,247</div>
          </div>
          <div className="flex-1 rounded-lg border-2 border-black/20 bg-[#4AA3FF]/30 p-2">
            <div className="text-[8px] font-bold text-black/50">UNIQUE</div>
            <div className="font-heading text-[16px] text-black">892</div>
          </div>
        </div>
        {/* Mini chart */}
        <div className="rounded-lg border-2 border-black/20 bg-black/5 p-2">
          <div className="flex h-12 items-end gap-1">
            {[40, 60, 35, 80, 55, 70, 90, 65].map((h, i) => (
              <div key={i} className="flex-1 rounded-sm bg-black/30" style={{ height: `${h}%` }} />
            ))}
          </div>
        </div>
        {/* CTA button */}
        <div className="rounded-full border-2 border-black bg-black px-3 py-1.5 text-center text-[9px] font-bold text-white">
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
      const cardWidth = container.offsetWidth * 0.8 // Approximate card width + gap
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
    <section className="bg-black py-12">
      {/* Scroll container */}
      <div
        ref={scrollRef}
        className="scrollbar-hide flex snap-x snap-mandatory gap-4 overflow-x-auto px-6 pb-6"
        style={{ scrollPaddingInline: "24px" }}
      >
        {features.map((feature, index) => (
          <div
            key={feature.id}
            className={`feature-card flex-shrink-0 snap-center rounded-3xl border-[3px] border-black p-6 transition-transform duration-300 ${
              index === activeIndex ? "scale-100" : "scale-95 opacity-90"
            }`}
            style={{
              backgroundColor: feature.color,
              width: "min(320px, 80vw)",
              height: "min(320px, 80vw)",
            }}
          >
            {feature.isDashboard ? (
              <div className="flex h-full flex-col">
                <h3 className="font-heading text-[1.5rem] leading-[0.9] text-black">{feature.title}</h3>
                <p className="mt-1 text-[12px] text-black/60">{feature.subtitle}</p>
                <div className="mt-4 flex-1">
                  <DashboardPreview />
                </div>
              </div>
            ) : (
              <div className="flex h-full flex-col justify-between">
                <div>
                  <h3 className="font-heading text-[2rem] leading-[0.9] text-black sm:text-[2.5rem]">
                    {feature.title}
                  </h3>
                  <p className="mt-2 text-[13px] text-black/60">{feature.subtitle}</p>
                </div>
                <div className="self-end">{feature.icon}</div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Dot indicators */}
      <div className="flex justify-center gap-2">
        {features.map((_, index) => (
          <button
            key={index}
            onClick={() => scrollToIndex(index)}
            className={`h-2.5 w-2.5 rounded-full border-2 border-white transition-all ${
              index === activeIndex ? "bg-white" : "bg-transparent"
            }`}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>
    </section>
  )
}
