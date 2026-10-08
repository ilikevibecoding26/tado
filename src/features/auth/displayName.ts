import type { User } from '@supabase/supabase-js'

// Usernames are stored as `<username>@tado.invalid` (see AuthContext); older accounts show their real email.
const USERNAME_SUFFIX = '@tado.invalid'

export function displayName(user: User): string {
  const email = user.email ?? ''
  return email.endsWith(USERNAME_SUFFIX) ? email.slice(0, -USERNAME_SUFFIX.length) : email
}
