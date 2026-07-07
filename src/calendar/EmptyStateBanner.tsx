import { useMemo } from 'react'
import { pickRandomMessage } from '../features/fun/messages'
import { Mascot } from './Mascot'
import './EmptyStateBanner.css'

export function EmptyStateBanner() {
  const message = useMemo(() => pickRandomMessage(), [])
  return (
    <div className="empty-state-banner">
      <Mascot />
      <p>{message}</p>
    </div>
  )
}
