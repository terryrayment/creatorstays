"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import { Container } from "@/components/layout/container"
import { Button } from "@/components/ui/button"

interface Collaboration {
  id: string
  status: string
  affiliateToken: string | null
  contentDeadline: string | null
  contentLinks: string[]
  contentSubmittedAt: string | null
  contentApprovedAt: string | null
  clicksGenerated: number
  createdAt: string
  creator: {
    id: string
    displayName: string
    handle: string
    user: { email: string }
  }
  host: {
    id: string
    displayName: string
    contactEmail: string
  }
  property: {
    id: string
    title: string
    cityRegion: string
    airbnbUrl: string | null
  }
  offer: {
    offerType: string
    cashCents: number
    stayNights: number | null
    trafficBonusEnabled: boolean
    trafficBonusThreshold: number | null
    trafficBonusCents: number | null
    deliverables: string[]
  }
  agreement: {
    id: string
    version: string
    agreementText: string
    hostAcceptedAt: string | null
    creatorAcceptedAt: string | null
    isFullyExecuted: boolean
    executedAt: string | null
    dealType: string
    cashAmount: number
    stayIncluded: boolean
    stayNights: number | null
    deliverables: string[]
    contentDeadline: string | null
  } | null
}

const DEAL_TYPE_LABELS: Record<string, string> = {
  "flat": "Flat Fee",
  "flat-with-bonus": "Flat Fee + Performance Bonus",
  "post-for-stay": "Post-for-Stay",
}

const STATUS_CONFIG: Record<string, { label: string; color: string; description: string }> = {
  "pending-agreement": { 
    label: "Pending Signatures", 
    color: "bg-[#FFD84A]", 
    description: "Both parties must sign the agreement" 
  },
  "active": { 
    label: "Active", 
    color: "bg-[#4AA3FF]", 
    description: "Agreement signed. Creator is working on content." 
  },
  "content-submitted": { 
    label: "Content Submitted", 
    color: "bg-[#FFD84A]", 
    description: "Waiting for host review" 
  },
  "approved": { 
    label: "Approved", 
    color: "bg-[#28D17C]", 
    description: "Content approved. Payment processing." 
  },
  "completed": { 
    label: "Completed", 
    color: "bg-[#28D17C]", 
    description: "Collaboration complete!" 
  },
  "cancelled": { 
    label: "Cancelled", 
    color: "bg-red-100", 
    description: "This collaboration was cancelled." 
  },
}

function formatCurrency(cents: number): string {
  return (cents / 100).toLocaleString("en-US", { style: "currency", currency: "USD" })
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("en-US", { 
    month: "short", 
    day: "numeric", 
    year: "numeric",
    hour: "numeric",
    minute: "2-digit"
  })
}

export default function CollaborationDetailPage() {
  const { data: session } = useSession()
  const params = useParams()
  const router = useRouter()
  const collaborationId = params.id as string

  const [collaboration, setCollaboration] = useState<Collaboration | null>(null)
  const [userRole, setUserRole] = useState<"host" | "creator" | null>(null)
  const [loading, setLoading] = useState(true)
  const [signing, setSigning] = useState(false)
  const [showAgreement, setShowAgreement] = useState(false)
  const [toast, setToast] = useState("")

  // Fetch collaboration
  useEffect(() => {
    async function fetchCollaboration() {
      try {
        const res = await fetch(`/api/collaborations/${collaborationId}/agreement`)
        if (res.ok) {
          const data = await res.json()
          setCollaboration(data.collaboration)
          setUserRole(data.userRole)
        } else if (res.status === 404) {
          router.push("/dashboard")
        }
      } catch (e) {
        console.error("Failed to fetch collaboration:", e)
      }
      setLoading(false)
    }

    if (session?.user && collaborationId) {
      fetchCollaboration()
    }
  }, [session, collaborationId, router])

  // Sign agreement
  const handleSign = async () => {
    setSigning(true)
    try {
      const res = await fetch(`/api/collaborations/${collaborationId}/agreement`, {
        method: "POST",
      })
      const data = await res.json()

      if (res.ok) {
        setToast(data.message)
        // Refresh data
        const refreshRes = await fetch(`/api/collaborations/${collaborationId}/agreement`)
        if (refreshRes.ok) {
          const refreshData = await refreshRes.json()
          setCollaboration(refreshData.collaboration)
        }
      } else {
        setToast(data.error || "Failed to sign agreement")
      }
    } catch (e) {
      console.error("Failed to sign:", e)
      setToast("Network error. Please try again.")
    }
    setSigning(false)
    setTimeout(() => setToast(""), 5000)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FAFAFA]">
        <Container className="py-12">
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-sm text-black/60">Loading collaboration...</p>
          </div>
        </Container>
      </div>
    )
  }

  if (!collaboration) {
    return (
      <div className="min-h-screen bg-[#FAFAFA]">
        <Container className="py-12">
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-sm text-black/60">Collaboration not found</p>
            <Link href="/dashboard" className="mt-4 inline-block text-sm font-bold text-black underline">
              Back to Dashboard
            </Link>
          </div>
        </Container>
      </div>
    )
  }

  const agreement = collaboration.agreement
  const statusConfig = STATUS_CONFIG[collaboration.status] || STATUS_CONFIG["pending-agreement"]
  const hasUserSigned = userRole === "host" 
    ? !!agreement?.hostAcceptedAt 
    : !!agreement?.creatorAcceptedAt
  const hasOtherSigned = userRole === "host"
    ? !!agreement?.creatorAcceptedAt
    : !!agreement?.hostAcceptedAt
  const isFullyExecuted = agreement?.isFullyExecuted

  return (
    <div className="min-h-screen bg-[#FAFAFA]">
      {/* Top bar */}
      <div className="border-b-2 border-black bg-white">
        <div className="mx-auto flex h-12 max-w-6xl items-center justify-between px-4 sm:px-6">
          <div className="flex items-center gap-2">
            <span className={`rounded-full border-2 border-black px-3 py-0.5 text-[10px] font-black uppercase tracking-wider text-black ${statusConfig.color}`}>
              {statusConfig.label}
            </span>
          </div>
          <Link 
            href={userRole === "host" ? "/dashboard/host" : "/dashboard/creator"} 
            className="rounded-full border-2 border-black bg-white px-4 py-1 text-[10px] font-black uppercase tracking-wider text-black transition-transform hover:-translate-y-0.5"
          >
            ← Back to Dashboard
          </Link>
        </div>
      </div>

      <Container className="py-8">
        <div className="mx-auto max-w-2xl space-y-6">
          {/* Toast */}
          {toast && (
            <div className="rounded-xl border-2 border-black bg-[#28D17C] px-4 py-3 text-sm font-bold text-black">
              ✓ {toast}
            </div>
          )}

          {/* Header */}
          <div>
            <h1 className="font-heading text-[2rem] font-black tracking-tight text-black">
              COLLABORATION
            </h1>
            <p className="mt-1 text-sm text-black/70">{statusConfig.description}</p>
          </div>

          {/* Parties Card */}
          <div className="rounded-2xl border-[3px] border-black bg-white overflow-hidden">
            <div className="grid sm:grid-cols-2">
              {/* Host */}
              <div className="border-b-2 sm:border-b-0 sm:border-r-2 border-black p-5">
                <p className="text-[10px] font-bold uppercase tracking-wider text-black/60">Host</p>
                <p className="mt-1 text-lg font-bold text-black">{collaboration.host.displayName}</p>
                <p className="text-xs text-black/60">{collaboration.host.contactEmail}</p>
                <div className="mt-3">
                  {agreement?.hostAcceptedAt ? (
                    <span className="inline-flex items-center gap-1 rounded-full border-2 border-black bg-[#28D17C] px-3 py-1 text-[10px] font-bold text-black">
                      ✓ Signed {formatDate(agreement.hostAcceptedAt)}
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 rounded-full border-2 border-black bg-[#FFD84A] px-3 py-1 text-[10px] font-bold text-black">
                      ⏳ Awaiting signature
                    </span>
                  )}
                </div>
              </div>
              
              {/* Creator */}
              <div className="p-5">
                <p className="text-[10px] font-bold uppercase tracking-wider text-black/60">Creator</p>
                <p className="mt-1 text-lg font-bold text-black">{collaboration.creator.displayName}</p>
                <p className="text-xs text-black/60">@{collaboration.creator.handle}</p>
                <div className="mt-3">
                  {agreement?.creatorAcceptedAt ? (
                    <span className="inline-flex items-center gap-1 rounded-full border-2 border-black bg-[#28D17C] px-3 py-1 text-[10px] font-bold text-black">
                      ✓ Signed {formatDate(agreement.creatorAcceptedAt)}
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 rounded-full border-2 border-black bg-[#FFD84A] px-3 py-1 text-[10px] font-bold text-black">
                      ⏳ Awaiting signature
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Property & Deal Card */}
          <div className="rounded-2xl border-[3px] border-black bg-[#4AA3FF] p-5">
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-black/60">Property</p>
                <p className="mt-1 font-bold text-black">{collaboration.property.title}</p>
                <p className="text-sm text-black">{collaboration.property.cityRegion}</p>
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-black/60">Deal Type</p>
                <p className="mt-1 font-bold text-black">
                  {DEAL_TYPE_LABELS[collaboration.offer.offerType] || collaboration.offer.offerType}
                </p>
              </div>
            </div>

            {/* Compensation */}
            <div className="mt-4 rounded-xl border-2 border-black bg-white p-4">
              <p className="text-[10px] font-bold uppercase tracking-wider text-black/60">Compensation</p>
              <div className="mt-2 flex flex-wrap items-baseline gap-4">
                {collaboration.offer.cashCents > 0 && (
                  <div>
                    <span className="text-2xl font-black text-black">
                      {formatCurrency(collaboration.offer.cashCents)}
                    </span>
                    <span className="ml-1 text-xs text-black/60">base</span>
                  </div>
                )}
                {collaboration.offer.offerType === "post-for-stay" && collaboration.offer.stayNights && (
                  <div>
                    <span className="text-2xl font-black text-black">
                      {collaboration.offer.stayNights}
                    </span>
                    <span className="ml-1 text-xs text-black/60">nights stay</span>
                  </div>
                )}
                {collaboration.offer.trafficBonusEnabled && collaboration.offer.trafficBonusCents && (
                  <div className="text-[#28D17C]">
                    <span className="text-lg font-black">
                      +{formatCurrency(collaboration.offer.trafficBonusCents)}
                    </span>
                    <span className="ml-1 text-xs">
                      at {collaboration.offer.trafficBonusThreshold?.toLocaleString()} clicks
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Deliverables */}
            <div className="mt-4">
              <p className="text-[10px] font-bold uppercase tracking-wider text-black/60">Deliverables</p>
              <div className="mt-2 flex flex-wrap gap-2">
                {collaboration.offer.deliverables.map((d) => (
                  <span key={d} className="rounded-full border-2 border-black bg-white px-3 py-1 text-xs font-bold text-black">
                    {d}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Agreement Section */}
          {agreement && (
            <div className="rounded-2xl border-[3px] border-black bg-white p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-black/60">
                    Collaboration Agreement
                  </p>
                  <p className="text-xs text-black/60">Version {agreement.version}</p>
                </div>
                <button
                  onClick={() => setShowAgreement(!showAgreement)}
                  className="rounded-full border-2 border-black bg-black/5 px-3 py-1 text-[10px] font-bold text-black hover:bg-black/10"
                >
                  {showAgreement ? "Hide" : "View Full Agreement"}
                </button>
              </div>

              {showAgreement && (
                <div className="mt-4 max-h-96 overflow-y-auto rounded-lg border-2 border-black bg-black/5 p-4">
                  <pre className="whitespace-pre-wrap font-mono text-xs text-black">
                    {agreement.agreementText}
                  </pre>
                </div>
              )}

              {/* Sign Button */}
              {!isFullyExecuted && !hasUserSigned && (
                <div className="mt-4 border-t-2 border-black/10 pt-4">
                  <p className="mb-3 text-sm text-black">
                    By signing, you agree to all terms in the agreement above.
                  </p>
                  <Button
                    onClick={handleSign}
                    disabled={signing}
                    className="w-full rounded-full border-[3px] border-black bg-[#28D17C] py-4 text-sm font-black uppercase tracking-wider text-black transition-transform hover:-translate-y-1 hover:bg-[#28D17C]/90"
                  >
                    {signing ? "Signing..." : "✍️ Sign Agreement"}
                  </Button>
                </div>
              )}

              {/* Already Signed */}
              {!isFullyExecuted && hasUserSigned && !hasOtherSigned && (
                <div className="mt-4 rounded-xl border-2 border-black bg-[#FFD84A] p-4 text-center">
                  <p className="font-bold text-black">You've signed! ✓</p>
                  <p className="mt-1 text-sm text-black">
                    Waiting for {userRole === "host" ? "creator" : "host"} to sign...
                  </p>
                </div>
              )}

              {/* Fully Executed */}
              {isFullyExecuted && (
                <div className="mt-4 rounded-xl border-2 border-black bg-[#28D17C] p-4 text-center">
                  <p className="text-lg font-black text-black">✓ Agreement Fully Executed</p>
                  <p className="mt-1 text-sm text-black">
                    Signed on {formatDate(agreement.executedAt!)}
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Tracking Link (only show when agreement is executed) */}
          {isFullyExecuted && collaboration.affiliateToken && (
            <div className="rounded-2xl border-[3px] border-black bg-[#FFD84A] p-5">
              <p className="text-[10px] font-bold uppercase tracking-wider text-black/60">
                Your Tracking Link
              </p>
              <div className="mt-2 flex items-center gap-2">
                <code className="flex-1 rounded-lg border-2 border-black bg-white px-4 py-3 font-mono text-sm text-black">
                  https://creatorstays.com/r/{collaboration.affiliateToken}
                </code>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(`https://creatorstays.com/r/${collaboration.affiliateToken}`)
                    setToast("Link copied!")
                  }}
                  className="rounded-full border-2 border-black bg-black px-4 py-3 text-[10px] font-bold text-white hover:bg-black/80"
                >
                  Copy
                </button>
              </div>
              <p className="mt-2 text-xs text-black/70">
                Use this link in your content. Clicks are tracked automatically.
              </p>
              
              {/* Stats */}
              <div className="mt-4 grid grid-cols-2 gap-3">
                <div className="rounded-lg border-2 border-black bg-white p-3 text-center">
                  <p className="text-2xl font-black text-black">{collaboration.clicksGenerated}</p>
                  <p className="text-[10px] font-bold text-black/60">Clicks</p>
                </div>
                <div className="rounded-lg border-2 border-black bg-white p-3 text-center">
                  <p className="text-2xl font-black text-black">
                    {collaboration.contentDeadline 
                      ? Math.max(0, Math.ceil((new Date(collaboration.contentDeadline).getTime() - Date.now()) / (1000 * 60 * 60 * 24)))
                      : "—"}
                  </p>
                  <p className="text-[10px] font-bold text-black/60">Days Left</p>
                </div>
              </div>
            </div>
          )}

          {/* Content Submission (for creators when agreement is executed) */}
          {isFullyExecuted && userRole === "creator" && collaboration.status === "active" && (
            <div className="rounded-2xl border-[3px] border-black bg-white p-5">
              <p className="text-[10px] font-bold uppercase tracking-wider text-black/60">
                Submit Your Content
              </p>
              <p className="mt-1 text-sm text-black/70">
                Once you've posted your content, submit the links for host review.
              </p>
              <Link
                href={`/dashboard/collaborations/${collaboration.id}/submit`}
                className="mt-4 block rounded-full border-2 border-black bg-black py-3 text-center text-sm font-bold text-white transition-transform hover:-translate-y-1"
              >
                Submit Content Links →
              </Link>
            </div>
          )}

          {/* Content Review (for hosts when content is submitted) */}
          {collaboration.status === "content-submitted" && userRole === "host" && (
            <div className="rounded-2xl border-[3px] border-black bg-[#FFD84A] p-5">
              <p className="text-[10px] font-bold uppercase tracking-wider text-black/60">
                Review Content
              </p>
              <p className="mt-1 text-sm text-black">
                The creator has submitted their content for review.
              </p>
              {collaboration.contentLinks.length > 0 && (
                <div className="mt-3 space-y-2">
                  {collaboration.contentLinks.map((link, i) => (
                    <a
                      key={i}
                      href={link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block rounded-lg border-2 border-black bg-white px-4 py-2 text-sm font-bold text-black hover:bg-black/5"
                    >
                      📱 View Content {i + 1} →
                    </a>
                  ))}
                </div>
              )}
              <div className="mt-4 flex gap-2">
                <Button 
                  className="flex-1 bg-[#28D17C] text-black hover:bg-[#28D17C]/90"
                  onClick={async () => {
                    const res = await fetch(`/api/collaborations/${collaboration.id}/content`, {
                      method: "PATCH",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({ action: "approve" }),
                    })
                    if (res.ok) {
                      setToast("Content approved!")
                      // Refresh page
                      window.location.reload()
                    }
                  }}
                >
                  Approve Content
                </Button>
                <Button 
                  variant="outline" 
                  className="flex-1"
                  onClick={async () => {
                    const feedback = prompt("What changes do you need?")
                    if (feedback !== null) {
                      const res = await fetch(`/api/collaborations/${collaboration.id}/content`, {
                        method: "PATCH",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ action: "request-changes", feedback }),
                      })
                      if (res.ok) {
                        setToast("Change request sent to creator")
                        window.location.reload()
                      }
                    }
                  }}
                >
                  Request Changes
                </Button>
              </div>
            </div>
          )}

          {/* Pay Now (for hosts when content is approved) */}
          {collaboration.status === "approved" && userRole === "host" && collaboration.offer.cashCents > 0 && (
            <div className="rounded-2xl border-[3px] border-black bg-[#28D17C] p-5">
              <p className="text-[10px] font-bold uppercase tracking-wider text-black/60">
                Ready for Payment
              </p>
              <p className="mt-1 text-sm text-black">
                Content has been approved. Complete payment to finalize this collaboration.
              </p>
              <div className="mt-4 rounded-xl border-2 border-black bg-white p-4">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-black">Total Due</span>
                  <span className="text-2xl font-black text-black">
                    {formatCurrency(Math.round(collaboration.offer.cashCents * 1.15))}
                  </span>
                </div>
                <p className="mt-1 text-xs text-black/60">
                  Includes 15% platform fee
                </p>
              </div>
              <Link
                href={`/dashboard/host/pay/${collaboration.id}`}
                className="mt-4 block rounded-full border-2 border-black bg-black py-4 text-center text-sm font-black uppercase tracking-wider text-white transition-transform hover:-translate-y-1"
              >
                Pay Now →
              </Link>
            </div>
          )}

          {/* Completed (show payment confirmation) */}
          {collaboration.status === "completed" && (
            <div className="rounded-2xl border-[3px] border-black bg-[#28D17C] p-5 text-center">
              <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-full border-2 border-black bg-white">
                <span className="text-2xl">✓</span>
              </div>
              <p className="text-lg font-black text-black">Collaboration Complete!</p>
              <p className="mt-1 text-sm text-black">
                Payment has been processed. Thank you for using CreatorStays.
              </p>
            </div>
          )}
        </div>
      </Container>
    </div>
  )
}
