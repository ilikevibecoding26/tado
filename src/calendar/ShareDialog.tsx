import { useCallback, useEffect, useRef, useState } from 'react'
import type { FormEvent } from 'react'
import { fetchRecipients, inviteByUsername, removeShare } from '../features/events/sharing'
import type { Recipient } from '../features/events/sharing'
import './ScopeDialog.css'
import './ShareDialog.css'

interface ShareDialogProps {
  eventId: string
  title: string
  onClose: () => void
}

// The owner's view of who an event is shared with: invite people by username, or take them off.
export function ShareDialog({ eventId, title, onClose }: ShareDialogProps) {
  const dialogRef = useRef<HTMLDialogElement>(null)
  const [username, setUsername] = useState('')
  const [recipients, setRecipients] = useState<Recipient[] | null>(null)
  const [message, setMessage] = useState<{ text: string; ok: boolean } | null>(null)
  const [busy, setBusy] = useState(false)

  const load = useCallback(async () => {
    try {
      setRecipients(await fetchRecipients(eventId))
    } catch {
      setMessage({ text: "Couldn't load who this is shared with.", ok: false })
      setRecipients([])
    }
  }, [eventId])

  useEffect(() => {
    dialogRef.current?.showModal()
    load()
  }, [load])

  const handleInvite = async (e: FormEvent) => {
    e.preventDefault()
    const name = username.trim()
    if (!name || busy) return
    setBusy(true)
    const error = await inviteByUsername(eventId, name)
    setBusy(false)
    if (error) {
      setMessage({ text: error, ok: false })
      return
    }
    setMessage({ text: `Invite sent to ${name.toLowerCase()}. They'll see it once they accept.`, ok: true })
    setUsername('')
    load()
  }

  const handleRemove = async (shareId: string) => {
    setRecipients((prev) => prev?.filter((recipient) => recipient.shareId !== shareId) ?? null)
    try {
      await removeShare(shareId)
    } catch {
      setMessage({ text: "Couldn't remove them. Try again.", ok: false })
    }
    load()
  }

  return (
    <dialog ref={dialogRef} className="scope-dialog share-dialog" onClose={onClose}>
      <div className="scope-dialog-body">
        <h2>Share “{title}”</h2>
        <p>They can see this event on their calendar, but they can't change it.</p>
        <form className="share-dialog-form" onSubmit={handleInvite}>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Their username"
            aria-label="Their username"
            autoCapitalize="none"
            autoCorrect="off"
            spellCheck={false}
            autoFocus
          />
          <button type="submit" disabled={busy || !username.trim()}>
            Invite
          </button>
        </form>
        {message && (
          <p className={message.ok ? 'share-dialog-ok' : 'share-dialog-error'} role="status">
            {message.text}
          </p>
        )}
        {recipients && recipients.length > 0 && (
          <ul className="share-dialog-list">
            {recipients.map((recipient) => (
              <li key={recipient.shareId}>
                <span className="share-dialog-name">{recipient.username}</span>
                <span className="share-dialog-status">{recipient.accepted ? 'Accepted' : 'Waiting'}</span>
                <button type="button" onClick={() => handleRemove(recipient.shareId)} aria-label={`Stop sharing with ${recipient.username}`}>
                  Remove
                </button>
              </li>
            ))}
          </ul>
        )}
        <div className="scope-dialog-actions">
          <button type="button" onClick={onClose}>
            Done
          </button>
        </div>
      </div>
    </dialog>
  )
}
