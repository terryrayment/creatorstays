import Link from "next/link"

export const metadata = {
  title: "Private Creator Beta | CreatorStays",
  description: "Invite-only beta access for creators.",
  robots: "noindex, nofollow",
}

function Block({ 
  children, 
  className = "",
  color = "white"
}: { 
  children: React.ReactNode
  className?: string
  color?: "white" | "yellow" | "blue" | "green" | "gray"
}) {
  const colors = {
    white: "bg-white",
    yellow: "bg-[#FFD84A]",
    blue: "bg-[#4AA3FF]",
    green: "bg-[#28D17C]",
    gray: "bg-black/5",
  }
  
  return (
    <div className={`rounded-2xl border-[3px] border-black p-6 sm:p-8 ${colors[color]} ${className}`}>
      {children}
    </div>
  )
}

function SectionHeading({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="mb-4 font-heading text-xl font-black tracking-tight text-black sm:text-2xl">
      {children}
    </h2>
  )
}

function VideoPlaceholder({ title }: { title: string }) {
  return (
    <div className="flex aspect-video flex-col items-center justify-center rounded-xl border-2 border-dashed border-black/20 bg-black/5">
      <div className="mb-2 flex h-12 w-12 items-center justify-center rounded-full border-2 border-black/20">
        <svg className="h-5 w-5 text-black/40" fill="currentColor" viewBox="0 0 24 24">
          <path d="M8 5v14l11-7z" />
        </svg>
      </div>
      <p className="text-sm font-medium text-black/40">{title}</p>
      <p className="mt-1 text-xs text-black/30">Coming soon</p>
    </div>
  )
}

export default function CreatorBetaPage() {
  return (
    <div className="min-h-screen bg-[#FAFAFA]">
      <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 sm:py-16">
        <div className="space-y-6">
          
          {/* ============================================================ */}
          {/* HERO BLOCK */}
          {/* ============================================================ */}
          <Block color="yellow">
            <div className="mb-4">
              <span className="inline-block rounded-full border-2 border-black bg-black px-3 py-1 text-[10px] font-black uppercase tracking-wider text-white">
                Invite-only beta
              </span>
            </div>
            <h1 className="font-heading text-3xl font-black tracking-tight text-black sm:text-4xl">
              CreatorStays — Private Creator Beta
            </h1>
            <p className="mt-4 text-base leading-relaxed text-black/80 sm:text-lg">
              You're seeing this because you were invited to help shape the future of 
              creator-led marketing for real businesses.
            </p>
          </Block>

          {/* ============================================================ */}
          {/* WHAT THIS IS */}
          {/* ============================================================ */}
          <Block>
            <SectionHeading>What CreatorStays Is</SectionHeading>
            <div className="space-y-3 text-[15px] leading-relaxed text-black/80">
              <p>
                <strong className="text-black">CreatorStays connects creators directly with hosts who pay for content.</strong>
              </p>
              <ul className="ml-4 list-disc space-y-2">
                <li>You are paid per post, reel, or deliverable — rates you set</li>
                <li>Optional traffic bonuses reward performance when hosts offer them</li>
                <li>We track link traffic (clicks), not bookings — you're paid for driving attention, not conversions</li>
                <li>Payments and tax forms (1099s) are handled through the platform via Stripe</li>
              </ul>
            </div>
          </Block>

          {/* ============================================================ */}
          {/* WHAT BETA MEANS */}
          {/* ============================================================ */}
          <Block color="gray">
            <SectionHeading>What Beta Participation Means</SectionHeading>
            <ul className="ml-4 list-disc space-y-2 text-[15px] leading-relaxed text-black/80">
              <li><strong className="text-black">Early access</strong> — you're among the first creators on the platform</li>
              <li><strong className="text-black">Direct feedback loop</strong> — your input shapes what we build next</li>
              <li><strong className="text-black">Features will evolve</strong> — expect changes, improvements, and occasional bugs</li>
              <li><strong className="text-black">No guarantees, no exclusivity</strong> — this is an opportunity, not a contract</li>
              <li><strong className="text-black">You can leave at any time</strong> — no strings attached</li>
            </ul>
          </Block>

          {/* ============================================================ */}
          {/* HOW CREATORS MAKE MONEY */}
          {/* ============================================================ */}
          <Block>
            <SectionHeading>How Creators Earn</SectionHeading>
            <div className="space-y-4 text-[15px] leading-relaxed text-black/80">
              <div className="rounded-lg border-2 border-black/10 bg-black/5 p-4">
                <p className="font-bold text-black">Base Pay Per Post</p>
                <p className="mt-1">
                  You set your rates. Hosts see your pricing and decide whether to make an offer. 
                  When a collaboration is agreed upon, you're paid your negotiated rate for each deliverable.
                </p>
              </div>
              
              <div className="rounded-lg border-2 border-black/10 bg-black/5 p-4">
                <p className="font-bold text-black">Optional Traffic Bonuses</p>
                <p className="mt-1">
                  Some hosts offer performance bonuses tied to click thresholds. 
                  For example: "Extra $100 if you hit 500 clicks." This is optional and varies by host.
                </p>
              </div>
              
              <div className="rounded-lg border-2 border-black/10 bg-black/5 p-4">
                <p className="font-bold text-black">Post-for-Stay Opportunities</p>
                <p className="mt-1">
                  Some hosts offer free stays in exchange for content (with or without additional cash). 
                  These are clearly labeled when available.
                </p>
              </div>
              
              <div className="rounded-lg border-2 border-black/10 bg-black/5 p-4">
                <p className="font-bold text-black">Who Reaches Out?</p>
                <p className="mt-1">
                  Hosts initiate most outreach based on your public profile. 
                  You can also pitch hosts selectively if you see a property you'd love to feature.
                </p>
              </div>
            </div>
          </Block>

          {/* ============================================================ */}
          {/* EARNING SIMULATIONS */}
          {/* ============================================================ */}
          <Block color="blue">
            <SectionHeading>Example Monthly Scenarios</SectionHeading>
            <p className="mb-6 text-[13px] font-medium text-black/60">
              These are illustrative examples based on typical deal structures, not promises. 
              Actual earnings depend on your rates, participation level, and host demand.
            </p>
            
            <div className="space-y-4">
              {/* Small Creator */}
              <div className="rounded-lg border-2 border-black bg-white p-4">
                <div className="flex items-center justify-between">
                  <p className="font-bold text-black">Newer Creator</p>
                  <span className="text-xs font-medium text-black/50">2–3 deals/month</span>
                </div>
                <div className="mt-2 text-sm text-black/70">
                  <p>• 2 Instagram Reels @ $150 each = $300</p>
                  <p>• 1 post-for-stay (2-night value ~$400)</p>
                  <p className="mt-2 border-t border-black/10 pt-2 font-medium text-black">
                    Range: $300–$700/month in cash + stays
                  </p>
                </div>
              </div>

              {/* Mid-tier Creator */}
              <div className="rounded-lg border-2 border-black bg-white p-4">
                <div className="flex items-center justify-between">
                  <p className="font-bold text-black">Established Creator</p>
                  <span className="text-xs font-medium text-black/50">4–6 deals/month</span>
                </div>
                <div className="mt-2 text-sm text-black/70">
                  <p>• 4 Reels @ $250 each = $1,000</p>
                  <p>• 2 traffic bonuses hit @ $75 each = $150</p>
                  <p>• 1 post-for-stay (3-night value ~$600)</p>
                  <p className="mt-2 border-t border-black/10 pt-2 font-medium text-black">
                    Range: $1,150–$1,750/month in cash + stays
                  </p>
                </div>
              </div>

              {/* High-demand Creator */}
              <div className="rounded-lg border-2 border-black bg-white p-4">
                <div className="flex items-center justify-between">
                  <p className="font-bold text-black">High-Demand Creator</p>
                  <span className="text-xs font-medium text-black/50">8–10 deals/month</span>
                </div>
                <div className="mt-2 text-sm text-black/70">
                  <p>• 8 Reels @ $400 each = $3,200</p>
                  <p>• 4 traffic bonuses hit @ $100 each = $400</p>
                  <p>• 2 premium stays (total value ~$2,000)</p>
                  <p className="mt-2 border-t border-black/10 pt-2 font-medium text-black">
                    Range: $3,600–$5,600/month in cash + stays
                  </p>
                </div>
              </div>
            </div>

            <p className="mt-6 text-center text-[11px] text-black/50">
              Your actual earnings will vary. These scenarios assume consistent participation 
              and sufficient host demand in your niche/location.
            </p>
          </Block>

          {/* ============================================================ */}
          {/* GROWTH TRAJECTORY */}
          {/* ============================================================ */}
          <Block>
            <SectionHeading>Where This Is Going</SectionHeading>
            <div className="space-y-3 text-[15px] leading-relaxed text-black/80">
              <p>
                <strong className="text-black">We're starting with Airbnb hosts</strong> — 
                vacation rental owners who want authentic content to stand out in a crowded market.
              </p>
              <p>
                <strong className="text-black">We're expanding to other local businesses</strong> — 
                spas, yoga studios, fitness centers, restaurants, and experiences. 
                Same creator pool, more opportunities.
              </p>
              <p>
                <strong className="text-black">Host demand will grow over time</strong> — 
                as more hosts join, creators with strong profiles will see more inbound offers.
              </p>
              <p>
                <strong className="text-black">Early creators help shape the platform</strong> — 
                your feedback directly influences features, pricing tools, and how the marketplace works.
              </p>
            </div>
          </Block>

          {/* ============================================================ */}
          {/* VIDEO PLACEHOLDERS */}
          {/* ============================================================ */}
          <Block color="gray">
            <SectionHeading>Coming Soon</SectionHeading>
            <p className="mb-6 text-[15px] text-black/60">
              We're putting together short videos to help you understand the platform better.
            </p>
            <div className="grid gap-4 sm:grid-cols-3">
              <VideoPlaceholder title="Short intro from the founder" />
              <VideoPlaceholder title="How payouts work" />
              <VideoPlaceholder title="What creators are saying" />
            </div>
          </Block>

          {/* ============================================================ */}
          {/* CLEAR CTA */}
          {/* ============================================================ */}
          <Block color="green">
            <div className="text-center">
              <p className="text-lg font-bold text-black">
                If this feels aligned, you're in the right place.
              </p>
              <p className="mt-2 text-sm text-black/60">
                Complete your profile, set your rates, and start receiving offers from hosts.
              </p>
              <Link
                href="/dashboard/creator"
                className="mt-6 inline-flex items-center gap-2 rounded-full border-[3px] border-black bg-black px-8 py-3 text-sm font-black text-white transition-transform hover:-translate-y-0.5"
              >
                Continue to Creator Dashboard
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                </svg>
              </Link>
            </div>
          </Block>

          {/* ============================================================ */}
          {/* FOOTER NOTE */}
          {/* ============================================================ */}
          <p className="text-center text-xs text-black/40">
            This page is not linked publicly. You received access because you were invited to the beta.
            <br />
            Questions? Email <a href="mailto:hello@creatorstays.com" className="underline hover:text-black/60">hello@creatorstays.com</a>
          </p>

        </div>
      </div>
    </div>
  )
}
