"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

interface TeamMember {
  id: string
  email: string
  name: string
  role: "admin" | "editor" | "viewer"
  status: "active" | "pending"
  invitedAt: string
}

export default function TeamManagementPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [isAgency, setIsAgency] = useState(false)
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([])
  const [showInviteModal, setShowInviteModal] = useState(false)
  const [inviteEmail, setInviteEmail] = useState("")
  const [inviteRole, setInviteRole] = useState<"admin" | "editor" | "viewer">("editor")
  const [inviting, setInviting] = useState(false)
  const [toast, setToast] = useState<string | null>(null)

  useEffect(() => {
    async function checkAccess() {
      if (status !== "authenticated") return
      
      try {
        // Check localStorage first (for testing)
        const isAgencyFromStorage = localStorage.getItem('creatorstays_agency') === 'true'
        
        const res = await fetch("/api/host/profile")
        if (res.ok) {
          const profile = await res.json()
          const hasAgencyAccess = profile.isAgency || isAgencyFromStorage
          
          if (!hasAgencyAccess) {
            // Not an agency, redirect to upgrade
            router.push("/dashboard/host/upgrade")
            return
          }
          setIsAgency(true)
          
          // Fetch actual team members from API
          const teamRes = await fetch("/api/host/agency/team")
          if (teamRes.ok) {
            const teamData = await teamRes.json()
            
            // Map API response to our TeamMember interface
            const members: TeamMember[] = []
            
            // Always add the current user as admin first
            members.push({
              id: "owner",
              email: session?.user?.email || profile.email || "owner@example.com",
              name: session?.user?.name || profile.name || "Account Owner",
              role: "admin",
              status: "active",
              invitedAt: profile.createdAt || new Date().toISOString(),
            })
            
            // Add team members from API
            if (teamData.teamMembers && Array.isArray(teamData.teamMembers)) {
              teamData.teamMembers.forEach((m: any) => {
                members.push({
                  id: m.id,
                  email: m.user?.email || m.userId?.replace('pending_', '') || 'Unknown',
                  name: m.user?.name || m.userId?.replace('pending_', '').split('@')[0] || 'Invited User',
                  role: m.role === 'member' ? 'editor' : m.role,
                  status: m.inviteStatus === 'accepted' ? 'active' : 'pending',
                  invitedAt: m.createdAt,
                })
              })
            }
            
            setTeamMembers(members)
          } else {
            // API failed, show just the owner
            setTeamMembers([
              {
                id: "owner",
                email: session?.user?.email || "owner@example.com",
                name: session?.user?.name || "Account Owner",
                role: "admin",
                status: "active",
                invitedAt: new Date().toISOString(),
              }
            ])
          }
        }
      } catch (e) {
        console.error("Failed to check access:", e)
      }
      setLoading(false)
    }
    
    checkAccess()
  }, [status, router, session])

  const handleInvite = async () => {
    if (!inviteEmail) return
    
    setInviting(true)
    
    try {
      const res = await fetch('/api/host/agency/team', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: inviteEmail,
          role: inviteRole,
          permissions: {
            canManageProperties: inviteRole === 'editor',
            canSendOffers: inviteRole === 'editor',
            canViewAnalytics: true,
            canManageTeam: false,
          },
        }),
      })
      
      const data = await res.json()
      
      if (!res.ok) {
        setToast(data.error || 'Failed to send invite')
        setTimeout(() => setToast(null), 3000)
        setInviting(false)
        return
      }
      
      // Add to local state for immediate UI update
      const newMember: TeamMember = {
        id: data.teamMember?.id || Date.now().toString(),
        email: inviteEmail,
        name: inviteEmail.split("@")[0],
        role: inviteRole,
        status: "pending",
        invitedAt: new Date().toISOString(),
      }
      
      setTeamMembers(prev => [...prev, newMember])
      setShowInviteModal(false)
      setInviteEmail("")
      setInviteRole("editor")
      setToast(data.emailSent ? "Invitation sent!" : "Invite created (email will be sent)")
      setTimeout(() => setToast(null), 3000)
    } catch (error) {
      console.error('Failed to invite team member:', error)
      setToast('Failed to send invite')
      setTimeout(() => setToast(null), 3000)
    }
    
    setInviting(false)
  }

  const removeTeamMember = async (id: string) => {
    try {
      const res = await fetch(`/api/host/agency/team?memberId=${id}`, {
        method: 'DELETE',
      })
      
      if (res.ok) {
        setTeamMembers(prev => prev.filter(m => m.id !== id))
        setToast("Team member removed")
      } else {
        const data = await res.json()
        setToast(data.error || "Failed to remove team member")
      }
    } catch (error) {
      console.error('Failed to remove team member:', error)
      // Still remove from UI for now
      setTeamMembers(prev => prev.filter(m => m.id !== id))
      setToast("Team member removed")
    }
    setTimeout(() => setToast(null), 3000)
  }

  if (status === "loading" || loading) {
    return (
      <div className="min-h-screen bg-[#FAFAFA] flex items-center justify-center">
        <p className="text-sm text-black/60">Loading...</p>
      </div>
    )
  }

  const maxMembers = 5
  const canInviteMore = teamMembers.length < maxMembers

  return (
    <div className="min-h-screen bg-[#FAFAFA]">
      {/* Header */}
      <div className="border-b-2 border-black bg-white">
        <div className="mx-auto flex h-12 max-w-4xl items-center justify-between px-4 sm:px-6">
          <div className="flex items-center gap-3">
            <span className="rounded-full border-2 border-black bg-[#28D17C] px-2.5 py-0.5 text-[10px] font-bold text-black">AGENCY</span>
            <span className="text-sm font-bold text-black">Team Management</span>
          </div>
          <Link href="/dashboard/host" className="text-sm font-bold text-black hover:underline">← Back to Dashboard</Link>
        </div>
      </div>

      {/* Toast */}
      {toast && (
        <div className="fixed top-4 right-4 z-50 rounded-lg border-2 border-black bg-[#28D17C] px-4 py-2 text-sm font-bold text-black">
          {toast}
        </div>
      )}

      {/* Content */}
      <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-black text-black">Your Team</h1>
            <p className="mt-1 text-sm text-black/60">
              Manage team members who can access your properties and collaborations.
            </p>
          </div>
          <Button
            onClick={() => setShowInviteModal(true)}
            disabled={!canInviteMore}
            className="rounded-full border-2 border-black bg-[#FFD84A] px-4 py-2 text-sm font-bold text-black hover:bg-[#f5ce3a] disabled:opacity-50"
          >
            + Invite Team Member
          </Button>
        </div>

        {/* Usage */}
        <div className="mb-6 rounded-xl border-2 border-black bg-white p-4">
          <div className="flex items-center justify-between">
            <span className="text-sm font-bold text-black">Team Members</span>
            <span className="text-sm text-black/60">{teamMembers.length} / {maxMembers}</span>
          </div>
          <div className="mt-2 h-2 overflow-hidden rounded-full bg-black/10">
            <div 
              className="h-full rounded-full bg-[#28D17C] transition-all"
              style={{ width: `${(teamMembers.length / maxMembers) * 100}%` }}
            />
          </div>
        </div>

        {/* Team Members List */}
        <div className="space-y-3">
          {teamMembers.map(member => (
            <div key={member.id} className="flex items-center justify-between rounded-xl border-2 border-black bg-white p-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-black bg-gradient-to-br from-blue-100 to-purple-100 text-sm font-bold text-blue-600">
                  {member.name[0].toUpperCase()}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-bold text-black">{member.name}</p>
                    {member.status === "pending" && (
                      <span className="rounded-full border border-black/20 bg-yellow-100 px-2 py-0.5 text-[10px] font-medium text-yellow-700">
                        Pending
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-black/60">{member.email}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className={`rounded-full border-2 px-2.5 py-0.5 text-[10px] font-bold ${
                  member.role === "admin" 
                    ? "border-black bg-black text-white" 
                    : member.role === "editor"
                    ? "border-black bg-[#FFD84A] text-black"
                    : "border-black bg-white text-black"
                }`}>
                  {member.role.charAt(0).toUpperCase() + member.role.slice(1)}
                </span>
                {member.role !== "admin" && (
                  <button
                    onClick={() => removeTeamMember(member.id)}
                    className="text-xs font-medium text-red-500 hover:text-red-700"
                  >
                    Remove
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Role Descriptions */}
        <div className="mt-8 rounded-xl border-2 border-black bg-white p-4">
          <h3 className="text-sm font-bold text-black mb-3">Role Permissions</h3>
          <div className="space-y-2 text-xs text-black/70">
            <div className="flex items-start gap-2">
              <span className="rounded-full border border-black bg-black px-2 py-0.5 text-[10px] font-bold text-white">Admin</span>
              <span>Full access including billing, team management, and all settings</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="rounded-full border border-black bg-[#FFD84A] px-2 py-0.5 text-[10px] font-bold text-black">Editor</span>
              <span>Can manage properties, send offers, and view collaborations</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="rounded-full border border-black bg-white px-2 py-0.5 text-[10px] font-bold text-black">Viewer</span>
              <span>Read-only access to properties and collaboration status</span>
            </div>
          </div>
        </div>
      </div>

      {/* Invite Modal */}
      {showInviteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-2xl border-[3px] border-black bg-white p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-black text-black">Invite Team Member</h3>
              <button onClick={() => setShowInviteModal(false)} className="text-black/40 hover:text-black">
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="mb-1.5 block text-[11px] font-bold text-black">Email Address *</label>
                <Input
                  type="email"
                  value={inviteEmail}
                  onChange={e => setInviteEmail(e.target.value)}
                  placeholder="colleague@company.com"
                  className="border-2 border-black"
                />
              </div>
              
              <div>
                <label className="mb-1.5 block text-[11px] font-bold text-black">Role *</label>
                <div className="flex gap-2">
                  {(["editor", "viewer"] as const).map(role => (
                    <button
                      key={role}
                      onClick={() => setInviteRole(role)}
                      className={`flex-1 rounded-lg border-2 border-black py-2 text-xs font-bold transition-colors ${
                        inviteRole === role 
                          ? "bg-[#FFD84A] text-black" 
                          : "bg-white text-black hover:bg-black/5"
                      }`}
                    >
                      {role.charAt(0).toUpperCase() + role.slice(1)}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="mt-6 flex gap-3">
              <Button
                onClick={() => setShowInviteModal(false)}
                className="flex-1 rounded-full border-2 border-black bg-white py-2.5 text-sm font-bold text-black hover:bg-black/5"
              >
                Cancel
              </Button>
              <Button
                onClick={handleInvite}
                disabled={!inviteEmail || inviting}
                className="flex-1 rounded-full border-2 border-black bg-[#28D17C] py-2.5 text-sm font-bold text-black hover:bg-[#22b86a] disabled:opacity-50"
              >
                {inviting ? "Sending..." : "Send Invite"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
