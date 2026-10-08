export const THEMES = [
  { id: 'tado', name: 'TaDo', description: 'The original purple' },
  { id: 'minimal', name: 'Minimal', description: 'Plain black and white' },
  { id: 'candy', name: 'Candy', description: 'Soft pastels, extra round' },
  { id: 'space', name: 'Space', description: 'Night sky, always dark' },
  { id: 'arcade', name: 'Retro arcade', description: 'Neon on dark, square corners' },
  { id: 'ocean', name: 'Ocean', description: 'Cool blues and teals' },
  { id: 'forest', name: 'Forest', description: 'Calm greens' },
  { id: 'sunset', name: 'Sunset', description: 'Warm orange and rose' },
] as const

export type ThemeId = (typeof THEMES)[number]['id']

export const DEFAULT_THEME: ThemeId = 'tado'

const STORAGE_KEY = 'tado-theme'

export function isThemeId(value: unknown): value is ThemeId {
  return THEMES.some((theme) => theme.id === value)
}

export function getStoredTheme(): ThemeId {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    return isThemeId(stored) ? stored : DEFAULT_THEME
  } catch {
    return DEFAULT_THEME
  }
}

export function saveTheme(id: ThemeId): void {
  try {
    localStorage.setItem(STORAGE_KEY, id)
  } catch {
    // Storage can be unavailable (private mode); the theme still applies for this session.
  }
}

// Sets the theme on <html> and matches the browser's address-bar color to the theme's accent.
export function applyTheme(id: ThemeId): void {
  const root = document.documentElement
  root.dataset.theme = id
  const accent = getComputedStyle(root).getPropertyValue('--accent').trim()
  const meta = document.querySelector('meta[name="theme-color"]')
  if (meta && accent) meta.setAttribute('content', accent)
}

export const EFFECT_LEVELS = [
  { id: 'off', name: 'Off', description: 'Just colors and shapes' },
  {
    id: 'calm',
    name: 'Calm',
    description: 'A themed mascot, messages, celebrations and scenery, with gentle motion',
  },
  { id: 'loud', name: 'All out', description: 'The loudest version of every theme' },
] as const

export type EffectsLevel = (typeof EFFECT_LEVELS)[number]['id']

export const DEFAULT_EFFECTS: EffectsLevel = 'off'

const EFFECTS_STORAGE_KEY = 'tado-effects'

export function isEffectsLevel(value: unknown): value is EffectsLevel {
  return EFFECT_LEVELS.some((level) => level.id === value)
}

export function getStoredEffects(): EffectsLevel {
  try {
    const stored = localStorage.getItem(EFFECTS_STORAGE_KEY)
    return isEffectsLevel(stored) ? stored : DEFAULT_EFFECTS
  } catch {
    return DEFAULT_EFFECTS
  }
}

export function saveEffects(level: EffectsLevel): void {
  try {
    localStorage.setItem(EFFECTS_STORAGE_KEY, level)
  } catch {
    // Storage can be unavailable (private mode); the level still applies for this session.
  }
}

export function applyEffects(level: EffectsLevel): void {
  document.documentElement.dataset.effects = level
}
