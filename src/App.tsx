import { AuthProvider, useAuthContext } from './features/auth/AuthContext'
import { SignIn } from './features/auth/SignIn'
import { EventsProvider } from './features/events/EventsContext'
import { TodosProvider } from './features/todos/TodosContext'
import { AppShell } from './AppShell'
import { Scenery } from './themes/Scenery'
import { FoundToast } from './themes/FoundToast'
import { PartyMode } from './themes/PartyMode'
import { MagicEffects } from './themes/MagicEffects'
import { SecretKeys } from './themes/SecretKeys'
import { DailyHello } from './themes/DailyHello'
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
      <PartyMode />
      <MagicEffects />
      <SecretKeys />
      <DailyHello />
    </AuthProvider>
  )
}

export default App
