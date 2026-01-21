import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { cookies } from 'next/headers'

export const dynamic = 'force-dynamic'

// Check admin auth
async function isAdmin(): Promise<boolean> {
  const cookieStore = await cookies()
  const adminSession = cookieStore.get('admin_session')
  return adminSession?.value === 'authenticated'
}

// GET /api/admin/promo-codes - List all promo codes
export async function GET(request: NextRequest) {
  try {
    if (!(await isAdmin())) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const codes = await prisma.hostPromoCode.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        redemptions: {
          orderBy: { createdAt: 'desc' },
          take: 10,
        },
      },
    })

    // Get host profiles for redemptions
    const codesWithProfiles = await Promise.all(
      codes.map(async (code) => {
        const redemptionsWithProfiles = await Promise.all(
          code.redemptions.map(async (r) => {
            const hostProfile = await prisma.hostProfile.findUnique({
              where: { id: r.hostProfileId },
              select: { displayName: true, contactEmail: true },
            })
            return { ...r, hostProfile }
          })
        )
        return { ...code, redemptions: redemptionsWithProfiles }
      })
    )

    return NextResponse.json({ codes: codesWithProfiles })
  } catch (error) {
    console.error('[Admin Promo Codes] Error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch promo codes' },
      { status: 500 }
    )
  }
}

// POST /api/admin/promo-codes - Create new promo code
export async function POST(request: NextRequest) {
  try {
    if (!(await isAdmin())) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { code, discountType, discountAmount, maxUses, expiresAt, note } = body

    if (!code || !discountType) {
      return NextResponse.json({ error: 'Code and discount type required' }, { status: 400 })
    }

    // Check if code already exists
    const existing = await prisma.hostPromoCode.findUnique({
      where: { code: code.toUpperCase().trim() },
    })

    if (existing) {
      return NextResponse.json({ error: 'A code with this name already exists' }, { status: 400 })
    }

    // Validate discount type
    if (!['full', 'percent', 'fixed'].includes(discountType)) {
      return NextResponse.json({ error: 'Invalid discount type' }, { status: 400 })
    }

    // Validate discount amount for non-full discounts
    if (discountType !== 'full' && !discountAmount) {
      return NextResponse.json({ error: 'Discount amount required for this type' }, { status: 400 })
    }

    const newCode = await prisma.hostPromoCode.create({
      data: {
        code: code.toUpperCase().trim(),
        discountType,
        discountAmount: discountAmount ? parseInt(discountAmount) : null,
        maxUses: maxUses ? parseInt(maxUses) : null,
        expiresAt: expiresAt ? new Date(expiresAt) : null,
        note: note || null,
        isActive: true,
      },
      include: {
        redemptions: true,
      },
    })

    return NextResponse.json({ code: newCode })
  } catch (error) {
    console.error('[Admin Promo Codes] Create error:', error)
    return NextResponse.json(
      { error: 'Failed to create promo code' },
      { status: 500 }
    )
  }
}
