import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export const dynamic = 'force-dynamic'

const MEMBERSHIP_PRICE_CENTS = 19900 // $199.00

// GET /api/host/membership/validate-promo?code=XXXXX
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const code = searchParams.get('code')

    if (!code) {
      return NextResponse.json({ error: 'Code required' }, { status: 400 })
    }

    const promoCode = await prisma.hostPromoCode.findUnique({
      where: { code: code.toUpperCase().trim() },
    })

    if (!promoCode) {
      return NextResponse.json({ 
        valid: false, 
        error: 'Invalid promo code' 
      })
    }

    if (!promoCode.isActive) {
      return NextResponse.json({ 
        valid: false, 
        error: 'This promo code is no longer active' 
      })
    }

    if (promoCode.expiresAt && new Date() > promoCode.expiresAt) {
      return NextResponse.json({ 
        valid: false, 
        error: 'This promo code has expired' 
      })
    }

    if (promoCode.maxUses && promoCode.uses >= promoCode.maxUses) {
      return NextResponse.json({ 
        valid: false, 
        error: 'This promo code has reached its usage limit' 
      })
    }

    // Calculate the discount
    let discountAmount = 0
    let finalPrice = MEMBERSHIP_PRICE_CENTS
    let discountDescription = ''

    if (promoCode.discountType === 'full') {
      discountAmount = MEMBERSHIP_PRICE_CENTS
      finalPrice = 0
      discountDescription = 'Free membership!'
    } else if (promoCode.discountType === 'percent' && promoCode.discountAmount) {
      discountAmount = Math.round(MEMBERSHIP_PRICE_CENTS * promoCode.discountAmount / 100)
      finalPrice = MEMBERSHIP_PRICE_CENTS - discountAmount
      discountDescription = `${promoCode.discountAmount}% off`
    } else if (promoCode.discountType === 'fixed' && promoCode.discountAmount) {
      discountAmount = promoCode.discountAmount * 100 // Convert to cents
      finalPrice = Math.max(0, MEMBERSHIP_PRICE_CENTS - discountAmount)
      discountDescription = `$${promoCode.discountAmount} off`
    }

    return NextResponse.json({
      valid: true,
      code: promoCode.code,
      discountType: promoCode.discountType,
      discountAmount: discountAmount / 100, // Return in dollars
      finalPrice: finalPrice / 100, // Return in dollars
      originalPrice: MEMBERSHIP_PRICE_CENTS / 100,
      description: discountDescription,
      isFree: finalPrice === 0,
    })
  } catch (error) {
    console.error('[Validate Promo] Error:', error)
    return NextResponse.json(
      { error: 'Failed to validate promo code' },
      { status: 500 }
    )
  }
}
