import { useEffect, useRef, useState } from 'react'
import type { FormEvent } from 'react'
import { addDays, addHours, format } from 'date-fns'
import type { CalendarEvent, EventColor, Recurrence, RepeatUnit } from '../features/events/types'
import { useEventsContext } from '../features/events/EventsContext'
import { triggerMagic } from '../features/theme/appearance'
import { burstConfetti } from '../features/fun/confetti'
import { playPop } from '../features/fun/sound'
import './EventFormModal.css'

export type EditScope = 'this' | 'all'

interface EventFormModalProps {
  event?: CalendarEvent
  /** For an occurrence of a repeating event: change just this one, or the whole series. */
  scope?: EditScope
  initialDate?: Date
  onClose: () => void
}

const DATE_TIME_FORMAT = "yyyy-MM-dd'T'HH:mm"

const COLORS: EventColor[] = ['blue', 'green', 'red', 'yellow', 'purple', 'gray']

type RepeatChoice = 'none' | RepeatUnit | 'custom'

const REPEAT_OPTIONS: { value: RepeatChoice; label: string }[] = [
  { value: 'none', label: "Doesn't repeat" },
  { value: 'daily', label: 'Every day' },
  { value: 'weekly', label: 'Every week' },
  { value: 'monthly', label: 'Every month' },
  { value: 'yearly', label: 'Every year' },
  { value: 'custom', label: 'Custom...' },
]

const UNIT_LABELS: Record<RepeatUnit, string> = { daily: 'days', weekly: 'weeks', monthly: 'months', yearly: 'years' }
const WEEKDAY_LETTERS = ['S', 'M', 'T', 'W', 'T', 'F', 'S']
const WEEKDAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']

function choiceFor(recurrence?: Recurrence): RepeatChoice {
  if (!recurrence) return 'none'
  return recurrence.interval === 1 && !recurrence.weekdays?.length ? recurrence.freq : 'custom'
}

export function EventFormModal({ event, scope, initialDate, onClose }: EventFormModalProps) {
  const dialogRef = useRef<HTMLDialogElement>(null)
  const { addEvent, updateEvent, editOccurrence, editSeries } = useEventsContext()

  const baseDate = event ? new Date(event.start) : (initialDate ?? new Date())
  const baseEnd = event
    ? event.allDay
      ? addDays(new Date(event.end), -1)
      : new Date(event.end)
    : addHours(baseDate, 1)

  const [title, setTitle] = useState(event?.title ?? '')
  const [allDay, setAllDay] = useState(event?.allDay ?? false)
  const [start, setStart] = useState(format(baseDate, DATE_TIME_FORMAT))
  const [end, setEnd] = useState(format(baseEnd, DATE_TIME_FORMAT))
  const [description, setDescription] = useState(event?.description ?? '')
  const [color, setColor] = useState<EventColor>(event?.color ?? 'blue')
  const [error, setError] = useState<string | null>(null)

  // Editing one occurrence on its own can't change how the series repeats.
  const canRepeat = !(event?.seriesId && scope === 'this')
  const [repeat, setRepeat] = useState<RepeatChoice>(choiceFor(event?.recurrence))
  const [everyText, setEveryText] = useState(String(event?.recurrence?.interval ?? 1))
  const [unit, setUnit] = useState<RepeatUnit>(event?.recurrence?.freq ?? 'weekly')
  const [weekdays, setWeekdays] = useState<number[]>(event?.recurrence?.weekdays ?? [baseDate.getDay()])
  const [until, setUntil] = useState(event?.recurrence?.until ?? '')

  useEffect(() => {
    dialogRef.current?.showModal()
  }, [])

  const handleClose = () => {
    dialogRef.current?.close()
    onClose()
  }

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    if (!title.trim()) {
      setError('Title is required.')
      return
    }
    const startDate = allDay ? new Date(`${start.slice(0, 10)}T00:00`) : new Date(start)
    const pickedEndDate = allDay ? new Date(`${end.slice(0, 10)}T00:00`) : new Date(end)
    if (startDate > pickedEndDate) {
      setError('Start must be before end.')
      return
    }
    const endDate = allDay ? addDays(pickedEndDate, 1) : pickedEndDate

    let recurrence: Recurrence | undefined
    if (canRepeat && repeat !== 'none') {
      const custom = repeat === 'custom'
      const freq = custom ? unit : repeat
      const every = custom ? Math.floor(Number(everyText)) : 1
      if (!(every >= 1)) {
        setError('Repeat every needs a number of 1 or more.')
        return
      }
      if (custom && freq === 'weekly' && weekdays.length === 0) {
        setError('Pick at least one day of the week.')
        return
      }
      if (until && until < format(startDate, 'yyyy-MM-dd')) {
        setError('The repeat end date must be on or after the start.')
        return
      }
      // Repeating on only the start's own weekday is the default, so there's nothing to store.
      const onlyStartDay = weekdays.length === 1 && weekdays[0] === startDate.getDay()
      recurrence = {
        freq,
        interval: every,
        ...(custom && freq === 'weekly' && !onlyStartDay ? { weekdays: [...weekdays].sort((a, b) => a - b) } : {}),
        ...(until ? { until } : {}),
        ...(event?.recurrence?.skip?.length ? { skip: event.recurrence.skip } : {}),
      }
    }

    const payload = {
      title: title.trim(),
      start: startDate.toISOString(),
      end: endDate.toISOString(),
      allDay,
      description: description.trim() || undefined,
      color,
      recurrence,
    }
    if (event?.seriesId) {
      if (scope === 'this') editOccurrence(event, payload)
      else editSeries(event, payload)
    } else if (event) {
      updateEvent({ ...payload, id: event.id })
    } else {
      addEvent(payload)
      triggerMagic(payload.title)
      const rect = dialogRef.current?.getBoundingClientRect()
      const originX = rect ? rect.left + rect.width / 2 : window.innerWidth / 2
      const originY = rect ? rect.top + rect.height / 2 : window.innerHeight / 2
      burstConfetti(originX, originY)
      playPop()
    }
    handleClose()
  }

  return (
    <dialog ref={dialogRef} className="event-form-dialog" onClose={onClose}>
      <form className="event-form" onSubmit={handleSubmit}>
        <h2>{event ? (event.seriesId && scope === 'all' ? 'Edit all events' : 'Edit event') : 'New event'}</h2>

        <label className="event-form-field">
          Title
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            autoFocus
            required
          />
        </label>

        <label className="event-form-checkbox">
          <input type="checkbox" checked={allDay} onChange={(e) => setAllDay(e.target.checked)} />
          All day
        </label>

        <div className="event-form-row">
          <label className="event-form-field">
            Start
            <input
              type={allDay ? 'date' : 'datetime-local'}
              value={allDay ? start.slice(0, 10) : start}
              onChange={(e) => setStart(e.target.value)}
              required
            />
          </label>
          <label className="event-form-field">
            End
            <input
              type={allDay ? 'date' : 'datetime-local'}
              value={allDay ? end.slice(0, 10) : end}
              onChange={(e) => setEnd(e.target.value)}
              required
            />
          </label>
        </div>

        {canRepeat && (
          <>
            <label className="event-form-field">
              Repeat
              <select value={repeat} onChange={(e) => setRepeat(e.target.value as RepeatChoice)}>
                {REPEAT_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>

            {repeat === 'custom' && (
              <div className="event-form-row event-form-every">
                <label className="event-form-field">
                  Every
                  <input
                    type="number"
                    min={1}
                    max={999}
                    step={1}
                    inputMode="numeric"
                    value={everyText}
                    onChange={(e) => setEveryText(e.target.value)}
                  />
                </label>
                <label className="event-form-field">
                  Unit
                  <select value={unit} onChange={(e) => setUnit(e.target.value as RepeatUnit)}>
                    {(Object.keys(UNIT_LABELS) as RepeatUnit[]).map((u) => (
                      <option key={u} value={u}>
                        {UNIT_LABELS[u]}
                      </option>
                    ))}
                  </select>
                </label>
              </div>
            )}

            {repeat === 'custom' && unit === 'weekly' && (
              <div className="event-form-weekdays" role="group" aria-label="Repeat on">
                {WEEKDAY_LETTERS.map((letter, day) => (
                  <button
                    key={day}
                    type="button"
                    className={weekdays.includes(day) ? 'on' : ''}
                    aria-pressed={weekdays.includes(day)}
                    aria-label={WEEKDAY_NAMES[day]}
                    onClick={() =>
                      setWeekdays((current) => (current.includes(day) ? current.filter((d) => d !== day) : [...current, day]))
                    }
                  >
                    {letter}
                  </button>
                ))}
              </div>
            )}

            {repeat !== 'none' && (
              <label className="event-form-field">
                Repeat until (optional)
                <input type="date" value={until} onChange={(e) => setUntil(e.target.value)} />
              </label>
            )}
          </>
        )}

        <label className="event-form-field">
          Color
          <select value={color} onChange={(e) => setColor(e.target.value as EventColor)}>
            {COLORS.map((c) => (
              <option key={c} value={c}>
                {c[0].toUpperCase() + c.slice(1)}
              </option>
            ))}
          </select>
        </label>

        <label className="event-form-field">
          Description
          <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={3} />
        </label>

        {error && <p className="event-form-error">{error}</p>}

        <div className="event-form-actions">
          <button type="button" onClick={handleClose}>
            Cancel
          </button>
          <button type="submit" className="primary">
            Save
          </button>
        </div>
      </form>
    </dialog>
  )
}
