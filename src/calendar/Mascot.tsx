import { useEffect, useRef, useState } from 'react'
import type { CSSProperties, MouseEvent, PointerEvent } from 'react'
import { createPortal } from 'react-dom'
import { registerMascotTap, useAppearance } from '../features/theme/appearance'
import { burstConfetti } from '../features/fun/confetti'
import { playPop } from '../features/fun/sound'
import { getHoliday } from '../features/fun/holidays'
import { isLateNight } from '../features/fun/timeOfDay'
import { pickMascotLine } from '../features/fun/mascotLines'
import { CalendarGuy, MASCOTS } from './mascots'
import { Costume } from './costumes'

const HOLD_MS = 600
const PET_RADIANS = Math.PI * 3
const PET_COOLDOWN_MS = 5000
const HEART_MS = 1600
const PET_LINES = ['Purrrr...', 'Mmm, that is nice.', 'A little to the left.', 'You are very good at this.']
const BUBBLE_MS = 4500
const BUBBLE_WIDTH = 220
const EDGE = 12

interface Heart {
  id: number
  x: number
  y: number
  drift: number
}

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
//   rub it in slow circles    -> it purrs and hearts float up
export function Mascot({ size = 56 }: { size?: number }) {
  const { theme, effects, mascot, magic } = useAppearance()
  const character = mascot ?? theme
  const Character = effects === 'off' ? CalendarGuy : MASCOTS[character]
  // A magic word in a new title can put a birthday hat on the mascot, make it jittery, or make it sleepy.
  const magicWord = effects === 'off' ? null : (magic?.word ?? null)
  // Between midnight and 5am the mascot droops and yawns.
  const sleepy = effects !== 'off' && (isLateNight() || magicWord === 'sleep')
  const costume = magicWord === 'birthday' ? 'birthday' : effects === 'off' ? null : getHoliday()

  const [bubble, setBubble] = useState<Bubble | null>(null)
  const svgRef = useRef<SVGSVGElement>(null)
  const holdTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const bubbleTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const held = useRef(false)
  const downAt = useRef<{ x: number; y: number } | null>(null)
  const pet = useRef({ lastAngle: null as number | null, total: 0, lastTime: 0, cooldownUntil: 0 })
  const [hearts, setHearts] = useState<Heart[]>([])

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

  // Rubbing in circles: add up how far the pointer swings around the mascot's middle.
  const handleMove = (e: PointerEvent<SVGSVGElement>) => {
    if (effects === 'off' || !svgRef.current) return
    if (downAt.current && Math.hypot(e.clientX - downAt.current.x, e.clientY - downAt.current.y) > 10) cancelHold()
    const rect = svgRef.current.getBoundingClientRect()
    const dx = e.clientX - (rect.left + rect.width / 2)
    const dy = e.clientY - (rect.top + rect.height / 2)
    if (Math.hypot(dx, dy) < rect.width * 0.12) return
    const angle = Math.atan2(dy, dx)
    const now = Date.now()
    const p = pet.current
    if (p.lastAngle === null || now - p.lastTime > 500) {
      p.total = 0
    } else {
      let delta = angle - p.lastAngle
      if (delta > Math.PI) delta -= 2 * Math.PI
      if (delta < -Math.PI) delta += 2 * Math.PI
      // Changing direction starts the count over.
      p.total = Math.sign(delta) !== Math.sign(p.total) && p.total !== 0 ? delta : p.total + delta
    }
    p.lastAngle = angle
    p.lastTime = now
    if (Math.abs(p.total) >= PET_RADIANS && now > p.cooldownUntil) {
      p.total = 0
      p.cooldownUntil = now + PET_COOLDOWN_MS
      petMascot(rect)
    }
  }

  const petMascot = (rect: DOMRect) => {
    const batch = Date.now()
    const made = Array.from({ length: 5 }, (_, i): Heart => ({
      id: batch + i,
      x: rect.left + rect.width * (0.2 + 0.15 * i),
      y: rect.top + rect.height * 0.2,
      drift: (i - 2) * 6,
    }))
    setHearts((current) => [...current, ...made])
    setTimeout(() => setHearts((current) => current.filter((heart) => !made.some((m) => m.id === heart.id))), HEART_MS + 200)
    setBubble(placeBubble(PET_LINES[Math.floor(Math.random() * PET_LINES.length)], rect))
    if (bubbleTimer.current) clearTimeout(bubbleTimer.current)
    bubbleTimer.current = setTimeout(() => setBubble(null), 2600)
  }

  const startHold = (e: PointerEvent<SVGSVGElement>) => {
    downAt.current = { x: e.clientX, y: e.clientY }
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
        className={`mascot${magicWord === 'coffee' ? ' jitter' : ''}${sleepy ? ' drowsy' : ''}${magicWord === 'timewarp' ? ' dizzy' : ''}${magicWord === 'exam' ? ' determined' : ''}`}
        viewBox="0 0 100 100"
        width={size}
        height={size}
        role="img"
        aria-hidden="true"
        focusable="false"
        onClick={handleTap}
        onPointerDown={startHold}
        onPointerMove={handleMove}
        onPointerUp={cancelHold}
        onPointerLeave={cancelHold}
        onPointerCancel={cancelHold}
        onContextMenu={(e) => {
          if (effects !== 'off') e.preventDefault()
        }}
      >
        <Character />
        {costume && <Costume holiday={costume} mascot={character} />}
        {magicWord === 'dentist' && <path className="mascot-sweat" d="M84 12q-8 11 0 18q8-7 0-18Z" fill="#7dd3fc" stroke="#38bdf8" strokeWidth="1.5" />}
      </svg>
      {sleepy && <span className="mascot-zzz">Zzz</span>}
      {magicWord === 'wish' && (
        <span className="mascot-sparkles" aria-hidden="true">
          <i>✦</i>
          <i>✧</i>
          <i>✦</i>
        </span>
      )}
      {hearts.length > 0 &&
        createPortal(
          hearts.map((heart) => (
            <span key={heart.id} className="mascot-heart" style={{ left: heart.x, top: heart.y, '--drift': `${heart.drift}px` } as CSSProperties} aria-hidden="true">
              <svg viewBox="0 0 24 22" width="18" height="16">
                <path d="M12 21C5 15 1 11.5 1 7a5.5 5.5 0 0 1 11-1.5A5.5 5.5 0 0 1 23 7c0 4.500-4 8-11 14Z" fill="#ff6b8b" />
              </svg>
            </span>
          )),
          document.body,
        )}
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
