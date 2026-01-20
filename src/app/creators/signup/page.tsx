import { Suspense } from "react"
import CreatorSignupClient from "./creator-signup-client"

export default function CreatorSignupPage() {
  return (
    <Suspense fallback={null}>
      <CreatorSignupClient />
    </Suspense>
  )
}
