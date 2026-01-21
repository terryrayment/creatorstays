import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export const dynamic = 'force-dynamic'

// GET /api/host/agency/team - Get team members
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const hostProfile = await prisma.hostProfile.findUnique({
      where: { userId: session.user.id },
    })

    if (!hostProfile) {
      return NextResponse.json({ error: 'Host profile not found' }, { status: 404 })
    }

    if (!hostProfile.isAgency) {
      return NextResponse.json({ error: 'Agency subscription required' }, { status: 403 })
    }

    const teamMembers = await prisma.agencyTeamMember.findMany({
      where: { agencyHostId: hostProfile.id },
      orderBy: { createdAt: 'desc' },
    })

    // Get user details for each team member
    const userIds = teamMembers.map(m => m.userId)
    const users = await prisma.user.findMany({
      where: { id: { in: userIds } },
      select: { id: true, name: true, email: true, image: true },
    })

    const membersWithUsers = teamMembers.map(m => ({
      ...m,
      user: users.find(u => u.id === m.userId),
    }))

    return NextResponse.json({
      teamMembers: membersWithUsers,
      totalSeats: hostProfile.teamSeats,
      usedSeats: teamMembers.filter(m => m.inviteStatus === 'accepted').length,
    })
  } catch (error) {
    console.error('[Team List] Error:', error)
    return NextResponse.json(
      { error: 'Failed to get team members' },
      { status: 500 }
    )
  }
}

// POST /api/host/agency/team - Invite team member
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { email, role = 'member', permissions = {} } = body

    if (!email) {
      return NextResponse.json({ error: 'Email required' }, { status: 400 })
    }

    const hostProfile = await prisma.hostProfile.findUnique({
      where: { userId: session.user.id },
    })

    if (!hostProfile) {
      return NextResponse.json({ error: 'Host profile not found' }, { status: 404 })
    }

    if (!hostProfile.isAgency) {
      return NextResponse.json({ error: 'Agency subscription required' }, { status: 403 })
    }

    // Check seat limit
    const currentMembers = await prisma.agencyTeamMember.count({
      where: { 
        agencyHostId: hostProfile.id,
        inviteStatus: { in: ['pending', 'accepted'] },
      },
    })

    if (currentMembers >= hostProfile.teamSeats) {
      return NextResponse.json({ 
        error: `Team seat limit reached (${hostProfile.teamSeats}). Upgrade to add more.` 
      }, { status: 400 })
    }

    // Find or note the invited user
    let invitedUser = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    })

    // For now, we'll create a placeholder if user doesn't exist
    // They'll be linked when they sign up
    const userId = invitedUser?.id || `pending_${email.toLowerCase()}`

    // Check if already invited
    const existing = await prisma.agencyTeamMember.findFirst({
      where: {
        agencyHostId: hostProfile.id,
        OR: [
          { userId },
          { userId: `pending_${email.toLowerCase()}` },
        ],
      },
    })

    if (existing) {
      return NextResponse.json({ error: 'User already invited' }, { status: 400 })
    }

    // Create team member invite
    const teamMember = await prisma.agencyTeamMember.create({
      data: {
        agencyHostId: hostProfile.id,
        userId,
        role,
        canManageProperties: permissions.canManageProperties ?? true,
        canSendOffers: permissions.canSendOffers ?? true,
        canViewAnalytics: permissions.canViewAnalytics ?? true,
        canManageTeam: permissions.canManageTeam ?? false,
        inviteStatus: invitedUser ? 'pending' : 'pending',
      },
    })

    // TODO: Send invite email

    return NextResponse.json({ 
      success: true,
      teamMember,
      message: invitedUser 
        ? `Invite sent to ${email}` 
        : `Invite created. ${email} will join when they sign up.`,
    })
  } catch (error) {
    console.error('[Team Invite] Error:', error)
    return NextResponse.json(
      { error: 'Failed to invite team member' },
      { status: 500 }
    )
  }
}
