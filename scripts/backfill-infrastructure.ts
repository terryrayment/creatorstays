/**
 * Backfill Script: Trust & Readiness for Existing Creators
 * 
 * Run this AFTER the migration completes to populate:
 * - trustTier
 * - readinessState
 * - readinessBlockers
 * - profileCompleteness
 * 
 * Usage:
 *   npx ts-node scripts/backfill-infrastructure.ts
 * 
 * Or via API route (for Vercel):
 *   POST /api/admin/backfill-infrastructure
 */

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// Same logic as in the library files
function computeBlockers(creator: {
  displayName: string | null
  handle: string | null
  bio: string | null
  niches: string[]
  deliverables: string[]
  minimumFlatFee: number | null
  avatarUrl: string | null
  instagramConnected: boolean
  tiktokConnected: boolean
}): string[] {
  const blockers: string[] = []
  
  if (!creator.displayName || creator.displayName.trim() === '') {
    blockers.push('missing_display_name')
  }
  if (!creator.handle || creator.handle.trim() === '') {
    blockers.push('missing_handle')
  }
  if (!creator.bio || creator.bio.trim() === '') {
    blockers.push('missing_bio')
  }
  if (!creator.niches || creator.niches.length === 0) {
    blockers.push('missing_niches')
  }
  if (!creator.deliverables || creator.deliverables.length === 0) {
    blockers.push('missing_deliverables')
  }
  if (!creator.minimumFlatFee || creator.minimumFlatFee <= 0) {
    blockers.push('missing_minimum_rate')
  }
  if (!creator.instagramConnected && !creator.tiktokConnected) {
    blockers.push('no_social_connected')
  }
  
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

function computeTrustTier(creator: {
  instagramConnected: boolean
  tiktokConnected: boolean
  profileCompleteness: number
  hasCompletedCollab: boolean
}): TrustTier {
  if (creator.hasCompletedCollab) {
    return 'PROVEN'
  }
  
  const hasOAuth = creator.instagramConnected || creator.tiktokConnected
  const profileComplete = creator.profileCompleteness >= 0.8
  
  if (hasOAuth && profileComplete) {
    return 'VERIFIED'
  }
  
  return 'NEW'
}

function computeReadinessState(
  blockers: string[],
  hasOAuth: boolean
): ReadinessState {
  const profileBlockers = blockers.filter(b => b !== 'no_social_connected')
  
  if (profileBlockers.length === 0 && hasOAuth) {
    return 'READY'
  }
  
  if (profileBlockers.length === 0 && !hasOAuth) {
    return 'PENDING_OAUTH'
  }
  
  return 'INCOMPLETE'
}

async function backfillCreators() {
  console.log('Starting backfill of trust & readiness fields...')
  
  // First, get all creators with completed collaborations
  const completedCollabs = await prisma.collaboration.findMany({
    where: { status: 'completed' },
    select: { creatorId: true, completedAt: true },
    orderBy: { completedAt: 'asc' },
  })
  
  // Map of creatorId -> first completed collab date
  const firstCompletedMap = new Map<string, Date>()
  for (const collab of completedCollabs) {
    if (!firstCompletedMap.has(collab.creatorId) && collab.completedAt) {
      firstCompletedMap.set(collab.creatorId, collab.completedAt)
    }
  }
  
  console.log(`Found ${firstCompletedMap.size} creators with completed collaborations`)
  
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
  
  console.log(`Found ${creators.length} creators to process`)
  
  let updated = 0
  let errors = 0
  
  for (const creator of creators) {
    try {
      const profileCompleteness = computeProfileCompleteness(creator)
      const blockers = computeBlockers(creator)
      const hasOAuth = creator.instagramConnected || creator.tiktokConnected
      const readinessState = computeReadinessState(blockers, hasOAuth)
      const hasCompletedCollab = firstCompletedMap.has(creator.id)
      const firstCollabCompletedAt = firstCompletedMap.get(creator.id) || null
      
      const trustTier = computeTrustTier({
        instagramConnected: creator.instagramConnected,
        tiktokConnected: creator.tiktokConnected,
        profileCompleteness,
        hasCompletedCollab,
      })
      
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
      
      if (updated % 100 === 0) {
        console.log(`Processed ${updated}/${creators.length} creators...`)
      }
    } catch (error) {
      console.error(`Failed to update creator ${creator.id}:`, error)
      errors++
    }
  }
  
  console.log(`\nBackfill complete!`)
  console.log(`  Updated: ${updated}`)
  console.log(`  Errors: ${errors}`)
  
  // Print summary stats
  const stats = await prisma.creatorProfile.groupBy({
    by: ['trustTier'],
    _count: true,
  })
  
  console.log(`\nTrust tier distribution:`)
  for (const stat of stats) {
    console.log(`  ${stat.trustTier}: ${stat._count}`)
  }
  
  const readinessStats = await prisma.creatorProfile.groupBy({
    by: ['readinessState'],
    _count: true,
  })
  
  console.log(`\nReadiness state distribution:`)
  for (const stat of readinessStats) {
    console.log(`  ${stat.readinessState}: ${stat._count}`)
  }
}

// Run the backfill
backfillCreators()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
