import { format } from 'date-fns'
import { useEventsContext } from '../features/events/EventsContext'
import './InviteBanner.css'

// Events other people have shared with you wait here until you accept them.
export function InviteBanner() {
  const { invites, respondToInvite } = useEventsContext()
  if (invites.length === 0) return null

  return (
    <div className="invite-banner" role="region" aria-label="Event invites">
      {invites.map(({ shareId, event, from }) => {
        const start = new Date(event.start)
        return (
          <div key={shareId} className="invite-banner-item">
            <span className="invite-banner-text">
              <strong>{from}</strong> shared “{event.title}”
              <span className="invite-banner-when">
                {' '}
                {format(start, event.allDay ? 'EEE, MMM d' : 'EEE, MMM d, h:mm a')}
                {event.recurrence ? ' (repeats)' : ''}
              </span>
            </span>
            <span className="invite-banner-actions">
              <button type="button" className="primary" onClick={() => respondToInvite(shareId, true)}>
                Accept
              </button>
              <button type="button" onClick={() => respondToInvite(shareId, false)}>
                Decline
              </button>
            </span>
          </div>
        )
      })}
    </div>
  )
}
