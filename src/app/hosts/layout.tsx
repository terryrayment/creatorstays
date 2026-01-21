import { Metadata } from 'next'

export const metadata: Metadata = {
  title: "For Vacation Rental Hosts - Get More Bookings with Creator Marketing",
  description: "Turn your Airbnb or VRBO into a content creator destination. Get authentic UGC, social media exposure, and more direct bookings. Join 500+ hosts already using CreatorStays.",
  keywords: [
    "Airbnb marketing",
    "vacation rental promotion",
    "influencer marketing for hosts",
    "VRBO marketing strategy",
    "short-term rental advertising",
    "STR marketing platform",
    "vacation rental content creators",
    "Airbnb influencer partnerships",
    "property marketing",
    "vacation rental social media",
  ],
  openGraph: {
    title: "For Vacation Rental Hosts | CreatorStays",
    description: "Turn your vacation rental into a creator destination. Get authentic content and more bookings.",
    images: ["/og-hosts.png"],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "For Vacation Rental Hosts | CreatorStays",
    description: "Turn your vacation rental into a creator destination. Get authentic content and more bookings.",
  },
  alternates: {
    canonical: "/hosts",
  },
}

// JSON-LD for Service
const serviceSchema = {
  "@context": "https://schema.org",
  "@type": "Service",
  name: "CreatorStays for Hosts",
  description: "Connect your vacation rental with travel content creators for authentic marketing and increased bookings.",
  provider: {
    "@type": "Organization",
    name: "CreatorStays",
  },
  serviceType: "Influencer Marketing Platform",
  areaServed: "Worldwide",
  hasOfferCatalog: {
    "@type": "OfferCatalog",
    name: "Host Services",
    itemListElement: [
      {
        "@type": "Offer",
        itemOffered: {
          "@type": "Service",
          name: "Creator Matching",
          description: "Get matched with travel influencers perfect for your property",
        },
      },
      {
        "@type": "Offer",
        itemOffered: {
          "@type": "Service",
          name: "Content Creation",
          description: "Receive professional photos and videos of your property",
        },
      },
      {
        "@type": "Offer",
        itemOffered: {
          "@type": "Service",
          name: "Performance Tracking",
          description: "Track every click and booking from creator content",
        },
      },
    ],
  },
}

export default function HostsLayout({
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
