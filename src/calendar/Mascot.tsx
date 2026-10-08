import { useAppearance } from '../features/theme/appearance'
import { CalendarGuy, MASCOTS } from './mascots'

// The friendly calendar character. With theme effects off it's always the original;
// otherwise it becomes the active theme's character.
export function Mascot({ size = 56 }: { size?: number }) {
  const { theme, effects } = useAppearance()
  const Character = effects === 'off' ? CalendarGuy : MASCOTS[theme]
  return (
    <svg className="mascot" viewBox="0 0 100 100" width={size} height={size} role="img" aria-hidden="true" focusable="false">
      <Character />
    </svg>
  )
}
