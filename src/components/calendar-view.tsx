'use client'

import { useState, useMemo } from 'react'
import { BlockedPeriod, findBlockingPeriods } from '@/lib/ical'
import { iterateDaysExclusive, dateToYMD, ymdToLocalDate } from '@/lib/calendar-date'

interface CalendarViewProps {
  blockedDates: BlockedPeriod[]
  monthsToShow?: number
  onDayClick?: (ymd: string, periods: BlockedPeriod[]) => void
}

export function CalendarView({ blockedDates, monthsToShow = 3, onDayClick }: CalendarViewProps) {
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
      <div className="mb-4 flex items-center justify-center gap-4 text-[10px]">
        <div className="flex items-center gap-1.5">
          <div className="h-3 w-3 rounded border border-black/20 bg-white" />
          <span>Available</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="h-3 w-3 rounded bg-red-400" />
          <span>Blocked</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="h-3 w-3 rounded border-2 border-black bg-[#FFD84A]" />
          <span>Today</span>
        </div>
      </div>

      {/* Months Grid */}
      <div className="grid gap-4 md:grid-cols-3">
        {months.map((month, idx) => (
          <MonthCalendar 
            key={idx}
            month={month}
            blockedDaysMap={blockedDaysMap}
            todayStr={todayStr}
            onDayClick={onDayClick}
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
}: { 
  month: Date
  blockedDaysMap: Map<string, BlockedPeriod[]>
  todayStr: string
  onDayClick?: (ymd: string, periods: BlockedPeriod[]) => void
}) {
  const monthName = month.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
  
  // Get days in this month
  const daysInMonth = new Date(month.getFullYear(), month.getMonth() + 1, 0).getDate()
  const firstDayOfWeek = new Date(month.getFullYear(), month.getMonth(), 1).getDay()
  
  const days = []
  
  // Add empty cells for days before the 1st
  for (let i = 0; i < firstDayOfWeek; i++) {
    days.push(null)
  }
  
  // Add all days of the month
  for (let d = 1; d <= daysInMonth; d++) {
    const ymd = `${month.getFullYear()}-${String(month.getMonth() + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`
    const blockingPeriods = blockedDaysMap.get(ymd) || []
    
    days.push({
      day: d,
      ymd,
      isBlocked: blockingPeriods.length > 0,
      blockingPeriods,
      isToday: ymd === todayStr,
      isPast: ymd < todayStr,
    })
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
        {days.map((day, idx) => (
          <div 
            key={idx}
            onClick={() => day && day.isBlocked && onDayClick?.(day.ymd, day.blockingPeriods)}
            className={`aspect-square flex items-center justify-center rounded text-[10px] ${
              !day 
                ? '' 
                : day.isToday
                  ? 'border-2 border-black bg-[#FFD84A] font-bold'
                  : day.isBlocked
                    ? `bg-red-400 text-white ${onDayClick ? 'cursor-pointer hover:bg-red-500' : ''}`
                    : day.isPast
                      ? 'bg-black/5 text-black/30'
                      : 'bg-emerald-50 text-black'
            }`}
            title={day?.isBlocked ? `Blocked: ${day.blockingPeriods.map(p => p.summary || 'Unknown').join(', ')}` : undefined}
          >
            {day?.day}
          </div>
        ))}
      </div>
    </div>
  )
}
