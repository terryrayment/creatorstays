"use client"

import { useState, useEffect, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { useSession } from "next-auth/react"
import Link from "next/link"
import { DashboardFooter } from "@/components/navigation/dashboard-footer"

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
        
        if (isSetup) {
          setTimeout(() => router.push("/beta/dashboard/host"), 1500)
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

  const inputClass = "h-12 w-full rounded-xl border-2 border-black bg-white px-4 text-[14px] font-medium text-black placeholder:text-black/40 focus:outline-none focus:ring-2 focus:ring-black/20"

  if (status === "loading") {
    return (
      <div className="min-h-screen bg-[#FAFAFA] flex items-center justify-center">
        <p className="text-black/60">Loading...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#FAFAFA] flex flex-col">
      {/* Toast */}
      {toast && (
        <div className="fixed bottom-4 right-4 z-50 rounded-xl border-2 border-black bg-[#28D17C] px-4 py-2">
          <span className="text-sm font-bold text-black">{toast}</span>
        </div>
      )}

      {/* Header */}
      <div className="border-b-2 border-black bg-white">
        <div className="mx-auto flex h-12 max-w-6xl items-center justify-between px-4 sm:px-6">
          <div className="flex items-center gap-3">
            <span className="rounded border border-black bg-[#FFD84A] px-2 py-0.5 text-[10px] font-bold text-black">BETA</span>
            <Link href="/beta/dashboard/host" className="text-sm font-bold text-black hover:opacity-70">Host Dashboard</Link>
          </div>
          <Link 
            href="/" 
            className="text-xs font-bold text-black hover:opacity-70"
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
              className="rounded-full border-2 border-black bg-white/60 px-3 py-1 text-[10px] font-bold text-black/60 transition-transform hover:-translate-y-0.5"
            >
              Collaborations
              <span className="ml-1 text-[8px] uppercase opacity-60">(Demo)</span>
            </Link>
            <Link 
              href="/beta/dashboard/host/analytics"
              className="rounded-full border-2 border-black bg-white/60 px-3 py-1 text-[10px] font-bold text-black/60 transition-transform hover:-translate-y-0.5"
            >
              Analytics
              <span className="ml-1 text-[8px] uppercase opacity-60">(Demo)</span>
            </Link>
            <Link 
              href="/beta/dashboard/host/settings"
              className="rounded-full border-2 border-black bg-black px-3 py-1 text-[10px] font-bold text-white"
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

      {/* Main Content */}
      <div className="flex-1 mx-auto w-full max-w-6xl px-4 py-6 sm:px-6">
        <div className="mb-4">
          <Link href="/beta/dashboard/host" className="text-xs font-bold text-black/60 hover:text-black">
            ← Dashboard
          </Link>
        </div>

        {/* Page Header */}
        <div className="mb-6 rounded-xl border-2 border-black bg-white p-5">
          <h1 className="font-heading text-[2rem] font-black text-black">
            {isSetup ? "SET UP YOUR PROFILE" : "ACCOUNT SETTINGS"}
          </h1>
          <p className="mt-1 text-sm text-black/60">
            {isSetup ? "Let's set up your host profile so creators can find and connect with you." : "Manage your profile and notification preferences."}
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {/* Tabs */}
            {!isSetup && (
              <div className="mb-4 flex gap-2">
                <button
                  onClick={() => setActiveTab("profile")}
                  className={`rounded-full px-4 py-2 text-xs font-bold transition-all ${
                    activeTab === "profile"
                      ? "bg-[#FFD84A] text-black border-2 border-black"
                      : "bg-white text-black/60 border-2 border-black/20 hover:border-black"
                  }`}
                >
                  Profile
                </button>
                <button
                  onClick={() => setActiveTab("notifications")}
                  className={`rounded-full px-4 py-2 text-xs font-bold transition-all ${
                    activeTab === "notifications"
                      ? "bg-[#FFD84A] text-black border-2 border-black"
                      : "bg-white text-black/60 border-2 border-black/20 hover:border-black"
                  }`}
                >
                  Notifications
                </button>
              </div>
            )}

            {/* Profile Form - min-height to keep footer stable */}
            <div className="rounded-xl border-2 border-black bg-white p-5 min-h-[450px]">
              {(activeTab === "profile" || isSetup) && (
                <div className="space-y-5">
                  <div>
                    <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-black">
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
                    <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-black">
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
                    <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-black">
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
                    <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-black">
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
                      className="rounded-full border-2 border-black bg-black px-6 py-2.5 text-sm font-bold text-white transition-transform hover:-translate-y-0.5 disabled:opacity-50"
                    >
                      {saving ? "Saving..." : isSetup ? "Continue to Dashboard →" : "Save Changes"}
                    </button>
                    
                    {isSetup && (
                      <button
                        onClick={() => router.push("/beta/dashboard/host")}
                        className="rounded-full border-2 border-black bg-white px-6 py-2.5 text-sm font-bold text-black transition-transform hover:-translate-y-0.5"
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
                    <div key={item.key} className="flex items-center justify-between rounded-xl border-2 border-black p-4">
                      <div>
                        <p className="text-sm font-bold text-black">{item.label}</p>
                        <p className="text-xs text-black/60">{item.desc}</p>
                      </div>
                      <button
                        onClick={() => setNotifications({ ...notifications, [item.key]: !notifications[item.key as keyof typeof notifications] })}
                        className={`relative h-6 w-11 rounded-full border-2 border-black transition-colors ${
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
                    className="rounded-full border-2 border-black bg-black px-6 py-2.5 text-sm font-bold text-white transition-transform hover:-translate-y-0.5"
                  >
                    Save Preferences
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Links */}
            <div className="rounded-xl border-2 border-black bg-white p-5">
              <h3 className="mb-4 text-sm font-black uppercase tracking-wider text-black">Quick Links</h3>
              <div className="space-y-1.5">
                <Link href="/beta/dashboard/host/properties" className="flex items-center justify-between rounded-lg border-2 border-black bg-white px-3 py-2 text-xs font-bold text-black transition-all hover:-translate-y-0.5">
                  My Properties
                  <span className="text-black/40">→</span>
                </Link>
                <Link href="/beta/dashboard/host/preferences" className="flex items-center justify-between rounded-lg border-2 border-black bg-white px-3 py-2 text-xs font-bold text-black transition-all hover:-translate-y-0.5">
                  Creator Preferences
                  <span className="text-black/40">→</span>
                </Link>
                <Link href="/help" className="flex items-center justify-between rounded-lg border-2 border-black bg-white px-3 py-2 text-xs font-bold text-black transition-all hover:-translate-y-0.5">
                  Help Center
                  <span className="text-black/40">→</span>
                </Link>
              </div>
            </div>

            {/* Help */}
            <div className="rounded-xl border-2 border-dashed border-black/20 bg-[#FAFAFA] p-4 text-center">
              <p className="text-xs text-black/60">Need help with your account?</p>
              <a 
                href="mailto:hello@creatorstays.com" 
                className="mt-1 inline-block text-sm font-bold text-black hover:opacity-70"
              >
                hello@creatorstays.com
              </a>
            </div>
          </div>
        </div>
      </div>

      <DashboardFooter />
    </div>
  )
}

export default function HostSettingsPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#FAFAFA] flex items-center justify-center">
        <p className="text-black/60">Loading...</p>
      </div>
    }>
      <HostSettingsContent />
    </Suspense>
  )
}
