import { useEffect, useRef, useState } from 'react'
import type { FormEvent } from 'react'
import { addDays, addHours, format } from 'date-fns'
import type { CalendarEvent, EventColor } from '../features/events/types'
import { useEventsContext } from '../features/events/EventsContext'
import { burstConfetti } from '../features/fun/confetti'
import { playPop } from '../features/fun/sound'
import './EventFormModal.css'

interface EventFormModalProps {
  event?: CalendarEvent
  initialDate?: Date
  onClose: () => void
}

const DATE_TIME_FORMAT = "yyyy-MM-dd'T'HH:mm"

const COLORS: EventColor[] = ['blue', 'green', 'red', 'yellow', 'purple', 'gray']

export function EventFormModal({ event, initialDate, onClose }: EventFormModalProps) {
  const dialogRef = useRef<HTMLDialogElement>(null)
  const { addEvent, updateEvent } = useEventsContext()

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
    const payload = {
      title: title.trim(),
      start: startDate.toISOString(),
      end: endDate.toISOString(),
      allDay,
      description: description.trim() || undefined,
      color,
    }
    if (event) {
      updateEvent({ ...payload, id: event.id })
    } else {
      addEvent(payload)
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
        <h2>{event ? 'Edit event' : 'New event'}</h2>

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
