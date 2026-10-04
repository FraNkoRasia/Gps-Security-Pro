import { LogOut } from 'lucide-react'
import { SelectorIdioma } from '@/componentes/ui/selector-idioma'
import { SelectorTema } from '@/componentes/ui/selector-tema'
import { Insignia } from '@/componentes/ui/insignia'
import { useAutenticacion } from '@/contextos/contexto-autenticacion'
import { useTraduccion } from '@/i18n'

interface PropiedadesEncabezado {
  alIrAInicio?: () => void
}

export const Encabezado: React.FC<PropiedadesEncabezado> = ({ alIrAInicio }) => {
  const { usuario, estaAutenticado, cerrarSesion } = useAutenticacion()
  const { t } = useTraduccion()

  const obtenerEtiquetaRol = (rol: string) => {
    switch (rol) {
      case 'super_administrador':
        return { texto: t.roles.superAdmin, variante: 'dorado' as const }
      case 'administrador':
        return { texto: t.roles.admin, variante: 'azul' as const }
      case 'supervisor':
        return { texto: t.roles.supervisor, variante: 'morado' as const }
      case 'vigilador':
      default:
        return { texto: t.roles.vigilador, variante: 'verde' as const }
    }
  }

  return (
    <header className="w-full border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-md sticky top-0 z-40 px-3 sm:px-6 py-3 select-none">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
        {/* Identidad de la Marca con Escudo Oficial */}
        <button
          type="button"
          onClick={alIrAInicio}
          className="flex items-center gap-2.5 text-left group cursor-pointer"
        >
          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-slate-900 border border-slate-700/60 p-0.5 flex items-center justify-center shadow-md group-hover:border-blue-500 transition-all">
            <img src="/Escudo.png" alt="GSP Escudo" className="w-full h-full object-contain" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-base sm:text-lg font-black tracking-tight text-white font-['Outfit'] group-hover:text-blue-400 transition-colors">
                GSP Security Pro
              </span>
            </div>
            <p className="text-[10px] sm:text-xs text-slate-400 font-medium tracking-wide hidden xs:block">
              {t.comun.lemaApp}
            </p>
          </div>
        </button>

        {/* Acciones del encabezado: Usuario, Idioma, Tema */}
        <div className="flex items-center gap-2 sm:gap-3">
          {estaAutenticado && usuario && (
            <div className="flex items-center gap-2 sm:gap-3 pr-1 sm:pr-2 border-r border-slate-800">
              <div className="hidden md:flex flex-col items-end">
                <span className="text-xs font-bold text-slate-200">
                  {usuario.nombre} {usuario.apellido}
                </span>
                <span className="text-[10px] text-slate-400">
                  {usuario.empresa_nombre || usuario.email}
                </span>
              </div>
              <Insignia
                variante={obtenerEtiquetaRol(usuario.rol).variante}
                className="hidden sm:inline-flex"
              >
                {obtenerEtiquetaRol(usuario.rol).texto}
              </Insignia>
              <button
                type="button"
                onClick={() => cerrarSesion()}
                title={t.navegacion.cerrarSesion}
                className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-red-400 hover:border-red-900/60 transition-colors cursor-pointer"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          )}

          <SelectorIdioma />
          <SelectorTema />
        </div>
      </div>
    </header>
  )
}
