import type { CalendarEvent } from './types'

function cacheKey(userId: string): string {
  return `calendar-events-cache:${userId}`
}

export function readCache(userId: string): CalendarEvent[] {
  const raw = localStorage.getItem(cacheKey(userId))
  if (!raw) return []
  try {
    return JSON.parse(raw) as CalendarEvent[]
  } catch {
    return []
  }
}

export function writeCache(userId: string, events: CalendarEvent[]): void {
  localStorage.setItem(cacheKey(userId), JSON.stringify(events))
}
