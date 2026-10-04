import React from 'react'
import { Globe } from 'lucide-react'
import { useTraduccion } from '@/i18n'
import { cn } from '@/utilidades/cn'

export const SelectorIdioma: React.FC<{ className?: string }> = ({ className }) => {
  const { idioma, cambiarIdioma } = useTraduccion()

  return (
    <div
      className={cn(
        'inline-flex items-center gap-1 bg-slate-900/90 border border-slate-700/80 rounded-xl p-1 text-xs select-none shadow-sm',
        className
      )}
    >
      <div className="flex items-center px-1.5 text-slate-400">
        <Globe className="w-3.5 h-3.5" />
      </div>
      <button
        type="button"
        onClick={() => cambiarIdioma('es')}
        className={cn(
          'px-2.5 py-1 rounded-lg font-semibold transition-all cursor-pointer min-h-[30px] flex items-center',
          idioma === 'es'
            ? 'bg-blue-600 text-white shadow-xs'
            : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
        )}
        aria-label="Seleccionar idioma español"
      >
        ES
      </button>
      <button
        type="button"
        onClick={() => cambiarIdioma('en')}
        className={cn(
          'px-2.5 py-1 rounded-lg font-semibold transition-all cursor-pointer min-h-[30px] flex items-center',
          idioma === 'en'
            ? 'bg-blue-600 text-white shadow-xs'
            : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
        )}
        aria-label="Select English language"
      >
        EN
      </button>
    </div>
  )
}
