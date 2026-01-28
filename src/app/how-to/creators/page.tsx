import Link from "next/link"

const steps = [
  {
    num: "01",
    title: "JOIN",
    subtitle: "WAITLIST",
    content: "Submit your social profiles and niche. We review applications within 5-7 days. Priority goes to travel, lifestyle, and hospitality creators with engaged audiences.",
  },
  {
    num: "02",
    title: "COMPLETE",
    subtitle: "PROFILE",
    content: "Add your rates, portfolio, and connect your social accounts. The more complete your profile, the more likely hosts will reach out.",
  },
  {
    num: "03",
    title: "RECEIVE",
    subtitle: "OFFERS",
    content: "Hosts browse and send collaboration offers. You'll see their property, budget, deliverables, and timeline. Accept, counter, or decline.",
  },
  {
    num: "04",
    title: "CREATE",
    subtitle: "CONTENT",
    content: "Post content featuring the property with your unique tracked link. Be authentic—your audience trusts you. Good content performs better for everyone.",
  },
  {
    num: "05",
    title: "SUBMIT",
    subtitle: "DELIVERABLES",
    content: "Upload proof of your posts. The host reviews and approves your work. Most hosts approve within 24 hours.",
  },
  {
    num: "06",
    title: "GET",
    subtitle: "PAID",
    content: "Once approved, payment processes through Stripe. Funds arrive in 5-7 business days. We handle tax forms at year-end.",
  },
]

const tips = [
  {
    title: "ENGAGEMENT > FOLLOWERS",
    content: "A focused niche audience often commands higher rates. Don't undervalue yourself based on follower count alone.",
  },
  {
    title: "BE AUTHENTIC",
    content: "Your audience follows you for you. Overly promotional content underperforms. Showcase properties you'd actually stay at.",
  },
  {
    title: "RESPOND FAST",
    content: "Hosts send offers to multiple creators. Quick responses land more collaborations.",
  },
  {
    title: "BUILD RELATIONSHIPS",
    content: "Great hosts come back. Deliver quality work and you'll get repeat offers without competing.",
  },
]

export default function HowToCreatorsPage() {
  return (
    <div className="min-h-screen bg-black px-3 pb-8 pt-20 lg:px-4">
      <div className="mx-auto max-w-5xl">
        
        {/* Hero Block */}
        <div className="block-hover rounded-2xl border-[3px] border-black bg-[#4AA3FF] p-6">
          <p className="text-[10px] font-black uppercase tracking-wider text-black">
            Guide for Content Creators
          </p>
          <h1 className="mt-2 font-heading text-[2.5rem] leading-[0.85] tracking-[-0.03em] sm:text-[3.5rem]" style={{ fontWeight: 900 }}>
            <span className="block text-black">HOW TO:</span>
            <span className="block text-black" style={{ fontWeight: 400 }}>CREATORS</span>
          </h1>
          <p className="mt-4 max-w-lg text-[15px] font-medium leading-snug text-black">
            Get paid to showcase vacation rentals. Set your rates, receive offers, and earn money doing what you love.
          </p>
        </div>

        {/* Quick Links */}
        <div className="mt-3 grid gap-2 sm:grid-cols-2">
          <Link 
            href="/waitlist"
            className="block-hover flex items-center justify-between rounded-xl border-[3px] border-black bg-[#28D17C] p-4 transition-transform duration-200"
          >
            <span className="text-[12px] font-black uppercase tracking-wider text-black">
              Join Waitlist
            </span>
            <span className="text-black">→</span>
          </Link>
          <Link 
            href="/pricing"
            className="block-hover flex items-center justify-between rounded-xl border-[3px] border-black bg-white p-4 transition-transform duration-200"
          >
            <span className="text-[12px] font-black uppercase tracking-wider text-black">
              View Fees
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
                className="block-hover rounded-2xl border-[3px] border-black bg-[#FFD84A] p-4 transition-transform duration-200"
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
        <div className="mt-8 rounded-2xl border-[3px] border-black bg-[#FF7A00] p-5">
          <h3 className="font-heading text-[1.25rem] text-black" style={{ fontWeight: 900 }}>
            READY TO EARN?
          </h3>
          <p className="mt-2 text-[13px] font-medium text-black">
            Join the waitlist. We're onboarding creators in batches.
          </p>
          <Link 
            href="/waitlist"
            className="mt-4 inline-flex h-10 items-center gap-2 rounded-full bg-black px-5 text-[11px] font-black uppercase tracking-wider text-white transition-transform duration-200 hover:-translate-y-0.5"
          >
            Join Waitlist →
          </Link>
        </div>

      </div>
    </div>
  )
}
