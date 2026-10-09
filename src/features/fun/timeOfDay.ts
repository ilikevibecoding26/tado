// Adding ?hour=2 to the address pretends it's that hour, so the late-night extras can be previewed any time.
function forcedHour(): number | null {
  try {
    const value = new URLSearchParams(window.location.search).get('hour')
    if (value === null) return null
    const hour = Number(value)
    return Number.isInteger(hour) && hour >= 0 && hour <= 23 ? hour : null
  } catch {
    return null
  }
}

const forced = forcedHour()

/** Between midnight and 5am. */
export function isLateNight(date: Date = new Date()): boolean {
  return (forced ?? date.getHours()) < 5
}

// Adding ?clock=11:11 to the address pretends it's that time, so the 11:11 wish can be previewed any time.
function forcedClock(): string | null {
  try {
    const value = new URLSearchParams(window.location.search).get('clock')
    return value && /^\d{1,2}:\d{2}$/.test(value) ? value.padStart(5, '0') : null
  } catch {
    return null
  }
}

const forcedTime = forcedClock()

/** The time as `HH:MM` on a 24-hour clock. */
export function clockNow(date: Date = new Date()): string {
  return forcedTime ?? `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`
}
