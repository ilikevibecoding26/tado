import {
  addDays,
  addMonths,
  addWeeks,
  eachDayOfInterval,
  endOfMonth,
  endOfWeek,
  isSameDay,
  isSameMonth,
  startOfMonth,
  startOfWeek,
} from 'date-fns'

export type CalendarView = 'month' | 'week' | 'day'

export function getMonthGrid(date: Date): Date[] {
  const start = startOfWeek(startOfMonth(date))
  const end = endOfWeek(endOfMonth(date))
  return eachDayOfInterval({ start, end })
}

export function getWeekDays(date: Date): Date[] {
  const start = startOfWeek(date)
  const end = endOfWeek(date)
  return eachDayOfInterval({ start, end })
}

export function shiftDate(date: Date, view: CalendarView, direction: 1 | -1): Date {
  if (view === 'month') return addMonths(date, direction)
  if (view === 'week') return addWeeks(date, direction)
  return addDays(date, direction)
}

export function formatHeaderLabel(date: Date, view: CalendarView): string {
  if (view === 'month') {
    return new Intl.DateTimeFormat(undefined, { month: 'long', year: 'numeric' }).format(date)
  }
  if (view === 'day') {
    return new Intl.DateTimeFormat(undefined, {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    }).format(date)
  }
  const [start, end] = [startOfWeek(date), endOfWeek(date)]
  const startLabel = new Intl.DateTimeFormat(undefined, {
    month: 'short',
    day: 'numeric',
  }).format(start)
  const endLabel = new Intl.DateTimeFormat(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(end)
  return `${startLabel} – ${endLabel}`
}

export function formatDayLabel(date: Date): string {
  return new Intl.DateTimeFormat(undefined, { weekday: 'short', day: 'numeric' }).format(date)
}

export function formatWeekdayLabel(date: Date): string {
  return new Intl.DateTimeFormat(undefined, { weekday: 'short' }).format(date)
}

export function formatTimeLabel(date: Date): string {
  return new Intl.DateTimeFormat(undefined, { hour: 'numeric', minute: '2-digit' }).format(date)
}

export function getHoursOfDay(): number[] {
  return Array.from({ length: 24 }, (_, hour) => hour)
}

export { isSameDay, isSameMonth }
