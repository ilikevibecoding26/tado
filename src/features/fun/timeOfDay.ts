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
