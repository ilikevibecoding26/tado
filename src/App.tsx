import { AuthProvider, useAuthContext } from './features/auth/AuthContext'
import { SignIn } from './features/auth/SignIn'
import { EventsProvider } from './features/events/EventsContext'
import { Calendar } from './calendar/Calendar'
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
      <Calendar />
    </EventsProvider>
  )
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  )
}

export default App
