"use client"

import { useState } from "react"
import { Container } from "@/components/layout/container"
import Link from "next/link"

function Panel({ children, className = "" }: { children: React.ReactNode, className?: string }) {
  return <div className={`rounded-2xl border-[3px] border-black bg-white p-5 ${className}`}>{children}</div>
}

interface JobListing {
  id: string
  title: string
  department: string
  salary: string
  type: string
  description: string
  requirements: string[]
  questions: { id: string; label: string; placeholder: string }[]
}

const jobs: JobListing[] = [
  {
    id: "senior-fullstack",
    title: "Senior Full-Stack Engineer",
    department: "Engineering",
    salary: "$180,000 – $240,000",
    type: "Remote (US)",
    description: "Build the core platform powering creator-host collaborations. You'll work across our Next.js frontend, Node APIs, and PostgreSQL database to ship features that directly impact how creators and hosts connect.",
    requirements: ["5+ years full-stack experience", "TypeScript/React expertise", "Database design skills", "Startup pace comfort"],
    questions: [
      { id: "project", label: "What's the most complex feature you've shipped end-to-end?", placeholder: "Describe the technical challenges and your approach..." },
      { id: "stack", label: "What's your preferred tech stack and why?", placeholder: "Tools, frameworks, databases you love working with..." },
    ],
  },
  {
    id: "founding-designer",
    title: "Founding Designer",
    department: "Design",
    salary: "$160,000 – $200,000",
    type: "Remote (US)",
    description: "Own the entire design system and user experience. From marketing pages to dashboard flows, you'll shape how thousands of creators and hosts interact with CreatorStays every day.",
    requirements: ["4+ years product design", "Figma mastery", "Motion/interaction design", "Brand design experience"],
    questions: [
      { id: "portfolio", label: "Link to your portfolio or case study you're most proud of", placeholder: "https://..." },
      { id: "process", label: "Describe your design process from problem to shipped product", placeholder: "How do you approach a new design challenge..." },
    ],
  },
  {
    id: "head-creator-partnerships",
    title: "Head of Creator Partnerships",
    department: "Growth",
    salary: "$150,000 – $190,000 + equity",
    type: "Remote (US)",
    description: "Build and lead our creator acquisition strategy. You'll develop relationships with travel, lifestyle, and adventure creators, and create programs that make CreatorStays the go-to platform for creator collaborations.",
    requirements: ["5+ years in creator/influencer marketing", "Existing creator network", "Partnership negotiation", "Data-driven approach"],
    questions: [
      { id: "network", label: "Tell us about your existing creator network", placeholder: "Types of creators, relationship depth, notable partnerships..." },
      { id: "strategy", label: "How would you approach acquiring our first 100 creators?", placeholder: "Channels, messaging, incentives..." },
    ],
  },
  {
    id: "senior-backend",
    title: "Senior Backend Engineer",
    department: "Engineering",
    salary: "$175,000 – $230,000",
    type: "Remote (US)",
    description: "Design and build the infrastructure that powers real-time analytics, payment processing, and creator matching. You'll work with Stripe Connect, build scalable APIs, and optimize our data pipeline.",
    requirements: ["5+ years backend development", "Node.js/Python expertise", "Payment systems experience", "API design skills"],
    questions: [
      { id: "payments", label: "Describe your experience with payment systems or Stripe", placeholder: "Integrations you've built, challenges faced..." },
      { id: "scale", label: "How have you approached scaling a system under load?", placeholder: "Specific techniques, tools, results..." },
    ],
  },
  {
    id: "growth-marketing",
    title: "Growth Marketing Lead",
    department: "Marketing",
    salary: "$140,000 – $180,000 + equity",
    type: "Remote (US)",
    description: "Drive host acquisition and creator awareness. You'll own paid campaigns, SEO strategy, content marketing, and conversion optimization across our entire funnel.",
    requirements: ["4+ years growth marketing", "B2B and B2C experience", "Analytics proficiency", "Budget management"],
    questions: [
      { id: "campaign", label: "What's the most successful campaign you've run? Share metrics.", placeholder: "Channel, strategy, CAC, results..." },
      { id: "channels", label: "Which channels would you prioritize for a two-sided marketplace?", placeholder: "Your approach and reasoning..." },
    ],
  },
  {
    id: "head-host-success",
    title: "Head of Host Success",
    department: "Operations",
    salary: "$130,000 – $170,000",
    type: "Remote (US)",
    description: "Ensure vacation rental hosts get maximum value from creator partnerships. You'll build onboarding flows, create educational content, and develop the playbook for successful host-creator collaborations.",
    requirements: ["3+ years customer success", "Vacation rental industry knowledge a plus", "Process building skills", "Excellent communication"],
    questions: [
      { id: "onboarding", label: "How would you design the ideal host onboarding experience?", placeholder: "Key touchpoints, automation, success metrics..." },
      { id: "churn", label: "Describe a time you turned around a churning customer segment", placeholder: "The problem, your approach, results..." },
    ],
  },
  {
    id: "product-manager",
    title: "Product Manager",
    department: "Product",
    salary: "$160,000 – $210,000",
    type: "Remote (US)",
    description: "Define and ship features that solve real problems for creators and hosts. You'll work directly with engineering, design, and users to prioritize what we build and why.",
    requirements: ["4+ years product management", "Marketplace experience preferred", "Technical background", "User research skills"],
    questions: [
      { id: "feature", label: "Walk us through a feature you took from idea to launch", placeholder: "Discovery, prioritization, execution, results..." },
      { id: "marketplace", label: "What unique challenges do two-sided marketplaces face?", placeholder: "Your perspective and how you'd address them..." },
    ],
  },
  {
    id: "data-engineer",
    title: "Data Engineer",
    department: "Engineering",
    salary: "$165,000 – $220,000",
    type: "Remote (US)",
    description: "Build the data infrastructure that powers creator analytics, host insights, and platform metrics. You'll design pipelines, create dashboards, and enable data-driven decisions across the company.",
    requirements: ["4+ years data engineering", "SQL/Python proficiency", "ETL pipeline experience", "Analytics tools knowledge"],
    questions: [
      { id: "pipeline", label: "Describe a data pipeline you've built end-to-end", placeholder: "Sources, transformations, outputs, scale..." },
      { id: "tools", label: "What's your ideal modern data stack?", placeholder: "Tools you'd choose and why..." },
    ],
  },
]

// Application Modal
function ApplicationModal({ 
  job, 
  onClose 
}: { 
  job: JobListing
  onClose: () => void 
}) {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    linkedin: "",
    answers: {} as Record<string, string>,
  })
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    setError("")

    try {
      const res = await fetch("/api/careers/apply", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          jobId: job.id,
          jobTitle: job.title,
          ...formData,
        }),
      })

      if (res.ok) {
        setSubmitted(true)
      } else {
        const data = await res.json()
        setError(data.error || "Something went wrong. Please try again.")
      }
    } catch (e) {
      setError("Network error. Please try again.")
    }
    setSubmitting(false)
  }

  if (submitted) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
        <div className="w-full max-w-lg rounded-2xl border-[3px] border-black bg-white p-6">
          <div className="text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full border-2 border-black bg-[#28D17C]">
              <svg className="h-8 w-8 text-black" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
              </svg>
            </div>
            <h3 className="text-xl font-black text-black">Application Sent!</h3>
            <p className="mt-2 text-sm text-black/70">
              Thanks for applying for {job.title}. We'll review your application and get back to you within a few days.
            </p>
            <button
              onClick={onClose}
              className="mt-6 rounded-full border-2 border-black bg-black px-6 py-2 text-sm font-bold text-white transition-transform hover:-translate-y-0.5"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="my-8 w-full max-w-lg rounded-2xl border-[3px] border-black bg-white">
        {/* Header */}
        <div className="border-b-2 border-black bg-[#4AA3FF] p-5 rounded-t-xl">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-black/60">Apply for</p>
              <h3 className="text-lg font-black text-black">{job.title}</h3>
              <p className="text-sm text-black/70">{job.salary} · {job.type}</p>
            </div>
            <button
              onClick={onClose}
              className="text-black/60 hover:text-black"
            >
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {/* Basic Info */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-black/60 mb-1">
                Full Name *
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full rounded-lg border-2 border-black px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#4AA3FF]"
                placeholder="Jane Smith"
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-black/60 mb-1">
                Email *
              </label>
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full rounded-lg border-2 border-black px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#4AA3FF]"
                placeholder="jane@example.com"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-black/60 mb-1">
                Phone
              </label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full rounded-lg border-2 border-black px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#4AA3FF]"
                placeholder="(555) 123-4567"
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-black/60 mb-1">
                LinkedIn URL *
              </label>
              <input
                type="url"
                required
                value={formData.linkedin}
                onChange={(e) => setFormData({ ...formData, linkedin: e.target.value })}
                className="w-full rounded-lg border-2 border-black px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#4AA3FF]"
                placeholder="linkedin.com/in/janesmith"
              />
            </div>
          </div>

          {/* Role-specific questions */}
          <div className="border-t-2 border-black pt-4 mt-4">
            <p className="text-[10px] font-bold uppercase tracking-wider text-black/60 mb-3">
              A few quick questions
            </p>
            {job.questions.map((q) => (
              <div key={q.id} className="mb-4">
                <label className="block text-[12px] font-bold text-black mb-1">
                  {q.label}
                </label>
                <textarea
                  required
                  rows={3}
                  value={formData.answers[q.id] || ""}
                  onChange={(e) => setFormData({
                    ...formData,
                    answers: { ...formData.answers, [q.id]: e.target.value }
                  })}
                  className="w-full rounded-lg border-2 border-black px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#4AA3FF] resize-none"
                  placeholder={q.placeholder}
                />
              </div>
            ))}
          </div>

          {error && (
            <div className="rounded-lg border-2 border-red-300 bg-red-50 px-4 py-2 text-sm text-red-700">
              {error}
            </div>
          )}

          {/* Submit */}
          <div className="flex gap-3 pt-2">
            <button
              type="submit"
              disabled={submitting}
              className="flex-1 rounded-full border-2 border-black bg-[#28D17C] py-3 text-sm font-bold text-black transition-transform hover:-translate-y-0.5 disabled:opacity-50"
            >
              {submitting ? "Sending..." : "Submit Application"}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="rounded-full border-2 border-black bg-white px-4 py-3 text-sm font-bold text-black transition-colors hover:bg-black/5"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

function JobCard({ job, onApply }: { job: JobListing; onApply: () => void }) {
  return (
    <Panel>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h3 className="text-[16px] font-bold text-black">{job.title}</h3>
          <div className="mt-1 flex flex-wrap items-center gap-2 text-[12px]">
            <span className="rounded-full border-2 border-black bg-[#FFD84A] px-2 py-0.5 font-bold text-black">{job.department}</span>
            <span className="text-black/60">{job.type}</span>
          </div>
        </div>
        <div className="text-right">
          <p className="text-[15px] font-black text-[#28D17C]">{job.salary}</p>
        </div>
      </div>
      <p className="mt-3 text-[13px] text-black/80 leading-relaxed">{job.description}</p>
      <div className="mt-3 flex flex-wrap gap-1.5">
        {job.requirements.map((req, i) => (
          <span key={i} className="rounded-full border border-black/20 bg-black/5 px-2 py-0.5 text-[10px] font-medium text-black/70">
            {req}
          </span>
        ))}
      </div>
      <button
        onClick={onApply}
        className="mt-4 inline-flex items-center gap-2 rounded-full border-2 border-black bg-black px-4 py-2 text-[11px] font-bold text-white transition-transform hover:-translate-y-0.5"
      >
        Apply Now
        <svg className="h-3 w-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
          <path d="M7 17L17 7M17 7H7M17 7V17" />
        </svg>
      </button>
    </Panel>
  )
}

function QuickLinks() {
  return (
    <Panel>
      <h3 className="text-[11px] font-black uppercase tracking-wider text-black mb-3">Quick links</h3>
      <div className="space-y-2 text-[13px]">
        <Link href="/hosts" className="block font-medium text-black hover:underline">Host signup</Link>
        <Link href="/waitlist" className="block font-medium text-black hover:underline">Creator waitlist</Link>
        <Link href="/help" className="block font-medium text-black hover:underline">Help center</Link>
        <Link href="/trust-safety" className="block font-medium text-black hover:underline">Trust & Safety</Link>
      </div>
    </Panel>
  )
}

function LocationCard() {
  return (
    <Panel className="bg-[#4AA3FF]">
      <h3 className="text-[11px] font-black uppercase tracking-wider text-black/60 mb-2">Headquarters</h3>
      <p className="text-[15px] font-bold text-black">Los Angeles, CA</p>
      <p className="mt-2 text-[12px] text-black/70">
        All positions are fully remote within the United States. We gather quarterly for team offsites.
      </p>
    </Panel>
  )
}

function BenefitsCard() {
  return (
    <Panel className="bg-[#28D17C]">
      <h3 className="text-[11px] font-black uppercase tracking-wider text-black/60 mb-3">Benefits</h3>
      <ul className="space-y-2 text-[12px] text-black">
        <li className="flex items-center gap-2">
          <span className="flex h-4 w-4 items-center justify-center rounded-full bg-black text-[8px] text-white">✓</span>
          Competitive equity packages
        </li>
        <li className="flex items-center gap-2">
          <span className="flex h-4 w-4 items-center justify-center rounded-full bg-black text-[8px] text-white">✓</span>
          Full health, dental, vision
        </li>
        <li className="flex items-center gap-2">
          <span className="flex h-4 w-4 items-center justify-center rounded-full bg-black text-[8px] text-white">✓</span>
          Unlimited PTO
        </li>
        <li className="flex items-center gap-2">
          <span className="flex h-4 w-4 items-center justify-center rounded-full bg-black text-[8px] text-white">✓</span>
          $2,500 home office stipend
        </li>
        <li className="flex items-center gap-2">
          <span className="flex h-4 w-4 items-center justify-center rounded-full bg-black text-[8px] text-white">✓</span>
          Annual creator stay credits
        </li>
      </ul>
    </Panel>
  )
}

export default function CareersPage() {
  const [selectedJob, setSelectedJob] = useState<JobListing | null>(null)

  return (
    <section className="min-h-screen bg-[#F5F5F5] py-12 md:py-16">
      <Container>
        <div className="grid gap-8 lg:grid-cols-[1fr_280px]">
          {/* Main content */}
          <div className="space-y-6">
            <div>
              <h1 className="font-heading text-[2.5rem] font-black tracking-tight text-black">CAREERS</h1>
              <p className="mt-2 text-[15px] font-medium text-black">Join us in building the future of creator-powered travel marketing.</p>
            </div>

            {/* Mission statement */}
            <Panel className="bg-[#FFD84A]">
              <h2 className="text-[15px] font-bold text-black mb-2">Why CreatorStays?</h2>
              <p className="text-[14px] text-black/80 leading-relaxed">
                We're defining a new marketplace for vacation rental marketing by connecting hosts directly with content creators. 
                The opportunity is large, the product is early, and the team is small. Your work will ship quickly and matter immediately.
              </p>
            </Panel>

            {/* Open positions */}
            <div>
              <h2 className="text-[13px] font-black uppercase tracking-wider text-black/60 mb-4">
                Open Positions ({jobs.length})
              </h2>
              <div className="space-y-4">
                {jobs.map((job) => (
                  <JobCard 
                    key={job.id} 
                    job={job} 
                    onApply={() => setSelectedJob(job)}
                  />
                ))}
              </div>
            </div>

            {/* Contact */}
            <div className="text-[13px] text-black/70 space-y-2 pt-4 border-t-2 border-black">
              <p>
                Don't see a perfect fit? We're always looking for exceptional people. 
                Email <a href="mailto:hello@creatorstays.com" className="font-bold text-black hover:underline">hello@creatorstays.com</a> with 
                your background and what you'd want to build.
              </p>
              <p className="text-[12px]">
                CreatorStays is an equal opportunity employer. We celebrate diversity and are committed to creating an inclusive environment for all employees.
              </p>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            <LocationCard />
            <BenefitsCard />
            <QuickLinks />
          </div>
        </div>
      </Container>

      {/* Application Modal */}
      {selectedJob && (
        <ApplicationModal
          job={selectedJob}
          onClose={() => setSelectedJob(null)}
        />
      )}
    </section>
  )
}
