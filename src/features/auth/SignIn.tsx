import { useState } from 'react'
import type { FormEvent } from 'react'
import { useAuthContext } from './AuthContext'
import { Mascot } from '../../calendar/Mascot'
import './SignIn.css'

export function SignIn() {
  const { signIn, signUp } = useAuthContext()
  const [mode, setMode] = useState<'sign-in' | 'sign-up'>('sign-in')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [info, setInfo] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError(null)
    setInfo(null)
    setSubmitting(true)
    const result = mode === 'sign-in' ? await signIn(email, password) : await signUp(email, password)
    setSubmitting(false)
    if (result.error) {
      setError(result.error)
      return
    }
    if (mode === 'sign-up') {
      setInfo('Account created! Check your email to confirm, then sign in.')
    }
  }

  return (
    <div className="sign-in">
      <div className="sign-in-card">
        <Mascot />
        <h1>TaDo</h1>
        <p className="sign-in-subtitle">{mode === 'sign-in' ? 'Welcome back' : 'Create your account'}</p>
        <form onSubmit={handleSubmit}>
          <label className="sign-in-field">
            Email
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required autoFocus />
          </label>
          <label className="sign-in-field">
            Password
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
            />
          </label>
          {error && <p className="sign-in-error">{error}</p>}
          {info && <p className="sign-in-info">{info}</p>}
          <button type="submit" className="primary" disabled={submitting}>
            {submitting ? 'Please wait...' : mode === 'sign-in' ? 'Sign in' : 'Sign up'}
          </button>
        </form>
        <button
          type="button"
          className="sign-in-toggle"
          onClick={() => {
            setMode(mode === 'sign-in' ? 'sign-up' : 'sign-in')
            setError(null)
            setInfo(null)
          }}
        >
          {mode === 'sign-in' ? "Don't have an account? Sign up" : 'Already have an account? Sign in'}
        </button>
      </div>
    </div>
  )
}
