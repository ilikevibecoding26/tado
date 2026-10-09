import { addMonths } from 'date-fns'
import type { CalendarView } from '../features/events/dateUtils'
import { formatHeaderLabel } from '../features/events/dateUtils'
import { getAppearance, showNotice } from '../features/theme/appearance'
import { createTapCounter } from '../features/fun/tapCounter'
import { playWhoosh } from '../features/fun/sound'
import { PlannerBadge } from './PlannerBadge'
import './Toolbar.css'

interface ToolbarProps {
  currentDate: Date
  view: CalendarView
  onToday: () => void
  onPrev: () => void
  onNext: () => void
  onViewChange: (view: CalendarView) => void
  onJump: (date: Date) => void
}

const VIEWS: CalendarView[] = ['month', 'week', 'day']

// A secret: tap the month title seven times in a row to whoosh off to a random month (Calm and All out only).
const headerTapped = createTapCounter(7, 900)
const JUMP_RANGE_MONTHS = 60

function randomJump(from: Date): Date {
  // Anywhere within five years, but not the month you're already looking at or its neighbors.
  const distance = 2 + Math.floor(Math.random() * (JUMP_RANGE_MONTHS - 1))
  return addMonths(from, Math.random() < 0.5 ? -distance : distance)
}

export function Toolbar({ currentDate, view, onToday, onPrev, onNext, onViewChange, onJump }: ToolbarProps) {
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
        <h1
          className="toolbar-label"
          onClick={() => {
            if (!headerTapped() || getAppearance().effects === 'off') return
            const target = randomJump(currentDate)
            onJump(target)
            playWhoosh()
            showNotice(`Whoosh! Off to ${new Intl.DateTimeFormat(undefined, { month: 'long', year: 'numeric' }).format(target)}.`)
          }}
        >
          {formatHeaderLabel(currentDate, view)}
        </h1>
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
