import { useEffect } from 'react'
import { useAppearance } from '../features/theme/appearance'
import { burstConfetti, rainShapes } from '../features/fun/confetti'
import { playPop, playWhoosh } from '../features/fun/sound'
import { flyPlane } from '../features/fun/plane'

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
    } else if (magic.word === 'flight') {
      flyPlane()
      playPop()
    } else if (magic.word === 'wish') {
      burstConfetti(window.innerWidth / 2, window.innerHeight * 0.3)
      playPop(undefined, 1.5)
    } else if (magic.word === 'exam') {
      playPop(undefined, 1.2)
    } else if (magic.word === 'timewarp') {
      playWhoosh()
    }
  }, [magic])

  return null
}
