import React, { useMemo, useState } from 'react'
import {
  Bell,
  Building2,
  CalendarDays,
  ChevronDown,
  ClipboardList,
  FileText,
  Globe,
  Home,
  LogOut,
  Menu,
  Moon,
  Sun,
  UserRound,
  Users,
  X,
  ArrowRightLeft,
  BookOpen,
  ShieldCheck
} from 'lucide-react'
import { Insignia } from '@/componentes/ui/insignia'
import { Boton } from '@/componentes/ui/boton'
import { useAutenticacion } from '@/contextos/contexto-autenticacion'
import { useTema } from '@/contextos/contexto-tema'
import { useTraduccion } from '@/i18n'

interface PropiedadesEncabezado {
  alIrAInicio?: () => void
  alAbrirPerfil?: () => void
  alAbrirCambioContrasena?: () => void
}

type ElementoMenu = {
  id: string
  etiqueta: string
  icono: React.ReactNode
  seccion?: 'principal' | 'cuenta'
}

export const Encabezado: React.FC<PropiedadesEncabezado> = ({
  alIrAInicio,
  alAbrirPerfil,
  alAbrirCambioContrasena
}) => {
  const { usuario, estaAutenticado, cerrarSesion } = useAutenticacion()
  const { idioma, cambiarIdioma } = useTraduccion()
  const { temaActual, cambiarTema } = useTema()

  const [menuMovilAbierto, setMenuMovilAbierto] = useState(false)
  const [preferenciasAbiertas, setPreferenciasAbiertas] = useState(false)

  const obtenerEtiquetaRol = (rol: string) => {
    switch (rol) {
      case 'super_administrador':
        return { texto: 'Super Admin', variante: 'dorado' as const }
      case 'administrador':
        return { texto: 'Administrador', variante: 'azul' as const }
      case 'supervisor':
        return { texto: 'Supervisor', variante: 'morado' as const }
      default:
        return { texto: 'Vigilador', variante: 'verde' as const }
    }
  }

  const emitirNavegacion = (id: string) => {
    if (id === 'inicio') {
      alIrAInicio?.()
      return
    }

    window.dispatchEvent(
      new CustomEvent('gsp:navegar-panel', {
        detail: { pestana: id }
      })
    )
  }

  const elementosMenu = useMemo<ElementoMenu[]>(() => {
    if (!usuario) return []

    if (usuario.rol === 'super_administrador') {
      return [
        { id: 'inicio', etiqueta: 'Inicio', icono: <Home className="w-4 h-4" /> },
        { id: 'empresas', etiqueta: 'Empresas', icono: <Building2 className="w-4 h-4" /> },
        { id: 'objetivos', etiqueta: 'Objetivos', icono: <ClipboardList className="w-4 h-4" /> },
        { id: 'vigiladores', etiqueta: 'Vigiladores', icono: <Users className="w-4 h-4" /> }
      ]
    }

    if (usuario.rol === 'administrador') {
      return [
        { id: 'inicio', etiqueta: 'Inicio', icono: <Home className="w-4 h-4" /> },
        { id: 'objetivos', etiqueta: 'Objetivos', icono: <ClipboardList className="w-4 h-4" /> },
        { id: 'vigiladores', etiqueta: 'Vigiladores', icono: <Users className="w-4 h-4" /> },
        { id: 'novedades', etiqueta: 'Libro de Novedades', icono: <BookOpen className="w-4 h-4" /> },
        { id: 'cambios', etiqueta: 'Cambios y Reemplazos', icono: <ArrowRightLeft className="w-4 h-4" /> },
        { id: 'avisos', etiqueta: 'Avisos', icono: <Bell className="w-4 h-4" /> }
      ]
    }

    return [
      { id: 'inicio', etiqueta: 'Inicio', icono: <Home className="w-4 h-4" /> },
      { id: 'miTurno', etiqueta: 'Mi Turno', icono: <CalendarDays className="w-4 h-4" /> },
      { id: 'miMes', etiqueta: 'Mi Mes', icono: <CalendarDays className="w-4 h-4" /> },
      { id: 'novedades', etiqueta: 'Libro de Novedades', icono: <BookOpen className="w-4 h-4" /> },
      { id: 'cambios', etiqueta: 'Cambios de Turno', icono: <ArrowRightLeft className="w-4 h-4" /> },
      { id: 'avisos', etiqueta: 'Avisos', icono: <Bell className="w-4 h-4" /> }
    ]
  }, [usuario])

  const rol = usuario ? obtenerEtiquetaRol(usuario.rol) : null
  const iniciales = usuario
    ? `${usuario.nombre?.charAt(0) || ''}${usuario.apellido?.charAt(0) || ''}`.toUpperCase()
    : 'GS'

  const ejecutarAccionMenu = (id: string) => {
    setMenuMovilAbierto(false)

    if (id === 'perfil') {
      alAbrirPerfil?.()
      return
    }

    if (id === 'cambiarContrasena') {
      alAbrirCambioContrasena?.()
      return
    }

    emitirNavegacion(id)
  }

  const contenidoMenu = (movil = false) => (
    <div className={`flex h-full flex-col ${movil ? 'p-5' : 'p-5'}`}>
      <div className="flex items-center gap-3 pb-5">
        <div className="w-10 h-10 rounded-xl bg-slate-900 dark:bg-slate-950 border border-slate-700/70 p-1.5 flex items-center justify-center shadow-sm">
          <img src="/Escudo.png" alt="GSP Security Pro" className="w-full h-full object-contain" />
        </div>
        <div className="min-w-0">
          <p className="text-sm font-black tracking-tight text-slate-900 dark:text-white font-['Outfit'] truncate">
            GSP Security Pro
          </p>
          <p className="text-[10px] text-slate-500 dark:text-slate-500 tracking-wide">
            Gestión de Seguridad Profesional
          </p>
        </div>
        {movil && (
          <button
            type="button"
            onClick={() => setMenuMovilAbierto(false)}
            className="ml-auto p-2 rounded-xl text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800"
            aria-label="Cerrar menú"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {usuario && rol && (
        <div className="mb-5 p-3 rounded-2xl bg-slate-50 dark:bg-slate-950/70 border border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center font-black text-xs shrink-0">
              {iniciales}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-bold text-slate-900 dark:text-white truncate">
                {usuario.nombre} {usuario.apellido}
              </p>
              <div className="mt-1 flex items-center gap-2">
                <Insignia variante={rol.variante}>{rol.texto}</Insignia>
                <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-600 dark:text-emerald-400">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                  En línea
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="flex-1 min-h-0 overflow-y-auto pr-1">
        <p className="px-2 mb-2 text-[10px] font-black uppercase tracking-[0.16em] text-slate-400">
          Principal
        </p>
        <nav className="space-y-1">
          {elementosMenu.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => ejecutarAccionMenu(item.id)}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/80 transition-colors text-left"
            >
              <span className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 dark:text-slate-500">
                {item.icono}
              </span>
              <span className="truncate">{item.etiqueta}</span>
            </button>
          ))}
        </nav>

        <div className="my-5 border-t border-slate-200 dark:border-slate-800" />

        <p className="px-2 mb-2 text-[10px] font-black uppercase tracking-[0.16em] text-slate-400">
          Cuenta
        </p>
        <nav className="space-y-1">
          <button
            type="button"
            onClick={() => ejecutarAccionMenu('perfil')}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/80 transition-colors text-left"
          >
            <span className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 dark:text-slate-500">
              <UserRound className="w-4 h-4" />
            </span>
            <span>Perfil</span>
          </button>

          <button
            type="button"
            onClick={() => ejecutarAccionMenu('cambiarContrasena')}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/80 transition-colors text-left"
          >
            <span className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 dark:text-slate-500">
              <ShieldCheck className="w-4 h-4" />
            </span>
            <span>Cambiar contraseña</span>
          </button>
        </nav>

        <div className="my-5 border-t border-slate-200 dark:border-slate-800" />

        <button
          type="button"
          onClick={() => setPreferenciasAbiertas((v) => !v)}
          className="w-full flex items-center justify-between px-2 mb-2 text-[10px] font-black uppercase tracking-[0.16em] text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
        >
          <span>Preferencias</span>
          <ChevronDown className={`w-4 h-4 transition-transform ${preferenciasAbiertas ? 'rotate-180' : ''}`} />
        </button>

        {preferenciasAbiertas && (
          <div className="space-y-2">
            <div className="flex items-center justify-between gap-3 px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-2 text-xs font-semibold text-slate-600 dark:text-slate-300">
                {temaActual === 'dark' ? <Moon className="w-4 h-4 text-blue-400" /> : <Sun className="w-4 h-4 text-amber-500" />}
                Modo oscuro
              </div>
              <button
                type="button"
                onClick={() => cambiarTema(temaActual === 'dark' ? 'light' : 'dark')}
                className={`relative w-10 h-5 rounded-full transition-colors ${temaActual === 'dark' ? 'bg-blue-600' : 'bg-slate-300 dark:bg-slate-700'}`}
                aria-label="Cambiar modo visual"
              >
                <span className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform ${temaActual === 'dark' ? 'translate-x-5' : 'translate-x-0.5'}`} />
              </button>
            </div>

            <div className="flex items-center justify-between gap-3 px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-2 text-xs font-semibold text-slate-600 dark:text-slate-300">
                <Globe className="w-4 h-4 text-blue-500" />
                Idioma
              </div>
              <div className="flex rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-0.5">
                <button
                  type="button"
                  onClick={() => cambiarIdioma('es')}
                  className={`px-2 py-1 rounded-md text-[10px] font-bold ${idioma === 'es' ? 'bg-blue-600 text-white' : 'text-slate-500'}`}
                >
                  ES
                </button>
                <button
                  type="button"
                  onClick={() => cambiarIdioma('en')}
                  className={`px-2 py-1 rounded-md text-[10px] font-bold ${idioma === 'en' ? 'bg-blue-600 text-white' : 'text-slate-500'}`}
                >
                  EN
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {estaAutenticado && (
        <div className="pt-4 mt-4 border-t border-slate-200 dark:border-slate-800">
          <Boton
            variante="fantasma"
            tamano="medio"
            className="w-full justify-start bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 hover:bg-red-500/15"
            onClick={() => {
              setMenuMovilAbierto(false)
              cerrarSesion()
            }}
            icono={<LogOut className="w-4 h-4" />}
          >
            Cerrar sesión
          </Boton>
          <p className="mt-3 text-center text-[9px] font-medium text-slate-400 dark:text-slate-600">
            GSP Security Pro · v1.0.0
          </p>
        </div>
      )}
    </div>
  )

  if (!estaAutenticado) {
    return (
      <header className="sticky top-0 z-40 w-full border-b border-slate-200 dark:border-slate-800 bg-white/90 dark:bg-[#070B12]/90 backdrop-blur-md px-3 sm:px-6 py-3">
        <div className="max-w-7xl mx-auto flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 p-1.5">
            <img src="/Escudo.png" alt="GSP Security Pro" className="w-full h-full object-contain" />
          </div>
          <div>
            <p className="text-base font-black text-slate-900 dark:text-white font-['Outfit']">GSP Security Pro</p>
            <p className="text-[10px] text-slate-500 dark:text-slate-400">Gestión de Seguridad Profesional</p>
          </div>
        </div>
      </header>
    )
  }

  return (
    <>
      {/* Navegación lateral en escritorio */}
      <aside className="hidden md:flex fixed inset-y-0 left-0 z-50 w-72 flex-col border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0A0F18]">
        {contenidoMenu()}
      </aside>

      {/* Barra superior en escritorio */}
      <header className="hidden md:flex fixed top-0 left-72 right-0 z-40 h-16 items-center justify-between px-6 border-b border-slate-200 dark:border-slate-800 bg-white/90 dark:bg-[#070B12]/90 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900/50 p-1.5">
            <img src="/Escudo.png" alt="GSP" className="w-full h-full object-contain" />
          </div>
          <div>
            <p className="text-sm font-black text-slate-900 dark:text-white font-['Outfit']">GSP Security Pro</p>
            <p className="text-[10px] text-slate-500 dark:text-slate-500">Panel de gestión</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            className="p-2.5 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            aria-label="Notificaciones"
          >
            <Bell className="w-5 h-5" />
          </button>
          {usuario && (
            <button
              type="button"
              onClick={alAbrirPerfil}
              className="flex items-center gap-2.5 p-1.5 pr-3 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <span className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center text-[10px] font-black">
                {iniciales}
              </span>
              <span className="text-left hidden lg:block">
                <span className="block text-xs font-bold text-slate-800 dark:text-slate-200">{usuario.nombre} {usuario.apellido}</span>
                <span className="block text-[10px] text-slate-500">{rol?.texto}</span>
              </span>
            </button>
          )}
        </div>
      </header>

      {/* Barra superior móvil */}
      <header className="md:hidden sticky top-0 z-40 w-full border-b border-slate-200 dark:border-slate-800 bg-white/90 dark:bg-[#070B12]/90 backdrop-blur-md px-3 py-3">
        <div className="flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={() => setMenuMovilAbierto(true)}
            className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800"
            aria-label="Abrir menú"
          >
            <Menu className="w-5 h-5 text-blue-600 dark:text-blue-400" />
          </button>
          <button
            type="button"
            onClick={alIrAInicio}
            className="flex items-center gap-2 min-w-0"
          >
            <div className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 p-1">
              <img src="/Escudo.png" alt="GSP" className="w-full h-full object-contain" />
            </div>
            <span className="text-sm font-black text-slate-900 dark:text-white font-['Outfit'] truncate">
              GSP Security Pro
            </span>
          </button>
          <button
            type="button"
            onClick={alAbrirPerfil}
            className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center text-[10px] font-black shrink-0"
            aria-label="Abrir perfil"
          >
            {iniciales}
          </button>
        </div>
      </header>

      {/* Menú lateral móvil */}
      {menuMovilAbierto && (
        <div className="md:hidden fixed inset-0 z-[60] flex animate-fadeIn">
          <button
            type="button"
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setMenuMovilAbierto(false)}
            aria-label="Cerrar menú"
          />
          <aside className="relative z-10 w-[86%] max-w-sm h-full bg-white dark:bg-[#0A0F18] border-r border-slate-200 dark:border-slate-800 shadow-2xl">
            {contenidoMenu(true)}
          </aside>
        </div>
      )}
    </>
  )
}
