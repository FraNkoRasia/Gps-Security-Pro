import React from 'react'
import { cn } from '@/utilidades/cn'

export const Tarjeta = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        'rounded-2xl border border-slate-200 dark:border-slate-800/90 bg-white/95 dark:bg-[#0C121E]/95 text-slate-900 dark:text-slate-100 shadow-xl backdrop-blur-md transition-all',
        className
      )}
      {...props}
    />
  )
)
Tarjeta.displayName = 'Tarjeta'

export const TarjetaEncabezado = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn('flex flex-col space-y-1.5 p-5 sm:p-6 border-b border-slate-200 dark:border-slate-800/60', className)}
      {...props}
    />
  )
)
TarjetaEncabezado.displayName = 'TarjetaEncabezado'

export const TarjetaTitulo = React.forwardRef<HTMLHeadingElement, React.HTMLAttributes<HTMLHeadingElement>>(
  ({ className, ...props }, ref) => (
    <h3
      ref={ref}
      className={cn('text-lg sm:text-xl font-bold tracking-tight text-slate-900 dark:text-white font-["Outfit"]', className)}
      {...props}
    />
  )
)
TarjetaTitulo.displayName = 'TarjetaTitulo'

export const TarjetaDescripcion = React.forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLParagraphElement>>(
  ({ className, ...props }, ref) => (
    <p
      ref={ref}
      className={cn('text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed', className)}
      {...props}
    />
  )
)
TarjetaDescripcion.displayName = 'TarjetaDescripcion'

export const TarjetaContenido = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn('p-5 sm:p-6', className)} {...props} />
  )
)
TarjetaContenido.displayName = 'TarjetaContenido'

export const TarjetaPie = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn('flex items-center p-5 sm:p-6 pt-0 border-t border-slate-200 dark:border-slate-800/40 mt-2', className)}
      {...props}
    />
  )
)
TarjetaPie.displayName = 'TarjetaPie'
