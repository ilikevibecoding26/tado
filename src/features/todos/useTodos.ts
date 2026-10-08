import { useCallback, useEffect, useMemo, useState } from 'react'
import type { Todo } from './types'
import { createSupabaseTodoRepository } from './todoRepository'

export function useTodos(userId: string) {
  const repository = useMemo(() => createSupabaseTodoRepository(userId), [userId])
  const [todos, setTodos] = useState<Todo[]>([])
  const [loaded, setLoaded] = useState(false)
  const [syncError, setSyncError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    setLoaded(false)
    repository.getAll().then((loadedTodos) => {
      if (!cancelled) {
        setTodos(loadedTodos)
        setLoaded(true)
      }
    })
    return () => {
      cancelled = true
    }
  }, [repository])

  useEffect(() => {
    const unsubscribe = repository.subscribe((change) => {
      setTodos((prev) => {
        if (change.type === 'delete') {
          return prev.filter((existing) => existing.id !== change.id)
        }
        const index = prev.findIndex((existing) => existing.id === change.todo.id)
        if (index === -1) return [...prev, change.todo]
        const next = [...prev]
        next[index] = change.todo
        return next
      })
    })
    return unsubscribe
  }, [repository])

  const addTodo = useCallback(
    async (title: string, dueDate?: string) => {
      const todo: Todo = { id: crypto.randomUUID(), title, done: false, dueDate }
      setTodos((prev) => [...prev, todo])
      setSyncError(null)
      try {
        await repository.save(todo)
      } catch {
        setTodos((prev) => prev.filter((existing) => existing.id !== todo.id))
        setSyncError("Couldn't save — check your connection.")
      }
    },
    [repository],
  )

  const toggleTodo = useCallback(
    async (id: string) => {
      const previous = todos.find((existing) => existing.id === id)
      if (!previous) return
      const updated: Todo = { ...previous, done: !previous.done }
      setTodos((prev) => prev.map((existing) => (existing.id === id ? updated : existing)))
      setSyncError(null)
      try {
        await repository.save(updated)
      } catch {
        setTodos((prev) => prev.map((existing) => (existing.id === id ? previous : existing)))
        setSyncError("Couldn't save — check your connection.")
      }
    },
    [repository, todos],
  )

  const deleteTodo = useCallback(
    async (id: string) => {
      const previous = todos.find((existing) => existing.id === id)
      setTodos((prev) => prev.filter((existing) => existing.id !== id))
      setSyncError(null)
      try {
        await repository.remove(id)
      } catch {
        if (previous) {
          setTodos((prev) => [...prev, previous])
        }
        setSyncError("Couldn't delete — check your connection.")
      }
    },
    [repository, todos],
  )

  const clearCompleted = useCallback(async () => {
    const removed = todos.filter((existing) => existing.done)
    if (removed.length === 0) return
    const ids = new Set(removed.map((existing) => existing.id))
    setTodos((prev) => prev.filter((existing) => !ids.has(existing.id)))
    setSyncError(null)
    try {
      await repository.removeMany([...ids])
    } catch {
      setTodos((prev) => [...prev, ...removed])
      setSyncError("Couldn't clear completed todos — check your connection.")
    }
  }, [repository, todos])

  return { todos, loaded, syncError, addTodo, toggleTodo, deleteTodo, clearCompleted }
}
