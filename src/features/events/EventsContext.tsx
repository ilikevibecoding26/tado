import { createContext, useContext } from 'react'
import type { ReactNode } from 'react'
import { useEvents } from './useEvents'

type EventsContextValue = ReturnType<typeof useEvents>

const EventsContext = createContext<EventsContextValue | null>(null)

export function EventsProvider({ children }: { children: ReactNode }) {
  const value = useEvents()
  return <EventsContext.Provider value={value}>{children}</EventsContext.Provider>
}

export function useEventsContext(): EventsContextValue {
  const context = useContext(EventsContext)
  if (!context) {
    throw new Error('useEventsContext must be used within an EventsProvider')
  }
  return context
}
