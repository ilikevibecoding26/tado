import { supabase } from '../auth/supabaseClient'
import type { EventRepository } from './repository'
import type { CalendarEvent, EventColor } from './types'
import { readCache, writeCache } from './localCache'

interface EventRow {
  id: string
  user_id: string
  title: string
  starts_at: string
  ends_at: string
  all_day: boolean
  description: string | null
  color: string | null
}

export type RemoteChange = { type: 'upsert'; event: CalendarEvent } | { type: 'delete'; id: string }

export interface SupabaseEventRepository extends EventRepository {
  subscribe(onRemoteChange: (change: RemoteChange) => void): () => void
}

function rowToEvent(row: EventRow): CalendarEvent {
  return {
    id: row.id,
    title: row.title,
    start: row.starts_at,
    end: row.ends_at,
    allDay: row.all_day,
    description: row.description ?? undefined,
    color: (row.color as EventColor | null) ?? undefined,
  }
}

function eventToRow(event: CalendarEvent, userId: string): EventRow {
  return {
    id: event.id,
    user_id: userId,
    title: event.title,
    starts_at: event.start,
    ends_at: event.end,
    all_day: event.allDay,
    description: event.description ?? null,
    color: event.color ?? null,
  }
}

export function createSupabaseEventRepository(userId: string): SupabaseEventRepository {
  return {
    async getAll() {
      const { data, error } = await supabase.from('events').select('*').eq('user_id', userId)
      if (error) {
        return readCache(userId)
      }
      const events = (data as EventRow[]).map(rowToEvent)
      writeCache(userId, events)
      return events
    },

    async save(event) {
      const { error } = await supabase.from('events').upsert(eventToRow(event, userId))
      if (error) throw new Error(error.message)
    },

    async remove(id) {
      const { error } = await supabase.from('events').delete().eq('id', id)
      if (error) throw new Error(error.message)
    },

    subscribe(onRemoteChange) {
      const channel = supabase
        .channel(`events-changes-${userId}`)
        .on<EventRow>(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'events', filter: `user_id=eq.${userId}` },
          (payload) => {
            if (payload.eventType === 'DELETE') {
              onRemoteChange({ type: 'delete', id: (payload.old as EventRow).id })
            } else {
              onRemoteChange({ type: 'upsert', event: rowToEvent(payload.new as EventRow) })
            }
          },
        )
        .subscribe()

      return () => {
        supabase.removeChannel(channel)
      }
    },
  }
}
