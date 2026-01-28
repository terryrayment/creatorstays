"use client"

import { useState, useEffect } from "react"

interface SocialPlatform {
  connected: boolean
  handle: string | null
  followers: number | null
  verified: boolean
  lastSyncAt: string | null
  tokenExpired?: boolean
  canRefresh?: boolean
  nextRefreshAt?: string | null
}

interface SocialStatus {
  instagram: SocialPlatform
  tiktok: SocialPlatform
  youtube: SocialPlatform
}

interface Props {
  onConnectionChange?: () => void
}

export function SocialConnections({ onConnectionChange }: Props) {
  const [status, setStatus] = useState<SocialStatus | null>(null)
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  // Fetch social status on mount
  useEffect(() => {
    fetchStatus()
  }, [])

  const fetchStatus = async () => {
    try {
      const res = await fetch('/api/creator/social')
      if (res.ok) {
        const data = await res.json()
        setStatus(data)
      }
    } catch (e) {
      console.error('Failed to fetch social status:', e)
    } finally {
      setLoading(false)
    }
  }

  const handleConnect = (platform: 'instagram' | 'tiktok') => {
    window.location.href = `/api/oauth/${platform}/start`
  }

  const handleDisconnect = async (platform: 'instagram' | 'tiktok') => {
    if (!confirm(`Disconnect ${platform === 'instagram' ? 'Instagram' : 'TikTok'}? You can reconnect anytime.`)) {
      return
    }

    try {
      const res = await fetch('/api/creator/social/disconnect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ platform }),
      })

      if (res.ok) {
        await fetchStatus()
        onConnectionChange?.()
      } else {
        const data = await res.json()
        setError(data.error || 'Failed to disconnect')
      }
    } catch (e) {
      setError('Network error')
    }
  }

  const handleRefresh = async (platform: 'instagram' | 'tiktok') => {
    setRefreshing(platform)
    setError(null)

    try {
      const res = await fetch('/api/creator/social/refresh', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ platform }),
      })

      const data = await res.json()

      if (res.ok) {
        await fetchStatus()
      } else if (data.tokenExpired) {
        setError(`${platform === 'instagram' ? 'Instagram' : 'TikTok'} connection expired. Please reconnect.`)
        await fetchStatus()
      } else if (data.rateLimited) {
        setError(`Please wait ${data.retryAfter} minute(s) before refreshing again.`)
      } else {
        setError(data.error || 'Failed to refresh')
      }
    } catch (e) {
      setError('Network error')
    } finally {
      setRefreshing(null)
    }
  }

  const formatFollowers = (count: number | null): string => {
    if (count === null) return '-'
    if (count >= 1000000) return `${(count / 1000000).toFixed(1)}M`
    if (count >= 1000) return `${(count / 1000).toFixed(1)}K`
    return count.toLocaleString()
  }

  const formatLastSync = (dateStr: string | null): string => {
    if (!dateStr) return 'Never'
    const date = new Date(dateStr)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)
    const diffDays = Math.floor(diffMs / 86400000)

    if (diffMins < 1) return 'Just now'
    if (diffMins < 60) return `${diffMins}m ago`
    if (diffHours < 24) return `${diffHours}h ago`
    if (diffDays < 7) return `${diffDays}d ago`
    return date.toLocaleDateString()
  }

  if (loading) {
    return (
      <div className="rounded-xl border-[3px] border-black bg-white p-6">
        <div className="flex items-center justify-center py-8">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-black border-t-transparent" />
        </div>
      </div>
    )
  }

  return (
    <div className="rounded-xl border-[3px] border-black bg-white overflow-hidden">
      <div className="border-b-[3px] border-black bg-black/5 px-5 py-3">
        <h3 className="text-sm font-black uppercase tracking-wider text-black">Connected Platforms</h3>
        <p className="mt-0.5 text-xs text-black/60">Link your accounts for verified follower counts</p>
      </div>

      {error && (
        <div className="mx-5 mt-4 rounded-lg border-2 border-red-300 bg-red-50 px-4 py-2 text-xs text-red-700">
          {error}
          <button onClick={() => setError(null)} className="ml-2 font-bold hover:underline">Dismiss</button>
        </div>
      )}

      <div className="divide-y-[2px] divide-black/10">
        {/* Instagram */}
        <div className="p-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-tr from-yellow-400 via-pink-500 to-purple-600">
                <svg className="h-5 w-5 text-white" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                </svg>
              </div>
              <div>
                <p className="text-sm font-bold text-black">Instagram</p>
                {status?.instagram.connected ? (
                  <p className="text-xs text-black/60">@{status.instagram.handle}</p>
                ) : (
                  <p className="text-xs text-black/40">Not connected</p>
                )}
              </div>
            </div>

            {status?.instagram.connected ? (
              <div className="flex items-center gap-2">
                <div className="text-right">
                  <div className="flex items-center gap-1">
                    <span className="text-lg font-black text-black">
                      {formatFollowers(status.instagram.followers)}
                    </span>
                    {status.instagram.verified && (
                      <span className="rounded-full bg-[#28D17C] px-1.5 py-0.5 text-[9px] font-bold text-black">
                        Verified
                      </span>
                    )}
                  </div>
                  <p className="text-[10px] text-black/40">
                    Updated {formatLastSync(status.instagram.lastSyncAt)}
                  </p>
                </div>
                <div className="flex gap-1">
                  <button
                    onClick={() => handleRefresh('instagram')}
                    disabled={refreshing === 'instagram' || !status.instagram.canRefresh}
                    className="rounded-lg border-2 border-black/20 p-1.5 text-black/60 hover:border-black hover:text-black disabled:opacity-40"
                    title={status.instagram.canRefresh ? 'Refresh' : 'Wait 10 minutes'}
                  >
                    <svg className={`h-4 w-4 ${refreshing === 'instagram' ? 'animate-spin' : ''}`} fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
                    </svg>
                  </button>
                  <button
                    onClick={() => handleDisconnect('instagram')}
                    className="rounded-lg border-2 border-black/20 p-1.5 text-black/60 hover:border-red-500 hover:text-red-500"
                    title="Disconnect"
                  >
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>
            ) : (
              <button
                onClick={() => handleConnect('instagram')}
                className="rounded-full border-2 border-black bg-black px-4 py-1.5 text-xs font-bold text-white transition-transform hover:-translate-y-0.5"
              >
                Connect
              </button>
            )}
          </div>
          {status?.instagram.tokenExpired && (
            <p className="mt-2 text-xs text-red-600">Connection expired. Please reconnect.</p>
          )}
        </div>

        {/* TikTok */}
        <div className="p-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-black">
                <svg className="h-5 w-5 text-white" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-5.2 1.74 2.89 2.89 0 012.31-4.64 2.93 2.93 0 01.88.13V9.4a6.84 6.84 0 00-1-.05A6.33 6.33 0 005 20.1a6.34 6.34 0 0010.86-4.43v-7a8.16 8.16 0 004.77 1.52v-3.4a4.85 4.85 0 01-1-.1z"/>
                </svg>
              </div>
              <div>
                <p className="text-sm font-bold text-black">TikTok</p>
                {status?.tiktok.connected ? (
                  <p className="text-xs text-black/60">@{status.tiktok.handle}</p>
                ) : (
                  <p className="text-xs text-black/40">Not connected</p>
                )}
              </div>
            </div>

            {status?.tiktok.connected ? (
              <div className="flex items-center gap-2">
                <div className="text-right">
                  <div className="flex items-center gap-1">
                    <span className="text-lg font-black text-black">
                      {formatFollowers(status.tiktok.followers)}
                    </span>
                    {status.tiktok.verified && (
                      <span className="rounded-full bg-[#28D17C] px-1.5 py-0.5 text-[9px] font-bold text-black">
                        Verified
                      </span>
                    )}
                  </div>
                  <p className="text-[10px] text-black/40">
                    Updated {formatLastSync(status.tiktok.lastSyncAt)}
                  </p>
                </div>
                <div className="flex gap-1">
                  <button
                    onClick={() => handleRefresh('tiktok')}
                    disabled={refreshing === 'tiktok' || !status.tiktok.canRefresh}
                    className="rounded-lg border-2 border-black/20 p-1.5 text-black/60 hover:border-black hover:text-black disabled:opacity-40"
                    title={status.tiktok.canRefresh ? 'Refresh' : 'Wait 10 minutes'}
                  >
                    <svg className={`h-4 w-4 ${refreshing === 'tiktok' ? 'animate-spin' : ''}`} fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
                    </svg>
                  </button>
                  <button
                    onClick={() => handleDisconnect('tiktok')}
                    className="rounded-lg border-2 border-black/20 p-1.5 text-black/60 hover:border-red-500 hover:text-red-500"
                    title="Disconnect"
                  >
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>
            ) : (
              <button
                onClick={() => handleConnect('tiktok')}
                className="rounded-full border-2 border-black bg-black px-4 py-1.5 text-xs font-bold text-white transition-transform hover:-translate-y-0.5"
              >
                Connect
              </button>
            )}
          </div>
          {status?.tiktok.tokenExpired && (
            <p className="mt-2 text-xs text-red-600">Connection expired. Please reconnect.</p>
          )}
        </div>

        {/* YouTube - Placeholder */}
        <div className="p-5 opacity-60">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-600">
                <svg className="h-5 w-5 text-white" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                </svg>
              </div>
              <div>
                <p className="text-sm font-bold text-black">YouTube</p>
                <p className="text-xs text-black/40">Coming soon</p>
              </div>
            </div>
            <span className="rounded-full border-2 border-black/20 bg-black/5 px-3 py-1.5 text-xs font-bold text-black/40">
              Coming Soon
            </span>
          </div>
        </div>
      </div>

      <div className="border-t-[3px] border-black bg-black/5 px-5 py-3">
        <p className="text-[10px] text-black/50">
          Verified follower counts update automatically every 24 hours. Manual refresh available every 10 minutes.
        </p>
      </div>
    </div>
  )
}
