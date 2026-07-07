import { useState } from 'react'
import type { CalendarEvent } from '../features/events/types'
import { EventChip } from './EventChip'
import './MonthDayCell.css'

interface MonthDayCellProps {
  date: Date
  isCurrentMonth: boolean
  isToday: boolean
  events: CalendarEvent[]
  onSlotClick: (date: Date) => void
  onEventClick: (event: CalendarEvent) => void
}

const VISIBLE_LIMIT = 3

export function MonthDayCell({ date, isCurrentMonth, isToday, events, onSlotClick, onEventClick }: MonthDayCellProps) {
  const [expanded, setExpanded] = useState(false)
  const visibleEvents = expanded ? events : events.slice(0, VISIBLE_LIMIT)
  const hiddenCount = events.length - visibleEvents.length

  return (
    <div
      className={`month-day-cell${isCurrentMonth ? '' : ' outside-month'}`}
      onClick={() => onSlotClick(date)}
    >
      <span className={`month-day-number${isToday ? ' today' : ''}`}>{date.getDate()}</span>
      <div className="month-day-events">
        {visibleEvents.map((event) => (
          <EventChip key={event.id} event={event} onClick={onEventClick} />
        ))}
        {hiddenCount > 0 && (
          <button
            type="button"
            className="month-day-more"
            onClick={(e) => {
              e.stopPropagation()
              setExpanded(true)
            }}
          >
            +{hiddenCount} more
          </button>
        )}
      </div>
    </div>
  )
}
