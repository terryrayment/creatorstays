/**
 * iCal Parser for CreatorStays
 * Parses iCal feeds from Airbnb, VRBO, Booking.com, etc.
 * Extracts blocked/booked dates for availability display
 * 
 * IMPORTANT: This uses calendar-date.ts helpers for all date operations
 * to avoid timezone drift issues.
 */

import {
  parseICalDateToLocalYMD,
  ymdToLocalDate,
  dateToYMD,
  getTodayYMD,
  iterateDaysExclusive,
  compareYMD,
  isValidYMD,
  formatYMDShort,
} from './calendar-date'

// =============================================================================
// Types
// =============================================================================

export interface BlockedPeriod {
  start: string       // YYYY-MM-DD (inclusive)
  end: string         // YYYY-MM-DD (exclusive, per iCal semantics)
  summary?: string    // Event summary (e.g., "Reserved", "Airbnb (Not available)")
  uid?: string        // VEVENT UID for traceability
  source: 'ical' | 'manual'  // Where this block came from
}

export interface CalendarSyncResult {
  success: boolean
  blockedDates: BlockedPeriod[]
  error?: string
  eventCount?: number
  rawEventCount?: number
  notModified?: boolean      // True if 304 response (no changes)
  etag?: string              // ETag from response for caching
  lastModified?: string      // Last-Modified from response
  debug?: {
    fetchedAt: string
    icalBytes: number
    eventsFound: number
    eventsParsed: number
    eventsFiltered: number
    filterReason?: Record<string, number>
    httpStatus?: number
  }
}

export interface FetchOptions {
  etag?: string | null       // Send If-None-Match
  lastModified?: string | null  // Send If-Modified-Since
}

// =============================================================================
// Main Entry Points
// =============================================================================

/**
 * Fetch and parse an iCal feed with conditional request support
 */
export async function fetchAndParseICal(
  icalUrl: string,
  options?: FetchOptions
): Promise<CalendarSyncResult> {
  const debug: CalendarSyncResult['debug'] = {
    fetchedAt: new Date().toISOString(),
    icalBytes: 0,
    eventsFound: 0,
    eventsParsed: 0,
    eventsFiltered: 0,
    filterReason: {},
  }
  
  try {
    // Validate URL
    if (!icalUrl || !icalUrl.startsWith('http')) {
      return { success: false, blockedDates: [], error: 'Invalid iCal URL', debug }
    }

    // Build headers with conditional request support
    const headers: Record<string, string> = {
      'User-Agent': 'CreatorStays Calendar Sync/1.0',
      'Accept': 'text/calendar, application/calendar+json, */*',
    }
    
    if (options?.etag) {
      headers['If-None-Match'] = options.etag
    }
    if (options?.lastModified) {
      headers['If-Modified-Since'] = options.lastModified
    }

    // Fetch the iCal data
    console.log('[iCal] Fetching:', icalUrl.substring(0, 60) + '...')
    if (options?.etag || options?.lastModified) {
      console.log('[iCal] Conditional request - ETag:', options.etag?.substring(0, 20), 'LastMod:', options.lastModified)
    }
    
    const response = await fetch(icalUrl, {
      headers,
      signal: AbortSignal.timeout(30000),
    })

    debug.httpStatus = response.status
    
    // Handle 304 Not Modified
    if (response.status === 304) {
      console.log('[iCal] 304 Not Modified - calendar unchanged')
      return {
        success: true,
        blockedDates: [],  // Caller should keep existing data
        notModified: true,
        etag: response.headers.get('ETag') || options?.etag || undefined,
        lastModified: response.headers.get('Last-Modified') || options?.lastModified || undefined,
        debug,
      }
    }

    if (!response.ok) {
      return { 
        success: false, 
        blockedDates: [], 
        error: `Failed to fetch calendar: ${response.status} ${response.statusText}`,
        debug,
      }
    }

    // Extract caching headers
    const etag = response.headers.get('ETag') || undefined
    const lastModified = response.headers.get('Last-Modified') || undefined

    const icalText = await response.text()
    debug.icalBytes = icalText.length
    console.log('[iCal] Received', icalText.length, 'bytes')
    
    // Parse the iCal data
    const parseResult = parseICalText(icalText)
    
    debug.eventsFound = parseResult.rawEventCount
    debug.eventsParsed = parseResult.blockedDates.length
    debug.eventsFiltered = parseResult.filteredCount
    debug.filterReason = parseResult.filterReasons
    
    console.log('[iCal] Parsed', parseResult.rawEventCount, 'events,', parseResult.blockedDates.length, 'blocked periods')
    
    return {
      success: true,
      blockedDates: parseResult.blockedDates,
      eventCount: parseResult.blockedDates.length,
      rawEventCount: parseResult.rawEventCount,
      etag,
      lastModified,
      debug,
    }
  } catch (error) {
    console.error('[iCal] Fetch error:', error)
    return {
      success: false,
      blockedDates: [],
      error: error instanceof Error ? error.message : 'Unknown error fetching calendar',
      debug,
    }
  }
}

/**
 * Parse iCal text into blocked periods (exported for testing)
 */
export function parseICalText(icalText: string): { 
  blockedDates: BlockedPeriod[]
  rawEventCount: number
  filteredCount: number
  filterReasons: Record<string, number>
} {
  const blockedDates: BlockedPeriod[] = []
  const filterReasons: Record<string, number> = {}
  let filteredCount = 0
  
  // Split into events
  const events = icalText.split('BEGIN:VEVENT')
  const rawEventCount = events.length - 1
  
  console.log('[iCal] Found', rawEventCount, 'VEVENT blocks')
  
  const todayYMD = getTodayYMD()
  
  for (let i = 1; i < events.length; i++) {
    const eventText = events[i]
    const endIdx = eventText.indexOf('END:VEVENT')
    const eventContent = endIdx > -1 ? eventText.substring(0, endIdx) : eventText
    
    // Extract fields
    const dtstart = extractICalField(eventContent, 'DTSTART')
    const dtend = extractICalField(eventContent, 'DTEND')
    const summary = extractICalField(eventContent, 'SUMMARY')
    const uid = extractICalField(eventContent, 'UID')
    
    // Parse dates using our robust helpers
    const startParsed = parseICalDateToLocalYMD(dtstart)
    const endParsed = dtend ? parseICalDateToLocalYMD(dtend) : null
    
    if (!startParsed) {
      filteredCount++
      filterReasons['invalid_start'] = (filterReasons['invalid_start'] || 0) + 1
      console.log('[iCal] Skipped: invalid DTSTART:', dtstart)
      continue
    }
    
    const startYMD = startParsed.ymd
    // If no DTEND, assume single day event (end = start + 1 day)
    const endYMD = endParsed?.ymd || addOneDayYMD(startYMD)
    
    if (!endYMD) {
      filteredCount++
      filterReasons['invalid_end'] = (filterReasons['invalid_end'] || 0) + 1
      continue
    }
    
    // Validate: end must be after start
    if (compareYMD(endYMD, startYMD) <= 0) {
      filteredCount++
      filterReasons['end_before_start'] = (filterReasons['end_before_start'] || 0) + 1
      console.log('[iCal] Skipped: end before start:', startYMD, '->', endYMD)
      continue
    }
    
    // Filter: only include if end date is today or in the future
    // (event is still relevant if it ends today or later)
    if (compareYMD(endYMD, todayYMD) < 0) {
      filteredCount++
      filterReasons['past_event'] = (filterReasons['past_event'] || 0) + 1
      console.log('[iCal] Skipped past event:', startYMD, '->', endYMD)
      continue
    }
    
    blockedDates.push({
      start: startYMD,
      end: endYMD,
      summary: summary || undefined,
      uid: uid || undefined,
      source: 'ical',
    })
    
    console.log('[iCal] Event:', startYMD, 'to', endYMD, summary ? `(${summary})` : '', uid ? `[${uid.substring(0, 20)}...]` : '')
  }
  
  // Sort by start date
  blockedDates.sort((a, b) => compareYMD(a.start, b.start))
  
  return { blockedDates, rawEventCount, filteredCount, filterReasons }
}

// =============================================================================
// Field Extraction
// =============================================================================

/**
 * Extract a field from iCal event text
 * Handles both simple fields (DTSTART:20240115) and parameterized fields (DTSTART;VALUE=DATE:20240115)
 */
function extractICalField(eventText: string, fieldName: string): string | null {
  // Try exact match first: FIELDNAME:value
  const simpleRegex = new RegExp(`^${fieldName}:(.+)$`, 'mi')
  const simpleMatch = eventText.match(simpleRegex)
  if (simpleMatch) {
    return simpleMatch[1].trim()
  }
  
  // Try parameterized match: FIELDNAME;params:value
  const paramRegex = new RegExp(`^${fieldName};[^:]*:(.+)$`, 'mi')
  const paramMatch = eventText.match(paramRegex)
  if (paramMatch) {
    return paramMatch[1].trim()
  }
  
  return null
}

/**
 * Add one day to a YMD string (for single-day events without DTEND)
 */
function addOneDayYMD(ymd: string): string | null {
  const date = ymdToLocalDate(ymd)
  if (!date) return null
  date.setDate(date.getDate() + 1)
  return dateToYMD(date)
}

// =============================================================================
// Merging and Combining
// =============================================================================

/**
 * Merge overlapping or contiguous blocked periods
 * Only merges when periods are strictly adjacent (next.start === current.end)
 * Preserves "Reserved" label over "Not available" when merging
 */
export function mergeOverlappingPeriods(periods: BlockedPeriod[]): BlockedPeriod[] {
  if (periods.length <= 1) return periods
  
  // Sort by start date
  const sorted = [...periods].sort((a, b) => compareYMD(a.start, b.start))
  
  const merged: BlockedPeriod[] = []
  let current = { ...sorted[0] }
  
  for (let i = 1; i < sorted.length; i++) {
    const next = sorted[i]
    
    // Merge if contiguous or overlapping: next.start <= current.end
    if (compareYMD(next.start, current.end) <= 0) {
      // Extend end if next ends later
      if (compareYMD(next.end, current.end) > 0) {
        current.end = next.end
      }
      // Preserve "Reserved" label over "Not available"
      if (next.summary?.includes('Reserved')) {
        current.summary = next.summary
      }
    } else {
      // No overlap, save current and start new
      merged.push(current)
      current = { ...next }
    }
  }
  
  merged.push(current)
  return merged
}

/**
 * Merge iCal blocks with manual blocks
 * Returns both individual sources and merged result
 */
export function mergeAllBlocks(
  icalBlocks: BlockedPeriod[],
  manualBlocks: { startDate: string; endDate: string; note?: string | null }[]
): {
  blockedDatesFromIcal: BlockedPeriod[]
  blockedDatesManual: BlockedPeriod[]
  blockedDatesMerged: BlockedPeriod[]
} {
  // Convert manual blocks to BlockedPeriod format
  const manualAsPeriods: BlockedPeriod[] = manualBlocks.map(b => ({
    start: b.startDate,
    end: b.endDate,
    summary: b.note || 'Manual block',
    source: 'manual' as const,
  }))
  
  // Combine and merge
  const allBlocks = [...icalBlocks, ...manualAsPeriods]
  const merged = mergeOverlappingPeriods(allBlocks)
  
  return {
    blockedDatesFromIcal: icalBlocks,
    blockedDatesManual: manualAsPeriods,
    blockedDatesMerged: merged,
  }
}

// =============================================================================
// Query Helpers
// =============================================================================

/**
 * Check if a specific date (YMD) is blocked
 */
export function isDateBlocked(ymd: string, blockedDates: BlockedPeriod[]): boolean {
  for (const period of blockedDates) {
    if (ymd >= period.start && ymd < period.end) {
      return true
    }
  }
  return false
}

/**
 * Find why a date is blocked
 * Returns the blocking period(s) or empty array
 */
export function findBlockingPeriods(ymd: string, blockedDates: BlockedPeriod[]): BlockedPeriod[] {
  return blockedDates.filter(period => ymd >= period.start && ymd < period.end)
}

/**
 * Get all blocked days as individual YMDs (for calendar display)
 * Uses iterateDaysExclusive to avoid timezone issues
 */
export function getBlockedDays(blockedDates: BlockedPeriod[]): Set<string> {
  const allDays = new Set<string>()
  
  for (const period of blockedDates) {
    const days = iterateDaysExclusive(period.start, period.end)
    days.forEach(d => allDays.add(d))
  }
  
  return allDays
}

/**
 * Get blocked days with their source info (for "why blocked?" feature)
 */
export function getBlockedDaysWithInfo(blockedDates: BlockedPeriod[]): Map<string, BlockedPeriod[]> {
  const dayInfo = new Map<string, BlockedPeriod[]>()
  
  for (const period of blockedDates) {
    const days = iterateDaysExclusive(period.start, period.end)
    days.forEach(d => {
      const existing = dayInfo.get(d) || []
      existing.push(period)
      dayInfo.set(d, existing)
    })
  }
  
  return dayInfo
}

// =============================================================================
// Available Periods
// =============================================================================

/**
 * Get available date ranges within the next N months
 */
export function getAvailablePeriods(
  blockedDates: BlockedPeriod[], 
  monthsAhead: number = 3
): { start: string; end: string }[] {
  const available: { start: string; end: string }[] = []
  
  const todayYMD = getTodayYMD()
  const todayDate = ymdToLocalDate(todayYMD)
  if (!todayDate) return available
  
  todayDate.setMonth(todayDate.getMonth() + monthsAhead)
  const endYMD = dateToYMD(todayDate)
  
  let currentStart = todayYMD
  
  // Sort blocked dates by start
  const sortedBlocked = [...blockedDates].sort((a, b) => compareYMD(a.start, b.start))
  
  for (const blocked of sortedBlocked) {
    // If there's a gap before this blocked period
    if (compareYMD(blocked.start, currentStart) > 0) {
      available.push({
        start: currentStart,
        end: blocked.start,
      })
    }
    
    // Move current start to after this blocked period
    if (compareYMD(blocked.end, currentStart) > 0) {
      currentStart = blocked.end
    }
  }
  
  // Add any remaining time after last blocked period
  if (compareYMD(currentStart, endYMD) < 0) {
    available.push({
      start: currentStart,
      end: endYMD,
    })
  }
  
  return available
}

/**
 * Format available periods for display
 */
export function formatAvailablePeriods(periods: { start: string; end: string }[]): string[] {
  return periods.map(period => {
    const startDate = ymdToLocalDate(period.start)
    const endDate = ymdToLocalDate(period.end)
    
    if (!startDate || !endDate) return `${period.start} - ${period.end}`
    
    const formatOptions: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric' }
    
    if (startDate.getMonth() === endDate.getMonth()) {
      return `${startDate.toLocaleDateString('en-US', formatOptions)} - ${endDate.getDate()}`
    }
    
    return `${startDate.toLocaleDateString('en-US', formatOptions)} - ${endDate.toLocaleDateString('en-US', formatOptions)}`
  })
}
