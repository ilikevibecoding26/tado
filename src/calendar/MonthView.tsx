import { endOfDay, startOfDay } from 'date-fns'
import type { CalendarEvent } from '../features/events/types'
import { useEventsContext } from '../features/events/EventsContext'
import { getMonthGrid, isSameDay, isSameMonth, formatWeekdayLabel } from '../features/events/dateUtils'
import { MonthDayCell } from './MonthDayCell'
import { EmptyStateBanner } from './EmptyStateBanner'
import './MonthView.css'

interface MonthViewProps {
  currentDate: Date
  onSlotClick: (date: Date) => void
  onEventClick: (event: CalendarEvent) => void
}

export function MonthView({ currentDate, onSlotClick, onEventClick }: MonthViewProps) {
  const { getEventsInRange } = useEventsContext()
  const days = getMonthGrid(currentDate)
  const rangeStart = startOfDay(days[0])
  const rangeEnd = endOfDay(days[days.length - 1])
  const eventsInRange = getEventsInRange(rangeStart, rangeEnd)
  const today = new Date()

  const eventsForDay = (day: Date) =>
    eventsInRange.filter((event) => {
      const eventStart = new Date(event.start)
      const eventEnd = new Date(event.end)
      return eventStart < endOfDay(day) && eventEnd > startOfDay(day)
    })

  return (
    <div className="month-view">
      {eventsInRange.length === 0 && <EmptyStateBanner />}
      <div className="month-view-weekdays">
        {days.slice(0, 7).map((day) => (
          <div key={day.toISOString()} className="month-view-weekday">
            {formatWeekdayLabel(day)}
          </div>
        ))}
      </div>
      <div className="month-view-grid">
        {days.map((day) => (
          <MonthDayCell
            key={day.toISOString()}
            date={day}
            isCurrentMonth={isSameMonth(day, currentDate)}
            isToday={isSameDay(day, today)}
            events={eventsForDay(day)}
            onSlotClick={onSlotClick}
            onEventClick={onEventClick}
          />
        ))}
      </div>
    </div>
  )
}
