import React, { useState, useEffect } from 'react'
import { Download, CheckCircle, Smartphone } from 'lucide-react'
import { Boton } from '@/componentes/ui/boton'
import { ModalInstalacion } from './modal-instalacion'
import { obtenerEstadoDispositivo, type EstadoInstalacion } from '@/utilidades/deteccion-plataforma'
import { useTraduccion } from '@/i18n'

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>
}

export const InstalacionPwa: React.FC = () => {
  const { t } = useTraduccion()
  const [modalAbierto, setModalAbierto] = useState(false)
  const [promptEvento, setPromptEvento] = useState<BeforeInstallPromptEvent | null>(null)
  const [estadoDispositivo, setEstadoDispositivo] = useState<EstadoInstalacion>(() =>
    obtenerEstadoDispositivo(null)
  )

  useEffect(() => {
    // Escuchar el evento oficial PWA beforeinstallprompt
    const manejadorPrompt = (e: Event) => {
      e.preventDefault()
      const eventoPwa = e as BeforeInstallPromptEvent
      setPromptEvento(eventoPwa)
      setEstadoDispositivo(obtenerEstadoDispositivo(eventoPwa))
    }

    // Escuchar si la app fue instalada exitosamente
    const manejadorAppInstalada = () => {
      setPromptEvento(null)
      setEstadoDispositivo((prev) => ({ ...prev, estaInstalada: true }))
      setModalAbierto(false)
    }

    window.addEventListener('beforeinstallprompt', manejadorPrompt)
    window.addEventListener('appinstalled', manejadorAppInstalada)

    return () => {
      window.removeEventListener('beforeinstallprompt', manejadorPrompt)
      window.removeEventListener('appinstalled', manejadorAppInstalada)
    }
  }, [])

  // Si ya está instalada, la interfaz no debe seguir mostrando innecesariamente el botón
  if (estadoDispositivo.estaInstalada) {
    return (
      <div className="w-full mt-6 p-3.5 rounded-xl bg-slate-900/60 border border-emerald-900/40 text-center flex items-center justify-center gap-2 text-xs text-emerald-400">
        <CheckCircle className="w-4 h-4 shrink-0" />
        <span>{t.pwa.yaInstalada}</span>
      </div>
    )
  }

  const manejarClickInstalar = () => {
    setModalAbierto(true)
  }

  const manejarConfirmarInstalacion = async () => {
    setModalAbierto(false)

    if (promptEvento) {
      try {
        await promptEvento.prompt()
        const eleccion = await promptEvento.userChoice
        if (eleccion.outcome === 'accepted') {
          setPromptEvento(null)
          setEstadoDispositivo((prev) => ({ ...prev, estaInstalada: true }))
        }
      } catch (err) {
        console.error('Error al invocar instalación PWA:', err)
      }
    }
  }

  return (
    <>
      <div className="w-full mt-6 pt-6 border-t border-slate-800/80 text-center">
        <div className="flex items-center justify-center gap-2 text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
          <Smartphone className="w-4 h-4 text-blue-400" />
          <span>{t.pwa.tituloInstalar}</span>
        </div>
        <p className="text-xs text-slate-400 max-w-sm mx-auto mb-3.5 px-2">
          {t.pwa.subtituloInstalar}
        </p>

        <Boton
          type="button"
          variante="secundario"
          tamano="medio"
          onClick={manejarClickInstalar}
          className="w-full sm:w-auto px-6 border-slate-700 bg-slate-900/90 hover:bg-slate-800 text-blue-300 hover:text-white"
          icono={<Download className="w-4 h-4 text-blue-400" />}
        >
          {t.pwa.botonInstalar}
        </Boton>
      </div>

      <ModalInstalacion
        abierto={modalAbierto}
        alCerrar={() => setModalAbierto(false)}
        alConfirmar={manejarConfirmarInstalacion}
        estadoDispositivo={estadoDispositivo}
      />
    </>
  )
}
