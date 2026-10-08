import { useState } from 'react'
import type { FormEvent } from 'react'
import { USERNAME_RULES, useAuthContext } from './AuthContext'
import { Mascot } from '../../calendar/Mascot'
import './SignIn.css'

export function SignIn() {
  const { signIn, signUp } = useAuthContext()
  const [mode, setMode] = useState<'sign-in' | 'sign-up'>('sign-in')
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError(null)
    setSubmitting(true)
    const result = mode === 'sign-in' ? await signIn(username, password) : await signUp(username, password)
    setSubmitting(false)
    if (result.error) {
      setError(result.error)
    }
  }

  return (
    <div className="sign-in">
      <div className="sign-in-card">
        <Mascot size={72} />
        <h1>TaDo</h1>
        <p className="sign-in-subtitle">{mode === 'sign-in' ? 'Welcome back' : 'Create your account'}</p>
        <form onSubmit={handleSubmit}>
          <label className="sign-in-field">
            Username
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              autoComplete="username"
              autoCapitalize="none"
              autoCorrect="off"
              spellCheck={false}
              required
              autoFocus
            />
          </label>
          <label className="sign-in-field">
            Password
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete={mode === 'sign-in' ? 'current-password' : 'new-password'}
              required
              minLength={6}
            />
          </label>
          {error && <p className="sign-in-error">{error}</p>}
          {mode === 'sign-up' && (
            <p className="sign-in-hint">
              {USERNAME_RULES} There's no password reset, so pick one you'll remember.
            </p>
          )}
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
          }}
        >
          {mode === 'sign-in' ? "Don't have an account? Sign up" : 'Already have an account? Sign in'}
        </button>
      </div>
    </div>
  )
}
