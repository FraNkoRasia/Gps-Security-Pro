export type TipoDispositivo = 'android' | 'ios' | 'escritorio'

export interface EstadoInstalacion {
  dispositivo: TipoDispositivo
  estaInstalada: boolean
  puedeInstalarDirecto: boolean
  esSafari: boolean
}

/**
 * Detecta el tipo de dispositivo y el estado de la PWA
 */
export function obtenerEstadoDispositivo(promptInstalacion: any = null): EstadoInstalacion {
  if (typeof window === 'undefined') {
    return {
      dispositivo: 'escritorio',
      estaInstalada: false,
      puedeInstalarDirecto: false,
      esSafari: false
    }
  }

  const userAgent = window.navigator.userAgent.toLowerCase()

  // Detección iOS (iPhone, iPad, iPod)
  const esIos = /iphone|ipad|ipod/.test(userAgent) || 
    (window.navigator.platform === 'MacIntel' && window.navigator.maxTouchPoints > 1)

  // Detección Android
  const esAndroid = /android/.test(userAgent)

  // Detección Safari en iOS
  const esSafari = esIos && /webkit/.test(userAgent) && !/crios|fxios|opios|mercury/.test(userAgent)

  // Detección de PWA ya instalada
  const estaInstalada = 
    window.matchMedia('(display-mode: standalone)').matches ||
    (window.navigator as unknown as { standalone?: boolean }).standalone === true ||
    document.referrer.includes('android-app://')

  let dispositivo: TipoDispositivo = 'escritorio'
  if (esIos) {
    dispositivo = 'ios'
  } else if (esAndroid) {
    dispositivo = 'android'
  }

  return {
    dispositivo,
    estaInstalada,
    puedeInstalarDirecto: Boolean(promptInstalacion),
    esSafari
  }
}
