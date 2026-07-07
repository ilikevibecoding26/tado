import type { CalendarEvent } from '../features/events/types'
import { formatTimeLabel } from '../features/events/dateUtils'
import './EventChip.css'

interface EventChipProps {
  event: CalendarEvent
  onClick: (event: CalendarEvent) => void
}

export function EventChip({ event, onClick }: EventChipProps) {
  return (
    <button
      type="button"
      className={`event-chip event-chip-${event.color ?? 'blue'}`}
      onClick={(e) => {
        e.stopPropagation()
        onClick(event)
      }}
    >
      {!event.allDay && <span className="event-chip-time">{formatTimeLabel(new Date(event.start))}</span>}
      <span className="event-chip-title">{event.title}</span>
    </button>
  )
}
