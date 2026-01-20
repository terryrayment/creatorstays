/**
 * Payment Calculation Utility
 * Single source of truth for all platform fee calculations
 * 
 * Business Rules:
 * - For paid deals: Host pays +15% surcharge on cash portion
 * - For paid deals: Creator receives cash minus 15% fee
 * - For post-for-stay: Host pays flat $99 platform fee
 * - Platform revenue = host surcharge + creator fee (or $99 for post-for-stay)
 */

export type DealType = 'flat' | 'flat-with-bonus' | 'post-for-stay'

// Post-for-stay platform fee in cents
export const POST_FOR_STAY_FEE_CENTS = 9900 // $99

export interface PaymentBreakdown {
  // Input
  cashCents: number
  dealType: DealType
  
  // Creator side
  creatorGrossCents: number    // What host intends for creator (= cashCents)
  creatorFeeCents: number      // 15% platform fee from creator
  creatorNetCents: number      // What creator actually receives
  
  // Host side
  hostFeeCents: number         // Platform fee (15% for cash deals, $99 for post-for-stay)
  hostTotalCents: number       // Total host pays (cash + fee)
  
  // Platform
  platformRevenueCents: number // Total platform keeps
  
  // Display helpers
  isStayOnly: boolean          // True if no cash payment
  isPostForStay: boolean       // True if post-for-stay deal
  displayMessage: string       // Human-readable summary
}

/**
 * Calculate payment breakdown for a deal
 * @param cashCents - The cash portion in cents (0 for stay-only deals)
 * @param dealType - The type of deal
 * @returns Complete payment breakdown
 */
export function calculatePaymentBreakdown(cashCents: number, dealType: DealType = 'flat'): PaymentBreakdown {
  // Validate input
  if (cashCents < 0) {
    throw new Error('cashCents must be >= 0')
  }
  
  // Round to ensure we're working with integers
  cashCents = Math.round(cashCents)
  
  const isPostForStay = dealType === 'post-for-stay'
  
  // Post-for-stay deal: flat $99 fee, no cash payment to creator
  if (isPostForStay) {
    return {
      cashCents: 0,
      dealType,
      creatorGrossCents: 0,
      creatorFeeCents: 0,
      creatorNetCents: 0,
      hostFeeCents: POST_FOR_STAY_FEE_CENTS,
      hostTotalCents: POST_FOR_STAY_FEE_CENTS,
      platformRevenueCents: POST_FOR_STAY_FEE_CENTS,
      isStayOnly: true,
      isPostForStay: true,
      displayMessage: 'Post-for-stay: Host pays $99 platform fee',
    }
  }
  
  // Edge case: stay-only deal (no cash, not post-for-stay)
  if (cashCents === 0) {
    return {
      cashCents: 0,
      dealType,
      creatorGrossCents: 0,
      creatorFeeCents: 0,
      creatorNetCents: 0,
      hostFeeCents: 0,
      hostTotalCents: 0,
      platformRevenueCents: 0,
      isStayOnly: true,
      isPostForStay: false,
      displayMessage: 'No cash payment (stay-only)',
    }
  }
  
  // Standard calculation with 15% fees on both sides
  const creatorGrossCents = cashCents
  const hostFeeCents = Math.round(cashCents * 0.15)
  const hostTotalCents = cashCents + hostFeeCents
  const creatorFeeCents = Math.round(cashCents * 0.15)
  const creatorNetCents = cashCents - creatorFeeCents
  const platformRevenueCents = hostFeeCents + creatorFeeCents
  
  return {
    cashCents,
    dealType,
    creatorGrossCents,
    creatorFeeCents,
    creatorNetCents,
    hostFeeCents,
    hostTotalCents,
    platformRevenueCents,
    isStayOnly: false,
    isPostForStay: false,
    displayMessage: `Host pays $${(hostTotalCents / 100).toFixed(2)}, Creator receives $${(creatorNetCents / 100).toFixed(2)}`,
  }
}

/**
 * Format cents to dollars string
 */
export function centsToDollars(cents: number): string {
  return `$${(cents / 100).toFixed(2)}`
}

/**
 * Validate deal type
 */
export function isValidDealType(type: string): type is DealType {
  return ['flat', 'flat-with-bonus', 'post-for-stay'].includes(type)
}
