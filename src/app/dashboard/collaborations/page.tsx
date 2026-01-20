"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import Link from "next/link"
import { Container } from "@/components/layout/container"
import { getCollaborationStatusDisplay, type UserRole } from "@/lib/status-display"

interface Collaboration {
  id: string
  status: string
  affiliateToken: string | null
  clicksGenerated: number
  createdAt: string
  creator?: {
    displayName: string
    handle: string
  }
  host?: {
    displayName: string
  }
  property: {
    title: string
    cityRegion: string
  }
  offer: {
    offerType: string
    cashCents: number
    deliverables: string[]
  }
  agreement?: {
    isFullyExecuted: boolean
    hostSignedAt?: string
    creatorSignedAt?: string
  }
}

function formatCurrency(cents: number): string {
  return (cents / 100).toLocaleString("en-US", { style: "currency", currency: "USD" })
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("en-US", { month: "short", day: "numeric" })
}

export default function CollaborationsListPage() {
  const { data: session } = useSession()
  const [collaborations, setCollaborations] = useState<Collaboration[]>([])
  const [loading, setLoading] = useState(true)
  const [userRole, setUserRole] = useState<"host" | "creator" | null>(null)

  useEffect(() => {
    async function fetchCollaborations() {
      try {
        const res = await fetch("/api/collaborations/list")
        if (res.ok) {
          const data = await res.json()
          setCollaborations(data.collaborations || [])
          // Determine role based on first collaboration
          if (data.collaborations?.[0]?.creator) {
            setUserRole("host")
          } else if (data.collaborations?.[0]?.host) {
            setUserRole("creator")
          }
        }
      } catch (e) {
        console.error("Failed to fetch collaborations:", e)
      }
      setLoading(false)
    }

    if (session?.user) {
      fetchCollaborations()
    }
  }, [session])

  const backLink = userRole === "host" ? "/dashboard/host" : "/dashboard/creator"

  return (
    <div className="min-h-screen bg-[#FAFAFA]">
      {/* Top bar */}
      <div className="border-b-2 border-black bg-white">
        <div className="mx-auto flex h-12 max-w-6xl items-center justify-between px-4 sm:px-6">
          <div className="flex items-center gap-2">
            <span className="rounded-full border-2 border-black bg-[#4AA3FF] px-3 py-0.5 text-[10px] font-black uppercase tracking-wider text-black">
              Collaborations
            </span>
          </div>
          <Link 
            href={backLink}
            className="rounded-full border-2 border-black bg-white px-4 py-1 text-[10px] font-black uppercase tracking-wider text-black transition-transform hover:-translate-y-0.5"
          >
            ← Back to Dashboard
          </Link>
        </div>
      </div>

      <Container className="py-8">
        <div className="mx-auto max-w-3xl">
          {/* Header */}
          <div className="mb-6">
            <h1 className="font-heading text-[2rem] font-black tracking-tight text-black">
              YOUR COLLABORATIONS
            </h1>
            <p className="mt-1 text-sm text-black/70">
              Track all your active and past collaborations.
            </p>
          </div>

          {/* Stats */}
          <div className="mb-6 grid grid-cols-3 gap-4">
            <div className="rounded-xl border-2 border-black bg-[#FFD84A] p-4 text-center">
              <p className="text-2xl font-black text-black">
                {collaborations.filter(c => ["pending-agreement", "active", "content-submitted"].includes(c.status)).length}
              </p>
              <p className="text-[10px] font-bold text-black/60">Active</p>
            </div>
            <div className="rounded-xl border-2 border-black bg-[#28D17C] p-4 text-center">
              <p className="text-2xl font-black text-black">
                {collaborations.filter(c => c.status === "completed").length}
              </p>
              <p className="text-[10px] font-bold text-black/60">Completed</p>
            </div>
            <div className="rounded-xl border-2 border-black bg-white p-4 text-center">
              <p className="text-2xl font-black text-black">
                {collaborations.reduce((sum, c) => sum + c.clicksGenerated, 0)}
              </p>
              <p className="text-[10px] font-bold text-black/60">Total Clicks</p>
            </div>
          </div>

          {/* List */}
          {loading ? (
            <div className="rounded-2xl border-[3px] border-black bg-white p-8 text-center">
              <p className="text-sm text-black/60">Loading collaborations...</p>
            </div>
          ) : collaborations.length === 0 ? (
            <div className="rounded-2xl border-[3px] border-black bg-white p-8 text-center">
              <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full border-2 border-black/20 bg-black/5">
                <svg className="h-6 w-6 text-black/40" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" />
                </svg>
              </div>
              <p className="font-bold text-black">No collaborations yet</p>
              <p className="mt-1 text-sm text-black/60">
                {userRole === "host" 
                  ? "Find creators and send your first offer to get started."
                  : "When you accept an offer from a host, it will appear here."}
              </p>
              {userRole === "host" && (
                <Link
                  href="/dashboard/host/search-creators"
                  className="mt-4 inline-block rounded-full border-2 border-black bg-black px-6 py-2 text-xs font-bold text-white transition-transform hover:-translate-y-1"
                >
                  Find Creators
                </Link>
              )}
            </div>
          ) : (
            <div className="space-y-3">
              {collaborations.map((collab) => {
                const otherParty = userRole === "host" ? collab.creator : collab.host
                
                // Determine if current user has signed
                const hasUserSigned = userRole === "host" 
                  ? !!collab.agreement?.hostSignedAt 
                  : !!collab.agreement?.creatorSignedAt
                
                const statusDisplay = getCollaborationStatusDisplay(
                  collab.status, 
                  userRole as UserRole,
                  { 
                    hasUserSigned, 
                    isFullyExecuted: collab.agreement?.isFullyExecuted 
                  }
                )

                return (
                  <Link
                    key={collab.id}
                    href={`/dashboard/collaborations/${collab.id}`}
                    className="block rounded-2xl border-[3px] border-black bg-white p-4 transition-transform hover:-translate-y-1"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <span className={`rounded-full border border-black px-2 py-0.5 text-[9px] font-bold ${statusDisplay.textColor} ${statusDisplay.color}`}>
                            {statusDisplay.label}
                          </span>
                          {statusDisplay.actionRequired && (
                            <span className="rounded-full bg-[#FF6B6B] px-2 py-0.5 text-[9px] font-bold text-white">
                              Action Required
                            </span>
                          )}
                          <span className="text-[10px] text-black/50">
                            {formatDate(collab.createdAt)}
                          </span>
                        </div>
                        <p className="mt-2 font-bold text-black">{collab.property.title}</p>
                        <p className="text-sm text-black/60">{collab.property.cityRegion}</p>
                        <div className="mt-2 flex items-center gap-3 text-xs">
                          <span className="text-black/60">
                            {userRole === "host" ? "Creator:" : "Host:"}{" "}
                            <span className="font-bold text-black">
                              {otherParty?.displayName || "Unknown"}
                            </span>
                          </span>
                          {collab.offer.cashCents > 0 && (
                            <span className="font-bold text-black">
                              {formatCurrency(collab.offer.cashCents)}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-black text-black">{collab.clicksGenerated}</p>
                        <p className="text-[10px] text-black/60">clicks</p>
                      </div>
                    </div>

                    {/* Deliverables */}
                    <div className="mt-3 flex flex-wrap gap-1">
                      {collab.offer.deliverables.slice(0, 3).map((d) => (
                        <span key={d} className="rounded-full border border-black/20 bg-black/5 px-2 py-0.5 text-[9px] font-bold text-black">
                          {d}
                        </span>
                      ))}
                      {collab.offer.deliverables.length > 3 && (
                        <span className="text-[9px] text-black/50">
                          +{collab.offer.deliverables.length - 3} more
                        </span>
                      )}
                    </div>

                    {/* Action hint - now driven by statusDisplay */}
                    {statusDisplay.actionRequired && statusDisplay.description && (
                      <div className="mt-3 rounded-lg bg-[#FFD84A]/30 px-3 py-2 text-xs font-bold text-black">
                        ⚠️ {statusDisplay.description}
                      </div>
                    )}
                  </Link>
                )
              })}
            </div>
          )}
        </div>
      </Container>
    </div>
  )
}
