import { useCallback, useEffect, useRef, useState } from 'react'
import { supabase } from '../auth/supabaseClient'
import type { CalendarEvent } from './types'
import { fetchSharedWithMe, removeShare, respondToShare } from './sharing'
import type { Invite } from './sharing'

// Events other people have shared with you: the accepted ones for your calendar, and invites waiting for an answer.
export function useSharedEvents(userId: string) {
  const [accepted, setAccepted] = useState<CalendarEvent[]>([])
  const [invites, setInvites] = useState<Invite[]>([])
  const refreshTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  const refresh = useCallback(async () => {
    const result = await fetchSharedWithMe(userId)
    if (!result) return
    setAccepted(result.accepted)
    setInvites(result.invites)
  }, [userId])

  // A burst of changes (several events shared at once) is picked up with a single reload.
  const refreshSoon = useCallback(() => {
    if (refreshTimer.current) clearTimeout(refreshTimer.current)
    refreshTimer.current = setTimeout(refresh, 200)
  }, [refresh])

  useEffect(() => {
    refresh()
    // Changes to your shares (new invites, owners editing or deleting events) arrive live.
    const channel = supabase
      .channel(`shares-with-${userId}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'event_shares', filter: `shared_with=eq.${userId}` }, refreshSoon)
      .subscribe()
    const onVisible = () => {
      if (document.visibilityState === 'visible') refresh()
    }
    document.addEventListener('visibilitychange', onVisible)
    return () => {
      supabase.removeChannel(channel)
      document.removeEventListener('visibilitychange', onVisible)
      if (refreshTimer.current) clearTimeout(refreshTimer.current)
    }
  }, [userId, refresh, refreshSoon])

  const respond = useCallback(
    async (shareId: string, accept: boolean) => {
      // Hide the invite right away; the reload puts things right if it didn't go through.
      setInvites((prev) => prev.filter((invite) => invite.shareId !== shareId))
      try {
        await respondToShare(shareId, accept)
      } finally {
        refresh()
      }
    },
    [refresh],
  )

  const leave = useCallback(
    async (shareId: string) => {
      setAccepted((prev) => prev.filter((event) => event.shareId !== shareId))
      try {
        await removeShare(shareId)
      } finally {
        refresh()
      }
    },
    [refresh],
  )

  return { sharedEvents: accepted, invites, respondToInvite: respond, leaveShare: leave }
}
