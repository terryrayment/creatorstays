import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

/**
 * DELETE /api/admin/users
 * Hard delete a user and all associated data
 * Requires admin auth
 */
export async function DELETE(request: NextRequest) {
  try {
    // Check admin auth
    const cookieStore = await cookies()
    const adminAuth = cookieStore.get('admin_auth')?.value
    
    if (adminAuth !== process.env.ADMIN_SECRET) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { userId, type } = await request.json()
    
    if (!userId || !type) {
      return NextResponse.json({ error: 'userId and type required' }, { status: 400 })
    }

    console.log(`[Admin] Deleting ${type} user: ${userId}`)

    if (type === 'host') {
      // Delete host - need to find the host profile first
      const hostProfile = await prisma.hostProfile.findUnique({
        where: { id: userId },
        include: { user: true }
      })

      if (!hostProfile) {
        return NextResponse.json({ error: 'Host not found' }, { status: 404 })
      }

      const authUserId = hostProfile.userId

      // Delete in order of dependencies:
      
      // 1. Get all conversations for this host (messages cascade delete)
      const conversations = await prisma.conversation.findMany({
        where: { hostProfileId: hostProfile.id },
        select: { id: true }
      })
      
      // 2. Delete messages in these conversations first
      for (const conv of conversations) {
        await prisma.message.deleteMany({
          where: { conversationId: conv.id }
        })
      }

      // 3. Delete all conversations for this host
      await prisma.conversation.deleteMany({
        where: { hostProfileId: hostProfile.id }
      })

      // 4. Delete all collaborations for this host
      await prisma.collaboration.deleteMany({
        where: { hostId: hostProfile.id }
      })

      // 6. Delete all offers from this host
      await prisma.offer.deleteMany({
        where: { hostProfileId: hostProfile.id }
      })

      // 7. Delete tracking links for properties
      const properties = await prisma.property.findMany({
        where: { hostProfileId: hostProfile.id },
        select: { id: true }
      })

      for (const prop of properties) {
        await prisma.trackingLink.deleteMany({
          where: { propertyId: prop.id }
        })
      }

      // 8. Delete all properties
      await prisma.property.deleteMany({
        where: { hostProfileId: hostProfile.id }
      })

      // 9. Delete team members if agency
      await prisma.teamMember.deleteMany({
        where: { hostProfileId: hostProfile.id }
      })

      // 10. Delete pending invites
      await prisma.teamInvite.deleteMany({
        where: { hostProfileId: hostProfile.id }
      })

      // 11. Delete the host profile
      await prisma.hostProfile.delete({
        where: { id: hostProfile.id }
      })

      // 12. Delete sessions for this user
      await prisma.session.deleteMany({
        where: { userId: authUserId }
      })

      // 13. Delete accounts (OAuth) for this user
      await prisma.account.deleteMany({
        where: { userId: authUserId }
      })

      // 14. Delete the user
      await prisma.user.delete({
        where: { id: authUserId }
      })

      console.log(`[Admin] Successfully deleted host ${hostProfile.displayName} (${hostProfile.contactEmail})`)

      return NextResponse.json({ 
        success: true, 
        message: `Deleted host: ${hostProfile.displayName}`,
        deletedEmail: hostProfile.contactEmail
      })

    } else if (type === 'creator') {
      // Delete creator
      const creatorProfile = await prisma.creatorProfile.findUnique({
        where: { id: userId },
        include: { user: true }
      })

      if (!creatorProfile) {
        return NextResponse.json({ error: 'Creator not found' }, { status: 404 })
      }

      const authUserId = creatorProfile.userId

      // Delete in order of dependencies:
      
      // 1. Get all conversations for this creator
      const conversations = await prisma.conversation.findMany({
        where: { creatorProfileId: creatorProfile.id },
        select: { id: true }
      })
      
      // 2. Delete messages in these conversations first
      for (const conv of conversations) {
        await prisma.message.deleteMany({
          where: { conversationId: conv.id }
        })
      }

      // 3. Delete all conversations for this creator
      await prisma.conversation.deleteMany({
        where: { creatorProfileId: creatorProfile.id }
      })

      // 4. Delete all collaborations
      await prisma.collaboration.deleteMany({
        where: { creatorId: creatorProfile.id }
      })

      // 6. Delete all offers to this creator
      await prisma.offer.deleteMany({
        where: { creatorProfileId: creatorProfile.id }
      })

      // 7. Delete tracking links
      await prisma.trackingLink.deleteMany({
        where: { creatorProfileId: creatorProfile.id }
      })

      // 8. Delete reviews
      await prisma.review.deleteMany({
        where: { creatorProfileId: creatorProfile.id }
      })

      // 9. Delete referrals where this creator referred someone
      await prisma.referral.deleteMany({
        where: { referrerId: creatorProfile.id }
      })

      // 10. Delete referrals where this creator was referred
      await prisma.referral.deleteMany({
        where: { referredId: creatorProfile.id }
      })

      // 11. Delete the creator profile
      await prisma.creatorProfile.delete({
        where: { id: creatorProfile.id }
      })

      // 12. Delete sessions
      await prisma.session.deleteMany({
        where: { userId: authUserId }
      })

      // 13. Delete accounts (OAuth)
      await prisma.account.deleteMany({
        where: { userId: authUserId }
      })

      // 14. Delete the user
      await prisma.user.delete({
        where: { id: authUserId }
      })

      console.log(`[Admin] Successfully deleted creator ${creatorProfile.displayName} (@${creatorProfile.handle})`)

      return NextResponse.json({ 
        success: true, 
        message: `Deleted creator: ${creatorProfile.displayName}`,
        deletedEmail: creatorProfile.user.email
      })
    }

    return NextResponse.json({ error: 'Invalid type' }, { status: 400 })

  } catch (error) {
    console.error('[Admin Delete] Error:', error)
    return NextResponse.json({ 
      error: 'Failed to delete user', 
      details: error instanceof Error ? error.message : 'Unknown error' 
    }, { status: 500 })
  }
}
