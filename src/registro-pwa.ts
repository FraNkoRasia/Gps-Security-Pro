import { registerSW } from 'virtual:pwa-register'

export const registrarPwa = () => {
  return registerSW({
    immediate: true,
    onRegisteredSW(_swUrl: string, registration?: ServiceWorkerRegistration) {
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
}
