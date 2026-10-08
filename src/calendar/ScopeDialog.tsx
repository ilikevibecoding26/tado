import { useEffect, useRef } from 'react'
import type { EditScope } from './EventFormModal'
import './ScopeDialog.css'

interface ScopeDialogProps {
  title: string
  verb: string
  danger?: boolean
  onChoose: (scope: EditScope) => void
  onCancel: () => void
}

// Asks which events a change to a repeating event should apply to.
export function ScopeDialog({ title, verb, danger, onChoose, onCancel }: ScopeDialogProps) {
  const dialogRef = useRef<HTMLDialogElement>(null)

  useEffect(() => {
    dialogRef.current?.showModal()
  }, [])

  return (
    <dialog ref={dialogRef} className="scope-dialog" onClose={onCancel}>
      <div className="scope-dialog-body">
        <h2>{title}</h2>
        <p>This event repeats. Which events should {verb}?</p>
        <div className="scope-dialog-actions">
          <button type="button" className={danger ? 'danger' : ''} onClick={() => onChoose('this')}>
            Just this event
          </button>
          <button type="button" className={danger ? 'danger' : ''} onClick={() => onChoose('all')}>
            All events in the series
          </button>
          <button type="button" onClick={onCancel}>
            Cancel
          </button>
        </div>
      </div>
    </dialog>
  )
}
