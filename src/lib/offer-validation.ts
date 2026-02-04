/**
 * Offer Validation & Audit System
 * 
 * Validates offers against platform rules and maintains audit trail.
 * 
 * Rules:
 * - Minimum total value: $100 (cash + estimated stay value)
 * - Maximum deliverables: 10
 * - Expiration: 3-30 days
 */

import { prisma } from '@/lib/prisma'
import { Prisma } from '@prisma/client'

// Validation constants
export const OFFER_RULES = {
  // Minimum value rules
  MIN_TOTAL_VALUE_CENTS: 10000, // $100 minimum
  MIN_CASH_IF_NO_STAY: 5000,    // $50 cash minimum if no stay included
  
  // Deliverable limits  
  MAX_DELIVERABLES: 10,
  MIN_VALUE_PER_DELIVERABLE: 2500, // ~$25 per piece of content
  
  // Time limits
  MIN_EXPIRATION_DAYS: 3,
  MAX_EXPIRATION_DAYS: 30,
  DEFAULT_EXPIRATION_DAYS: 14,
  
  // Stay valuation (rough estimates when host doesn't provide)
  DEFAULT_STAY_VALUE_PER_NIGHT: 15000, // $150/night default
} as const

export interface OfferTerms {
  offerType: string
  cashCents: number
  stayNights?: number | null
  stayValueCents?: number | null
  deliverables: string[]
  requirements?: string | null
  trafficBonusEnabled?: boolean
  trafficBonusThreshold?: number | null
  trafficBonusCents?: number | null
  expiresAt?: Date | null
}

export interface ValidationResult {
  isValid: boolean
  errors: string[]
  totalValueCents: number
}

/**
 * Estimate the value of a stay in cents
 */
export function estimateStayValue(nights: number | null | undefined): number {
  if (!nights || nights <= 0) return 0
  return nights * OFFER_RULES.DEFAULT_STAY_VALUE_PER_NIGHT
}

/**
 * Compute total offer value (cash + stay)
 */
export function computeTotalValue(terms: OfferTerms): number {
  const cashValue = terms.cashCents || 0
  const stayValue = terms.stayValueCents || estimateStayValue(terms.stayNights)
  return cashValue + stayValue
}

/**
 * Validate offer terms against platform rules
 */
export function validateOfferTerms(terms: OfferTerms): ValidationResult {
  const errors: string[] = []
  const totalValueCents = computeTotalValue(terms)
  
  // Minimum total value
  if (totalValueCents < OFFER_RULES.MIN_TOTAL_VALUE_CENTS) {
    errors.push(`Offer value must be at least $${OFFER_RULES.MIN_TOTAL_VALUE_CENTS / 100}`)
  }
  
  // If no stay, require minimum cash
  const hasStay = terms.stayNights && terms.stayNights > 0
  if (!hasStay && terms.cashCents < OFFER_RULES.MIN_CASH_IF_NO_STAY) {
    errors.push(`Cash offers without a stay must be at least $${OFFER_RULES.MIN_CASH_IF_NO_STAY / 100}`)
  }
  
  // Deliverable limits
  if (terms.deliverables.length > OFFER_RULES.MAX_DELIVERABLES) {
    errors.push(`Maximum ${OFFER_RULES.MAX_DELIVERABLES} deliverables per offer`)
  }
  
  if (terms.deliverables.length === 0) {
    errors.push('At least one deliverable is required')
  }
  
  // Value per deliverable check (warn, don't block)
  const valuePerDeliverable = totalValueCents / Math.max(1, terms.deliverables.length)
  if (valuePerDeliverable < OFFER_RULES.MIN_VALUE_PER_DELIVERABLE && terms.deliverables.length > 1) {
    // This is a soft warning, not a hard error
    // errors.push(`Consider increasing offer value - currently ${formatCents(valuePerDeliverable)} per deliverable`)
  }
  
  // Traffic bonus validation
  if (terms.trafficBonusEnabled) {
    if (!terms.trafficBonusThreshold || terms.trafficBonusThreshold <= 0) {
      errors.push('Traffic bonus requires a click threshold')
    }
    if (!terms.trafficBonusCents || terms.trafficBonusCents <= 0) {
      errors.push('Traffic bonus requires a bonus amount')
    }
  }
  
  return {
    isValid: errors.length === 0,
    errors,
    totalValueCents,
  }
}

/**
 * Create a snapshot of offer terms for audit trail (immutable)
 */
export function createTermsSnapshot(terms: OfferTerms): object {
  return {
    offerType: terms.offerType,
    cashCents: terms.cashCents,
    stayNights: terms.stayNights,
    stayValueCents: terms.stayValueCents || estimateStayValue(terms.stayNights),
    deliverables: [...terms.deliverables], // Copy array
    requirements: terms.requirements,
    trafficBonusEnabled: terms.trafficBonusEnabled || false,
    trafficBonusThreshold: terms.trafficBonusThreshold,
    trafficBonusCents: terms.trafficBonusCents,
    totalValueCents: computeTotalValue(terms),
    snapshotAt: new Date().toISOString(),
  }
}

export interface StatusChange {
  fromStatus: string
  toStatus: string
  changedBy: 'host' | 'creator' | 'system' | 'admin'
  changedAt: string
  reason?: string
}

/**
 * Add a status change to the offer's history
 */
export async function recordOfferStatusChange(
  offerId: string,
  fromStatus: string,
  toStatus: string,
  changedBy: 'host' | 'creator' | 'system' | 'admin',
  reason?: string
): Promise<void> {
  const offer = await prisma.offer.findUnique({
    where: { id: offerId },
    select: { statusHistory: true },
  })
  
  if (!offer) {
    throw new Error(`Offer not found: ${offerId}`)
  }
  
  const history = (offer.statusHistory as unknown as StatusChange[]) || []
  
  const change: StatusChange = {
    fromStatus,
    toStatus,
    changedBy,
    changedAt: new Date().toISOString(),
    ...(reason && { reason }),
  }
  
  history.push(change)
  
  await prisma.offer.update({
    where: { id: offerId },
    data: { 
      statusHistory: history as unknown as Prisma.InputJsonValue,
      status: toStatus,
    },
  })
}

/**
 * Calculate expiration date for an offer
 */
export function calculateExpirationDate(days?: number): Date {
  const expirationDays = days || OFFER_RULES.DEFAULT_EXPIRATION_DAYS
  const clampedDays = Math.max(
    OFFER_RULES.MIN_EXPIRATION_DAYS,
    Math.min(expirationDays, OFFER_RULES.MAX_EXPIRATION_DAYS)
  )
  
  const expiresAt = new Date()
  expiresAt.setDate(expiresAt.getDate() + clampedDays)
  return expiresAt
}

/**
 * Prepare offer data for creation with validation and snapshot
 */
export function prepareOfferForCreation(terms: OfferTerms): {
  isValid: boolean
  errors: string[]
  data: {
    originalTermsSnapshot: object
    totalValueCents: number
    isValid: boolean
    validationErrors: string[]
    statusHistory: StatusChange[]
    expiresAt: Date
  }
} {
  const validation = validateOfferTerms(terms)
  const snapshot = createTermsSnapshot(terms)
  
  return {
    isValid: validation.isValid,
    errors: validation.errors,
    data: {
      originalTermsSnapshot: snapshot,
      totalValueCents: validation.totalValueCents,
      isValid: validation.isValid,
      validationErrors: validation.errors,
      statusHistory: [],
      expiresAt: terms.expiresAt || calculateExpirationDate(),
    },
  }
}

/**
 * Check if an offer has expired
 */
export function isOfferExpired(expiresAt: Date | null): boolean {
  if (!expiresAt) return false
  return new Date() > new Date(expiresAt)
}

/**
 * Get all valid offer statuses
 */
export const OFFER_STATUSES = {
  DRAFT: 'draft',
  PENDING: 'pending',
  COUNTERED: 'countered',
  ACCEPTED: 'accepted',
  DECLINED: 'declined',
  WITHDRAWN: 'withdrawn',
  EXPIRED: 'expired',
} as const

export type OfferStatus = typeof OFFER_STATUSES[keyof typeof OFFER_STATUSES]

/**
 * Valid status transitions
 */
export const VALID_TRANSITIONS: Record<string, string[]> = {
  'draft': ['pending', 'withdrawn'],
  'pending': ['accepted', 'declined', 'countered', 'withdrawn', 'expired'],
  'countered': ['accepted', 'declined', 'countered', 'withdrawn', 'expired'],
  'accepted': [], // Terminal
  'declined': [], // Terminal
  'withdrawn': [], // Terminal
  'expired': [], // Terminal
}

/**
 * Check if a status transition is valid
 */
export function isValidTransition(fromStatus: string, toStatus: string): boolean {
  const allowed = VALID_TRANSITIONS[fromStatus] || []
  return allowed.includes(toStatus)
}
