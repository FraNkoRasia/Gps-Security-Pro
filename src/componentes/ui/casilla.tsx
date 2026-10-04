import React from 'react'
import { Check } from 'lucide-react'
import { cn } from '@/utilidades/cn'

export interface PropiedadesCasilla {
  id: string
  marcado: boolean
  alCambiar: (marcado: boolean) => void
  etiqueta?: React.ReactNode
  descripcion?: string
  deshabilitado?: boolean
  className?: string
}

export const Casilla: React.FC<PropiedadesCasilla> = ({
  id,
  marcado,
  alCambiar,
  etiqueta,
  descripcion,
  deshabilitado = false,
  className
}) => {
  return (
    <div className={cn('flex items-start gap-3 select-none', className)}>
      <div className="relative flex items-center pt-0.5">
        <input
          id={id}
          type="checkbox"
          checked={marcado}
          disabled={deshabilitado}
          onChange={(e) => alCambiar(e.target.checked)}
          className="sr-only"
        />
        <div
          onClick={() => !deshabilitado && alCambiar(!marcado)}
          className={cn(
            'w-5 h-5 rounded-md border flex items-center justify-center transition-all cursor-pointer shadow-xs',
            marcado
              ? 'bg-blue-600 border-blue-500 text-white'
              : 'bg-white dark:bg-slate-900 border-slate-300 dark:border-slate-700 hover:border-slate-400 dark:hover:border-slate-500 text-transparent',
            deshabilitado && 'opacity-50 cursor-not-allowed'
          )}
        >
          <Check className={cn('w-3.5 h-3.5 stroke-[3]', marcado ? 'opacity-100' : 'opacity-0')} />
        </div>
      </div>
      {(etiqueta || descripcion) && (
        <label
          htmlFor={id}
          className={cn(
            'cursor-pointer text-sm font-medium text-slate-800 dark:text-slate-200 leading-snug',
            deshabilitado && 'cursor-not-allowed opacity-50'
          )}
        >
          {etiqueta}
          {descripcion && (
            <p className="text-xs text-slate-500 dark:text-slate-400 font-normal mt-0.5">{descripcion}</p>
          )}
        </label>
      )}
    </div>
  )
}
