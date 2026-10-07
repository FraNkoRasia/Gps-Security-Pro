import React, { useState } from 'react'
import { LogOut, Menu, X, Globe, Sun, Moon, UserRound } from 'lucide-react'
import { SelectorIdioma } from '@/componentes/ui/selector-idioma'
import { SelectorTema } from '@/componentes/ui/selector-tema'
import { Insignia } from '@/componentes/ui/insignia'
import { Boton } from '@/componentes/ui/boton'
import { useAutenticacion } from '@/contextos/contexto-autenticacion'
import { useTema } from '@/contextos/contexto-tema'
import { useTraduccion } from '@/i18n'

interface PropiedadesEncabezado {
  alIrAInicio?: () => void
  alAbrirPerfil?: () => void
}

export const Encabezado: React.FC<PropiedadesEncabezado> = ({ alIrAInicio, alAbrirPerfil }) => {
  const { usuario, estaAutenticado, cerrarSesion } = useAutenticacion()
  const { t, idioma, cambiarIdioma } = useTraduccion()
  const { temaActual, cambiarTema } = useTema()

  const [menuMovilAbierto, setMenuMovilAbierto] = useState(false)

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
    <>
      <header className="w-full border-b border-slate-200 dark:border-slate-800/80 bg-white/90 dark:bg-[#070B12]/90 backdrop-blur-md sticky top-0 z-40 px-3 sm:px-6 py-3 select-none transition-colors">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
          {/* Identidad de la Marca con Escudo Oficial */}
          <button
            type="button"
            onClick={alIrAInicio}
            className="flex items-center gap-2.5 text-left group cursor-pointer"
          >
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-300 dark:border-slate-700/60 p-0.5 flex items-center justify-center shadow-xs group-hover:border-blue-500 transition-all">
              <img src="/Escudo.png" alt="GSP Escudo" className="w-full h-full object-contain" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-base sm:text-lg font-black tracking-tight text-slate-900 dark:text-white font-['Outfit'] group-hover:text-blue-500 dark:group-hover:text-blue-400 transition-colors">
                  GSP Security Pro
                </span>
              </div>
              <p className="text-[10px] sm:text-xs text-slate-500 dark:text-slate-400 font-medium tracking-wide hidden xs:block">
                {t.comun.lemaApp}
              </p>
            </div>
          </button>

          {/* Versión Escritorio (md en adelante): Iconos completos */}
          <div className="hidden md:flex items-center gap-3">
            {estaAutenticado && usuario && (
              <div className="flex items-center gap-3 pr-2 border-r border-slate-200 dark:border-slate-800">
                <div className="flex flex-col items-end">
                  <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                    {usuario.nombre} {usuario.apellido}
                  </span>
                  <span className="text-[10px] text-slate-500 dark:text-slate-400">
                    {usuario.empresa_nombre || usuario.email}
                  </span>
                </div>
                <Insignia variante={obtenerEtiquetaRol(usuario.rol).variante}>
                  {obtenerEtiquetaRol(usuario.rol).texto}
                </Insignia>
                {alAbrirPerfil && (
                  <button
                    type="button"
                    onClick={alAbrirPerfil}
                    title="Perfil"
                    className="px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs font-bold text-slate-700 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 hover:border-blue-500 transition-colors cursor-pointer"
                  >
                    Perfil
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => cerrarSesion()}
                  title={t.navegacion.cerrarSesion}
                  className="p-2 rounded-xl bg-transparent dark:bg-transparent border border-red-500/20 dark:border-red-400/20 text-red-500/80 dark:text-red-400/80 hover:bg-red-500/10 dark:hover:bg-red-500/10 hover:text-red-500 dark:hover:text-red-300 hover:border-red-500/30 dark:hover:border-red-400/30 transition-colors cursor-pointer"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            )}

            <SelectorIdioma />
            <SelectorTema />
          </div>

          {/* Versión Móvil: Botón Menú Hamburguesa limpio sin saturación de iconos */}
          <div className="flex md:hidden items-center">
            <button
              type="button"
              onClick={() => setMenuMovilAbierto(true)}
              className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-300 dark:border-slate-800 text-slate-800 dark:text-slate-200 hover:border-blue-500 transition-all cursor-pointer shadow-xs"
              aria-label="Abrir menú"
            >
              <Menu className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </button>
          </div>
        </div>
      </header>

      {/* Drawer / Menú Desplegable Lateral para Móviles */}
      {menuMovilAbierto && (
        <div className="fixed inset-0 z-50 md:hidden flex justify-end animate-fadeIn">
          {/* Backdrop oscuro */}
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
            onClick={() => setMenuMovilAbierto(false)}
            aria-hidden="true"
          />

          {/* Panel Lateral Drawer */}
          <div className="relative w-4/5 max-w-xs bg-white dark:bg-[#0C121E] border-l border-slate-200 dark:border-slate-800 h-full p-5 shadow-2xl flex flex-col justify-between z-10 overflow-y-auto">
            <div className="space-y-5">
              {/* Encabezado del menú móvil */}
              <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-900 border border-slate-300 dark:border-slate-700/60 p-0.5">
                    <img src="/Escudo.png" alt="GSP Logo" className="w-full h-full object-contain" />
                  </div>
                  <span className="font-black text-slate-900 dark:text-white font-['Outfit'] text-base">
                    GSP Security
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setMenuMovilAbierto(false)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-slate-800 dark:hover:text-white"
                  aria-label="Cerrar menú"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Información del usuario si está autenticado */}
              {estaAutenticado && usuario ? (
                <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950/70 border border-slate-200 dark:border-slate-800 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900 dark:text-white text-sm">
                      {usuario.nombre} {usuario.apellido}
                    </span>
                    <Insignia variante={obtenerEtiquetaRol(usuario.rol).variante}>
                      {obtenerEtiquetaRol(usuario.rol).texto}
                    </Insignia>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                    {usuario.email}
                  </p>
                  <p className="text-[11px] font-semibold text-blue-600 dark:text-blue-400">
                    {usuario.empresa_nombre || 'GSP Plataforma Global'}
                  </p>
                </div>
              ) : (
                <div className="p-3 rounded-xl bg-blue-50/50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900/40 text-xs text-blue-700 dark:text-blue-300">
                  Gestión de Seguridad Profesional
                </div>
              )}

              {/* Preferencias de Idioma y Tema en Menú Móvil */}
              <div className="space-y-3 pt-2">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block">
                  Preferencias
                </span>

                {/* Selector de Tema Móvil */}
                <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                  <span className="text-xs font-medium text-slate-700 dark:text-slate-300 flex items-center gap-2">
                    {temaActual === 'dark' ? <Moon className="w-4 h-4 text-blue-400" /> : <Sun className="w-4 h-4 text-amber-500" />}
                    <span>Modo visual:</span>
                  </span>
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => cambiarTema('light')}
                      className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition-all ${
                        temaActual === 'light'
                          ? 'bg-blue-600 text-white'
                          : 'text-slate-500 hover:text-slate-900'
                      }`}
                    >
                      Claro
                    </button>
                    <button
                      type="button"
                      onClick={() => cambiarTema('dark')}
                      className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition-all ${
                        temaActual === 'dark'
                          ? 'bg-blue-600 text-white'
                          : 'text-slate-500 dark:text-slate-400 hover:text-white'
                      }`}
                    >
                      Oscuro
                    </button>
                  </div>
                </div>

                {/* Selector de Idioma Móvil */}
                <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                  <span className="text-xs font-medium text-slate-700 dark:text-slate-300 flex items-center gap-2">
                    <Globe className="w-4 h-4 text-blue-500" />
                    <span>Idioma:</span>
                  </span>
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => cambiarIdioma('es')}
                      className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition-all ${
                        idioma === 'es'
                          ? 'bg-blue-600 text-white'
                          : 'text-slate-500 dark:text-slate-400'
                      }`}
                    >
                      Español
                    </button>
                    <button
                      type="button"
                      onClick={() => cambiarIdioma('en')}
                      className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition-all ${
                        idioma === 'en'
                          ? 'bg-blue-600 text-white'
                          : 'text-slate-500 dark:text-slate-400'
                      }`}
                    >
                      English
                    </button>
                  </div>
                </div>
              </div>

              {/* Acciones de Seguridad en Menú Móvil */}
              {estaAutenticado && alAbrirSeguridad && (
                <div className="pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setMenuMovilAbierto(false)
                      alAbrirSeguridad()
                    }}
                    className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs font-semibold text-slate-800 dark:text-slate-200 hover:border-blue-500 flex items-center gap-2 transition-all cursor-pointer"
                  >
                    <Lock className="w-4 h-4 text-blue-500" />
                    <span>Configuración de Seguridad</span>
                  </button>
                </div>
              )}
            </div>

            {/* Pie del menú móvil con Cierre de Sesión */}
            {estaAutenticado && (
              <div className="pt-4 border-t border-slate-200 dark:border-slate-800">
                <Boton
                  variante="fantasma"
                  tamano="medio"
                  className="w-full bg-red-500/50 dark:bg-red-500/50 border border-red-500/30 dark:border-red-400/30 text-white hover:bg-red-500/60 dark:hover:bg-red-500/60 hover:border-red-500/50 transition-colors"
                  onClick={() => {
                    setMenuMovilAbierto(false)
                    cerrarSesion()
                  }}
                  icono={<LogOut className="w-4 h-4" />}
                >
                  Cerrar Sesión
                </Boton>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  )
}
