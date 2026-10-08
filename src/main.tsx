import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import './themes/themes.css'
import './themes/effects.css'
import App from './App.tsx'
import { initAppearance } from './features/theme/appearance'

initAppearance()

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
