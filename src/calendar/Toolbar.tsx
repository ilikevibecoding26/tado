import type { CalendarView } from '../features/events/dateUtils'
import { formatHeaderLabel } from '../features/events/dateUtils'
import { PlannerBadge } from './PlannerBadge'
import './Toolbar.css'

interface ToolbarProps {
  currentDate: Date
  view: CalendarView
  onToday: () => void
  onPrev: () => void
  onNext: () => void
  onViewChange: (view: CalendarView) => void
}

const VIEWS: CalendarView[] = ['month', 'week', 'day']

export function Toolbar({ currentDate, view, onToday, onPrev, onNext, onViewChange }: ToolbarProps) {
  return (
    <div className="toolbar">
      <div className="toolbar-nav">
        <button type="button" onClick={onToday}>
          Today
        </button>
        <button type="button" aria-label="Previous" onClick={onPrev}>
          ‹
        </button>
        <button type="button" aria-label="Next" onClick={onNext}>
          ›
        </button>
        <h1 className="toolbar-label">{formatHeaderLabel(currentDate, view)}</h1>
        <PlannerBadge />
      </div>
      <div className="toolbar-views" role="group" aria-label="Calendar view">
        {VIEWS.map((v) => (
          <button
            key={v}
            type="button"
            className={v === view ? 'active' : ''}
            onClick={() => onViewChange(v)}
          >
            {v[0].toUpperCase() + v.slice(1)}
          </button>
        ))}
      </div>
    </div>
  )
}
