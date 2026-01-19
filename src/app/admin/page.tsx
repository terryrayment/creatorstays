"use client"

import { useState, useEffect } from "react"
import { Container } from "@/components/layout/container"

// Mock stats - in production, these would come from database
const mockStats = {
  waitlist: {
    creators: 47,
    hosts: 23,
    total: 70,
  },
  signups: {
    creators: 12,
    hosts: 8,
    total: 20,
  },
  connections: {
    instagram: 6,
    tiktok: 3,
    youtube: 2,
  },
  collaborations: {
    pending: 5,
    approved: 3,
    completed: 1,
  },
  financials: {
    // Gross Merchandise Value (total deal values)
    gmv: {
      total: 4250,
      thisMonth: 1850,
      lastMonth: 2400,
    },
    // Platform revenue (15% from host + 15% from creator = 30% of deal)
    revenue: {
      total: 1275,
      thisMonth: 555,
      lastMonth: 720,
    },
    // Payouts to creators (85% of deal value)
    creatorPayouts: {
      total: 3612.50,
      pending: 850,
      completed: 2762.50,
    },
    // Host charges (deal + 15% fee)
    hostCharges: {
      total: 4887.50,
      pending: 977.50,
      collected: 3910,
    },
    // Average deal metrics
    averages: {
      dealSize: 425,
      platformFee: 127.50,
      creatorPayout: 361.25,
    },
    // Recent transactions
    transactions: [
      { type: "payout", creator: "Amy C.", amount: 425, status: "completed", date: "Jan 15" },
      { type: "charge", host: "Mountain Retreats", amount: 575, status: "completed", date: "Jan 14" },
      { type: "payout", creator: "Marcus W.", amount: 340, status: "pending", date: "Jan 13" },
      { type: "charge", host: "Coastal Getaways", amount: 460, status: "completed", date: "Jan 12" },
      { type: "payout", creator: "Sarah P.", amount: 510, status: "completed", date: "Jan 10" },
    ],
  },
  recentActivity: [
    { type: "waitlist", who: "creator", email: "amy@***", at: "2 min ago" },
    { type: "signup", who: "host", email: "john@***", at: "15 min ago" },
    { type: "connection", who: "creator", platform: "Instagram", at: "1 hr ago" },
    { type: "waitlist", who: "host", email: "sarah@***", at: "2 hrs ago" },
    { type: "collaboration", action: "approved", at: "3 hrs ago" },
    { type: "signup", who: "creator", email: "mike@***", at: "5 hrs ago" },
    { type: "waitlist", who: "creator", email: "lisa@***", at: "6 hrs ago" },
    { type: "connection", who: "creator", platform: "TikTok", at: "8 hrs ago" },
  ],
}

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount)
}

function StatCard({ label, value, sub }: { label: string; value: number | string; sub?: string }) {
  return (
    <div className="rounded-xl border border-foreground/5 bg-white/70 p-4 backdrop-blur-sm">
      <p className="text-xs font-medium text-muted-foreground">{label}</p>
      <p className="mt-1 text-2xl font-semibold">{value}</p>
      {sub && <p className="mt-0.5 text-[10px] text-muted-foreground">{sub}</p>}
    </div>
  )
}

function MoneyCard({ label, value, sub, trend }: { label: string; value: number; sub?: string; trend?: "up" | "down" | "neutral" }) {
  return (
    <div className="rounded-xl border border-foreground/5 bg-white/70 p-4 backdrop-blur-sm">
      <p className="text-xs font-medium text-muted-foreground">{label}</p>
      <p className="mt-1 text-2xl font-semibold text-emerald-600">{formatCurrency(value)}</p>
      {sub && (
        <p className={`mt-0.5 text-[10px] ${trend === 'up' ? 'text-emerald-600' : trend === 'down' ? 'text-red-500' : 'text-muted-foreground'}`}>
          {trend === 'up' && '↑ '}{trend === 'down' && '↓ '}{sub}
        </p>
      )}
    </div>
  )
}

function ActivityRow({ item }: { item: typeof mockStats.recentActivity[0] }) {
  const getIcon = () => {
    switch (item.type) {
      case "waitlist": return "📝"
      case "signup": return "✅"
      case "connection": return "🔗"
      case "collaboration": return "🤝"
      default: return "•"
    }
  }
  
  const getDescription = () => {
    switch (item.type) {
      case "waitlist": return `${item.who} joined waitlist (${item.email})`
      case "signup": return `${item.who} signed up (${item.email})`
      case "connection": return `Creator connected ${item.platform}`
      case "collaboration": return `Collaboration ${item.action}`
      default: return "Activity"
    }
  }
  
  return (
    <div className="flex items-center gap-3 py-2">
      <span className="text-sm">{getIcon()}</span>
      <span className="flex-1 text-sm">{getDescription()}</span>
      <span className="text-xs text-muted-foreground">{item.at}</span>
    </div>
  )
}

function AdminDashboard() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Admin Dashboard</h1>
          <p className="text-sm text-muted-foreground">CreatorStays internal metrics</p>
        </div>
        <div className="text-xs text-muted-foreground">
          Last updated: {new Date().toLocaleTimeString()}
        </div>
      </div>

      {/* Waitlist */}
      <div>
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-muted-foreground">Waitlist</h2>
        <div className="grid gap-3 sm:grid-cols-3">
          <StatCard label="Creators" value={mockStats.waitlist.creators} />
          <StatCard label="Hosts" value={mockStats.waitlist.hosts} />
          <StatCard label="Total" value={mockStats.waitlist.total} />
        </div>
      </div>

      {/* Signups */}
      <div>
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-muted-foreground">Signups</h2>
        <div className="grid gap-3 sm:grid-cols-3">
          <StatCard label="Creators" value={mockStats.signups.creators} sub="25% conversion" />
          <StatCard label="Hosts" value={mockStats.signups.hosts} sub="35% conversion" />
          <StatCard label="Total" value={mockStats.signups.total} />
        </div>
      </div>

      {/* Platform Connections */}
      <div>
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-muted-foreground">Platform Connections</h2>
        <div className="grid gap-3 sm:grid-cols-3">
          <StatCard label="Instagram" value={mockStats.connections.instagram} />
          <StatCard label="TikTok" value={mockStats.connections.tiktok} />
          <StatCard label="YouTube" value={mockStats.connections.youtube} />
        </div>
      </div>

      {/* Collaborations */}
      <div>
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-muted-foreground">Collaborations</h2>
        <div className="grid gap-3 sm:grid-cols-3">
          <StatCard label="Pending" value={mockStats.collaborations.pending} />
          <StatCard label="Approved" value={mockStats.collaborations.approved} />
          <StatCard label="Completed" value={mockStats.collaborations.completed} />
        </div>
      </div>

      {/* Financials Section */}
      <div className="rounded-2xl border border-emerald-200 bg-emerald-50/30 p-5">
        <h2 className="mb-4 flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-emerald-700">
          <span>💰</span> Financials
        </h2>
        
        {/* Key Metrics */}
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <MoneyCard 
            label="GMV (Total Deal Value)" 
            value={mockStats.financials.gmv.total} 
            sub={`${formatCurrency(mockStats.financials.gmv.thisMonth)} this month`}
          />
          <MoneyCard 
            label="Platform Revenue (30%)" 
            value={mockStats.financials.revenue.total} 
            sub={`${formatCurrency(mockStats.financials.revenue.thisMonth)} this month`}
            trend="up"
          />
          <MoneyCard 
            label="Creator Payouts (85%)" 
            value={mockStats.financials.creatorPayouts.total} 
            sub={`${formatCurrency(mockStats.financials.creatorPayouts.pending)} pending`}
          />
          <MoneyCard 
            label="Host Charges (115%)" 
            value={mockStats.financials.hostCharges.total} 
            sub={`${formatCurrency(mockStats.financials.hostCharges.collected)} collected`}
          />
        </div>

        {/* Averages */}
        <div className="mt-4 grid gap-3 sm:grid-cols-3">
          <div className="rounded-lg bg-white/60 p-3">
            <p className="text-[10px] font-medium text-muted-foreground">Avg Deal Size</p>
            <p className="text-lg font-semibold">{formatCurrency(mockStats.financials.averages.dealSize)}</p>
          </div>
          <div className="rounded-lg bg-white/60 p-3">
            <p className="text-[10px] font-medium text-muted-foreground">Avg Platform Fee</p>
            <p className="text-lg font-semibold">{formatCurrency(mockStats.financials.averages.platformFee)}</p>
          </div>
          <div className="rounded-lg bg-white/60 p-3">
            <p className="text-[10px] font-medium text-muted-foreground">Avg Creator Payout</p>
            <p className="text-lg font-semibold">{formatCurrency(mockStats.financials.averages.creatorPayout)}</p>
          </div>
        </div>

        {/* Recent Transactions */}
        <div className="mt-4">
          <p className="mb-2 text-xs font-medium text-muted-foreground">Recent Transactions</p>
          <div className="rounded-lg bg-white/60 p-3">
            <div className="divide-y divide-foreground/5">
              {mockStats.financials.transactions.map((tx, i) => (
                <div key={i} className="flex items-center justify-between py-2 text-sm">
                  <div className="flex items-center gap-2">
                    <span className={tx.type === 'payout' ? 'text-amber-500' : 'text-emerald-500'}>
                      {tx.type === 'payout' ? '↑' : '↓'}
                    </span>
                    <span>
                      {tx.type === 'payout' ? `Payout to ${tx.creator}` : `Charge from ${tx.host}`}
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${
                      tx.status === 'completed' 
                        ? 'bg-emerald-100 text-emerald-700' 
                        : 'bg-amber-100 text-amber-700'
                    }`}>
                      {tx.status}
                    </span>
                    <span className="font-medium">{formatCurrency(tx.amount)}</span>
                    <span className="text-xs text-muted-foreground">{tx.date}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Fee Breakdown Note */}
        <div className="mt-4 rounded-lg border border-dashed border-emerald-300 bg-white/40 p-3 text-xs text-muted-foreground">
          <p className="font-medium text-emerald-700">Fee Structure Reminder:</p>
          <p className="mt-1">Host pays: Deal + 15% fee → Creator receives: Deal - 15% fee → Platform keeps: 30% total</p>
        </div>
      </div>

      {/* Recent Activity */}
      <div>
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-muted-foreground">Recent Activity</h2>
        <div className="rounded-xl border border-foreground/5 bg-white/70 p-4 backdrop-blur-sm">
          <div className="divide-y divide-foreground/5">
            {mockStats.recentActivity.map((item, i) => (
              <ActivityRow key={i} item={item} />
            ))}
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="pt-4 text-center text-xs text-muted-foreground">
        <p>Data shown is mock data. Connect to database for real metrics.</p>
      </div>
    </div>
  )
}

function LoginForm({ onLogin }: { onLogin: (password: string) => void }) {
  const [password, setPassword] = useState("")
  const [error, setError] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(false)

    const res = await fetch("/api/admin/auth", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password }),
    })

    if (res.ok) {
      onLogin(password)
    } else {
      setError(true)
    }
    setLoading(false)
  }

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="w-full max-w-sm rounded-2xl border border-foreground/5 bg-white/80 p-8 shadow-xl backdrop-blur-sm">
        <div className="text-center">
          <h1 className="text-xl font-semibold">Admin Access</h1>
          <p className="mt-1 text-sm text-muted-foreground">Enter password to continue</p>
        </div>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            className="w-full rounded-lg border border-foreground/10 bg-white px-4 py-2.5 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
            autoFocus
          />
          
          {error && (
            <p className="text-center text-sm text-red-600">Invalid password</p>
          )}

          <button
            type="submit"
            disabled={loading || !password}
            className="w-full rounded-lg bg-foreground py-2.5 text-sm font-medium text-background transition-colors hover:bg-foreground/90 disabled:opacity-50"
          >
            {loading ? "Checking..." : "Enter"}
          </button>
        </form>

        <p className="mt-6 text-center text-[10px] text-muted-foreground">
          This area is restricted to CreatorStays team only.
        </p>
      </div>
    </div>
  )
}

export default function AdminPage() {
  const [authenticated, setAuthenticated] = useState(false)
  const [checking, setChecking] = useState(true)

  useEffect(() => {
    // Check if already authenticated via cookie
    fetch("/api/admin/auth")
      .then((res) => {
        if (res.ok) setAuthenticated(true)
      })
      .finally(() => setChecking(false))
  }, [])

  if (checking) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-foreground border-t-transparent" />
      </div>
    )
  }

  if (!authenticated) {
    return <LoginForm onLogin={() => setAuthenticated(true)} />
  }

  return (
    <div className="min-h-screen bg-[hsl(210,20%,98%)]">
      <div className="border-b border-foreground/5 bg-white/50 backdrop-blur-sm">
        <Container className="flex h-12 items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="rounded bg-red-500/10 px-1.5 py-0.5 text-[10px] font-semibold text-red-600">ADMIN</span>
            <span className="text-sm font-medium">CreatorStays</span>
          </div>
          <button
            onClick={() => {
              fetch("/api/admin/auth", { method: "DELETE" }).then(() => setAuthenticated(false))
            }}
            className="text-xs text-muted-foreground hover:text-foreground"
          >
            Logout
          </button>
        </Container>
      </div>
      <Container className="py-8">
        <AdminDashboard />
      </Container>
    </div>
  )
}
