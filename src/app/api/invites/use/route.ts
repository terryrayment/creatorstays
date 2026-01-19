import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

/**
 * POST /api/invites/use
 * 
 * Marks an invite token as used after successful creator signup.
 * This should be called after the creator profile is created.
 * 
 * Request body:
 * {
 *   token: string,        // The invite token
 *   creatorProfileId: string  // The ID of the created profile (for audit)
 * }
 * 
 * This endpoint:
 * 1. Validates the token is still usable
 * 2. Increments the uses count
 * 3. Returns success/failure
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { token, creatorProfileId } = body

    if (!token) {
      return NextResponse.json({ 
        success: false, 
        error: 'No token provided' 
      }, { status: 400 })
    }

    // Find the invite
    const invite = await prisma.creatorInvite.findUnique({
      where: { token }
    })

    if (!invite) {
      return NextResponse.json({ 
        success: false, 
        error: 'Invalid invite token' 
      }, { status: 404 })
    }

    // Verify invite is still valid
    if (invite.revoked) {
      return NextResponse.json({ 
        success: false, 
        error: 'Invite has been revoked' 
      }, { status: 400 })
    }

    if (invite.expiresAt && new Date() > invite.expiresAt) {
      return NextResponse.json({ 
        success: false, 
        error: 'Invite has expired' 
      }, { status: 400 })
    }

    if (invite.uses >= invite.maxUses) {
      return NextResponse.json({ 
        success: false, 
        error: 'Invite has reached usage limit' 
      }, { status: 400 })
    }

    // Increment the usage count atomically
    const updatedInvite = await prisma.creatorInvite.update({
      where: { token },
      data: {
        uses: {
          increment: 1
        }
      }
    })

    // Log the usage (for audit purposes)
    console.log(`[INVITE USED] Token: ${token}, Profile: ${creatorProfileId}, Uses: ${updatedInvite.uses}/${updatedInvite.maxUses}`)

    return NextResponse.json({ 
      success: true,
      usesRemaining: updatedInvite.maxUses - updatedInvite.uses
    })

  } catch (error) {
    console.error('Error using invite token:', error)
    return NextResponse.json({ 
      success: false, 
      error: 'An error occurred' 
    }, { status: 500 })
  }
}
