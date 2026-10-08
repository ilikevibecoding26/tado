import { useEffect } from 'react'
import { getAppearance, showNotice, startParty } from '../features/theme/appearance'
import { isLateNight } from '../features/fun/timeOfDay'
import { recordVisit, streakMessage } from '../features/fun/streak'

let greeted = false

// Once each time TaDo opens: note a streak of days in a row, and, after midnight, a sleepy word.
// Both only appear when theme effects are on. The timers are left running on purpose: this component
// lives for the whole session, and React's dev-mode double run would otherwise cancel them.
export function DailyHello() {
  useEffect(() => {
    if (greeted) return
    greeted = true
    const { count, isNewDay } = recordVisit()
    let delay = 1500
    const message = isNewDay ? streakMessage(count) : null
    if (message) {
      setTimeout(() => {
        if (getAppearance().effects === 'off') return
        showNotice(message)
        if (count === 30 || count === 100) startParty()
      }, delay)
      delay += 4000
    }
    if (isLateNight()) {
      setTimeout(() => {
        if (getAppearance().effects !== 'off') showNotice("It's late. The mascot yawns.")
      }, delay)
    }
  }, [])

  return null
}
