/**
 * Calendar Date Helpers for CreatorStays
 * 
 * CRITICAL: All date operations use YYYY-MM-DD strings (YMD format) internally
 * to avoid timezone drift. Never use new Date('YYYY-MM-DD') for comparisons.
 * 
 * iCal semantics:
 * - DTSTART is inclusive (first blocked day)
 * - DTEND is exclusive (first available day after block)
 * - DATE values (YYYYMMDD) represent all-day events
 * - DATE-TIME values with Z suffix are UTC
 */

// =============================================================================
// Types
// =============================================================================

export interface ParsedICalDate {
  ymd: string           // YYYY-MM-DD
  isDateTime: boolean   // true if original had time component
  isUtc: boolean        // true if original had Z suffix
  raw: string           // original iCal string
}

// =============================================================================
// Core Helpers
// =============================================================================

/**
 * Parse an iCal date string (DTSTART/DTEND value) to local YYYY-MM-DD
 * 
 * Handles:
 * - 20240115 (DATE format - all-day event)
 * - 20240115T120000 (local datetime)
 * - 20240115T120000Z (UTC datetime - converted to local)
 * 
 * @param input - Raw iCal date string
 * @returns ParsedICalDate with normalized YMD, or null if invalid
 */
export function parseICalDateToLocalYMD(input: string | null | undefined): ParsedICalDate | null {
  if (!input) return null
  
  // Clean up: remove line continuations and whitespace
  const cleaned = input.replace(/\r?\n\s/g, '').trim()
  
  // Pattern 1: DATE format (YYYYMMDD) - all-day event
  if (/^\d{8}$/.test(cleaned)) {
    const year = cleaned.substring(0, 4)
    const month = cleaned.substring(4, 6)
    const day = cleaned.substring(6, 8)
    
    // Validate
    if (!isValidYMD(`${year}-${month}-${day}`)) return null
    
    return {
      ymd: `${year}-${month}-${day}`,
      isDateTime: false,
      isUtc: false,
      raw: input,
    }
  }
  
  // Pattern 2: DATE-TIME format (YYYYMMDDTHHmmss or YYYYMMDDTHHmmssZ)
  const dtMatch = cleaned.match(/^(\d{4})(\d{2})(\d{2})T(\d{2})(\d{2})(\d{2})(Z)?$/)
  if (dtMatch) {
    const [, year, month, day, hour, minute, second, utcFlag] = dtMatch
    const isUtc = !!utcFlag
    
    if (isUtc) {
      // Convert UTC to local date
      // Create a UTC date and extract local date components
      const utcDate = new Date(Date.UTC(
        parseInt(year),
        parseInt(month) - 1,
        parseInt(day),
        parseInt(hour),
        parseInt(minute),
        parseInt(second)
      ))
      
      const localYmd = dateToYMD(utcDate)
      
      return {
        ymd: localYmd,
        isDateTime: true,
        isUtc: true,
        raw: input,
      }
    } else {
      // Local datetime - just take the date part
      const ymd = `${year}-${month}-${day}`
      if (!isValidYMD(ymd)) return null
      
      return {
        ymd,
        isDateTime: true,
        isUtc: false,
        raw: input,
      }
    }
  }
  
  // Unknown format
  console.warn('[CalendarDate] Unknown iCal date format:', input)
  return null
}

/**
 * Convert YYYY-MM-DD string to a Date object at local midnight
 * SAFE: Uses component parsing, not Date.parse()
 * 
 * @param ymd - Date string in YYYY-MM-DD format
 * @returns Date at local midnight, or null if invalid
 */
export function ymdToLocalDate(ymd: string): Date | null {
  if (!isValidYMD(ymd)) return null
  
  const [year, month, day] = ymd.split('-').map(Number)
  
  // new Date(year, monthIndex, day) creates local midnight
  return new Date(year, month - 1, day)
}

/**
 * Convert a Date object to YYYY-MM-DD string using LOCAL date components
 * SAFE: Uses getFullYear/getMonth/getDate, not toISOString()
 * 
 * @param date - Date object
 * @returns YYYY-MM-DD string in local timezone
 */
export function dateToYMD(date: Date): string {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

/**
 * Get today's date as YYYY-MM-DD in local timezone
 */
export function getTodayYMD(): string {
  return dateToYMD(new Date())
}

/**
 * Iterate over days from startYMD (inclusive) to endYMD (exclusive)
 * Returns a Set of YYYY-MM-DD strings
 * 
 * @param startYMD - First day (inclusive)
 * @param endYMD - Last day (exclusive, per iCal DTEND semantics)
 * @returns Set of YYYY-MM-DD strings for each day in range
 */
export function iterateDaysExclusive(startYMD: string, endYMD: string): Set<string> {
  const days = new Set<string>()
  
  if (!isValidYMD(startYMD) || !isValidYMD(endYMD)) {
    return days
  }
  
  // Compare as strings - works for YYYY-MM-DD format
  if (startYMD >= endYMD) {
    return days
  }
  
  // Use local Date for iteration
  const current = ymdToLocalDate(startYMD)
  if (!current) return days
  
  while (dateToYMD(current) < endYMD) {
    days.add(dateToYMD(current))
    current.setDate(current.getDate() + 1)
  }
  
  return days
}

/**
 * Add days to a YMD string
 * 
 * @param ymd - Starting date
 * @param days - Number of days to add (can be negative)
 * @returns New YYYY-MM-DD string
 */
export function addDaysToYMD(ymd: string, days: number): string | null {
  const date = ymdToLocalDate(ymd)
  if (!date) return null
  
  date.setDate(date.getDate() + days)
  return dateToYMD(date)
}

/**
 * Compare two YMD strings
 * @returns -1 if a < b, 0 if equal, 1 if a > b
 */
export function compareYMD(a: string, b: string): -1 | 0 | 1 {
  if (a < b) return -1
  if (a > b) return 1
  return 0
}

/**
 * Check if a YMD is within a range (start inclusive, end exclusive)
 */
export function isYMDInRange(ymd: string, startInclusive: string, endExclusive: string): boolean {
  return ymd >= startInclusive && ymd < endExclusive
}

// =============================================================================
// Validation
// =============================================================================

/**
 * Validate a YYYY-MM-DD string
 */
export function isValidYMD(ymd: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(ymd)) return false
  
  const [year, month, day] = ymd.split('-').map(Number)
  
  // Basic range checks
  if (year < 1900 || year > 2100) return false
  if (month < 1 || month > 12) return false
  if (day < 1 || day > 31) return false
  
  // Check days in month
  const daysInMonth = new Date(year, month, 0).getDate()
  if (day > daysInMonth) return false
  
  return true
}

// =============================================================================
// Formatting
// =============================================================================

/**
 * Format a YMD for display (e.g., "Jan 15")
 */
export function formatYMDShort(ymd: string): string {
  const date = ymdToLocalDate(ymd)
  if (!date) return ymd
  
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

/**
 * Format a YMD range for display (e.g., "Jan 15 - Jan 20")
 */
export function formatYMDRange(startYMD: string, endYMD: string): string {
  return `${formatYMDShort(startYMD)} - ${formatYMDShort(endYMD)}`
}

// =============================================================================
// Unit Tests (run with: npx tsx src/lib/calendar-date.test.ts)
// =============================================================================

export function runDateTests(): { passed: number; failed: number; results: string[] } {
  const results: string[] = []
  let passed = 0
  let failed = 0
  
  function test(name: string, fn: () => boolean) {
    try {
      if (fn()) {
        passed++
        results.push(`✓ ${name}`)
      } else {
        failed++
        results.push(`✗ ${name}`)
      }
    } catch (e) {
      failed++
      results.push(`✗ ${name}: ${e}`)
    }
  }
  
  // parseICalDateToLocalYMD tests
  test('parseICalDateToLocalYMD: DATE format', () => {
    const result = parseICalDateToLocalYMD('20260127')
    return result?.ymd === '2026-01-27' && !result.isDateTime && !result.isUtc
  })
  
  test('parseICalDateToLocalYMD: DATE-TIME local', () => {
    const result = parseICalDateToLocalYMD('20260127T140000')
    return result?.ymd === '2026-01-27' && result.isDateTime && !result.isUtc
  })
  
  test('parseICalDateToLocalYMD: DATE-TIME UTC', () => {
    // 2026-01-27 08:00 UTC = 2026-01-27 00:00 PST (UTC-8)
    // The date should still be Jan 27 in local timezone
    const result = parseICalDateToLocalYMD('20260127T080000Z')
    // This depends on local timezone, but the point is it should not crash
    return result !== null && result.isDateTime && result.isUtc
  })
  
  test('parseICalDateToLocalYMD: null input', () => {
    return parseICalDateToLocalYMD(null) === null
  })
  
  test('parseICalDateToLocalYMD: invalid input', () => {
    return parseICalDateToLocalYMD('not-a-date') === null
  })
  
  // ymdToLocalDate tests
  test('ymdToLocalDate: valid date', () => {
    const date = ymdToLocalDate('2026-01-27')
    return date !== null && 
           date.getFullYear() === 2026 && 
           date.getMonth() === 0 && 
           date.getDate() === 27
  })
  
  test('ymdToLocalDate: invalid date', () => {
    return ymdToLocalDate('invalid') === null
  })
  
  // dateToYMD tests
  test('dateToYMD: converts correctly', () => {
    const date = new Date(2026, 0, 27) // Jan 27, 2026
    return dateToYMD(date) === '2026-01-27'
  })
  
  // iterateDaysExclusive tests
  test('iterateDaysExclusive: 3-day range', () => {
    const days = iterateDaysExclusive('2026-01-27', '2026-01-30')
    return days.size === 3 && 
           days.has('2026-01-27') && 
           days.has('2026-01-28') && 
           days.has('2026-01-29') &&
           !days.has('2026-01-30') // end is exclusive
  })
  
  test('iterateDaysExclusive: cross month boundary', () => {
    const days = iterateDaysExclusive('2026-01-30', '2026-02-02')
    return days.size === 3 && 
           days.has('2026-01-30') && 
           days.has('2026-01-31') && 
           days.has('2026-02-01')
  })
  
  test('iterateDaysExclusive: empty range', () => {
    const days = iterateDaysExclusive('2026-01-27', '2026-01-27')
    return days.size === 0
  })
  
  test('iterateDaysExclusive: reversed range returns empty', () => {
    const days = iterateDaysExclusive('2026-01-30', '2026-01-27')
    return days.size === 0
  })
  
  // isValidYMD tests
  test('isValidYMD: valid date', () => {
    return isValidYMD('2026-01-27')
  })
  
  test('isValidYMD: invalid format', () => {
    return !isValidYMD('2026/01/27')
  })
  
  test('isValidYMD: invalid day', () => {
    return !isValidYMD('2026-02-30') // Feb doesn't have 30 days
  })
  
  // compareYMD tests
  test('compareYMD: less than', () => {
    return compareYMD('2026-01-27', '2026-01-28') === -1
  })
  
  test('compareYMD: equal', () => {
    return compareYMD('2026-01-27', '2026-01-27') === 0
  })
  
  test('compareYMD: greater than', () => {
    return compareYMD('2026-01-28', '2026-01-27') === 1
  })
  
  // isYMDInRange tests
  test('isYMDInRange: inside', () => {
    return isYMDInRange('2026-01-28', '2026-01-27', '2026-01-30')
  })
  
  test('isYMDInRange: at start (inclusive)', () => {
    return isYMDInRange('2026-01-27', '2026-01-27', '2026-01-30')
  })
  
  test('isYMDInRange: at end (exclusive)', () => {
    return !isYMDInRange('2026-01-30', '2026-01-27', '2026-01-30')
  })
  
  return { passed, failed, results }
}
