import { Suspense } from "react"
import LoginErrorClient from "./login-error-client"

export default function Page() {
  return (
    <Suspense fallback={null}>
      <LoginErrorClient />
    </Suspense>
  )
}
