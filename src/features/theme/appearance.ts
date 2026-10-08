import { useSyncExternalStore } from 'react'
import {
  MASCOT_NAMES,
  THEMES,
  applyEffects,
  applyTheme,
  getStoredEffects,
  getStoredMascot,
  getStoredSecrets,
  getStoredTheme,
  saveEffects,
  saveMascot,
  saveSecrets,
  saveTheme,
} from './theme'
import type { EffectsLevel, ThemeId } from './theme'

/** A short message shown when something secret happens. `nonce` changes each time so it can re-appear. */
export interface Notice {
  text: string
  nonce: number
}

export interface Appearance {
  theme: ThemeId
  effects: EffectsLevel
  /** A guest mascot from another theme (the secret), or null to use the theme's own. */
  mascot: ThemeId | null
  /** Guest mascots discovered by tapping; they unlock the hidden picker in Settings. */
  found: ThemeId[]
  /** Mascots seen as a theme's own. With `found`, these count toward collecting them all. */
  met: ThemeId[]
  /** The golden mascot: unlocked by meeting every other mascot. */
  goldMascot: boolean
  /** The Gold theme: unlocked at the top planner level. */
  goldTheme: boolean
  notice: Notice | null
  /** Set to a new number to start party mode. */
  party: number | null
}

// The mascots you have to meet to unlock the golden one.
const COLLECTABLE = THEMES.map((t) => t.id).filter((id) => id !== 'gold')

// One shared copy of the user's look, so mascots, messages, sounds and scenery all react together.
const secrets = getStoredSecrets()
let state: Appearance = {
  theme: getStoredTheme(),
  effects: getStoredEffects(),
  mascot: getStoredMascot(),
  found: secrets.found,
  met: secrets.met,
  goldMascot: secrets.goldMascot,
  goldTheme: secrets.goldTheme,
  notice: null,
  party: null,
}
const listeners = new Set<() => void>()

function commit(next: Appearance): void {
  state = next
  saveMascot(next.mascot)
  saveSecrets({ found: next.found, met: next.met, goldMascot: next.goldMascot, goldTheme: next.goldTheme })
  listeners.forEach((listener) => listener())
}

function subscribe(listener: () => void): () => void {
  listeners.add(listener)
  return () => {
    listeners.delete(listener)
  }
}

// Seeing a theme's own mascot (with effects on) counts as meeting it.
function noteMet(next: Appearance): Appearance {
  if (next.effects === 'off' || next.theme === 'gold' || next.met.includes(next.theme)) return next
  return { ...next, met: [...next.met, next.theme] }
}

// Meeting every mascot, by theme or by tapping, unlocks the golden one and starts a party.
function checkCollection(next: Appearance): Appearance {
  if (next.goldMascot) return next
  if (!COLLECTABLE.every((id) => next.found.includes(id) || next.met.includes(id))) return next
  const nonce = Date.now()
  return {
    ...next,
    goldMascot: true,
    mascot: 'gold',
    found: next.found.includes('gold') ? next.found : [...next.found, 'gold'],
    notice: { text: "You've met every mascot! Golden TaDo joins you.", nonce },
    party: nonce,
  }
}

export function getAppearance(): Appearance {
  return state
}

export function initAppearance(): void {
  applyTheme(state.theme)
  applyEffects(state.effects)
  state = checkCollection(noteMet(state))
}

export function setTheme(theme: ThemeId): void {
  saveTheme(theme)
  applyTheme(theme)
  commit(checkCollection(noteMet({ ...state, theme })))
}

export function setEffects(effects: EffectsLevel): void {
  saveEffects(effects)
  applyEffects(effects)
  commit(checkCollection(noteMet({ ...state, effects })))
}

export function setMascot(mascot: ThemeId | null): void {
  saveMascot(mascot)
  commit({ ...state, mascot })
}

export function startParty(): void {
  if (state.effects === 'off') return
  commit({ ...state, party: Date.now() })
}

export function unlockGoldTheme(): void {
  if (state.goldTheme) return
  commit({ ...state, goldTheme: true, notice: { text: 'Secret unlocked: the Gold theme. Find it in Settings.', nonce: Date.now() } })
}

// Steps to the next character in theme order; arriving back at the theme's own mascot clears the guest.
function cycleMascot(): void {
  const order = THEMES.map((t) => t.id).filter((id) => id !== 'gold' || state.goldMascot)
  const current = state.mascot ?? state.theme
  const next = order[(order.indexOf(current) + 1) % order.length]
  const mascot = next === state.theme ? null : next
  saveMascot(mascot)
  if (mascot && !state.found.includes(mascot)) {
    const notice = { text: `You found the ${MASCOT_NAMES[mascot].toLowerCase()}!`, nonce: Date.now() }
    commit(checkCollection({ ...state, mascot, found: [...state.found, mascot], notice }))
  } else {
    commit({ ...state, mascot })
  }
}

let tapCount = 0
let lastTap = 0

/**
 * Call on every mascot tap. Five quick taps in a row swap in the next mascot ('swap');
 * keep going to ten and it starts a party ('party').
 */
export function registerMascotTap(): 'swap' | 'party' | null {
  if (state.effects === 'off') return null
  const now = Date.now()
  tapCount = now - lastTap < 900 ? tapCount + 1 : 1
  lastTap = now
  if (tapCount === 5) {
    cycleMascot()
    return 'swap'
  }
  if (tapCount >= 10) {
    tapCount = 0
    startParty()
    return 'party'
  }
  return null
}

export function useAppearance(): Appearance {
  return useSyncExternalStore(subscribe, getAppearance)
}
