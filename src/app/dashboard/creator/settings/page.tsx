"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"

function getCookie(name: string): string | null {
  if (typeof document === 'undefined') return null
  const value = `; ${document.cookie}`
  const parts = value.split(`; ${name}=`)
  if (parts.length === 2) {
    const cookieValue = parts.pop()?.split(';').shift()
    return cookieValue ? decodeURIComponent(cookieValue) : null
  }
  return null
}

export default function CreatorSettingsPage() {
  const router = useRouter()
  const [user, setUser] = useState<{ email: string } | null>(null)
  const [activeTab, setActiveTab] = useState<"profile" | "password" | "payout" | "notifications">("profile")
  const [toast, setToast] = useState<string | null>(null)
  
  // Profile form
  const [profile, setProfile] = useState({
    displayName: "Demo Creator",
    email: "",
    phone: "+1 (555) 987-6543",
    handle: "democreator",
  })
  
  // Password form
  const [passwords, setPasswords] = useState({
    current: "",
    new: "",
    confirm: "",
  })
  
  // Payout settings
  const [payout, setPayout] = useState({
    stripeConnected: false,
    w9Completed: false,
  })
  
  // Notifications
  const [notifications, setNotifications] = useState({
    newOffers: true,
    hostMessages: true,
    paymentAlerts: true,
    marketingEmails: false,
  })

  useEffect(() => {
    const userCookie = getCookie('cs_user')
    if (userCookie) {
      try {
        const userData = JSON.parse(userCookie)
        setUser(userData)
        setProfile(prev => ({ ...prev, email: userData.email }))
      } catch {
        router.push('/login/creator')
      }
    } else {
      router.push('/login/creator')
    }
  }, [router])

  const handleProfileSave = () => {
    setToast("Profile updated")
    setTimeout(() => setToast(null), 3000)
  }

  const handlePasswordSave = () => {
    if (passwords.new !== passwords.confirm) {
      setToast("Passwords don't match")
      setTimeout(() => setToast(null), 3000)
      return
    }
    if (passwords.new.length < 8) {
      setToast("Password must be at least 8 characters")
      setTimeout(() => setToast(null), 3000)
      return
    }
    setPasswords({ current: "", new: "", confirm: "" })
    setToast("Password updated")
    setTimeout(() => setToast(null), 3000)
  }

  const handleNotificationsSave = () => {
    setToast("Notification preferences saved")
    setTimeout(() => setToast(null), 3000)
  }

  const handleConnectStripe = () => {
    // Fake Stripe connect
    setPayout({ ...payout, stripeConnected: true })
    setToast("Stripe connected (demo)")
    setTimeout(() => setToast(null), 3000)
  }

  const handleW9 = () => {
    // Fake W9 completion
    setPayout({ ...payout, w9Completed: true })
    setToast("W-9 submitted (demo)")
    setTimeout(() => setToast(null), 3000)
  }

  const handleLogout = () => {
    document.cookie = "cs_session=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/"
    document.cookie = "cs_role=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/"
    document.cookie = "cs_user=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/"
    router.push("/login/creator")
  }

  const inputClass = "h-10 w-full rounded-lg border-[2px] border-black bg-white px-3 text-[13px] font-medium text-black placeholder:text-black/40 focus:outline-none focus:ring-2 focus:ring-black/20"

  if (!user) {
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
            <p className="text-[9px] font-black uppercase tracking-wider text-white/60">Creator Settings</p>
            <h1 className="font-heading text-[1.5rem] leading-[0.9] text-white" style={{ fontWeight: 900 }}>
              ACCOUNT
            </h1>
          </div>
          <Link
            href="/dashboard/creator"
            className="inline-flex h-9 items-center rounded-full border-[2px] border-white/20 px-4 text-[10px] font-black uppercase tracking-wider text-white transition-colors hover:border-white/40"
          >
            ← Dashboard
          </Link>
        </div>

        {/* Tabs */}
        <div className="mb-3 flex flex-wrap gap-1">
          {(["profile", "password", "payout", "notifications"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`rounded-full px-4 py-2 text-[10px] font-black uppercase tracking-wider transition-all ${
                activeTab === tab
                  ? "bg-[#4AA3FF] text-black border-[2px] border-black"
                  : "bg-white/10 text-white border-[2px] border-transparent hover:bg-white/20"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="rounded-2xl border-[3px] border-black bg-white p-5">
          {activeTab === "profile" && (
            <div className="space-y-4">
              <div>
                <label className="mb-1 block text-[10px] font-black uppercase tracking-wider text-black">Display Name</label>
                <input
                  value={profile.displayName}
                  onChange={e => setProfile({ ...profile, displayName: e.target.value })}
                  className={inputClass}
                />
              </div>
              <div>
                <label className="mb-1 block text-[10px] font-black uppercase tracking-wider text-black">Handle</label>
                <div className="flex items-center gap-1">
                  <span className="text-[13px] font-medium text-black">@</span>
                  <input
                    value={profile.handle}
                    onChange={e => setProfile({ ...profile, handle: e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, '') })}
                    className={inputClass}
                  />
                </div>
                <p className="mt-1 text-[10px] font-medium text-black/60">creatorstays.com/c/{profile.handle}</p>
              </div>
              <div>
                <label className="mb-1 block text-[10px] font-black uppercase tracking-wider text-black">Email</label>
                <input
                  type="email"
                  value={profile.email}
                  onChange={e => setProfile({ ...profile, email: e.target.value })}
                  className={inputClass}
                />
              </div>
              <div>
                <label className="mb-1 block text-[10px] font-black uppercase tracking-wider text-black">Phone</label>
                <input
                  type="tel"
                  value={profile.phone}
                  onChange={e => setProfile({ ...profile, phone: e.target.value })}
                  className={inputClass}
                />
              </div>
              <button
                onClick={handleProfileSave}
                className="h-10 rounded-full bg-black px-6 text-[10px] font-black uppercase tracking-wider text-white transition-transform duration-200 hover:-translate-y-0.5"
              >
                Save Changes
              </button>
            </div>
          )}

          {activeTab === "password" && (
            <div className="space-y-4">
              <div>
                <label className="mb-1 block text-[10px] font-black uppercase tracking-wider text-black">Current Password</label>
                <input
                  type="password"
                  value={passwords.current}
                  onChange={e => setPasswords({ ...passwords, current: e.target.value })}
                  placeholder="Enter current password"
                  className={inputClass}
                />
              </div>
              <div>
                <label className="mb-1 block text-[10px] font-black uppercase tracking-wider text-black">New Password</label>
                <input
                  type="password"
                  value={passwords.new}
                  onChange={e => setPasswords({ ...passwords, new: e.target.value })}
                  placeholder="Enter new password"
                  className={inputClass}
                />
                <p className="mt-1 text-[10px] font-medium text-black/60">Minimum 8 characters</p>
              </div>
              <div>
                <label className="mb-1 block text-[10px] font-black uppercase tracking-wider text-black">Confirm New Password</label>
                <input
                  type="password"
                  value={passwords.confirm}
                  onChange={e => setPasswords({ ...passwords, confirm: e.target.value })}
                  placeholder="Confirm new password"
                  className={inputClass}
                />
              </div>
              <button
                onClick={handlePasswordSave}
                className="h-10 rounded-full bg-black px-6 text-[10px] font-black uppercase tracking-wider text-white transition-transform duration-200 hover:-translate-y-0.5"
              >
                Update Password
              </button>
            </div>
          )}

          {activeTab === "payout" && (
            <div className="space-y-4">
              <div className="rounded-lg border-[2px] border-black p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-[12px] font-bold text-black">Stripe Connect</p>
                    <p className="text-[10px] font-medium text-black/60">Receive payouts to your bank account</p>
                  </div>
                  {payout.stripeConnected ? (
                    <span className="rounded-full bg-[#28D17C] border-[2px] border-black px-3 py-1 text-[10px] font-black text-black">
                      Connected
                    </span>
                  ) : (
                    <button
                      onClick={handleConnectStripe}
                      className="h-9 rounded-full bg-black px-4 text-[10px] font-black uppercase tracking-wider text-white transition-transform duration-200 hover:-translate-y-0.5"
                    >
                      Connect
                    </button>
                  )}
                </div>
              </div>

              <div className="rounded-lg border-[2px] border-black p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-[12px] font-bold text-black">W-9 Tax Form</p>
                    <p className="text-[10px] font-medium text-black/60">Required for US creators earning $600+</p>
                  </div>
                  {payout.w9Completed ? (
                    <span className="rounded-full bg-[#28D17C] border-[2px] border-black px-3 py-1 text-[10px] font-black text-black">
                      Submitted
                    </span>
                  ) : (
                    <button
                      onClick={handleW9}
                      className="h-9 rounded-full border-[2px] border-black bg-white px-4 text-[10px] font-black uppercase tracking-wider text-black transition-transform duration-200 hover:-translate-y-0.5"
                    >
                      Fill Out
                    </button>
                  )}
                </div>
              </div>

              <div className="rounded-lg border-[2px] border-black/20 bg-black/5 p-4">
                <p className="text-[11px] font-medium text-black">
                  Once you earn $600+ in a calendar year, we'll automatically generate your 1099 tax form via Stripe.
                </p>
              </div>
            </div>
          )}

          {activeTab === "notifications" && (
            <div className="space-y-3">
              {[
                { key: "newOffers", label: "New host offers", desc: "When a host sends you an offer" },
                { key: "hostMessages", label: "Host messages", desc: "Direct messages from hosts" },
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

        {/* Danger zone */}
        <div className="mt-4 rounded-2xl border-[3px] border-[#FF6B6B] bg-white p-5">
          <p className="text-[10px] font-black uppercase tracking-wider text-[#FF6B6B]">Danger Zone</p>
          <div className="mt-3 flex items-center justify-between">
            <div>
              <p className="text-[12px] font-bold text-black">Sign out</p>
              <p className="text-[10px] font-medium text-black/60">Log out of your account</p>
            </div>
            <button
              onClick={handleLogout}
              className="h-9 rounded-full border-[2px] border-[#FF6B6B] px-4 text-[10px] font-black uppercase tracking-wider text-[#FF6B6B] transition-transform duration-200 hover:-translate-y-0.5"
            >
              Logout
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
