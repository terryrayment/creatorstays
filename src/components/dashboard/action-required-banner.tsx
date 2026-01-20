"use client"

import { useState, useEffect } from "react"
import Link from "next/link"

interface ActionItem {
  id: string
  type: string
  title: string
  description: string
  href: string
  priority: 'high' | 'medium' | 'low'
  createdAt: string
}

const typeIcons: Record<string, string> = {
  'counter-offer': '💬',
  'review-offer': '📩',
  'sign-agreement': '✍️',
  'review-content': '👀',
  'submit-content': '📤',
  'complete-payment': '💳',
  'cancellation-request': '⚠️',
  'deadline-passed': '🚨',
}

export function ActionRequiredBanner() {
  const [actionItems, setActionItems] = useState<ActionItem[]>([])
  const [loading, setLoading] = useState(true)
  const [dismissed, setDismissed] = useState(false)

  useEffect(() => {
    async function fetchActionItems() {
      try {
        const res = await fetch('/api/dashboard/action-items')
        if (res.ok) {
          const data = await res.json()
          setActionItems(data.actionItems || [])
        }
      } catch (e) {
        console.error('Failed to fetch action items:', e)
      }
      setLoading(false)
    }

    fetchActionItems()
  }, [])

  if (loading || actionItems.length === 0 || dismissed) {
    return null
  }

  const highPriorityCount = actionItems.filter(i => i.priority === 'high').length

  return (
    <div className="border-b-2 border-black bg-[#FF6B6B]">
      <div className="mx-auto max-w-6xl px-4 py-3 sm:px-6">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-black bg-white text-sm font-black text-black">
              {actionItems.length}
            </span>
            <div>
              <p className="text-sm font-bold text-black">
                {highPriorityCount > 0 
                  ? `${highPriorityCount} action${highPriorityCount > 1 ? 's' : ''} required`
                  : `${actionItems.length} item${actionItems.length > 1 ? 's' : ''} need attention`
                }
              </p>
              <p className="text-xs text-black/70">
                {actionItems[0].title}
                {actionItems.length > 1 && ` and ${actionItems.length - 1} more`}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Link
              href={actionItems[0].href}
              className="rounded-full border-2 border-black bg-black px-4 py-1.5 text-xs font-bold text-white transition-transform hover:-translate-y-0.5"
            >
              Take Action →
            </Link>
            <button
              onClick={() => setDismissed(true)}
              className="p-1 text-black/60 hover:text-black"
              aria-label="Dismiss"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Expandable list of all items */}
        {actionItems.length > 1 && (
          <div className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {actionItems.slice(0, 6).map((item) => (
              <Link
                key={item.id}
                href={item.href}
                className="flex items-center gap-2 rounded-lg border-2 border-black bg-white p-2 transition-transform hover:-translate-y-0.5"
              >
                <span className="text-base">{typeIcons[item.type] || '📋'}</span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-xs font-bold text-black">{item.title}</p>
                  <p className="truncate text-[10px] text-black/60">{item.description}</p>
                </div>
              </Link>
            ))}
          </div>
        )}

        {actionItems.length > 6 && (
          <p className="mt-2 text-center text-[10px] text-black/60">
            + {actionItems.length - 6} more items in your dashboard
          </p>
        )}
      </div>
    </div>
  )
}
