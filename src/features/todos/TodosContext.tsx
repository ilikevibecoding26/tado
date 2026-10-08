import { createContext, useContext } from 'react'
import type { ReactNode } from 'react'
import { useTodos } from './useTodos'

type TodosContextValue = ReturnType<typeof useTodos>

const TodosContext = createContext<TodosContextValue | null>(null)

export function TodosProvider({ userId, children }: { userId: string; children: ReactNode }) {
  const value = useTodos(userId)
  return <TodosContext.Provider value={value}>{children}</TodosContext.Provider>
}

export function useTodosContext(): TodosContextValue {
  const context = useContext(TodosContext)
  if (!context) {
    throw new Error('useTodosContext must be used within a TodosProvider')
  }
  return context
}
