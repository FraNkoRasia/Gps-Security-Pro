import React from 'react'
import { Moon, Sun } from 'lucide-react'
import { useTema } from '@/contextos/contexto-tema'
import { cn } from '@/utilidades/cn'

export const SelectorTema: React.FC<{ className?: string }> = ({ className }) => {
  const { temaActual, cambiarTema } = useTema()

  const alternar = () => {
    cambiarTema(temaActual === 'dark' ? 'light' : 'dark')
  }

  return (
    <button
      type="button"
      onClick={alternar}
      className={cn(
        'p-2 rounded-xl bg-slate-100 border border-slate-300 text-slate-600 hover:text-slate-900 hover:border-slate-400 dark:bg-slate-900/90 dark:border-slate-700/80 dark:text-slate-300 dark:hover:text-white dark:hover:border-slate-500 transition-all cursor-pointer min-h-[40px] min-w-[40px] flex items-center justify-center shadow-sm',
        className
      )}
      aria-label={temaActual === 'dark' ? 'Activar tema claro' : 'Activar tema oscuro'}
      title={temaActual === 'dark' ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
    >
      {temaActual === 'dark' ? (
        <Sun className="w-4 h-4 text-amber-400" />
      ) : (
        <Moon className="w-4 h-4 text-blue-400" />
      )}
    </button>
  )
}
