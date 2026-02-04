/**
 * Creator Readiness System
 * 
 * Computes and manages readiness state for creators.
 * Readiness determines if a creator can receive offers.
 * 
 * States:
 * - INCOMPLETE: Missing critical fields
 * - PENDING_OAUTH: Profile done, OAuth not complete
 * - READY: Fully set up, can receive offers
 * 
 * Blockers are specific, actionable items that prevent readiness.
 */

import { prisma } from '@/lib/prisma'
import { ReadinessState } from '@prisma/client'
import { updateCreatorTrust } from '@/lib/trust'

export { ReadinessState }

// Fields required for a creator to be READY
const REQUIRED_FIELDS = {
  displayName: 'Display name is required',
  handle: 'Handle is required',
  bio: 'Bio is required',
  niches: 'At least one niche is required',
  deliverables: 'Deliverables are required',
  minimumFlatFee: 'Minimum rate is required',
} as const

// Blocker codes and their display messages
export const BLOCKER_MESSAGES: Record<string, string> = {
  'missing_display_name': 'Add your display name',
  'missing_handle': 'Set your handle',
  'missing_bio': 'Write a bio',
  'missing_niches': 'Select at least one niche',
  'missing_deliverables': 'Define your deliverables',
  'missing_minimum_rate': 'Set your minimum rate',
  'missing_avatar': 'Upload a profile photo',
  'instagram_not_connected': 'Connect your Instagram account',
  'tiktok_not_connected': 'Connect your TikTok account',
  'no_social_connected': 'Connect Instagram or TikTok',
}

interface CreatorForReadiness {
  displayName: string | null
  handle: string | null
  bio: string | null
  niches: string[]
  deliverables: string[]
  minimumFlatFee: number | null
  avatarUrl: string | null
  instagramConnected: boolean
  tiktokConnected: boolean
}

/**
 * Compute blockers for a creator profile
 * Returns an array of blocker codes
 */
export function computeBlockers(creator: CreatorForReadiness): string[] {
  const blockers: string[] = []
  
  // Check required fields
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
  
  // Avatar is recommended but not required
  // if (!creator.avatarUrl) {
  //   blockers.push('missing_avatar')
  // }
  
  // OAuth is required for READY state
  if (!creator.instagramConnected && !creator.tiktokConnected) {
    blockers.push('no_social_connected')
  }
  
  return blockers
}

/**
 * Compute profile completeness as a float from 0.0 to 1.0
 */
export function computeProfileCompleteness(creator: CreatorForReadiness): number {
  const fields = [
    { filled: !!creator.displayName?.trim(), weight: 1 },
    { filled: !!creator.handle?.trim(), weight: 1 },
    { filled: !!creator.bio?.trim(), weight: 1 },
    { filled: creator.niches?.length > 0, weight: 1 },
    { filled: creator.deliverables?.length > 0, weight: 1 },
    { filled: !!creator.minimumFlatFee && creator.minimumFlatFee > 0, weight: 1 },
    { filled: !!creator.avatarUrl, weight: 0.5 }, // Optional but nice
    { filled: creator.instagramConnected || creator.tiktokConnected, weight: 1.5 }, // OAuth is important
  ]
  
  const totalWeight = fields.reduce((sum, f) => sum + f.weight, 0)
  const filledWeight = fields.reduce((sum, f) => sum + (f.filled ? f.weight : 0), 0)
  
  return Math.min(1, filledWeight / totalWeight)
}

/**
 * Compute the readiness state based on blockers and OAuth
 */
export function computeReadinessState(
  blockers: string[],
  hasOAuth: boolean
): ReadinessState {
  // Filter out OAuth blocker for profile completeness check
  const profileBlockers = blockers.filter(b => b !== 'no_social_connected')
  
  if (profileBlockers.length === 0 && hasOAuth) {
    return ReadinessState.READY
  }
  
  if (profileBlockers.length === 0 && !hasOAuth) {
    return ReadinessState.PENDING_OAUTH
  }
  
  return ReadinessState.INCOMPLETE
}

/**
 * Full readiness computation result
 */
export interface ReadinessResult {
  state: ReadinessState
  blockers: string[]
  profileCompleteness: number
}

/**
 * Compute full readiness for a creator
 */
export function computeReadiness(creator: CreatorForReadiness): ReadinessResult {
  const blockers = computeBlockers(creator)
  const hasOAuth = creator.instagramConnected || creator.tiktokConnected
  const state = computeReadinessState(blockers, hasOAuth)
  const profileCompleteness = computeProfileCompleteness(creator)
  
  return {
    state,
    blockers,
    profileCompleteness,
  }
}

/**
 * Update a creator's readiness state in the database.
 * Also updates trust tier since they share dependencies.
 * 
 * Call this after any profile update.
 */
export async function updateCreatorReadiness(creatorProfileId: string): Promise<ReadinessResult> {
  const creator = await prisma.creatorProfile.findUnique({
    where: { id: creatorProfileId },
    select: {
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
  
  if (!creator) {
    throw new Error(`Creator profile not found: ${creatorProfileId}`)
  }
  
  const result = computeReadiness(creator)
  
  await prisma.creatorProfile.update({
    where: { id: creatorProfileId },
    data: {
      readinessState: result.state,
      readinessBlockers: result.blockers,
      profileCompleteness: result.profileCompleteness,
    },
  })
  
  // Also update trust tier since OAuth affects both
  await updateCreatorTrust(creatorProfileId)
  
  return result
}

/**
 * Get human-readable blocker messages for display
 */
export function getBlockerMessages(blockers: string[]): string[] {
  return blockers.map(code => BLOCKER_MESSAGES[code] || code)
}

/**
 * Check if a creator is ready to receive offers
 */
export async function isCreatorReady(creatorProfileId: string): Promise<boolean> {
  const creator = await prisma.creatorProfile.findUnique({
    where: { id: creatorProfileId },
    select: { readinessState: true },
  })
  
  return creator?.readinessState === ReadinessState.READY
}

/**
 * Get readiness display info for UI
 */
export function getReadinessDisplay(state: ReadinessState): {
  label: string
  description: string
  color: string
  isReady: boolean
} {
  switch (state) {
    case ReadinessState.READY:
      return {
        label: 'Ready',
        description: 'Your profile is complete and you can receive offers',
        color: '#28D17C',
        isReady: true,
      }
    case ReadinessState.PENDING_OAUTH:
      return {
        label: 'Almost Ready',
        description: 'Connect your social accounts to start receiving offers',
        color: '#FFD84A',
        isReady: false,
      }
    case ReadinessState.INCOMPLETE:
    default:
      return {
        label: 'Incomplete',
        description: 'Complete your profile to start receiving offers',
        color: '#FF6B6B',
        isReady: false,
      }
  }
}
