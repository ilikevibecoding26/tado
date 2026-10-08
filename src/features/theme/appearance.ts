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
import { findMagicWord } from '../fun/magicWords'
import type { MagicWord } from '../fun/magicWords'

/** A short message shown when something secret happens. `nonce` changes each time so it can re-appear. */
export interface Notice {
  text: string
  nonce: number
}

/** A mascot reaction to a magic word in a title. `nonce` changes each time so it can re-run. */
export interface Magic {
  word: MagicWord
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
  /** A reaction to a magic word, while it lasts. */
  magic: Magic | null
  /** While peeking at another theme: the theme to go back to. `theme` is the one being peeked at. */
  returnTheme: ThemeId | null
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
  magic: null,
  returnTheme: null,
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

let peekTimer: ReturnType<typeof setTimeout> | null = null

// Forget any peek in progress, keeping whatever theme is on screen.
function cancelPeek(): void {
  if (peekTimer) clearTimeout(peekTimer)
  peekTimer = null
  state = { ...state, returnTheme: null }
}

function endPeek(): void {
  peekTimer = null
  if (!state.returnTheme) return
  applyTheme(state.returnTheme)
  commit({ ...state, theme: state.returnTheme, returnTheme: null })
}

export function setTheme(theme: ThemeId): void {
  cancelPeek()
  saveTheme(theme)
  applyTheme(theme)
  commit(checkCollection(noteMet({ ...state, theme })))
}

export function setEffects(effects: EffectsLevel): void {
  // Turning effects off ends a peek by going back to the real theme.
  if (state.returnTheme && effects === 'off') {
    const back = state.returnTheme
    cancelPeek()
    applyTheme(back)
    state = { ...state, theme: back }
  }
  saveEffects(effects)
  applyEffects(effects)
  commit(checkCollection(noteMet({ ...state, effects })))
}

/** Show another theme for a few seconds without saving it (a secret: type a theme's name, or hold its card in Settings). */
export function peekTheme(id: ThemeId): void {
  if (state.effects === 'off') return
  if (id === 'gold' && !state.goldTheme) return
  const base = state.returnTheme ?? state.theme
  if (id === base) return
  if (peekTimer) clearTimeout(peekTimer)
  applyTheme(id)
  commit({
    ...state,
    theme: id,
    returnTheme: base,
    notice: { text: `Peeking at ${THEMES.find((t) => t.id === id)?.name ?? id}...`, nonce: Date.now() },
  })
  peekTimer = setTimeout(endPeek, 8000)
}

export function showNotice(text: string): void {
  commit({ ...state, notice: { text, nonce: Date.now() } })
}

let magicTimer: ReturnType<typeof setTimeout> | null = null

/** Call with the title of a newly created event or todo; a magic word makes the mascot react. */
export function triggerMagic(text: string): void {
  if (state.effects === 'off') return
  const hit = findMagicWord(text)
  if (!hit) return
  const nonce = Date.now()
  if (magicTimer) clearTimeout(magicTimer)
  commit({ ...state, magic: { word: hit.word, nonce }, notice: { text: hit.notice, nonce } })
  magicTimer = setTimeout(() => {
    if (state.magic?.nonce === nonce) commit({ ...state, magic: null })
  }, hit.duration)
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
