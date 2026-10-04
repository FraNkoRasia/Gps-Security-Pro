import React from 'react'
import { cn } from '@/utilidades/cn'

export interface PropiedadesEntrada extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: string
  iconoIzquierda?: React.ReactNode
  iconoDerecha?: React.ReactNode
}

export const Entrada = React.forwardRef<HTMLInputElement, PropiedadesEntrada>(
  ({ className, type = 'text', error, iconoIzquierda, iconoDerecha, disabled, ...props }, ref) => {
    return (
      <div className="w-full">
        <div className="relative flex items-center">
          {iconoIzquierda && (
            <div className="absolute left-3.5 text-slate-400 pointer-events-none flex items-center">
              {iconoIzquierda}
            </div>
          )}
          <input
            type={type}
            ref={ref}
            disabled={disabled}
            className={cn(
              'w-full min-h-[46px] rounded-xl bg-slate-900/90 border border-slate-700/80 px-4 py-2.5 text-sm text-slate-100 placeholder:text-slate-500 shadow-inner focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-150 disabled:opacity-50 disabled:bg-slate-950',
              iconoIzquierda && 'pl-11',
              iconoDerecha && 'pr-11',
              error && 'border-red-500/80 focus:ring-red-500 focus:border-red-500 bg-red-950/10',
              className
            )}
            {...props}
          />
          {iconoDerecha && (
            <div className="absolute right-3.5 flex items-center">
              {iconoDerecha}
            </div>
          )}
        </div>
        {error && (
          <p className="mt-1.5 text-xs text-red-400 font-medium flex items-center gap-1 animate-fadeIn">
            <svg className="w-3.5 h-3.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            <span>{error}</span>
          </p>
        )}
      </div>
    )
  }
)

Entrada.displayName = 'Entrada'
