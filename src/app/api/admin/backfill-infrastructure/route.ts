/**
 * Admin API: Backfill Infrastructure Fields
 * 
 * POST /api/admin/backfill-infrastructure
 * 
 * Backfills trust tier, readiness state, and profile completeness
 * for all existing creators. Safe to run multiple times.
 * 
 * Requires admin authentication.
 */

import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { isAdmin } from '@/lib/feature-flags'
import { logAdminAction } from '@/lib/audit'

// Computation functions (same as backfill script)
function computeBlockers(creator: {
  displayName: string | null
  handle: string | null
  bio: string | null
  niches: string[]
  deliverables: string[]
  minimumFlatFee: number | null
  instagramConnected: boolean
  tiktokConnected: boolean
}): string[] {
  const blockers: string[] = []
  
  if (!creator.displayName?.trim()) blockers.push('missing_display_name')
  if (!creator.handle?.trim()) blockers.push('missing_handle')
  if (!creator.bio?.trim()) blockers.push('missing_bio')
  if (!creator.niches?.length) blockers.push('missing_niches')
  if (!creator.deliverables?.length) blockers.push('missing_deliverables')
  if (!creator.minimumFlatFee || creator.minimumFlatFee <= 0) blockers.push('missing_minimum_rate')
  if (!creator.instagramConnected && !creator.tiktokConnected) blockers.push('no_social_connected')
  
  return blockers
}

function computeProfileCompleteness(creator: {
  displayName: string | null
  handle: string | null
  bio: string | null
  niches: string[]
  deliverables: string[]
  minimumFlatFee: number | null
  avatarUrl: string | null
  instagramConnected: boolean
  tiktokConnected: boolean
}): number {
  const fields = [
    { filled: !!creator.displayName?.trim(), weight: 1 },
    { filled: !!creator.handle?.trim(), weight: 1 },
    { filled: !!creator.bio?.trim(), weight: 1 },
    { filled: creator.niches?.length > 0, weight: 1 },
    { filled: creator.deliverables?.length > 0, weight: 1 },
    { filled: !!creator.minimumFlatFee && creator.minimumFlatFee > 0, weight: 1 },
    { filled: !!creator.avatarUrl, weight: 0.5 },
    { filled: creator.instagramConnected || creator.tiktokConnected, weight: 1.5 },
  ]
  
  const totalWeight = fields.reduce((sum, f) => sum + f.weight, 0)
  const filledWeight = fields.reduce((sum, f) => sum + (f.filled ? f.weight : 0), 0)
  
  return Math.min(1, filledWeight / totalWeight)
}

type TrustTier = 'NEW' | 'VERIFIED' | 'PROVEN'
type ReadinessState = 'INCOMPLETE' | 'PENDING_OAUTH' | 'READY'

function computeTrustTier(
  profileCompleteness: number,
  hasOAuth: boolean,
  hasCompletedCollab: boolean
): TrustTier {
  if (hasCompletedCollab) return 'PROVEN'
  if (hasOAuth && profileCompleteness >= 0.8) return 'VERIFIED'
  return 'NEW'
}

function computeReadinessState(blockers: string[], hasOAuth: boolean): ReadinessState {
  const profileBlockers = blockers.filter(b => b !== 'no_social_connected')
  if (profileBlockers.length === 0 && hasOAuth) return 'READY'
  if (profileBlockers.length === 0 && !hasOAuth) return 'PENDING_OAUTH'
  return 'INCOMPLETE'
}

export async function POST(request: Request) {
  try {
    // Check admin auth
    const session = await getServerSession(authOptions)
    if (!session?.user?.email || !isAdmin(session.user.email)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    const startTime = Date.now()
    
    // Get completed collaborations
    const completedCollabs = await prisma.collaboration.findMany({
      where: { status: 'completed' },
      select: { creatorId: true, completedAt: true },
      orderBy: { completedAt: 'asc' },
    })
    
    const firstCompletedMap = new Map<string, Date>()
    for (const collab of completedCollabs) {
      if (!firstCompletedMap.has(collab.creatorId) && collab.completedAt) {
        firstCompletedMap.set(collab.creatorId, collab.completedAt)
      }
    }
    
    // Get all creators
    const creators = await prisma.creatorProfile.findMany({
      select: {
        id: true,
        displayName: true,
        handle: true,
        bio: true,
        niches: true,
        deliverables: true,
        minimumFlatFee: true,
        avatarUrl: true,
        instagramConnected: true,
        tiktokConnected: true,
      },
    })
    
    let updated = 0
    let errors = 0
    const errorIds: string[] = []
    
    for (const creator of creators) {
      try {
        const profileCompleteness = computeProfileCompleteness(creator)
        const blockers = computeBlockers(creator)
        const hasOAuth = creator.instagramConnected || creator.tiktokConnected
        const readinessState = computeReadinessState(blockers, hasOAuth)
        const hasCompletedCollab = firstCompletedMap.has(creator.id)
        const firstCollabCompletedAt = firstCompletedMap.get(creator.id) || null
        const trustTier = computeTrustTier(profileCompleteness, hasOAuth, hasCompletedCollab)
        
        await prisma.creatorProfile.update({
          where: { id: creator.id },
          data: {
            profileCompleteness,
            readinessBlockers: blockers,
            readinessState,
            trustTier,
            firstCollabCompletedAt,
          },
        })
        
        updated++
      } catch (error) {
        errors++
        errorIds.push(creator.id)
      }
    }
    
    const duration = Date.now() - startTime
    
    // Log the admin action
    await logAdminAction(
      'backfill_infrastructure',
      session.user.id || 'unknown',
      session.user.email,
      'System',
      'backfill',
      {
        totalCreators: creators.length,
        updated,
        errors,
        durationMs: duration,
      }
    )
    
    // Get stats
    const trustStats = await prisma.creatorProfile.groupBy({
      by: ['trustTier'],
      _count: true,
    })
    
    const readinessStats = await prisma.creatorProfile.groupBy({
      by: ['readinessState'],
      _count: true,
    })
    
    return NextResponse.json({
      success: true,
      results: {
        totalCreators: creators.length,
        updated,
        errors,
        errorIds: errorIds.slice(0, 10), // First 10 error IDs
        durationMs: duration,
      },
      stats: {
        trustTier: Object.fromEntries(trustStats.map(s => [s.trustTier, s._count])),
        readinessState: Object.fromEntries(readinessStats.map(s => [s.readinessState, s._count])),
      },
    })
  } catch (error) {
    console.error('[Backfill] Error:', error)
    return NextResponse.json(
      { error: 'Backfill failed', details: String(error) },
      { status: 500 }
    )
  }
}

// GET to check current stats without running backfill
export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email || !isAdmin(session.user.email)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    const trustStats = await prisma.creatorProfile.groupBy({
      by: ['trustTier'],
      _count: true,
    })
    
    const readinessStats = await prisma.creatorProfile.groupBy({
      by: ['readinessState'],
      _count: true,
    })
    
    const totalCreators = await prisma.creatorProfile.count()
    
    return NextResponse.json({
      totalCreators,
      stats: {
        trustTier: Object.fromEntries(trustStats.map(s => [s.trustTier, s._count])),
        readinessState: Object.fromEntries(readinessStats.map(s => [s.readinessState, s._count])),
      },
    })
  } catch (error) {
    console.error('[Backfill] Error:', error)
    return NextResponse.json(
      { error: 'Failed to get stats', details: String(error) },
      { status: 500 }
    )
  }
}
