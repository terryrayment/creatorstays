import { createHash, randomUUID } from 'crypto'

// Cookie names
export const VISITOR_COOKIE = 'cs_vid'
export const ATTRIBUTION_COOKIE = 'cs_ref'

// Default attribution window
export const DEFAULT_ATTRIBUTION_WINDOW_DAYS = 30

/**
 * Generate a unique visitor ID
 */
export function generateVisitorId(): string {
  return randomUUID().replace(/-/g, '')
}

/**
 * Hash a string (for IP/UA privacy)
 */
export function hashString(input: string): string {
  return createHash('sha256').update(input).digest('hex').substring(0, 32)
}

/**
 * Hash IP address for privacy-safe storage
 */
export function hashIp(ip: string | null): string | null {
  if (!ip) return null
  // Add salt to prevent rainbow table attacks
  const salt = process.env.IP_HASH_SALT || 'cs-default-salt'
  return hashString(`${ip}:${salt}`)
}

/**
 * Hash User-Agent for fingerprinting
 */
export function hashUserAgent(ua: string | null): string | null {
  if (!ua) return null
  return hashString(ua)
}

/**
 * Truncate referer to reasonable length
 */
export function truncateReferer(referer: string | null, maxLength = 500): string | null {
  if (!referer) return null
  return referer.substring(0, maxLength)
}

/**
 * Parse visitor ID from cookie value
 */
export function parseVisitorId(cookieValue: string | undefined): string | null {
  if (!cookieValue || cookieValue.length < 10) return null
  return cookieValue
}

/**
 * Calculate cookie expiry date
 */
export function getCookieExpiry(days: number): Date {
  const date = new Date()
  date.setDate(date.getDate() + days)
  return date
}

/**
 * Get client IP from request headers (handles proxies)
 */
export function getClientIp(headers: Headers): string | null {
  // Check common proxy headers
  const forwarded = headers.get('x-forwarded-for')
  if (forwarded) {
    // Take first IP if multiple
    return forwarded.split(',')[0].trim()
  }
  
  const realIp = headers.get('x-real-ip')
  if (realIp) return realIp
  
  // Vercel-specific
  const vercelIp = headers.get('x-vercel-forwarded-for')
  if (vercelIp) return vercelIp.split(',')[0].trim()
  
  return null
}

/**
 * Validate affiliate link token format
 */
export function isValidToken(token: string): boolean {
  // Basic validation: alphanumeric, reasonable length
  return /^[a-zA-Z0-9_-]{8,50}$/.test(token)
}

/**
 * Build cookie options for visitor cookie
 */
export function getVisitorCookieOptions(days: number = DEFAULT_ATTRIBUTION_WINDOW_DAYS) {
  return {
    httpOnly: false, // Needs to be readable for some client analytics
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax' as const,
    maxAge: days * 24 * 60 * 60,
    path: '/',
  }
}

/**
 * Build cookie options for attribution cookie
 */
export function getAttributionCookieOptions(days: number = DEFAULT_ATTRIBUTION_WINDOW_DAYS) {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax' as const,
    maxAge: days * 24 * 60 * 60,
    path: '/',
  }
}
