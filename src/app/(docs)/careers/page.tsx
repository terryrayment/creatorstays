import { Container } from "@/components/layout/container"
import Link from "next/link"

function Panel({ children, className = "" }: { children: React.ReactNode, className?: string }) {
  return <div className={`rounded-2xl border-[3px] border-black bg-white p-5 ${className}`}>{children}</div>
}

interface JobListing {
  title: string
  department: string
  salary: string
  type: string
  description: string
  requirements: string[]
}

const jobs: JobListing[] = [
  {
    title: "Senior Full-Stack Engineer",
    department: "Engineering",
    salary: "$180,000 – $240,000",
    type: "Remote (US)",
    description: "Build the core platform powering creator-host collaborations. You'll work across our Next.js frontend, Node APIs, and PostgreSQL database to ship features that directly impact how creators and hosts connect.",
    requirements: ["5+ years full-stack experience", "TypeScript/React expertise", "Database design skills", "Startup pace comfort"],
  },
  {
    title: "Founding Designer",
    department: "Design",
    salary: "$160,000 – $200,000",
    type: "Remote (US)",
    description: "Own the entire design system and user experience. From marketing pages to dashboard flows, you'll shape how thousands of creators and hosts interact with CreatorStays every day.",
    requirements: ["4+ years product design", "Figma mastery", "Motion/interaction design", "Brand design experience"],
  },
  {
    title: "Head of Creator Partnerships",
    department: "Growth",
    salary: "$150,000 – $190,000 + equity",
    type: "Remote (US)",
    description: "Build and lead our creator acquisition strategy. You'll develop relationships with travel, lifestyle, and adventure creators, and create programs that make CreatorStays the go-to platform for creator collaborations.",
    requirements: ["5+ years in creator/influencer marketing", "Existing creator network", "Partnership negotiation", "Data-driven approach"],
  },
  {
    title: "Senior Backend Engineer",
    department: "Engineering",
    salary: "$175,000 – $230,000",
    type: "Remote (US)",
    description: "Design and build the infrastructure that powers real-time analytics, payment processing, and creator matching. You'll work with Stripe Connect, build scalable APIs, and optimize our data pipeline.",
    requirements: ["5+ years backend development", "Node.js/Python expertise", "Payment systems experience", "API design skills"],
  },
  {
    title: "Growth Marketing Lead",
    department: "Marketing",
    salary: "$140,000 – $180,000 + equity",
    type: "Remote (US)",
    description: "Drive host acquisition and creator awareness. You'll own paid campaigns, SEO strategy, content marketing, and conversion optimization across our entire funnel.",
    requirements: ["4+ years growth marketing", "B2B and B2C experience", "Analytics proficiency", "Budget management"],
  },
  {
    title: "Head of Host Success",
    department: "Operations",
    salary: "$130,000 – $170,000",
    type: "Remote (US)",
    description: "Ensure vacation rental hosts get maximum value from creator partnerships. You'll build onboarding flows, create educational content, and develop the playbook for successful host-creator collaborations.",
    requirements: ["3+ years customer success", "Vacation rental industry knowledge a plus", "Process building skills", "Excellent communication"],
  },
  {
    title: "Product Manager",
    department: "Product",
    salary: "$160,000 – $210,000",
    type: "Remote (US)",
    description: "Define and ship features that solve real problems for creators and hosts. You'll work directly with engineering, design, and users to prioritize what we build and why.",
    requirements: ["4+ years product management", "Marketplace experience preferred", "Technical background", "User research skills"],
  },
  {
    title: "Data Engineer",
    department: "Engineering",
    salary: "$165,000 – $220,000",
    type: "Remote (US)",
    description: "Build the data infrastructure that powers creator analytics, host insights, and platform metrics. You'll design pipelines, create dashboards, and enable data-driven decisions across the company.",
    requirements: ["4+ years data engineering", "SQL/Python proficiency", "ETL pipeline experience", "Analytics tools knowledge"],
  },
]

function JobCard({ job }: { job: JobListing }) {
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
      <a
        href={`mailto:careers@creatorstays.com?subject=Application: ${job.title}`}
        className="mt-4 inline-flex items-center gap-2 rounded-full border-2 border-black bg-black px-4 py-2 text-[11px] font-bold text-white transition-transform hover:-translate-y-0.5"
      >
        Apply Now
        <svg className="h-3 w-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
          <path d="M7 17L17 7M17 7H7M17 7V17" />
        </svg>
      </a>
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
                We're creating a new category: the first marketplace connecting vacation rental hosts with content creators. 
                It's an untapped $100B+ market, and we're the first movers. You'll work on hard problems with a small, 
                talented team where your work ships fast and impacts real users immediately.
              </p>
            </Panel>

            {/* Open positions */}
            <div>
              <h2 className="text-[13px] font-black uppercase tracking-wider text-black/60 mb-4">
                Open Positions ({jobs.length})
              </h2>
              <div className="space-y-4">
                {jobs.map((job, i) => (
                  <JobCard key={i} job={job} />
                ))}
              </div>
            </div>

            {/* Contact */}
            <div className="text-[13px] text-black/70 space-y-2 pt-4 border-t-2 border-black">
              <p>
                Don't see a perfect fit? We're always looking for exceptional people. 
                Email <a href="mailto:careers@creatorstays.com" className="font-bold text-black hover:underline">careers@creatorstays.com</a> with 
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
    </section>
  )
}
