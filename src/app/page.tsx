import { Container } from "@/components/layout/container"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export default function HomePage() {
  return (
    <Container className="py-16">
      <div className="flex flex-col items-center text-center">
        <h1 className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl">
          Welcome to CreatorStays
        </h1>
        <p className="mt-6 max-w-2xl text-lg text-muted-foreground">
          Connect creators with unique stays for content creation. Find the perfect location for your next project.
        </p>
        <div className="mt-8 flex gap-4">
          <Button asChild>
            <Link href="/waitlist">Join Waitlist</Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href="/how-it-works">Learn More</Link>
          </Button>
        </div>
      </div>
    </Container>
  )
}
