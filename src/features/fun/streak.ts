import { differenceInCalendarDays, format, parseISO } from 'date-fns'

// Counts the days in a row TaDo has been opened, on this device.
const KEY = 'tado-streak'

interface StreakRecord {
  /** The last day it was opened, as yyyy-MM-dd. */
  day: string
  count: number
}

function read(): StreakRecord | null {
  try {
    const parsed = JSON.parse(localStorage.getItem(KEY) ?? 'null') as Partial<StreakRecord> | null
    return parsed && typeof parsed.day === 'string' && typeof parsed.count === 'number' ? { day: parsed.day, count: parsed.count } : null
  } catch {
    return null
  }
}

/** Records today's visit. `isNewDay` is true only the first time it's opened each day. */
export function recordVisit(now: Date = new Date()): { count: number; isNewDay: boolean } {
  const today = format(now, 'yyyy-MM-dd')
  const last = read()
  if (last && last.day === today) return { count: last.count, isNewDay: false }
  const count = last && differenceInCalendarDays(now, parseISO(last.day)) === 1 ? last.count + 1 : 1
  try {
    localStorage.setItem(KEY, JSON.stringify({ day: today, count }))
  } catch {
    // Without storage the streak just can't build up; that's fine.
  }
  return { count, isNewDay: true }
}

/** What the mascot says about a streak, or null for days that aren't worth mentioning. */
export function streakMessage(count: number): string | null {
  if (count >= 100) return `${count} days in a row. Absolutely legendary.`
  if (count === 30) return '30 days straight. Legendary.'
  if (count === 14) return 'Two weeks in a row!'
  if (count === 7) return 'A whole week in a row!'
  if (count >= 2) return `Day ${count} in a row!`
  return null
}
