import { useSyncExternalStore } from 'react'
import { burstConfetti } from '../fun/confetti'
import { playPop } from '../fun/sound'
import { showNotice } from '../theme/appearance'

export type TimerMode = 'countdown' | 'stopwatch'
export type LinkKind = 'todo' | 'event'

/** The to-do or event a timer is for. The title is kept so a session still reads right once the item is gone. */
export interface TimerLink {
  kind: LinkKind
  id: string
  title: string
}

export interface Countdown {
  durationMs: number
  status: 'idle' | 'running' | 'paused' | 'done'
  /** When a running countdown reaches zero (epoch ms). */
  endsAt: number | null
  /** Time left while idle, paused or done. */
  remainingMs: number
}

export interface Stopwatch {
  status: 'idle' | 'running' | 'paused'
  /** When the current run started (epoch ms); `elapsedMs` holds everything before it. */
  startedAt: number | null
  elapsedMs: number
  laps: number[]
}

/** A stretch of time you timed, kept so you can see how long things took. */
export interface Session {
  id: string
  type: TimerMode
  ms: number
  endedAt: number
  link: TimerLink | null
}

export interface TimerState {
  mode: TimerMode
  countdown: Countdown
  stopwatch: Stopwatch
  link: TimerLink | null
  sessions: Session[]
  /** The clock the display reads; moves forward while something is running. */
  now: number
}

const DEFAULT_DURATION_MS = 25 * 60 * 1000
const MIN_SESSION_MS = 5000
const MAX_SESSIONS = 200
// A countdown only shows whole seconds; the stopwatch shows tenths, so it refreshes faster.
const TICK_MS = 200
const STOPWATCH_TICK_MS = 50
const BASE_TITLE = 'TaDo'

function freshState(): TimerState {
  return {
    mode: 'countdown',
    countdown: { durationMs: DEFAULT_DURATION_MS, status: 'idle', endsAt: null, remainingMs: DEFAULT_DURATION_MS },
    stopwatch: { status: 'idle', startedAt: null, elapsedMs: 0, laps: [] },
    link: null,
    sessions: [],
    now: Date.now(),
  }
}

let state: TimerState = freshState()
let storageKey: string | null = null
const listeners = new Set<() => void>()
let tickTimer: ReturnType<typeof setInterval> | null = null
let tickRate = 0
let finishTimer: ReturnType<typeof setTimeout> | null = null

function save(): void {
  if (!storageKey) return
  const { now: _now, ...persisted } = state
  try {
    localStorage.setItem(storageKey, JSON.stringify(persisted))
  } catch {
    // Storage can be unavailable; the timer still works for this visit.
  }
}

function emit(): void {
  listeners.forEach((listener) => listener())
}

export function remainingOf(c: Countdown, now: number): number {
  return c.status === 'running' && c.endsAt !== null ? Math.max(0, c.endsAt - now) : c.remainingMs
}

export function elapsedOf(s: Stopwatch, now: number): number {
  return s.status === 'running' && s.startedAt !== null ? s.elapsedMs + Math.max(0, now - s.startedAt) : s.elapsedMs
}

export function formatClock(ms: number, tenths = false): string {
  const totalSeconds = Math.floor(ms / 1000)
  const hours = Math.floor(totalSeconds / 3600)
  const minutes = Math.floor((totalSeconds % 3600) / 60)
  const seconds = totalSeconds % 60
  const pad = (n: number) => String(n).padStart(2, '0')
  const base = hours > 0 ? `${hours}:${pad(minutes)}:${pad(seconds)}` : `${pad(minutes)}:${pad(seconds)}`
  return tenths ? `${base}.${Math.floor((ms % 1000) / 100)}` : base
}

function isRunning(): boolean {
  return state.countdown.status === 'running' || state.stopwatch.status === 'running'
}

function updateTitle(): void {
  const c = state.countdown
  document.title = c.status === 'running' ? `${formatClock(Math.ceil(remainingOf(c, state.now) / 1000) * 1000)} · ${BASE_TITLE}` : BASE_TITLE
}

function tick(): void {
  state = { ...state, now: Date.now() }
  updateTitle()
  emit()
}

// The clock only ticks while something is running.
function syncTicking(): void {
  const wanted = !isRunning() ? 0 : state.stopwatch.status === 'running' ? STOPWATCH_TICK_MS : TICK_MS
  if (wanted !== tickRate) {
    if (tickTimer) clearInterval(tickTimer)
    tickTimer = wanted ? setInterval(tick, wanted) : null
    tickRate = wanted
  }
  if (finishTimer) clearTimeout(finishTimer)
  finishTimer = null
  const { countdown } = state
  if (countdown.status === 'running' && countdown.endsAt !== null) {
    finishTimer = setTimeout(finishCountdown, Math.max(0, countdown.endsAt - Date.now()))
  }
  updateTitle()
}

function commit(next: TimerState): void {
  state = { ...next, now: Date.now() }
  save()
  syncTicking()
  emit()
}

function withSession(type: TimerMode, ms: number): Session[] {
  if (ms < MIN_SESSION_MS) return state.sessions
  const session: Session = { id: crypto.randomUUID(), type, ms, endedAt: Date.now(), link: state.link }
  return [session, ...state.sessions].slice(0, MAX_SESSIONS)
}

// Rings, a celebration in the current theme, and a few repeats of its sound so it isn't missed.
function celebrate(): void {
  showNotice("Time's up!")
  burstConfetti(window.innerWidth / 2, window.innerHeight / 3)
  playPop()
  setTimeout(playPop, 1200)
  setTimeout(playPop, 2400)
}

function finishCountdown(): void {
  finishTimer = null
  const { countdown } = state
  if (countdown.status !== 'running') return
  commit({
    ...state,
    countdown: { ...countdown, status: 'done', endsAt: null, remainingMs: 0 },
    sessions: withSession('countdown', countdown.durationMs),
  })
  celebrate()
}

/** Load this account's saved timer (it keeps running while the app is closed) and start ticking if needed. */
export function initTimer(userId: string): () => void {
  storageKey = `tado-timer:${userId}`
  state = freshState()
  try {
    const raw = localStorage.getItem(storageKey)
    if (raw) {
      const saved = JSON.parse(raw) as Partial<TimerState>
      state = {
        ...state,
        mode: saved.mode === 'stopwatch' ? 'stopwatch' : 'countdown',
        countdown: { ...state.countdown, ...saved.countdown },
        stopwatch: { ...state.stopwatch, ...saved.stopwatch },
        link: saved.link ?? null,
        sessions: saved.sessions ?? [],
        now: Date.now(),
      }
    }
  } catch {
    state = freshState()
  }
  // A countdown that ran out while the app was closed is finished, quietly.
  const { countdown } = state
  if (countdown.status === 'running' && countdown.endsAt !== null && countdown.endsAt <= Date.now()) {
    state = {
      ...state,
      countdown: { ...countdown, status: 'done', endsAt: null, remainingMs: 0 },
      sessions: withSession('countdown', countdown.durationMs),
    }
  }
  save()
  syncTicking()
  emit()
  const onVisible = () => {
    if (document.visibilityState === 'visible') tick()
  }
  document.addEventListener('visibilitychange', onVisible)
  return () => {
    document.removeEventListener('visibilitychange', onVisible)
    if (tickTimer) clearInterval(tickTimer)
    if (finishTimer) clearTimeout(finishTimer)
    tickTimer = null
    tickRate = 0
    finishTimer = null
    storageKey = null
    document.title = BASE_TITLE
  }
}

export function setMode(mode: TimerMode): void {
  commit({ ...state, mode })
}

export function setLink(link: TimerLink | null): void {
  commit({ ...state, link })
}

export function setDuration(durationMs: number): void {
  const { countdown } = state
  if (countdown.status === 'running' || countdown.status === 'paused' || durationMs <= 0) return
  commit({ ...state, countdown: { durationMs, status: 'idle', endsAt: null, remainingMs: durationMs } })
}

export function startCountdown(): void {
  const { countdown } = state
  if (countdown.status === 'running') return
  const remaining = countdown.status === 'paused' ? countdown.remainingMs : countdown.durationMs
  if (remaining <= 0) return
  commit({ ...state, countdown: { ...countdown, status: 'running', endsAt: Date.now() + remaining, remainingMs: remaining } })
}

export function pauseCountdown(): void {
  const { countdown } = state
  if (countdown.status !== 'running') return
  commit({ ...state, countdown: { ...countdown, status: 'paused', endsAt: null, remainingMs: remainingOf(countdown, Date.now()) } })
}

export function resetCountdown(): void {
  const { countdown } = state
  const spent = countdown.status === 'running' || countdown.status === 'paused' ? countdown.durationMs - remainingOf(countdown, Date.now()) : 0
  commit({
    ...state,
    countdown: { durationMs: countdown.durationMs, status: 'idle', endsAt: null, remainingMs: countdown.durationMs },
    sessions: withSession('countdown', spent),
  })
}

export function startStopwatch(): void {
  const { stopwatch } = state
  if (stopwatch.status === 'running') return
  commit({ ...state, stopwatch: { ...stopwatch, status: 'running', startedAt: Date.now() } })
}

export function pauseStopwatch(): void {
  const { stopwatch } = state
  if (stopwatch.status !== 'running') return
  commit({ ...state, stopwatch: { ...stopwatch, status: 'paused', startedAt: null, elapsedMs: elapsedOf(stopwatch, Date.now()) } })
}

export function lapStopwatch(): void {
  const { stopwatch } = state
  if (stopwatch.status !== 'running') return
  commit({ ...state, stopwatch: { ...stopwatch, laps: [...stopwatch.laps, elapsedOf(stopwatch, Date.now())] } })
}

export function resetStopwatch(): void {
  const spent = elapsedOf(state.stopwatch, Date.now())
  commit({ ...state, stopwatch: { status: 'idle', startedAt: null, elapsedMs: 0, laps: [] }, sessions: withSession('stopwatch', spent) })
}

export function clearSessions(): void {
  commit({ ...state, sessions: [] })
}

function subscribe(listener: () => void): () => void {
  listeners.add(listener)
  return () => {
    listeners.delete(listener)
  }
}

export function useTimer(): TimerState {
  return useSyncExternalStore(subscribe, () => state)
}
