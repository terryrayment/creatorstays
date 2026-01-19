import Link from "next/link"
import { Container } from "@/components/layout/container"

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/how-it-works", label: "How It Works" },
  { href: "/creators", label: "Creators" },
  { href: "/hosts", label: "Hosts" },
  { href: "/waitlist", label: "Waitlist" },
]

export function Navbar() {
  return (
    <header className="border-b">
      <Container>
        <nav className="flex h-16 items-center justify-between">
          <Link href="/" className="text-xl font-bold">
            CreatorStays
          </Link>
          <ul className="flex items-center gap-6">
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
        </nav>
      </Container>
    </header>
  )
}
