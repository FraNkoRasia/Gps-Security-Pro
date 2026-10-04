import React from 'react'
import { Shield } from 'lucide-react'
import { useTraduccion } from '@/i18n'

interface PropiedadesPieDePagina {
  alNavegar?: (vista: 'terminos' | 'ayuda' | 'privacidad' | 'acercaDe') => void
}

export const PieDePagina: React.FC<PropiedadesPieDePagina> = ({ alNavegar }) => {
  const { t } = useTraduccion()
  const anioActual = new Date().getFullYear()

  const navegar = (vista: 'terminos' | 'ayuda' | 'privacidad' | 'acercaDe') => {
    if (alNavegar) {
      alNavegar(vista)
    } else {
      window.location.hash = vista
    }
  }

  return (
    <footer className="w-full mt-auto border-t border-slate-800/80 bg-slate-950/70 py-6 px-4 text-xs text-slate-400 select-none">
      <div className="max-w-5xl mx-auto flex flex-col items-center justify-between gap-4 sm:flex-row text-center sm:text-left">
        {/* Identidad y Desarrollador (Sección 16) */}
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-md bg-blue-950 border border-blue-800 text-blue-400 flex items-center justify-center shrink-0">
            <Shield className="w-3.5 h-3.5" />
          </div>
          <div>
            <p className="font-semibold text-slate-200">
              GSP Security Pro <span className="font-normal text-slate-500">— {t.comun.lemaApp}</span>
            </p>
            <p className="text-[11px] text-slate-400">
              Desarrollado por <span className="text-amber-400 font-medium">FraNko Rasia</span>
            </p>
          </div>
        </div>

        {/* Enlaces de pie de página: Términos, Ayuda, Privacidad, Acerca de */}
        <nav className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-xs">
          <button
            type="button"
            onClick={() => navegar('terminos')}
            className="hover:text-white transition-colors cursor-pointer"
          >
            {t.pie.terminos}
          </button>
          <span className="text-slate-700">•</span>
          <button
            type="button"
            onClick={() => navegar('ayuda')}
            className="hover:text-white transition-colors cursor-pointer"
          >
            {t.pie.ayuda}
          </button>
          <span className="text-slate-700">•</span>
          <button
            type="button"
            onClick={() => navegar('privacidad')}
            className="hover:text-white transition-colors cursor-pointer"
          >
            {t.pie.privacidad}
          </button>
          <span className="text-slate-700">•</span>
          <button
            type="button"
            onClick={() => navegar('acercaDe')}
            className="hover:text-white transition-colors cursor-pointer font-medium text-blue-400"
          >
            {t.pie.acercaDe}
          </button>
        </nav>

        {/* Copyright con año dinámico */}
        <div className="text-[11px] text-slate-400 sm:text-right">
          © {anioActual} GSP Security Pro.
        </div>
      </div>
    </footer>
  )
}
