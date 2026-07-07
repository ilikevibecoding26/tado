import { useState } from 'react'
import type { CalendarEvent } from '../features/events/types'
import type { CalendarView } from '../features/events/dateUtils'
import { shiftDate } from '../features/events/dateUtils'
import { Toolbar } from './Toolbar'
import { MonthView } from './MonthView'
import { WeekView } from './WeekView'
import { DayView } from './DayView'
import { EventFormModal } from './EventFormModal'
import { EventDetailPopover } from './EventDetailPopover'
import './Calendar.css'

type FormModalState = { mode: 'create'; date: Date } | { mode: 'edit'; event: CalendarEvent } | null

export function Calendar() {
  const [currentDate, setCurrentDate] = useState(() => new Date())
  const [view, setView] = useState<CalendarView>('month')
  const [formModal, setFormModal] = useState<FormModalState>(null)
  const [detailEvent, setDetailEvent] = useState<CalendarEvent | null>(null)

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
    setFormModal({ mode: 'edit', event })
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
      />
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
          initialDate={formModal.mode === 'create' ? formModal.date : undefined}
          onClose={() => setFormModal(null)}
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
