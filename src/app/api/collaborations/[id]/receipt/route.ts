import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

/**
 * GET /api/collaborations/[id]/receipt
 * Generate a payment receipt PDF for completed collaborations (hosts only)
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const collaborationId = params.id

    // Get host profile
    const hostProfile = await prisma.hostProfile.findUnique({
      where: { userId: session.user.id },
    })

    if (!hostProfile) {
      return NextResponse.json({ error: 'Host profile not found' }, { status: 404 })
    }

    // Get collaboration with all related data
    const collaboration = await prisma.collaboration.findUnique({
      where: { id: collaborationId },
      include: {
        creator: { select: { displayName: true, handle: true } },
        host: { select: { displayName: true, contactEmail: true } },
        property: { select: { title: true, cityRegion: true } },
        offer: true,
        agreement: true,
      },
    })

    if (!collaboration) {
      return NextResponse.json({ error: 'Collaboration not found' }, { status: 404 })
    }

    // Verify host owns this collaboration
    if (collaboration.hostId !== hostProfile.id) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 })
    }

    // Only allow receipts for completed/paid collaborations
    if (collaboration.paymentStatus !== 'completed' || !collaboration.paidAt) {
      return NextResponse.json({ error: 'Receipt only available for completed payments' }, { status: 400 })
    }

    // Generate receipt HTML (will be converted to PDF-like format)
    const receiptHtml = generateReceiptHtml(collaboration)

    // Return as downloadable HTML file (styled to look like receipt)
    // For production, you'd use a proper PDF library
    return new NextResponse(receiptHtml, {
      headers: {
        'Content-Type': 'text/html',
        'Content-Disposition': `attachment; filename="CreatorStays_Receipt_${collaboration.id.slice(-8).toUpperCase()}.html"`,
      },
    })
  } catch (error) {
    console.error('[Receipt API] Error:', error)
    return NextResponse.json({ error: 'Failed to generate receipt' }, { status: 500 })
  }
}

function generateReceiptHtml(collaboration: {
  id: string
  paidAt: Date | null
  paymentAmount: number | null
  creator: { displayName: string; handle: string }
  host: { displayName: string; contactEmail: string | null }
  property: { title: string | null; cityRegion: string | null }
  offer: {
    offerType: string
    cashCents: number
    trafficBonusEnabled: boolean
    trafficBonusCents: number | null
    deliverables: string[]
  }
}): string {
  const paidDate = collaboration.paidAt ? new Date(collaboration.paidAt) : new Date()
  const receiptNumber = `CS-${collaboration.id.slice(-8).toUpperCase()}`
  
  // Calculate amounts
  const baseCents = collaboration.offer.cashCents
  const hostFeeCents = Math.round(baseCents * 0.15)
  const totalCents = baseCents + hostFeeCents
  
  const formatCurrency = (cents: number) => 
    (cents / 100).toLocaleString('en-US', { style: 'currency', currency: 'USD' })

  const formatDate = (date: Date) =>
    date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    })

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Receipt - ${receiptNumber}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      background: #f5f5f5;
      padding: 40px 20px;
      color: #000;
    }
    .receipt {
      max-width: 600px;
      margin: 0 auto;
      background: white;
      border: 3px solid black;
      border-radius: 16px;
      overflow: hidden;
    }
    .header {
      background: #28D17C;
      padding: 30px;
      border-bottom: 3px solid black;
    }
    .header h1 {
      font-size: 24px;
      font-weight: 900;
      letter-spacing: -0.5px;
    }
    .header p {
      margin-top: 4px;
      font-size: 12px;
      opacity: 0.8;
    }
    .badge {
      display: inline-block;
      background: black;
      color: white;
      padding: 6px 12px;
      border-radius: 20px;
      font-size: 10px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      margin-top: 12px;
    }
    .content {
      padding: 30px;
    }
    .meta-row {
      display: flex;
      justify-content: space-between;
      padding: 12px 0;
      border-bottom: 1px solid #eee;
      font-size: 14px;
    }
    .meta-row:last-child { border-bottom: none; }
    .meta-label {
      color: #666;
      font-weight: 500;
    }
    .meta-value {
      font-weight: 600;
      text-align: right;
    }
    .section-title {
      font-size: 10px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 1px;
      color: #999;
      margin-top: 24px;
      margin-bottom: 12px;
    }
    .line-items {
      background: #f9f9f9;
      border: 2px solid #eee;
      border-radius: 12px;
      padding: 16px;
      margin-top: 8px;
    }
    .line-item {
      display: flex;
      justify-content: space-between;
      padding: 8px 0;
      font-size: 14px;
    }
    .line-item.total {
      border-top: 2px solid #000;
      margin-top: 12px;
      padding-top: 12px;
      font-weight: 900;
      font-size: 18px;
    }
    .deliverables {
      margin-top: 8px;
    }
    .deliverable {
      display: inline-block;
      background: #FFD84A;
      border: 2px solid black;
      padding: 4px 10px;
      border-radius: 20px;
      font-size: 11px;
      font-weight: 600;
      margin: 4px 4px 4px 0;
    }
    .footer {
      background: #f5f5f5;
      padding: 20px 30px;
      border-top: 3px solid black;
      font-size: 11px;
      color: #666;
      text-align: center;
    }
    .footer a {
      color: #000;
      font-weight: 600;
    }
    @media print {
      body { background: white; padding: 0; }
      .receipt { border: none; border-radius: 0; }
    }
  </style>
</head>
<body>
  <div class="receipt">
    <div class="header">
      <h1>CreatorStays</h1>
      <p>Payment Receipt</p>
      <span class="badge">✓ Paid</span>
    </div>
    
    <div class="content">
      <div class="meta-row">
        <span class="meta-label">Receipt Number</span>
        <span class="meta-value">${receiptNumber}</span>
      </div>
      <div class="meta-row">
        <span class="meta-label">Date Paid</span>
        <span class="meta-value">${formatDate(paidDate)}</span>
      </div>
      <div class="meta-row">
        <span class="meta-label">Paid By</span>
        <span class="meta-value">${collaboration.host.displayName}</span>
      </div>
      ${collaboration.host.contactEmail ? `
      <div class="meta-row">
        <span class="meta-label">Email</span>
        <span class="meta-value">${collaboration.host.contactEmail}</span>
      </div>
      ` : ''}
      
      <p class="section-title">Collaboration Details</p>
      
      <div class="meta-row">
        <span class="meta-label">Property</span>
        <span class="meta-value">${collaboration.property.title || 'Untitled Property'}</span>
      </div>
      <div class="meta-row">
        <span class="meta-label">Location</span>
        <span class="meta-value">${collaboration.property.cityRegion || 'N/A'}</span>
      </div>
      <div class="meta-row">
        <span class="meta-label">Creator</span>
        <span class="meta-value">@${collaboration.creator.handle}</span>
      </div>
      
      <p class="section-title">Deliverables</p>
      <div class="deliverables">
        ${collaboration.offer.deliverables.map(d => `<span class="deliverable">${d}</span>`).join('')}
      </div>
      
      <p class="section-title">Payment Breakdown</p>
      <div class="line-items">
        <div class="line-item">
          <span>Creator Payment</span>
          <span>${formatCurrency(baseCents)}</span>
        </div>
        <div class="line-item">
          <span>Platform Fee (15%)</span>
          <span>${formatCurrency(hostFeeCents)}</span>
        </div>
        <div class="line-item total">
          <span>Total Paid</span>
          <span>${formatCurrency(totalCents)}</span>
        </div>
      </div>
    </div>
    
    <div class="footer">
      <p>Thank you for using CreatorStays!</p>
      <p style="margin-top: 8px;">
        Questions? Contact <a href="mailto:support@creatorstays.com">support@creatorstays.com</a>
      </p>
      <p style="margin-top: 12px; font-size: 10px; color: #999;">
        CreatorStays, Inc. • creatorstays.com
      </p>
    </div>
  </div>
</body>
</html>`
}
