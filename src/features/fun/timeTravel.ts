/** True for years far from now, where the calendar starts to feel lost in time. */
export function isFarYear(year: number): boolean {
  return year >= 2100 || year < 1900
}

/** What the mascot says on arriving in a far-off year. */
export function timeTravelLine(year: number): string {
  if (year >= 2500) return "You've gone too far! Even I'm lost."
  if (year >= 2100) return `The year ${year}? Do they still have calendars here?`
  if (year >= 1500) return `${year}? Was there even a calendar app back then?`
  return 'Way too far back! Watch out for dinosaurs.'
}
