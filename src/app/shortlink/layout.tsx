import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "→",
  description: "",
  robots: "noindex, nofollow",
}

export default function ShortLinkLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
