/**
 * Feature Flags for CreatorStays Beta
 * 
 * Controls beta isolation and marketplace access.
 * 
 * Environment Variables:
 * - BETA_MODE: 'split' | 'launch' (default: 'split')
 * - INTERNAL_TEST_MODE: 'true' | 'false' (default: 'false')
 * - INTERNAL_TEST_EMAILS: comma-separated list of emails allowed to bypass beta gates
 * - ADMIN_EMAILS: comma-separated list of admin emails
 */

export type BetaMode = 'split' | 'launch'

export interface FeatureFlags {
  betaMode: BetaMode
  internalTestMode: boolean
  internalTestEmails: string[]
  adminEmails: string[]
}

/**
 * Get all feature flags from environment
 */
export function getFeatureFlags(): FeatureFlags {
  return {
    betaMode: (process.env.BETA_MODE as BetaMode) || 'split',
    internalTestMode: process.env.INTERNAL_TEST_MODE === 'true',
    internalTestEmails: (process.env.INTERNAL_TEST_EMAILS || '')
      .split(',')
      .map(e => e.trim().toLowerCase())
      .filter(Boolean),
    adminEmails: (process.env.ADMIN_EMAILS || 'terry@wolfpup.xyz')
      .split(',')
      .map(e => e.trim().toLowerCase())
      .filter(Boolean),
  }
}

/**
 * Check if we're in split beta mode (sides cannot see each other)
 */
export function isSplitBetaMode(): boolean {
  return getFeatureFlags().betaMode === 'split'
}

/**
 * Check if we're in launch mode (full marketplace enabled)
 */
export function isLaunchMode(): boolean {
  return getFeatureFlags().betaMode === 'launch'
}

/**
 * Check if a user email is an internal tester (can bypass beta gates)
 */
export function isInternalTester(email: string | null | undefined): boolean {
  if (!email) return false
  const flags = getFeatureFlags()
  return flags.internalTestMode && flags.internalTestEmails.includes(email.toLowerCase())
}

/**
 * Check if a user email is an admin
 */
export function isAdmin(email: string | null | undefined): boolean {
  if (!email) return false
  return getFeatureFlags().adminEmails.includes(email.toLowerCase())
}

/**
 * Check if a user can access marketplace features
 * (cross-side visibility, offers, messaging)
 * 
 * Returns true if:
 * - We're in launch mode, OR
 * - User is an admin, OR
 * - User is an internal tester
 */
export function canAccessMarketplace(email: string | null | undefined): boolean {
  if (isLaunchMode()) return true
  if (isAdmin(email)) return true
  if (isInternalTester(email)) return true
  return false
}

/**
 * Get a user-friendly message for why marketplace is blocked
 */
export function getMarketplaceBlockedMessage(action: string): string {
  return `${action} is not available during beta. Complete your profile and this feature will be enabled when the marketplace launches.`
}
