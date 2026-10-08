import { useState } from 'react'
import { useAuthContext } from './features/auth/AuthContext'
import { useAppearance } from './features/theme/appearance'
import { Mascot } from './calendar/Mascot'
import { Calendar } from './calendar/Calendar'
import { TodoList } from './todos/TodoList'
import { SettingsPage } from './settings/SettingsPage'
import './AppShell.css'

type Tab = 'calendar' | 'todos' | 'settings'

const TABS: { id: Tab; label: string }[] = [
  { id: 'calendar', label: 'Calendar' },
  { id: 'todos', label: 'Todos' },
  { id: 'settings', label: 'Settings' },
]

export function AppShell() {
  const { signOut } = useAuthContext()
  const { effects } = useAppearance()
  const [tab, setTab] = useState<Tab>('calendar')

  return (
    <>
      <nav className="app-tabs" aria-label="Sections">
        <div className="app-tabs-left">
          {/* On "All out" the mascot keeps you company on every screen except Calendar, which has its own. */}
          {effects === 'loud' && tab !== 'calendar' && (
            <span className="app-tabs-mascot">
              <Mascot size={34} />
            </span>
          )}
          <div className="app-tabs-list">
            {TABS.map((t) => (
              <button
                key={t.id}
                type="button"
                className={t.id === tab ? 'active' : ''}
                aria-current={t.id === tab ? 'page' : undefined}
                onClick={() => setTab(t.id)}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>
        <button type="button" className="app-sign-out" onClick={signOut}>
          Sign out
        </button>
      </nav>
      <div className="app-pane" hidden={tab !== 'calendar'}>
        <Calendar />
      </div>
      <div className="app-pane" hidden={tab !== 'todos'}>
        <TodoList />
      </div>
      <div className="app-pane" hidden={tab !== 'settings'}>
        <SettingsPage />
      </div>
    </>
  )
}
