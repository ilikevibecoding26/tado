import { useCallback, useEffect, useMemo, useState } from 'react'
import type { CalendarEvent } from './types'
import { createSupabaseEventRepository } from './supabaseEventRepository'

export function useEvents(userId: string) {
  const repository = useMemo(() => createSupabaseEventRepository(userId), [userId])
  const [events, setEvents] = useState<CalendarEvent[]>([])
  const [loaded, setLoaded] = useState(false)
  const [syncError, setSyncError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    setLoaded(false)
    repository.getAll().then((loadedEvents) => {
      if (!cancelled) {
        setEvents(loadedEvents)
        setLoaded(true)
      }
    })
    return () => {
      cancelled = true
    }
  }, [repository])

  useEffect(() => {
    const unsubscribe = repository.subscribe((change) => {
      setEvents((prev) => {
        if (change.type === 'delete') {
          return prev.filter((existing) => existing.id !== change.id)
        }
        const index = prev.findIndex((existing) => existing.id === change.event.id)
        if (index === -1) return [...prev, change.event]
        const next = [...prev]
        next[index] = change.event
        return next
      })
    })
    return unsubscribe
  }, [repository])

  const addEvent = useCallback(
    async (input: Omit<CalendarEvent, 'id'>) => {
      const event: CalendarEvent = { ...input, id: crypto.randomUUID() }
      setEvents((prev) => [...prev, event])
      setSyncError(null)
      try {
        await repository.save(event)
      } catch {
        setEvents((prev) => prev.filter((existing) => existing.id !== event.id))
        setSyncError("Couldn't save — check your connection.")
      }
    },
    [repository],
  )

  const updateEvent = useCallback(
    async (event: CalendarEvent) => {
      const previous = events.find((existing) => existing.id === event.id)
      setEvents((prev) => prev.map((existing) => (existing.id === event.id ? event : existing)))
      setSyncError(null)
      try {
        await repository.save(event)
      } catch {
        if (previous) {
          setEvents((prev) => prev.map((existing) => (existing.id === event.id ? previous : existing)))
        }
        setSyncError("Couldn't save — check your connection.")
      }
    },
    [repository, events],
  )

  const deleteEvent = useCallback(
    async (id: string) => {
      const previous = events.find((existing) => existing.id === id)
      setEvents((prev) => prev.filter((existing) => existing.id !== id))
      setSyncError(null)
      try {
        await repository.remove(id)
      } catch {
        if (previous) {
          setEvents((prev) => [...prev, previous])
        }
        setSyncError("Couldn't delete — check your connection.")
      }
    },
    [repository, events],
  )

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

  return { events, loaded, syncError, addEvent, updateEvent, deleteEvent, getEventsInRange }
}
