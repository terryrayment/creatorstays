import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export const dynamic = 'force-dynamic'

// Validate YYYY-MM-DD format
function isValidDateFormat(dateStr: string): boolean {
  return /^\d{4}-\d{2}-\d{2}$/.test(dateStr)
}

// Parse YYYY-MM-DD to local date components
function parseDateString(dateStr: string): { year: number; month: number; day: number } | null {
  if (!isValidDateFormat(dateStr)) return null
  const [year, month, day] = dateStr.split('-').map(Number)
  if (month < 1 || month > 12 || day < 1 || day > 31) return null
  return { year, month, day }
}

// Compare two YYYY-MM-DD strings
function compareDates(a: string, b: string): number {
  return a.localeCompare(b)
}

// Calculate days between two YYYY-MM-DD strings
function daysBetween(start: string, end: string): number {
  const s = parseDateString(start)
  const e = parseDateString(end)
  if (!s || !e) return 0
  const startDate = new Date(s.year, s.month - 1, s.day)
  const endDate = new Date(e.year, e.month - 1, e.day)
  return Math.round((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24))
}

/**
 * GET /api/properties/[id]/manual-blocks
 * Get all manual blocks for a property
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

    // Verify ownership
    const property = await prisma.property.findUnique({
      where: { id: params.id },
      include: {
        hostProfile: { select: { userId: true } },
        manualBlocks: { orderBy: { startDate: 'asc' } },
      },
    })

    if (!property) {
      return NextResponse.json({ error: 'Property not found' }, { status: 404 })
    }

    if (property.hostProfile.userId !== session.user.id) {
      return NextResponse.json({ error: 'Not authorized' }, { status: 403 })
    }

    return NextResponse.json({
      blocks: property.manualBlocks.map(b => ({
        id: b.id,
        startDate: b.startDate,
        endDate: b.endDate,
        note: b.note,
        createdAt: b.createdAt.toISOString(),
      })),
    })
  } catch (error) {
    console.error('[ManualBlocks GET] Error:', error)
    return NextResponse.json({ error: 'Failed to get manual blocks' }, { status: 500 })
  }
}

/**
 * POST /api/properties/[id]/manual-blocks
 * Create a new manual block
 */
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { startDate, endDate, note } = body

    // Validate required fields
    if (!startDate || !endDate) {
      return NextResponse.json({ error: 'startDate and endDate are required' }, { status: 400 })
    }

    // Validate date format
    if (!isValidDateFormat(startDate) || !isValidDateFormat(endDate)) {
      return NextResponse.json({ error: 'Dates must be in YYYY-MM-DD format' }, { status: 400 })
    }

    // Validate endDate > startDate
    if (compareDates(endDate, startDate) <= 0) {
      return NextResponse.json({ error: 'endDate must be after startDate' }, { status: 400 })
    }

    // Validate max range (365 days)
    const days = daysBetween(startDate, endDate)
    if (days > 365) {
      return NextResponse.json({ error: 'Block range cannot exceed 365 days' }, { status: 400 })
    }

    // Verify ownership
    const property = await prisma.property.findUnique({
      where: { id: params.id },
      include: { hostProfile: { select: { userId: true } } },
    })

    if (!property) {
      return NextResponse.json({ error: 'Property not found' }, { status: 404 })
    }

    if (property.hostProfile.userId !== session.user.id) {
      return NextResponse.json({ error: 'Not authorized' }, { status: 403 })
    }

    // Create the block
    const block = await prisma.propertyManualBlock.create({
      data: {
        propertyId: params.id,
        startDate,
        endDate,
        note: note || null,
      },
    })

    console.log(`[ManualBlocks] Created block for property ${params.id}: ${startDate} to ${endDate}`)

    return NextResponse.json({
      block: {
        id: block.id,
        startDate: block.startDate,
        endDate: block.endDate,
        note: block.note,
        createdAt: block.createdAt.toISOString(),
      },
    })
  } catch (error) {
    console.error('[ManualBlocks POST] Error:', error)
    return NextResponse.json({ error: 'Failed to create manual block' }, { status: 500 })
  }
}
