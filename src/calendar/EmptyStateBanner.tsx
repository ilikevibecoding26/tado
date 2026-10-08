import { useMemo } from 'react'
import { useAppearance } from '../features/theme/appearance'
import { pickRandomMessage } from '../features/fun/messages'
import { Mascot } from './Mascot'
import './EmptyStateBanner.css'

export function EmptyStateBanner() {
  const appearance = useAppearance()
  // Pick once per theme/effects choice so the message doesn't change on every re-render.
  const message = useMemo(() => pickRandomMessage(appearance), [appearance])
  return (
    <div className="empty-state-banner">
      <Mascot />
      <p>{message}</p>
    </div>
  )
}
