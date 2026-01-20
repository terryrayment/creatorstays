'use client'

import { ErrorDisplay } from '@/components/ui/error-display'

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <div className="min-h-screen bg-[#FAFAFA] py-12">
      <div className="mx-auto max-w-xl px-4">
        <ErrorDisplay
          title="Dashboard Error"
          message="We couldn't load this page. This might be a temporary issue."
          error={error}
          reset={reset}
          variant="card"
          showHomeLink={true}
          showRetry={true}
        />
      </div>
    </div>
  )
}
