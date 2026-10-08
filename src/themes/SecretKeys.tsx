import { useEffect } from 'react'
import { peekTheme } from '../features/theme/appearance'
import { THEMES } from '../features/theme/theme'
import { isTyping } from '../features/fun/typing'

// Type a theme's name anywhere (outside a text box) to peek at it for a few seconds.
export function SecretKeys() {
  useEffect(() => {
    let typed = ''
    const names = THEMES.map((t) => t.id)
    const onKeyDown = (e: KeyboardEvent) => {
      if (isTyping(e.target) || e.metaKey || e.ctrlKey || e.altKey || e.key.length !== 1) return
      typed = (typed + e.key.toLowerCase()).slice(-12)
      const hit = names.find((name) => typed.endsWith(name))
      if (hit) {
        typed = ''
        peekTheme(hit)
      }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [])

  return null
}
