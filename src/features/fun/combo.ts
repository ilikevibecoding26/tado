// Finishing todos in quick succession builds a combo.
const WINDOW_MS = 8000

let combo = 0
let lastCompletion = 0

/** Call when a todo is completed. Returns the combo count, 1 for the first of a run. */
export function registerCompletion(): number {
  const now = Date.now()
  combo = now - lastCompletion <= WINDOW_MS ? combo + 1 : 1
  lastCompletion = now
  return combo
}

/** Each step of the combo is a semitone higher, up to seven. */
export function comboPitch(count: number): number {
  return 2 ** (Math.min(count - 1, 7) / 12)
}
