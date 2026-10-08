import { useSyncExternalStore } from 'react'
import {
  applyEffects,
  applyTheme,
  getStoredEffects,
  getStoredTheme,
  saveEffects,
  saveTheme,
} from './theme'
import type { EffectsLevel, ThemeId } from './theme'

export interface Appearance {
  theme: ThemeId
  effects: EffectsLevel
}

// One shared copy of the user's look, so mascots, messages, sounds and scenery all react together.
let state: Appearance = { theme: getStoredTheme(), effects: getStoredEffects() }
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

export function useAppearance(): Appearance {
  return useSyncExternalStore(subscribe, getAppearance)
}
