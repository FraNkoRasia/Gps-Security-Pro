import React, { useEffect } from 'react'
import { X } from 'lucide-react'
import { cn } from '@/utilidades/cn'

export interface PropiedadesDialogo {
  abierto: boolean
  alCerrar: () => void
  titulo?: string
  subtitulo?: string
  icono?: React.ReactNode
  tamano?: 'chico' | 'medio' | 'grande'
  children: React.ReactNode
}

export const Dialogo: React.FC<PropiedadesDialogo> = ({
  abierto,
  alCerrar,
  titulo,
  subtitulo,
  icono,
  tamano = 'medio',
  children
}) => {
  useEffect(() => {
    const alPresionarEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && abierto) {
        alCerrar()
      }
    }

    if (abierto) {
      document.body.style.overflow = 'hidden'
      window.addEventListener('keydown', alPresionarEsc)
    } else {
      document.body.style.overflow = 'unset'
    }

    return () => {
      document.body.style.overflow = 'unset'
      window.removeEventListener('keydown', alPresionarEsc)
    }
  }, [abierto, alCerrar])

  if (!abierto) return null

  const maxAnchos = {
    chico: 'max-w-md',
    medio: 'max-w-lg',
    grande: 'max-w-2xl'
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 overflow-hidden animate-fadeIn">
      {/* Telón de fondo (Backdrop) */}
      <div
        className="fixed inset-0 bg-slate-950/70 dark:bg-black/80 backdrop-blur-sm transition-opacity"
        onClick={alCerrar}
        aria-hidden="true"
      />

      {/* Contenedor del Modal */}
      <div
        className={cn(
          'relative w-full rounded-2xl bg-white dark:bg-[#0C121E] border border-slate-200 dark:border-slate-800 shadow-2xl text-slate-900 dark:text-slate-100 z-10 overflow-hidden flex flex-col min-h-0 max-h-[calc(100dvh-1rem)] sm:max-h-[90dvh] my-auto',
          maxAnchos[tamano]
        )}
        role="dialog"
        aria-modal="true"
      >
        {/* Cabecera del diálogo */}
        {(titulo || subtitulo) && (
          <div className="flex items-start justify-between p-4 sm:p-6 border-b border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-950/50 shrink-0">
            <div className="flex items-center gap-3 pr-4 min-w-0">
              {icono && (
                <div className="p-2.5 rounded-xl bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800/40 text-blue-600 dark:text-blue-400 shrink-0">
                  {icono}
                </div>
              )}
              <div className="min-w-0">
                {titulo && (
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white font-['Outfit'] leading-snug">
                    {titulo}
                  </h3>
                )}
                {subtitulo && (
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 leading-relaxed">
                    {subtitulo}
                  </p>
                )}
              </div>
            </div>
            <button
              onClick={alCerrar}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/70 transition-colors cursor-pointer shrink-0"
              aria-label="Cerrar ventana"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        )}

        {/* Cuerpo scrolleable. El scroll queda dentro del modal. */}
        <div className="p-4 sm:p-6 overflow-y-auto min-h-0 flex-1 overscroll-contain">
          {children}
        </div>
      </div>
    </div>
  )
}
