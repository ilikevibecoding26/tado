import type { MouseEvent } from 'react'
import { registerMascotTap, useAppearance } from '../features/theme/appearance'
import { burstConfetti } from '../features/fun/confetti'
import { playPop } from '../features/fun/sound'
import { CalendarGuy, MASCOTS } from './mascots'

// The friendly calendar character. With theme effects off it's always the original;
// otherwise it's the active theme's character (or a guest you've found, see appearance.ts).
// Tapping it five times in a row is a secret: it swaps in the next character.
export function Mascot({ size = 56 }: { size?: number }) {
  const { theme, effects, mascot } = useAppearance()
  const Character = effects === 'off' ? CalendarGuy : MASCOTS[mascot ?? theme]

  const handleTap = (e: MouseEvent<SVGSVGElement>) => {
    if (registerMascotTap()) {
      const rect = e.currentTarget.getBoundingClientRect()
      burstConfetti(rect.left + rect.width / 2, rect.top + rect.height / 2)
      playPop()
    }
  }

  return (
    <svg
      className="mascot"
      viewBox="0 0 100 100"
      width={size}
      height={size}
      role="img"
      aria-hidden="true"
      focusable="false"
      onClick={handleTap}
    >
      <Character />
    </svg>
  )
}
