import type { CalendarEvent } from './types'

export interface EventRepository {
  getAll(): Promise<CalendarEvent[]>
  save(event: CalendarEvent): Promise<void>
  remove(id: string): Promise<void>
}

export function createLocalStorageEventRepository(key = 'calendar-events'): EventRepository {
  function readAll(): CalendarEvent[] {
    const raw = localStorage.getItem(key)
    if (!raw) return []
    try {
      return JSON.parse(raw) as CalendarEvent[]
    } catch {
      return []
    }
  }

  function writeAll(events: CalendarEvent[]): void {
    localStorage.setItem(key, JSON.stringify(events))
  }

  return {
    async getAll() {
      return readAll()
    },
    async save(event) {
      const events = readAll()
      const index = events.findIndex((existing) => existing.id === event.id)
      if (index === -1) {
        events.push(event)
      } else {
        events[index] = event
      }
      writeAll(events)
    },
    async remove(id) {
      writeAll(readAll().filter((existing) => existing.id !== id))
    },
  }
}
