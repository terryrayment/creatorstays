#!/usr/bin/env npx tsx
/**
 * iCal Test Script for CreatorStays
 * 
 * Usage:
 *   npx tsx scripts/test-ical.ts <ical-url>
 *   npx tsx scripts/test-ical.ts fixtures/airbnb_sample.ics
 * 
 * This script fetches and parses an iCal feed, showing:
 * - Raw VEVENT data
 * - Parsed blocked periods
 * - First 60 blocked days
 */

import * as fs from 'fs'
import * as path from 'path'

// Import our helpers
import { parseICalDateToLocalYMD, iterateDaysExclusive, getTodayYMD } from '../src/lib/calendar-date'

interface RawEvent {
  dtstart: string | null
  dtend: string | null
  summary: string | null
  uid: string | null
  raw: string
}

interface ParsedPeriod {
  start: string
  end: string
  summary: string | null
  uid: string | null
  daysCount: number
}

async function main() {
  const input = process.argv[2]
  
  if (!input) {
    console.log('Usage: npx tsx scripts/test-ical.ts <ical-url-or-file>')
    console.log('Example: npx tsx scripts/test-ical.ts https://www.airbnb.com/calendar/ical/...')
    console.log('Example: npx tsx scripts/test-ical.ts fixtures/airbnb_sample.ics')
    process.exit(1)
  }

  let icalText: string

  // Check if it's a file or URL
  if (input.startsWith('http')) {
    console.log(`Fetching iCal from URL: ${input.substring(0, 80)}...`)
    const response = await fetch(input, {
      headers: {
        'User-Agent': 'CreatorStays iCal Test/1.0',
        'Accept': 'text/calendar, */*',
      },
    })
    
    if (!response.ok) {
      console.error(`Failed to fetch: ${response.status} ${response.statusText}`)
      process.exit(1)
    }
    
    icalText = await response.text()
    
    // Save to fixtures for future testing
    const fixturesDir = path.join(__dirname, '..', 'fixtures')
    if (!fs.existsSync(fixturesDir)) {
      fs.mkdirSync(fixturesDir, { recursive: true })
    }
    const fixturePath = path.join(fixturesDir, `airbnb_${Date.now()}.ics`)
    fs.writeFileSync(fixturePath, icalText)
    console.log(`Saved to: ${fixturePath}`)
  } else {
    // It's a file path
    const filePath = path.resolve(input)
    if (!fs.existsSync(filePath)) {
      console.error(`File not found: ${filePath}`)
      process.exit(1)
    }
    console.log(`Reading iCal from file: ${filePath}`)
    icalText = fs.readFileSync(filePath, 'utf-8')
  }

  console.log(`\nReceived ${icalText.length} bytes`)
  console.log('='.repeat(60))

  // Extract raw events
  const rawEvents = extractRawEvents(icalText)
  console.log(`\n📋 RAW EVENTS FOUND: ${rawEvents.length}`)
  console.log('-'.repeat(60))
  
  rawEvents.forEach((event, i) => {
    console.log(`\nEvent ${i + 1}:`)
    console.log(`  DTSTART: ${event.dtstart}`)
    console.log(`  DTEND:   ${event.dtend}`)
    console.log(`  SUMMARY: ${event.summary}`)
    console.log(`  UID:     ${event.uid?.substring(0, 40)}...`)
  })

  // Parse into periods
  const todayYMD = getTodayYMD()
  console.log(`\n📅 TODAY: ${todayYMD}`)
  console.log('='.repeat(60))

  const periods: ParsedPeriod[] = []
  const skipped: { reason: string; event: RawEvent }[] = []

  for (const event of rawEvents) {
    const startParsed = parseICalDateToLocalYMD(event.dtstart)
    const endParsed = event.dtend ? parseICalDateToLocalYMD(event.dtend) : null

    if (!startParsed) {
      skipped.push({ reason: 'Invalid DTSTART', event })
      continue
    }

    const startYMD = startParsed.ymd
    const endYMD = endParsed?.ymd || addOneDay(startYMD)

    if (!endYMD) {
      skipped.push({ reason: 'Invalid DTEND', event })
      continue
    }

    // Check if end is after start
    if (endYMD <= startYMD) {
      skipped.push({ reason: 'End before/at start', event })
      continue
    }

    // Check if still relevant (end >= today)
    if (endYMD < todayYMD) {
      skipped.push({ reason: 'Past event', event })
      continue
    }

    const days = iterateDaysExclusive(startYMD, endYMD)
    
    periods.push({
      start: startYMD,
      end: endYMD,
      summary: event.summary,
      uid: event.uid,
      daysCount: days.size,
    })
  }

  // Sort by start date
  periods.sort((a, b) => a.start.localeCompare(b.start))

  console.log(`\n✅ PARSED BLOCKED PERIODS: ${periods.length}`)
  console.log('-'.repeat(60))
  
  periods.forEach((p, i) => {
    console.log(`${i + 1}. ${p.start} to ${p.end} (${p.daysCount} days) - ${p.summary || 'No summary'}`)
  })

  if (skipped.length > 0) {
    console.log(`\n⏭️  SKIPPED EVENTS: ${skipped.length}`)
    console.log('-'.repeat(60))
    skipped.forEach((s, i) => {
      console.log(`${i + 1}. ${s.reason}: ${s.event.dtstart} to ${s.event.dtend}`)
    })
  }

  // Get all blocked days
  const allBlockedDays = new Set<string>()
  for (const p of periods) {
    const days = iterateDaysExclusive(p.start, p.end)
    days.forEach(d => allBlockedDays.add(d))
  }

  const sortedDays = Array.from(allBlockedDays).sort()
  
  console.log(`\n📆 FIRST 60 BLOCKED DAYS (${sortedDays.length} total):`)
  console.log('-'.repeat(60))
  
  const first60 = sortedDays.slice(0, 60)
  // Group by month
  const byMonth: Record<string, string[]> = {}
  for (const day of first60) {
    const month = day.substring(0, 7)
    if (!byMonth[month]) byMonth[month] = []
    byMonth[month].push(day.substring(8))
  }

  for (const [month, days] of Object.entries(byMonth)) {
    console.log(`${month}: ${days.join(', ')}`)
  }

  // Check for specific dates (Jan 27-31)
  console.log(`\n🔍 CHECKING JANUARY 2026:`)
  console.log('-'.repeat(60))
  for (let d = 25; d <= 31; d++) {
    const ymd = `2026-01-${String(d).padStart(2, '0')}`
    const isBlocked = allBlockedDays.has(ymd)
    console.log(`  ${ymd}: ${isBlocked ? '🔴 BLOCKED' : '🟢 AVAILABLE'}`)
  }

  console.log(`\n🔍 CHECKING FEBRUARY 2026:`)
  console.log('-'.repeat(60))
  for (let d = 1; d <= 28; d++) {
    const ymd = `2026-02-${String(d).padStart(2, '0')}`
    const isBlocked = allBlockedDays.has(ymd)
    console.log(`  ${ymd}: ${isBlocked ? '🔴 BLOCKED' : '🟢 AVAILABLE'}`)
  }
}

function extractRawEvents(icalText: string): RawEvent[] {
  const events: RawEvent[] = []
  const eventBlocks = icalText.split('BEGIN:VEVENT')

  for (let i = 1; i < eventBlocks.length; i++) {
    const block = eventBlocks[i]
    const endIdx = block.indexOf('END:VEVENT')
    const eventContent = endIdx > -1 ? block.substring(0, endIdx) : block

    events.push({
      dtstart: extractField(eventContent, 'DTSTART'),
      dtend: extractField(eventContent, 'DTEND'),
      summary: extractField(eventContent, 'SUMMARY'),
      uid: extractField(eventContent, 'UID'),
      raw: eventContent,
    })
  }

  return events
}

function extractField(text: string, fieldName: string): string | null {
  // Try simple format: FIELD:value
  const simpleRegex = new RegExp(`^${fieldName}:(.+)$`, 'mi')
  const simpleMatch = text.match(simpleRegex)
  if (simpleMatch) return simpleMatch[1].trim()

  // Try parameterized format: FIELD;params:value
  const paramRegex = new RegExp(`^${fieldName};[^:]*:(.+)$`, 'mi')
  const paramMatch = text.match(paramRegex)
  if (paramMatch) return paramMatch[1].trim()

  return null
}

function addOneDay(ymd: string): string | null {
  const [year, month, day] = ymd.split('-').map(Number)
  const date = new Date(year, month - 1, day)
  date.setDate(date.getDate() + 1)
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
}

main().catch(console.error)
