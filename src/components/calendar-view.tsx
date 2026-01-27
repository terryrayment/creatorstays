'use client'

import { useState, useMemo } from 'react'
import { BlockedPeriod } from '@/lib/ical'

interface CalendarViewProps {
  blockedDates: BlockedPeriod[]
  monthsToShow?: number
}

export function CalendarView({ blockedDates, monthsToShow = 3 }: CalendarViewProps) {
  const [startMonth, setStartMonth] = useState(() => {
    const now = new Date()
    return new Date(now.getFullYear(), now.getMonth(), 1)
  })

  // Build a set of all blocked days for O(1) lookup
  const blockedDays = useMemo(() => {
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

  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const todayStr = today.toISOString().split('T')[0]

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
            blockedDays={blockedDays}
            todayStr={todayStr}
          />
        ))}
      </div>

      {/* Stats */}
      <div className="mt-4 flex items-center justify-center gap-6 border-t border-black/10 pt-3 text-[10px] text-black/60">
        <span>{blockedDates.length} blocked periods</span>
        <span>{blockedDays.size} days unavailable</span>
      </div>
    </div>
  )
}

function MonthCalendar({ 
  month, 
  blockedDays,
  todayStr 
}: { 
  month: Date
  blockedDays: Set<string>
  todayStr: string
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
    const dateStr = `${month.getFullYear()}-${String(month.getMonth() + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`
    days.push({
      day: d,
      dateStr,
      isBlocked: blockedDays.has(dateStr),
      isToday: dateStr === todayStr,
      isPast: dateStr < todayStr,
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
            className={`aspect-square flex items-center justify-center rounded text-[10px] ${
              !day 
                ? '' 
                : day.isToday
                  ? 'border-2 border-black bg-[#FFD84A] font-bold'
                  : day.isBlocked
                    ? 'bg-red-400 text-white'
                    : day.isPast
                      ? 'bg-black/5 text-black/30'
                      : 'bg-emerald-50 text-black'
            }`}
          >
            {day?.day}
          </div>
        ))}
      </div>
    </div>
  )
}
