"use client"

import { useState } from "react"
import Link from "next/link"

// Help topics with expanded content
const helpTopics = [
  { 
    id: "01", 
    title: "Adding your property", 
    content: "Paste your Airbnb listing URL into the signup form. We automatically pull your photos, description, location, and pricing. Your listing goes live in under 60 seconds.",
    href: "/how-to/hosts"
  },
  { 
    id: "02", 
    title: "Finding creators", 
    content: "Browse our creator directory by niche, platform, and audience size. Filter by travel, lifestyle, or luxury content. View their past work before reaching out.",
  },
  { 
    id: "03", 
    title: "Sending collaboration offers", 
    content: "Set your budget, deliverables, and timeline. Creators receive your offer via email and can accept, counter, or decline. No cold DMs required.",
  },
  { 
    id: "04", 
    title: "How tracked links work", 
    content: "Every creator gets a unique link to your listing. When they post content, we track every click. You see real-time analytics: clicks, unique visitors, and referral sources.",
  },
  { 
    id: "05", 
    title: "Understanding analytics", 
    content: "Your dashboard shows total clicks, unique visitors, and traffic over time. We track which creators drive the most traffic so you can optimize future campaigns.",
  },
  { 
    id: "06", 
    title: "Paying creators", 
    content: "Pay creators through Stripe after approving their work. We handle the transaction, contracts, and 1099 tax documents at year-end. Clean paperwork, every time.",
  },
  { 
    id: "07", 
    title: "Creator waitlist", 
    content: "We're onboarding creators in batches. Join the waitlist to get early access. We'll notify you when spots open. Priority goes to travel and lifestyle niches.",
    href: "/waitlist"
  },
  { 
    id: "08", 
    title: "Platform fees", 
    content: "Free to join. We charge 15% on successful collaborations—split between host and creator. No upfront costs, no subscriptions. You only pay when it works.",
    href: "/pricing"
  },
]

// FAQ items
const faqItems = [
  { q: "Can I use VRBO or other platforms?", a: "Currently we only support Airbnb listings. More platforms coming soon." },
  { q: "How do I get paid as a creator?", a: "Connect your bank account via Stripe. Payouts process within 5 business days after campaign completion." },
  { q: "What if a creator doesn't deliver?", a: "You only pay after approving completed work. Disputes are handled by our support team." },
  { q: "Can I track actual Airbnb bookings?", a: "We track link clicks and unique visitors, not Airbnb bookings directly. Airbnb doesn't share that data." },
  { q: "How long until my listing appears?", a: "Listings go live immediately after URL validation. No approval wait." },
  { q: "Can I work with multiple creators?", a: "Yes. Invite as many creators as you want. Each gets a unique tracked link." },
]

function HelpTopic({ topic, isOpen, onToggle }: { 
  topic: typeof helpTopics[0]
  isOpen: boolean
  onToggle: () => void 
}) {
  return (
    <div 
      className="block-hover rounded-2xl border-[3px] border-black bg-white p-4 transition-transform duration-200"
    >
      <button 
        onClick={onToggle}
        className="flex w-full items-start justify-between text-left"
      >
        <div className="flex gap-3">
          <span className="font-heading text-[1.5rem] text-black" style={{ fontWeight: 900 }}>
            {topic.id}
          </span>
          <div>
            <h3 className="font-heading text-[1.25rem] text-black" style={{ fontWeight: 700 }}>
              {topic.title}
            </h3>
          </div>
        </div>
        <svg 
          className={`h-5 w-5 flex-shrink-0 text-black transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`} 
          viewBox="0 0 24 24" 
          fill="none" 
          stroke="currentColor" 
          strokeWidth="3"
        >
          <path d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      
      <div className={`overflow-hidden transition-all duration-200 ${isOpen ? "mt-3 max-h-40" : "max-h-0"}`}>
        <p className="text-[13px] font-medium leading-relaxed text-black">
          {topic.content}
        </p>
        {topic.href && (
          <Link 
            href={topic.href}
            className="mt-3 inline-flex items-center gap-1 text-[11px] font-bold uppercase tracking-wider text-black hover:underline"
          >
            Learn more →
          </Link>
        )}
      </div>
    </div>
  )
}

function FAQItem({ item, isOpen, onToggle }: { 
  item: typeof faqItems[0]
  isOpen: boolean
  onToggle: () => void 
}) {
  return (
    <div className="block-hover rounded-xl border-[3px] border-black bg-white p-3 transition-transform duration-200">
      <button 
        onClick={onToggle}
        className="flex w-full items-center justify-between text-left"
      >
        <span className="text-[14px] font-bold text-black">{item.q}</span>
        <svg 
          className={`h-4 w-4 flex-shrink-0 text-black transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`} 
          viewBox="0 0 24 24" 
          fill="none" 
          stroke="currentColor" 
          strokeWidth="3"
        >
          <path d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      {isOpen && (
        <p className="mt-2 text-[13px] font-medium leading-relaxed text-black">
          {item.a}
        </p>
      )}
    </div>
  )
}

export default function HelpPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [openTopic, setOpenTopic] = useState<string | null>("01")
  const [openFaq, setOpenFaq] = useState<number | null>(null)

  // Filter topics based on search
  const filteredTopics = helpTopics.filter(topic => 
    topic.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    topic.content.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const filteredFaqs = faqItems.filter(faq =>
    faq.q.toLowerCase().includes(searchQuery.toLowerCase()) ||
    faq.a.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="min-h-screen bg-black px-3 pb-8 pt-20 lg:px-4">
      <div className="mx-auto max-w-4xl">
        
        {/* Hero Block */}
        <div className="block-hover rounded-2xl border-[3px] border-black bg-[#4AA3FF] p-6">
          <h1 className="font-heading text-[2.5rem] leading-[0.85] tracking-[-0.03em] sm:text-[3.5rem]" style={{ fontWeight: 900 }}>
            <span className="block text-black">HELP</span>
            <span className="block text-black" style={{ fontWeight: 400 }}>CENTER</span>
          </h1>
          <p className="mt-3 text-[14px] font-medium text-black">
            Everything you need to get started and grow.
          </p>
        </div>

        {/* Quick Links Row */}
        <div className="mt-3 grid gap-2 sm:grid-cols-3">
          <Link 
            href="/how-to/hosts"
            className="block-hover flex items-center justify-between rounded-xl border-[3px] border-black bg-[#FFD84A] p-4 transition-transform duration-200"
          >
            <span className="text-[12px] font-black uppercase tracking-wider text-black">
              How To: Hosts
            </span>
            <span className="text-black">→</span>
          </Link>
          <Link 
            href="/how-to/creators"
            className="block-hover flex items-center justify-between rounded-xl border-[3px] border-black bg-[#D7B6FF] p-4 transition-transform duration-200"
          >
            <span className="text-[12px] font-black uppercase tracking-wider text-black">
              How To: Creators
            </span>
            <span className="text-black">→</span>
          </Link>
          <a 
            href="mailto:support@creatorstays.com"
            className="block-hover flex items-center justify-between rounded-xl border-[3px] border-black bg-[#28D17C] p-4 transition-transform duration-200"
          >
            <span className="text-[12px] font-black uppercase tracking-wider text-black">
              Message Support
            </span>
            <span className="text-black">→</span>
          </a>
        </div>

        {/* Search Block */}
        <div className="mt-6 rounded-2xl border-[3px] border-black bg-white p-4">
          <div className="flex gap-2">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search help topics..."
              className="flex-1 rounded-full border-[3px] border-black px-4 py-2 text-[14px] font-medium text-black placeholder:text-black focus:outline-none"
            />
            <button className="rounded-full border-[3px] border-black bg-black px-5 py-2 text-[12px] font-black uppercase tracking-wider text-white transition-transform duration-200 hover:-translate-y-0.5">
              Search
            </button>
          </div>
        </div>

        {/* Help Topics */}
        <div className="mt-8">
          <p className="mb-3 text-[10px] font-black uppercase tracking-wider text-white">
            Topics
          </p>
          <div className="space-y-2">
            {filteredTopics.map((topic) => (
              <HelpTopic 
                key={topic.id} 
                topic={topic} 
                isOpen={openTopic === topic.id}
                onToggle={() => setOpenTopic(openTopic === topic.id ? null : topic.id)}
              />
            ))}
            {filteredTopics.length === 0 && (
              <div className="rounded-2xl border-[3px] border-black bg-white p-4">
                <p className="text-[14px] font-medium text-black">No topics found matching "{searchQuery}"</p>
              </div>
            )}
          </div>
        </div>

        {/* FAQ Section */}
        <div className="mt-10">
          <p className="mb-3 text-[10px] font-black uppercase tracking-wider text-white">
            Frequently Asked
          </p>
          <div className="space-y-2">
            {filteredFaqs.map((faq, i) => (
              <FAQItem 
                key={i} 
                item={faq} 
                isOpen={openFaq === i}
                onToggle={() => setOpenFaq(openFaq === i ? null : i)}
              />
            ))}
            {filteredFaqs.length === 0 && (
              <div className="rounded-xl border-[3px] border-black bg-white p-3">
                <p className="text-[14px] font-medium text-black">No FAQs found matching "{searchQuery}"</p>
              </div>
            )}
          </div>
        </div>

        {/* Contact Block */}
        <div className="mt-10 grid gap-2 sm:grid-cols-2">
          <div className="block-hover rounded-2xl border-[3px] border-black bg-[#FFD84A] p-5">
            <h3 className="font-heading text-[1.25rem] text-black" style={{ fontWeight: 900 }}>
              STILL STUCK?
            </h3>
            <p className="mt-2 text-[13px] font-medium text-black">
              We respond to every message within 24 hours.
            </p>
            <a 
              href="mailto:support@creatorstays.com"
              className="mt-4 inline-flex h-9 items-center gap-2 rounded-full bg-black px-4 text-[10px] font-black uppercase tracking-wider text-white transition-transform duration-200 hover:-translate-y-0.5"
            >
              Email Support
              <span>→</span>
            </a>
          </div>
          <div className="block-hover rounded-2xl border-[3px] border-black bg-white p-5">
            <h3 className="font-heading text-[1.25rem] text-black" style={{ fontWeight: 900 }}>
              NEW HERE?
            </h3>
            <p className="mt-2 text-[13px] font-medium text-black">
              Start with the basics. Learn how the platform works.
            </p>
            <Link 
              href="/how-it-works"
              className="mt-4 inline-flex h-9 items-center gap-2 rounded-full border-[3px] border-black bg-white px-4 text-[10px] font-black uppercase tracking-wider text-black transition-transform duration-200 hover:-translate-y-0.5"
            >
              How It Works
              <span>→</span>
            </Link>
          </div>
        </div>

      </div>
    </div>
  )
}
