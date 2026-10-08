import { useEffect, useState } from 'react'
import { startParty, useAppearance } from '../features/theme/appearance'
import { THEMES } from '../features/theme/theme'
import type { ThemeId } from '../features/theme/theme'
import { burstConfetti } from '../features/fun/confetti'
import { playPop } from '../features/fun/sound'
import { isTyping } from '../features/fun/typing'
import { MASCOTS } from '../calendar/mascots'
import './PartyMode.css'

// Party mode: every mascot parades across the screen while each theme takes a turn throwing
// its own confetti and playing its own sound. Start it with the Konami code
// (up up down down left right left right B A), by tapping a mascot ten times in a row,
// or by collecting every mascot.
const KONAMI = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'b', 'a']
const PARTY_MS = 7000
const BURST_EVERY_MS = 900

export function PartyMode() {
  const { party, effects, goldMascot } = useAppearance()
  const [running, setRunning] = useState<number | null>(null)

  // Listen for the Konami code anywhere outside a text box.
  useEffect(() => {
    let progress = 0
    const onKeyDown = (e: KeyboardEvent) => {
      if (isTyping(e.target)) return
      const key = e.key.length === 1 ? e.key.toLowerCase() : e.key
      progress = key === KONAMI[progress] ? progress + 1 : key === KONAMI[0] ? 1 : 0
      if (progress === KONAMI.length) {
        progress = 0
        startParty()
      }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [])

  useEffect(() => {
    if (party === null || effects === 'off') return
    setRunning(party)
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const timers: ReturnType<typeof setTimeout>[] = []
    if (!reduceMotion) {
      const themes: ThemeId[] = THEMES.map((t) => t.id).filter((id) => id !== 'gold' || goldMascot)
      for (let i = 0; i * BURST_EVERY_MS < PARTY_MS - 1500; i++) {
        timers.push(
          setTimeout(() => {
            const theme = themes[i % themes.length]
            burstConfetti(window.innerWidth * (0.2 + Math.random() * 0.6), window.innerHeight * (0.2 + Math.random() * 0.3), theme)
            playPop(theme)
          }, i * BURST_EVERY_MS),
        )
      }
    }
    timers.push(setTimeout(() => setRunning(null), PARTY_MS))
    return () => timers.forEach(clearTimeout)
  }, [party, effects, goldMascot])

  if (running === null || running !== party) return null

  const parade: ThemeId[] = THEMES.map((t) => t.id).filter((id) => id !== 'gold' || goldMascot)
  return (
    <>
      <div className="party" aria-hidden="true">
        {parade.map((id, i) => {
          const Character = MASCOTS[id]
          return (
            // The data-theme wrapper gives each mascot its own theme's colors.
            <span key={id} className="party-runner" data-theme={id} style={{ top: `${14 + ((i * 11) % 56)}%`, animationDelay: `${i * 0.45}s` }}>
              <svg viewBox="0 0 100 100" width="64" height="64" className="party-hop" style={{ animationDelay: `${i * 0.12}s` }}>
                <Character />
              </svg>
            </span>
          )
        })}
      </div>
      {window.matchMedia('(prefers-reduced-motion: reduce)').matches && (
        <div className="found-toast" role="status">
          Party time!
        </div>
      )}
    </>
  )
}
