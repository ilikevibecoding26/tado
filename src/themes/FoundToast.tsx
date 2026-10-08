import { useEffect, useState } from 'react'
import { useAppearance } from '../features/theme/appearance'
import { MASCOT_NAMES } from '../features/theme/theme'
import './FoundToast.css'

// A small note the first time a secret mascot is discovered.
export function FoundToast() {
  const { notice } = useAppearance()
  const [visibleNonce, setVisibleNonce] = useState<number | null>(null)

  useEffect(() => {
    if (!notice) return
    setVisibleNonce(notice.nonce)
    const timeout = setTimeout(() => setVisibleNonce(null), 3200)
    return () => clearTimeout(timeout)
  }, [notice])

  if (!notice || visibleNonce !== notice.nonce) return null

  return (
    <div className="found-toast" role="status">
      You found the {MASCOT_NAMES[notice.id].toLowerCase()}!
    </div>
  )
}
