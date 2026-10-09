import { useEffect, useRef, useState } from 'react'
import type { CalendarEvent } from '../features/events/types'
import type { CalendarView } from '../features/events/dateUtils'
import { shiftDate } from '../features/events/dateUtils'
import { useEventsContext } from '../features/events/EventsContext'
import { reactWith } from '../features/theme/appearance'
import { isFarYear, timeTravelLine } from '../features/fun/timeTravel'
import { Toolbar } from './Toolbar'
import { MonthView } from './MonthView'
import { WeekView } from './WeekView'
import { DayView } from './DayView'
import { EventFormModal } from './EventFormModal'
import type { EditScope } from './EventFormModal'
import { ScopeDialog } from './ScopeDialog'
import { InviteBanner } from './InviteBanner'
import { EventDetailPopover } from './EventDetailPopover'
import './Calendar.css'

type FormModalState =
  | { mode: 'create'; date: Date }
  | { mode: 'edit'; event: CalendarEvent; scope?: EditScope }
  | null

export function Calendar() {
  const { syncError } = useEventsContext()
  const [currentDate, setCurrentDate] = useState(() => new Date())
  const [view, setView] = useState<CalendarView>('month')
  const [formModal, setFormModal] = useState<FormModalState>(null)
  const [detailEvent, setDetailEvent] = useState<CalendarEvent | null>(null)
  const [scopeEvent, setScopeEvent] = useState<CalendarEvent | null>(null)

  // A secret: wander far into the future or the past and the mascot gets lost.
  const year = currentDate.getFullYear()
  const wasFar = useRef(false)
  useEffect(() => {
    const far = isFarYear(year)
    if (far && !wasFar.current) reactWith('timewarp', timeTravelLine(year), 4500)
    wasFar.current = far
  }, [year])

  const handleToday = () => setCurrentDate(new Date())
  const handlePrev = () => setCurrentDate((date) => shiftDate(date, view, -1))
  const handleNext = () => setCurrentDate((date) => shiftDate(date, view, 1))

  const handleSlotClick = (date: Date) => {
    setFormModal({ mode: 'create', date })
  }

  const handleEventClick = (event: CalendarEvent) => {
    setDetailEvent(event)
  }

  const handleEdit = (event: CalendarEvent) => {
    setDetailEvent(null)
    // A repeating event asks first whether to change just this one or the whole series.
    if (event.seriesId) setScopeEvent(event)
    else setFormModal({ mode: 'edit', event })
  }

  return (
    <div className="calendar">
      <Toolbar
        currentDate={currentDate}
        view={view}
        onToday={handleToday}
        onPrev={handlePrev}
        onNext={handleNext}
        onViewChange={setView}
        onJump={setCurrentDate}
      />
      <InviteBanner />
      {syncError && <div className="calendar-sync-error">{syncError}</div>}
      <div className="calendar-body">
        <div key={`${view}-${currentDate.toDateString()}`} className="calendar-view-enter">
          {view === 'month' && (
            <MonthView currentDate={currentDate} onSlotClick={handleSlotClick} onEventClick={handleEventClick} />
          )}
          {view === 'week' && (
            <WeekView currentDate={currentDate} onSlotClick={handleSlotClick} onEventClick={handleEventClick} />
          )}
          {view === 'day' && (
            <DayView currentDate={currentDate} onSlotClick={handleSlotClick} onEventClick={handleEventClick} />
          )}
        </div>
      </div>
      {formModal && (
        <EventFormModal
          event={formModal.mode === 'edit' ? formModal.event : undefined}
          scope={formModal.mode === 'edit' ? formModal.scope : undefined}
          initialDate={formModal.mode === 'create' ? formModal.date : undefined}
          onClose={() => setFormModal(null)}
        />
      )}
      {scopeEvent && (
        <ScopeDialog
          title="Edit repeating event"
          verb="change"
          onChoose={(scope) => {
            setFormModal({ mode: 'edit', event: scopeEvent, scope })
            setScopeEvent(null)
          }}
          onCancel={() => setScopeEvent(null)}
        />
      )}
      {detailEvent && (
        <EventDetailPopover
          event={detailEvent}
          onClose={() => setDetailEvent(null)}
          onEdit={() => handleEdit(detailEvent)}
        />
      )}
    </div>
  )
}
