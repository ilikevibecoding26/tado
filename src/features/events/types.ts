export type EventColor = 'blue' | 'green' | 'red' | 'yellow' | 'purple' | 'gray'

export type RepeatUnit = 'daily' | 'weekly' | 'monthly' | 'yearly'

/** How an event repeats. Dates are local calendar days written as yyyy-MM-dd. */
export interface Recurrence {
  freq: RepeatUnit
  /** Every N days/weeks/months/years. */
  interval: number
  /** Weekly only: the days it lands on (0 = Sunday). Left out, it repeats on the start's weekday. */
  weekdays?: number[]
  /** The last day it can happen on. Left out, it repeats forever. */
  until?: string
  /** Days of single occurrences that were deleted or edited on their own. */
  skip?: string[]
}

export interface CalendarEvent {
  id: string
  title: string
  start: string
  end: string
  allDay: boolean
  description?: string
  color?: EventColor
  /** On a repeating event, how it repeats. `start`/`end` are then its first occurrence. */
  recurrence?: Recurrence
  /** Only on an occurrence made from a repeating event: the id of the event it comes from. */
  seriesId?: string
}
