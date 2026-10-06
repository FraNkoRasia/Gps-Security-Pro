import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { registrarPwa } from './registro-pwa'
import './index.css'
import App from './App.tsx'

registrarPwa()

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
