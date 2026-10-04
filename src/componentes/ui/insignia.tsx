import React from 'react'
import { cn } from '@/utilidades/cn'

export interface PropiedadesInsignia extends React.HTMLAttributes<HTMLSpanElement> {
  variante?: 'azul' | 'dorado' | 'verde' | 'rojo' | 'gris' | 'morado'
  tamano?: 'chico' | 'medio'
}

export const Insignia: React.FC<PropiedadesInsignia> = ({
  className,
  variante = 'azul',
  tamano = 'chico',
  children,
  ...props
}) => {
  const variantes = {
    azul: 'bg-blue-950/70 border-blue-800 text-blue-300',
    dorado: 'bg-amber-950/70 border-amber-800 text-amber-300',
    verde: 'bg-emerald-950/70 border-emerald-800 text-emerald-300',
    rojo: 'bg-red-950/70 border-red-800 text-red-300',
    gris: 'bg-slate-800 border-slate-700 text-slate-300',
    morado: 'bg-purple-950/70 border-purple-800 text-purple-300'
  }

  const tamanos = {
    chico: 'px-2.5 py-0.5 text-xs font-semibold',
    medio: 'px-3 py-1 text-sm font-semibold'
  }

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full border shadow-sm select-none',
        variantes[variante],
        tamanos[tamano],
        className
      )}
      {...props}
    >
      {children}
    </span>
  )
}
