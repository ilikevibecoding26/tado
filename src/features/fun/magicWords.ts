// The first group are words in a title; the second are reactions the app starts itself.
export type MagicWord =
  | 'birthday'
  | 'pizza'
  | 'coffee'
  | 'sleep'
  | 'flight'
  | 'exam'
  | 'dentist'
  | 'wish'
  | 'timewarp'

interface MagicDef {
  word: MagicWord
  pattern: RegExp
  /** The note shown when it triggers. */
  notice: string
  /** How long the mascot's reaction lasts, in milliseconds. */
  duration: number
}

// Creating an event or todo whose title contains one of these makes the mascot react (Calm and All out only).
export const MAGIC_WORDS: readonly MagicDef[] = [
  { word: 'birthday', pattern: /\b(birthday|bday|b-day)\b/i, notice: 'Happy birthday!', duration: 8000 },
  { word: 'pizza', pattern: /\bpizza\b/i, notice: 'Pizza time!', duration: 3500 },
  { word: 'coffee', pattern: /\b(coffee|espresso|latte)\b/i, notice: 'Extra espresso, extra energy.', duration: 5000 },
  { word: 'sleep', pattern: /\b(sleep|nap|bedtime)\b/i, notice: 'Sleepy time. Zzz.', duration: 6000 },
  { word: 'flight', pattern: /\b(flight|trip|vacation|airport|travel)\b/i, notice: 'Bon voyage!', duration: 4500 },
  { word: 'exam', pattern: /\b(exam|exams|quiz|midterm|finals?)\b/i, notice: "You've got this. Deep breath.", duration: 5000 },
  { word: 'dentist', pattern: /\b(dentist|dental)\b/i, notice: 'Open wide... you are so brave.', duration: 5000 },
]

export function findMagicWord(text: string): MagicDef | null {
  return MAGIC_WORDS.find((def) => def.pattern.test(text)) ?? null
}
