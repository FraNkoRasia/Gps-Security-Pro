import React from 'react'
import { AlertCircle, CheckCircle2, Info, AlertTriangle } from 'lucide-react'
import { cn } from '@/utilidades/cn'

export interface PropiedadesAlerta extends React.HTMLAttributes<HTMLDivElement> {
  tipo?: 'info' | 'exito' | 'advertencia' | 'error'
  titulo?: string
}

export const Alerta: React.FC<PropiedadesAlerta> = ({
  className,
  tipo = 'info',
  titulo,
  children,
  ...props
}) => {
  const estilos = {
    info: {
      contenedor: 'bg-blue-950/40 border-blue-800/60 text-blue-200',
      icono: <Info className="w-5 h-5 text-blue-400 shrink-0 mt-0.5" />
    },
    exito: {
      contenedor: 'bg-emerald-950/40 border-emerald-800/60 text-emerald-200',
      icono: <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
    },
    advertencia: {
      contenedor: 'bg-amber-950/40 border-amber-800/60 text-amber-200',
      icono: <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
    },
    error: {
      contenedor: 'bg-red-950/40 border-red-800/60 text-red-200',
      icono: <AlertCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
    }
  }

  const { contenedor, icono } = estilos[tipo]

  return (
    <div
      role="alert"
      className={cn(
        'flex items-start gap-3 p-4 rounded-xl border text-sm leading-relaxed backdrop-blur-sm',
        contenedor,
        className
      )}
      {...props}
    >
      {icono}
      <div className="flex-1">
        {titulo && <h5 className="font-semibold text-white mb-0.5">{titulo}</h5>}
        <div className="text-slate-300 text-xs sm:text-sm">{children}</div>
      </div>
    </div>
  )
}
