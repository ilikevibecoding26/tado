import type { MouseEvent } from 'react'
import { setEffects, setMascot, setTheme, useAppearance } from '../features/theme/appearance'
import { EFFECT_LEVELS, MASCOT_NAMES, THEMES } from '../features/theme/theme'
import { burstConfetti } from '../features/fun/confetti'
import { playPop } from '../features/fun/sound'
import './SettingsPage.css'

export function SettingsPage() {
  const { theme, effects, mascot, found } = useAppearance()

  const tryCelebration = (e: MouseEvent<HTMLButtonElement>) => {
    const rect = e.currentTarget.getBoundingClientRect()
    burstConfetti(rect.left + rect.width / 2, rect.top + rect.height / 2)
    playPop()
  }

  return (
    <div className="settings-page">
      <div className="settings">
        <fieldset className="theme-picker">
          <legend>Theme</legend>
          <p className="settings-hint">Pick a look for TaDo. Your choice is saved on this device.</p>
          <div className="theme-grid">
            {THEMES.map((t) => (
              <label key={t.id} className="theme-option">
                <input
                  type="radio"
                  name="theme"
                  value={t.id}
                  checked={theme === t.id}
                  onChange={() => setTheme(t.id)}
                />
                <span className="theme-preview" data-theme={t.id} aria-hidden="true">
                  <span className="theme-preview-top">
                    <span className="theme-preview-pill" />
                    <span className="theme-preview-line" />
                  </span>
                  <span className="theme-preview-chip event-chip-blue">Meeting</span>
                  <span className="theme-preview-chip event-chip-green">Lunch</span>
                  <span className="theme-preview-chip event-chip-purple">Gym</span>
                </span>
                <span className="theme-name">{t.name}</span>
                <span className="theme-description">{t.description}</span>
              </label>
            ))}
          </div>
        </fieldset>

        <fieldset className="theme-picker effects-picker">
          <legend>Theme effects</legend>
          <p className="settings-hint">
            Give each theme its own mascot, messages, sounds, confetti and scenery. Motion stops if your device is set
            to reduce motion.
          </p>
          <div className="effects-options">
            {EFFECT_LEVELS.map((level) => (
              <label key={level.id} className="effects-option">
                <input
                  type="radio"
                  name="effects"
                  value={level.id}
                  checked={effects === level.id}
                  onChange={() => setEffects(level.id)}
                />
                <span className="effects-name">{level.name}</span>
                <span className="effects-description">{level.description}</span>
              </label>
            ))}
          </div>
          <button type="button" className="settings-try" onClick={tryCelebration}>
            Try a celebration
          </button>
        </fieldset>

        {found.length > 0 && (
          <fieldset className="theme-picker effects-picker">
            <legend>Secret mascots</legend>
            <p className="settings-hint">
              You found some guests. Pick who keeps you company, or let the theme choose. Shows on Calm and All out.
            </p>
            <div className="effects-options">
              <label className="effects-option">
                <input type="radio" name="mascot" value="" checked={mascot === null} onChange={() => setMascot(null)} />
                <span className="effects-name">Follow the theme</span>
                <span className="effects-description">Whoever belongs to the theme you picked</span>
              </label>
              {found.map((id) => (
                <label key={id} className="effects-option">
                  <input type="radio" name="mascot" value={id} checked={mascot === id} onChange={() => setMascot(id)} />
                  <span className="effects-name">{MASCOT_NAMES[id]}</span>
                </label>
              ))}
            </div>
          </fieldset>
        )}
      </div>
    </div>
  )
}
