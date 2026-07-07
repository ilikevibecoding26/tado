import { EventsProvider } from './features/events/EventsContext'
import { Calendar } from './calendar/Calendar'
import './App.css'

function App() {
  return (
    <EventsProvider>
      <Calendar />
    </EventsProvider>
  )
}

export default App
