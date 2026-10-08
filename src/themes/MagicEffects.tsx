import { useEffect } from 'react'
import { useAppearance } from '../features/theme/appearance'
import { burstConfetti, rainShapes } from '../features/fun/confetti'
import { playPop } from '../features/fun/sound'

// The screen-wide part of a magic word's reaction (the mascot's own reaction lives in Mascot.tsx).
export function MagicEffects() {
  const { magic } = useAppearance()

  useEffect(() => {
    if (!magic) return
    if (magic.word === 'birthday') {
      burstConfetti(window.innerWidth / 2, window.innerHeight * 0.35)
      playPop()
    } else if (magic.word === 'pizza') {
      rainShapes('pizza')
      playPop()
    }
  }, [magic])

  return null
}
