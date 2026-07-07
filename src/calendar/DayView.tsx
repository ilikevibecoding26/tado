import type { CalendarEvent } from '../features/events/types'
import { TimeGrid } from './TimeGrid'

interface DayViewProps {
  currentDate: Date
  onSlotClick: (date: Date) => void
  onEventClick: (event: CalendarEvent) => void
}

export function DayView({ currentDate, onSlotClick, onEventClick }: DayViewProps) {
  return <TimeGrid days={[currentDate]} onSlotClick={onSlotClick} onEventClick={onEventClick} />
}
