"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"

interface AdminStats {
  overview: {
    totalUsers: number
    totalCreators: number
    totalHosts: number
    totalProperties: number
    totalOffers: number
    totalCollaborations: number
    totalMessages: number
    totalReviews: number
    recentUsers: number
    recentOffers: number
    paymentVolume: number
  }
  offerStats: Record<string, number>
  collabStats: Record<string, number>
  recentCreators: {
    id: string
    displayName: string
    handle: string
    email: string
    location: string | null
    createdAt: string
  }[]
  recentHosts: {
    id: string
    displayName: string
    email: string
    propertyCount: number
    createdAt: string
    lastLoginAt: string | null
    location: string | null
    propertyUrl: string | null
    propertyTitle: string | null
    bio: string | null
    onboardingComplete: boolean
    membershipPaid: boolean
  }[]
  recentCollaborations: {
    id: string
    creatorName: string
    hostName: string
    propertyTitle: string | null
    status: string
    createdAt: string
  }[]
  recentOffers: {
    id: string
    creatorName: string
    hostName: string
    status: string
    cashCents: number
    createdAt: string
  }[]
}

interface Conversation {
  id: string
  hostProfile: { id: string; displayName: string; contactEmail: string }
  creatorProfile: { id: string; displayName: string; email: string; handle: string }
  messages: { id: string; senderType: string; body: string; sentAt: string }[]
  lastMessageAt: string
}

interface FinancialData {
  subscriptions: {
    totalPaidHosts: number
    paidMemberships: number
    freeMemberships: number
    membershipRevenue: number
    hostsPaidThisMonth: number
    recentSubscriptions: any[]
  }
  deals: {
    totalDealVolume: number
    totalPlatformFees: number
    completedDeals: number
    activeDeals: number
    pendingDeals: number
    avgDealSize: number
    recentCollaborations: any[]
  }
  forecasting: {
    thisMonthSignups: number
    lastMonthSignups: number
    growthRate: string
    projectedNewHosts: number
    projectedMembershipRevenue: number
    projectedDealRevenue: number
    projectedTotalRevenue: number
  }
  affiliateLinks: {
    links: any[]
    totalClicks: number
    totalUniqueClicks: number
    activeLinks: number
  }
}

function formatCurrency(cents: number): string {
  return (cents / 100).toLocaleString("en-US", { style: "currency", currency: "USD", minimumFractionDigits: 0 })
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("en-US", { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" })
}

function StatCard({ label, value, subValue, color }: { label: string; value: string | number; subValue?: string; color: string }) {
  return (
    <div className={`rounded-xl border-2 border-black ${color} p-4`}>
      <p className="text-[10px] font-bold uppercase tracking-wider text-black/60">{label}</p>
      <p className="mt-1 text-2xl font-black text-black">{value}</p>
      {subValue && <p className="mt-0.5 text-xs text-black/60">{subValue}</p>}
    </div>
  )
}

function StatusBadge({ status }: { status: string }) {
  const colors: Record<string, string> = {
    pending: "bg-[#FFD84A]",
    accepted: "bg-[#28D17C]",
    declined: "bg-red-400",
    countered: "bg-[#4AA3FF]",
    completed: "bg-[#28D17C]",
    active: "bg-[#4AA3FF]",
    "pending-agreement": "bg-[#FFD84A]",
    "content-submitted": "bg-[#D7B6FF]",
    paid: "bg-[#28D17C]",
  }
  return (
    <span className={`rounded-full border border-black px-2 py-0.5 text-[9px] font-bold text-black ${colors[status] || "bg-gray-200"}`}>
      {status}
    </span>
  )
}

type TabType = "overview" | "creators" | "hosts" | "offers" | "collabs" | "messages" | "financials" | "announce"

export default function AdminDashboardPage() {
  const router = useRouter()
  const [stats, setStats] = useState<AdminStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [activeTab, setActiveTab] = useState<TabType>("overview")
  const [sendingAnnouncement, setSendingAnnouncement] = useState(false)
  const [announcementResult, setAnnouncementResult] = useState<{ success: boolean; message: string; count?: number } | null>(null)

  // Messages state
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [hosts, setHosts] = useState<any[]>([])
  const [creators, setCreators] = useState<any[]>([])
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null)
  const [newMessage, setNewMessage] = useState({ hostId: "", creatorId: "", message: "", senderType: "host" })
  const [sendingMessage, setSendingMessage] = useState(false)
  const [messageSuccess, setMessageSuccess] = useState("")

  // Financials state
  const [financials, setFinancials] = useState<FinancialData | null>(null)
  const [loadingFinancials, setLoadingFinancials] = useState(false)

  useEffect(() => {
    async function fetchStats() {
      try {
        const res = await fetch("/api/admin/stats")
        if (res.status === 401) {
          router.push("/admin/login")
          return
        }
        if (res.ok) {
          const data = await res.json()
          setStats(data)
        } else {
          setError("Failed to load admin data")
        }
      } catch (e) {
        setError("Network error")
      }
      setLoading(false)
    }

    fetchStats()
  }, [router])

  // Fetch messages when tab changes
  useEffect(() => {
    if (activeTab === "messages") {
      fetchMessages()
    }
  }, [activeTab])

  // Fetch financials when tab changes
  useEffect(() => {
    if (activeTab === "financials" && !financials) {
      fetchFinancials()
    }
  }, [activeTab])

  const fetchMessages = async () => {
    try {
      const res = await fetch("/api/admin/messages")
      if (res.ok) {
        const data = await res.json()
        setConversations(data.conversations || [])
        setHosts(data.hosts || [])
        setCreators(data.creators || [])
      }
    } catch (e) {
      console.error("Failed to fetch messages:", e)
    }
  }

  const fetchFinancials = async () => {
    setLoadingFinancials(true)
    try {
      const res = await fetch("/api/admin/financials")
      if (res.ok) {
        const data = await res.json()
        setFinancials(data)
      }
    } catch (e) {
      console.error("Failed to fetch financials:", e)
    }
    setLoadingFinancials(false)
  }

  const fetchConversation = async (conversationId: string) => {
    try {
      const res = await fetch(`/api/admin/messages?conversationId=${conversationId}`)
      if (res.ok) {
        const data = await res.json()
        setSelectedConversation(data.conversation)
      }
    } catch (e) {
      console.error("Failed to fetch conversation:", e)
    }
  }

  const sendMessage = async () => {
    if (!newMessage.hostId || !newMessage.creatorId || !newMessage.message) return
    setSendingMessage(true)
    try {
      const res = await fetch("/api/admin/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newMessage)
      })
      if (res.ok) {
        setMessageSuccess("Message sent!")
        setNewMessage({ ...newMessage, message: "" })
        fetchMessages()
        setTimeout(() => setMessageSuccess(""), 3000)
      }
    } catch (e) {
      console.error("Failed to send message:", e)
    }
    setSendingMessage(false)
  }

  const handleLogout = async () => {
    await fetch("/api/admin/logout", { method: "POST" })
    router.push("/admin/login")
  }

  const handleSendAnnouncement = async (type: string) => {
    setSendingAnnouncement(true)
    setAnnouncementResult(null)
    
    try {
      const res = await fetch("/api/admin/announce", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type })
      })
      const data = await res.json()
      setAnnouncementResult(data)
    } catch (e) {
      setAnnouncementResult({ success: false, message: "Network error" })
    }
    setSendingAnnouncement(false)
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-black">
        <div className="text-white">Loading...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-black">
        <div className="rounded-2xl border-2 border-black bg-white p-8 text-center">
          <p className="text-lg font-bold text-red-500">{error}</p>
          <Link href="/" className="mt-4 inline-block rounded-full bg-black px-6 py-2 text-sm font-bold text-white">
            Go Home
          </Link>
        </div>
      </div>
    )
  }

  if (!stats) return null

  const tabs: { id: TabType; label: string }[] = [
    { id: "overview", label: "Overview" },
    { id: "creators", label: "Creators" },
    { id: "hosts", label: "Hosts" },
    { id: "offers", label: "Offers" },
    { id: "collabs", label: "Collaborations" },
    { id: "messages", label: "💬 Messages" },
    { id: "financials", label: "💰 Financials" },
    { id: "announce", label: "📢 Announce" },
  ]

  return (
    <div className="min-h-screen bg-black pt-16">
      {/* Header */}
      <div className="border-b-2 border-white/20 bg-black px-4 py-6">
        <div className="mx-auto flex max-w-7xl items-center justify-between">
          <div>
            <h1 className="font-heading text-3xl font-black text-white">ADMIN DASHBOARD</h1>
            <p className="mt-1 text-sm text-white/60">Platform overview and management</p>
          </div>
          <button
            onClick={handleLogout}
            className="rounded-full border-2 border-white/30 px-4 py-2 text-xs font-bold text-white/70 transition-colors hover:border-white hover:text-white"
          >
            Logout
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b-2 border-white/20 bg-black px-4">
        <div className="mx-auto flex max-w-7xl gap-1 overflow-x-auto">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`whitespace-nowrap border-b-2 px-4 py-3 text-xs font-bold uppercase tracking-wider transition-colors ${
                activeTab === tab.id
                  ? "border-[#28D17C] text-white"
                  : "border-transparent text-white/50 hover:text-white"
              }`}
            >
              {tab.label}
            </button>
          ))}
          <Link
            href="/admin/promo-codes"
            className="whitespace-nowrap border-b-2 border-transparent px-4 py-3 text-xs font-bold uppercase tracking-wider text-[#FFD84A] hover:text-white transition-colors"
          >
            🎟️ Promo Codes
          </Link>
        </div>
      </div>

      {/* Content */}
      <div className="mx-auto max-w-7xl px-4 py-6">
        {/* OVERVIEW TAB */}
        {activeTab === "overview" && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-3 md:grid-cols-4 lg:grid-cols-5">
              <StatCard label="Total Users" value={stats.overview.totalUsers} subValue={`+${stats.overview.recentUsers} this week`} color="bg-white" />
              <StatCard label="Creators" value={stats.overview.totalCreators} color="bg-[#4AA3FF]" />
              <StatCard label="Hosts" value={stats.overview.totalHosts} color="bg-[#FFD84A]" />
              <StatCard label="Properties" value={stats.overview.totalProperties} color="bg-[#28D17C]" />
              <StatCard label="Payment Volume" value={formatCurrency(stats.overview.paymentVolume)} color="bg-[#D7B6FF]" />
            </div>

            <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
              <StatCard label="Total Offers" value={stats.overview.totalOffers} subValue={`+${stats.overview.recentOffers} this week`} color="bg-white" />
              <StatCard label="Collaborations" value={stats.overview.totalCollaborations} color="bg-white" />
              <StatCard label="Messages" value={stats.overview.totalMessages} color="bg-white" />
              <StatCard label="Reviews" value={stats.overview.totalReviews} color="bg-white" />
            </div>

            <div className="rounded-xl border-2 border-black bg-white p-4">
              <h3 className="mb-3 text-sm font-bold text-black">Offer Status Breakdown</h3>
              <div className="flex flex-wrap gap-3">
                {Object.entries(stats.offerStats).map(([status, count]) => (
                  <div key={status} className="flex items-center gap-2">
                    <StatusBadge status={status} />
                    <span className="text-sm font-bold text-black">{count}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-xl border-2 border-black bg-white p-4">
              <h3 className="mb-3 text-sm font-bold text-black">Collaboration Status Breakdown</h3>
              <div className="flex flex-wrap gap-3">
                {Object.entries(stats.collabStats).map(([status, count]) => (
                  <div key={status} className="flex items-center gap-2">
                    <StatusBadge status={status} />
                    <span className="text-sm font-bold text-black">{count}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* CREATORS TAB */}
        {activeTab === "creators" && (
          <div className="rounded-xl border-2 border-black bg-white p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-black">Recent Creators</h3>
              <span className="text-xs text-black/60">{stats.recentCreators.length} creators</span>
            </div>
            <div className="space-y-3">
              {stats.recentCreators.map(creator => (
                <div key={creator.id} className="flex items-center justify-between border-b border-black/10 pb-3 last:border-0">
                  <div>
                    <p className="font-bold text-black">{creator.displayName}</p>
                    <p className="text-xs text-black/60">@{creator.handle} · {creator.email}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-black/60">{formatDate(creator.createdAt)}</p>
                    <Link href={`/creators/${creator.handle}`} className="text-xs font-bold text-[#4AA3FF] hover:underline">
                      View Profile →
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* HOSTS TAB */}
        {activeTab === "hosts" && (
          <div className="rounded-xl border-2 border-black bg-white p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-black">Recent Hosts</h3>
              <span className="text-xs text-black/60">{stats.recentHosts.length} hosts</span>
            </div>
            <div className="space-y-4">
              {stats.recentHosts.map(host => (
                <div key={host.id} className="border-b border-black/10 pb-4 last:border-0">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-bold text-black">{host.displayName}</p>
                        <span className={`rounded-full border border-black px-2 py-0.5 text-[9px] font-bold ${host.membershipPaid ? "bg-[#28D17C]" : "bg-gray-200"}`}>
                          {host.membershipPaid ? "PAID" : "UNPAID"}
                        </span>
                        {!host.onboardingComplete && (
                          <span className="rounded-full border border-black bg-[#FFD84A] px-2 py-0.5 text-[9px] font-bold">INCOMPLETE</span>
                        )}
                      </div>
                      <p className="text-xs text-black/60">{host.email}</p>
                      {host.location && <p className="text-xs text-black/40">📍 {host.location}</p>}
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-black">{host.propertyCount} property</p>
                      <p className="text-xs text-black/60">Joined: {formatDate(host.createdAt)}</p>
                      {host.lastLoginAt && <p className="text-xs text-black/40">Last login: {formatDate(host.lastLoginAt)}</p>}
                    </div>
                  </div>
                  {host.propertyTitle && (
                    <div className="mt-2 rounded-lg bg-black/5 p-2">
                      <p className="text-sm font-bold text-black">{host.propertyTitle}</p>
                      {host.propertyUrl && (
                        <a href={host.propertyUrl} target="_blank" rel="noopener noreferrer" className="text-xs text-[#4AA3FF] hover:underline">
                          🏠 Airbnb: View Listing →
                        </a>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* OFFERS TAB */}
        {activeTab === "offers" && (
          <div className="rounded-xl border-2 border-black bg-white p-4">
            <h3 className="mb-4 text-sm font-bold text-black">Recent Offers</h3>
            <div className="space-y-3">
              {stats.recentOffers.map(offer => (
                <div key={offer.id} className="flex items-center justify-between border-b border-black/10 pb-3 last:border-0">
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-bold text-black">{offer.hostName} → {offer.creatorName}</p>
                      <StatusBadge status={offer.status} />
                    </div>
                    <p className="text-xs text-black/60">{formatCurrency(offer.cashCents)}</p>
                  </div>
                  <p className="text-xs text-black/60">{formatDate(offer.createdAt)}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* COLLABORATIONS TAB */}
        {activeTab === "collabs" && (
          <div className="rounded-xl border-2 border-black bg-white p-4">
            <h3 className="mb-4 text-sm font-bold text-black">Recent Collaborations</h3>
            <div className="space-y-3">
              {stats.recentCollaborations.map(collab => (
                <div key={collab.id} className="flex items-center justify-between border-b border-black/10 pb-3 last:border-0">
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-bold text-black">{collab.hostName} + {collab.creatorName}</p>
                      <StatusBadge status={collab.status} />
                    </div>
                    {collab.propertyTitle && <p className="text-xs text-black/60">{collab.propertyTitle}</p>}
                  </div>
                  <p className="text-xs text-black/60">{formatDate(collab.createdAt)}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* MESSAGES TAB */}
        {activeTab === "messages" && (
          <div className="space-y-6">
            {/* Send New Message */}
            <div className="rounded-xl border-2 border-black bg-white p-4">
              <h3 className="mb-4 text-sm font-bold text-black">Send Message as Admin</h3>
              {messageSuccess && (
                <div className="mb-4 rounded-lg border-2 border-[#28D17C] bg-[#28D17C] p-2 text-sm font-bold text-black">
                  {messageSuccess}
                </div>
              )}
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <div>
                  <label className="mb-1 block text-xs font-bold text-black">Host</label>
                  <select
                    value={newMessage.hostId}
                    onChange={e => setNewMessage({ ...newMessage, hostId: e.target.value })}
                    className="w-full rounded-lg border-2 border-black bg-white px-3 py-2 text-sm"
                  >
                    <option value="">Select host...</option>
                    {hosts.map(h => (
                      <option key={h.id} value={h.id}>{h.displayName} ({h.contactEmail})</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="mb-1 block text-xs font-bold text-black">Creator</label>
                  <select
                    value={newMessage.creatorId}
                    onChange={e => setNewMessage({ ...newMessage, creatorId: e.target.value })}
                    className="w-full rounded-lg border-2 border-black bg-white px-3 py-2 text-sm"
                  >
                    <option value="">Select creator...</option>
                    {creators.map(c => (
                      <option key={c.id} value={c.id}>{c.displayName} (@{c.handle})</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="mb-1 block text-xs font-bold text-black">Send As</label>
                  <select
                    value={newMessage.senderType}
                    onChange={e => setNewMessage({ ...newMessage, senderType: e.target.value })}
                    className="w-full rounded-lg border-2 border-black bg-white px-3 py-2 text-sm"
                  >
                    <option value="host">Host</option>
                    <option value="creator">Creator</option>
                  </select>
                </div>
                <div className="flex items-end">
                  <button
                    onClick={sendMessage}
                    disabled={sendingMessage || !newMessage.hostId || !newMessage.creatorId || !newMessage.message}
                    className="w-full rounded-full border-2 border-black bg-[#28D17C] px-4 py-2 text-sm font-bold text-black disabled:opacity-50"
                  >
                    {sendingMessage ? "Sending..." : "Send"}
                  </button>
                </div>
              </div>
              <div className="mt-4">
                <label className="mb-1 block text-xs font-bold text-black">Message</label>
                <textarea
                  value={newMessage.message}
                  onChange={e => setNewMessage({ ...newMessage, message: e.target.value })}
                  placeholder="Type your message..."
                  rows={3}
                  className="w-full rounded-lg border-2 border-black bg-white px-3 py-2 text-sm"
                />
                <p className="mt-1 text-xs text-black/40">Message will be prefixed with [ADMIN]</p>
              </div>
            </div>

            {/* Conversation List */}
            <div className="grid gap-6 lg:grid-cols-2">
              <div className="rounded-xl border-2 border-black bg-white p-4">
                <h3 className="mb-4 text-sm font-bold text-black">All Conversations ({conversations.length})</h3>
                <div className="max-h-[500px] space-y-2 overflow-y-auto">
                  {conversations.map(conv => (
                    <button
                      key={conv.id}
                      onClick={() => fetchConversation(conv.id)}
                      className={`w-full rounded-lg border-2 p-3 text-left transition-colors ${
                        selectedConversation?.id === conv.id ? "border-[#28D17C] bg-[#28D17C]/10" : "border-black/10 hover:border-black"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <p className="font-bold text-black">{conv.hostProfile.displayName}</p>
                        <span className="text-[10px] text-black/40">{formatDate(conv.lastMessageAt)}</span>
                      </div>
                      <p className="text-xs text-black/60">↔ {conv.creatorProfile.displayName} (@{conv.creatorProfile.handle})</p>
                      {conv.messages[0] && (
                        <p className="mt-1 truncate text-xs text-black/40">{conv.messages[0].body}</p>
                      )}
                    </button>
                  ))}
                  {conversations.length === 0 && (
                    <p className="text-sm text-black/60">No conversations yet</p>
                  )}
                </div>
              </div>

              {/* Selected Conversation */}
              <div className="rounded-xl border-2 border-black bg-white p-4">
                <h3 className="mb-4 text-sm font-bold text-black">
                  {selectedConversation 
                    ? `${selectedConversation.hostProfile.displayName} ↔ ${selectedConversation.creatorProfile.displayName}`
                    : "Select a conversation"
                  }
                </h3>
                {selectedConversation ? (
                  <div className="max-h-[500px] space-y-3 overflow-y-auto">
                    {selectedConversation.messages.map(msg => (
                      <div
                        key={msg.id}
                        className={`rounded-lg p-3 ${
                          msg.senderType === "host" ? "bg-[#FFD84A]/20" : "bg-[#4AA3FF]/20"
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-black">
                            {msg.senderType === "host" ? "Host" : "Creator"}
                          </span>
                          <span className="text-[10px] text-black/40">{formatDate(msg.sentAt)}</span>
                        </div>
                        <p className="mt-1 text-sm text-black">{msg.body}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-black/60">Click a conversation to view messages</p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* FINANCIALS TAB */}
        {activeTab === "financials" && (
          <div className="space-y-6">
            {loadingFinancials ? (
              <div className="text-white">Loading financials...</div>
            ) : financials ? (
              <>
                {/* Subscription Stats */}
                <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
                  <StatCard label="Total Paid Hosts" value={financials.subscriptions.totalPaidHosts} color="bg-[#28D17C]" />
                  <StatCard label="Paid Memberships" value={financials.subscriptions.paidMemberships} subValue="@ $199" color="bg-white" />
                  <StatCard label="Free (Promo)" value={financials.subscriptions.freeMemberships} color="bg-[#FFD84A]" />
                  <StatCard label="Membership Revenue" value={`$${financials.subscriptions.membershipRevenue.toLocaleString()}`} color="bg-[#D7B6FF]" />
                </div>

                {/* Deal Stats */}
                <div className="grid grid-cols-2 gap-3 md:grid-cols-5">
                  <StatCard label="Deal Volume" value={formatCurrency(financials.deals.totalDealVolume)} color="bg-[#4AA3FF]" />
                  <StatCard label="Platform Fees" value={formatCurrency(financials.deals.totalPlatformFees)} color="bg-[#28D17C]" />
                  <StatCard label="Active Deals" value={financials.deals.activeDeals} color="bg-white" />
                  <StatCard label="Completed" value={financials.deals.completedDeals} color="bg-white" />
                  <StatCard label="Avg Deal Size" value={formatCurrency(financials.deals.avgDealSize)} color="bg-white" />
                </div>

                {/* Forecasting */}
                <div className="rounded-xl border-2 border-[#FFD84A] bg-[#FFD84A] p-4">
                  <h3 className="mb-4 text-sm font-bold text-black">📈 30-Day Forecast</h3>
                  <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                    <div>
                      <p className="text-xs text-black/60">This Month Signups</p>
                      <p className="text-xl font-black text-black">{financials.forecasting.thisMonthSignups}</p>
                    </div>
                    <div>
                      <p className="text-xs text-black/60">Last Month</p>
                      <p className="text-xl font-black text-black">{financials.forecasting.lastMonthSignups}</p>
                    </div>
                    <div>
                      <p className="text-xs text-black/60">Growth Rate</p>
                      <p className="text-xl font-black text-black">{financials.forecasting.growthRate}%</p>
                    </div>
                    <div>
                      <p className="text-xs text-black/60">Projected Revenue</p>
                      <p className="text-xl font-black text-black">${financials.forecasting.projectedTotalRevenue.toLocaleString()}</p>
                    </div>
                  </div>
                </div>

                {/* Affiliate Links */}
                <div className="rounded-xl border-2 border-black bg-white p-4">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-sm font-bold text-black">Affiliate Links</h3>
                    <div className="flex gap-4 text-xs text-black/60">
                      <span>{financials.affiliateLinks.activeLinks} active</span>
                      <span>{financials.affiliateLinks.totalClicks} total clicks</span>
                      <span>{financials.affiliateLinks.totalUniqueClicks} unique</span>
                    </div>
                  </div>
                  <div className="max-h-[300px] space-y-2 overflow-y-auto">
                    {financials.affiliateLinks.links.map(link => (
                      <div key={link.id} className="flex items-center justify-between rounded-lg border border-black/10 p-2">
                        <div>
                          <p className="font-mono text-xs text-black">{link.token.slice(0, 12)}...</p>
                          {link.campaignName && <p className="text-xs text-black/60">{link.campaignName}</p>}
                        </div>
                        <div className="flex items-center gap-4">
                          <span className="text-sm font-bold text-black">{link.clickCount} clicks</span>
                          <span className={`rounded-full px-2 py-0.5 text-[9px] font-bold ${link.isActive ? "bg-[#28D17C]" : "bg-gray-200"}`}>
                            {link.isActive ? "ACTIVE" : "INACTIVE"}
                          </span>
                        </div>
                      </div>
                    ))}
                    {financials.affiliateLinks.links.length === 0 && (
                      <p className="text-sm text-black/60">No affiliate links yet</p>
                    )}
                  </div>
                </div>

                {/* Recent Subscriptions */}
                <div className="rounded-xl border-2 border-black bg-white p-4">
                  <h3 className="mb-4 text-sm font-bold text-black">Recent Subscriptions</h3>
                  <div className="space-y-2">
                    {financials.subscriptions.recentSubscriptions.slice(0, 10).map((sub: any) => (
                      <div key={sub.id} className="flex items-center justify-between border-b border-black/10 pb-2 last:border-0">
                        <div>
                          <p className="font-bold text-black">{sub.displayName}</p>
                          <p className="text-xs text-black/60">{sub.contactEmail}</p>
                        </div>
                        <div className="text-right">
                          {sub.promoCodeUsed ? (
                            <span className="rounded-full bg-[#FFD84A] px-2 py-0.5 text-[9px] font-bold">{sub.promoCodeUsed}</span>
                          ) : (
                            <span className="text-sm font-bold text-[#28D17C]">$199</span>
                          )}
                          {sub.membershipPaidAt && (
                            <p className="text-xs text-black/40">{formatDate(sub.membershipPaidAt)}</p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            ) : (
              <p className="text-white">Failed to load financials</p>
            )}
          </div>
        )}

        {/* ANNOUNCE TAB */}
        {activeTab === "announce" && (
          <div className="space-y-6">
            <div className="rounded-xl border-2 border-black bg-white p-4">
              <h3 className="mb-4 text-sm font-bold text-black">Send Announcement to Beta Hosts</h3>
              
              {announcementResult && (
                <div className={`mb-4 rounded-lg p-3 ${announcementResult.success ? "bg-[#28D17C]/20" : "bg-red-100"}`}>
                  <p className="text-sm font-bold text-black">{announcementResult.message}</p>
                  {announcementResult.count !== undefined && (
                    <p className="text-xs text-black/60">Sent to {announcementResult.count} hosts</p>
                  )}
                </div>
              )}

              <div className="space-y-4">
                <button
                  onClick={() => handleSendAnnouncement("welcome")}
                  disabled={sendingAnnouncement}
                  className="w-full rounded-lg border-2 border-black bg-[#FFD84A] p-4 text-left transition-colors hover:bg-[#FFD84A]/80 disabled:opacity-50"
                >
                  <p className="font-bold text-black">👋 Welcome Reminder</p>
                  <p className="text-xs text-black/60">Remind hosts to complete their profile setup</p>
                </button>

                <button
                  onClick={() => handleSendAnnouncement("creator-launch")}
                  disabled={sendingAnnouncement}
                  className="w-full rounded-lg border-2 border-black bg-[#28D17C] p-4 text-left transition-colors hover:bg-[#28D17C]/80 disabled:opacity-50"
                >
                  <p className="font-bold text-black">🚀 Creator Launch</p>
                  <p className="text-xs text-black/60">Announce that creators are now on the platform</p>
                </button>

                <button
                  onClick={() => handleSendAnnouncement("feature-update")}
                  disabled={sendingAnnouncement}
                  className="w-full rounded-lg border-2 border-black bg-[#4AA3FF] p-4 text-left transition-colors hover:bg-[#4AA3FF]/80 disabled:opacity-50"
                >
                  <p className="font-bold text-black">✨ Feature Update</p>
                  <p className="text-xs text-black/60">Notify hosts about new platform features</p>
                </button>
              </div>
            </div>

            <div className="rounded-xl border-2 border-dashed border-white/30 bg-white/5 p-4">
              <h3 className="mb-2 text-sm font-bold text-white">Custom Announcement</h3>
              <p className="text-xs text-white/60">
                Send a custom message to all beta hosts.
              </p>
              <p className="mt-4 text-xs text-white/40">
                Coming soon - for now, use the preset announcements above.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
