import { Metadata } from 'next'

export const metadata: Metadata = {
  title: "For Travel Creators - Get Paid to Stay at Amazing Properties",
  description: "Turn your travel content into income. Get free stays at luxury vacation rentals, create content you own, and earn money doing what you love. Join 1,000+ creators on CreatorStays.",
  keywords: [
    "travel influencer jobs",
    "get paid to travel",
    "content creator stays",
    "influencer hotel stays",
    "travel blogger opportunities",
    "paid travel content",
    "UGC creator platform",
    "travel influencer platform",
    "vacation rental collaborations",
    "creator economy travel",
    "influencer marketing jobs",
  ],
  openGraph: {
    title: "For Travel Creators | CreatorStays",
    description: "Get paid to stay at amazing vacation rentals. Create content, earn money, travel more.",
    images: ["/og-creators.png"],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "For Travel Creators | CreatorStays",
    description: "Get paid to stay at amazing vacation rentals. Create content, earn money, travel more.",
  },
  alternates: {
    canonical: "/creators",
  },
}

// JSON-LD for Service
const serviceSchema = {
  "@context": "https://schema.org",
  "@type": "Service",
  name: "CreatorStays for Creators",
  description: "Get paid to create travel content at beautiful vacation rentals worldwide.",
  provider: {
    "@type": "Organization",
    name: "CreatorStays",
  },
  serviceType: "Creator Partnership Platform",
  areaServed: "Worldwide",
  audience: {
    "@type": "Audience",
    audienceType: "Travel Content Creators",
  },
  hasOfferCatalog: {
    "@type": "OfferCatalog",
    name: "Creator Opportunities",
    itemListElement: [
      {
        "@type": "Offer",
        itemOffered: {
          "@type": "Service",
          name: "Paid Stays",
          description: "Get paid plus free accommodation at vacation rentals",
        },
      },
      {
        "@type": "Offer",
        itemOffered: {
          "@type": "Service",
          name: "Post-for-Stay",
          description: "Exchange content for complimentary stays",
        },
      },
      {
        "@type": "Offer",
        itemOffered: {
          "@type": "Service",
          name: "Content Ownership",
          description: "Keep full rights to all content you create",
        },
      },
    ],
  },
}

export default function CreatorsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(serviceSchema) }}
      />
      {children}
    </>
  )
}
