import { useCallback, useEffect, useMemo, useState } from 'react'
import { addDays, differenceInCalendarDays } from 'date-fns'
import type { CalendarEvent } from './types'
import { dayKey, expandEvents } from './recurrence'
import { useSharedEvents } from './useSharedEvents'
import { createSupabaseEventRepository } from './supabaseEventRepository'

export function useEvents(userId: string) {
  const repository = useMemo(() => createSupabaseEventRepository(userId), [userId])
  const [events, setEvents] = useState<CalendarEvent[]>([])
  const [loaded, setLoaded] = useState(false)
  const [syncError, setSyncError] = useState<string | null>(null)
  const { sharedEvents, invites, respondToInvite, leaveShare } = useSharedEvents(userId)

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

  // Your events plus the ones shared with you. Repeating events come back as one event per occurrence.
  const getEventsInRange = useCallback(
    (start: Date, end: Date) => expandEvents([...events, ...sharedEvents], start, end),
    [events, sharedEvents],
  )

  // Leave one day out of a repeating event (deleting it, or editing it on its own).
  const skipOccurrence = useCallback(
    async (seriesId: string, day: string) => {
      const series = events.find((existing) => existing.id === seriesId)
      if (!series?.recurrence) return
      const skip = [...new Set([...(series.recurrence.skip ?? []), day])]
      await updateEvent({ ...series, recurrence: { ...series.recurrence, skip } })
    },
    [events, updateEvent],
  )

  // Edit one occurrence on its own: it becomes an ordinary event and its slot in the series is skipped.
  const editOccurrence = useCallback(
    async (occurrence: CalendarEvent, input: Omit<CalendarEvent, 'id'>) => {
      if (!occurrence.seriesId) return
      await addEvent({ ...input, recurrence: undefined })
      await skipOccurrence(occurrence.seriesId, dayKey(new Date(occurrence.start)))
    },
    [addEvent, skipOccurrence],
  )

  // Edit every occurrence: the whole series moves by however far this occurrence was moved.
  const editSeries = useCallback(
    async (occurrence: CalendarEvent, input: Omit<CalendarEvent, 'id'>) => {
      const series = events.find((existing) => existing.id === occurrence.seriesId)
      if (!series) return
      const oldStart = new Date(occurrence.start)
      const newStart = new Date(input.start)
      const shiftDays = differenceInCalendarDays(newStart, oldStart)
      const seriesStart = new Date(series.start)
      const first = addDays(seriesStart, shiftDays)
      first.setHours(newStart.getHours(), newStart.getMinutes(), 0, 0)
      const length = new Date(input.end).getTime() - newStart.getTime()
      const recurrence = input.recurrence
        ? {
            ...input.recurrence,
            skip: (series.recurrence?.skip ?? []).map((day) => {
              const [y, m, d] = day.split('-').map(Number)
              return dayKey(addDays(new Date(y, m - 1, d), shiftDays))
            }),
          }
        : undefined
      await updateEvent({
        ...series,
        ...input,
        id: series.id,
        start: first.toISOString(),
        end: input.allDay
          ? addDays(first, differenceInCalendarDays(new Date(input.end), newStart)).toISOString()
          : new Date(first.getTime() + length).toISOString(),
        recurrence,
      })
    },
    [events, updateEvent],
  )

  return {
    events,
    loaded,
    syncError,
    addEvent,
    updateEvent,
    deleteEvent,
    getEventsInRange,
    skipOccurrence,
    editOccurrence,
    editSeries,
    invites,
    respondToInvite,
    leaveShare,
  }
}
