import { useEffect, useState } from 'react'
import { useAppearance } from '../features/theme/appearance'
import './FoundToast.css'

// A small note when something secret happens (a mascot is found, a theme unlocks).
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
      {notice.text}
    </div>
  )
}
