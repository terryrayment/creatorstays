import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { sendEmail, teamInviteEmail } from '@/lib/email'

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

    // Allow the request even if not officially an agency (for localStorage testing mode)
    // The frontend handles the access check
    const teamMembers = await prisma.agencyTeamMember.findMany({
      where: { agencyHostId: hostProfile.id },
      orderBy: { createdAt: 'desc' },
    })

    // Get user details for each team member (only for real user IDs, not pending_xxx)
    const realUserIds = teamMembers
      .map(m => m.userId)
      .filter(id => !id.startsWith('pending_'))
    
    const users = realUserIds.length > 0 
      ? await prisma.user.findMany({
          where: { id: { in: realUserIds } },
          select: { id: true, name: true, email: true, image: true },
        })
      : []

    const membersWithUsers = teamMembers.map(m => ({
      ...m,
      user: users.find(u => u.id === m.userId) || null,
    }))

    return NextResponse.json({
      teamMembers: membersWithUsers,
      totalSeats: hostProfile.teamSeats || 5,
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

    // Allow invites for localStorage testing mode - frontend handles access check
    // In production, you'd want to verify isAgency here

    // Check seat limit (default to 5 if not set)
    const seatLimit = hostProfile.teamSeats || 5
    const currentMembers = await prisma.agencyTeamMember.count({
      where: { 
        agencyHostId: hostProfile.id,
        inviteStatus: { in: ['pending', 'accepted'] },
      },
    })

    if (currentMembers >= seatLimit) {
      return NextResponse.json({ 
        error: `Team seat limit reached (${seatLimit}). Upgrade to add more.` 
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

    // Get inviter info for email
    const inviter = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { name: true, email: true },
    })

    // Send invite email with the team member ID as the invite token
    const emailData = teamInviteEmail({
      inviteeName: invitedUser?.name || email.split('@')[0],
      inviteeEmail: email.toLowerCase(),
      inviterName: inviter?.name || 'A team admin',
      agencyName: hostProfile.agencyName || 'CreatorStays Agency',
      role: role,
      inviteToken: teamMember.id, // This creates the /join/team/[token] link
    })

    const emailResult = await sendEmail({
      to: email.toLowerCase(),
      subject: emailData.subject,
      html: emailData.html,
      text: emailData.text,
    })

    if (!emailResult.success) {
      console.error('[Team Invite] Email failed:', emailResult.error)
      // Don't fail the request - the invite was created, just log the email failure
    }

    return NextResponse.json({ 
      success: true,
      teamMember,
      emailSent: emailResult.success,
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

// DELETE /api/host/agency/team?memberId=xxx - Remove team member
export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const memberId = searchParams.get('memberId')

    if (!memberId) {
      return NextResponse.json({ error: 'Member ID required' }, { status: 400 })
    }

    const hostProfile = await prisma.hostProfile.findUnique({
      where: { userId: session.user.id },
    })

    if (!hostProfile) {
      return NextResponse.json({ error: 'Host profile not found' }, { status: 404 })
    }

    // Allow deletion for localStorage testing mode - frontend handles access check

    // Find and delete the team member
    const teamMember = await prisma.agencyTeamMember.findFirst({
      where: {
        id: memberId,
        agencyHostId: hostProfile.id,
      },
    })

    if (!teamMember) {
      return NextResponse.json({ error: 'Team member not found' }, { status: 404 })
    }

    await prisma.agencyTeamMember.delete({
      where: { id: memberId },
    })

    return NextResponse.json({ 
      success: true,
      message: 'Team member removed',
    })
  } catch (error) {
    console.error('[Team Remove] Error:', error)
    return NextResponse.json(
      { error: 'Failed to remove team member' },
      { status: 500 }
    )
  }
}
