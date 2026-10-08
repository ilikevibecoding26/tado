import { supabase } from '../auth/supabaseClient'
import { rowToEvent } from './supabaseEventRepository'
import type { EventRow } from './supabaseEventRepository'
import type { CalendarEvent } from './types'

/** An event someone has shared with you that you haven't accepted yet. */
export interface Invite {
  shareId: string
  event: CalendarEvent
  from: string
}

/** Someone one of your events is shared with. */
export interface Recipient {
  shareId: string
  username: string
  accepted: boolean
}

interface ShareWithEventRow {
  id: string
  status: 'pending' | 'accepted'
  owner_id: string
  events: EventRow | null
}

const UNKNOWN_NAME = 'someone'

async function usernamesFor(ids: string[]): Promise<Map<string, string>> {
  const names = new Map<string, string>()
  if (ids.length === 0) return names
  const { data } = await supabase.rpc('share_usernames', { p_ids: [...new Set(ids)] })
  for (const row of (data ?? []) as { id: string; username: string | null }[]) {
    if (row.username) names.set(row.id, row.username)
  }
  return names
}

/** Events shared with you, split into the ones you've accepted and the invites waiting for an answer. */
export async function fetchSharedWithMe(userId: string): Promise<{ accepted: CalendarEvent[]; invites: Invite[] } | null> {
  const { data, error } = await supabase
    .from('event_shares')
    .select('id, status, owner_id, events(*)')
    .eq('shared_with', userId)
  if (error) return null
  const rows = (data as unknown as ShareWithEventRow[]).filter((row) => row.events)
  const names = await usernamesFor(rows.map((row) => row.owner_id))
  const accepted: CalendarEvent[] = []
  const invites: Invite[] = []
  for (const row of rows) {
    const event = rowToEvent(row.events as EventRow)
    const from = names.get(row.owner_id) ?? UNKNOWN_NAME
    if (row.status === 'accepted') accepted.push({ ...event, sharedBy: from, shareId: row.id })
    else invites.push({ shareId: row.id, event, from })
  }
  return { accepted, invites }
}

export async function respondToShare(shareId: string, accept: boolean): Promise<void> {
  const { error } = accept
    ? await supabase.from('event_shares').update({ status: 'accepted' }).eq('id', shareId)
    : await supabase.from('event_shares').delete().eq('id', shareId)
  if (error) throw new Error(error.message)
}

/** Stop sharing: the owner removes someone, or someone leaves an event. */
export async function removeShare(shareId: string): Promise<void> {
  const { error } = await supabase.from('event_shares').delete().eq('id', shareId)
  if (error) throw new Error(error.message)
}

export async function fetchRecipients(eventId: string): Promise<Recipient[]> {
  const { data, error } = await supabase
    .from('event_shares')
    .select('id, status, shared_with')
    .eq('event_id', eventId)
    .order('created_at')
  if (error) throw new Error(error.message)
  const rows = data as { id: string; status: string; shared_with: string }[]
  const names = await usernamesFor(rows.map((row) => row.shared_with))
  return rows.map((row) => ({
    shareId: row.id,
    username: names.get(row.shared_with) ?? UNKNOWN_NAME,
    accepted: row.status === 'accepted',
  }))
}

const INVITE_MESSAGES: Record<string, string> = {
  not_found: "There's no TaDo user with that username.",
  self: "That's you! Share it with someone else.",
  already: 'This event is already shared with them.',
  not_yours: 'Only the owner can share this event.',
}

/** Invites someone by their exact username. Returns an error message, or null when the invite was sent. */
export async function inviteByUsername(eventId: string, username: string): Promise<string | null> {
  const { data, error } = await supabase.rpc('share_event', { p_event_id: eventId, p_username: username })
  if (error) return "Couldn't send the invite. Check your connection and try again."
  if (data === 'ok') return null
  return INVITE_MESSAGES[data as string] ?? "Couldn't send the invite."
}
