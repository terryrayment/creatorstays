"use client"

import { useState, useEffect, Suspense } from "react"
import { useSession, signOut } from "next-auth/react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import LocationAutocomplete from "@/components/ui/location-autocomplete"

function CreatorSettingsContent() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const searchParams = useSearchParams()
  
  const [activeTab, setActiveTab] = useState<"profile" | "payout" | "notifications">("profile")
  const [toast, setToast] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  
  // Profile form
  const [profile, setProfile] = useState({
    displayName: "",
    email: "",
    handle: "",
    bio: "",
    location: "",
  })
  
  // Payout settings
  const [payout, setPayout] = useState({
    stripeConnected: false,
    stripeOnboardingComplete: false,
    chargesEnabled: false,
    payoutsEnabled: false,
  })
  const [connectingStripe, setConnectingStripe] = useState(false)
  
  // Notifications
  const [notifications, setNotifications] = useState({
    newOffers: true,
    hostMessages: true,
    paymentAlerts: true,
    marketingEmails: false,
  })

  // Redirect if not logged in
  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login/creator")
    }
  }, [status, router])

  // Fetch profile and Stripe status
  useEffect(() => {
    if (status !== "authenticated") return

    async function fetchData() {
      try {
        // Fetch creator profile
        const profileRes = await fetch('/api/creator/profile')
        if (profileRes.ok) {
          const data = await profileRes.json()
          setProfile({
            displayName: data.displayName || session?.user?.name || "",
            email: session?.user?.email || "",
            handle: data.handle || "",
            bio: data.bio || "",
            location: data.location || "",
          })
        }

        // Fetch Stripe status
        const stripeRes = await fetch('/api/stripe/connect')
        if (stripeRes.ok) {
          const data = await stripeRes.json()
          setPayout({
            stripeConnected: data.connected,
            stripeOnboardingComplete: data.onboardingComplete,
            chargesEnabled: data.chargesEnabled,
            payoutsEnabled: data.payoutsEnabled,
          })
        }
      } catch (e) {
        console.error('Failed to fetch data:', e)
      }
      setLoading(false)
    }

    fetchData()
  }, [status, session])

  // Handle Stripe return params
  useEffect(() => {
    const stripeStatus = searchParams.get('stripe')
    if (stripeStatus === 'success') {
      setToast('Stripe account connected successfully!')
      setActiveTab('payout')
      window.history.replaceState({}, '', '/beta/dashboard/creator/settings')
      // Refresh Stripe status
      fetch('/api/stripe/connect').then(res => res.json()).then(data => {
        setPayout({
          stripeConnected: data.connected,
          stripeOnboardingComplete: data.onboardingComplete,
          chargesEnabled: data.chargesEnabled,
          payoutsEnabled: data.payoutsEnabled,
        })
      })
      setTimeout(() => setToast(null), 5000)
    } else if (stripeStatus === 'refresh') {
      setToast('Please complete Stripe onboarding')
      setActiveTab('payout')
      window.history.replaceState({}, '', '/beta/dashboard/creator/settings')
      setTimeout(() => setToast(null), 5000)
    }
  }, [searchParams])

  const handleProfileSave = async () => {
    try {
      const res = await fetch('/api/creator/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          displayName: profile.displayName,
          bio: profile.bio,
          location: profile.location,
        }),
      })
      if (res.ok) {
        setToast("Profile updated")
      } else {
        setToast("Failed to update profile")
      }
    } catch (e) {
      setToast("Error saving profile")
    }
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

  const handleLogout = async () => {
    await signOut({ callbackUrl: "/login/creator" })
  }

  const inputClass = "h-10 w-full rounded-lg border-[2px] border-black bg-white px-3 text-[13px] font-medium text-black placeholder:text-black/40 focus:outline-none focus:ring-2 focus:ring-black/20"

  if (status === "loading" || loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <p className="text-white">Loading...</p>
      </div>
    )
  }

  if (!session) {
    return null
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
            href="/beta/dashboard/creator"
            className="inline-flex h-9 items-center rounded-full border-[2px] border-white/20 px-4 text-[10px] font-black uppercase tracking-wider text-white transition-colors hover:border-white/40"
          >
            ← Dashboard
          </Link>
        </div>

        {/* Tabs */}
        <div className="mb-3 flex flex-wrap gap-1">
          {(["profile", "payout", "notifications"] as const).map((tab) => (
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
                    disabled
                    className={`${inputClass} bg-black/5 cursor-not-allowed`}
                  />
                </div>
                <p className="mt-1 text-[10px] font-medium text-black/60">creatorstays.com/c/{profile.handle}</p>
              </div>
              <div>
                <label className="mb-1 block text-[10px] font-black uppercase tracking-wider text-black">Email</label>
                <input
                  type="email"
                  value={profile.email}
                  disabled
                  className={`${inputClass} bg-black/5 cursor-not-allowed`}
                />
                <p className="mt-1 text-[10px] font-medium text-black/60">Email cannot be changed. Sign in with a different email to use another account.</p>
              </div>
              <div>
                <label className="mb-1 block text-[10px] font-black uppercase tracking-wider text-black">Bio</label>
                <textarea
                  value={profile.bio}
                  onChange={e => setProfile({ ...profile, bio: e.target.value })}
                  rows={3}
                  className="w-full rounded-lg border-[2px] border-black bg-white px-3 py-2 text-[13px] font-medium text-black placeholder:text-black/40 focus:outline-none focus:ring-2 focus:ring-black/20"
                  placeholder="Tell hosts about yourself..."
                />
              </div>
              <div>
                <label className="mb-1 block text-[10px] font-black uppercase tracking-wider text-black">Location</label>
                <LocationAutocomplete
                  value={profile.location}
                  onChange={val => setProfile({ ...profile, location: val })}
                  placeholder="Los Angeles, CA"
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

function LoadingFallback() {
  return (
    <div className="min-h-screen bg-black flex items-center justify-center">
      <p className="text-white">Loading...</p>
    </div>
  )
}

export default function CreatorSettingsPage() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <CreatorSettingsContent />
    </Suspense>
  )
}
