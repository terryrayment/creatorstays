"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import Image from "next/image"
import Link from "next/link"

interface Property {
  id: string
  title: string
  cityRegion: string
  heroImageUrl: string
  photos: string[]
}

interface Collaboration {
  id: string
  status: string
  createdAt: string
  completedAt: string | null
  clicksGenerated: number
  creator: {
    displayName: string
    handle: string
    avatarUrl: string
    instagramFollowers: number
  }
  offer: {
    cashCents: number
    stayLengthNights: number
  }
  contentUrls: string[]
  contentSubmittedAt: string | null
}

interface OwnerData {
  owner: {
    id: string
    name: string
    email: string
  }
  property: Property
  collaborations: Collaboration[]
  stats: {
    totalCollaborations: number
    completedCollaborations: number
    totalClicks: number
    totalSpent: number
  }
  agency: {
    displayName: string
  }
}

export default function OwnerPortalPage() {
  const params = useParams()
  const token = params.token as string
  
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [data, setData] = useState<OwnerData | null>(null)

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await fetch(`/api/owner/${token}`)
        if (!res.ok) {
          const err = await res.json()
          throw new Error(err.error || "Failed to load")
        }
        const result = await res.json()
        setData(result)
      } catch (e) {
        setError(e instanceof Error ? e.message : "Failed to load property data")
      }
      setLoading(false)
    }
    
    if (token) {
      fetchData()
    }
  }, [token])

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#FAFAFA]">
        <div className="text-center">
          <div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-2 border-black border-t-transparent" />
          <p className="text-sm font-medium text-black/60">Loading your property...</p>
        </div>
      </div>
    )
  }

  if (error || !data) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#FAFAFA]">
        <div className="mx-auto max-w-md text-center">
          <div className="rounded-2xl border-[3px] border-black bg-white p-8">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full border-2 border-red-500 bg-red-50">
              <svg className="h-8 w-8 text-red-500" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
              </svg>
            </div>
            <h1 className="font-heading text-xl font-bold text-black">Access Denied</h1>
            <p className="mt-2 text-sm text-black/60">{error || "This link is invalid or has expired."}</p>
            <Link 
              href="/"
              className="mt-6 inline-block rounded-full border-2 border-black bg-black px-6 py-2 text-sm font-bold text-white"
            >
              Go to Homepage
            </Link>
          </div>
        </div>
      </div>
    )
  }

  const { owner, property, collaborations, stats, agency } = data

  return (
    <div className="min-h-screen bg-[#FAFAFA]">
      {/* Header */}
      <header className="border-b-[3px] border-black bg-white">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-4">
          <div>
            <p className="text-[10px] font-black uppercase tracking-wider text-black/60">Owner Portal</p>
            <p className="font-heading text-lg font-bold text-black">{property.title}</p>
          </div>
          <div className="text-right">
            <p className="text-xs text-black/60">Managed by</p>
            <p className="text-sm font-bold text-black">{agency.displayName}</p>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 py-8">
        {/* Welcome Banner */}
        <div className="mb-8 rounded-2xl border-[3px] border-black bg-[#FFD84A] p-6">
          <p className="text-[10px] font-black uppercase tracking-wider text-black/60">Welcome back</p>
          <h1 className="mt-1 font-heading text-2xl font-bold text-black">Hi {owner.name}!</h1>
          <p className="mt-2 text-sm text-black/80">
            Here's an overview of creator campaigns for your property.
          </p>
        </div>

        {/* Stats Grid */}
        <div className="mb-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
          <div className="rounded-xl border-[3px] border-black bg-white p-4">
            <p className="text-[10px] font-black uppercase tracking-wider text-black/60">Campaigns</p>
            <p className="mt-1 font-heading text-3xl font-black text-black">{stats.totalCollaborations}</p>
          </div>
          <div className="rounded-xl border-[3px] border-black bg-white p-4">
            <p className="text-[10px] font-black uppercase tracking-wider text-black/60">Completed</p>
            <p className="mt-1 font-heading text-3xl font-black text-[#28D17C]">{stats.completedCollaborations}</p>
          </div>
          <div className="rounded-xl border-[3px] border-black bg-white p-4">
            <p className="text-[10px] font-black uppercase tracking-wider text-black/60">Total Clicks</p>
            <p className="mt-1 font-heading text-3xl font-black text-black">{stats.totalClicks.toLocaleString()}</p>
          </div>
          <div className="rounded-xl border-[3px] border-black bg-white p-4">
            <p className="text-[10px] font-black uppercase tracking-wider text-black/60">Invested</p>
            <p className="mt-1 font-heading text-3xl font-black text-black">${(stats.totalSpent / 100).toLocaleString()}</p>
          </div>
        </div>

        {/* Property Card */}
        <div className="mb-8 overflow-hidden rounded-2xl border-[3px] border-black bg-white">
          {property.heroImageUrl && (
            <div className="relative h-48 w-full">
              <Image
                src={property.heroImageUrl}
                alt={property.title || "Property"}
                fill
                className="object-cover"
              />
            </div>
          )}
          <div className="p-4">
            <h2 className="font-heading text-xl font-bold text-black">{property.title}</h2>
            <p className="text-sm text-black/60">{property.cityRegion}</p>
          </div>
        </div>

        {/* Collaborations */}
        <div>
          <h2 className="mb-4 font-heading text-lg font-bold text-black">Creator Campaigns</h2>
          
          {collaborations.length === 0 ? (
            <div className="rounded-2xl border-[3px] border-black/20 bg-white p-8 text-center">
              <p className="text-sm text-black/60">No creator campaigns yet.</p>
              <p className="mt-1 text-xs text-black/40">Your property manager will set these up for you.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {collaborations.map((collab) => (
                <div 
                  key={collab.id}
                  className="rounded-2xl border-[3px] border-black bg-white p-4"
                >
                  <div className="flex items-start gap-4">
                    {/* Creator Avatar */}
                    <div className="relative h-12 w-12 flex-shrink-0 overflow-hidden rounded-full border-2 border-black bg-gray-100">
                      {collab.creator.avatarUrl ? (
                        <Image
                          src={collab.creator.avatarUrl}
                          alt={collab.creator.displayName}
                          fill
                          className="object-cover"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center text-lg font-bold text-black/40">
                          {collab.creator.displayName[0]}
                        </div>
                      )}
                    </div>
                    
                    {/* Details */}
                    <div className="flex-1">
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="font-bold text-black">{collab.creator.displayName}</p>
                          <p className="text-sm text-black/60">@{collab.creator.handle}</p>
                        </div>
                        <StatusBadge status={collab.status} />
                      </div>
                      
                      <div className="mt-3 flex flex-wrap gap-4 text-xs text-black/60">
                        <span>{collab.creator.instagramFollowers?.toLocaleString() || 0} followers</span>
                        <span>{collab.offer.stayLengthNights} night stay</span>
                        {collab.offer.cashCents > 0 && (
                          <span>${(collab.offer.cashCents / 100).toLocaleString()} fee</span>
                        )}
                        <span>{collab.clicksGenerated.toLocaleString()} clicks</span>
                      </div>

                      {/* Content Links */}
                      {collab.contentUrls && collab.contentUrls.length > 0 && (
                        <div className="mt-3">
                          <p className="mb-1 text-[10px] font-bold uppercase tracking-wider text-black/60">Content</p>
                          <div className="flex flex-wrap gap-2">
                            {collab.contentUrls.map((url, i) => (
                              <a
                                key={i}
                                href={url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1 rounded-full border border-black/20 bg-black/5 px-3 py-1 text-xs font-medium text-black hover:bg-black/10"
                              >
                                View Post {i + 1}
                                <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
                                </svg>
                              </a>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer Note */}
        <div className="mt-12 text-center">
          <p className="text-xs text-black/40">
            This is a read-only view. Contact {agency.displayName} to make changes.
          </p>
        </div>
      </main>
    </div>
  )
}

function StatusBadge({ status }: { status: string }) {
  const config: Record<string, { bg: string; text: string; label: string }> = {
    pending: { bg: "bg-[#FFD84A]", text: "text-black", label: "Pending" },
    active: { bg: "bg-[#4AA3FF]", text: "text-black", label: "Active" },
    "content-submitted": { bg: "bg-[#FF7A00]", text: "text-black", label: "Content Submitted" },
    approved: { bg: "bg-[#28D17C]", text: "text-black", label: "Approved" },
    completed: { bg: "bg-[#28D17C]", text: "text-black", label: "Completed" },
    cancelled: { bg: "bg-gray-300", text: "text-black", label: "Cancelled" },
  }
  
  const { bg, text, label } = config[status] || { bg: "bg-gray-300", text: "text-black", label: status }
  
  return (
    <span className={`rounded-full border-2 border-black px-2 py-1 text-[10px] font-bold uppercase ${bg} ${text}`}>
      {label}
    </span>
  )
}
