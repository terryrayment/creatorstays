/**
 * Payment Calculation Utility
 * Single source of truth for all platform fee calculations
 * 
 * Business Rules:
 * - Host pays +15% surcharge on cash portion
 * - Creator receives cash minus 15% fee
 * - Platform revenue = host surcharge + creator fee
 * - If cashCents === 0, no payment is processed (stay-only deal)
 */

export type DealType = 'flat' | 'flat-with-bonus' | 'post-for-stay'

export interface PaymentBreakdown {
  // Input
  cashCents: number
  
  // Creator side
  creatorGrossCents: number    // What host intends for creator (= cashCents)
  creatorFeeCents: number      // 15% platform fee from creator
  creatorNetCents: number      // What creator actually receives
  
  // Host side
  hostFeeCents: number         // 15% platform surcharge
  hostTotalCents: number       // Total host pays (cash + surcharge)
  
  // Platform
  platformRevenueCents: number // Total platform keeps
  
  // Display helpers
  isStayOnly: boolean          // True if no cash payment
  displayMessage: string       // Human-readable summary
}

/**
 * Calculate payment breakdown for a deal
 * @param cashCents - The cash portion in cents (0 for stay-only deals)
 * @returns Complete payment breakdown
 */
export function calculatePaymentBreakdown(cashCents: number): PaymentBreakdown {
  // Validate input
  if (cashCents < 0) {
    throw new Error('cashCents must be >= 0')
  }
  
  // Round to ensure we're working with integers
  cashCents = Math.round(cashCents)
  
  // Edge case: stay-only deal (no cash)
  if (cashCents === 0) {
    return {
      cashCents: 0,
      creatorGrossCents: 0,
      creatorFeeCents: 0,
      creatorNetCents: 0,
      hostFeeCents: 0,
      hostTotalCents: 0,
      platformRevenueCents: 0,
      isStayOnly: true,
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
    creatorGrossCents,
    creatorFeeCents,
    creatorNetCents,
    hostFeeCents,
    hostTotalCents,
    platformRevenueCents,
    isStayOnly: false,
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
