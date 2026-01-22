import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

// GET /api/host/agency/team/invite/[token] - Get invite details
export async function GET(
  request: NextRequest,
  { params }: { params: { token: string } }
) {
  try {
    const { token } = params

    if (!token) {
      return NextResponse.json({ error: 'Token required' }, { status: 400 })
    }

    // Find the team member invite by ID (token is the invite ID)
    const teamMember = await prisma.agencyTeamMember.findUnique({
      where: { id: token },
    })

    if (!teamMember) {
      return NextResponse.json({ error: 'Invitation not found' }, { status: 404 })
    }

    // Get the agency host profile
    const hostProfile = await prisma.hostProfile.findUnique({
      where: { id: teamMember.agencyHostId },
    })

    if (!hostProfile) {
      return NextResponse.json({ error: 'Agency not found' }, { status: 404 })
    }

    // Get inviter info
    const inviter = await prisma.user.findUnique({
      where: { id: hostProfile.userId },
      select: { name: true, email: true },
    })

    // Extract email from pending user ID
    const email = teamMember.userId.startsWith('pending_') 
      ? teamMember.userId.replace('pending_', '')
      : null

    // If not a pending invite, get the user's email
    let inviteEmail: string | null = email
    if (!inviteEmail) {
      const user = await prisma.user.findUnique({
        where: { id: teamMember.userId },
        select: { email: true },
      })
      inviteEmail = user?.email ?? null
    }

    return NextResponse.json({
      valid: true,
      email: inviteEmail,
      role: teamMember.role === 'member' ? 'editor' : teamMember.role,
      agencyName: hostProfile.agencyName || hostProfile.displayName || 'CreatorStays Agency',
      inviterName: inviter?.name || inviter?.email || 'Agency Admin',
      alreadyAccepted: teamMember.inviteStatus === 'accepted',
    })
  } catch (error) {
    console.error('[Team Invite GET] Error:', error)
    return NextResponse.json(
      { error: 'Failed to get invitation' },
      { status: 500 }
    )
  }
}
