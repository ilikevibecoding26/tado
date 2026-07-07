export type EventColor = 'blue' | 'green' | 'red' | 'yellow' | 'purple' | 'gray'

export interface CalendarEvent {
  id: string
  title: string
  start: string
  end: string
  allDay: boolean
  description?: string
  color?: EventColor
}
