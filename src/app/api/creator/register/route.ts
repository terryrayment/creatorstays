import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

// Master beta codes from environment variable
const MASTER_BETA_CODES = (process.env.MASTER_BETA_CODES || '')
  .split(',')
  .map(code => code.trim().toUpperCase())
  .filter(code => code.length > 0)

/**
 * POST /api/creator/register
 * 
 * Creates a new creator account (beta invite required):
 * 1. Validates invite token (master code or database)
 * 2. Creates User record
 * 3. Creates CreatorProfile linked to User
 * 4. Marks invite as used (if database token)
 * 5. Sends magic link email for authentication
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { 
      email, 
      displayName,
      handle,
      instagramHandle,
      tiktokHandle,
      youtubeHandle,
      inviteToken,
    } = body

    // Validate required fields
    if (!email || !displayName || !handle) {
      return NextResponse.json(
        { error: 'Email, display name, and handle are required' },
        { status: 400 }
      )
    }

    // Validate invite token if provided
    let isMasterCode = false
    if (inviteToken) {
      // Check if it's a master beta code first
      if (MASTER_BETA_CODES.includes(inviteToken.toUpperCase())) {
        isMasterCode = true
        // Master codes are always valid, no further checks needed
      } else {
        // Check database for invite token
        const invite = await prisma.creatorInvite.findUnique({
          where: { token: inviteToken },
        })

        if (!invite) {
          return NextResponse.json(
            { error: 'Invalid invite token' },
            { status: 400 }
          )
        }

        if (invite.revoked) {
          return NextResponse.json(
            { error: 'This invite has been revoked' },
            { status: 400 }
          )
        }

        if (invite.expiresAt && new Date() > invite.expiresAt) {
          return NextResponse.json(
            { error: 'This invite has expired' },
            { status: 400 }
          )
        }

        if (invite.uses >= invite.maxUses) {
          return NextResponse.json(
            { error: 'This invite has reached its usage limit' },
            { status: 400 }
          )
        }
      }
    }

    // Normalize email and handle
    const normalizedEmail = email.toLowerCase().trim()
    const normalizedHandle = handle.toLowerCase().trim().replace(/[^a-z0-9_]/g, '')

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: normalizedEmail },
      include: { creatorProfile: true, hostProfile: true },
    })

    if (existingUser) {
      if (existingUser.creatorProfile) {
        return NextResponse.json(
          { 
            error: 'An account with this email already exists. Please sign in instead.',
            alreadyExists: true,
            hasCreatorProfile: true,
          },
          { status: 409 }
        )
      }
      
      // User exists but no creator profile - require sign in first
      return NextResponse.json(
        { 
          error: 'An account with this email already exists. Please sign in to create a creator profile.',
          alreadyExists: true,
          hasCreatorProfile: false,
        },
        { status: 409 }
      )
    }

    // Check if handle is taken
    const existingHandle = await prisma.creatorProfile.findUnique({
      where: { handle: normalizedHandle },
    })

    if (existingHandle) {
      return NextResponse.json(
        { error: 'This handle is already taken. Please choose a different one.' },
        { status: 409 }
      )
    }

    // Create User + CreatorProfile in a transaction
    const result = await prisma.$transaction(async (tx) => {
      // 1. Create User
      const user = await tx.user.create({
        data: {
          email: normalizedEmail,
          name: displayName,
        },
      })

      // 2. Create CreatorProfile
      const creatorProfile = await tx.creatorProfile.create({
        data: {
          userId: user.id,
          handle: normalizedHandle,
          displayName,
          instagramHandle: instagramHandle || null,
          tiktokHandle: tiktokHandle || null,
          youtubeHandle: youtubeHandle || null,
          // Beta tracking
          isBeta: !!inviteToken,
          inviteTokenUsed: inviteToken || null,
          // Default settings
          niches: [],
          dealTypes: ['flat', 'post-for-stay'],
          deliverables: ['Instagram Reels', 'Stories'],
          openToGiftedStays: true,
          profileComplete: 30, // Basic info complete
        },
      })

      // 3. Mark invite as used (only for database tokens, not master codes)
      if (inviteToken && !isMasterCode) {
        await tx.creatorInvite.update({
          where: { token: inviteToken },
          data: { uses: { increment: 1 } },
        })
      }

      return { user, creatorProfile }
    })

    // 4. Trigger NextAuth magic link directly - ONE email, ONE click to sign in
    const baseUrl = process.env.NEXTAUTH_URL || 'https://creatorstays.com'
    
    try {
      // Use NextAuth's built-in email provider to send a magic link
      // This creates a proper verification token and sends a sign-in email
      const csrfRes = await fetch(`${baseUrl}/api/auth/csrf`)
      const { csrfToken } = await csrfRes.json()
      
      const signInRes = await fetch(`${baseUrl}/api/auth/signin/email`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          email: normalizedEmail,
          csrfToken,
          callbackUrl: `${baseUrl}/onboarding/creator`,
        }),
      })
      
      if (!signInRes.ok) {
        console.error('[Creator Register] Failed to trigger magic link:', await signInRes.text())
      }
    } catch (emailError) {
      console.error('[Creator Register] Failed to send magic link:', emailError)
      // Don't fail the registration if email fails
    }

    return NextResponse.json({
      success: true,
      message: 'Account created! Check your email to sign in.',
      user: {
        id: result.user.id,
        email: result.user.email,
        name: result.user.name,
      },
      creatorProfile: {
        id: result.creatorProfile.id,
        handle: result.creatorProfile.handle,
        displayName: result.creatorProfile.displayName,
      },
      // Include sign-in URL for dev testing
      ...(process.env.NODE_ENV === 'development' ? { signInUrl } : {}),
    })

  } catch (error) {
    console.error('[Creator Register] Error:', error)
    return NextResponse.json(
      { error: 'Failed to create account. Please try again.' },
      { status: 500 }
    )
  }
}
