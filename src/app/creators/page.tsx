import { Container } from "@/components/layout/container"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export default function CreatorsPage() {
  return (
    <Container className="py-16">
      <div className="mx-auto max-w-2xl text-center">
        <span className="inline-block rounded-full border border-accent/20 bg-accent/10 px-4 py-1.5 text-sm font-medium text-accent">
          Coming Soon
        </span>
        <h1 className="mt-4 text-4xl font-bold tracking-tight">
          Creator Directory
        </h1>
        <p className="mt-4 text-lg text-muted-foreground">
          We&apos;re building a curated directory of vetted content creators. 
          Join the waitlist to be notified when it launches.
        </p>
        
        <div className="mt-12 rounded-2xl border border-dashed border-border bg-muted/30 p-12">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-muted">
            <svg className="h-8 w-8 text-muted-foreground" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" />
            </svg>
          </div>
          <p className="mt-4 text-muted-foreground">
            No creators listed yet. We&apos;re currently onboarding our first cohort.
          </p>
        </div>

        <div className="mt-12 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
          <Button asChild>
            <Link href="/waitlist">Join Creator Waitlist</Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href="/hosts">I&apos;m a Host</Link>
          </Button>
        </div>
      </div>
    </Container>
  )
}
