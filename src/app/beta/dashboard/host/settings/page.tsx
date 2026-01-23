"use client"

import { useState, useEffect, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { useSession, signOut } from "next-auth/react"
import Link from "next/link"
import { DashboardFooter } from "@/components/navigation/dashboard-footer"

function HostSettingsContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { data: session, status } = useSession()
  const isSetup = searchParams.get("setup") === "true"
  
  const [activeTab, setActiveTab] = useState<"profile" | "notifications" | "account">("profile")
  const [toast, setToast] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [deleteConfirmText, setDeleteConfirmText] = useState("")
  const [isEditing, setIsEditing] = useState(false)
  const [showContactModal, setShowContactModal] = useState(false)
  const [contactMessage, setContactMessage] = useState("")
  const [sendingMessage, setSendingMessage] = useState(false)
  
  // Profile form
  const [profile, setProfile] = useState({
    fullName: "",
    email: "",
    phone: "",
    company: "",
    location: "",
    bio: "",
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
          location: profile.location,
          bio: profile.bio,
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

  const handleDeleteAccount = async () => {
    if (deleteConfirmText !== "DELETE") return
    
    try {
      // In a real implementation, this would call an API to delete the account
      setToast("Account deletion requested. You will receive a confirmation email.")
      setTimeout(() => {
        signOut({ callbackUrl: "/" })
      }, 2000)
    } catch (error) {
      setToast("Error requesting account deletion")
      setTimeout(() => setToast(null), 3000)
    }
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

      {/* Contact Support Modal */}
      {showContactModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-xl border-2 border-black bg-white p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-black text-black">Contact Support</h2>
              <button 
                onClick={() => {
                  setShowContactModal(false)
                  setContactMessage("")
                }}
                className="text-black/60 hover:text-black"
              >
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <p className="text-xs text-black/60 mb-4">
              Send us a message and we'll get back to you as soon as possible.
            </p>
            <textarea
              value={contactMessage}
              onChange={e => setContactMessage(e.target.value)}
              placeholder="How can we help you?"
              rows={4}
              className="w-full rounded-xl border-2 border-black bg-white px-4 py-3 text-[14px] font-medium text-black placeholder:text-black/40 focus:outline-none focus:ring-2 focus:ring-black/20 mb-4"
            />
            <div className="flex gap-3">
              <button
                onClick={async () => {
                  if (!contactMessage.trim()) return
                  setSendingMessage(true)
                  // Simulate sending - in production this would call an API
                  await new Promise(resolve => setTimeout(resolve, 1000))
                  // Open mailto as fallback
                  window.location.href = `mailto:hello@creatorstays.com?subject=Support Request from ${profile.email}&body=${encodeURIComponent(contactMessage)}`
                  setSendingMessage(false)
                  setShowContactModal(false)
                  setContactMessage("")
                  setToast("Message sent! We'll be in touch soon.")
                  setTimeout(() => setToast(null), 3000)
                }}
                disabled={!contactMessage.trim() || sendingMessage}
                className="flex-1 rounded-full border-2 border-black bg-black px-4 py-2.5 text-sm font-bold text-white transition-transform hover:-translate-y-0.5 disabled:opacity-50"
              >
                {sendingMessage ? "Sending..." : "Send Message"}
              </button>
              <button
                onClick={() => {
                  setShowContactModal(false)
                  setContactMessage("")
                }}
                className="rounded-full border-2 border-black bg-white px-4 py-2.5 text-sm font-bold text-black transition-transform hover:-translate-y-0.5"
              >
                Cancel
              </button>
            </div>
          </div>
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
              <span className="ml-1 text-[8px] uppercase opacity-60">(Preview)</span>
            </Link>
            <Link 
              href="/beta/dashboard/host/analytics"
              className="rounded-full border-2 border-black bg-white/60 px-3 py-1 text-[10px] font-bold text-black/60 transition-transform hover:-translate-y-0.5"
            >
              Analytics
              <span className="ml-1 text-[8px] uppercase opacity-60">(Preview)</span>
            </Link>
            <Link 
              href="/beta/dashboard/host/search-creators"
              className="rounded-full border-2 border-black bg-white/60 px-3 py-1 text-[10px] font-bold text-black/60 transition-transform hover:-translate-y-0.5"
            >
              Find Creators
              <span className="ml-1 text-[8px] uppercase opacity-60">(Preview)</span>
            </Link>
            <Link 
              href="/beta/dashboard/host/settings"
              className="rounded-full border-2 border-black bg-black px-3 py-1 text-[10px] font-bold text-white"
            >
              Settings
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
            {isSetup ? "SET UP YOUR PROFILE" : "PROFILE SETTINGS"}
          </h1>
          <p className="mt-1 text-sm text-black/60">
            {isSetup ? "Let's set up your host profile so creators can find and connect with you." : "Manage your profile, notifications, and account settings."}
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
                <button
                  onClick={() => setActiveTab("account")}
                  className={`rounded-full px-4 py-2 text-xs font-bold transition-all ${
                    activeTab === "account"
                      ? "bg-[#FFD84A] text-black border-2 border-black"
                      : "bg-white text-black/60 border-2 border-black/20 hover:border-black"
                  }`}
                >
                  Account
                </button>
              </div>
            )}

            {/* Content Area - min-height to keep footer stable */}
            <div className="rounded-xl border-2 border-black bg-white p-5 min-h-[500px]">
              {/* Profile Tab */}
              {(activeTab === "profile" || isSetup) && (
                <div className="space-y-5">
                  {/* View Mode Header with Edit Button */}
                  {!isSetup && !isEditing && (
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-14 w-14 items-center justify-center rounded-full border-2 border-black bg-[#FFD84A] text-xl font-black">
                          {profile.fullName ? profile.fullName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) : '👋'}
                        </div>
                        <div>
                          <p className="font-bold text-black">{profile.fullName || 'Your Name'}</p>
                          <p className="text-xs text-black/60">{profile.email}</p>
                        </div>
                      </div>
                      <button
                        onClick={() => setIsEditing(true)}
                        className="rounded-full border-2 border-black bg-white px-4 py-2 text-xs font-bold text-black transition-transform hover:-translate-y-0.5 flex items-center gap-2"
                      >
                        <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                        </svg>
                        Edit Profile
                      </button>
                    </div>
                  )}

                  {/* View Mode - Show profile summary */}
                  {!isSetup && !isEditing && (
                    <div className="space-y-4">
                      <div className="grid gap-3 sm:grid-cols-2">
                        <div className="rounded-lg border-2 border-black bg-black/5 p-3">
                          <p className="text-[10px] font-bold uppercase tracking-wider text-black/50">Phone</p>
                          <p className="mt-1 text-sm font-medium text-black">{profile.phone || '—'}</p>
                        </div>
                        <div className="rounded-lg border-2 border-black bg-black/5 p-3">
                          <p className="text-[10px] font-bold uppercase tracking-wider text-black/50">Location</p>
                          <p className="mt-1 text-sm font-medium text-black">{profile.location || '—'}</p>
                        </div>
                        <div className="rounded-lg border-2 border-black bg-black/5 p-3">
                          <p className="text-[10px] font-bold uppercase tracking-wider text-black/50">Company</p>
                          <p className="mt-1 text-sm font-medium text-black">{profile.company || '—'}</p>
                        </div>
                        <div className="rounded-lg border-2 border-black bg-black/5 p-3">
                          <p className="text-[10px] font-bold uppercase tracking-wider text-black/50">Bio</p>
                          <p className="mt-1 text-sm font-medium text-black">{profile.bio || '—'}</p>
                        </div>
                      </div>
                      
                      {/* Fun Stats Section */}
                      <div className="mt-6 rounded-xl border-2 border-black bg-[#28D17C] p-4">
                        <p className="text-[10px] font-bold uppercase tracking-wider text-black/70 mb-3">Your Host Journey</p>
                        <div className="flex items-center gap-4">
                          <Link 
                            href="/beta/dashboard/host/properties"
                            className="flex-1 text-center p-3 rounded-lg bg-white/20 hover:bg-white/40 transition-colors cursor-pointer"
                          >
                            <div className="flex h-10 w-10 mx-auto items-center justify-center rounded-full bg-white border-2 border-black">
                              <svg className="h-5 w-5 text-black" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                              </svg>
                            </div>
                            <p className="text-xs font-bold text-black mt-2">Properties</p>
                          </Link>
                          <Link 
                            href="/beta/dashboard/collaborations"
                            className="flex-1 text-center p-3 rounded-lg bg-white/20 hover:bg-white/40 transition-colors cursor-pointer"
                          >
                            <div className="flex h-10 w-10 mx-auto items-center justify-center rounded-full bg-white border-2 border-black">
                              <svg className="h-5 w-5 text-black" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                                <path strokeLinecap="round" strokeLinejoin="round" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                              </svg>
                            </div>
                            <p className="text-xs font-bold text-black mt-2">Collabs</p>
                          </Link>
                          <Link 
                            href="/beta/dashboard/host/search-creators"
                            className="flex-1 text-center p-3 rounded-lg bg-white/20 hover:bg-white/40 transition-colors cursor-pointer"
                          >
                            <div className="flex h-10 w-10 mx-auto items-center justify-center rounded-full bg-white border-2 border-black">
                              <svg className="h-5 w-5 text-black" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                              </svg>
                            </div>
                            <p className="text-xs font-bold text-black mt-2">Find Creators</p>
                          </Link>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Edit Mode - Show form fields */}
                  {(isSetup || isEditing) && (
                    <>
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
                        <p className="mt-1 text-[10px] text-black/50">Email is linked to your login and cannot be changed here. Contact support to update.</p>
                      </div>
                      <div className="grid gap-4 md:grid-cols-2">
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
                            Location <span className="font-medium text-black/40">(optional)</span>
                          </label>
                          <input
                            value={profile.location}
                            onChange={e => setProfile({ ...profile, location: e.target.value })}
                            placeholder="City, State"
                            className={inputClass}
                          />
                        </div>
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
                      <div>
                        <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-black">
                          Bio <span className="font-medium text-black/40">(optional)</span>
                        </label>
                        <textarea
                          value={profile.bio}
                          onChange={e => setProfile({ ...profile, bio: e.target.value })}
                          placeholder="Tell us a bit about yourself and why you love being a host..."
                          rows={3}
                          className="w-full rounded-xl border-2 border-black bg-white px-4 py-3 text-[14px] font-medium text-black placeholder:text-black/40 focus:outline-none focus:ring-2 focus:ring-black/20"
                        />
                      </div>
                      
                      <div className="flex gap-3 pt-2">
                        <button
                          onClick={() => {
                            handleProfileSave()
                            if (!isSetup) setIsEditing(false)
                          }}
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
                        
                        {!isSetup && isEditing && (
                          <button
                            onClick={() => setIsEditing(false)}
                            className="rounded-full border-2 border-black bg-white px-6 py-2.5 text-sm font-bold text-black transition-transform hover:-translate-y-0.5"
                          >
                            Cancel
                          </button>
                        )}
                      </div>
                    </>
                  )}
                </div>
              )}

              {/* Notifications Tab */}
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

              {/* Account Tab */}
              {activeTab === "account" && !isSetup && (
                <div className="space-y-6">
                  {/* Account Info */}
                  <div>
                    <h3 className="mb-3 text-sm font-bold text-black">Account Information</h3>
                    <div className="space-y-2 rounded-xl border-2 border-black bg-black/5 p-4">
                      <div className="flex justify-between">
                        <span className="text-xs text-black/60">Account Type</span>
                        <span className="text-xs font-bold text-black">Host</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-xs text-black/60">Email</span>
                        <span className="text-xs font-bold text-black">{profile.email}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-xs text-black/60">Member Since</span>
                        <span className="text-xs font-bold text-black">January 2025</span>
                      </div>
                    </div>
                  </div>

                  {/* Change Email */}
                  <div>
                    <h3 className="mb-3 text-sm font-bold text-black">Change Email</h3>
                    <p className="mb-3 text-xs text-black/60">
                      To change your email address, please contact our support team. This helps us verify your identity and keep your account secure.
                    </p>
                    <button 
                      onClick={() => setShowContactModal(true)}
                      className="inline-block rounded-full border-2 border-black bg-white px-4 py-2 text-xs font-bold text-black transition-transform hover:-translate-y-0.5"
                    >
                      Contact Support
                    </button>
                  </div>

                  {/* Danger Zone */}
                  <div className="border-t-2 border-black pt-6">
                    <h3 className="mb-3 text-sm font-bold text-red-600">Danger Zone</h3>
                    <div className="rounded-xl border-2 border-red-500 bg-red-50 p-4">
                      <p className="mb-3 text-xs text-black/60">
                        Permanently delete your account and all associated data. This action cannot be undone.
                      </p>
                      {!showDeleteConfirm ? (
                        <button
                          onClick={() => setShowDeleteConfirm(true)}
                          className="rounded-full border-2 border-red-500 bg-white px-4 py-2 text-xs font-bold text-red-500 transition-colors hover:bg-red-500 hover:text-white"
                        >
                          Delete My Account
                        </button>
                      ) : (
                        <div className="space-y-3">
                          <p className="text-xs font-bold text-red-600">
                            Type DELETE to confirm account deletion:
                          </p>
                          <input
                            type="text"
                            value={deleteConfirmText}
                            onChange={e => setDeleteConfirmText(e.target.value)}
                            placeholder="Type DELETE"
                            className="h-10 w-full rounded-lg border-2 border-red-500 bg-white px-3 text-sm focus:outline-none focus:ring-2 focus:ring-red-200"
                          />
                          <div className="flex gap-2">
                            <button
                              onClick={handleDeleteAccount}
                              disabled={deleteConfirmText !== "DELETE"}
                              className="rounded-full border-2 border-red-500 bg-red-500 px-4 py-2 text-xs font-bold text-white transition-colors hover:bg-red-600 disabled:opacity-50"
                            >
                              Permanently Delete Account
                            </button>
                            <button
                              onClick={() => {
                                setShowDeleteConfirm(false)
                                setDeleteConfirmText("")
                              }}
                              className="rounded-full border-2 border-black bg-white px-4 py-2 text-xs font-bold text-black"
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
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
