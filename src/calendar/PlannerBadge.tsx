import { useEffect, useRef, useState } from 'react'
import { useEventsContext } from '../features/events/EventsContext'
import { getMilestone } from '../features/fun/messages'
import './PlannerBadge.css'

export function PlannerBadge() {
  const { events } = useEventsContext()
  const milestone = getMilestone(events.length)
  const [celebrate, setCelebrate] = useState(false)
  const prevTitleRef = useRef(milestone.title)

  useEffect(() => {
    if (prevTitleRef.current !== milestone.title) {
      prevTitleRef.current = milestone.title
      setCelebrate(true)
      const timeout = setTimeout(() => setCelebrate(false), 700)
      return () => clearTimeout(timeout)
    }
  }, [milestone.title])

  return (
    <div className={`planner-badge${celebrate ? ' celebrate' : ''}`}>
      <span className="planner-badge-count">{events.length}</span>
      <span className="planner-badge-title">{milestone.title}</span>
    </div>
  )
}
