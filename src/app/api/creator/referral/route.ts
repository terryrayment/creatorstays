import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export const dynamic = 'force-dynamic'

const REFERRAL_BONUS_CENTS = 1000 // $10 per qualified referral

// Generate unique referral code
function generateReferralCode(handle: string): string {
  const suffix = Math.random().toString(36).substring(2, 6).toUpperCase()
  return `${handle.toUpperCase().slice(0, 6)}-${suffix}`
}

// GET /api/creator/referral - Get referral stats and code
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const creator = await prisma.creatorProfile.findUnique({
      where: { userId: session.user.id },
    })

    if (!creator) {
      return NextResponse.json({ error: 'Creator profile not found' }, { status: 404 })
    }

    // Generate referral code if doesn't exist
    let referralCode = creator.referralCode
    if (!referralCode) {
      referralCode = generateReferralCode(creator.handle)
      await prisma.creatorProfile.update({
        where: { id: creator.id },
        data: { referralCode },
      })
    }

    // Get referral stats
    const referrals = await prisma.creatorReferral.findMany({
      where: { referrerId: creator.id },
      orderBy: { createdAt: 'desc' },
    })

    // Get referred creator names
    const referredIds = referrals.map(r => r.referredId)
    const referredCreators = await prisma.creatorProfile.findMany({
      where: { id: { in: referredIds } },
      select: { id: true, displayName: true, handle: true, createdAt: true },
    })

    const referralsWithNames = referrals.map(r => ({
      ...r,
      referredCreator: referredCreators.find(c => c.id === r.referredId),
    }))

    const stats = {
      referralCode,
      referralLink: `${process.env.NEXTAUTH_URL}/join/ref/${referralCode}`,
      totalReferrals: referrals.length,
      qualifiedReferrals: referrals.filter(r => r.status === 'qualified' || r.status === 'paid').length,
      pendingReferrals: referrals.filter(r => r.status === 'pending').length,
      totalEarnings: creator.referralEarnings,
      pendingEarnings: referrals.filter(r => r.status === 'qualified' && !r.commissionPaid).reduce((sum, r) => sum + r.commissionCents, 0),
      referrals: referralsWithNames,
    }

    return NextResponse.json(stats)
  } catch (error) {
    console.error('[Referral Stats] Error:', error)
    return NextResponse.json(
      { error: 'Failed to get referral stats' },
      { status: 500 }
    )
  }
}

// POST /api/creator/referral - Apply referral code during signup
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { referralCode } = body

    if (!referralCode) {
      return NextResponse.json({ error: 'Referral code required' }, { status: 400 })
    }

    // Find referrer by code
    const referrer = await prisma.creatorProfile.findUnique({
      where: { referralCode: referralCode.toUpperCase() },
    })

    if (!referrer) {
      return NextResponse.json({ error: 'Invalid referral code' }, { status: 400 })
    }

    // Get the new creator's profile
    const newCreator = await prisma.creatorProfile.findUnique({
      where: { userId: session.user.id },
    })

    if (!newCreator) {
      return NextResponse.json({ error: 'Creator profile not found' }, { status: 404 })
    }

    // Can't refer yourself
    if (referrer.id === newCreator.id) {
      return NextResponse.json({ error: 'Cannot use your own referral code' }, { status: 400 })
    }

    // Check if already referred
    if (newCreator.referredBy) {
      return NextResponse.json({ error: 'Already used a referral code' }, { status: 400 })
    }

    // Create referral record - mark as qualified since they completed onboarding
    await prisma.creatorReferral.create({
      data: {
        referrerId: referrer.id,
        referredId: newCreator.id,
        referralCode: referralCode.toUpperCase(),
        commissionCents: REFERRAL_BONUS_CENTS,
        status: 'qualified',
        qualifiedAt: new Date(),
      },
    })

    // Update referrer's total earnings
    await prisma.creatorProfile.update({
      where: { id: referrer.id },
      data: { 
        referralEarnings: { increment: REFERRAL_BONUS_CENTS }
      },
    })

    // Mark new creator as referred
    await prisma.creatorProfile.update({
      where: { id: newCreator.id },
      data: { referredBy: referrer.id },
    })

    return NextResponse.json({ 
      success: true,
      message: `Referral from ${referrer.displayName} applied!`,
    })
  } catch (error) {
    console.error('[Apply Referral] Error:', error)
    return NextResponse.json(
      { error: 'Failed to apply referral' },
      { status: 500 }
    )
  }
}
