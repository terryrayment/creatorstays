import { Container } from "@/components/layout/container"
import { HostSignupForm } from "@/components/hosts/host-signup-form"
import Link from "next/link"

export const metadata = {
  title: "Host Signup | CreatorStays",
  description: "Create your host profile and get more bookings with creator marketing.",
}

export default function HostsPage() {
  return (
    <div className="relative py-12 md:py-16">
      <Container>
        <div className="mx-auto max-w-xl">
          {/* Header */}
          <div className="mb-8 text-center">
            <h1 className="font-heading text-3xl font-normal tracking-tight md:text-4xl">
              Create your host profile
            </h1>
            <p className="mt-3 text-muted-foreground">
              Get more bookings with creator marketing.
            </p>
            
            {/* Beta offer callout */}
            <div className="mt-4 inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-4 py-2">
              <svg className="h-4 w-4 text-emerald-600" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="text-sm font-medium text-emerald-800">First 100 hosts: $199 fee waived</span>
            </div>
          </div>

          {/* Signup form card */}
          <div className="rounded-2xl border border-foreground/5 bg-white/80 p-6 shadow-xl shadow-black/[0.03] backdrop-blur-sm md:p-8">
            <HostSignupForm />
          </div>

          {/* Footer note */}
          <p className="mt-6 text-center text-xs text-muted-foreground">
            Are you a creator? <Link href="/waitlist" className="text-primary hover:underline">Join the Creator Waitlist</Link>
          </p>
        </div>
      </Container>
    </div>
  )
}
