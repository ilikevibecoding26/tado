import { supabase } from '../auth/supabaseClient'
import type { Todo } from './types'

interface TodoRow {
  id: string
  user_id: string
  title: string
  done: boolean
  due_date: string | null
}

export type RemoteTodoChange = { type: 'upsert'; todo: Todo } | { type: 'delete'; id: string }

export interface TodoRepository {
  getAll(): Promise<Todo[]>
  save(todo: Todo): Promise<void>
  remove(id: string): Promise<void>
  removeMany(ids: string[]): Promise<void>
  subscribe(onRemoteChange: (change: RemoteTodoChange) => void): () => void
}

function rowToTodo(row: TodoRow): Todo {
  return {
    id: row.id,
    title: row.title,
    done: row.done,
    dueDate: row.due_date ?? undefined,
  }
}

function todoToRow(todo: Todo, userId: string): TodoRow {
  return {
    id: todo.id,
    user_id: userId,
    title: todo.title,
    done: todo.done,
    due_date: todo.dueDate ?? null,
  }
}

function cacheKey(userId: string): string {
  return `todos-cache:${userId}`
}

function readCache(userId: string): Todo[] {
  const raw = localStorage.getItem(cacheKey(userId))
  if (!raw) return []
  try {
    return JSON.parse(raw) as Todo[]
  } catch {
    return []
  }
}

function writeCache(userId: string, todos: Todo[]): void {
  localStorage.setItem(cacheKey(userId), JSON.stringify(todos))
}

export function createSupabaseTodoRepository(userId: string): TodoRepository {
  return {
    async getAll() {
      const { data, error } = await supabase
        .from('todos')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: true })
      if (error) {
        return readCache(userId)
      }
      const todos = (data as TodoRow[]).map(rowToTodo)
      writeCache(userId, todos)
      return todos
    },

    async save(todo) {
      const { error } = await supabase.from('todos').upsert(todoToRow(todo, userId))
      if (error) throw new Error(error.message)
    },

    async remove(id) {
      const { error } = await supabase.from('todos').delete().eq('id', id)
      if (error) throw new Error(error.message)
    },

    async removeMany(ids) {
      if (ids.length === 0) return
      const { error } = await supabase.from('todos').delete().in('id', ids)
      if (error) throw new Error(error.message)
    },

    subscribe(onRemoteChange) {
      const channel = supabase
        .channel(`todos-changes-${userId}`)
        .on<TodoRow>(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'todos', filter: `user_id=eq.${userId}` },
          (payload) => {
            if (payload.eventType === 'DELETE') {
              onRemoteChange({ type: 'delete', id: (payload.old as TodoRow).id })
            } else {
              onRemoteChange({ type: 'upsert', todo: rowToTodo(payload.new as TodoRow) })
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
