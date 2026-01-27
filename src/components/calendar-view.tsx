'use client'

import { useState, useMemo } from 'react'
import { BlockedPeriod, findBlockingPeriods } from '@/lib/ical'
import { iterateDaysExclusive, dateToYMD, ymdToLocalDate } from '@/lib/calendar-date'

interface CalendarViewProps {
  blockedDates: BlockedPeriod[]
  /** Manual blocks - these can be toggled off */
  manualBlockDates?: string[]  // Array of YYYY-MM-DD dates that are manually blocked
  monthsToShow?: number
  onDayClick?: (ymd: string, periods: BlockedPeriod[]) => void
  /** Interactive mode: allows clicking any day to toggle block status */
  interactive?: boolean
  /** Called when user clicks a day in interactive mode. Return value indicates if toggle succeeded. */
  onToggleDay?: (ymd: string, currentlyBlocked: boolean, isManualBlock: boolean) => Promise<boolean>
  /** Days currently being toggled (show loading state) */
  togglingDays?: Set<string>
}

export function CalendarView({ 
  blockedDates, 
  manualBlockDates = [],
  monthsToShow = 3, 
  onDayClick,
  interactive = false,
  onToggleDay,
  togglingDays = new Set(),
}: CalendarViewProps) {
  const [startMonth, setStartMonth] = useState(() => {
    const now = new Date()
    return new Date(now.getFullYear(), now.getMonth(), 1)
  })

  // Create a set of manually blocked dates for quick lookup
  const manualBlockSet = useMemo(() => new Set(manualBlockDates), [manualBlockDates])

  // Build a map of all blocked days with their source periods
  // Also track which days are from iCal vs manual
  const blockedDaysMap = useMemo(() => {
    const map = new Map<string, { periods: BlockedPeriod[], isManual: boolean, isIcal: boolean }>()
    
    for (const period of blockedDates) {
      const days = iterateDaysExclusive(period.start, period.end)
      days.forEach(d => {
        const existing = map.get(d) || { periods: [], isManual: false, isIcal: false }
        existing.periods.push(period)
        // Check source - if missing, assume ical
        if (period.source === 'manual') {
          existing.isManual = true
        } else {
          existing.isIcal = true
        }
        map.set(d, existing)
      })
    }
    
    // Also add from manualBlockDates set (in case source info was lost in merging)
    for (const ymd of manualBlockDates) {
      const existing = map.get(ymd) || { periods: [], isManual: false, isIcal: false }
      existing.isManual = true
      map.set(ymd, existing)
    }
    
    return map
  }, [blockedDates, manualBlockDates])

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
          <span>Blocked (iCal)</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="h-3 w-3 rounded bg-amber-500" />
          <span>Blocked (manual)</span>
        </div>
      </div>

      {/* Interactive mode hint */}
      {interactive && (
        <div className="mb-4 text-center text-[11px] text-black/60 bg-amber-50 rounded-lg px-3 py-2">
          <strong>Click any green date</strong> to block it • <strong>Click amber</strong> to unblock
        </div>
      )}

      {/* Months Grid */}
      <div className="grid gap-4 md:grid-cols-3">
        {months.map((month, idx) => (
          <MonthCalendar 
            key={idx}
            month={month}
            blockedDaysMap={blockedDaysMap}
            todayStr={todayStr}
            onDayClick={onDayClick}
            interactive={interactive}
            onToggleDay={onToggleDay}
            togglingDays={togglingDays}
          />
        ))}
      </div>

      {/* Stats */}
      <div className="mt-4 flex items-center justify-center gap-6 border-t border-black/10 pt-3 text-[10px] text-black/60">
        <span>{blockedDates.length} blocked periods</span>
        <span>{blockedDaysMap.size} days unavailable</span>
      </div>
    </div>
  )
}

function MonthCalendar({ 
  month, 
  blockedDaysMap,
  todayStr,
  onDayClick,
  interactive,
  onToggleDay,
  togglingDays,
}: { 
  month: Date
  blockedDaysMap: Map<string, { periods: BlockedPeriod[], isManual: boolean, isIcal: boolean }>
  todayStr: string
  onDayClick?: (ymd: string, periods: BlockedPeriod[]) => void
  interactive?: boolean
  onToggleDay?: (ymd: string, currentlyBlocked: boolean, isManualBlock: boolean) => Promise<boolean>
  togglingDays?: Set<string>
}) {
  const monthName = month.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
  
  // Get days in this month
  const daysInMonth = new Date(month.getFullYear(), month.getMonth() + 1, 0).getDate()
  const firstDayOfWeek = new Date(month.getFullYear(), month.getMonth(), 1).getDay()
  
  type DayInfo = {
    day: number
    ymd: string
    isBlocked: boolean
    blockingPeriods: BlockedPeriod[]
    isToday: boolean
    isPast: boolean
    hasManualBlock: boolean
    hasIcalBlock: boolean
    isToggling: boolean
  } | null
  
  const days: DayInfo[] = []
  
  // Add empty cells for days before the 1st
  for (let i = 0; i < firstDayOfWeek; i++) {
    days.push(null)
  }
  
  // Add all days of the month
  for (let d = 1; d <= daysInMonth; d++) {
    const ymd = `${month.getFullYear()}-${String(month.getMonth() + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`
    const blockInfo = blockedDaysMap.get(ymd)
    
    days.push({
      day: d,
      ymd,
      isBlocked: !!blockInfo,
      blockingPeriods: blockInfo?.periods || [],
      isToday: ymd === todayStr,
      isPast: ymd < todayStr,
      hasManualBlock: blockInfo?.isManual || false,
      hasIcalBlock: blockInfo?.isIcal || false,
      isToggling: togglingDays?.has(ymd) || false,
    })
  }

  const handleDayClick = (day: typeof days[0]) => {
    if (!day || day.isPast) return
    
    // In interactive mode
    if (interactive && onToggleDay) {
      // Can only toggle if:
      // - Day is available (not blocked) -> add block
      // - Day has manual block ONLY (no iCal block) -> remove block
      if (!day.isBlocked) {
        // Available -> block it
        onToggleDay(day.ymd, false, false)
      } else if (day.hasManualBlock && !day.hasIcalBlock) {
        // Manual block only -> unblock it
        onToggleDay(day.ymd, true, true)
      }
      // If it's an iCal block (even with manual), can't toggle
    } else if (day.isBlocked && onDayClick) {
      // Non-interactive: show info about why it's blocked
      onDayClick(day.ymd, day.blockingPeriods)
    }
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
        {days.map((day, idx) => {
          // Determine if this day is clickable in interactive mode
          const canToggle = interactive && day && !day.isPast && !day.isToggling && (
            !day.isBlocked || // Can block available days
            (day.hasManualBlock && !day.hasIcalBlock) // Can unblock manual-only blocks
          )
          
          // Determine background color - today gets a ring instead of full bg change
          let bgClass = ''
          let ringClass = ''
          
          if (!day) {
            bgClass = ''
          } else if (day.isToggling) {
            bgClass = 'bg-black/20 animate-pulse'
          } else if (day.isBlocked) {
            // Different shades for ical vs manual
            if (day.hasManualBlock && !day.hasIcalBlock) {
              bgClass = 'bg-amber-500 text-white' // Manual only - can unblock
            } else {
              bgClass = 'bg-red-400 text-white' // iCal (can't unblock)
            }
          } else if (day.isPast) {
            bgClass = 'bg-black/5 text-black/30'
          } else {
            bgClass = 'bg-emerald-400 text-white' // Available
          }
          
          // Today gets a ring
          if (day?.isToday && !day.isToggling) {
            ringClass = 'ring-2 ring-black ring-offset-1'
          }
          
          // Add hover/cursor styles only for actionable days
          let interactionClass = ''
          if (canToggle) {
            if (day.isBlocked) {
              // Manual block - show it can be unblocked
              interactionClass = 'cursor-pointer hover:bg-emerald-300 hover:text-black transition-colors'
            } else {
              // Available - show it can be blocked
              interactionClass = 'cursor-pointer hover:bg-red-300 transition-colors'
            }
          }
          
          return (
            <div 
              key={idx}
              onClick={() => handleDayClick(day)}
              className={`aspect-square flex items-center justify-center rounded text-[10px] ${bgClass} ${ringClass} ${interactionClass}`}
              title={
                day?.isToggling 
                  ? 'Updating...'
                  : day?.hasIcalBlock
                    ? 'Blocked by Airbnb (cannot change here)'
                    : day?.hasManualBlock
                      ? 'Manual block (click to unblock)'
                      : interactive && day && !day.isPast
                        ? 'Click to block'
                        : undefined
              }
            >
              {day?.day}
            </div>
          )
        })}
      </div>
    </div>
  )
}
