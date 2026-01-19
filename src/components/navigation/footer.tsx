import Link from "next/link"
import { Container } from "@/components/layout/container"

export function Footer() {
  return (
    <footer className="border-t py-8">
      <Container>
        <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} CreatorStays. All rights reserved.
          </p>
          <div className="flex flex-wrap gap-x-6 gap-y-2">
            <Link
              href="/how-it-works"
              className="text-sm text-muted-foreground hover:text-foreground"
            >
              How It Works
            </Link>
            <Link
              href="/how-to/hosts"
              className="text-sm text-muted-foreground hover:text-foreground"
            >
              How To (Hosts)
            </Link>
            <Link
              href="/how-to/creators"
              className="text-sm text-muted-foreground hover:text-foreground"
            >
              How To (Creators)
            </Link>
            <Link
              href="/creators"
              className="text-sm text-muted-foreground hover:text-foreground"
            >
              Creators
            </Link>
            <Link
              href="/hosts"
              className="text-sm text-muted-foreground hover:text-foreground"
            >
              Hosts
            </Link>
            <Link
              href="/help"
              className="text-sm text-muted-foreground hover:text-foreground"
            >
              Help
            </Link>
          </div>
        </div>
      </Container>
    </footer>
  )
}
