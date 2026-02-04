/**
 * Creator Trust System
 * 
 * Computes and manages trust tiers for creators.
 * Trust tiers affect search ranking and host confidence.
 * 
 * Tiers:
 * - NEW: Just joined, no signals
 * - VERIFIED: OAuth complete + profile >= 80% complete
 * - PROVEN: At least one completed collaboration
 */

import { prisma } from '@/lib/prisma'
import { TrustTier } from '@prisma/client'

export { TrustTier }

/**
 * Compute the trust tier for a creator based on their current state.
 * Does not persist - call updateCreatorTrust to persist.
 */
export function computeTrustTier(creator: {
  instagramConnected: boolean
  tiktokConnected: boolean
  profileCompleteness: number
  firstCollabCompletedAt: Date | null
}): TrustTier {
  // PROVEN: Has completed at least one collaboration
  if (creator.firstCollabCompletedAt) {
    return TrustTier.PROVEN
  }
  
  // VERIFIED: OAuth complete AND profile >= 80% complete
  const hasOAuth = creator.instagramConnected || creator.tiktokConnected
  const profileComplete = creator.profileCompleteness >= 0.8
  
  if (hasOAuth && profileComplete) {
    return TrustTier.VERIFIED
  }
  
  // NEW: Default
  return TrustTier.NEW
}

/**
 * Update a creator's trust tier in the database.
 * Call this after any action that might affect trust:
 * - Profile update
 * - OAuth connection
 * - Collaboration completion
 */
export async function updateCreatorTrust(creatorProfileId: string): Promise<TrustTier> {
  const creator = await prisma.creatorProfile.findUnique({
    where: { id: creatorProfileId },
    select: {
      instagramConnected: true,
      tiktokConnected: true,
      profileCompleteness: true,
      firstCollabCompletedAt: true,
    },
  })
  
  if (!creator) {
    throw new Error(`Creator profile not found: ${creatorProfileId}`)
  }
  
  const newTier = computeTrustTier(creator)
  
  await prisma.creatorProfile.update({
    where: { id: creatorProfileId },
    data: { trustTier: newTier },
  })
  
  return newTier
}

/**
 * Mark a creator as having completed their first collaboration.
 * This will trigger a trust tier upgrade to PROVEN.
 */
export async function markFirstCollabCompleted(creatorProfileId: string): Promise<void> {
  const creator = await prisma.creatorProfile.findUnique({
    where: { id: creatorProfileId },
    select: { firstCollabCompletedAt: true },
  })
  
  // Only set if not already set
  if (creator && !creator.firstCollabCompletedAt) {
    await prisma.creatorProfile.update({
      where: { id: creatorProfileId },
      data: { 
        firstCollabCompletedAt: new Date(),
        trustTier: TrustTier.PROVEN,
      },
    })
  }
}

/**
 * Mark a creator as having received their first offer.
 * Used for lifecycle tracking.
 */
export async function markFirstOfferReceived(creatorProfileId: string): Promise<void> {
  const creator = await prisma.creatorProfile.findUnique({
    where: { id: creatorProfileId },
    select: { firstOfferReceivedAt: true },
  })
  
  // Only set if not already set
  if (creator && !creator.firstOfferReceivedAt) {
    await prisma.creatorProfile.update({
      where: { id: creatorProfileId },
      data: { firstOfferReceivedAt: new Date() },
    })
  }
}

/**
 * Mark a creator as having responded to their first offer.
 * Used for lifecycle tracking.
 */
export async function markFirstOfferResponded(creatorProfileId: string): Promise<void> {
  const creator = await prisma.creatorProfile.findUnique({
    where: { id: creatorProfileId },
    select: { firstOfferRespondedAt: true },
  })
  
  // Only set if not already set
  if (creator && !creator.firstOfferRespondedAt) {
    await prisma.creatorProfile.update({
      where: { id: creatorProfileId },
      data: { firstOfferRespondedAt: new Date() },
    })
  }
}

/**
 * Get trust tier display info for UI
 */
export function getTrustTierDisplay(tier: TrustTier): {
  label: string
  description: string
  color: string
  badgeColor: string
} {
  switch (tier) {
    case TrustTier.PROVEN:
      return {
        label: 'Proven Creator',
        description: 'Successfully completed collaborations',
        color: '#28D17C',
        badgeColor: 'bg-[#28D17C] text-black',
      }
    case TrustTier.VERIFIED:
      return {
        label: 'Verified',
        description: 'Social accounts connected and verified',
        color: '#4AA3FF',
        badgeColor: 'bg-[#4AA3FF] text-black',
      }
    case TrustTier.NEW:
    default:
      return {
        label: 'New',
        description: 'Recently joined the platform',
        color: '#FFD84A',
        badgeColor: 'bg-[#FFD84A] text-black',
      }
  }
}
