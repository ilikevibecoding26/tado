import { createContext, useContext, useEffect, useState } from 'react'
import type { ReactNode } from 'react'
import type { User } from '@supabase/supabase-js'
import { supabase } from './supabaseClient'

interface AuthContextValue {
  user: User | null
  loading: boolean
  signIn: (username: string, password: string) => Promise<{ error: string | null }>
  signUp: (username: string, password: string) => Promise<{ error: string | null }>
  signOut: () => Promise<void>
  changePassword: (currentPassword: string, newPassword: string) => Promise<{ error: string | null }>
}

const AuthContext = createContext<AuthContextValue | null>(null)

// Supabase auth is keyed on an email, so a username is stored as `<username>@<this domain>`.
// No email is ever sent to it (email confirmation is off), and the domain never resolves.
const USERNAME_EMAIL_DOMAIN = 'tado.invalid'
const USERNAME_PATTERN = /^[a-z0-9._-]{3,20}$/

export const USERNAME_RULES = 'Usernames are 3–20 characters: letters, numbers, dots, dashes, underscores.'

// Accounts created before usernames existed use a real email; anything with an "@" is passed through as-is.
function toLoginEmail(identifier: string): string {
  const value = identifier.trim().toLowerCase()
  return value.includes('@') ? value : `${value}@${USERNAME_EMAIL_DOMAIN}`
}

function friendlyError(message: string): string {
  const lower = message.toLowerCase()
  if (lower.includes('already registered')) return 'That username is taken.'
  if (lower.includes('invalid login')) return 'Wrong username or password.'
  if (lower.includes('rate limit')) return 'Too many attempts. Try again in a little while.'
  return message
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setUser(data.session?.user ?? null)
      setLoading(false)
    })
    const { data } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
    })
    return () => {
      data.subscription.unsubscribe()
    }
  }, [])

  const signIn = async (username: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email: toLoginEmail(username), password })
    return { error: error ? friendlyError(error.message) : null }
  }

  const signUp = async (username: string, password: string) => {
    const normalized = username.trim().toLowerCase()
    if (!USERNAME_PATTERN.test(normalized)) {
      return { error: USERNAME_RULES }
    }
    const { error } = await supabase.auth.signUp({ email: toLoginEmail(normalized), password })
    return { error: error ? friendlyError(error.message) : null }
  }

  const signOut = async () => {
    await supabase.auth.signOut()
  }

  // Changing a password needs the current one: signing in with it again proves it's you at the keyboard.
  const changePassword = async (currentPassword: string, newPassword: string) => {
    if (!user?.email) return { error: "You're not signed in." }
    const { error: checkError } = await supabase.auth.signInWithPassword({ email: user.email, password: currentPassword })
    if (checkError) {
      return { error: checkError.message.toLowerCase().includes('invalid login') ? 'Your current password is wrong.' : friendlyError(checkError.message) }
    }
    const { error } = await supabase.auth.updateUser({ password: newPassword })
    return { error: error ? friendlyError(error.message) : null }
  }

  return <AuthContext.Provider value={{ user, loading, signIn, signUp, signOut, changePassword }}>{children}</AuthContext.Provider>
}

export function useAuthContext(): AuthContextValue {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuthContext must be used within an AuthProvider')
  }
  return context
}
