import Link from "next/link"
import { Container } from "@/components/layout/container"
import { Button } from "@/components/ui/button"

const navLinks = [
  { href: "/how-it-works", label: "How It Works" },
  { href: "/creators", label: "Find Creators" },
  { href: "/hosts", label: "For Hosts" },
]

export function Navbar() {
  return (
    <header className="border-b">
      <Container>
        <nav className="flex h-16 items-center justify-between">
          <Link href="/" className="text-xl font-bold">
            CreatorStays
          </Link>
          <ul className="hidden items-center gap-6 md:flex">
            {navLinks.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" asChild className="hidden sm:inline-flex">
              <Link href="/waitlist">I&apos;m a creator</Link>
            </Button>
            <Button size="sm" asChild>
              <Link href="/creators">Find Creators</Link>
            </Button>
          </div>
        </nav>
      </Container>
    </header>
  )
}
