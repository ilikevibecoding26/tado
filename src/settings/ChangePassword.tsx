import { useState } from 'react'
import type { FormEvent } from 'react'
import { useAuthContext } from '../features/auth/AuthContext'
import './ChangePassword.css'

const MIN_LENGTH = 6

// Settings: change your password. It asks for the current one first.
export function ChangePassword() {
  const { changePassword } = useAuthContext()
  const [open, setOpen] = useState(false)
  const [current, setCurrent] = useState('')
  const [next, setNext] = useState('')
  const [confirm, setConfirm] = useState('')
  const [show, setShow] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [saved, setSaved] = useState(false)
  const [busy, setBusy] = useState(false)

  const close = () => {
    setOpen(false)
    setCurrent('')
    setNext('')
    setConfirm('')
    setShow(false)
    setError(null)
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setSaved(false)
    if (next.length < MIN_LENGTH) return setError(`Your new password needs at least ${MIN_LENGTH} characters.`)
    if (next !== confirm) return setError("The new passwords don't match.")
    if (next === current) return setError('Your new password is the same as your current one.')
    setBusy(true)
    setError(null)
    const result = await changePassword(current, next)
    setBusy(false)
    if (result.error) return setError(result.error)
    close()
    setSaved(true)
  }

  if (!open) {
    return (
      <div className="change-password">
        <button
          type="button"
          onClick={() => {
            setSaved(false)
            setOpen(true)
          }}
        >
          Change password
        </button>
        {saved && (
          <span className="change-password-saved" role="status">
            Password changed.
          </span>
        )}
      </div>
    )
  }

  const type = show ? 'text' : 'password'
  return (
    <form className="change-password-form" onSubmit={handleSubmit}>
      <h2>Change password</h2>
      <label>
        Current password
        <input type={type} value={current} onChange={(e) => setCurrent(e.target.value)} autoComplete="current-password" autoCapitalize="none" autoCorrect="off" spellCheck={false} required />
      </label>
      <label>
        New password
        <input type={type} value={next} onChange={(e) => setNext(e.target.value)} autoComplete="new-password" autoCapitalize="none" autoCorrect="off" spellCheck={false} required minLength={MIN_LENGTH} />
      </label>
      <label>
        Type the new password again
        <input type={type} value={confirm} onChange={(e) => setConfirm(e.target.value)} autoComplete="new-password" autoCapitalize="none" autoCorrect="off" spellCheck={false} required minLength={MIN_LENGTH} />
      </label>
      <label className="change-password-show">
        <input type="checkbox" checked={show} onChange={(e) => setShow(e.target.checked)} />
        Show passwords
      </label>
      {error && (
        <p className="change-password-error" role="alert">
          {error}
        </p>
      )}
      <div className="change-password-actions">
        <button type="button" onClick={close} disabled={busy}>
          Cancel
        </button>
        <button type="submit" className="primary" disabled={busy}>
          {busy ? 'Saving...' : 'Save new password'}
        </button>
      </div>
    </form>
  )
}
