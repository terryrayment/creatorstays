import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

/**
 * PATCH /api/admin/users
 * Admin safety valves: disable user, unpublish property, invalidate magic links
 * Requires admin auth
 */
export async function PATCH(request: NextRequest) {
  try {
    const cookieStore = await cookies()
    const adminAuth = cookieStore.get('admin_auth')?.value
    
    if (adminAuth !== process.env.ADMIN_SECRET) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { action, userId, propertyId, email } = await request.json()
    
    console.log(`[Admin Safety Valve] Action: ${action}`, { userId, propertyId, email })

    switch (action) {
      case 'disable_user': {
        // Disable a user by deleting all their sessions (logs them out)
        // and setting a flag to prevent new logins
        if (!userId) {
          return NextResponse.json({ error: 'userId required' }, { status: 400 })
        }
        
        // Delete all sessions for this user
        const deletedSessions = await prisma.session.deleteMany({
          where: { userId }
        })
        
        // Delete all verification tokens to prevent magic link login
        const user = await prisma.user.findUnique({ where: { id: userId } })
        if (user?.email) {
          await prisma.verificationToken.deleteMany({
            where: { identifier: user.email }
          })
        }
        
        console.log(`[Admin] Disabled user ${userId}: deleted ${deletedSessions.count} sessions`)
        
        return NextResponse.json({ 
          success: true, 
          message: `User ${userId} disabled - ${deletedSessions.count} sessions invalidated`
        })
      }
      
      case 'unpublish_property': {
        // Set property to draft (unpublish)
        if (!propertyId) {
          return NextResponse.json({ error: 'propertyId required' }, { status: 400 })
        }
        
        const property = await prisma.property.update({
          where: { id: propertyId },
          data: { isDraft: true, isActive: false }
        })
        
        console.log(`[Admin] Unpublished property ${propertyId}: ${property.title}`)
        
        return NextResponse.json({ 
          success: true, 
          message: `Property "${property.title}" unpublished`
        })
      }
      
      case 'invalidate_magic_links': {
        // Delete all verification tokens for an email
        if (!email) {
          return NextResponse.json({ error: 'email required' }, { status: 400 })
        }
        
        const deleted = await prisma.verificationToken.deleteMany({
          where: { identifier: email.toLowerCase() }
        })
        
        console.log(`[Admin] Invalidated magic links for ${email}: deleted ${deleted.count} tokens`)
        
        return NextResponse.json({ 
          success: true, 
          message: `Invalidated ${deleted.count} magic link(s) for ${email}`
        })
      }
      
      default:
        return NextResponse.json({ error: 'Invalid action. Use: disable_user, unpublish_property, invalidate_magic_links' }, { status: 400 })
    }

  } catch (error) {
    console.error('[Admin Safety Valve] Error:', error)
    return NextResponse.json({ 
      error: 'Operation failed', 
      details: error instanceof Error ? error.message : 'Unknown error' 
    }, { status: 500 })
  }
}

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

      // 9. Delete agency team members if any
      await prisma.agencyTeamMember.deleteMany({
        where: { agencyHostId: hostProfile.id }
      })

      // 10. Delete the host profile
      await prisma.hostProfile.delete({
        where: { id: hostProfile.id }
      })

      // 11. Delete sessions for this user
      await prisma.session.deleteMany({
        where: { userId: authUserId }
      })

      // 12. Delete accounts (OAuth) for this user
      await prisma.account.deleteMany({
        where: { userId: authUserId }
      })

      // 13. Delete verification tokens for this user's email
      if (hostProfile.contactEmail) {
        await prisma.verificationToken.deleteMany({
          where: { identifier: hostProfile.contactEmail }
        })
      }

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

      // 5. Delete all offers to this creator
      await prisma.offer.deleteMany({
        where: { creatorProfileId: creatorProfile.id }
      })

      // 6. Delete tracking links (uses creatorId not creatorProfileId)
      await prisma.trackingLink.deleteMany({
        where: { creatorId: creatorProfile.id }
      })

      // 7. Delete referrals where this creator referred someone
      await prisma.creatorReferral.deleteMany({
        where: { referrerId: creatorProfile.id }
      })

      // 8. Delete referrals where this creator was referred
      await prisma.creatorReferral.deleteMany({
        where: { referredId: creatorProfile.id }
      })

      // 9. Delete the creator profile (reviews cascade delete via collaboration)
      await prisma.creatorProfile.delete({
        where: { id: creatorProfile.id }
      })

      // 10. Delete sessions
      await prisma.session.deleteMany({
        where: { userId: authUserId }
      })

      // 11. Delete accounts (OAuth)
      await prisma.account.deleteMany({
        where: { userId: authUserId }
      })

      // 12. Delete verification tokens for this user's email
      if (creatorProfile.user.email) {
        await prisma.verificationToken.deleteMany({
          where: { identifier: creatorProfile.user.email }
        })
      }

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
