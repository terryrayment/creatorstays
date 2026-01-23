import Link from "next/link"

const steps = [
  {
    num: "01",
    title: "CREATE",
    subtitle: "ACCOUNT",
    content: "Sign up with your email. No credit card required to get started. You'll set up payment when you're ready to pay a creator.",
  },
  {
    num: "02",
    title: "ADD YOUR",
    subtitle: "LISTING",
    content: "Upload photos, fill in your property details, and connect your availability calendar. Your listing is ready in minutes.",
  },
  {
    num: "03",
    title: "BROWSE",
    subtitle: "CREATORS",
    content: "Search by niche (travel, lifestyle, luxury), platform (Instagram, TikTok, YouTube), and audience size. Check portfolios and engagement rates.",
  },
  {
    num: "04",
    title: "SEND",
    subtitle: "OFFERS",
    content: "Set your budget, deliverables (posts, stories, reels), and timeline. Be specific about what you want. Clear expectations lead to better results.",
  },
  {
    num: "05",
    title: "TRACK",
    subtitle: "RESULTS",
    content: "Watch clicks and visitors in real time. See which creators drive the most traffic. Use data to optimize future campaigns.",
  },
  {
    num: "06",
    title: "PAY &",
    subtitle: "REPEAT",
    content: "Approve completed work and pay through the platform. We handle tax forms. Build relationships with top performers for ongoing collaborations.",
  },
]

const tips = [
  {
    title: "QUALITY > QUANTITY",
    content: "One well-matched creator with an engaged audience often outperforms five random invites. Take time to review portfolios.",
  },
  {
    title: "BE SPECIFIC",
    content: "\"2 Reels + 3 Stories\" is better than \"some posts.\" Clear deliverables prevent misunderstandings.",
  },
  {
    title: "CHECK ENGAGEMENT",
    content: "A 10K account with 5% engagement often beats a 100K account with 0.5%. Look beyond follower count.",
  },
  {
    title: "RESPOND QUICKLY",
    content: "Creators juggle multiple offers. Quick responses show you're serious and land the best talent.",
  },
]

export default function HowToHostsPage() {
  return (
    <div className="min-h-screen bg-black px-3 pb-8 pt-20 lg:px-4">
      <div className="mx-auto max-w-5xl">
        
        {/* Hero Block */}
        <div className="block-hover rounded-2xl border-[3px] border-black bg-[#FFD84A] p-6">
          <p className="text-[10px] font-black uppercase tracking-wider text-black">
            Guide for Property Owners
          </p>
          <h1 className="mt-2 font-heading text-[2.5rem] leading-[0.85] tracking-[-0.03em] sm:text-[3.5rem]" style={{ fontWeight: 900 }}>
            <span className="block text-black">HOW TO:</span>
            <span className="block text-black" style={{ fontWeight: 400 }}>HOSTS</span>
          </h1>
          <p className="mt-4 max-w-lg text-[15px] font-medium leading-snug text-black">
            Everything you need to list your property, find creators, and drive bookings through creator marketing.
          </p>
        </div>

        {/* Quick Links */}
        <div className="mt-3 grid gap-2 sm:grid-cols-2">
          <Link 
            href="/hosts"
            className="block-hover flex items-center justify-between rounded-xl border-[3px] border-black bg-[#28D17C] p-4 transition-transform duration-200"
          >
            <span className="text-[12px] font-black uppercase tracking-wider text-black">
              Start Now
            </span>
            <span className="text-black">→</span>
          </Link>
          <Link 
            href="/creators"
            className="block-hover flex items-center justify-between rounded-xl border-[3px] border-black bg-white p-4 transition-transform duration-200"
          >
            <span className="text-[12px] font-black uppercase tracking-wider text-black">
              Browse Creators
            </span>
            <span className="text-black">→</span>
          </Link>
        </div>

        {/* Steps */}
        <div className="mt-8">
          <p className="mb-3 text-[10px] font-black uppercase tracking-wider text-white">
            Step by Step
          </p>
          <div className="space-y-2">
            {steps.map((step) => (
              <div
                key={step.num}
                className="block-hover rounded-2xl border-[3px] border-black bg-white p-4 transition-transform duration-200"
              >
                <div className="flex gap-4">
                  <span className="font-heading text-[2rem] leading-none text-black" style={{ fontWeight: 900 }}>
                    {step.num}
                  </span>
                  <div>
                    <h2 className="font-heading text-[1.25rem] leading-[0.85] tracking-[-0.02em]">
                      <span className="text-black" style={{ fontWeight: 900 }}>{step.title} </span>
                      <span className="text-black" style={{ fontWeight: 400 }}>{step.subtitle}</span>
                    </h2>
                    <p className="mt-2 text-[13px] font-medium leading-snug text-black">
                      {step.content}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Tips */}
        <div className="mt-8">
          <p className="mb-3 text-[10px] font-black uppercase tracking-wider text-white">
            Pro Tips
          </p>
          <div className="grid gap-2 sm:grid-cols-2">
            {tips.map((tip, i) => (
              <div
                key={i}
                className="block-hover rounded-2xl border-[3px] border-black bg-[#4AA3FF] p-4 transition-transform duration-200"
              >
                <h3 className="font-heading text-[1rem] text-black" style={{ fontWeight: 900 }}>
                  {tip.title}
                </h3>
                <p className="mt-2 text-[13px] font-medium leading-snug text-black">
                  {tip.content}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom CTA */}
        <div className="mt-8 rounded-2xl border-[3px] border-black bg-[#D7B6FF] p-5">
          <h3 className="font-heading text-[1.25rem] text-black" style={{ fontWeight: 900 }}>
            READY TO LIST YOUR PROPERTY?
          </h3>
          <p className="mt-2 text-[13px] font-medium text-black">
            It takes 60 seconds. No credit card required to start.
          </p>
          <Link 
            href="/hosts"
            className="mt-4 inline-flex h-10 items-center gap-2 rounded-full bg-black px-5 text-[11px] font-black uppercase tracking-wider text-white transition-transform duration-200 hover:-translate-y-0.5"
          >
            Get Started →
          </Link>
        </div>

      </div>
    </div>
  )
}
