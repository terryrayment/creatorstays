"use client"

import { useState } from "react"
import Link from "next/link"
import { ImageBlock, MARKETING_IMAGES } from "@/components/marketing/image-block"

// Select images for this page (seed based on page name)
const pageImages = (() => {
  const seed = 23 // unique seed for help page
  const shuffled = [...MARKETING_IMAGES]
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = (seed * (i + 1) * 19) % (i + 1)
    ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
  }
  return shuffled.slice(0, 2)
})()

// Expanded help topics with detailed content
const helpTopics = [
  { 
    id: "01", 
    title: "Adding your property", 
    content: `To add your property, paste your full Airbnb listing URL into the signup form. We automatically pull your photos, title, description, location, amenities, and nightly rate. Your listing goes live in under 60 seconds—no manual data entry required.

Make sure you're using the public URL (the one guests see), not the host dashboard URL. The format should look like: airbnb.com/rooms/123456789. If you see an error, double-check for extra characters or tracking parameters at the end of the URL.

After import, review your listing details in your dashboard. You can update the description or swap photos anytime. The listing stays synced with Airbnb pricing, but other changes are managed within CreatorStays.

Common mistake: Using a private host URL or a link with ?guests=2 parameters. Strip those before pasting. If import fails, try copying the URL fresh from an incognito browser window.`,
    href: "/how-to/hosts"
  },
  { 
    id: "02", 
    title: "Finding and filtering creators", 
    content: `Browse our creator directory by niche, platform, audience size, and location. Use filters to narrow down to travel creators, lifestyle influencers, luxury content specialists, or adventure photographers. Each profile shows their follower count, engagement rate, past collaborations, and content samples.

Click into any creator profile to see their full portfolio, rates, and availability. Look for creators whose audience matches your ideal guest—if you rent a mountain cabin, prioritize outdoor and adventure creators over urban lifestyle accounts.

You can save creators to a shortlist for later. Compare multiple profiles side by side before reaching out. Quality over quantity: one well-matched creator often outperforms five random invites.

Pro tip: Check their recent content. Active creators who post consistently deliver better results than accounts with high followers but low recent activity. Look for authentic engagement in comments, not just likes.`,
  },
  { 
    id: "03", 
    title: "Sending collaboration offers", 
    content: `To invite a creator, click "Send Offer" on their profile. Set your budget (flat fee or per-click), deliverables (number of posts, stories, reels), timeline, and any specific requirements like photo angles or caption mentions.

Creators receive your offer via email and in-app notification. They can accept as-is, counter with different terms, or decline. You'll be notified of their response within the app. Most creators respond within 24-48 hours.

Once accepted, the collaboration moves to "Active" status. The creator receives their unique tracked link and begins creating content. You can message them directly through the platform for coordination.

Common mistake: Being too vague about deliverables. Specify exactly what you want: "2 Instagram Reels, 3 Stories with swipe-up, 1 carousel post" is better than "some posts." Clear expectations lead to better outcomes for everyone.`,
  },
  { 
    id: "04", 
    title: "How tracked links work", 
    content: `Every creator gets a unique tracking link to your Airbnb listing. When they post content with this link, we track every click in real time. You see: total clicks, unique visitors, referral sources, device types, and geographic breakdown.

The link format is creatorstays.com/r/[unique-token]. When someone clicks, we log the event and redirect them to your Airbnb listing. The redirect is instant—users won't notice any delay.

Links remain active for the duration of your collaboration. After the campaign ends, you can choose to keep tracking or deactivate the link. Historical data is always preserved in your dashboard.

Important: We track clicks and visitors, not Airbnb bookings. Airbnb doesn't share booking data with third parties. However, you can correlate traffic spikes with your Airbnb calendar to estimate conversion impact.

If a creator's link shows many clicks but you see no inquiries, check if the traffic is from your target demographic. Bot traffic and click fraud are rare but possible—see our fraud detection section.`,
  },
  { 
    id: "05", 
    title: "Understanding your analytics dashboard", 
    content: `Your dashboard shows real-time and historical performance data. Key metrics include: total clicks, unique visitors, click-through rate, top referral sources, and traffic by creator.

The main chart displays traffic over time. Toggle between daily, weekly, and monthly views. Hover over data points for exact numbers. Compare performance across different creators to see who drives the most qualified traffic.

Below the chart, you'll find a breakdown by creator. Each row shows their link, total clicks, unique visitors, and average session duration. Use this to identify your top performers for future campaigns.

Export your data anytime as CSV for deeper analysis. The export includes timestamps, referrer URLs, device types, and geographic data. Use this for ROI calculations or to share with your property management company.

Pro tip: Don't just chase click volume. A creator with fewer clicks but higher unique visitor percentage and longer session times often indicates more qualified traffic—people actually interested in booking.`,
  },
  { 
    id: "06", 
    title: "Paying creators through the platform", 
    content: `When a creator completes their deliverables, you'll receive a notification to review and approve their work. Once approved, payment is processed through Stripe. The creator receives funds within 5-7 business days.

We handle all payment logistics: invoicing, currency conversion, and tax documentation. At year-end, creators who earned over $600 receive a 1099-NEC form automatically. You receive a summary of all payments for your records.

Platform fees are 15% total, split between host and creator (7.5% each). This covers payment processing, fraud protection, dispute resolution, and tax compliance. There are no upfront costs or subscriptions.

If you need to pause or cancel a collaboration mid-campaign, contact support. Partial payments may apply depending on work already completed. We mediate disputes fairly based on the original agreement terms.

For international creators, we support payouts in 40+ currencies. Exchange rates are locked at the time of payment approval to avoid fluctuation issues.`,
  },
  { 
    id: "07", 
    title: "Joining the creator waitlist", 
    content: `We're onboarding creators in controlled batches to ensure quality matches. Join the waitlist by submitting your social profiles, niche, and audience demographics. We review applications within 5-7 business days.

Priority goes to travel, lifestyle, and hospitality niches with engaged audiences. We look at content quality, posting consistency, and audience authenticity—not just follower count. A 10K account with 5% engagement often beats a 100K account with 0.5%.

Once approved, you'll receive an email with setup instructions. Complete your profile, set your rates, connect your social accounts, and you'll start appearing in host searches.

While waiting, optimize your social presence. Post consistently, engage with your audience, and create content that showcases your ability to highlight properties and destinations. This strengthens your application.

Current wait times vary by niche. Travel creators: 1-2 weeks. Lifestyle: 2-3 weeks. Other niches: 3-4 weeks. We notify you either way.`,
    href: "/waitlist"
  },
  { 
    id: "08", 
    title: "Platform fees explained", 
    content: `CreatorStays charges 15% on successful collaborations, split evenly between host and creator (7.5% each). There are no upfront costs, monthly subscriptions, or listing fees. You only pay when a collaboration is completed and approved.

The fee covers: secure payment processing, fraud protection, dispute mediation, tax document generation (1099s), customer support, and platform maintenance. We don't take cuts from tips or bonuses you send directly.

Example: If you pay a creator $500, the creator receives $462.50 after their 7.5% fee. You pay $537.50 total including your 7.5% fee. Stripe processing fees are included—no additional charges.

For high-volume hosts (10+ collaborations per month), contact us about enterprise pricing. We offer volume discounts and dedicated account management for property managers and multi-listing hosts.

Refunds are handled case-by-case. If a creator doesn't deliver, you're not charged. If you cancel after work begins, partial fees may apply based on completion percentage.`,
    href: "/pricing"
  },
]

// Comprehensive FAQ grouped by category
const faqCategories = [
  {
    name: "For Hosts",
    items: [
      { 
        q: "My Airbnb URL won't import. What should I do?", 
        a: `First, verify you're using the public listing URL (airbnb.com/rooms/123456789), not your host dashboard URL. Remove any query parameters like ?guests=2 or tracking codes.

Try copying the URL from an incognito browser window to get a clean link. If the listing is new or recently edited, wait 24 hours for Airbnb's cache to update.

Still not working? Your listing might be unlisted, paused, or in a region we don't yet support. Contact support with your URL and we'll investigate. Most import issues resolve within one business day.` 
      },
      { 
        q: "Can I list properties from VRBO, Booking.com, or other platforms?", 
        a: `Currently, we only support Airbnb listings. Our import system is built specifically for Airbnb's data format. We're actively developing support for VRBO and Booking.com—join our mailing list for updates.

In the meantime, if your property is on multiple platforms, use your Airbnb listing as the primary. Creators will link to Airbnb, but interested guests may find you on other platforms too.

Enterprise hosts with large portfolios across platforms can contact us for custom solutions.` 
      },
      { 
        q: "How do I pause or deactivate a creator's link?", 
        a: `Go to your active collaborations, find the creator, and click "Manage Link." You can pause (temporarily stop tracking) or deactivate (permanently disable) the link.

Paused links show a "Link Paused" message to visitors. Deactivated links redirect to your main Airbnb profile instead of the specific listing.

Pausing doesn't affect payment obligations. If the creator fulfilled their deliverables, payment is still due. Deactivating mid-campaign may require negotiation—contact support for mediation.

You can reactivate paused links anytime. Historical data is preserved regardless of link status.` 
      },
      { 
        q: "A creator's link shows clicks but I see no Airbnb inquiries. Why?", 
        a: `Several factors could explain this gap. First, not every click converts to an inquiry—industry standard is 1-3% of visitors take action. Check if click volume is high enough to expect conversions.

Second, verify traffic quality. In your dashboard, check geographic and device data. If most clicks come from regions unlikely to travel to your area, the audience may not be a good match.

Third, review the creator's content. Is your listing presented compellingly? Is the call-to-action clear? Sometimes the issue is content quality, not reach.

Finally, check your Airbnb listing itself. Are reviews strong? Is pricing competitive? Instant Book enabled? The best traffic can't overcome a listing that doesn't convert.

If you suspect bot traffic or click fraud, contact support. We have fraud detection tools and will investigate.` 
      },
      { 
        q: "Can I work with multiple creators simultaneously?", 
        a: `Absolutely. There's no limit to active collaborations. Each creator gets a unique tracked link, so you can compare performance side-by-side.

We recommend starting with 2-3 creators to test different niches and content styles. Once you identify what works, scale up with similar creator profiles.

Pro tip: Stagger campaign start dates by 1-2 weeks. This helps isolate which creator's content drives results and avoids overlapping promotional pushes that might confuse your audience analytics.` 
      },
      { 
        q: "What happens if a creator doesn't deliver what was promised?", 
        a: `First, communicate directly through the platform. Most issues resolve with a simple conversation—maybe they misunderstood deliverables or had a scheduling conflict.

If you can't resolve it, open a dispute. Provide evidence of the original agreement and what was (or wasn't) delivered. Our team reviews within 48 hours and mediates a fair resolution.

You're never charged for undelivered work. If a creator ghosts completely, we refund any held payments and remove them from our platform. We take reliability seriously.

Prevention tip: Review creator profiles carefully before sending offers. Look for completion rates and past host reviews. Established creators rarely have delivery issues.` 
      },
    ]
  },
  {
    name: "For Creators",
    items: [
      { 
        q: "How do I set my rates?", 
        a: `In your creator profile, set default rates for different deliverable types: Instagram posts, Stories, Reels, TikToks, YouTube integrations, etc. You can set flat fees or per-click rates.

Research comparable creators in your niche. Rates typically correlate with engagement rate and audience size, but quality matters more than follower count. A focused niche audience often commands higher rates.

You can customize rates for individual offers. If a host's property is exceptional or the collaboration involves extra work, adjust accordingly. Hosts see your default rates but can propose alternatives.

Start competitive to build reviews, then raise rates as you establish a track record. Most successful creators increase rates 20-30% after their first 5-10 completed collaborations.` 
      },
      { 
        q: "Can I counter or negotiate an offer?", 
        a: `Yes. When you receive an offer, you can accept as-is, decline, or counter with different terms. Countering lets you propose changes to budget, deliverables, timeline, or requirements.

Be specific in your counter. Instead of just asking for more money, explain why: "I'd like to propose $X because this will require [specific extra work]." Hosts appreciate transparency.

Most negotiations close within 2-3 exchanges. If you're far apart on terms, it's okay to decline politely. Not every collaboration is a good fit, and that's fine.

Pro tip: If you like the property but the budget is low, propose a smaller scope instead of walking away. "For this budget, I can do 1 Reel instead of 2" often works.` 
      },
      { 
        q: "I want to change my rate mid-campaign. Is that possible?", 
        a: `Once a collaboration is accepted, the agreed terms are locked. You can't unilaterally change rates mid-campaign—that would undermine trust in the platform.

If circumstances changed significantly (scope creep, unexpected requirements, personal emergency), message the host to discuss. Many hosts will accommodate reasonable adjustments, especially for good creators.

For future protection, be thorough when reviewing offers. If something is unclear, ask before accepting. Once you accept, you're committing to those terms.

If a host is demanding work outside the original agreement, document it and contact support. Scope creep is grounds for renegotiation or dispute resolution.` 
      },
      { 
        q: "How quickly do I get paid after completing work?", 
        a: `After you submit deliverables, the host has 72 hours to review and approve. Most approve within 24 hours. Once approved, payment initiates immediately.

Funds arrive in your connected bank account within 5-7 business days, depending on your bank and country. US domestic transfers are typically faster (2-3 days). International payouts may take the full 7 days.

If a host doesn't respond within 72 hours, the system auto-approves and payment proceeds. You won't be left waiting indefinitely.

Track payment status in your dashboard. You'll see: Pending Review → Approved → Processing → Paid. Contact support if a payment shows "Processing" for more than 10 business days.` 
      },
      { 
        q: "I'm having trouble connecting my Instagram/TikTok/YouTube account.", 
        a: `Social account connections use official APIs that require specific permissions. Here's how to troubleshoot:

For Instagram: You must have a Business or Creator account (not Personal). Go to Instagram Settings → Account → Switch to Professional Account. Then retry the connection. Also ensure your Facebook Page is linked if using Facebook Login.

For TikTok: Make sure you're logging in with the account you want to connect, not a different TikTok account. Clear your browser cookies if you're seeing the wrong account.

For YouTube: Google may require re-authentication if you have multiple Google accounts. Sign out of all Google accounts, then sign in with only the one linked to your YouTube channel.

If permissions are denied, check that you're granting all requested permissions during the OAuth flow. Denying any permission will cause the connection to fail.

Still stuck? Contact support with screenshots of the error. We can often identify the issue from the error message.` 
      },
      { 
        q: "Can I have multiple creator accounts?", 
        a: `No. Each person may have only one creator account. Duplicate accounts are against our terms of service and will be suspended.

If you manage content for multiple brands or personas, use a single creator account and specify which profile you'll use for each collaboration. Hosts can see your connected accounts and choose accordingly.

If you accidentally created a duplicate account, contact support immediately. We'll help you merge accounts and preserve your history. Don't continue using both—it will trigger fraud detection.

Property managers or agencies representing multiple creators should contact us about agency accounts, which allow managing multiple creator profiles under one umbrella.` 
      },
    ]
  },
  {
    name: "Affiliate Links & Analytics",
    items: [
      { 
        q: "How accurate is click tracking?", 
        a: `Our tracking is highly accurate for direct clicks. When someone clicks a tracked link, we log it with timestamp, referrer, device type, and approximate location (country/region level).

Unique visitors are tracked via cookies. If someone clicks multiple times from the same browser, we count it as one unique visitor with multiple clicks. Different devices count as different visitors.

Edge cases that may affect accuracy: VPN users may show incorrect locations. Private/incognito browsers don't retain cookies, so repeat visits appear as new uniques. Ad blockers occasionally interfere with tracking scripts.

Overall accuracy is 95%+ for clicks and 90%+ for unique visitors. These margins are industry standard and sufficient for ROI analysis.` 
      },
      { 
        q: "I suspect bot traffic or click fraud on my links. What should I do?", 
        a: `Signs of bot traffic include: sudden spikes with no corresponding content post, clicks from unusual geographic patterns, extremely short session durations, and clicks at regular intervals (every 5 seconds, for example).

Report suspected fraud through your dashboard or contact support. Provide the link, date range, and what seems suspicious. Our team investigates using server-side signals invisible to users.

We have automated fraud detection that filters obvious bots in real-time. Sophisticated fraud requires manual review. If confirmed, we remove fraudulent clicks from your metrics and take action against the source.

Creators found generating fake clicks are permanently banned. Hosts affected by fraud are not charged for those clicks. We take platform integrity seriously.` 
      },
      { 
        q: "Can I see which specific posts or stories drove clicks?", 
        a: `Partially. Our tracking shows referral sources, which can indicate whether traffic came from Instagram, TikTok, YouTube, or direct links. However, we can't see inside those platforms to identify specific posts.

To track at the post level, ask your creator to use different link variants or add UTM parameters. Example: creatorstays.com/r/abc123?utm_source=ig_reel_1. This lets you filter by parameter in your dashboard.

Some creators include screenshots or links to their posts when submitting deliverables. This helps you correlate content with traffic spikes manually.

Future feature: We're building post-level tracking via creator-reported timestamps. Stay tuned for updates.` 
      },
      { 
        q: "My analytics show traffic but Airbnb says no profile views. Why the discrepancy?", 
        a: `Airbnb's profile view count and our click tracking measure different things. We track when someone clicks your tracked link. Airbnb counts when someone views your listing page and scrolls/engages.

Possible explanations: Some clickers may bounce immediately before Airbnb registers a view. Airbnb's analytics have a delay and may not show real-time data. Airbnb may filter certain traffic as low-quality.

Generally, our click count will be higher than Airbnb's profile views. That's normal. The important metric is the trend: if our clicks go up when a creator posts, and your Airbnb inquiries increase, the campaign is working.

Don't obsess over perfect number matching. Focus on directional correlation and overall ROI.` 
      },
      { 
        q: "How long do tracking links remain active?", 
        a: `By default, links remain active for the duration of your collaboration agreement. When the campaign ends, you choose whether to keep tracking or deactivate.

Active links continue tracking indefinitely—even years later. This is useful for evergreen content that keeps driving traffic long after the initial campaign.

Deactivated links redirect to your main Airbnb profile. Clicks are no longer tracked, but users still reach Airbnb. Historical data from when the link was active is preserved.

You can reactivate a deactivated link anytime. The historical data remains, and new clicks are added to the total.` 
      },
    ]
  },
  {
    name: "Payments & Fees",
    items: [
      { 
        q: "What payment methods do you accept?", 
        a: `Hosts pay via credit/debit card or bank transfer through Stripe. We accept Visa, Mastercard, American Express, and Discover. Bank transfers (ACH) are available for US accounts.

Creators receive payouts to their connected bank account. We support 40+ countries and currencies. Payouts are made in your local currency with exchange rates locked at payment approval time.

We do not currently support PayPal, Venmo, or cryptocurrency. These may be added in the future based on demand.

For large transactions (over $5,000), we may require additional verification for fraud prevention. This is a one-time process.` 
      },
      { 
        q: "When are 1099 tax forms issued?", 
        a: `US-based creators who earn $600 or more in a calendar year receive a 1099-NEC form by January 31 of the following year. Forms are available for download in your dashboard and mailed to your address on file.

Make sure your legal name, address, and SSN/EIN are accurate in your profile. Incorrect information delays form delivery and may require corrections.

International creators do not receive 1099s but may need to complete a W-8BEN form for tax withholding purposes. Consult a tax professional for your specific situation.

Hosts receive a summary of all payments made for their records, useful for business expense documentation.` 
      },
      { 
        q: "Is there a minimum payout threshold?", 
        a: `Yes. The minimum payout is $25 USD (or equivalent in your currency). Earnings below this threshold accumulate until the minimum is reached.

This policy exists because payment processing has fixed costs. Small transactions are disproportionately expensive to process. We'd rather batch small amounts than eat into your earnings with fees.

Most active creators reach the threshold quickly. If you have a balance below $25 and want to close your account, contact support—we'll arrange a final payout regardless of amount.` 
      },
      { 
        q: "What happens if a host disputes a payment after I've been paid?", 
        a: `Chargebacks and disputes are rare but do happen. If a host disputes a charge with their bank after you've been paid, we handle the dispute process.

You won't have funds clawed back unless the dispute is valid (e.g., you didn't deliver the agreed work). We maintain documentation of all agreements and deliverables to defend against fraudulent disputes.

If you're involved in a dispute, we may ask you to provide proof of deliverables (screenshots, links, etc.). Respond promptly—disputes have deadlines.

Hosts who file fraudulent chargebacks are banned from the platform. We protect creators from bad actors.` 
      },
      { 
        q: "Can I tip a creator outside the agreed amount?", 
        a: `Yes. After a collaboration completes, you can send a bonus or tip through the platform. This goes directly to the creator with no additional platform fee.

Tips are a great way to reward exceptional work and build relationships. Creators remember generous hosts and often prioritize future collaborations with them.

We recommend keeping all payments on-platform for documentation and tax purposes. Off-platform payments bypass our protections and complicate tax reporting.` 
      },
    ]
  },
  {
    name: "Safety & Disputes",
    items: [
      { 
        q: "How do I report a suspicious account or fraudulent activity?", 
        a: `Click "Report" on any profile or use the "Report Issue" button in your dashboard. Provide details: what seems wrong, when you noticed it, and any evidence (screenshots, links).

Our trust and safety team reviews reports within 24 hours. Serious issues (scams, harassment) are escalated immediately. We may contact you for additional information.

Reports are confidential. The reported user doesn't know who filed the report. We investigate independently to verify claims.

What happens after: If confirmed, accounts are suspended or banned. If unconfirmed, no action is taken, but patterns of reports against the same user are flagged for deeper review.` 
      },
      { 
        q: "A creator/host is being unprofessional or harassing me. What do I do?", 
        a: `Document everything. Save message screenshots and note dates/times. Then report through the platform immediately.

Block the user to prevent further contact. Go to their profile and click "Block." They can't message you or see your profile.

Our team investigates harassment reports within 24 hours. Depending on severity, consequences range from warnings to permanent bans. We have zero tolerance for harassment, threats, or discrimination.

If you feel unsafe, contact local authorities. We cooperate with law enforcement when legally required and will provide records if subpoenaed.` 
      },
      { 
        q: "What's the dispute resolution process?", 
        a: `Step 1: Direct communication. Most issues resolve when parties talk it out. Use platform messaging so there's a record.

Step 2: Open a formal dispute. If direct communication fails, click "Open Dispute" in the collaboration. Describe the issue and desired resolution.

Step 3: Mediation. Our team reviews the dispute, examines evidence (messages, agreements, deliverables), and proposes a fair resolution within 48 hours.

Step 4: Resolution. Both parties can accept the proposed resolution or appeal with new evidence. Most disputes resolve in mediation. Appeals add 3-5 business days.

Final decisions are binding within the platform. If you disagree with a final decision, you can pursue external legal remedies, but our terms of service include an arbitration clause for most disputes.` 
      },
      { 
        q: "Can I leave a review for a creator/host?", 
        a: `Yes. After a collaboration completes, both parties can leave reviews. Reviews are public and help the community identify trustworthy users.

Reviews include a 1-5 star rating and optional written feedback. Be honest but fair. Focus on the professional experience: communication, deliverable quality, timeliness, and overall satisfaction.

You have 30 days after completion to leave a review. After that, the window closes. Both reviews are published simultaneously to prevent retaliation.

Responding to reviews: You can respond publicly to reviews you've received. Keep responses professional—they're part of your public profile.` 
      },
    ]
  },
  {
    name: "Account & Access",
    items: [
      { 
        q: "How do I reset my password?", 
        a: `Click "Forgot Password" on the login page. Enter your email address and we'll send a reset link. The link expires in 24 hours.

If you don't receive the email, check spam/junk folders. Add noreply@creatorstays.com to your contacts and try again.

Still no email? Your account may be under a different email address. Try other emails you've used. If you're locked out completely, contact support with proof of identity.

For security, we cannot reset passwords over email or phone. You must use the automated reset flow.` 
      },
      { 
        q: "Can I change my email address?", 
        a: `Yes. Go to Settings → Account → Email. Enter your new email and current password. We'll send a verification link to the new address.

Click the verification link within 48 hours to confirm. Your old email will no longer work for login once verified.

If you lose access to both old and new email, contact support immediately. We'll need to verify your identity through alternative means.

For creators: Changing email doesn't affect your connected social accounts. Those are linked separately.` 
      },
      { 
        q: "How do I delete my account?", 
        a: `Go to Settings → Account → Delete Account. You'll be asked to confirm and provide a reason (optional feedback).

Before deletion, complete or cancel any active collaborations. Pending payments must be resolved. Your data is retained for 30 days in case you change your mind, then permanently deleted.

Deletion is irreversible after 30 days. Your reviews remain (anonymized) but all personal data, messages, and analytics are erased.

If you just want a break, consider deactivating instead. Deactivation hides your profile but preserves your data and history. You can reactivate anytime.` 
      },
      { 
        q: "I'm locked out of my account. Help!", 
        a: `First, try password reset. If that doesn't work (email not receiving, account under different email), contact support.

We'll verify your identity through: the email on file, connected social accounts, or past transaction details. This prevents unauthorized access to your account.

If your account was compromised (someone else accessed it), tell us immediately. We'll freeze the account, investigate, and help you regain access safely.

Two-factor authentication (2FA) is available in Settings. We strongly recommend enabling it to prevent future lockouts from compromise.` 
      },
      { 
        q: "Can I have both a host and creator account?", 
        a: `Yes. Many users are both property owners and content creators. You can switch between host and creator modes in your dashboard.

Your host and creator profiles are separate but linked. This lets you list properties AND accept collaboration offers from other hosts.

Everything shares one login and payment method. Reviews are separate per role—your host reviews don't appear on your creator profile and vice versa.

Some users even collaborate with themselves for portfolio building—hosting their own property on one account and creating content on the other. Totally allowed.` 
      },
    ]
  },
]

function HelpTopic({ topic, isOpen, onToggle }: { 
  topic: typeof helpTopics[0]
  isOpen: boolean
  onToggle: () => void 
}) {
  return (
    <div className="block-hover rounded-2xl border-[3px] border-black bg-white p-4 transition-transform duration-200">
      <button 
        onClick={onToggle}
        className="flex w-full items-start justify-between text-left"
      >
        <div className="flex gap-3">
          <span className="font-heading text-[1.5rem] text-black" style={{ fontWeight: 900 }}>
            {topic.id}
          </span>
          <h3 className="font-heading text-[1.25rem] text-black" style={{ fontWeight: 700 }}>
            {topic.title}
          </h3>
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
      
      <div className={`overflow-hidden transition-all duration-200 ${isOpen ? "mt-3 max-h-[500px]" : "max-h-0"}`}>
        <p className="whitespace-pre-line text-[13px] font-medium leading-relaxed text-black">
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
  item: { q: string; a: string }
  isOpen: boolean
  onToggle: () => void 
}) {
  return (
    <div className="block-hover rounded-xl border-[3px] border-black bg-white p-3 transition-transform duration-200">
      <button 
        onClick={onToggle}
        className="flex w-full items-start justify-between gap-3 text-left"
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
      <div className={`overflow-hidden transition-all duration-200 ${isOpen ? "mt-2 max-h-[400px]" : "max-h-0"}`}>
        <p className="whitespace-pre-line text-[13px] font-medium leading-relaxed text-black">
          {item.a}
        </p>
      </div>
    </div>
  )
}

export default function HelpPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [openTopic, setOpenTopic] = useState<string | null>("01")
  const [openFaqs, setOpenFaqs] = useState<Record<string, number | null>>({})

  // Filter topics based on search
  const filteredTopics = helpTopics.filter(topic => 
    topic.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    topic.content.toLowerCase().includes(searchQuery.toLowerCase())
  )

  // Filter FAQs based on search
  const filteredCategories = faqCategories.map(cat => ({
    ...cat,
    items: cat.items.filter(faq =>
      faq.q.toLowerCase().includes(searchQuery.toLowerCase()) ||
      faq.a.toLowerCase().includes(searchQuery.toLowerCase())
    )
  })).filter(cat => cat.items.length > 0)

  const toggleFaq = (categoryName: string, index: number) => {
    setOpenFaqs(prev => ({
      ...prev,
      [categoryName]: prev[categoryName] === index ? null : index
    }))
  }

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

        {/* Hero Image - Support Illustration */}
        <div className="mt-6">
          <div className="block-hover overflow-hidden rounded-2xl border-[3px] border-black bg-[#F5F0E6]">
            <img 
              src="/images/help-support.png" 
              alt="CreatorStays Support" 
              className="w-full h-auto"
            />
          </div>
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
            Getting Started
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
            {filteredTopics.length === 0 && searchQuery && (
              <div className="rounded-2xl border-[3px] border-black bg-white p-4">
                <p className="text-[14px] font-medium text-black">No topics found matching "{searchQuery}"</p>
              </div>
            )}
          </div>
        </div>

        {/* FAQ Sections by Category */}
        {filteredCategories.map((category) => (
          <div key={category.name} className="mt-10">
            <p className="mb-3 text-[10px] font-black uppercase tracking-wider text-white">
              {category.name}
            </p>
            <div className="space-y-2">
              {category.items.map((faq, i) => (
                <FAQItem 
                  key={i} 
                  item={faq} 
                  isOpen={openFaqs[category.name] === i}
                  onToggle={() => toggleFaq(category.name, i)}
                />
              ))}
            </div>
          </div>
        ))}

        {filteredCategories.length === 0 && searchQuery && (
          <div className="mt-10 rounded-2xl border-[3px] border-black bg-white p-4">
            <p className="text-[14px] font-medium text-black">No FAQs found matching "{searchQuery}"</p>
          </div>
        )}

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
