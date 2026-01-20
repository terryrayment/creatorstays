"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import { Container } from "@/components/layout/container"
import { Button } from "@/components/ui/button"
import { PropertyGallery } from "@/components/properties/property-gallery"
import { TrafficBonusTracker } from "@/components/shared/traffic-bonus-tracker"
import { PayoutTracker } from "@/components/shared/payout-tracker"
import { getCollaborationStatusDisplay, type UserRole } from "@/lib/status-display"

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
  paymentStatus: string
  paidAt: string | null
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
    heroImageUrl?: string
    photos?: string[]
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

interface NextStepInfo {
  title: string
  description: string
  action?: string
  actionHref?: string
  waiting?: boolean
  waitingFor?: string
}

function getNextStep(
  status: string,
  userRole: "host" | "creator",
  hasUserSigned: boolean,
  hasOtherSigned: boolean,
  isFullyExecuted: boolean,
  cashCents: number,
  collaborationId: string
): NextStepInfo | null {
  // Pending agreement phase
  if (status === "pending-agreement") {
    if (!hasUserSigned) {
      return {
        title: "Sign the Agreement",
        description: "Review and sign the collaboration agreement below to proceed.",
        action: "Sign Agreement",
      }
    }
    if (hasUserSigned && !hasOtherSigned) {
      const otherParty = userRole === "host" ? "creator" : "host"
      return {
        title: "Waiting for Signature",
        description: `You have signed. Waiting for the ${otherParty} to sign the agreement.`,
        waiting: true,
        waitingFor: otherParty,
      }
    }
  }

  // Active phase - agreement signed
  if (status === "active") {
    if (userRole === "creator") {
      return {
        title: "Create and Submit Content",
        description: "Post your content using the tracking link, then submit the links for review.",
        action: "Submit Content",
        actionHref: `/dashboard/collaborations/${collaborationId}/submit`,
      }
    }
    if (userRole === "host") {
      return {
        title: "Waiting for Content",
        description: "The creator is working on content. You will be notified when it is submitted for review.",
        waiting: true,
        waitingFor: "creator to submit content",
      }
    }
  }

  // Content submitted phase
  if (status === "content-submitted") {
    if (userRole === "host") {
      return {
        title: "Review Submitted Content",
        description: "The creator has submitted content. Review it below and approve or request changes.",
        action: "Review Content",
      }
    }
    if (userRole === "creator") {
      return {
        title: "Waiting for Review",
        description: "Your content has been submitted. Waiting for the host to review and approve.",
        waiting: true,
        waitingFor: "host to review",
      }
    }
  }

  // Approved phase
  if (status === "approved") {
    if (userRole === "host" && cashCents > 0) {
      return {
        title: "Complete Payment",
        description: "Content has been approved. Complete payment to finalize the collaboration.",
        action: "Pay Now",
        actionHref: `/dashboard/host/pay/${collaborationId}`,
      }
    }
    if (userRole === "creator") {
      return {
        title: "Payment Processing",
        description: "Your content was approved! The host is completing payment.",
        waiting: true,
        waitingFor: "payment",
      }
    }
  }

  // Completed
  if (status === "completed") {
    return {
      title: "Collaboration Complete",
      description: "This collaboration has been successfully completed. Thank you!",
    }
  }

  // Cancelled
  if (status === "cancelled") {
    return {
      title: "Collaboration Cancelled",
      description: "This collaboration was cancelled and is no longer active.",
    }
  }

  return null
}

function NextStepBanner({ nextStep, collaborationId }: { nextStep: NextStepInfo; collaborationId: string }) {
  const isWaiting = nextStep.waiting
  const bgColor = isWaiting ? "bg-[#FFD84A]" : "bg-[#28D17C]"
  
  return (
    <div className={`rounded-2xl border-[3px] border-black ${bgColor} p-5`}>
      <div className="flex items-start gap-4">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-2 border-black bg-white">
          {isWaiting ? (
            <svg className="h-5 w-5 text-black" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          ) : (
            <svg className="h-5 w-5 text-black" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          )}
        </div>
        <div className="flex-1">
          <p className="text-[10px] font-bold uppercase tracking-wider text-black/60">
            {isWaiting ? "Waiting" : "Your Next Step"}
          </p>
          <p className="mt-1 text-lg font-black text-black">{nextStep.title}</p>
          <p className="mt-1 text-sm text-black/80">{nextStep.description}</p>
          {nextStep.action && nextStep.actionHref && (
            <Link
              href={nextStep.actionHref}
              className="mt-3 inline-flex items-center gap-2 rounded-full border-2 border-black bg-black px-5 py-2 text-xs font-bold text-white transition-transform hover:-translate-y-0.5"
            >
              {nextStep.action}
              <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
              </svg>
            </Link>
          )}
        </div>
      </div>
    </div>
  )
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
  const [cancelling, setCancelling] = useState(false)
  const [showCancelModal, setShowCancelModal] = useState(false)
  const [cancelReason, setCancelReason] = useState("")

  // Handle cancel request
  const handleCancelRequest = async () => {
    if (!confirm("Are you sure you want to request cancellation? The other party will need to approve this.")) {
      return
    }
    setCancelling(true)
    try {
      const res = await fetch(`/api/collaborations/${collaborationId}/cancel`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "request", reason: cancelReason }),
      })
      const data = await res.json()
      if (res.ok) {
        setToast(data.message)
        setShowCancelModal(false)
        setCancelReason("")
        // Refresh
        window.location.reload()
      } else {
        setToast(data.error || "Failed to request cancellation")
      }
    } catch (e) {
      setToast("Network error. Please try again.")
    }
    setCancelling(false)
  }

  // Handle accept/decline cancellation
  const handleCancellationResponse = async (action: "accept" | "decline") => {
    const confirmMsg = action === "accept" 
      ? "Are you sure you want to accept the cancellation? This will end the collaboration."
      : "Are you sure you want to decline the cancellation? The collaboration will continue."
    
    if (!confirm(confirmMsg)) return
    
    setCancelling(true)
    try {
      const res = await fetch(`/api/collaborations/${collaborationId}/cancel`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      })
      const data = await res.json()
      if (res.ok) {
        setToast(data.message)
        window.location.reload()
      } else {
        setToast(data.error || "Failed to respond to cancellation")
      }
    } catch (e) {
      setToast("Network error. Please try again.")
    }
    setCancelling(false)
  }

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
        
        // For post-for-stay deals: redirect host to pay $99 platform fee after signing
        if (
          userRole === "host" && 
          collaboration?.offer.offerType === "post-for-stay" &&
          data.fullyExecuted
        ) {
          // Agreement is now fully executed, redirect to pay platform fee
          const feeRes = await fetch('/api/payments/platform-fee', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ collaborationId }),
          })
          const feeData = await feeRes.json()
          
          if (feeRes.ok && feeData.url) {
            // Redirect to Stripe Checkout
            window.location.href = feeData.url
            return
          } else if (feeData.alreadyPaid) {
            // Fee already paid, just refresh
            setToast("Agreement signed! Platform fee already paid.")
          } else {
            setToast("Agreement signed! Please complete the $99 platform fee payment.")
          }
        }
        
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
  const hasUserSigned = userRole === "host" 
    ? !!agreement?.hostAcceptedAt 
    : !!agreement?.creatorAcceptedAt
  const hasOtherSigned = userRole === "host"
    ? !!agreement?.creatorAcceptedAt
    : !!agreement?.hostAcceptedAt
  const isFullyExecuted = agreement?.isFullyExecuted
  
  const statusDisplay = getCollaborationStatusDisplay(
    collaboration.status,
    userRole as UserRole,
    { hasUserSigned, isFullyExecuted: isFullyExecuted || false }
  )

  return (
    <div className="min-h-screen bg-[#FAFAFA]">
      {/* Top bar */}
      <div className="border-b-2 border-black bg-white">
        <div className="mx-auto flex h-12 max-w-6xl items-center justify-between px-4 sm:px-6">
          <div className="flex items-center gap-2">
            <span className={`rounded-full border-2 border-black px-3 py-0.5 text-[10px] font-black uppercase tracking-wider ${statusDisplay.textColor} ${statusDisplay.color}`}>
              {statusDisplay.label}
            </span>
            {statusDisplay.actionRequired && (
              <span className="rounded-full bg-[#FF6B6B] px-2 py-0.5 text-[9px] font-bold text-white">
                Action Required
              </span>
            )}
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
            <p className="mt-1 text-sm text-black/70">{statusDisplay.description}</p>
          </div>

          {/* Next Step Banner */}
          {userRole && (() => {
            const nextStep = getNextStep(
              collaboration.status,
              userRole,
              hasUserSigned,
              hasOtherSigned,
              isFullyExecuted || false,
              collaboration.offer.cashCents,
              collaboration.id
            )
            return nextStep ? <NextStepBanner nextStep={nextStep} collaborationId={collaboration.id} /> : null
          })()}

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

          {/* Property Gallery */}
          {collaboration.property && (collaboration.property.heroImageUrl || (collaboration.property.photos && collaboration.property.photos.length > 0)) && (
            <div className="rounded-2xl border-[3px] border-black overflow-hidden">
              <PropertyGallery 
                photos={collaboration.property.photos || []}
                heroImage={collaboration.property.heroImageUrl}
                title={collaboration.property.title}
                size="lg"
              />
            </div>
          )}

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
                      bonus available
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Traffic Bonus Tracker - Full Display */}
            {collaboration.offer.trafficBonusEnabled && 
             collaboration.offer.trafficBonusCents && 
             collaboration.offer.trafficBonusThreshold && (
              <TrafficBonusTracker
                threshold={collaboration.offer.trafficBonusThreshold}
                currentClicks={collaboration.clicksGenerated}
                bonusCents={collaboration.offer.trafficBonusCents}
                isActive={!['completed', 'cancelled'].includes(collaboration.status)}
              />
            )}

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

          {/* Platform Fee Section (Post-for-Stay only) */}
          {collaboration.offer.offerType === "post-for-stay" && userRole === "host" && (
            <div className={`rounded-2xl border-[3px] border-black p-5 ${
              collaboration.paymentStatus === 'completed' ? 'bg-[#28D17C]' : 'bg-[#FFD84A]'
            }`}>
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-black/60">
                    Platform Fee
                  </p>
                  <p className="mt-1 text-2xl font-black text-black">$99</p>
                  <p className="text-xs text-black/70">
                    One-time fee for post-for-stay collaborations
                  </p>
                </div>
                <div className={`rounded-full px-3 py-1 text-[10px] font-bold ${
                  collaboration.paymentStatus === 'completed' 
                    ? 'bg-white text-black' 
                    : 'bg-black text-white'
                }`}>
                  {collaboration.paymentStatus === 'completed' ? '✓ PAID' : 'PENDING'}
                </div>
              </div>
              
              {collaboration.paymentStatus !== 'completed' && isFullyExecuted && (
                <button
                  onClick={async () => {
                    setSigning(true)
                    try {
                      const res = await fetch('/api/payments/platform-fee', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ collaborationId }),
                      })
                      const data = await res.json()
                      if (res.ok && data.url) {
                        window.location.href = data.url
                      } else {
                        setToast(data.error || 'Failed to initiate payment')
                      }
                    } catch (e) {
                      setToast('Network error. Please try again.')
                    }
                    setSigning(false)
                  }}
                  disabled={signing}
                  className="mt-4 w-full rounded-full border-2 border-black bg-black py-3 text-sm font-black uppercase tracking-wider text-white transition-transform hover:-translate-y-1 disabled:opacity-50"
                >
                  {signing ? 'Processing...' : 'Pay $99 Platform Fee →'}
                </button>
              )}
              
              {collaboration.paymentStatus === 'completed' && (
                <p className="mt-3 text-sm text-black/70">
                  ✓ Platform fee paid. The collaboration is now active!
                </p>
              )}
            </div>
          )}

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
                <div className="flex items-center gap-2">
                  <a
                    href={`/api/collaborations/${collaboration.id}/agreement/pdf`}
                    download
                    className="rounded-full border-2 border-black bg-black px-3 py-1 text-[10px] font-bold text-white hover:bg-black/80 flex items-center gap-1"
                  >
                    <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
                    </svg>
                    PDF
                  </a>
                  <button
                    onClick={async () => {
                      try {
                        const res = await fetch(`/api/collaborations/${collaboration.id}/agreement/email`, {
                          method: 'POST',
                        })
                        const data = await res.json()
                        if (res.ok) {
                          setToast('Agreement copy sent to your email!')
                        } else {
                          setToast(data.error || 'Failed to send email')
                        }
                      } catch (e) {
                        setToast('Failed to send email')
                      }
                    }}
                    className="rounded-full border-2 border-black bg-[#4AA3FF] px-3 py-1 text-[10px] font-bold text-black hover:bg-[#4AA3FF]/80 flex items-center gap-1"
                  >
                    <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
                    </svg>
                    Email
                  </button>
                  <button
                    onClick={() => setShowAgreement(!showAgreement)}
                    className="rounded-full border-2 border-black bg-black/5 px-3 py-1 text-[10px] font-bold text-black hover:bg-black/10"
                  >
                    {showAgreement ? "Hide" : "View"}
                  </button>
                </div>
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

          {/* Payout Tracker for Creators (show when payment is relevant) */}
          {userRole === "creator" && 
           collaboration.offer.cashCents > 0 && 
           ["approved", "completed"].includes(collaboration.status) && (
            <PayoutTracker collaborationId={collaboration.id} />
          )}

          {/* Cancellation Request Pending (show to other party) */}
          {collaboration.status === "cancellation-requested" && (
            <div className="rounded-2xl border-[3px] border-orange-400 bg-orange-50 p-5">
              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-2 border-orange-400 bg-white">
                  <span className="text-lg">⚠️</span>
                </div>
                <div className="flex-1">
                  <p className="text-lg font-black text-black">Cancellation Requested</p>
                  <p className="mt-1 text-sm text-black/70">
                    The other party has requested to cancel this collaboration.
                  </p>
                  <div className="mt-4 flex gap-2">
                    <button
                      onClick={() => handleCancellationResponse("accept")}
                      disabled={cancelling}
                      className="flex-1 rounded-full border-2 border-red-500 bg-red-500 py-2 text-xs font-bold text-white transition-transform hover:-translate-y-0.5 disabled:opacity-50"
                    >
                      {cancelling ? "Processing..." : "Accept Cancellation"}
                    </button>
                    <button
                      onClick={() => handleCancellationResponse("decline")}
                      disabled={cancelling}
                      className="flex-1 rounded-full border-2 border-black bg-white py-2 text-xs font-bold text-black transition-transform hover:-translate-y-0.5 disabled:opacity-50"
                    >
                      Decline & Continue
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Request Cancellation Button (show when collaboration can be cancelled) */}
          {!["completed", "cancelled", "cancellation-requested"].includes(collaboration.status) && (
            <div className="rounded-2xl border-2 border-black/10 bg-white p-5">
              <p className="text-[10px] font-bold uppercase tracking-wider text-black/40">
                Need to Cancel?
              </p>
              <p className="mt-1 text-sm text-black/60">
                If circumstances have changed, you can request to cancel this collaboration.
              </p>
              <button
                onClick={() => setShowCancelModal(true)}
                className="mt-3 rounded-full border-2 border-black/20 bg-white px-4 py-2 text-xs font-bold text-black/60 transition-all hover:border-red-400 hover:text-red-500"
              >
                Request Cancellation
              </button>
            </div>
          )}

          {/* Cancel Modal */}
          {showCancelModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
              <div className="w-full max-w-md rounded-2xl border-[3px] border-black bg-white p-6">
                <h3 className="text-xl font-black text-black">Request Cancellation</h3>
                <p className="mt-2 text-sm text-black/70">
                  The other party will need to approve this cancellation request.
                </p>
                <div className="mt-4">
                  <label className="mb-1 block text-[10px] font-bold uppercase tracking-wider text-black/60">
                    Reason (optional)
                  </label>
                  <textarea
                    rows={3}
                    placeholder="Let them know why you need to cancel..."
                    value={cancelReason}
                    onChange={(e) => setCancelReason(e.target.value)}
                    className="w-full rounded-lg border-2 border-black px-3 py-2 text-sm text-black placeholder:text-black/40"
                  />
                </div>
                <div className="mt-4 flex gap-2">
                  <button
                    onClick={handleCancelRequest}
                    disabled={cancelling}
                    className="flex-1 rounded-full border-2 border-red-500 bg-red-500 py-3 text-xs font-bold text-white transition-transform hover:-translate-y-0.5 disabled:opacity-50"
                  >
                    {cancelling ? "Sending..." : "Send Request"}
                  </button>
                  <button
                    onClick={() => { setShowCancelModal(false); setCancelReason(""); }}
                    className="flex-1 rounded-full border-2 border-black bg-white py-3 text-xs font-bold text-black transition-transform hover:-translate-y-0.5"
                  >
                    Never Mind
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </Container>
    </div>
  )
}
