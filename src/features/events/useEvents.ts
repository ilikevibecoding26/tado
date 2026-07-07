import { useCallback, useEffect, useState } from 'react'
import type { CalendarEvent } from './types'
import { createLocalStorageEventRepository } from './repository'

const repository = createLocalStorageEventRepository()

export function useEvents() {
  const [events, setEvents] = useState<CalendarEvent[]>([])
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    let cancelled = false
    repository.getAll().then((loadedEvents) => {
      if (!cancelled) {
        setEvents(loadedEvents)
        setLoaded(true)
      }
    })
    return () => {
      cancelled = true
    }
  }, [])

  const addEvent = useCallback(async (input: Omit<CalendarEvent, 'id'>) => {
    const event: CalendarEvent = { ...input, id: crypto.randomUUID() }
    await repository.save(event)
    setEvents((prev) => [...prev, event])
  }, [])

  const updateEvent = useCallback(async (event: CalendarEvent) => {
    await repository.save(event)
    setEvents((prev) => prev.map((existing) => (existing.id === event.id ? event : existing)))
  }, [])

  const deleteEvent = useCallback(async (id: string) => {
    await repository.remove(id)
    setEvents((prev) => prev.filter((existing) => existing.id !== id))
  }, [])

  const getEventsInRange = useCallback(
    (start: Date, end: Date) => {
      return events.filter((event) => {
        const eventStart = new Date(event.start)
        const eventEnd = new Date(event.end)
        return eventStart < end && eventEnd >= start
      })
    },
    [events],
  )

  return { events, loaded, addEvent, updateEvent, deleteEvent, getEventsInRange }
}
