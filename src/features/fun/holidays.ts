export type HolidayId = 'halloween' | 'christmas' | 'newyear' | 'valentines' | 'stpatrick'

const HOLIDAYS: readonly HolidayId[] = ['halloween', 'christmas', 'newyear', 'valentines', 'stpatrick']

// Adding ?holiday=halloween (or christmas, newyear, valentines, stpatrick) to the address
// shows that holiday any time of year.
function forcedHoliday(): HolidayId | null {
  try {
    const value = new URLSearchParams(window.location.search).get('holiday')
    return HOLIDAYS.find((id) => id === value) ?? null
  } catch {
    return null
  }
}

const forced = forcedHoliday()

export function getHoliday(date: Date = new Date()): HolidayId | null {
  if (forced) return forced
  const month = date.getMonth() + 1
  const day = date.getDate()
  if (month === 10 && day >= 25) return 'halloween'
  if (month === 12 && day >= 20 && day <= 26) return 'christmas'
  if ((month === 12 && day === 31) || (month === 1 && day <= 2)) return 'newyear'
  if (month === 2 && day >= 13 && day <= 14) return 'valentines'
  if (month === 3 && day >= 16 && day <= 17) return 'stpatrick'
  return null
}

// The stretch of the year each holiday theme can be picked in Settings (inclusive, as [month, day]).
const SEASONS: Record<HolidayId, { from: [number, number]; to: [number, number] }> = {
  halloween: { from: [10, 1], to: [11, 1] },
  christmas: { from: [12, 1], to: [12, 31] },
  newyear: { from: [12, 26], to: [1, 7] },
  valentines: { from: [2, 1], to: [2, 14] },
  stpatrick: { from: [3, 1], to: [3, 17] },
}

/** Whether a holiday theme can be picked right now (always, when previewing with ?holiday=). */
export function isInSeason(id: HolidayId, date: Date = new Date()): boolean {
  if (forced === id) return true
  const today = (date.getMonth() + 1) * 100 + date.getDate()
  const { from, to } = SEASONS[id]
  const start = from[0] * 100 + from[1]
  const end = to[0] * 100 + to[1]
  // A season that wraps past New Year (December into January).
  return start <= end ? today >= start && today <= end : today >= start || today <= end
}
