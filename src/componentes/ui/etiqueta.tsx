import React from 'react'
import { cn } from '@/utilidades/cn'

export interface PropiedadesEtiqueta extends React.LabelHTMLAttributes<HTMLLabelElement> {
  requerido?: boolean
}

export const Etiqueta = React.forwardRef<HTMLLabelElement, PropiedadesEtiqueta>(
  ({ className, children, requerido, ...props }, ref) => {
    return (
      <label
        ref={ref}
        className={cn(
          'block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5 select-none',
          className
        )}
        {...props}
      >
        {children}
        {requerido && <span className="text-red-400 ml-1">*</span>}
      </label>
    )
  }
)

Etiqueta.displayName = 'Etiqueta'
