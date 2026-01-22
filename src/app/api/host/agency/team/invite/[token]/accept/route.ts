import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export const dynamic = 'force-dynamic'

// POST /api/host/agency/team/invite/[token]/accept - Accept invite
export async function POST(
  request: NextRequest,
  { params }: { params: { token: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id || !session?.user?.email) {
      return NextResponse.json({ error: 'Please sign in first' }, { status: 401 })
    }

    const { token } = params

    if (!token) {
      return NextResponse.json({ error: 'Token required' }, { status: 400 })
    }

    // Find the team member invite
    const teamMember = await prisma.agencyTeamMember.findUnique({
      where: { id: token },
    })

    if (!teamMember) {
      return NextResponse.json({ error: 'Invitation not found' }, { status: 404 })
    }

    if (teamMember.inviteStatus === 'accepted') {
      return NextResponse.json({ error: 'Invitation already accepted' }, { status: 400 })
    }

    // Check if this invite is for this user
    const pendingEmail = teamMember.userId.startsWith('pending_') 
      ? teamMember.userId.replace('pending_', '').toLowerCase()
      : null

    if (pendingEmail && pendingEmail !== session.user.email.toLowerCase()) {
      return NextResponse.json({ 
        error: `This invitation was sent to ${pendingEmail}` 
      }, { status: 403 })
    }

    // If invite was for a real user ID, check it matches
    if (!pendingEmail && teamMember.userId !== session.user.id) {
      return NextResponse.json({ 
        error: 'This invitation is for a different user' 
      }, { status: 403 })
    }

    // Update the team member record
    await prisma.agencyTeamMember.update({
      where: { id: token },
      data: {
        userId: session.user.id, // Update from pending_email to real user ID
        inviteStatus: 'accepted',
      },
    })

    // Check if user already has a host profile
    let hostProfile = await prisma.hostProfile.findUnique({
      where: { userId: session.user.id },
    })

    // If they don't have a host profile, create a minimal one
    if (!hostProfile) {
      hostProfile = await prisma.hostProfile.create({
        data: {
          userId: session.user.id,
          displayName: session.user.name || session.user.email?.split('@')[0] || 'Team Member',
          contactEmail: session.user.email,
          isAgency: false, // They're a team member, not an agency owner
          membershipPaid: true, // Team members don't need to pay separately
        },
      })
    }

    return NextResponse.json({ 
      success: true,
      message: 'Welcome to the team!',
    })
  } catch (error) {
    console.error('[Team Invite Accept] Error:', error)
    return NextResponse.json(
      { error: 'Failed to accept invitation' },
      { status: 500 }
    )
  }
}
