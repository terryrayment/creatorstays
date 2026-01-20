'use client'

import { ErrorDisplay } from '@/components/ui/error-display'

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <html>
      <body>
        <ErrorDisplay
          title="Something went wrong"
          message="We encountered an unexpected error. Our team has been notified."
          error={error}
          reset={reset}
          showHomeLink={true}
          showRetry={true}
        />
      </body>
    </html>
  )
}
