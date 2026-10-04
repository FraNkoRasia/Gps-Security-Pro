import React from 'react'
import { cn } from '@/utilidades/cn'

export interface PropiedadesBoton extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variante?: 'primario' | 'secundario' | 'peligro' | 'fantasma' | 'borde' | 'dorado'
  tamano?: 'chico' | 'medio' | 'grande'
  cargando?: boolean
  icono?: React.ReactNode
}

export const Boton = React.forwardRef<HTMLButtonElement, PropiedadesBoton>(
  (
    {
      className,
      variante = 'primario',
      tamano = 'medio',
      cargando = false,
      icono,
      children,
      disabled,
      ...props
    },
    ref
  ) => {
    const variantes = {
      primario:
        'bg-blue-600 hover:bg-blue-500 text-white font-semibold shadow-md shadow-blue-900/30 active:scale-[0.98] border border-blue-500/30',
      secundario:
        'bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium border border-slate-700 active:scale-[0.98]',
      peligro:
        'bg-red-600 hover:bg-red-500 text-white font-semibold shadow-md shadow-red-950/40 active:scale-[0.98]',
      fantasma:
        'bg-transparent hover:bg-slate-800/60 text-slate-300 hover:text-white',
      borde:
        'bg-transparent border border-slate-700 hover:border-slate-500 text-slate-300 hover:text-white',
      dorado:
        'bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold shadow-md shadow-amber-950/30 active:scale-[0.98]'
    }

    const tamanos = {
      chico: 'h-9 px-3 text-xs rounded-lg gap-1.5 min-h-[36px]',
      medio: 'h-11 px-4 text-sm rounded-xl gap-2 min-h-[44px]',
      grande: 'h-13 px-6 text-base rounded-xl gap-2.5 min-h-[50px]'
    }

    return (
      <button
        ref={ref}
        disabled={disabled || cargando}
        className={cn(
          'inline-flex items-center justify-center transition-all duration-150 select-none cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none focus:outline-none focus:ring-2 focus:ring-blue-500/60 focus:ring-offset-2 focus:ring-offset-slate-900',
          variantes[variante],
          tamanos[tamano],
          className
        )}
        {...props}
      >
        {cargando ? (
          <svg
            className="animate-spin h-4 w-4 text-current"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
        ) : (
          icono
        )}
        <span>{children}</span>
      </button>
    )
  }
)

Boton.displayName = 'Boton'
