import { useSyncExternalStore } from 'react'
import {
  THEMES,
  applyEffects,
  applyTheme,
  getStoredEffects,
  getStoredFound,
  getStoredMascot,
  getStoredTheme,
  saveEffects,
  saveFound,
  saveMascot,
  saveTheme,
} from './theme'
import type { EffectsLevel, ThemeId } from './theme'

export interface FoundNotice {
  id: ThemeId
  /** Changes every time a new mascot is found, so the note can re-appear. */
  nonce: number
}

export interface Appearance {
  theme: ThemeId
  effects: EffectsLevel
  /** A guest mascot from another theme (the secret), or null to use the theme's own. */
  mascot: ThemeId | null
  /** Guest mascots discovered so far; they unlock the hidden picker in Settings. */
  found: ThemeId[]
  notice: FoundNotice | null
}

// One shared copy of the user's look, so mascots, messages, sounds and scenery all react together.
let state: Appearance = {
  theme: getStoredTheme(),
  effects: getStoredEffects(),
  mascot: getStoredMascot(),
  found: getStoredFound(),
  notice: null,
}
const listeners = new Set<() => void>()

function update(next: Appearance): void {
  state = next
  listeners.forEach((listener) => listener())
}

function subscribe(listener: () => void): () => void {
  listeners.add(listener)
  return () => {
    listeners.delete(listener)
  }
}

export function getAppearance(): Appearance {
  return state
}

export function initAppearance(): void {
  applyTheme(state.theme)
  applyEffects(state.effects)
}

export function setTheme(theme: ThemeId): void {
  saveTheme(theme)
  applyTheme(theme)
  update({ ...state, theme })
}

export function setEffects(effects: EffectsLevel): void {
  saveEffects(effects)
  applyEffects(effects)
  update({ ...state, effects })
}

export function setMascot(mascot: ThemeId | null): void {
  saveMascot(mascot)
  update({ ...state, mascot })
}

// Steps to the next character in theme order; arriving back at the theme's own mascot clears the guest.
function cycleMascot(): void {
  const order = THEMES.map((t) => t.id)
  const current = state.mascot ?? state.theme
  const next = order[(order.indexOf(current) + 1) % order.length]
  const mascot = next === state.theme ? null : next
  saveMascot(mascot)
  if (mascot && !state.found.includes(mascot)) {
    const found = [...state.found, mascot]
    saveFound(found)
    update({ ...state, mascot, found, notice: { id: mascot, nonce: Date.now() } })
  } else {
    update({ ...state, mascot })
  }
}

let tapCount = 0
let lastTap = 0

/** Call on every mascot tap. Five quick taps in a row swap in the next mascot and return true. */
export function registerMascotTap(): boolean {
  if (state.effects === 'off') return false
  const now = Date.now()
  tapCount = now - lastTap < 900 ? tapCount + 1 : 1
  lastTap = now
  if (tapCount < 5) return false
  tapCount = 0
  cycleMascot()
  return true
}

export function useAppearance(): Appearance {
  return useSyncExternalStore(subscribe, getAppearance)
}
