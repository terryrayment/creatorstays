import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// Master beta codes - read from environment variable (comma-separated)
// Set in .env: MASTER_BETA_CODES=CREATOR2025,BETACREATOR,CREATORSTAYS
const MASTER_BETA_CODES = (process.env.MASTER_BETA_CODES || '')
  .split(',')
  .map(code => code.trim().toUpperCase())
  .filter(code => code.length > 0)

/**
 * GET /api/invites/validate?token=xxxx
 * 
 * Validates a creator invite token for private beta access.
 * 
 * Validation rules:
 * 1. If token is a master beta code (from env), always valid
 * 2. Otherwise, token must exist in database
 * 3. Token must not be revoked
 * 4. Token must not be expired (if expiresAt is set)
 * 5. Token must have remaining uses (uses < maxUses)
 * 
 * Returns:
 * - { valid: true } if token is valid and can be used
 * - { valid: false, reason: "..." } if token is invalid
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const token = searchParams.get('token')

  // Token is required
  if (!token) {
    return NextResponse.json({ 
      valid: false, 
      reason: 'No token provided' 
    })
  }

  // Check if it's a master beta code (case-insensitive)
  if (MASTER_BETA_CODES.includes(token.toUpperCase())) {
    return NextResponse.json({ 
      valid: true,
      isMasterCode: true,
      meta: {
        remainingUses: 'unlimited',
        expiresAt: null
      }
    })
  }

  try {
    // Look up the invite token
    const invite = await prisma.creatorInvite.findUnique({
      where: { token }
    })

    // Token doesn't exist
    if (!invite) {
      return NextResponse.json({ 
        valid: false, 
        reason: 'Invalid invite token' 
      })
    }

    // Token has been revoked
    if (invite.revoked) {
      return NextResponse.json({ 
        valid: false, 
        reason: 'This invite has been revoked' 
      })
    }

    // Token has expired
    if (invite.expiresAt && new Date() > invite.expiresAt) {
      return NextResponse.json({ 
        valid: false, 
        reason: 'This invite has expired' 
      })
    }

    // Token has reached max uses
    if (invite.uses >= invite.maxUses) {
      return NextResponse.json({ 
        valid: false, 
        reason: 'This invite has reached its usage limit' 
      })
    }

    // All checks passed - token is valid
    return NextResponse.json({ 
      valid: true,
      // Include some metadata for the signup page (optional)
      meta: {
        remainingUses: invite.maxUses - invite.uses,
        expiresAt: invite.expiresAt?.toISOString() || null
      }
    })

  } catch (error) {
    console.error('Error validating invite token:', error)
    return NextResponse.json({ 
      valid: false, 
      reason: 'An error occurred while validating the invite' 
    }, { status: 500 })
  }
}
