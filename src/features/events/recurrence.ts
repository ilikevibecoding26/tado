import {
  addDays,
  addMonths,
  addWeeks,
  addYears,
  differenceInCalendarDays,
  differenceInCalendarMonths,
  differenceInCalendarYears,
  format,
  startOfWeek,
} from 'date-fns'
import type { CalendarEvent, Recurrence, RepeatUnit } from './types'

const DAY_FORMAT = 'yyyy-MM-dd'
// A guard so a bad rule can never lock up the page.
const MAX_STEPS = 5000

export function dayKey(date: Date): string {
  return format(date, DAY_FORMAT)
}

// Roughly how many days one step of each kind covers, for working out where to start looking.
const UNIT_DAYS: Record<RepeatUnit, number> = { daily: 1, weekly: 7, monthly: 28, yearly: 365 }

/** The weekdays a weekly rule lands on, in order. */
export function weekdaysOf(recurrence: Recurrence, start: Date): number[] {
  const days = recurrence.weekdays?.length ? recurrence.weekdays : [start.getDay()]
  return [...new Set(days)].sort((a, b) => a - b)
}

// The start times that belong to step `k` of the rule (a weekly rule can land on several days per step).
function startsForStep(recurrence: Recurrence, first: Date, k: number): Date[] {
  const n = k * recurrence.interval
  switch (recurrence.freq) {
    case 'daily':
      return [addDays(first, n)]
    case 'weekly': {
      const weekStart = addWeeks(startOfWeek(first), n)
      return weekdaysOf(recurrence, first)
        .map((weekday) => {
          const day = addDays(weekStart, weekday)
          day.setHours(first.getHours(), first.getMinutes(), first.getSeconds(), first.getMilliseconds())
          return day
        })
        .filter((date) => dayKey(date) >= dayKey(first))
    }
    case 'monthly':
      return [addMonths(first, n)]
    case 'yearly':
      return [addYears(first, n)]
  }
}

function stepsBetween(freq: RepeatUnit, from: Date, to: Date): number {
  switch (freq) {
    case 'daily':
      return differenceInCalendarDays(to, from)
    case 'weekly':
      return Math.floor(differenceInCalendarDays(to, startOfWeek(from)) / 7)
    case 'monthly':
      return differenceInCalendarMonths(to, from)
    case 'yearly':
      return differenceInCalendarYears(to, from)
  }
}

function occurrenceEnd(event: CalendarEvent, first: Date, firstEnd: Date, start: Date): Date {
  if (event.allDay) return addDays(start, differenceInCalendarDays(firstEnd, first))
  return new Date(start.getTime() + (firstEnd.getTime() - first.getTime()))
}

/**
 * The events to show between `rangeStart` and `rangeEnd`: ordinary events as they are, and each
 * repeating event as one event per occurrence. An occurrence's id is `<series id>@<day>`.
 */
export function expandEvents(events: CalendarEvent[], rangeStart: Date, rangeEnd: Date): CalendarEvent[] {
  const result: CalendarEvent[] = []
  for (const event of events) {
    const start = new Date(event.start)
    const end = new Date(event.end)
    const recurrence = event.recurrence
    if (!recurrence) {
      if (start < rangeEnd && end >= rangeStart) result.push(event)
      continue
    }

    const interval = Math.max(1, recurrence.interval)
    const rule: Recurrence = { ...recurrence, interval }
    const skipped = new Set(recurrence.skip)
    const spanSteps = Math.ceil(Math.max(0, differenceInCalendarDays(end, start)) / (UNIT_DAYS[rule.freq] * interval)) + 1
    let k = Math.max(0, Math.floor(stepsBetween(rule.freq, start, rangeStart) / interval) - spanSteps - 1)

    for (let steps = 0; steps < MAX_STEPS; steps++, k++) {
      const starts = startsForStep(rule, start, k)
      if (starts.length === 0) continue
      if (starts[0] >= rangeEnd) break
      let pastUntil = false
      for (const occurrenceStart of starts) {
        const day = dayKey(occurrenceStart)
        if (rule.until && day > rule.until) {
          pastUntil = true
          break
        }
        if (skipped.has(day)) continue
        const occurrenceStop = occurrenceEnd(event, start, end, occurrenceStart)
        if (occurrenceStart < rangeEnd && occurrenceStop >= rangeStart) {
          result.push({
            ...event,
            id: `${event.id}@${day}`,
            seriesId: event.id,
            start: occurrenceStart.toISOString(),
            end: occurrenceStop.toISOString(),
          })
        }
      }
      if (pastUntil) break
    }
  }
  return result
}

const WEEKDAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
const UNIT_WORDS: Record<RepeatUnit, [string, string]> = {
  daily: ['day', 'days'],
  weekly: ['week', 'weeks'],
  monthly: ['month', 'months'],
  yearly: ['year', 'years'],
}

/** A short description such as "Every 2 weeks on Mon, Wed until Dec 1, 2026". */
export function describeRecurrence(recurrence: Recurrence, start: Date): string {
  const [one, many] = UNIT_WORDS[recurrence.freq]
  let text = recurrence.interval === 1 ? `Every ${one}` : `Every ${recurrence.interval} ${many}`
  if (recurrence.freq === 'weekly' && recurrence.weekdays && recurrence.weekdays.length > 0) {
    text += ` on ${weekdaysOf(recurrence, start).map((day) => WEEKDAY_NAMES[day]).join(', ')}`
  }
  if (recurrence.until) {
    const [year, month, day] = recurrence.until.split('-').map(Number)
    text += ` until ${new Intl.DateTimeFormat(undefined, { dateStyle: 'medium' }).format(new Date(year, month - 1, day))}`
  }
  return text
}
