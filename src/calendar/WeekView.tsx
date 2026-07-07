import type { CalendarEvent } from '../features/events/types'
import { getWeekDays } from '../features/events/dateUtils'
import { TimeGrid } from './TimeGrid'

interface WeekViewProps {
  currentDate: Date
  onSlotClick: (date: Date) => void
  onEventClick: (event: CalendarEvent) => void
}

export function WeekView({ currentDate, onSlotClick, onEventClick }: WeekViewProps) {
  const days = getWeekDays(currentDate)
  return <TimeGrid days={days} onSlotClick={onSlotClick} onEventClick={onEventClick} />
}
