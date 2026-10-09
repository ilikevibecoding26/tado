import { useEffect, useMemo, useState } from 'react'
import { endOfDay, format, startOfDay } from 'date-fns'
import { useAuthContext } from '../features/auth/AuthContext'
import { useEventsContext } from '../features/events/EventsContext'
import { useTodosContext } from '../features/todos/TodosContext'
import {
  clearSessions,
  elapsedOf,
  formatClock,
  initTimer,
  lapStopwatch,
  pauseCountdown,
  pauseStopwatch,
  remainingOf,
  resetCountdown,
  resetStopwatch,
  setDuration,
  setLink,
  setMode,
  startCountdown,
  startStopwatch,
  useTimer,
} from '../features/timer/timerStore'
import type { LinkKind, Session, TimerLink, TimerMode } from '../features/timer/timerStore'
import './TimerPage.css'

const PRESET_MINUTES = [5, 10, 15, 25, 45]
const RING_RADIUS = 92
const RING_LENGTH = 2 * Math.PI * RING_RADIUS

function formatSpent(ms: number): string {
  const minutes = Math.round(ms / 60000)
  if (minutes < 1) return `${Math.max(1, Math.round(ms / 1000))}s`
  if (minutes < 60) return `${minutes}m`
  return `${Math.floor(minutes / 60)}h ${String(minutes % 60).padStart(2, '0')}m`
}

const keyOf = (link: TimerLink) => `${link.kind}:${link.id}`
const sameLink = (a: TimerLink | null, b: TimerLink | null) => (a && b ? keyOf(a) === keyOf(b) : a === b)

function LinkPicker() {
  const { user } = useAuthContext()
  const { todos } = useTodosContext()
  const { getEventsInRange } = useEventsContext()
  const { link, now } = useTimer()

  const todayEvents = useMemo(() => {
    const day = new Date(now)
    return getEventsInRange(startOfDay(day), endOfDay(day)).filter((event) => !event.allDay)
    // Recomputing every tick isn't needed; the day only matters when the picker is rebuilt.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [getEventsInRange, format(new Date(now), 'yyyy-MM-dd')])

  const options: TimerLink[] = [
    ...todos.filter((todo) => !todo.done).map((todo): TimerLink => ({ kind: 'todo', id: todo.id, title: todo.title })),
    ...todayEvents.map((event): TimerLink => ({ kind: 'event', id: event.id, title: event.title })),
  ]
  // A link to something that's since been finished or has passed still shows what it was.
  const extra = link && !options.some((option) => keyOf(option) === keyOf(link)) ? link : null

  const onChange = (value: string) => {
    if (!value) return setLink(null)
    const [kind, ...rest] = value.split(':')
    const id = rest.join(':')
    const found = [...options, ...(extra ? [extra] : [])].find((option) => option.kind === (kind as LinkKind) && option.id === id)
    setLink(found ?? null)
  }

  return (
    <label className="timer-field">
      <span className="timer-field-label">Link this timer to a to-do or event (optional)</span>
      <select value={link ? keyOf(link) : ''} onChange={(e) => onChange(e.target.value)} disabled={!user}>
        <option value="">Not linked, just time it</option>
        {extra && <option value={keyOf(extra)}>{extra.title}</option>}
        {todos.some((todo) => !todo.done) && (
          <optgroup label="To-dos">
            {options
              .filter((option) => option.kind === 'todo')
              .map((option) => (
                <option key={keyOf(option)} value={keyOf(option)}>
                  {option.title}
                </option>
              ))}
          </optgroup>
        )}
        {todayEvents.length > 0 && (
          <optgroup label="Today's events">
            {options
              .filter((option) => option.kind === 'event')
              .map((option) => (
                <option key={keyOf(option)} value={keyOf(option)}>
                  {option.title}
                </option>
              ))}
          </optgroup>
        )}
      </select>
      <span className="timer-field-hint">
        {link
          ? `Time you track is saved under “${link.title}” in Time spent below.`
          : options.length > 0
            ? 'Pick one to see how much time you spend on it.'
            : 'Add a to-do, or an event for today, and you can pick it here.'}
      </span>
    </label>
  )
}

function Ring({ progress, children, label }: { progress: number; children: React.ReactNode; label: string }) {
  return (
    <div className="timer-dial" role="timer" aria-label={label}>
      <svg viewBox="0 0 200 200" className="timer-ring" aria-hidden="true">
        <circle cx="100" cy="100" r={RING_RADIUS} className="timer-ring-track" />
        <circle
          cx="100"
          cy="100"
          r={RING_RADIUS}
          className="timer-ring-fill"
          strokeDasharray={RING_LENGTH}
          strokeDashoffset={RING_LENGTH * (1 - Math.min(1, Math.max(0, progress)))}
          transform="rotate(-90 100 100)"
        />
      </svg>
      <div className="timer-dial-face">{children}</div>
    </div>
  )
}

// Minutes and seconds boxes. They keep what you type as text, so you can pass through 0:00 on the way to 0:07.
function CustomDuration({ durationMs }: { durationMs: number }) {
  const [minutes, setMinutes] = useState(String(Math.floor(durationMs / 60000)))
  const [seconds, setSeconds] = useState(String(Math.round((durationMs % 60000) / 1000)).padStart(2, '0'))

  const totalOf = (m: string, s: string) => {
    const whole = (value: string, max: number) => Math.min(max, Math.max(0, Math.floor(Number(value)) || 0))
    return (whole(m, 999) * 60 + whole(s, 59)) * 1000
  }

  // A preset (or anything else) changed the duration: show it.
  useEffect(() => {
    if (totalOf(minutes, seconds) !== durationMs) {
      setMinutes(String(Math.floor(durationMs / 60000)))
      setSeconds(String(Math.round((durationMs % 60000) / 1000)).padStart(2, '0'))
    }
    // Only react to the duration changing, not to each keystroke.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [durationMs])

  const change = (m: string, s: string) => {
    setMinutes(m)
    setSeconds(s)
    const total = totalOf(m, s)
    if (total > 0) setDuration(total)
  }

  return (
    <span className="timer-custom">
      <input
        type="number"
        min={0}
        max={999}
        inputMode="numeric"
        value={minutes}
        onChange={(e) => change(e.target.value, seconds)}
        aria-label="Minutes"
      />
      :
      <input
        type="number"
        min={0}
        max={59}
        inputMode="numeric"
        value={seconds}
        onChange={(e) => change(minutes, e.target.value)}
        aria-label="Seconds"
      />
    </span>
  )
}

function CountdownPanel() {
  const { countdown, now } = useTimer()
  const remaining = remainingOf(countdown, now)
  const idle = countdown.status === 'idle' || countdown.status === 'done'

  return (
    <>
      <Ring progress={remaining / countdown.durationMs} label="Countdown">
        <span className="timer-time">{formatClock(Math.ceil(remaining / 1000) * 1000)}</span>
        {countdown.status === 'done' && <span className="timer-note">Time's up</span>}
        {countdown.status === 'paused' && <span className="timer-note">Paused</span>}
      </Ring>

      {idle && (
        <div className="timer-presets" role="group" aria-label="Set the countdown">
          {PRESET_MINUTES.map((m) => (
            <button
              key={m}
              type="button"
              className={countdown.durationMs === m * 60000 ? 'on' : ''}
              onClick={() => setDuration(m * 60000)}
            >
              {m} min
            </button>
          ))}
          <CustomDuration durationMs={countdown.durationMs} />
        </div>
      )}

      <div className="timer-actions">
        {countdown.status === 'running' ? (
          <button type="button" className="primary" onClick={pauseCountdown}>
            Pause
          </button>
        ) : (
          <button type="button" className="primary" onClick={startCountdown}>
            {countdown.status === 'paused' ? 'Resume' : countdown.status === 'done' ? 'Start again' : 'Start'}
          </button>
        )}
        <button type="button" onClick={resetCountdown} disabled={countdown.status === 'idle'}>
          Reset
        </button>
      </div>
    </>
  )
}

function StopwatchPanel() {
  const { stopwatch, now } = useTimer()
  const elapsed = elapsedOf(stopwatch, now)
  const running = stopwatch.status === 'running'

  return (
    <>
      <Ring progress={(elapsed % 60000) / 60000} label="Stopwatch">
        <span className="timer-time">{formatClock(elapsed, true)}</span>
        {stopwatch.status === 'paused' && <span className="timer-note">Stopped</span>}
      </Ring>

      <div className="timer-actions">
        {running ? (
          <button type="button" className="primary" onClick={pauseStopwatch}>
            Stop
          </button>
        ) : (
          <button type="button" className="primary" onClick={startStopwatch}>
            {stopwatch.status === 'paused' ? 'Resume' : 'Start'}
          </button>
        )}
        <button type="button" onClick={lapStopwatch} disabled={!running}>
          Lap
        </button>
        <button type="button" onClick={resetStopwatch} disabled={stopwatch.status === 'idle'}>
          Reset
        </button>
      </div>

      {stopwatch.laps.length > 0 && (
        <ol className="timer-laps" reversed>
          {[...stopwatch.laps].reverse().map((lap, i, all) => {
            const index = all.length - i
            const previous = index > 1 ? stopwatch.laps[index - 2] : 0
            return (
              <li key={index}>
                <span>Lap {index}</span>
                <span>+{formatClock(lap - previous, true)}</span>
                <span className="timer-lap-total">{formatClock(lap, true)}</span>
              </li>
            )
          })}
        </ol>
      )}
    </>
  )
}

function History() {
  const { sessions, link, now } = useTimer()
  const startOfToday = startOfDay(new Date(now)).getTime()
  const today = sessions.filter((session) => session.endedAt >= startOfToday)
  const todayTotal = today.reduce((sum, session) => sum + session.ms, 0)
  const onThis = link ? sessions.filter((session) => sameLink(session.link, link)).reduce((sum, session) => sum + session.ms, 0) : 0

  const label = (session: Session) => session.link?.title ?? 'Untitled'

  return (
    <section className="timer-history">
      <div className="timer-history-header">
        <h2>Time spent</h2>
        {sessions.length > 0 && (
          <button
            type="button"
            onClick={() => {
              if (window.confirm('Clear your timer history?')) clearSessions()
            }}
          >
            Clear
          </button>
        )}
      </div>
      {sessions.length === 0 ? (
        <p className="timer-hint">Sessions longer than a few seconds show up here, so you can see how long things took.</p>
      ) : (
        <>
          <p className="timer-hint">
            Today: <strong>{formatSpent(todayTotal)}</strong>
            {link && onThis > 0 && (
              <>
                {' '}
                · On “{link.title}”: <strong>{formatSpent(onThis)}</strong>
              </>
            )}
          </p>
          <ul className="timer-sessions">
            {sessions.slice(0, 8).map((session) => (
              <li key={session.id}>
                <span className="timer-session-title">{label(session)}</span>
                <span className="timer-session-when">{format(session.endedAt, 'MMM d, h:mm a')}</span>
                <span className="timer-session-ms">{formatSpent(session.ms)}</span>
              </li>
            ))}
          </ul>
        </>
      )}
    </section>
  )
}

const MODES: { id: TimerMode; label: string }[] = [
  { id: 'countdown', label: 'Countdown' },
  { id: 'stopwatch', label: 'Stopwatch' },
]

export function TimerPage() {
  const { user } = useAuthContext()
  const { mode } = useTimer()
  const [ready, setReady] = useState(false)
  const userId = user?.id

  useEffect(() => {
    if (!userId) return
    const stop = initTimer(userId)
    setReady(true)
    return stop
  }, [userId])

  return (
    <div className="timer-page">
      <div className="timer">
        <div className="timer-modes" role="tablist" aria-label="Timer type">
          {MODES.map((m) => (
            <button
              key={m.id}
              type="button"
              role="tab"
              aria-selected={mode === m.id}
              className={mode === m.id ? 'active' : ''}
              onClick={() => setMode(m.id)}
            >
              {m.label}
            </button>
          ))}
        </div>

        {ready && (
          <>
            {mode === 'countdown' ? <CountdownPanel /> : <StopwatchPanel />}
            <LinkPicker />
            <History />
          </>
        )}
      </div>
    </div>
  )
}
