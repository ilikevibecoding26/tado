import { endOfDay, setHours, setMinutes, startOfDay } from 'date-fns'
import type { CalendarEvent } from '../features/events/types'
import { useEventsContext } from '../features/events/EventsContext'
import { formatDayLabel, formatTimeLabel, getHoursOfDay, isSameDay } from '../features/events/dateUtils'
import { EventChip } from './EventChip'
import { EmptyStateBanner } from './EmptyStateBanner'
import './TimeGrid.css'

interface TimeGridProps {
  days: Date[]
  onSlotClick: (date: Date) => void
  onEventClick: (event: CalendarEvent) => void
}

const HOUR_HEIGHT = 48

function formatHourLabel(hour: number): string {
  return formatTimeLabel(setMinutes(setHours(new Date(), hour), 0))
}

export function TimeGrid({ days, onSlotClick, onEventClick }: TimeGridProps) {
  const { getEventsInRange } = useEventsContext()
  const rangeStart = startOfDay(days[0])
  const rangeEnd = endOfDay(days[days.length - 1])
  const events = getEventsInRange(rangeStart, rangeEnd)
  const hours = getHoursOfDay()
  const today = new Date()
  const columns = `60px repeat(${days.length}, 1fr)`

  const allDayEventsFor = (day: Date) =>
    events.filter((event) => event.allDay && new Date(event.start) < endOfDay(day) && new Date(event.end) > startOfDay(day))

  const timedEventsFor = (day: Date) => events.filter((event) => !event.allDay && isSameDay(new Date(event.start), day))

  const eventStyle = (event: CalendarEvent) => {
    const start = new Date(event.start)
    const end = new Date(event.end)
    const startMinutes = start.getHours() * 60 + start.getMinutes()
    const endMinutes = Math.max(end.getHours() * 60 + end.getMinutes(), startMinutes + 30)
    return {
      top: (startMinutes / 60) * HOUR_HEIGHT,
      height: ((endMinutes - startMinutes) / 60) * HOUR_HEIGHT,
    }
  }

  return (
    <div className="time-grid">
      {events.length === 0 && <EmptyStateBanner />}
      <div className="time-grid-row" style={{ gridTemplateColumns: columns }}>
        <div className="time-grid-gutter" />
        {days.map((day) => (
          <div key={day.toISOString()} className={`time-grid-day-header${isSameDay(day, today) ? ' today' : ''}`}>
            {formatDayLabel(day)}
          </div>
        ))}
      </div>
      <div className="time-grid-row time-grid-allday" style={{ gridTemplateColumns: columns }}>
        <div className="time-grid-gutter">All day</div>
        {days.map((day) => (
          <div key={day.toISOString()} className="time-grid-allday-cell" onClick={() => onSlotClick(day)}>
            {allDayEventsFor(day).map((event) => (
              <EventChip key={event.id} event={event} onClick={onEventClick} />
            ))}
          </div>
        ))}
      </div>
      <div className="time-grid-scroll">
        <div className="time-grid-row time-grid-hours" style={{ gridTemplateColumns: columns }}>
          <div className="time-grid-gutter-col">
            {hours.map((hour) => (
              <div key={hour} className="time-grid-hour-label" style={{ height: HOUR_HEIGHT }}>
                {formatHourLabel(hour)}
              </div>
            ))}
          </div>
          {days.map((day) => (
            <div key={day.toISOString()} className="time-grid-day-column">
              {hours.map((hour) => (
                <div
                  key={hour}
                  className="time-grid-hour-cell"
                  style={{ height: HOUR_HEIGHT }}
                  onClick={() => onSlotClick(setMinutes(setHours(day, hour), 0))}
                />
              ))}
              {timedEventsFor(day).map((event) => {
                const style = eventStyle(event)
                return (
                  <button
                    key={event.id}
                    type="button"
                    className={`time-grid-event event-chip-${event.color ?? 'blue'}`}
                    style={{ top: style.top, height: style.height }}
                    onClick={(e) => {
                      e.stopPropagation()
                      onEventClick(event)
                    }}
                  >
                    {event.title}
                  </button>
                )
              })}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
