import Link from "next/link"

// Simple icon tiles like Slush footer
function IconTile({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-20 w-20 items-center justify-center rounded-2xl border-[3px] border-black bg-white">
      {children}
    </div>
  )
}

export default function HomePage() {
  return (
    <div className="min-h-screen bg-black px-4 pb-8 pt-20 sm:px-6">
      {/* Block grid */}
      <div className="mx-auto max-w-6xl">
        {/* Row 1: Two big blocks */}
        <div className="grid gap-4 lg:grid-cols-[1.3fr_1fr]">
          {/* PRIMARY BLOCK - Yellow */}
          <div className="rounded-3xl border-[3px] border-black bg-[#FFD84A] p-8 lg:p-10">
            <h1 className="font-heading text-[3.5rem] uppercase leading-[0.85] tracking-[-0.02em] text-black sm:text-[5rem] md:text-[6rem] lg:text-[5rem] xl:text-[6.5rem]">
              CREATOR
              <br />
              MARKETING
              <br />
              <span className="text-black/40">FOR RENTALS</span>
            </h1>
            <p className="mt-6 max-w-md text-[15px] leading-relaxed text-black/60">
              Vacation rental hosts hire creators. Creators post content. You get traffic.
            </p>
            <Link
              href="/hosts"
              className="mt-8 inline-flex h-12 items-center gap-2 rounded-full bg-black px-7 text-[12px] font-bold uppercase tracking-widest text-white transition-transform hover:scale-[1.02]"
            >
              Start as Host
              <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M7 17L17 7M17 7H7M17 7V17" />
              </svg>
            </Link>
          </div>

          {/* SECONDARY BLOCK - Blue */}
          <div className="flex flex-col justify-between rounded-3xl border-[3px] border-black bg-[#4AA3FF] p-8 lg:p-10">
            <div>
              <h2 className="font-heading text-[2.5rem] uppercase leading-[0.85] text-black sm:text-[3rem]">
                GET
                <br />
                STARTED
              </h2>
              <p className="mt-4 text-[14px] text-black/60">
                Sign up in 2 minutes. No contracts.
              </p>
            </div>

            <div className="mt-8 space-y-3">
              <Link
                href="/hosts"
                className="flex h-12 w-full items-center justify-center gap-2 rounded-full bg-black text-[12px] font-bold uppercase tracking-widest text-white"
              >
                Host Signup
                <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M7 17L17 7M17 7H7M17 7V17" />
                </svg>
              </Link>
              <Link
                href="/waitlist"
                className="flex h-12 w-full items-center justify-center gap-2 rounded-full border-[3px] border-black bg-white text-[12px] font-bold uppercase tracking-widest text-black"
              >
                Creator Waitlist
              </Link>
            </div>

            <p className="mt-6 text-[11px] font-medium uppercase tracking-wider text-black/50">
              Free to start • Pay per result • Track links
            </p>
          </div>
        </div>

        {/* Row 2: Three value blocks */}
        <div className="mt-4 grid gap-4 sm:grid-cols-3">
          {/* Block 1 */}
          <div className="rounded-3xl border-[3px] border-black bg-[#28D17C] p-6">
            <h3 className="font-heading text-[1.75rem] uppercase italic leading-[0.9] text-black">
              REAL
              <br />
              TRAFFIC
            </h3>
            <p className="mt-3 text-[13px] text-black/60">
              Track every click.
            </p>
          </div>

          {/* Block 2 */}
          <div className="rounded-3xl border-[3px] border-black bg-[#D7B6FF] p-6">
            <h3 className="font-heading text-[1.75rem] uppercase italic leading-[0.9] text-black">
              CONTENT
              <br />
              YOU OWN
            </h3>
            <p className="mt-3 text-[13px] text-black/60">
              Photos &amp; videos. Forever.
            </p>
          </div>

          {/* Block 3 */}
          <div className="rounded-3xl border-[3px] border-black bg-white p-6">
            <h3 className="font-heading text-[1.75rem] uppercase italic leading-[0.9] text-black">
              TARGETED
              <br />
              REACH
            </h3>
            <p className="mt-3 text-[13px] text-black/60">
              Real travelers who book.
            </p>
          </div>
        </div>

        {/* Row 3: How It Works + Icon tiles */}
        <div className="mt-4 grid gap-4 lg:grid-cols-[1fr_auto]">
          {/* How It Works block */}
          <div className="rounded-3xl border-[3px] border-black bg-white p-8">
            <h2 className="font-heading text-[2.5rem] uppercase leading-[0.85] text-black sm:text-[3rem]">
              HOW IT
              <br />
              <span className="text-black/30">WORKS</span>
            </h2>
            <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {[
                { num: "01", title: "Add property", desc: "Paste Airbnb link" },
                { num: "02", title: "Find creators", desc: "Browse directory" },
                { num: "03", title: "Track clicks", desc: "Real-time analytics" },
                { num: "04", title: "Pay creators", desc: "Via Stripe" },
              ].map((step) => (
                <div key={step.num} className="border-l-[3px] border-black/10 pl-4">
                  <span className="font-heading text-[1.25rem] text-black/20">{step.num}</span>
                  <h4 className="mt-1 text-[14px] font-semibold text-black">{step.title}</h4>
                  <p className="text-[12px] text-black/50">{step.desc}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Icon tiles grid */}
          <div className="grid grid-cols-2 gap-2">
            <IconTile>
              <svg className="h-8 w-8" viewBox="0 0 24 24" fill="none" stroke="black" strokeWidth="2.5">
                <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
              </svg>
            </IconTile>
            <IconTile>
              <svg className="h-8 w-8" viewBox="0 0 24 24" fill="none" stroke="black" strokeWidth="2.5">
                <rect x="3" y="6" width="18" height="14" rx="2" />
                <circle cx="12" cy="13" r="4" />
              </svg>
            </IconTile>
            <IconTile>
              <svg className="h-8 w-8" viewBox="0 0 24 24" fill="none" stroke="black" strokeWidth="2.5">
                <path d="M12 2l2.4 7.4H22l-6 4.6 2.3 7L12 16.4 5.7 21l2.3-7-6-4.6h7.6L12 2z" />
              </svg>
            </IconTile>
            <IconTile>
              <svg className="h-8 w-8" viewBox="0 0 24 24" fill="none" stroke="black" strokeWidth="2.5">
                <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
              </svg>
            </IconTile>
          </div>
        </div>

        {/* Row 4: CTA blocks */}
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          {/* Subscribe/Hosts */}
          <div className="rounded-3xl border-[3px] border-black bg-[#FFD84A] p-8">
            <h3 className="font-heading text-[2rem] uppercase leading-[0.85] text-black sm:text-[2.5rem]">
              LIST YOUR
              <br />
              <em>PROPERTY</em>
            </h3>
            <p className="mt-3 max-w-xs text-[14px] text-black/60">
              Join hosts using creator marketing.
            </p>
            <Link
              href="/hosts"
              className="mt-6 inline-flex h-11 items-center gap-2 rounded-full bg-black px-6 text-[11px] font-bold uppercase tracking-widest text-white"
            >
              Get Started
              <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M7 17L17 7M17 7H7M17 7V17" />
              </svg>
            </Link>
          </div>

          {/* Support */}
          <div className="rounded-3xl border-[3px] border-black bg-[#4AA3FF] p-8">
            <h3 className="font-heading text-[2rem] uppercase leading-[0.85] text-black sm:text-[2.5rem]">
              ALWAYS
              <br />
              <em>HERE</em>
            </h3>
            <p className="mt-3 max-w-xs text-[14px] text-black/60">
              Questions? We&apos;ve got you covered.
            </p>
            <div className="mt-6 flex flex-wrap gap-2">
              <Link
                href="/waitlist"
                className="inline-flex h-11 items-center gap-2 rounded-full bg-black px-6 text-[11px] font-bold uppercase tracking-widest text-white"
              >
                Creator Waitlist
              </Link>
              <Link
                href="/help"
                className="inline-flex h-11 items-center rounded-full border-[3px] border-black px-6 text-[11px] font-bold uppercase tracking-widest text-black"
              >
                Help
              </Link>
            </div>
          </div>
        </div>

        {/* Marquee */}
        <div className="mt-4 overflow-hidden rounded-3xl border-[3px] border-black bg-[#28D17C] py-4">
          <div className="marquee-track flex whitespace-nowrap">
            {[...Array(8)].map((_, i) => (
              <span key={i} className="mx-6 font-heading text-[3rem] uppercase tracking-tight text-black sm:text-[4rem]">
                CREATORSTAYS
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
