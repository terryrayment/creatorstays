import { Metadata } from 'next'

export const metadata: Metadata = {
  title: "Help Center - FAQs & Support",
  description: "Get answers to common questions about CreatorStays. Learn how to add properties, find creators, send offers, track performance, and manage collaborations.",
  keywords: [
    "CreatorStays help",
    "vacation rental marketing FAQ",
    "influencer collaboration guide",
    "how to use CreatorStays",
    "creator partnership questions",
    "host support",
    "creator support",
  ],
  openGraph: {
    title: "Help Center | CreatorStays",
    description: "Get answers to common questions about connecting vacation rentals with content creators.",
    type: "website",
  },
  alternates: {
    canonical: "/help",
  },
}

// FAQ Schema for rich snippets in Google
const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "How do I add my vacation rental property?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Paste your Airbnb listing URL into the signup form. We automatically import your photos, title, description, and details. Your property goes live in under 60 seconds."
      }
    },
    {
      "@type": "Question",
      name: "How much does CreatorStays cost?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "CreatorStays is free to join for both hosts and creators. We charge a small platform fee only when a collaboration is successfully completed and payment is processed."
      }
    },
    {
      "@type": "Question",
      name: "How do I find the right creator for my property?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Browse our creator directory by niche, platform, audience size, and location. Look for creators whose audience matches your ideal guest demographic. Each profile shows follower count, engagement rate, and past collaborations."
      }
    },
    {
      "@type": "Question",
      name: "What is a post-for-stay collaboration?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Post-for-stay means the creator receives a complimentary stay at your property in exchange for content. No cash payment is required - the creator creates and posts content about their experience in exchange for the accommodation."
      }
    },
    {
      "@type": "Question",
      name: "How do I track the performance of creator content?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Each collaboration includes a unique tracking link. You can monitor clicks, engagement, and conversions in real-time through your dashboard. See exactly how much traffic each creator drives to your booking page."
      }
    },
    {
      "@type": "Question",
      name: "Who owns the content creators make?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Content ownership terms are specified in each collaboration agreement. Typically, hosts receive perpetual usage rights for their marketing, while creators retain the ability to showcase work in their portfolio."
      }
    },
    {
      "@type": "Question",
      name: "How do payments work?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Payments are processed securely through Stripe. Hosts pay when content is approved, and creators receive funds directly to their connected bank account. CreatorStays handles all payment processing and invoicing."
      }
    },
    {
      "@type": "Question",
      name: "Can I negotiate with creators?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Yes! When you send an offer, creators can accept, decline, or counter with different terms. You can negotiate on rate, deliverables, and timeline until both parties agree."
      }
    },
  ]
}

export default function HelpLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      {children}
    </>
  )
}
