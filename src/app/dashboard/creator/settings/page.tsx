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
    stripeOnboardingComplete: false,
    chargesEnabled: false,
    payoutsEnabled: false,
    w9Completed: false,
  })
  const [connectingStripe, setConnectingStripe] = useState(false)
  
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

    // Check for Stripe return params
    const urlParams = new URLSearchParams(window.location.search)
    const stripeStatus = urlParams.get('stripe')
    if (stripeStatus === 'success') {
      setToast('Stripe account connected successfully!')
      setActiveTab('payout')
      // Clean URL
      window.history.replaceState({}, '', '/dashboard/creator/settings')
      setTimeout(() => setToast(null), 5000)
    } else if (stripeStatus === 'refresh') {
      setToast('Please complete Stripe onboarding')
      setActiveTab('payout')
      window.history.replaceState({}, '', '/dashboard/creator/settings')
      setTimeout(() => setToast(null), 5000)
    }

    // Fetch Stripe status
    async function fetchStripeStatus() {
      try {
        const res = await fetch('/api/stripe/connect')
        if (res.ok) {
          const data = await res.json()
          setPayout(prev => ({
            ...prev,
            stripeConnected: data.connected,
            stripeOnboardingComplete: data.onboardingComplete,
            chargesEnabled: data.chargesEnabled,
            payoutsEnabled: data.payoutsEnabled,
          }))
        }
      } catch (e) {
        console.error('Failed to fetch Stripe status:', e)
      }
    }
    fetchStripeStatus()
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

  const handleConnectStripe = async () => {
    setConnectingStripe(true)
    try {
      const res = await fetch('/api/stripe/connect', { method: 'POST' })
      const data = await res.json()
      
      if (res.ok && data.url) {
        // Redirect to Stripe onboarding
        window.location.href = data.url
      } else {
        setToast(data.error || 'Failed to connect Stripe')
        setTimeout(() => setToast(null), 3000)
      }
    } catch (e) {
      console.error('Stripe connect error:', e)
      setToast('Network error. Please try again.')
      setTimeout(() => setToast(null), 3000)
    }
    setConnectingStripe(false)
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
              {/* Stripe Connect */}
              <div className="rounded-xl border-[3px] border-black bg-white p-5">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none">
                        <rect width="24" height="24" rx="4" fill="#635BFF"/>
                        <path d="M13.976 9.15c-2.172-.806-3.356-1.426-3.356-2.409 0-.831.683-1.305 1.901-1.305 2.227 0 4.515.858 6.09 1.631l.89-5.494C18.252.975 15.697 0 12.165 0 9.667 0 7.589.654 6.104 1.872 4.56 3.147 3.757 4.992 3.757 7.218c0 4.039 2.467 5.76 6.476 7.219 2.585.92 3.445 1.574 3.445 2.583 0 .98-.84 1.545-2.354 1.545-1.875 0-4.965-.921-6.99-2.109l-.9 5.555C5.175 22.99 8.385 24 11.714 24c2.641 0 4.843-.624 6.328-1.813 1.664-1.305 2.525-3.236 2.525-5.732 0-4.128-2.524-5.851-6.594-7.305h.003z" fill="white"/>
                      </svg>
                      <p className="text-sm font-bold text-black">Stripe Connect</p>
                    </div>
                    <p className="mt-1 text-xs text-black/60">Connect your bank account to receive payouts</p>
                  </div>
                  
                  {payout.stripeConnected && payout.payoutsEnabled ? (
                    <span className="shrink-0 rounded-full border-2 border-black bg-[#28D17C] px-3 py-1 text-[10px] font-black text-black">
                      ✓ Ready
                    </span>
                  ) : payout.stripeConnected && !payout.stripeOnboardingComplete ? (
                    <button
                      onClick={handleConnectStripe}
                      disabled={connectingStripe}
                      className="shrink-0 rounded-full border-2 border-black bg-[#FFD84A] px-4 py-1 text-[10px] font-black text-black transition-transform hover:-translate-y-0.5 disabled:opacity-50"
                    >
                      {connectingStripe ? 'Loading...' : 'Complete Setup'}
                    </button>
                  ) : (
                    <button
                      onClick={handleConnectStripe}
                      disabled={connectingStripe}
                      className="shrink-0 rounded-full border-2 border-black bg-black px-4 py-2 text-[10px] font-black uppercase tracking-wider text-white transition-transform hover:-translate-y-0.5 disabled:opacity-50"
                    >
                      {connectingStripe ? 'Loading...' : 'Connect'}
                    </button>
                  )}
                </div>

                {/* Status details */}
                {payout.stripeConnected && (
                  <div className="mt-4 grid grid-cols-2 gap-3 border-t-2 border-black/10 pt-4">
                    <div className="flex items-center gap-2">
                      <span className={`h-2 w-2 rounded-full ${payout.stripeOnboardingComplete ? 'bg-[#28D17C]' : 'bg-[#FFD84A]'}`} />
                      <span className="text-[10px] font-bold text-black">
                        {payout.stripeOnboardingComplete ? 'Onboarding complete' : 'Onboarding pending'}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`h-2 w-2 rounded-full ${payout.payoutsEnabled ? 'bg-[#28D17C]' : 'bg-[#FFD84A]'}`} />
                      <span className="text-[10px] font-bold text-black">
                        {payout.payoutsEnabled ? 'Payouts enabled' : 'Payouts pending'}
                      </span>
                    </div>
                  </div>
                )}

                {!payout.stripeConnected && (
                  <div className="mt-4 rounded-lg bg-[#4AA3FF]/10 p-3">
                    <p className="text-[10px] font-bold text-black">Why connect Stripe?</p>
                    <ul className="mt-2 space-y-1 text-[10px] text-black/70">
                      <li>• Receive payments directly to your bank account</li>
                      <li>• Fast payouts within 2-3 business days</li>
                      <li>• Automatic 1099 tax forms for US creators</li>
                      <li>• Secure, industry-standard payments</li>
                    </ul>
                  </div>
                )}
              </div>

              {/* Earnings Summary */}
              <div className="rounded-xl border-[3px] border-black bg-[#28D17C] p-5">
                <p className="text-[10px] font-bold uppercase tracking-wider text-black/60">Lifetime Earnings</p>
                <p className="mt-1 text-3xl font-black text-black">$0.00</p>
                <p className="mt-1 text-xs text-black/70">Complete your first collaboration to start earning</p>
              </div>

              {/* Tax Info */}
              <div className="rounded-xl border-[3px] border-black bg-white p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-bold text-black">Tax Information</p>
                    <p className="text-xs text-black/60">Stripe handles 1099 forms automatically for US creators</p>
                  </div>
                  <span className="rounded-full border border-black/20 bg-black/5 px-3 py-1 text-[10px] font-bold text-black/60">
                    Automatic
                  </span>
                </div>
                <p className="mt-3 text-[10px] text-black/60">
                  If you earn $600+ in a calendar year, Stripe will issue a 1099-NEC form. 
                  Make sure your legal name and SSN are correct in Stripe.
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
