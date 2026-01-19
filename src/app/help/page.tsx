"use client"

import { useState, useMemo } from "react"
import Link from "next/link"
import { Container } from "@/components/layout/container"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Navbar } from "@/components/navigation/navbar"
import { Footer } from "@/components/navigation/footer"

// Types
type Role = "all" | "host" | "creator"

interface HelpArticle {
  id: string
  role: Role
  title: string
  summary: string
  body: string
  keywords: string[]
}

interface FAQItem {
  id: string
  role: Role
  category: string
  question: string
  answer: string
  keywords: string[]
}

// Help Articles Data
const helpArticles: HelpArticle[] = [
  {
    id: "host-signup",
    role: "host",
    title: "Host signup and getting started",
    summary: "How to create your host account and list your first property.",
    body: "To get started as a host, click 'Host Signup' in the navigation. You'll need to provide basic information about yourself and your property. We currently only support Airbnb listings—paste your Airbnb URL and we'll pull listing details automatically. Once your listing is live, you can browse creators and send collaboration offers.",
    keywords: ["signup", "register", "account", "start", "begin", "new host"],
  },
  {
    id: "airbnb-url",
    role: "host",
    title: "Airbnb listing URL format",
    summary: "The correct format for your Airbnb listing URL.",
    body: "Your Airbnb URL should look like: airbnb.com/rooms/123456 or airbnb.com/h/your-listing-name. We don't support Airbnb Experiences, Luxe listings, or URLs from other platforms like VRBO yet. Make sure you're copying the URL from your actual listing page, not from search results or your hosting dashboard.",
    keywords: ["url", "link", "format", "airbnb", "listing", "rooms", "address"],
  },
  {
    id: "prefill-issues",
    role: "host",
    title: "Listing prefill not working",
    summary: "What to do if automatic listing details don't load.",
    body: "If the auto-fill isn't working, try these steps: 1) Make sure the URL is in the correct format (airbnb.com/rooms/...). 2) Check that your listing is publicly visible, not unlisted. 3) Try a different browser or clear cookies. 4) If it still doesn't work, you can enter your property details manually. Some Airbnb pages block automated fetching—this is a known limitation.",
    keywords: ["prefill", "autofill", "not working", "broken", "error", "manual"],
  },
  {
    id: "finding-creators",
    role: "host",
    title: "Finding and messaging creators",
    summary: "How to browse creators and send collaboration offers.",
    body: "From your host dashboard, you can browse our creator directory filtered by niche (travel, lifestyle, photography, etc.) and audience size. When you find a creator you'd like to work with, click 'Send Offer' to propose a collaboration. You'll specify the deal type (flat fee, percentage, or post-for-stay), deliverables, and dates. Creators will be notified and can accept or decline.",
    keywords: ["find", "search", "browse", "creators", "message", "contact", "offer"],
  },
  {
    id: "affiliate-links-host",
    role: "host",
    title: "Understanding affiliate links",
    summary: "How affiliate links work and what they track.",
    body: "Each collaboration generates a unique affiliate link for the creator to share. When someone clicks the link, we track the click, unique visitors, and revisit rates. Important: We can only track clicks to your Airbnb listing—we cannot detect or verify actual bookings made on Airbnb. Payment terms should be agreed upon separately, typically based on content delivery rather than booking performance.",
    keywords: ["affiliate", "link", "tracking", "clicks", "attribution", "referral"],
  },
  {
    id: "payment-fees-host",
    role: "host",
    title: "Payments and platform fees (Hosts)",
    summary: "Understanding the fee structure for hosts.",
    body: "CreatorStays charges hosts a 15% platform fee on top of the agreed creator payment. For example, if you agree to pay a creator $500, you'll pay $575 total ($500 + $75 fee). Creators also pay a 15% fee from their end, so the platform earns 30% total. Payments are processed through Stripe. You'll only be charged after approving completed work.",
    keywords: ["payment", "fee", "cost", "price", "stripe", "charge", "15%"],
  },
  {
    id: "creator-waitlist",
    role: "creator",
    title: "Joining the creator waitlist",
    summary: "How to sign up for early creator access.",
    body: "Creators can join our waitlist at creatorstays.com/waitlist. Provide your email, social handles, and content niche. We're rolling out access in waves, prioritizing creators with engaged audiences in travel, lifestyle, and photography niches. Once invited, you'll create a full profile and can start receiving offers from hosts.",
    keywords: ["waitlist", "signup", "join", "early access", "invite", "register"],
  },
  {
    id: "affiliate-rate",
    role: "creator",
    title: "Setting your affiliate rate",
    summary: "How to set your rates and approve collaboration requests.",
    body: "In your creator profile, you can set your deal preferences: minimum flat fee, minimum percentage, and whether you're open to post-for-stay arrangements. When a host sends an offer, you'll see the full terms and can accept, decline, or counter. Once accepted, you'll receive your unique affiliate link to share with your audience.",
    keywords: ["rate", "price", "fee", "negotiate", "accept", "decline", "offer"],
  },
  {
    id: "connect-social",
    role: "creator",
    title: "Connecting Instagram, TikTok, YouTube",
    summary: "What connecting your social accounts means.",
    body: "Connecting your social accounts helps hosts find you and verify your audience. Instagram connects via secure OAuth through Meta—we never see your password. TikTok and YouTube are currently manual (paste your profile URL). We'll sync follower counts automatically after the beta period. Connected accounts appear on your public creator profile.",
    keywords: ["instagram", "tiktok", "youtube", "connect", "social", "oauth", "link"],
  },
  {
    id: "analytics-creator",
    role: "creator",
    title: "Understanding your analytics",
    summary: "How to read your click and visitor data.",
    body: "Your creator dashboard shows analytics for each campaign: total clicks, unique visitors, and revisit rate. The attribution window is typically 30 days—clicks within this window are attributed to your link. Note: We track clicks only; we cannot see bookings or conversions on Airbnb. Use these metrics to demonstrate your value to hosts.",
    keywords: ["analytics", "stats", "clicks", "visitors", "data", "metrics", "attribution"],
  },
  {
    id: "account-access",
    role: "all",
    title: "Account access and login",
    summary: "How to access your account and reset your password.",
    body: "You can log in at creatorstays.com with your email. If you've forgotten your password, use the 'Forgot password' link to receive a reset email. For security, reset links expire after 24 hours. If you're having trouble accessing your account, contact support with your registered email address.",
    keywords: ["login", "password", "access", "forgot", "reset", "email", "account"],
  },
  {
    id: "privacy-data",
    role: "all",
    title: "Privacy and data handling",
    summary: "How we handle your personal information.",
    body: "We collect only the data necessary to operate the platform: email, name, social handles, and listing information. We never sell your data to third parties. Click tracking is anonymized (we hash IP addresses). You can request data deletion at any time by contacting support. See our full privacy policy for details.",
    keywords: ["privacy", "data", "personal", "information", "gdpr", "delete"],
  },
  {
    id: "report-abuse",
    role: "all",
    title: "Reporting abuse or fraud",
    summary: "How to report suspicious activity or fake clicks.",
    body: "If you suspect click fraud, spam, or abusive behavior, report it immediately through the 'Message support' form below. Include the collaboration ID, dates, and any evidence. We investigate all reports and may suspend accounts violating our terms. Legitimate traffic patterns are protected; fraudulent activity results in account termination.",
    keywords: ["report", "abuse", "fraud", "fake", "spam", "suspicious", "clicks"],
  },
]

// FAQ Data
const faqItems: FAQItem[] = [
  { id: "faq-1", role: "host", category: "Hosts", question: "How much does it cost to list my property?", answer: "Listing your property is free. You only pay when you approve a collaboration—15% platform fee on top of the creator payment.", keywords: ["cost", "free", "fee", "price"] },
  { id: "faq-2", role: "host", category: "Hosts", question: "Can I list properties from VRBO or other platforms?", answer: "Currently, we only support Airbnb listings. VRBO and direct booking support is on our roadmap.", keywords: ["vrbo", "booking.com", "other", "platform"] },
  { id: "faq-3", role: "host", category: "Hosts", question: "How do I know if a creator is legitimate?", answer: "Creator profiles show verified follower counts, engagement rates, and past collaboration history. We verify social connections via OAuth where possible.", keywords: ["verify", "legitimate", "real", "scam", "trust"] },
  { id: "faq-4", role: "host", category: "Hosts", question: "Can I negotiate the rate a creator proposes?", answer: "Yes! You can send a counter-offer with different terms. Many successful collaborations involve some negotiation.", keywords: ["negotiate", "counter", "offer", "rate"] },
  { id: "faq-5", role: "host", category: "Hosts", question: "What deliverables can I request?", answer: "Common deliverables include Instagram Reels, TikTok videos, YouTube vlogs, Stories, and feed posts. Specify exactly what you want in your offer.", keywords: ["deliverables", "content", "reels", "posts", "videos"] },
  { id: "faq-6", role: "host", category: "Hosts", question: "How long should I give creators to post content?", answer: "Most collaborations allow 2-4 weeks after the stay for content delivery. Complex video content may need more time.", keywords: ["timeline", "deadline", "when", "post"] },
  { id: "faq-7", role: "creator", category: "Creators", question: "How do I get invited from the waitlist?", answer: "We prioritize creators with engaged audiences in travel, lifestyle, and photography niches. Having connected social accounts and a complete profile helps.", keywords: ["waitlist", "invite", "access", "when"] },
  { id: "faq-8", role: "creator", category: "Creators", question: "What's a typical collaboration rate?", answer: "Rates vary widely: $200-$500 for micro-influencers, $500-$2000 for mid-tier, and $2000+ for larger accounts. Post-for-stay is also common.", keywords: ["rate", "price", "how much", "pay"] },
  { id: "faq-9", role: "creator", category: "Creators", question: "Can I work with multiple hosts at once?", answer: "Yes! You can have multiple active collaborations. Just ensure you can deliver quality content for each.", keywords: ["multiple", "many", "hosts", "same time"] },
  { id: "faq-10", role: "creator", category: "Creators", question: "What if I need to cancel a collaboration?", answer: "Contact the host immediately. Cancellations before content is due are usually acceptable; late cancellations may affect your profile standing.", keywords: ["cancel", "back out", "change mind"] },
  { id: "faq-11", role: "creator", category: "Creators", question: "Do I need a minimum follower count?", answer: "We don't have a strict minimum, but most hosts look for creators with at least 5,000-10,000 engaged followers.", keywords: ["minimum", "followers", "small", "micro"] },
  { id: "faq-12", role: "creator", category: "Creators", question: "How do I improve my creator profile?", answer: "Complete all fields, connect all social accounts, add portfolio links, and set clear rate preferences. Active profiles rank higher in search.", keywords: ["profile", "improve", "better", "ranking"] },
  { id: "faq-13", role: "all", category: "Payments & Fees", question: "When do creators get paid?", answer: "Creators are paid after the host approves the delivered content. Funds are released to your connected Stripe account.", keywords: ["paid", "when", "payment", "receive"] },
  { id: "faq-14", role: "all", category: "Payments & Fees", question: "What payment methods are supported?", answer: "We process all payments through Stripe. Hosts can pay via credit card; creators receive payouts to bank accounts.", keywords: ["payment", "method", "credit card", "bank"] },
  { id: "faq-15", role: "all", category: "Payments & Fees", question: "Are there any hidden fees?", answer: "No hidden fees. Hosts pay 15% on top of creator payment; creators pay 15% from their payment. That's it.", keywords: ["hidden", "fees", "extra", "surprise"] },
  { id: "faq-16", role: "all", category: "Payments & Fees", question: "Will I receive a 1099 tax form?", answer: "US-based creators earning $600+ in a calendar year will receive a 1099-NEC via Stripe for tax reporting.", keywords: ["1099", "tax", "form", "irs"] },
  { id: "faq-17", role: "all", category: "Payments & Fees", question: "Can I get a refund if content isn't delivered?", answer: "Yes. If a creator doesn't deliver agreed content, contact support. We'll mediate and process refunds when appropriate.", keywords: ["refund", "money back", "not delivered"] },
  { id: "faq-18", role: "all", category: "Links & Analytics", question: "How long is the attribution window?", answer: "The default attribution window is 30 days. Clicks within this window after a user first clicks your link are counted.", keywords: ["attribution", "window", "30 days", "how long"] },
  { id: "faq-19", role: "all", category: "Links & Analytics", question: "Can you track actual bookings on Airbnb?", answer: "No. We can only track clicks to your Airbnb listing. We cannot see or verify bookings made on Airbnb's platform.", keywords: ["bookings", "track", "airbnb", "conversion"] },
  { id: "faq-20", role: "all", category: "Links & Analytics", question: "What's the difference between clicks and unique visitors?", answer: "Clicks count every link click. Unique visitors count individual people (based on cookies). One person clicking 5 times = 5 clicks, 1 unique.", keywords: ["clicks", "unique", "visitors", "difference"] },
  { id: "faq-21", role: "all", category: "Links & Analytics", question: "How do I share my affiliate link?", answer: "Copy your unique link from the campaign page and share it in your bio, Stories, captions, or anywhere your audience will see it.", keywords: ["share", "link", "where", "how"] },
  { id: "faq-22", role: "all", category: "Links & Analytics", question: "Can I use link shorteners with my affiliate link?", answer: "Yes, but we recommend using our link directly for accurate tracking. Some shorteners may interfere with cookie attribution.", keywords: ["shortener", "bitly", "short link"] },
  { id: "faq-23", role: "all", category: "Social Connections", question: "Is connecting my Instagram safe?", answer: "Yes. We use Meta's official OAuth—we never see your password. We only access public profile info and follower counts.", keywords: ["safe", "secure", "instagram", "password"] },
  { id: "faq-24", role: "all", category: "Social Connections", question: "Why can't I connect TikTok via OAuth?", answer: "TikTok's API access is limited. For now, paste your TikTok profile URL manually. We're working on official integration.", keywords: ["tiktok", "oauth", "connect", "manual"] },
  { id: "faq-25", role: "all", category: "Social Connections", question: "How often do follower counts update?", answer: "During beta, counts are captured at connection time. Automatic syncing will be available after beta launch.", keywords: ["update", "sync", "follower", "count"] },
  { id: "faq-26", role: "all", category: "Social Connections", question: "Can I disconnect a social account?", answer: "Yes. Go to your creator dashboard, find the connected account, and click 'Disconnect'. This won't affect past collaborations.", keywords: ["disconnect", "remove", "unlink"] },
  { id: "faq-27", role: "all", category: "Social Connections", question: "Do I need to connect all my social accounts?", answer: "No, but connecting more accounts helps hosts find you and verify your audience. At minimum, connect your primary platform.", keywords: ["all", "required", "must", "need"] },
]

// Search helper
function matchesSearch(text: string, query: string): boolean {
  return text.toLowerCase().includes(query.toLowerCase())
}

function filterContent<T extends { role: Role; keywords: string[] }>(
  items: T[],
  query: string,
  roleFilter: Role,
  getSearchableText: (item: T) => string
): T[] {
  return items.filter(item => {
    if (roleFilter !== "all" && item.role !== "all" && item.role !== roleFilter) return false
    if (query.trim()) {
      const searchText = getSearchableText(item) + " " + item.keywords.join(" ")
      return matchesSearch(searchText, query)
    }
    return true
  })
}

// Components
function RoleTabs({ value, onChange }: { value: Role; onChange: (r: Role) => void }) {
  const tabs: { value: Role; label: string }[] = [
    { value: "all", label: "All" },
    { value: "host", label: "Hosts" },
    { value: "creator", label: "Creators" },
  ]
  return (
    <div className="flex rounded-full border border-foreground/10 bg-foreground/[0.02] p-1">
      {tabs.map(tab => (
        <button
          key={tab.value}
          onClick={() => onChange(tab.value)}
          className={`rounded-full px-4 py-1.5 text-xs font-medium transition-all ${
            value === tab.value ? "bg-white text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
          }`}
        >
          {tab.label}
        </button>
      ))}
    </div>
  )
}

function ArticleCard({ article, isExpanded, onToggle }: { article: HelpArticle; isExpanded: boolean; onToggle: () => void }) {
  return (
    <div className="rounded-xl border border-foreground/5 bg-white/50 transition-all">
      <button onClick={onToggle} className="flex w-full items-start justify-between gap-4 p-4 text-left">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span className={`rounded-full px-2 py-0.5 text-[9px] font-semibold uppercase ${
              article.role === "host" ? "bg-primary/10 text-primary" : article.role === "creator" ? "bg-accent/10 text-accent" : "bg-foreground/5 text-muted-foreground"
            }`}>
              {article.role === "all" ? "General" : article.role}
            </span>
          </div>
          <h3 className="mt-1.5 text-sm font-semibold">{article.title}</h3>
          <p className="mt-0.5 text-[12px] text-muted-foreground">{article.summary}</p>
        </div>
        <span className={`mt-1 text-xs text-muted-foreground transition-transform ${isExpanded ? "rotate-180" : ""}`}>▼</span>
      </button>
      {isExpanded && (
        <div className="border-t border-foreground/5 px-4 pb-4 pt-3">
          <p className="text-[13px] leading-relaxed text-muted-foreground">{article.body}</p>
        </div>
      )}
    </div>
  )
}

function FAQAccordion({ item, isExpanded, onToggle }: { item: FAQItem; isExpanded: boolean; onToggle: () => void }) {
  return (
    <div className="border-b border-foreground/5 last:border-b-0">
      <button onClick={onToggle} className="flex w-full items-center justify-between gap-4 py-3 text-left">
        <span className="text-[13px] font-medium">{item.question}</span>
        <span className={`shrink-0 text-[10px] text-muted-foreground transition-transform ${isExpanded ? "rotate-180" : ""}`}>▼</span>
      </button>
      {isExpanded && <div className="pb-3"><p className="text-[12px] leading-relaxed text-muted-foreground">{item.answer}</p></div>}
    </div>
  )
}

function MessageForm() {
  const [formData, setFormData] = useState({ name: "", email: "", role: "creator", topic: "", subject: "", message: "" })
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitted(true)
    setTimeout(() => setSubmitted(false), 4000)
  }

  if (submitted) {
    return (
      <div className="rounded-xl bg-emerald-50 p-6 text-center">
        <span className="text-2xl">✓</span>
        <p className="mt-2 font-medium text-emerald-700">Message received</p>
        <p className="mt-1 text-[12px] text-emerald-600">We&apos;ll get back to you within 24 hours.</p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-1.5 block text-[11px] font-medium text-muted-foreground">Name</label>
          <Input value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} placeholder="Your name" required />
        </div>
        <div>
          <label className="mb-1.5 block text-[11px] font-medium text-muted-foreground">Email</label>
          <Input type="email" value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} placeholder="you@example.com" required />
        </div>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-1.5 block text-[11px] font-medium text-muted-foreground">I&apos;m a</label>
          <div className="flex gap-2">
            {["host", "creator"].map(r => (
              <button key={r} type="button" onClick={() => setFormData({ ...formData, role: r })}
                className={`flex-1 rounded-lg border px-3 py-2 text-xs font-medium transition-colors ${formData.role === r ? "border-primary bg-primary/10 text-primary" : "border-foreground/10 bg-white hover:bg-foreground/[0.02]"}`}>
                {r.charAt(0).toUpperCase() + r.slice(1)}
              </button>
            ))}
          </div>
        </div>
        <div>
          <label className="mb-1.5 block text-[11px] font-medium text-muted-foreground">Topic</label>
          <select value={formData.topic} onChange={e => setFormData({ ...formData, topic: e.target.value })}
            className="w-full rounded-lg border border-foreground/10 bg-white px-3 py-2 text-xs focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20" required>
            <option value="">Select topic</option>
            <option value="account">Account access</option>
            <option value="listing">Listings & URLs</option>
            <option value="creators">Finding creators</option>
            <option value="payments">Payments & fees</option>
            <option value="analytics">Links & analytics</option>
            <option value="social">Social connections</option>
            <option value="other">Other</option>
          </select>
        </div>
      </div>
      <div>
        <label className="mb-1.5 block text-[11px] font-medium text-muted-foreground">Subject</label>
        <Input value={formData.subject} onChange={e => setFormData({ ...formData, subject: e.target.value })} placeholder="Brief description of your issue" required />
      </div>
      <div>
        <label className="mb-1.5 block text-[11px] font-medium text-muted-foreground">Message</label>
        <textarea value={formData.message} onChange={e => setFormData({ ...formData, message: e.target.value })} placeholder="Describe your issue in detail..." rows={4} required
          className="w-full resize-none rounded-lg border border-foreground/10 bg-white px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20" />
      </div>
      <Button type="submit" className="w-full">Send Message</Button>
    </form>
  )
}

export default function HelpPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [roleFilter, setRoleFilter] = useState<Role>("all")
  const [expandedArticle, setExpandedArticle] = useState<string | null>(null)
  const [expandedFaq, setExpandedFaq] = useState<string | null>(null)

  const filteredArticles = useMemo(() => filterContent(helpArticles, searchQuery, roleFilter, a => `${a.title} ${a.summary} ${a.body}`), [searchQuery, roleFilter])
  const filteredFaqs = useMemo(() => filterContent(faqItems, searchQuery, roleFilter, f => `${f.question} ${f.answer}`), [searchQuery, roleFilter])
  const faqsByCategory = useMemo(() => {
    const grouped: Record<string, FAQItem[]> = {}
    filteredFaqs.forEach(faq => { if (!grouped[faq.category]) grouped[faq.category] = []; grouped[faq.category].push(faq) })
    return grouped
  }, [filteredFaqs])

  const hasResults = filteredArticles.length > 0 || filteredFaqs.length > 0
  const isSearching = searchQuery.trim().length > 0

  return (
    <div className="flex min-h-screen flex-col bg-[hsl(210,20%,98%)]">
      <Navbar />
      <main className="flex-1 py-10">
        <Container>
          <div className="mb-8 text-center">
            <h1 className="text-3xl font-semibold tracking-tight">Help Center</h1>
            <p className="mt-2 text-muted-foreground">Search answers, or message us.</p>
          </div>

          <div className="mx-auto mb-8 max-w-2xl space-y-4">
            <Input value={searchQuery} onChange={e => setSearchQuery(e.target.value)} placeholder="Search help topics…" className="w-full bg-white/70" />
            <div className="flex justify-center"><RoleTabs value={roleFilter} onChange={setRoleFilter} /></div>
          </div>

          {!hasResults && (
            <div className="mx-auto max-w-md rounded-2xl border border-foreground/5 bg-white/50 p-8 text-center">
              <p className="text-lg font-medium">No results found</p>
              <p className="mt-1 text-sm text-muted-foreground">Try a different search term or browse all topics.</p>
              <div className="mt-4 flex justify-center gap-3">
                <Button variant="outline" size="sm" onClick={() => { setSearchQuery(""); setRoleFilter("all") }}>Clear filters</Button>
                <Button size="sm" asChild><a href="#message-support">Message support</a></Button>
              </div>
            </div>
          )}

          {filteredArticles.length > 0 && (
            <div className="mb-12">
              <h2 className="mb-4 text-center text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/60">Help Articles {isSearching && `(${filteredArticles.length})`}</h2>
              <div className="mx-auto max-w-3xl space-y-2">
                {filteredArticles.map(article => (
                  <ArticleCard key={article.id} article={article} isExpanded={expandedArticle === article.id} onToggle={() => setExpandedArticle(expandedArticle === article.id ? null : article.id)} />
                ))}
              </div>
            </div>
          )}

          {Object.keys(faqsByCategory).length > 0 && (
            <div className="mb-12">
              <h2 className="mb-6 text-center text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/60">Frequently Asked Questions {isSearching && `(${filteredFaqs.length})`}</h2>
              <div className="mx-auto max-w-3xl space-y-6">
                {Object.entries(faqsByCategory).map(([category, items]) => (
                  <div key={category} className="rounded-xl border border-foreground/5 bg-white/50 p-4">
                    <h3 className="mb-2 text-xs font-semibold text-muted-foreground">{category}</h3>
                    <div>{items.map(faq => <FAQAccordion key={faq.id} item={faq} isExpanded={expandedFaq === faq.id} onToggle={() => setExpandedFaq(expandedFaq === faq.id ? null : faq.id)} />)}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div id="message-support" className="mx-auto max-w-xl">
            <div className="rounded-2xl border border-foreground/5 bg-white/50 p-6">
              <h2 className="text-lg font-semibold">Message Support</h2>
              <p className="mt-1 text-[12px] text-muted-foreground">Can&apos;t find your answer? We typically respond within 24 hours.</p>
              <div className="mt-6"><MessageForm /></div>
            </div>
          </div>

          <div className="mt-10 text-center">
            <p className="text-[11px] text-muted-foreground">
              <Link href="/how-it-works" className="text-primary hover:underline">How It Works</Link>{" · "}
              <Link href="/hosts" className="text-primary hover:underline">Host Signup</Link>{" · "}
              <Link href="/waitlist" className="text-primary hover:underline">Creator Waitlist</Link>
            </p>
          </div>
        </Container>
      </main>
      <Footer />
    </div>
  )
}
