'use client'

import { useState, useMemo } from 'react'
import { BlockedPeriod, findBlockingPeriods } from '@/lib/ical'
import { iterateDaysExclusive, dateToYMD, ymdToLocalDate } from '@/lib/calendar-date'

interface CalendarViewProps {
  blockedDates: BlockedPeriod[]
  monthsToShow?: number
  onDayClick?: (ymd: string, periods: BlockedPeriod[]) => void
  /** Interactive mode: allows clicking any day to toggle block status */
  interactive?: boolean
  /** Called when user clicks a day in interactive mode. Return value indicates if toggle succeeded. */
  onToggleDay?: (ymd: string, currentlyBlocked: boolean) => Promise<boolean>
  /** Days currently being toggled (show loading state) */
  togglingDays?: Set<string>
}

export function CalendarView({ 
  blockedDates, 
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

  // Build a map of all blocked days with their source periods
  const blockedDaysMap = useMemo(() => {
    const map = new Map<string, BlockedPeriod[]>()
    
    for (const period of blockedDates) {
      const days = iterateDaysExclusive(period.start, period.end)
      days.forEach(d => {
        const existing = map.get(d) || []
        existing.push(period)
        map.set(d, existing)
      })
    }
    
    return map
  }, [blockedDates])

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
      <div className="mb-4 flex flex-wrap items-center justify-center gap-3 text-[10px]">
        <div className="flex items-center gap-1.5">
          <div className="h-3 w-3 rounded bg-emerald-50 border border-black/20" />
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
        <div className="flex items-center gap-1.5">
          <div className="h-3 w-3 rounded border-2 border-black bg-[#FFD84A]" />
          <span>Today</span>
        </div>
      </div>

      {/* Interactive mode hint */}
      {interactive && (
        <div className="mb-4 text-center text-[11px] text-black/60 bg-amber-50 rounded-lg px-3 py-2">
          <strong>Click any date</strong> to block or unblock it
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
  blockedDaysMap: Map<string, BlockedPeriod[]>
  todayStr: string
  onDayClick?: (ymd: string, periods: BlockedPeriod[]) => void
  interactive?: boolean
  onToggleDay?: (ymd: string, currentlyBlocked: boolean) => Promise<boolean>
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
    const blockingPeriods = blockedDaysMap.get(ymd) || []
    
    // Check if any blocking period is from manual source
    const hasManualBlock = blockingPeriods.some(p => p.source === 'manual')
    const hasIcalBlock = blockingPeriods.some(p => p.source === 'ical' || !p.source)
    
    days.push({
      day: d,
      ymd,
      isBlocked: blockingPeriods.length > 0,
      blockingPeriods,
      isToday: ymd === todayStr,
      isPast: ymd < todayStr,
      hasManualBlock,
      hasIcalBlock,
      isToggling: togglingDays?.has(ymd) || false,
    })
  }

  const handleDayClick = (day: typeof days[0]) => {
    if (!day) return
    
    // In interactive mode, allow toggling future days
    if (interactive && onToggleDay && !day.isPast) {
      onToggleDay(day.ymd, day.isBlocked)
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
          // Determine if this day is clickable
          const isClickable = day && (
            (interactive && !day.isPast) || 
            (day.isBlocked && onDayClick)
          )
          
          // Determine background color
          let bgClass = ''
          if (!day) {
            bgClass = ''
          } else if (day.isToggling) {
            bgClass = 'bg-black/20 animate-pulse'
          } else if (day.isToday) {
            bgClass = 'border-2 border-black bg-[#FFD84A] font-bold'
          } else if (day.isBlocked) {
            // Different shades for ical vs manual
            if (day.hasIcalBlock && day.hasManualBlock) {
              bgClass = 'bg-red-500 text-white' // Both
            } else if (day.hasManualBlock) {
              bgClass = 'bg-amber-500 text-white' // Manual only
            } else {
              bgClass = 'bg-red-400 text-white' // iCal only
            }
          } else if (day.isPast) {
            bgClass = 'bg-black/5 text-black/30'
          } else {
            bgClass = 'bg-emerald-50 text-black'
          }
          
          // Add hover/cursor styles
          let interactionClass = ''
          if (isClickable && !day?.isToggling) {
            if (interactive && day && !day.isPast) {
              interactionClass = day.isBlocked 
                ? 'cursor-pointer hover:bg-emerald-200 hover:text-black transition-colors' 
                : 'cursor-pointer hover:bg-red-300 hover:text-white transition-colors'
            } else if (day?.isBlocked) {
              interactionClass = 'cursor-pointer hover:opacity-80'
            }
          }
          
          return (
            <div 
              key={idx}
              onClick={() => handleDayClick(day)}
              className={`aspect-square flex items-center justify-center rounded text-[10px] ${bgClass} ${interactionClass}`}
              title={
                day?.isToggling 
                  ? 'Updating...'
                  : day?.isBlocked 
                    ? `Blocked: ${day.blockingPeriods.map(p => p.summary || (p.source === 'manual' ? 'Manual block' : 'Unknown')).join(', ')}${interactive ? ' (click to unblock)' : ''}`
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
