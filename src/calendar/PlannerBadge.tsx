import { useEffect, useRef, useState } from 'react'
import { useEventsContext } from '../features/events/EventsContext'
import { useAppearance } from '../features/theme/appearance'
import { getMilestone } from '../features/fun/messages'
import './PlannerBadge.css'

export function PlannerBadge() {
  const { events } = useEventsContext()
  const appearance = useAppearance()
  const milestone = getMilestone(events.length, appearance)
  const [celebrate, setCelebrate] = useState(false)
  // Compare levels, not titles, so switching themes doesn't look like a level-up.
  const prevLevelRef = useRef(milestone.count)

  useEffect(() => {
    if (prevLevelRef.current !== milestone.count) {
      prevLevelRef.current = milestone.count
      setCelebrate(true)
      const timeout = setTimeout(() => setCelebrate(false), 700)
      return () => clearTimeout(timeout)
    }
  }, [milestone.count])

  return (
    <div className={`planner-badge${celebrate ? ' celebrate' : ''}`}>
      <span className="planner-badge-count">{events.length}</span>
      <span className="planner-badge-title">{milestone.title}</span>
    </div>
  )
}
