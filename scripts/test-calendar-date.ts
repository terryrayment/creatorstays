#!/usr/bin/env npx tsx
/**
 * Run calendar date helper tests
 * Usage: npx tsx scripts/test-calendar-date.ts
 */

import { runDateTests } from '../src/lib/calendar-date'

console.log('Running calendar date helper tests...\n')

const { passed, failed, results } = runDateTests()

results.forEach(r => console.log(r))

console.log(`\n${passed} passed, ${failed} failed`)

if (failed > 0) {
  process.exit(1)
}
