import { useEffect, useRef, useState } from 'react'
import type { CSSProperties, MouseEvent } from 'react'
import { createPortal } from 'react-dom'
import { registerMascotTap, useAppearance } from '../features/theme/appearance'
import { burstConfetti } from '../features/fun/confetti'
import { playPop } from '../features/fun/sound'
import { getHoliday } from '../features/fun/holidays'
import { pickMascotLine } from '../features/fun/mascotLines'
import { CalendarGuy, MASCOTS } from './mascots'
import { Costume } from './costumes'

const HOLD_MS = 600
const BUBBLE_MS = 4500
const BUBBLE_WIDTH = 220
const EDGE = 12

// CSS custom properties aren't part of CSSProperties, so name the one we set.
type BubbleStyle = CSSProperties & { '--arrow-x': string }

interface Bubble {
  text: string
  placement: 'above' | 'below'
  style: BubbleStyle
}

// The bubble is drawn on the page itself (not inside the calendar's scrolling area, which would clip it),
// below the mascot when there's room and above it otherwise, and kept on screen.
function placeBubble(text: string, rect: DOMRect): Bubble {
  const width = Math.min(BUBBLE_WIDTH, window.innerWidth - EDGE * 2)
  const left = Math.min(Math.max(EDGE, rect.left), window.innerWidth - width - EDGE)
  const arrowX = Math.min(Math.max(rect.left + rect.width / 2 - left, 16), width - 16)
  const below = window.innerHeight - rect.bottom >= 130 || rect.top < 130
  const style: BubbleStyle = {
    left,
    width,
    '--arrow-x': `${arrowX}px`,
    ...(below ? { top: rect.bottom + 12 } : { bottom: window.innerHeight - rect.top + 12 }),
  }
  return { text, placement: below ? 'below' : 'above', style }
}

// The friendly calendar character. With theme effects off it's always the original;
// otherwise it's the active theme's character (or a guest you've found, see appearance.ts).
// Secrets, on Calm and All out only:
//   tap five times in a row   -> the next character (keep going to ten for a party)
//   press and hold            -> it says something in its own voice
//   on certain holidays       -> it wears a costume
export function Mascot({ size = 56 }: { size?: number }) {
  const { theme, effects, mascot } = useAppearance()
  const character = mascot ?? theme
  const Character = effects === 'off' ? CalendarGuy : MASCOTS[character]
  const holiday = effects === 'off' ? null : getHoliday()

  const [bubble, setBubble] = useState<Bubble | null>(null)
  const svgRef = useRef<SVGSVGElement>(null)
  const holdTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const bubbleTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const held = useRef(false)

  useEffect(() => {
    return () => {
      if (holdTimer.current) clearTimeout(holdTimer.current)
      if (bubbleTimer.current) clearTimeout(bubbleTimer.current)
    }
  }, [])

  const cancelHold = () => {
    if (holdTimer.current) clearTimeout(holdTimer.current)
    holdTimer.current = null
  }

  const startHold = () => {
    if (effects === 'off') return
    held.current = false
    cancelHold()
    holdTimer.current = setTimeout(() => {
      held.current = true
      if (svgRef.current) {
        setBubble(placeBubble(pickMascotLine(character), svgRef.current.getBoundingClientRect()))
      }
      if (bubbleTimer.current) clearTimeout(bubbleTimer.current)
      bubbleTimer.current = setTimeout(() => setBubble(null), BUBBLE_MS)
    }, HOLD_MS)
  }

  const handleTap = (e: MouseEvent<SVGSVGElement>) => {
    // The click that ends a long press isn't a tap.
    if (held.current) {
      held.current = false
      return
    }
    if (registerMascotTap() === 'swap') {
      const rect = e.currentTarget.getBoundingClientRect()
      burstConfetti(rect.left + rect.width / 2, rect.top + rect.height / 2)
      playPop()
    }
  }

  return (
    <span className="mascot-wrap">
      <svg
        ref={svgRef}
        className="mascot"
        viewBox="0 0 100 100"
        width={size}
        height={size}
        role="img"
        aria-hidden="true"
        focusable="false"
        onClick={handleTap}
        onPointerDown={startHold}
        onPointerUp={cancelHold}
        onPointerLeave={cancelHold}
        onPointerCancel={cancelHold}
        onContextMenu={(e) => {
          if (effects !== 'off') e.preventDefault()
        }}
      >
        <Character />
        {holiday && <Costume holiday={holiday} mascot={character} />}
      </svg>
      {bubble &&
        createPortal(
          <span className={`mascot-bubble ${bubble.placement}`} style={bubble.style} role="status">
            {bubble.text}
          </span>,
          document.body,
        )}
    </span>
  )
}
