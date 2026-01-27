/**
 * iCal Parser for CreatorStays
 * Parses iCal feeds from Airbnb, VRBO, Booking.com, etc.
 * Extracts blocked/booked dates for availability display
 */

export interface BlockedPeriod {
  start: string  // ISO date string (YYYY-MM-DD)
  end: string    // ISO date string (YYYY-MM-DD)
  summary?: string
}

export interface CalendarSyncResult {
  success: boolean
  blockedDates: BlockedPeriod[]
  error?: string
  eventCount?: number
  rawEventCount?: number
}

/**
 * Fetch and parse an iCal feed
 */
export async function fetchAndParseICal(icalUrl: string): Promise<CalendarSyncResult> {
  try {
    // Validate URL
    if (!icalUrl || !icalUrl.startsWith('http')) {
      return { success: false, blockedDates: [], error: 'Invalid iCal URL' }
    }

    // Fetch the iCal data
    console.log('[iCal] Fetching:', icalUrl.substring(0, 50) + '...')
    const response = await fetch(icalUrl, {
      headers: {
        'User-Agent': 'CreatorStays Calendar Sync/1.0',
        'Accept': 'text/calendar, application/calendar+json, */*',
      },
      // 30 second timeout
      signal: AbortSignal.timeout(30000),
    })

    if (!response.ok) {
      return { 
        success: false, 
        blockedDates: [], 
        error: `Failed to fetch calendar: ${response.status} ${response.statusText}` 
      }
    }

    const icalText = await response.text()
    console.log('[iCal] Received', icalText.length, 'bytes')
    
    // Parse the iCal data
    const { blockedDates, rawEventCount } = parseICalText(icalText)
    
    console.log('[iCal] Parsed', rawEventCount, 'events,', blockedDates.length, 'blocked periods')
    
    return {
      success: true,
      blockedDates,
      eventCount: blockedDates.length,
      rawEventCount,
    }
  } catch (error) {
    console.error('[iCal] Fetch error:', error)
    return {
      success: false,
      blockedDates: [],
      error: error instanceof Error ? error.message : 'Unknown error fetching calendar',
    }
  }
}

/**
 * Parse iCal text into blocked periods
 * iCal format reference: https://icalendar.org/iCalendar-RFC-5545/
 */
function parseICalText(icalText: string): { blockedDates: BlockedPeriod[], rawEventCount: number } {
  const blockedDates: BlockedPeriod[] = []
  
  // Split into events
  const events = icalText.split('BEGIN:VEVENT')
  const rawEventCount = events.length - 1
  
  console.log('[iCal] Found', rawEventCount, 'VEVENT blocks')
  
  for (let i = 1; i < events.length; i++) {
    const eventText = events[i]
    const endIdx = eventText.indexOf('END:VEVENT')
    const eventContent = endIdx > -1 ? eventText.substring(0, endIdx) : eventText
    
    // Extract DTSTART
    const dtstart = extractICalField(eventContent, 'DTSTART')
    // Extract DTEND
    const dtend = extractICalField(eventContent, 'DTEND')
    // Extract SUMMARY (optional)
    const summary = extractICalField(eventContent, 'SUMMARY')
    
    if (dtstart) {
      const startDate = parseICalDate(dtstart)
      // If no DTEND, assume single day event
      const endDate = dtend ? parseICalDate(dtend) : startDate
      
      if (startDate && endDate) {
        // Include all dates from today onwards
        // Parse dates without timezone issues
        const today = new Date()
        today.setHours(0, 0, 0, 0)
        const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`
        
        // Compare as strings to avoid timezone issues
        // Include if end date is today or in the future
        if (endDate >= todayStr) {
          blockedDates.push({
            start: startDate,
            end: endDate,
            summary: summary || undefined,
          })
          console.log('[iCal] Event:', startDate, 'to', endDate, summary ? `(${summary})` : '')
        } else {
          console.log('[iCal] Skipped past event:', startDate, 'to', endDate)
        }
      }
    }
  }
  
  // Sort by start date
  blockedDates.sort((a, b) => a.start.localeCompare(b.start))
  
  // DON'T merge - keep individual events separate for accurate display
  // Merging was causing issues with adjacent bookings
  return { blockedDates, rawEventCount }
}

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
 * Parse iCal date format into ISO date string
 * Handles:
 * - 20240115 (DATE format)
 * - 20240115T120000 (local datetime)
 * - 20240115T120000Z (UTC datetime)
 */
function parseICalDate(dateStr: string): string | null {
  if (!dateStr) return null
  
  // Remove any line continuations
  dateStr = dateStr.replace(/\r?\n\s/g, '')
  
  // Basic date format: YYYYMMDD
  if (/^\d{8}$/.test(dateStr)) {
    const year = dateStr.substring(0, 4)
    const month = dateStr.substring(4, 6)
    const day = dateStr.substring(6, 8)
    return `${year}-${month}-${day}`
  }
  
  // DateTime format: YYYYMMDDTHHmmss or YYYYMMDDTHHmmssZ
  if (/^\d{8}T\d{6}Z?$/.test(dateStr)) {
    const year = dateStr.substring(0, 4)
    const month = dateStr.substring(4, 6)
    const day = dateStr.substring(6, 8)
    return `${year}-${month}-${day}`
  }
  
  // Try standard Date parsing as fallback
  try {
    const date = new Date(dateStr)
    if (!isNaN(date.getTime())) {
      return date.toISOString().split('T')[0]
    }
  } catch {
    // Ignore parsing errors
  }
  
  return null
}

/**
 * Merge overlapping or adjacent blocked periods (optional, not used by default)
 */
export function mergeOverlappingPeriods(periods: BlockedPeriod[]): BlockedPeriod[] {
  if (periods.length <= 1) return periods
  
  const merged: BlockedPeriod[] = []
  let current = { ...periods[0] }
  
  for (let i = 1; i < periods.length; i++) {
    const next = periods[i]
    
    // Check if next period overlaps or is adjacent to current
    const currentEnd = new Date(current.end)
    const nextStart = new Date(next.start)
    
    // Add 1 day buffer for adjacency
    currentEnd.setDate(currentEnd.getDate() + 1)
    
    if (nextStart <= currentEnd) {
      // Merge: extend current end if next ends later
      if (next.end > current.end) {
        current.end = next.end
      }
    } else {
      // No overlap, save current and start new
      merged.push(current)
      current = { ...next }
    }
  }
  
  // Don't forget the last one
  merged.push(current)
  
  return merged
}

/**
 * Check if a specific date is blocked
 */
export function isDateBlocked(date: Date | string, blockedDates: BlockedPeriod[]): boolean {
  const checkDate = typeof date === 'string' ? date : date.toISOString().split('T')[0]
  
  for (const period of blockedDates) {
    if (checkDate >= period.start && checkDate < period.end) {
      return true
    }
  }
  
  return false
}

/**
 * Get all blocked dates as individual days (for calendar display)
 */
export function getBlockedDays(blockedDates: BlockedPeriod[]): Set<string> {
  const blocked = new Set<string>()
  
  for (const period of blockedDates) {
    const start = new Date(period.start)
    const end = new Date(period.end)
    
    // Add each day in the range
    const current = new Date(start)
    while (current < end) {
      blocked.add(current.toISOString().split('T')[0])
      current.setDate(current.getDate() + 1)
    }
  }
  
  return blocked
}

/**
 * Get available date ranges within the next N months
 */
export function getAvailablePeriods(
  blockedDates: BlockedPeriod[], 
  monthsAhead: number = 3
): { start: string; end: string }[] {
  const available: { start: string; end: string }[] = []
  
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const endDate = new Date(today)
  endDate.setMonth(endDate.getMonth() + monthsAhead)
  
  let currentStart = today.toISOString().split('T')[0]
  
  // Sort blocked dates by start
  const sortedBlocked = [...blockedDates].sort((a, b) => a.start.localeCompare(b.start))
  
  for (const blocked of sortedBlocked) {
    // If there's a gap before this blocked period
    if (blocked.start > currentStart) {
      available.push({
        start: currentStart,
        end: blocked.start,
      })
    }
    
    // Move current start to after this blocked period
    if (blocked.end > currentStart) {
      currentStart = blocked.end
    }
  }
  
  // Add any remaining time after last blocked period
  const endDateStr = endDate.toISOString().split('T')[0]
  if (currentStart < endDateStr) {
    available.push({
      start: currentStart,
      end: endDateStr,
    })
  }
  
  return available
}

/**
 * Format available periods for display
 */
export function formatAvailablePeriods(periods: { start: string; end: string }[]): string[] {
  return periods.map(period => {
    const start = new Date(period.start)
    const end = new Date(period.end)
    
    const formatOptions: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric' }
    
    // If same month, combine nicely
    if (start.getMonth() === end.getMonth()) {
      return `${start.toLocaleDateString('en-US', formatOptions)} - ${end.getDate()}`
    }
    
    return `${start.toLocaleDateString('en-US', formatOptions)} - ${end.toLocaleDateString('en-US', formatOptions)}`
  })
}
