import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { registerSW } from 'virtual:pwa-register'
import './index.css'
import App from './App.tsx'

// Actualiza el Service Worker y fuerza a la aplicación a usar el bundle más reciente.
// Esto evita que una PWA instalada quede ejecutando una versión vieja del frontend.
registerSW({
  immediate: true,
  onRegisteredSW(_swUrl, registration) {
    if (registration) {
      setInterval(() => {
        void registration.update()
      }, 60 * 60 * 1000)
    }
  },
  onOfflineReady() {
    console.info('GSP Security Pro: PWA lista para uso offline.')
  },
  onNeedRefresh() {
    window.location.reload()
  },
})

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
