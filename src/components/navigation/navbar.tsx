import Link from "next/link"
import { Container } from "@/components/layout/container"
import { Button } from "@/components/ui/button"

const navLinks = [
  { href: "/how-it-works", label: "How It Works" },
  { href: "/hosts", label: "For Hosts" },
  { href: "/waitlist", label: "For Creators" },
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
            <Button variant="outline" size="sm" asChild>
              <Link href="/waitlist">Join Waitlist</Link>
            </Button>
            <Button size="sm" asChild>
              <Link href="/hosts">Host Signup</Link>
            </Button>
          </div>
        </nav>
      </Container>
    </header>
  )
}
