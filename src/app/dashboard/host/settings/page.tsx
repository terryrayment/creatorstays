"use client"

import { useState, useEffect, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { useSession } from "next-auth/react"
import Link from "next/link"

function HostSettingsContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { data: session, status } = useSession()
  const isSetup = searchParams.get("setup") === "true"
  
  const [activeTab, setActiveTab] = useState<"profile" | "notifications">("profile")
  const [toast, setToast] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  
  // Profile form
  const [profile, setProfile] = useState({
    fullName: "",
    email: "",
    phone: "",
    company: "",
  })
  
  // Notifications
  const [notifications, setNotifications] = useState({
    newOffers: true,
    creatorMessages: true,
    paymentAlerts: true,
    marketingEmails: false,
  })

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login")
    }
    if (session?.user) {
      setProfile(prev => ({
        ...prev,
        fullName: session.user.name || "",
        email: session.user.email || "",
      }))
    }
  }, [session, status, router])

  const handleProfileSave = async () => {
    setSaving(true)
    
    // Create host profile via API
    try {
      const res = await fetch("/api/host/profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          displayName: profile.fullName,
          contactEmail: profile.email,
          phone: profile.phone,
          company: profile.company,
        }),
      })
      
      if (res.ok) {
        setToast("Profile saved!")
        setTimeout(() => setToast(null), 3000)
        
        // If this is setup flow, redirect to dashboard
        if (isSetup) {
          setTimeout(() => router.push("/dashboard/host"), 1500)
        }
      } else {
        setToast("Error saving profile")
        setTimeout(() => setToast(null), 3000)
      }
    } catch (error) {
      setToast("Error saving profile")
      setTimeout(() => setToast(null), 3000)
    }
    
    setSaving(false)
  }

  const handleNotificationsSave = () => {
    setToast("Notification preferences saved")
    setTimeout(() => setToast(null), 3000)
  }

  const inputClass = "h-12 w-full rounded-xl border-[2px] border-black bg-white px-4 text-[14px] font-medium text-black placeholder:text-black/40 focus:outline-none focus:ring-2 focus:ring-black/20"

  if (status === "loading") {
    return <div className="min-h-screen bg-black" />
  }

  return (
    <div className="min-h-screen bg-black px-3 pt-16 pb-8 lg:px-4">
      {/* Toast */}
      {toast && (
        <div className="fixed bottom-4 right-4 z-50 rounded-lg border-[2px] border-black bg-[#28D17C] px-4 py-2">
          <span className="text-[12px] font-bold text-black">{toast}</span>
        </div>
      )}

      <div className="mx-auto max-w-2xl">
        {/* Header */}
        <div className="mb-4 flex items-center justify-between">
          <div>
            <p className="text-[9px] font-black uppercase tracking-wider text-white/60">
              {isSetup ? "Getting Started" : "Host Settings"}
            </p>
            <h1 className="font-heading text-[1.75rem] leading-[0.9] text-white" style={{ fontWeight: 900 }}>
              {isSetup ? "SET UP YOUR PROFILE" : "ACCOUNT"}
            </h1>
          </div>
          {!isSetup && (
            <Link
              href="/dashboard/host"
              className="inline-flex h-9 items-center rounded-full border-[2px] border-white/20 px-4 text-[10px] font-black uppercase tracking-wider text-white transition-colors hover:border-white/40"
            >
              ← Dashboard
            </Link>
          )}
        </div>

        {/* Setup intro */}
        {isSetup && (
          <div className="mb-4 rounded-xl border-[2px] border-white/20 bg-white/5 p-4">
            <p className="text-[13px] font-medium text-white/80">
              Welcome! Let's set up your host profile so creators can find and connect with you.
            </p>
          </div>
        )}

        {/* Tabs - only show if not in setup mode */}
        {!isSetup && (
          <div className="mb-3 flex gap-1">
            {(["profile", "notifications"] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`rounded-full px-4 py-2 text-[10px] font-black uppercase tracking-wider transition-all ${
                  activeTab === tab
                    ? "bg-[#FFD84A] text-black border-[2px] border-black"
                    : "bg-white/10 text-white border-[2px] border-transparent hover:bg-white/20"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        )}

        {/* Content */}
        <div className="rounded-2xl border-[3px] border-black bg-white p-6">
          {(activeTab === "profile" || isSetup) && (
            <div className="space-y-5">
              <div>
                <label className="mb-1.5 block text-[11px] font-black uppercase tracking-wider text-black">
                  Full Name
                </label>
                <input
                  value={profile.fullName}
                  onChange={e => setProfile({ ...profile, fullName: e.target.value })}
                  placeholder="Your name"
                  className={inputClass}
                />
              </div>
              <div>
                <label className="mb-1.5 block text-[11px] font-black uppercase tracking-wider text-black">
                  Email
                </label>
                <input
                  type="email"
                  value={profile.email}
                  disabled
                  className={`${inputClass} bg-black/5 cursor-not-allowed`}
                />
                <p className="mt-1 text-[10px] text-black/50">Email is linked to your login</p>
              </div>
              <div>
                <label className="mb-1.5 block text-[11px] font-black uppercase tracking-wider text-black">
                  Phone <span className="font-medium text-black/40">(optional)</span>
                </label>
                <input
                  type="tel"
                  value={profile.phone}
                  onChange={e => setProfile({ ...profile, phone: e.target.value })}
                  placeholder="+1 (555) 123-4567"
                  className={inputClass}
                />
              </div>
              <div>
                <label className="mb-1.5 block text-[11px] font-black uppercase tracking-wider text-black">
                  Company / Brand <span className="font-medium text-black/40">(optional)</span>
                </label>
                <input
                  value={profile.company}
                  onChange={e => setProfile({ ...profile, company: e.target.value })}
                  placeholder="Your property management company"
                  className={inputClass}
                />
              </div>
              
              <div className="flex gap-3 pt-2">
                <button
                  onClick={handleProfileSave}
                  disabled={saving || !profile.fullName}
                  className="h-11 rounded-full bg-black px-8 text-[11px] font-black uppercase tracking-wider text-white transition-transform duration-200 hover:-translate-y-0.5 disabled:opacity-50"
                >
                  {saving ? "Saving..." : isSetup ? "Continue to Dashboard →" : "Save Changes"}
                </button>
                
                {isSetup && (
                  <button
                    onClick={() => router.push("/dashboard/host")}
                    className="h-11 rounded-full border-[2px] border-black px-6 text-[11px] font-black uppercase tracking-wider text-black transition-transform duration-200 hover:-translate-y-0.5"
                  >
                    Skip for now
                  </button>
                )}
              </div>
            </div>
          )}

          {activeTab === "notifications" && !isSetup && (
            <div className="space-y-3">
              {[
                { key: "newOffers", label: "New creator offers", desc: "When a creator submits an offer" },
                { key: "creatorMessages", label: "Creator messages", desc: "Direct messages from creators" },
                { key: "paymentAlerts", label: "Payment alerts", desc: "Payment confirmations and issues" },
                { key: "marketingEmails", label: "Marketing emails", desc: "Product updates and tips" },
              ].map((item) => (
                <div key={item.key} className="flex items-center justify-between rounded-lg border-[2px] border-black p-3">
                  <div>
                    <p className="text-[12px] font-bold text-black">{item.label}</p>
                    <p className="text-[10px] font-medium text-black/60">{item.desc}</p>
                  </div>
                  <button
                    onClick={() => setNotifications({ ...notifications, [item.key]: !notifications[item.key as keyof typeof notifications] })}
                    className={`relative h-6 w-11 rounded-full border-[2px] border-black transition-colors ${
                      notifications[item.key as keyof typeof notifications] ? 'bg-[#28D17C]' : 'bg-white'
                    }`}
                  >
                    <span className={`absolute top-0.5 h-4 w-4 rounded-full bg-black transition-transform ${
                      notifications[item.key as keyof typeof notifications] ? 'left-5' : 'left-0.5'
                    }`} />
                  </button>
                </div>
              ))}
              <button
                onClick={handleNotificationsSave}
                className="h-10 rounded-full bg-black px-6 text-[10px] font-black uppercase tracking-wider text-white transition-transform duration-200 hover:-translate-y-0.5"
              >
                Save Preferences
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default function HostSettingsPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-black" />}>
      <HostSettingsContent />
    </Suspense>
  )
}
