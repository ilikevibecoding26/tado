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
