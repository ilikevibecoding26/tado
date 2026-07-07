import type { CalendarEvent } from './types'

export interface EventRepository {
  getAll(): Promise<CalendarEvent[]>
  save(event: CalendarEvent): Promise<void>
  remove(id: string): Promise<void>
}
