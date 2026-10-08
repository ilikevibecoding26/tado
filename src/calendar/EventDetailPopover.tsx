import { useEffect, useRef, useState } from 'react'
import type { CalendarEvent } from '../features/events/types'
import { useEventsContext } from '../features/events/EventsContext'
import { formatTimeLabel } from '../features/events/dateUtils'
import { dayKey, describeRecurrence } from '../features/events/recurrence'
import { ScopeDialog } from './ScopeDialog'
import './EventDetailPopover.css'

interface EventDetailPopoverProps {
  event: CalendarEvent
  onClose: () => void
  onEdit: () => void
}

export function EventDetailPopover({ event, onClose, onEdit }: EventDetailPopoverProps) {
  const dialogRef = useRef<HTMLDialogElement>(null)
  const { deleteEvent, skipOccurrence } = useEventsContext()
  const [askingDelete, setAskingDelete] = useState(false)

  useEffect(() => {
    dialogRef.current?.showModal()
  }, [])

  const handleClose = () => {
    dialogRef.current?.close()
    onClose()
  }

  const handleDelete = () => {
    if (event.seriesId) {
      setAskingDelete(true)
      return
    }
    if (window.confirm(`Delete "${event.title}"?`)) {
      deleteEvent(event.id)
      handleClose()
    }
  }

  const handleDeleteRepeating = (scope: 'this' | 'all') => {
    if (!event.seriesId) return
    if (scope === 'all') deleteEvent(event.seriesId)
    else skipOccurrence(event.seriesId, dayKey(new Date(event.start)))
    handleClose()
  }

  const start = new Date(event.start)
  const end = new Date(event.end)

  return (
    <dialog ref={dialogRef} className="event-detail-dialog" onClose={onClose}>
      <div className="event-detail">
        <h2 className={`event-detail-color event-detail-${event.color ?? 'blue'}`}>{event.title}</h2>
        <p className="event-detail-time">
          {event.allDay
            ? 'All day'
            : `${formatTimeLabel(start)} – ${formatTimeLabel(end)}`}
        </p>
        {event.recurrence && (
          <p className="event-detail-repeat">{describeRecurrence(event.recurrence, new Date(event.start))}</p>
        )}
        {event.description && <p className="event-detail-description">{event.description}</p>}
        <div className="event-detail-actions">
          <button type="button" onClick={handleClose}>
            Close
          </button>
          <button type="button" onClick={onEdit}>
            Edit
          </button>
          <button type="button" className="danger" onClick={handleDelete}>
            Delete
          </button>
        </div>
      </div>
      {askingDelete && (
        <ScopeDialog
          title="Delete repeating event"
          verb="be deleted"
          danger
          onChoose={handleDeleteRepeating}
          onCancel={() => setAskingDelete(false)}
        />
      )}
    </dialog>
  )
}
