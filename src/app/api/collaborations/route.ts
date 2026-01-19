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

  // Create request
  const newRequest: CollaborationRequest = {
    id: `req-${generateToken()}`,
    hostId,
    creatorId,
    propertyId,
    proposedType: proposedType || 'flat',
    proposedPercent: proposedPercent ?? creator.trafficBonusPercent ?? 10, // fallback to 10% if not set
    proposedFlatFee: proposedFlatFee ?? creator.baseRatePerPost,
    message: message || '',
    deliverables: deliverables || creator.deliverables,
    status: 'pending',
    createdAt: new Date(),
  }

  collaborationRequests.push(newRequest)

  return NextResponse.json({ 
    success: true, 
    request: newRequest,
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
    
    const host = mockHosts.find(h => h.id === req.hostId)
    const property = host?.properties.find(p => p.id === req.propertyId)

    // Map old "affiliate" type to new "flat-with-bonus" type
    const dealType: 'flat' | 'flat-with-bonus' | 'post-for-stay' = 
      req.proposedType === 'affiliate' ? 'flat-with-bonus' : 
      (req.proposedType as 'flat' | 'flat-with-bonus' | 'post-for-stay')

    const newCollab: Collaboration = {
      id: `collab-${generateToken()}`,
      requestId: req.id,
      hostId: req.hostId,
      creatorId: req.creatorId,
      propertyId: req.propertyId,
      dealType,
      trafficBonusPercent: req.proposedPercent,
      flatFee: req.proposedFlatFee,
      deliverables: req.deliverables,
      trackingToken,
      trackingUrl: `${baseUrl}/r/${trackingToken}`,
      status: 'active',
      contentLinks: [],
      paymentStatus: 'pending',
      createdAt: new Date(),
    }

    collaborations.push(newCollab)

    return NextResponse.json({ 
      success: true, 
      request: req,
      collaboration: newCollab,
      message: `Collaboration approved! Tracking link: ${newCollab.trackingUrl}`
    })
  }

  return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
}
