export const THEMES = [
  { id: 'tado', name: 'TaDo', description: 'The original purple' },
  { id: 'minimal', name: 'Minimal', description: 'Plain black and white' },
  { id: 'candy', name: 'Candy', description: 'Soft pastels, extra round' },
  { id: 'space', name: 'Space', description: 'Night sky, always dark' },
  { id: 'arcade', name: 'Retro arcade', description: 'Neon on dark, square corners' },
  { id: 'ocean', name: 'Ocean', description: 'Cool blues and teals' },
  { id: 'forest', name: 'Forest', description: 'Calm greens' },
  { id: 'sunset', name: 'Sunset', description: 'Warm orange and rose' },
  { id: 'gold', name: 'Gold', description: 'A reward for the busiest planners' },
] as const

export type ThemeId = (typeof THEMES)[number]['id']

/** Themes that stay hidden in Settings until they're unlocked. */
export const SECRET_THEMES: readonly ThemeId[] = ['gold']

/** Events needed to unlock the secret Gold theme (the top planner level). */
export const GOLD_UNLOCK_EVENTS = 100

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

// Every theme has its own mascot; the names are used for the "You found..." note and the Settings picker.
export const MASCOT_NAMES: Record<ThemeId, string> = {
  tado: 'Calendar guy',
  minimal: 'Dot',
  candy: 'Cupcake',
  space: 'Astronaut',
  arcade: 'Pixel invader',
  ocean: 'Fish',
  forest: 'Fox',
  sunset: 'Sun',
  gold: 'Golden TaDo',
}

const MASCOT_KEY = 'tado-mascot'

/** A guest mascot chosen (or discovered) instead of the theme's own, or null to follow the theme. */
export function getStoredMascot(): ThemeId | null {
  try {
    const stored = localStorage.getItem(MASCOT_KEY)
    return isThemeId(stored) ? stored : null
  } catch {
    return null
  }
}

export function saveMascot(id: ThemeId | null): void {
  try {
    localStorage.setItem(MASCOT_KEY, id ?? '')
  } catch {
    // Storage can be unavailable (private mode); the choice still applies for this session.
  }
}

export interface Secrets {
  /** Guest mascots discovered by tapping (these appear in the hidden picker). */
  found: ThemeId[]
  /** Mascots you've seen as a theme's own, which count toward collecting them all. */
  met: ThemeId[]
  /** The golden mascot, unlocked by meeting all the others. */
  goldMascot: boolean
  /** The Gold theme, unlocked at the top planner level. */
  goldTheme: boolean
}

const SECRETS_KEY = 'tado-secrets'
const LEGACY_FOUND_KEY = 'tado-found-mascots'

function themeIds(value: unknown): ThemeId[] {
  return Array.isArray(value) ? value.filter(isThemeId) : []
}

export function getStoredSecrets(): Secrets {
  const empty: Secrets = { found: [], met: [], goldMascot: false, goldTheme: false }
  try {
    const raw = localStorage.getItem(SECRETS_KEY)
    if (raw) {
      const parsed = JSON.parse(raw) as Partial<Secrets>
      return {
        found: themeIds(parsed.found),
        met: themeIds(parsed.met),
        goldMascot: parsed.goldMascot === true,
        goldTheme: parsed.goldTheme === true,
      }
    }
    // Earlier versions saved only the list of found mascots.
    return { ...empty, found: themeIds(JSON.parse(localStorage.getItem(LEGACY_FOUND_KEY) ?? '[]')) }
  } catch {
    return empty
  }
}

export function saveSecrets(secrets: Secrets): void {
  try {
    localStorage.setItem(SECRETS_KEY, JSON.stringify(secrets))
  } catch {
    // Same as above: fine to lose this in private mode.
  }
}
