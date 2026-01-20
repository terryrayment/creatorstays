'use client'

import { useEffect } from 'react'
import Link from 'next/link'

/**
 * Error display component for showing user-friendly error messages
 * Used by error.tsx files and for API error states
 */

interface ErrorDisplayProps {
  title?: string
  message?: string
  error?: Error & { digest?: string }
  reset?: () => void
  showHomeLink?: boolean
  showRetry?: boolean
  variant?: 'page' | 'card' | 'inline'
}

export function ErrorDisplay({
  title = "Something went wrong",
  message = "We encountered an unexpected error. Please try again.",
  error,
  reset,
  showHomeLink = true,
  showRetry = true,
  variant = 'page'
}: ErrorDisplayProps) {
  
  // Log error to console in development
  useEffect(() => {
    if (error) {
      console.error('[ErrorDisplay]', error)
    }
  }, [error])

  if (variant === 'inline') {
    return (
      <div className="rounded-xl border-2 border-red-300 bg-red-50 p-4">
        <div className="flex items-start gap-3">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-red-100">
            <svg className="h-4 w-4 text-red-600" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
            </svg>
          </div>
          <div className="flex-1">
            <p className="text-sm font-bold text-red-800">{title}</p>
            <p className="mt-1 text-xs text-red-600">{message}</p>
            {showRetry && reset && (
              <button
                onClick={reset}
                className="mt-2 text-xs font-bold text-red-700 underline hover:text-red-900"
              >
                Try again
              </button>
            )}
          </div>
        </div>
      </div>
    )
  }

  if (variant === 'card') {
    return (
      <div className="rounded-2xl border-[3px] border-black bg-white p-6 text-center">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full border-[3px] border-red-300 bg-red-50">
          <svg className="h-7 w-7 text-red-500" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
          </svg>
        </div>
        <h3 className="text-lg font-black text-black">{title}</h3>
        <p className="mt-2 text-sm text-black/60">{message}</p>
        
        <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:justify-center">
          {showRetry && reset && (
            <button
              onClick={reset}
              className="rounded-full border-[3px] border-black bg-black px-5 py-2 text-xs font-bold text-white transition-transform hover:-translate-y-0.5"
            >
              Try Again
            </button>
          )}
          {showHomeLink && (
            <Link
              href="/"
              className="rounded-full border-[3px] border-black bg-white px-5 py-2 text-xs font-bold text-black transition-transform hover:-translate-y-0.5"
            >
              Go Home
            </Link>
          )}
        </div>
      </div>
    )
  }

  // Full page variant (default)
  return (
    <div className="min-h-screen bg-black px-4 py-20">
      <div className="mx-auto max-w-md">
        <div className="rounded-2xl border-[3px] border-black bg-[#FF6B6B] p-8 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full border-[3px] border-black bg-white">
            <svg className="h-8 w-8 text-black" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
            </svg>
          </div>
          
          <h1 className="font-heading text-[2rem] leading-[0.9] tracking-tight text-black" style={{ fontWeight: 900 }}>
            {title.toUpperCase()}
          </h1>
          
          <p className="mt-4 text-sm font-medium text-black/80">
            {message}
          </p>

          {error?.digest && (
            <p className="mt-2 text-xs text-black/50">
              Error ID: {error.digest}
            </p>
          )}
          
          <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center">
            {showRetry && reset && (
              <button
                onClick={reset}
                className="rounded-full border-[3px] border-black bg-black px-6 py-3 text-sm font-black uppercase tracking-wider text-white transition-transform hover:-translate-y-0.5"
              >
                Try Again
              </button>
            )}
            {showHomeLink && (
              <Link
                href="/"
                className="rounded-full border-[3px] border-black bg-white px-6 py-3 text-sm font-black uppercase tracking-wider text-black transition-transform hover:-translate-y-0.5"
              >
                Go Home
              </Link>
            )}
          </div>
        </div>

        {/* Help text */}
        <div className="mt-4 text-center">
          <p className="text-xs text-white/40">
            If this keeps happening, please{' '}
            <Link href="/help" className="text-white/60 underline hover:text-white">
              contact support
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}

/**
 * API Error display for failed data fetches
 */
interface ApiErrorProps {
  message?: string
  onRetry?: () => void
}

export function ApiError({ 
  message = "Failed to load data", 
  onRetry 
}: ApiErrorProps) {
  return (
    <div className="rounded-xl border-2 border-black/20 bg-black/5 p-6 text-center">
      <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full border-2 border-black/20 bg-white">
        <svg className="h-6 w-6 text-black/40" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
        </svg>
      </div>
      <p className="text-sm font-bold text-black/70">{message}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="mt-3 rounded-full border-2 border-black bg-black px-4 py-2 text-xs font-bold text-white transition-transform hover:-translate-y-0.5"
        >
          Retry
        </button>
      )}
    </div>
  )
}

/**
 * Empty state display
 */
interface EmptyStateProps {
  icon?: React.ReactNode
  title: string
  description?: string
  action?: {
    label: string
    href?: string
    onClick?: () => void
  }
}

export function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="rounded-2xl border-[3px] border-dashed border-black/20 bg-black/5 p-8 text-center">
      {icon && (
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full border-2 border-black/20 bg-white">
          {icon}
        </div>
      )}
      <h3 className="text-lg font-black text-black">{title}</h3>
      {description && (
        <p className="mt-2 text-sm text-black/60">{description}</p>
      )}
      {action && (
        action.href ? (
          <Link
            href={action.href}
            className="mt-4 inline-flex items-center gap-2 rounded-full border-[3px] border-black bg-black px-5 py-2 text-xs font-bold text-white transition-transform hover:-translate-y-0.5"
          >
            {action.label}
            <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
            </svg>
          </Link>
        ) : (
          <button
            onClick={action.onClick}
            className="mt-4 inline-flex items-center gap-2 rounded-full border-[3px] border-black bg-black px-5 py-2 text-xs font-bold text-white transition-transform hover:-translate-y-0.5"
          >
            {action.label}
          </button>
        )
      )}
    </div>
  )
}
