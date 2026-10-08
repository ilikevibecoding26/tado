import { getAppearance } from '../theme/appearance'
import type { ThemeId } from '../theme/theme'

let audioContext: AudioContext | null = null

function getAudioContext(): AudioContext {
  if (!audioContext) {
    audioContext = new AudioContext()
  }
  if (audioContext.state === 'suspended') {
    void audioContext.resume()
  }
  return audioContext
}

interface Note {
  /** Seconds after the sound starts. */
  at: number
  freq: number
  /** If set, the pitch glides to this frequency. */
  glideTo?: number
  duration: number
  wave: OscillatorType
  gain: number
}

// One short sound per theme. "pop" is the original and is also what plays with effects off.
const POP: Note[] = [{ at: 0, freq: 520, glideTo: 880, duration: 0.25, wave: 'sine', gain: 0.15 }]

const SOUNDS: Record<ThemeId, Note[]> = {
  tado: POP,
  // A tiny, quiet tick.
  minimal: [{ at: 0, freq: 900, glideTo: 700, duration: 0.07, wave: 'triangle', gain: 0.07 }],
  // Two bright bell tones with a shimmer on top.
  candy: [
    { at: 0, freq: 1318, duration: 0.5, wave: 'sine', gain: 0.12 },
    { at: 0.09, freq: 1568, duration: 0.5, wave: 'sine', gain: 0.1 },
    { at: 0, freq: 2636, duration: 0.25, wave: 'sine', gain: 0.04 },
  ],
  // A rising sweep with a softer echo above it.
  space: [
    { at: 0, freq: 300, glideTo: 1200, duration: 0.35, wave: 'sine', gain: 0.1 },
    { at: 0.12, freq: 600, glideTo: 1800, duration: 0.4, wave: 'triangle', gain: 0.04 },
  ],
  // The classic two-note coin chime.
  arcade: [
    { at: 0, freq: 988, duration: 0.08, wave: 'square', gain: 0.06 },
    { at: 0.08, freq: 1319, duration: 0.35, wave: 'square', gain: 0.06 },
  ],
  // A watery bloop-bloop.
  ocean: [
    { at: 0, freq: 260, glideTo: 640, duration: 0.16, wave: 'sine', gain: 0.14 },
    { at: 0.12, freq: 420, glideTo: 900, duration: 0.14, wave: 'sine', gain: 0.08 },
  ],
  // Two wooden taps.
  forest: [
    { at: 0, freq: 520, glideTo: 380, duration: 0.09, wave: 'triangle', gain: 0.14 },
    { at: 0.11, freq: 660, glideTo: 480, duration: 0.09, wave: 'triangle', gain: 0.1 },
  ],
  // A warm rising arpeggio.
  sunset: [
    { at: 0, freq: 523, duration: 0.45, wave: 'triangle', gain: 0.1 },
    { at: 0.1, freq: 659, duration: 0.45, wave: 'triangle', gain: 0.09 },
    { at: 0.2, freq: 784, duration: 0.6, wave: 'triangle', gain: 0.09 },
  ],
}

function playNote(ctx: AudioContext, note: Note, offset: number, volume: number, pitch: number): void {
  const start = ctx.currentTime + offset + note.at
  const oscillator = ctx.createOscillator()
  const gain = ctx.createGain()
  oscillator.type = note.wave
  oscillator.frequency.setValueAtTime(note.freq * pitch, start)
  if (note.glideTo) {
    oscillator.frequency.exponentialRampToValueAtTime(note.glideTo * pitch, start + note.duration / 2)
  }
  const peak = Math.min(note.gain * volume, 0.3)
  gain.gain.setValueAtTime(peak, start)
  gain.gain.exponentialRampToValueAtTime(0.001, start + note.duration)
  oscillator.connect(gain)
  gain.connect(ctx.destination)
  oscillator.start(start)
  oscillator.stop(start + note.duration)
}

export function playPop(): void {
  const { theme, effects } = getAppearance()
  const ctx = getAudioContext()
  if (effects === 'off') {
    POP.forEach((note) => playNote(ctx, note, 0, 1, 1))
    return
  }
  const notes = SOUNDS[theme]
  if (effects === 'calm') {
    notes.forEach((note) => playNote(ctx, note, 0, 1, 1))
    return
  }
  // All out: louder, then an echo a fifth higher.
  notes.forEach((note) => playNote(ctx, note, 0, 1.8, 1))
  notes.forEach((note) => playNote(ctx, note, 0.2, 0.9, 1.5))
}
