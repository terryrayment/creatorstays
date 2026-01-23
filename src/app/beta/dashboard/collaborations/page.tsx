"use client"

import { useState } from "react"
import { useSession } from "next-auth/react"
import Link from "next/link"

// Demo collaboration data
const DEMO_COLLABORATIONS = [
  {
    id: "demo-1",
    status: "content-submitted",
    creatorName: "Sarah Chen",
    creatorHandle: "sarahtravels",
    creatorAvatar: "SC",
    propertyTitle: "Oceanfront Beach House",
    propertyLocation: "Malibu, CA",
    dealType: "Flat Fee + Stay",
    cashAmount: 500,
    stayNights: 3,
    deliverables: ["2 Instagram Reels", "5 Stories", "1 Feed Post"],
    clicks: 847,
    submittedDate: "2 days ago",
    statusLabel: "Content Submitted",
    statusColor: "bg-[#4AA3FF]",
    actionRequired: true,
    actionText: "Review content and approve to release payment",
  },
  {
    id: "demo-2",
    status: "active",
    creatorName: "Marcus Rivera",
    creatorHandle: "marcusexplores",
    creatorAvatar: "MR",
    propertyTitle: "Mountain View Cabin",
    propertyLocation: "Lake Tahoe, CA",
    dealType: "Post-for-Stay",
    cashAmount: 0,
    stayNights: 4,
    deliverables: ["1 TikTok Video", "3 Stories"],
    clicks: 0,
    submittedDate: "5 days ago",
    statusLabel: "In Progress",
    statusColor: "bg-[#FFD84A]",
    actionRequired: false,
    actionText: "Creator is working on content",
  },
  {
    id: "demo-3",
    status: "completed",
    creatorName: "Emma Williams",
    creatorHandle: "emmawanders",
    creatorAvatar: "EW",
    propertyTitle: "Downtown Loft",
    propertyLocation: "Austin, TX",
    dealType: "Flat Fee",
    cashAmount: 750,
    stayNights: 2,
    deliverables: ["2 Instagram Reels", "1 YouTube Short"],
    clicks: 2341,
    submittedDate: "3 weeks ago",
    statusLabel: "Completed",
    statusColor: "bg-[#28D17C]",
    actionRequired: false,
    actionText: "",
  },
]

// Demo step data for the walkthrough
const DEMO_STEPS = [
  {
    step: 1,
    title: "Creator Accepts Your Offer",
    description: "When a creator accepts your offer, a collaboration is created and both parties sign a digital agreement.",
    icon: "✅",
  },
  {
    step: 2,
    title: "Creator Creates Content",
    description: "The creator visits your property, captures content, and uses their unique tracking link in posts.",
    icon: "📸",
  },
  {
    step: 3,
    title: "You Review & Approve",
    description: "Once content is submitted, you review it here. Approve to release payment, or request changes.",
    icon: "👀",
  },
  {
    step: 4,
    title: "Track Performance",
    description: "Monitor clicks, engagement, and ROI. Performance bonuses are automatically calculated.",
    icon: "📊",
  },
  {
    step: 5,
    title: "Payment & Completion",
    description: "Approve the content to trigger secure payment. Leave reviews for each other.",
    icon: "💰",
  },
]

function DemoCollaborationCard({ collab, onView }: { collab: typeof DEMO_COLLABORATIONS[0], onView: () => void }) {
  return (
    <div 
      className="rounded-2xl border-[3px] border-black bg-white p-4 transition-all hover:-translate-y-1 hover:shadow-lg cursor-pointer"
      onClick={onView}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <span className={`rounded-full border border-black px-2 py-0.5 text-[9px] font-bold text-black ${collab.statusColor}`}>
              {collab.statusLabel}
            </span>
            {collab.actionRequired && (
              <span className="rounded-full bg-[#FF6B6B] px-2 py-0.5 text-[9px] font-bold text-white">
                Action Required
              </span>
            )}
            <span className="text-[10px] text-black/50">{collab.submittedDate}</span>
          </div>
          <p className="mt-2 font-bold text-black">{collab.propertyTitle}</p>
          <p className="text-sm text-black/60">{collab.propertyLocation}</p>
          <div className="mt-2 flex items-center gap-3 text-xs">
            <div className="flex items-center gap-1.5">
              <div className="flex h-5 w-5 items-center justify-center rounded-full border border-black bg-[#FFD84A] text-[8px] font-bold">
                {collab.creatorAvatar}
              </div>
              <span className="font-bold text-black">@{collab.creatorHandle}</span>
            </div>
            {collab.cashAmount > 0 && (
              <span className="font-bold text-black">${collab.cashAmount}</span>
            )}
            {collab.stayNights && (
              <span className="text-black/60">+ {collab.stayNights} nights</span>
            )}
          </div>
        </div>
        <div className="text-right">
          <p className="text-2xl font-black text-black">{collab.clicks.toLocaleString()}</p>
          <p className="text-[10px] text-black/60">clicks</p>
        </div>
      </div>

      {/* Deliverables */}
      <div className="mt-3 flex flex-wrap gap-1">
        {collab.deliverables.map((d) => (
          <span key={d} className="rounded-full border border-black/20 bg-black/5 px-2 py-0.5 text-[9px] font-bold text-black">
            {d}
          </span>
        ))}
      </div>

      {/* Action hint */}
      {collab.actionRequired && collab.actionText && (
        <div className="mt-3 rounded-lg bg-[#FFD84A]/30 px-3 py-2 text-xs font-bold text-black">
          ⚡ {collab.actionText}
        </div>
      )}
    </div>
  )
}

function DemoDetailModal({ collab, onClose }: { collab: typeof DEMO_COLLABORATIONS[0] | null, onClose: () => void }) {
  const [activeTab, setActiveTab] = useState<"overview" | "content" | "tracking">("overview")
  
  if (!collab) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 overflow-y-auto">
      <div className="w-full max-w-2xl rounded-2xl border-4 border-black bg-white my-8">
        {/* Header */}
        <div className="border-b-2 border-black bg-[#FAFAFA] p-4 rounded-t-xl">
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="rounded-full border-2 border-dashed border-black/30 bg-white px-2 py-0.5 text-[9px] font-bold text-black/50">
                  DEMO
                </span>
                <span className={`rounded-full border border-black px-2 py-0.5 text-[9px] font-bold text-black ${collab.statusColor}`}>
                  {collab.statusLabel}
                </span>
              </div>
              <h2 className="font-heading text-xl font-bold text-black">{collab.propertyTitle}</h2>
              <p className="text-sm text-black/60">{collab.propertyLocation}</p>
            </div>
            <button 
              onClick={onClose}
              className="rounded-full border-2 border-black bg-white p-2 transition-transform hover:-translate-y-0.5"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Tabs */}
          <div className="flex gap-2 mt-4">
            {(["overview", "content", "tracking"] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`rounded-full border-2 border-black px-3 py-1 text-[10px] font-bold uppercase tracking-wider transition-all ${
                  activeTab === tab ? "bg-black text-white" : "bg-white text-black hover:bg-black/5"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="p-4 max-h-[60vh] overflow-y-auto">
          {activeTab === "overview" && (
            <div className="space-y-4">
              {/* Creator Info */}
              <div className="rounded-xl border-2 border-black bg-[#FFD84A]/20 p-4">
                <p className="text-[10px] font-bold uppercase tracking-wider text-black/50 mb-2">Creator</p>
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full border-2 border-black bg-[#FFD84A] text-lg font-bold">
                    {collab.creatorAvatar}
                  </div>
                  <div>
                    <p className="font-bold text-black">{collab.creatorName}</p>
                    <p className="text-sm text-black/60">@{collab.creatorHandle}</p>
                  </div>
                </div>
              </div>

              {/* Deal Terms */}
              <div className="rounded-xl border-2 border-black bg-white p-4">
                <p className="text-[10px] font-bold uppercase tracking-wider text-black/50 mb-3">Deal Terms</p>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-black/60">Deal Type</p>
                    <p className="font-bold text-black">{collab.dealType}</p>
                  </div>
                  <div>
                    <p className="text-xs text-black/60">Payment</p>
                    <p className="font-bold text-black">
                      {collab.cashAmount > 0 ? `$${collab.cashAmount}` : "Post-for-Stay"}
                      {collab.stayNights && ` + ${collab.stayNights} nights`}
                    </p>
                  </div>
                </div>
                <div className="mt-4">
                  <p className="text-xs text-black/60 mb-2">Deliverables</p>
                  <div className="flex flex-wrap gap-1">
                    {collab.deliverables.map((d) => (
                      <span key={d} className="rounded-full border-2 border-black bg-white px-3 py-1 text-xs font-bold">
                        {d}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Agreement Status */}
              <div className="rounded-xl border-2 border-black bg-[#28D17C]/20 p-4">
                <p className="text-[10px] font-bold uppercase tracking-wider text-black/50 mb-2">Agreement</p>
                <div className="flex items-center gap-2">
                  <svg className="h-5 w-5 text-[#28D17C]" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span className="text-sm font-bold text-black">Both parties have signed</span>
                </div>
              </div>
            </div>
          )}

          {activeTab === "content" && (
            <div className="space-y-4">
              {collab.status === "content-submitted" ? (
                <>
                  <div className="rounded-xl border-2 border-[#4AA3FF] bg-[#4AA3FF]/10 p-4">
                    <p className="text-sm font-bold text-black mb-2">📸 Content Ready for Review</p>
                    <p className="text-xs text-black/70">
                      The creator has submitted their content. In a real collaboration, you would see:
                    </p>
                    <ul className="mt-2 space-y-1 text-xs text-black/70">
                      <li>• Links to live Instagram posts/Reels</li>
                      <li>• TikTok video links</li>
                      <li>• Screenshots or preview images</li>
                      <li>• Creator's notes about the content</li>
                    </ul>
                  </div>
                  
                  {/* Demo content preview */}
                  <div className="grid grid-cols-2 gap-3">
                    {[1, 2, 3, 4].map((i) => (
                      <div key={i} className="aspect-square rounded-xl border-2 border-dashed border-black/20 bg-black/5 flex items-center justify-center">
                        <div className="text-center">
                          <span className="text-2xl">📱</span>
                          <p className="text-[10px] text-black/40 mt-1">Demo Content {i}</p>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="flex gap-2">
                    <button className="flex-1 rounded-full border-2 border-black bg-[#28D17C] py-3 text-sm font-bold text-black transition-transform hover:-translate-y-0.5">
                      ✓ Approve Content
                    </button>
                    <button className="rounded-full border-2 border-black bg-white px-4 py-3 text-sm font-bold text-black transition-transform hover:-translate-y-0.5">
                      Request Changes
                    </button>
                  </div>
                </>
              ) : collab.status === "active" ? (
                <div className="rounded-xl border-2 border-[#FFD84A] bg-[#FFD84A]/10 p-4 text-center">
                  <span className="text-3xl">⏳</span>
                  <p className="mt-2 font-bold text-black">Waiting for Content</p>
                  <p className="text-sm text-black/60 mt-1">
                    The creator is working on their content. You'll be notified when they submit.
                  </p>
                </div>
              ) : (
                <div className="rounded-xl border-2 border-[#28D17C] bg-[#28D17C]/10 p-4 text-center">
                  <span className="text-3xl">✅</span>
                  <p className="mt-2 font-bold text-black">Content Approved</p>
                  <p className="text-sm text-black/60 mt-1">
                    This collaboration is complete. View the live content links below.
                  </p>
                </div>
              )}
            </div>
          )}

          {activeTab === "tracking" && (
            <div className="space-y-4">
              {/* Click Stats */}
              <div className="rounded-xl border-2 border-black bg-white p-4">
                <p className="text-[10px] font-bold uppercase tracking-wider text-black/50 mb-3">Performance</p>
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <p className="text-3xl font-black text-black">{collab.clicks.toLocaleString()}</p>
                    <p className="text-xs text-black/60">Total Clicks</p>
                  </div>
                  <div>
                    <p className="text-3xl font-black text-black">3.2%</p>
                    <p className="text-xs text-black/60">Click Rate</p>
                  </div>
                  <div>
                    <p className="text-3xl font-black text-black">$0.21</p>
                    <p className="text-xs text-black/60">Cost/Click</p>
                  </div>
                </div>
              </div>

              {/* Tracking Link */}
              <div className="rounded-xl border-2 border-black bg-[#FAFAFA] p-4">
                <p className="text-[10px] font-bold uppercase tracking-wider text-black/50 mb-2">Tracking Link</p>
                <div className="flex items-center gap-2">
                  <code className="flex-1 rounded-lg border border-black/20 bg-white px-3 py-2 text-xs font-mono">
                    cs.link/demo-abc123
                  </code>
                  <button className="rounded-lg border-2 border-black bg-white px-3 py-2 text-xs font-bold hover:bg-black/5">
                    Copy
                  </button>
                </div>
                <p className="mt-2 text-[10px] text-black/50">
                  This link tracks all clicks from the creator's content back to your listing.
                </p>
              </div>

              {/* Demo chart placeholder */}
              <div className="rounded-xl border-2 border-dashed border-black/20 bg-black/5 p-8 text-center">
                <span className="text-3xl">📈</span>
                <p className="mt-2 text-sm font-bold text-black/40">Click Analytics Chart</p>
                <p className="text-xs text-black/30">Daily clicks over time would appear here</p>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t-2 border-black bg-[#FAFAFA] p-4 rounded-b-xl">
          <p className="text-center text-xs text-black/50">
            This is a demo collaboration. Real collaborations will have full functionality.
          </p>
        </div>
      </div>
    </div>
  )
}

function HowItWorksModal({ onClose }: { onClose: () => void }) {
  const [currentStep, setCurrentStep] = useState(0)

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-lg rounded-2xl border-4 border-black bg-white">
        {/* Header */}
        <div className="border-b-2 border-black bg-[#4AA3FF] p-4 rounded-t-xl">
          <div className="flex items-center justify-between">
            <h2 className="font-heading text-xl font-bold text-black">How Collaborations Work</h2>
            <button 
              onClick={onClose}
              className="rounded-full border-2 border-black bg-white p-2 transition-transform hover:-translate-y-0.5"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Step Content */}
        <div className="p-6">
          <div className="text-center mb-6">
            <span className="text-5xl">{DEMO_STEPS[currentStep].icon}</span>
            <div className="mt-4">
              <span className="rounded-full border-2 border-black bg-black px-3 py-1 text-xs font-bold text-white">
                Step {DEMO_STEPS[currentStep].step} of {DEMO_STEPS.length}
              </span>
            </div>
            <h3 className="mt-4 font-heading text-xl font-bold text-black">
              {DEMO_STEPS[currentStep].title}
            </h3>
            <p className="mt-2 text-sm text-black/70">
              {DEMO_STEPS[currentStep].description}
            </p>
          </div>

          {/* Progress dots */}
          <div className="flex justify-center gap-2 mb-6">
            {DEMO_STEPS.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrentStep(i)}
                className={`h-2 w-2 rounded-full transition-all ${
                  i === currentStep ? "w-6 bg-black" : "bg-black/20 hover:bg-black/40"
                }`}
              />
            ))}
          </div>

          {/* Navigation */}
          <div className="flex gap-2">
            <button
              onClick={() => setCurrentStep(Math.max(0, currentStep - 1))}
              disabled={currentStep === 0}
              className="flex-1 rounded-full border-2 border-black bg-white py-2 text-sm font-bold text-black transition-transform hover:-translate-y-0.5 disabled:opacity-30"
            >
              ← Previous
            </button>
            {currentStep === DEMO_STEPS.length - 1 ? (
              <button
                onClick={onClose}
                className="flex-1 rounded-full border-2 border-black bg-[#28D17C] py-2 text-sm font-bold text-black transition-transform hover:-translate-y-0.5"
              >
                Got It! ✓
              </button>
            ) : (
              <button
                onClick={() => setCurrentStep(Math.min(DEMO_STEPS.length - 1, currentStep + 1))}
                className="flex-1 rounded-full border-2 border-black bg-[#FFD84A] py-2 text-sm font-bold text-black transition-transform hover:-translate-y-0.5"
              >
                Next →
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default function BetaCollaborationsPage() {
  const { data: session } = useSession()
  const [selectedCollab, setSelectedCollab] = useState<typeof DEMO_COLLABORATIONS[0] | null>(null)
  const [showHowItWorks, setShowHowItWorks] = useState(false)

  return (
    <div className="min-h-screen bg-[#FAFAFA]">
      {/* Header */}
      <div className="border-b-2 border-black bg-white">
        <div className="mx-auto flex h-12 max-w-6xl items-center justify-between px-4 sm:px-6">
          <div className="flex items-center gap-3">
            <span className="rounded border border-black bg-[#FFD84A] px-2 py-0.5 text-[10px] font-bold text-black">BETA</span>
            <span className="text-sm font-bold text-black">Host Dashboard</span>
          </div>
          <Link 
            href="/" 
            className="rounded-full border-2 border-black bg-[#FFD84A] px-4 py-1.5 text-xs font-bold text-black transition-transform hover:-translate-y-0.5"
          >
            ← Back to site
          </Link>
        </div>
      </div>
      
      {/* Navigation Strip */}
      <div className="border-b-2 border-black bg-[#FFD84A]">
        <div className="mx-auto flex max-w-6xl items-center gap-2 px-4 py-3 sm:px-6">
          <div className="flex flex-wrap gap-2">
            <Link 
              href="/beta/dashboard/host/properties"
              className="rounded-full border-2 border-black bg-white px-3 py-1 text-[10px] font-bold text-black transition-transform hover:-translate-y-0.5"
            >
              My Properties
            </Link>
            <Link 
              href="/beta/dashboard/collaborations"
              className="rounded-full border-2 border-black bg-black px-3 py-1 text-[10px] font-bold text-white"
            >
              Collaborations
              <span className="ml-1 text-[8px] uppercase opacity-60">(Demo)</span>
            </Link>
            <Link 
              href="/beta/dashboard/host/settings"
              className="rounded-full border-2 border-black bg-white px-3 py-1 text-[10px] font-bold text-black transition-transform hover:-translate-y-0.5"
            >
              Settings
            </Link>
            <Link 
              href="/beta/dashboard/host/search-creators"
              className="rounded-full border-2 border-black bg-white/60 px-3 py-1 text-[10px] font-bold text-black/60 transition-transform hover:-translate-y-0.5"
            >
              Find Creators
              <span className="ml-1 text-[8px] uppercase opacity-60">(Preview)</span>
            </Link>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
        <div className="mb-4"><Link href="/beta/dashboard/host" className="text-xs font-bold text-black/60 hover:text-black">← Dashboard</Link></div>
        {/* Header */}
        <div className="mb-6">
          <h1 className="font-heading text-[2rem] font-black tracking-tight text-black">
            COLLABORATIONS
          </h1>
          <p className="mt-1 text-sm text-black/70">
            Track and manage your creator partnerships.
          </p>
        </div>

        {/* Demo Banner */}
        <div className="mb-6 rounded-xl border-2 border-[#4AA3FF] bg-[#4AA3FF]/10 p-4">
          <div className="flex items-start gap-3">
            <span className="text-2xl">👋</span>
            <div className="flex-1">
              <p className="font-bold text-black">This is a demo preview</p>
              <p className="text-sm text-black/70 mt-1">
                Explore how collaborations work with sample data. When real creators join the platform, 
                your actual collaborations will appear here.
              </p>
              <button
                onClick={() => setShowHowItWorks(true)}
                className="mt-3 rounded-full border-2 border-black bg-white px-4 py-1.5 text-xs font-bold text-black transition-transform hover:-translate-y-0.5"
              >
                How It Works →
              </button>
            </div>
          </div>
        </div>

        {/* Demo Stats */}
        <div className="mb-6 grid grid-cols-3 gap-4">
          <div className="rounded-xl border-2 border-black bg-[#FFD84A] p-4 text-center">
            <p className="text-2xl font-black text-black">2</p>
            <p className="text-[10px] font-bold text-black/60">Active</p>
          </div>
          <div className="rounded-xl border-2 border-black bg-[#28D17C] p-4 text-center">
            <p className="text-2xl font-black text-black">1</p>
            <p className="text-[10px] font-bold text-black/60">Completed</p>
          </div>
          <div className="rounded-xl border-2 border-black bg-white p-4 text-center">
            <p className="text-2xl font-black text-black">3,188</p>
            <p className="text-[10px] font-bold text-black/60">Total Clicks</p>
          </div>
        </div>

        {/* Demo Collaborations List */}
        <div className="space-y-3">
          {DEMO_COLLABORATIONS.map((collab) => (
            <DemoCollaborationCard 
              key={collab.id} 
              collab={collab} 
              onView={() => setSelectedCollab(collab)}
            />
          ))}
        </div>

        {/* Coming Soon Note */}
        <div className="mt-8 rounded-xl border-2 border-dashed border-black/20 bg-white p-6 text-center">
          <span className="text-3xl">🚀</span>
          <p className="mt-2 font-bold text-black">Real creators coming soon!</p>
          <p className="text-sm text-black/60 mt-1">
            We're onboarding creators now. Get your properties and preferences set up 
            so you're ready when matching begins.
          </p>
          <Link
            href="/beta/dashboard/host/properties"
            className="mt-4 inline-block rounded-full border-2 border-black bg-[#FFD84A] px-6 py-2 text-xs font-bold text-black transition-transform hover:-translate-y-0.5"
          >
            Set Up Properties →
          </Link>
        </div>
      </div>

      {/* Modals */}
      {selectedCollab && (
        <DemoDetailModal collab={selectedCollab} onClose={() => setSelectedCollab(null)} />
      )}
      {showHowItWorks && (
        <HowItWorksModal onClose={() => setShowHowItWorks(false)} />
      )}
    </div>
  )
}
