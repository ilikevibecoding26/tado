import { useEffect } from 'react'
import { reactWith, useAppearance } from '../features/theme/appearance'
import { clockNow } from '../features/fun/timeOfDay'

const WISH_TIMES = ['11:11', '23:11']

// A secret: if the app is open when the clock reads 11:11, the mascot suggests making a wish (Calm and All out only).
export function WishTime() {
  const { effects } = useAppearance()

  useEffect(() => {
    if (effects === 'off') return
    let firedFor = ''
    const check = () => {
      const time = clockNow()
      if (!WISH_TIMES.includes(time) || document.visibilityState !== 'visible') return
      const key = `${new Date().toDateString()} ${time}`
      if (key === firedFor) return
      firedFor = key
      reactWith('wish', '11:11 - make a wish!', 6000)
    }
    check()
    const timer = setInterval(check, 5000)
    return () => clearInterval(timer)
  }, [effects])

  return null
}
