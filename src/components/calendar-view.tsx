'use client'

import { useState, useMemo } from 'react'
import { iterateDaysExclusive, dateToYMD } from '@/lib/calendar-date'

// =============================================================================
// Types
// =============================================================================

interface ICalBlock {
  start: string  // YYYY-MM-DD
  end: string    // YYYY-MM-DD (exclusive)
  summary?: string
  uid?: string
  source: 'ical'
}

interface ManualBlock {
  id: string     // Database ID - needed for deletion
  start: string  // YYYY-MM-DD (was startDate)
  end: string    // YYYY-MM-DD (was endDate, exclusive)
  note?: string | null
  source: 'manual'
}

interface CalendarViewProps {
  /** iCal blocks from Airbnb - immutable, cannot be toggled */
  icalBlocks: ICalBlock[]
  /** Manual blocks from database - can be created/deleted */
  manualBlocks: ManualBlock[]
  monthsToShow?: number
  /** Interactive mode: allows clicking days to create/delete manual blocks */
  interactive?: boolean
  /** Called when user wants to CREATE a manual block for a day */
  onBlockDay?: (ymd: string) => Promise<void>
  /** Called when user wants to DELETE a manual block */
  onUnblockDay?: (manualBlockId: string) => Promise<void>
  /** Days currently being toggled (show loading state) */
  togglingDays?: Set<string>
}

// Per-day computed state
interface DayState {
  ymd: string
  isBlockedByIcal: boolean
  isBlockedByManual: boolean
  manualBlockId: string | null  // ID for deletion, null if not manually blocked
  icalSummary?: string          // Why iCal blocked it
}

// =============================================================================
// Main Component
// =============================================================================

export function CalendarView({ 
  icalBlocks = [],
  manualBlocks = [],
  monthsToShow = 3, 
  interactive = false,
  onBlockDay,
  onUnblockDay,
  togglingDays = new Set(),
}: CalendarViewProps) {
  const [startMonth, setStartMonth] = useState(() => {
    const now = new Date()
    return new Date(now.getFullYear(), now.getMonth(), 1)
  })

  // ==========================================================================
  // CORE COMPUTATION: Build per-day lookup from raw sources
  // This is computed fresh on every render - NO stored derived state
  // ==========================================================================
  const dayStateMap = useMemo(() => {
    const map = new Map<string, DayState>()
    
    // Diagnostic stats
    let icalDaysProduced = 0
    let icalMinYmd: string | null = null
    let icalMaxYmd: string | null = null
    let manualDaysProduced = 0
    let manualMinYmd: string | null = null
    let manualMaxYmd: string | null = null
    
    console.log('[DEBUG CalendarView] Building dayStateMap from:', {
      icalBlocksCount: icalBlocks.length,
      manualBlocksCount: manualBlocks.length,
    })
    console.log('[DEBUG CalendarView] icalBlocks (first 5):', icalBlocks.slice(0, 5))
    console.log('[DEBUG CalendarView] manualBlocks (first 5):', manualBlocks.slice(0, 5))
    
    // Process iCal blocks first
    for (const block of icalBlocks) {
      const days = iterateDaysExclusive(block.start, block.end)
      console.log('[DEBUG CalendarView] iCal block:', block.start, '->', block.end, '| days produced:', days.size)
      for (const ymd of days) {
        icalDaysProduced++
        if (!icalMinYmd || ymd < icalMinYmd) icalMinYmd = ymd
        if (!icalMaxYmd || ymd > icalMaxYmd) icalMaxYmd = ymd
        
        const existing = map.get(ymd)
        if (existing) {
          existing.isBlockedByIcal = true
          existing.icalSummary = block.summary
        } else {
          map.set(ymd, {
            ymd,
            isBlockedByIcal: true,
            isBlockedByManual: false,
            manualBlockId: null,
            icalSummary: block.summary,
          })
        }
      }
    }
    
    // Process manual blocks second
    for (const block of manualBlocks) {
      const days = iterateDaysExclusive(block.start, block.end)
      console.log('[DEBUG CalendarView] Manual block:', block.id.slice(0,8), block.start, '->', block.end, '| days produced:', days.size)
      for (const ymd of days) {
        manualDaysProduced++
        if (!manualMinYmd || ymd < manualMinYmd) manualMinYmd = ymd
        if (!manualMaxYmd || ymd > manualMaxYmd) manualMaxYmd = ymd
        
        const existing = map.get(ymd)
        if (existing) {
          existing.isBlockedByManual = true
          existing.manualBlockId = block.id
        } else {
          map.set(ymd, {
            ymd,
            isBlockedByIcal: false,
            isBlockedByManual: true,
            manualBlockId: block.id,
          })
        }
      }
    }
    
    console.log('[DEBUG CalendarView] DIAGNOSTIC STATS:')
    console.log('  totalDaysMarkedByIcal:', icalDaysProduced, '| range:', icalMinYmd, '->', icalMaxYmd)
    console.log('  totalDaysMarkedByManual:', manualDaysProduced, '| range:', manualMinYmd, '->', manualMaxYmd)
    console.log('  totalUniqueBlockedDays:', map.size)
    
    return map
  }, [icalBlocks, manualBlocks])

  // ==========================================================================
  // Navigation
  // ==========================================================================
  const months = useMemo(() => {
    const result = []
    const current = new Date(startMonth)
    for (let i = 0; i < monthsToShow; i++) {
      result.push(new Date(current))
      current.setMonth(current.getMonth() + 1)
    }
    return result
  }, [startMonth, monthsToShow])

  const goToPrevMonth = () => {
    setStartMonth(prev => {
      const newDate = new Date(prev)
      newDate.setMonth(newDate.getMonth() - 1)
      return newDate
    })
  }

  const goToNextMonth = () => {
    setStartMonth(prev => {
      const newDate = new Date(prev)
      newDate.setMonth(newDate.getMonth() + 1)
      return newDate
    })
  }

  const todayStr = dateToYMD(new Date())
  
  // Stats
  const icalDayCount = useMemo(() => {
    let count = 0
    for (const state of dayStateMap.values()) {
      if (state.isBlockedByIcal) count++
    }
    return count
  }, [dayStateMap])
  
  const manualDayCount = useMemo(() => {
    let count = 0
    for (const state of dayStateMap.values()) {
      if (state.isBlockedByManual && !state.isBlockedByIcal) count++
    }
    return count
  }, [dayStateMap])

  return (
    <div className="rounded-xl border-2 border-black bg-white p-4">
      {/* Header */}
      <div className="mb-4 flex items-center justify-between">
        <button 
          onClick={goToPrevMonth}
          className="rounded-full border-2 border-black p-1.5 hover:bg-black/5 transition-colors"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <h3 className="text-sm font-bold">Availability Calendar</h3>
        <button 
          onClick={goToNextMonth}
          className="rounded-full border-2 border-black p-1.5 hover:bg-black/5 transition-colors"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>

      {/* Legend */}
      <div className="mb-4 flex flex-wrap items-center justify-center gap-4 text-[10px]">
        <div className="flex items-center gap-1.5">
          <div className="h-3 w-3 rounded bg-emerald-400" />
          <span>Available</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="h-3 w-3 rounded bg-red-400" />
          <span>Blocked (Airbnb)</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="h-3 w-3 rounded bg-amber-500" />
          <span>Blocked (manual)</span>
        </div>
      </div>

      {/* Interactive mode hint */}
      {interactive && (
        <div className="mb-4 text-center text-[11px] text-black/60 bg-amber-50 rounded-lg px-3 py-2">
          <strong>Click green</strong> to block • <strong>Click amber</strong> to unblock • Red dates are from Airbnb
        </div>
      )}

      {/* Months Grid */}
      <div className="grid gap-4 md:grid-cols-3">
        {months.map((month, idx) => (
          <MonthCalendar 
            key={idx}
            month={month}
            dayStateMap={dayStateMap}
            todayStr={todayStr}
            interactive={interactive}
            onBlockDay={onBlockDay}
            onUnblockDay={onUnblockDay}
            togglingDays={togglingDays}
          />
        ))}
      </div>

      {/* Stats */}
      <div className="mt-4 flex items-center justify-center gap-6 border-t border-black/10 pt-3 text-[10px] text-black/60">
        <span>{icalBlocks.length} iCal periods</span>
        <span>{manualBlocks.length} manual blocks</span>
        <span>{icalDayCount + manualDayCount} days unavailable</span>
      </div>
    </div>
  )
}

// =============================================================================
// Month Component
// =============================================================================

function MonthCalendar({ 
  month, 
  dayStateMap,
  todayStr,
  interactive,
  onBlockDay,
  onUnblockDay,
  togglingDays,
}: { 
  month: Date
  dayStateMap: Map<string, DayState>
  todayStr: string
  interactive?: boolean
  onBlockDay?: (ymd: string) => Promise<void>
  onUnblockDay?: (manualBlockId: string) => Promise<void>
  togglingDays?: Set<string>
}) {
  const monthName = month.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
  
  const daysInMonth = new Date(month.getFullYear(), month.getMonth() + 1, 0).getDate()
  const firstDayOfWeek = new Date(month.getFullYear(), month.getMonth(), 1).getDay()
  
  // Build day cells
  type DayCell = {
    day: number
    ymd: string
    state: DayState | null
    isToday: boolean
    isPast: boolean
    isToggling: boolean
  } | null
  
  const days: DayCell[] = []
  
  // Empty cells before 1st
  for (let i = 0; i < firstDayOfWeek; i++) {
    days.push(null)
  }
  
  // Day cells
  for (let d = 1; d <= daysInMonth; d++) {
    const ymd = `${month.getFullYear()}-${String(month.getMonth() + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`
    days.push({
      day: d,
      ymd,
      state: dayStateMap.get(ymd) || null,
      isToday: ymd === todayStr,
      isPast: ymd < todayStr,
      isToggling: togglingDays?.has(ymd) || false,
    })
  }

  // ==========================================================================
  // CLICK HANDLER: Based on user intent, not raw date mutation
  // ==========================================================================
  const handleDayClick = async (dayCell: DayCell) => {
    if (!dayCell || dayCell.isPast || dayCell.isToggling || !interactive) {
      console.log('[DEBUG CalendarView] Click IGNORED:', { 
        reason: !dayCell ? 'no dayCell' : dayCell.isPast ? 'isPast' : dayCell.isToggling ? 'isToggling' : 'not interactive',
        ymd: dayCell?.ymd,
      })
      return
    }
    
    const { state, ymd } = dayCell
    
    console.log('[DEBUG CalendarView] ========== DAY CLICKED ==========')
    console.log('[DEBUG CalendarView] ymd:', ymd)
    console.log('[DEBUG CalendarView] state:', state)
    console.log('[DEBUG CalendarView] isBlockedByIcal:', state?.isBlockedByIcal ?? false)
    console.log('[DEBUG CalendarView] isBlockedByManual:', state?.isBlockedByManual ?? false)
    console.log('[DEBUG CalendarView] manualBlockId:', state?.manualBlockId ?? null)
    
    // Case 1: Day is available (green) -> User wants to BLOCK it
    if (!state || (!state.isBlockedByIcal && !state.isBlockedByManual)) {
      console.log('[DEBUG CalendarView] BRANCH: GREEN -> BLOCK (calling onBlockDay)')
      if (onBlockDay) {
        await onBlockDay(ymd)
      }
      return
    }
    
    // Case 2: Day has manual block ONLY (amber) -> User wants to UNBLOCK it
    if (state.isBlockedByManual && !state.isBlockedByIcal && state.manualBlockId) {
      console.log('[DEBUG CalendarView] BRANCH: AMBER -> UNBLOCK (calling onUnblockDay with id:', state.manualBlockId, ')')
      if (onUnblockDay) {
        await onUnblockDay(state.manualBlockId)
      }
      return
    }
    
    // Case 3: Day has iCal block (red) -> NO-OP, cannot change Airbnb data
    console.log('[DEBUG CalendarView] BRANCH: RED -> NOOP (iCal blocked, cannot change)')
    // Do nothing - the UI already shows this isn't clickable
  }

  return (
    <div>
      <div className="mb-2 text-center text-xs font-bold">{monthName}</div>
      
      {/* Day headers */}
      <div className="mb-1 grid grid-cols-7 gap-0.5 text-center text-[9px] text-black/40">
        {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((d, i) => (
          <div key={i}>{d}</div>
        ))}
      </div>
      
      {/* Days */}
      <div className="grid grid-cols-7 gap-0.5">
        {days.map((dayCell, idx) => {
          if (!dayCell) {
            return <div key={idx} className="aspect-square" />
          }
          
          const { day, state, isToday, isPast, isToggling } = dayCell
          
          // =================================================================
          // DISPLAY LOGIC: Computed from state, never stored
          // =================================================================
          
          // Determine what action is possible
          const isAvailable = !state || (!state.isBlockedByIcal && !state.isBlockedByManual)
          const isIcalBlocked = state?.isBlockedByIcal || false
          const isManualOnlyBlocked = state?.isBlockedByManual && !state?.isBlockedByIcal
          
          // Can user click this day?
          const canClick = interactive && !isPast && !isToggling && (
            isAvailable ||        // Can block available days
            isManualOnlyBlocked   // Can unblock manual-only blocks
          )
          
          // Background color
          let bgClass = ''
          if (isToggling) {
            bgClass = 'bg-black/20 animate-pulse'
          } else if (isPast) {
            bgClass = 'bg-black/5 text-black/30'
          } else if (isIcalBlocked) {
            bgClass = 'bg-red-400 text-white'  // Red: iCal block - NOT clickable
          } else if (isManualOnlyBlocked) {
            bgClass = 'bg-amber-500 text-white' // Amber: manual only - CAN unblock
          } else {
            bgClass = 'bg-emerald-400 text-white' // Green: available - CAN block
          }
          
          // Ring for today
          const ringClass = isToday && !isToggling ? 'ring-2 ring-black ring-offset-1' : ''
          
          // Hover/cursor for clickable days
          let interactionClass = ''
          if (canClick) {
            if (isManualOnlyBlocked) {
              interactionClass = 'cursor-pointer hover:bg-emerald-300 hover:text-black transition-colors'
            } else if (isAvailable) {
              interactionClass = 'cursor-pointer hover:bg-amber-300 transition-colors'
            }
          }
          
          // Tooltip
          let title: string | undefined
          if (isToggling) {
            title = 'Updating...'
          } else if (isIcalBlocked) {
            title = `Blocked by Airbnb${state?.icalSummary ? `: ${state.icalSummary}` : ''} (cannot change here)`
          } else if (isManualOnlyBlocked) {
            title = 'Manual block - click to unblock'
          } else if (interactive && !isPast) {
            title = 'Click to block this date'
          }
          
          return (
            <div 
              key={idx}
              onClick={() => handleDayClick(dayCell)}
              className={`aspect-square flex items-center justify-center rounded text-[10px] ${bgClass} ${ringClass} ${interactionClass}`}
              title={title}
            >
              {day}
            </div>
          )
        })}
      </div>
    </div>
  )
}
