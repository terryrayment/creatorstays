import { NextRequest, NextResponse } from 'next/server'
import {
  collaborationRequests,
  collaborations,
  mockCreators,
  mockHosts,
  generateToken,
  type CollaborationRequest,
  type Collaboration,
} from '@/lib/collaboration-types'
import { calculatePaymentBreakdown, isValidDealType, type DealType } from '@/lib/payments/calc'

// GET - List collaboration requests (for creator or host)
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const creatorId = searchParams.get('creatorId')
  const hostId = searchParams.get('hostId')
  const status = searchParams.get('status')

  let results = [...collaborationRequests]

  if (creatorId) {
    results = results.filter(r => r.creatorId === creatorId)
  }
  if (hostId) {
    results = results.filter(r => r.hostId === hostId)
  }
  if (status) {
    results = results.filter(r => r.status === status)
  }

  // Enrich with creator/host/property data
  const enriched = results.map(req => {
    const creator = mockCreators.find(c => c.id === req.creatorId)
    const host = mockHosts.find(h => h.id === req.hostId)
    const property = host?.properties.find(p => p.id === req.propertyId)
    return { ...req, creator, host, property }
  })

  return NextResponse.json({ requests: enriched })
}

// POST - Create a new collaboration request (host -> creator)
export async function POST(request: NextRequest) {
  const body = await request.json()
  
  const {
    hostId,
    creatorId,
    propertyId,
    proposedType,
    proposedPercent,
    proposedFlatFee,
    cashCents,        // New: cash portion in cents
    stayNights,       // New: number of nights for stay
    trafficBonusEnabled,
    trafficBonusThreshold,
    trafficBonusCents,
    message,
    deliverables,
  } = body

  // Validate creator exists
  const creator = mockCreators.find(c => c.id === creatorId)
  if (!creator) {
    return NextResponse.json({ error: 'Creator not found' }, { status: 404 })
  }

  // Validate host exists
  const host = mockHosts.find(h => h.id === hostId)
  if (!host) {
    return NextResponse.json({ error: 'Host not found' }, { status: 404 })
  }

  // Normalize deal type (map legacy "affiliate" to "flat-with-bonus")
  let normalizedType: DealType = 'flat'
  if (proposedType === 'affiliate' || proposedType === 'flat-with-bonus') {
    normalizedType = 'flat-with-bonus'
  } else if (proposedType === 'post-for-stay') {
    normalizedType = 'post-for-stay'
  } else if (proposedType === 'flat') {
    normalizedType = 'flat'
  }

  // Determine cash amount
  let finalCashCents = 0
  if (cashCents !== undefined) {
    finalCashCents = cashCents
  } else if (proposedFlatFee !== undefined) {
    // Legacy support: convert flatFee (dollars) to cents
    finalCashCents = Math.round(proposedFlatFee * 100)
  } else if (normalizedType === 'post-for-stay') {
    // Post-for-stay defaults to $0 cash
    finalCashCents = 0
  } else {
    // Default to creator's base rate
    finalCashCents = Math.round((creator.baseRatePerPost || 0) * 100)
  }

  // Validate cashCents >= 0
  if (finalCashCents < 0) {
    return NextResponse.json({ error: 'cashCents must be >= 0' }, { status: 400 })
  }

  // Calculate payment breakdown
  const paymentBreakdown = calculatePaymentBreakdown(finalCashCents)

  // Create request
  const newRequest: CollaborationRequest = {
    id: `req-${generateToken()}`,
    hostId,
    creatorId,
    propertyId,
    proposedType: normalizedType,
    proposedPercent: proposedPercent ?? creator.trafficBonusPercent ?? 10,
    proposedFlatFee: proposedFlatFee ?? creator.baseRatePerPost,
    // New Pay-for-Stay fields
    cashCents: finalCashCents,
    stayNights: stayNights ?? null,
    trafficBonusEnabled: trafficBonusEnabled ?? (normalizedType === 'flat-with-bonus'),
    trafficBonusThreshold: trafficBonusThreshold ?? null,
    trafficBonusCents: trafficBonusCents ?? null,
    message: message || '',
    deliverables: deliverables || creator.deliverables,
    status: 'pending',
    createdAt: new Date(),
  }

  collaborationRequests.push(newRequest)

  return NextResponse.json({ 
    success: true, 
    request: newRequest,
    paymentBreakdown,
    message: `Request sent to ${creator.displayName}. They will review and respond.`
  })
}

// PATCH - Creator responds to request (approve, counter, decline)
export async function PATCH(request: NextRequest) {
  const body = await request.json()
  
  const {
    requestId,
    action, // 'approve' | 'counter' | 'decline'
    counterPercent,
    counterFlatFee,
    counterCashCents,
    counterMessage,
  } = body

  const reqIndex = collaborationRequests.findIndex(r => r.id === requestId)
  if (reqIndex === -1) {
    return NextResponse.json({ error: 'Request not found' }, { status: 404 })
  }

  const req = collaborationRequests[reqIndex]

  if (req.status !== 'pending') {
    return NextResponse.json({ error: 'Request already responded to' }, { status: 400 })
  }

  if (action === 'decline') {
    req.status = 'declined'
    req.respondedAt = new Date()
    return NextResponse.json({ success: true, request: req })
  }

  if (action === 'counter') {
    req.status = 'countered'
    req.counterPercent = counterPercent
    req.counterFlatFee = counterFlatFee
    req.counterCashCents = counterCashCents
    req.counterMessage = counterMessage
    req.respondedAt = new Date()
    return NextResponse.json({ 
      success: true, 
      request: req,
      message: 'Counter offer sent to host for review.'
    })
  }

  if (action === 'approve') {
    req.status = 'approved'
    req.respondedAt = new Date()

    // Generate unique tracking link for this collaboration
    const trackingToken = generateToken()
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
    
    // Use normalized deal type from request
    const dealType = (req.proposedType as DealType) || 'flat'
    
    // Get final cash amount (use counter if provided, otherwise original)
    const finalCashCents = req.counterCashCents ?? req.cashCents ?? 0
    
    // Calculate payment breakdown for the collaboration
    const paymentBreakdown = calculatePaymentBreakdown(finalCashCents)

    const newCollab: Collaboration = {
      id: `collab-${generateToken()}`,
      requestId: req.id,
      hostId: req.hostId,
      creatorId: req.creatorId,
      propertyId: req.propertyId,
      dealType,
      // Payment fields
      cashCents: finalCashCents,
      hostTotalCents: paymentBreakdown.hostTotalCents,
      creatorNetCents: paymentBreakdown.creatorNetCents,
      platformRevenueCents: paymentBreakdown.platformRevenueCents,
      // Stay fields
      stayNights: req.stayNights ?? null,
      // Bonus fields
      trafficBonusEnabled: req.trafficBonusEnabled ?? false,
      trafficBonusThreshold: req.trafficBonusThreshold ?? null,
      trafficBonusCents: req.trafficBonusCents ?? null,
      // Legacy fields (for backward compatibility)
      trafficBonusPercent: req.proposedPercent,
      flatFee: req.proposedFlatFee,
      deliverables: req.deliverables,
      trackingToken,
      trackingUrl: `${baseUrl}/r/${trackingToken}`,
      status: 'active',
      contentLinks: [],
      paymentStatus: finalCashCents > 0 ? 'pending' : 'not-applicable',
      createdAt: new Date(),
    }

    collaborations.push(newCollab)

    return NextResponse.json({ 
      success: true, 
      request: req,
      collaboration: newCollab,
      paymentBreakdown,
      message: paymentBreakdown.isStayOnly 
        ? `Collaboration approved! This is a stay-only deal.`
        : `Collaboration approved! Host will pay ${paymentBreakdown.displayMessage}`
    })
  }

  return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
}
