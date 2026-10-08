import { AuthProvider, useAuthContext } from './features/auth/AuthContext'
import { SignIn } from './features/auth/SignIn'
import { EventsProvider } from './features/events/EventsContext'
import { TodosProvider } from './features/todos/TodosContext'
import { AppShell } from './AppShell'
import { Scenery } from './themes/Scenery'
import { FoundToast } from './themes/FoundToast'
import './App.css'

function AppContent() {
  const { user, loading } = useAuthContext()

  if (loading) {
    return <div className="app-loading">Loading...</div>
  }

  if (!user) {
    return <SignIn />
  }

  return (
    <EventsProvider userId={user.id}>
      <TodosProvider userId={user.id}>
        <AppShell />
      </TodosProvider>
    </EventsProvider>
  )
}

function App() {
  return (
    <AuthProvider>
      <Scenery />
      <AppContent />
      <FoundToast />
    </AuthProvider>
  )
}

export default App
