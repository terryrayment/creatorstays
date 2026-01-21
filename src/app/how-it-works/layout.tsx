import { Metadata } from 'next'

export const metadata: Metadata = {
  title: "How It Works - Connect Hosts with Creators in 4 Simple Steps",
  description: "Learn how CreatorStays connects vacation rental hosts with travel content creators. Simple process: browse creators, send offers, collaborate, and track results.",
  keywords: [
    "how influencer marketing works",
    "vacation rental marketing guide",
    "creator collaboration process",
    "Airbnb influencer marketing",
    "content creator partnerships explained",
    "STR marketing tutorial",
  ],
  openGraph: {
    title: "How It Works | CreatorStays",
    description: "Connect vacation rental hosts with travel content creators in 4 simple steps.",
    images: ["/og-how-it-works.png"],
    type: "website",
  },
  alternates: {
    canonical: "/how-it-works",
  },
}

// JSON-LD HowTo Schema
const howToSchema = {
  "@context": "https://schema.org",
  "@type": "HowTo",
  name: "How to Use CreatorStays",
  description: "Step-by-step guide to connecting vacation rental hosts with content creators",
  totalTime: "PT15M",
  step: [
    {
      "@type": "HowToStep",
      position: 1,
      name: "Create Your Account",
      text: "Sign up as a host or creator. Add your property or portfolio.",
      image: "https://creatorstays.com/how-it-works/step-1.png",
    },
    {
      "@type": "HowToStep",
      position: 2,
      name: "Find Your Match",
      text: "Hosts browse creator profiles. Creators receive offers from hosts.",
      image: "https://creatorstays.com/how-it-works/step-2.png",
    },
    {
      "@type": "HowToStep",
      position: 3,
      name: "Agree on Terms",
      text: "Negotiate deliverables, dates, and compensation. Sign the agreement.",
      image: "https://creatorstays.com/how-it-works/step-3.png",
    },
    {
      "@type": "HowToStep",
      position: 4,
      name: "Create & Track",
      text: "Creator stays and creates content. Host tracks performance and ROI.",
      image: "https://creatorstays.com/how-it-works/step-4.png",
    },
  ],
}

export default function HowItWorksLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(howToSchema) }}
      />
      {children}
    </>
  )
}
