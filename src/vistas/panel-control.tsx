import React, { useState } from 'react'
import {
  Building2,
  Users,
  MapPin,
  Calendar,
  BookOpen,
  ArrowRightLeft,
  Bell,
  Clock,
  Sparkles,
  LogOut
} from 'lucide-react'
import { Insignia } from '@/componentes/ui/insignia'
import { Boton } from '@/componentes/ui/boton'
import { GestionEmpresas } from '@/componentes/operativo/gestion-empresas'
import { GestionObjetivos } from '@/componentes/operativo/gestion-objetivos'
import { GestionVigiladores } from '@/componentes/operativo/gestion-vigiladores'
import { GrillaMensual } from '@/componentes/operativo/grilla-mensual'
import { LibroNovedades } from '@/componentes/operativo/libro-novedades'
import { CambiosTurnos } from '@/componentes/operativo/cambios-turnos'
import { AvisosComunicacion } from '@/componentes/operativo/avisos-comunicacion'
import { MiTurno } from '@/componentes/operativo/mi-turno'
import { MiMes } from '@/componentes/operativo/mi-mes'
import { useAutenticacion } from '@/contextos/contexto-autenticacion'
import { useTraduccion } from '@/i18n'
import type { RolUsuario } from '@/tipos'

export const VistaPanelControl: React.FC = () => {
  const { usuario, cerrarSesion, cambiarRolSimulado } = useAutenticacion()
  const { t } = useTraduccion()

  const [pestanaActiva, setPestanaActiva] = useState<string>('grilla')

  if (!usuario) return null

  const esSuperAdmin = usuario.rol === 'super_administrador'
  const esAdmin = usuario.rol === 'administrador'
  const esVigilador = usuario.rol === 'vigilador'

  // Ajustar pestaña por defecto si cambia el rol
  const cambiarRolYDefinirPestana = (rol: RolUsuario) => {
    cambiarRolSimulado?.(rol)
    if (rol === 'vigilador') {
      setPestanaActiva('miTurno')
    } else if (rol === 'super_administrador') {
      setPestanaActiva('empresas')
    } else {
      setPestanaActiva('grilla')
    }
  }

  // Lista de pestañas según rol
  const pestanas = esVigilador
    ? [
        { id: 'miTurno', label: 'Mi Turno', icono: <Clock className="w-4 h-4" /> },
        { id: 'miMes', label: 'Mi Mes (204 hs)', icono: <Calendar className="w-4 h-4" /> },
        { id: 'novedades', label: 'Libro de Novedades', icono: <BookOpen className="w-4 h-4" /> },
        { id: 'cambios', label: 'Cambios de Turno', icono: <ArrowRightLeft className="w-4 h-4" /> },
        { id: 'avisos', label: 'Avisos', icono: <Bell className="w-4 h-4" /> }
      ]
    : esSuperAdmin
    ? [
        { id: 'empresas', label: 'Empresas', icono: <Building2 className="w-4 h-4" /> },
        { id: 'grilla', label: 'Grilla Mensual', icono: <Calendar className="w-4 h-4" /> },
        { id: 'objetivos', label: 'Objetivos', icono: <MapPin className="w-4 h-4" /> },
        { id: 'vigiladores', label: 'Vigiladores', icono: <Users className="w-4 h-4" /> },
        { id: 'novedades', label: 'Libro de Novedades', icono: <BookOpen className="w-4 h-4" /> },
        { id: 'cambios', label: 'Cambios y Reemplazos', icono: <ArrowRightLeft className="w-4 h-4" /> },
        { id: 'avisos', label: 'Avisos', icono: <Bell className="w-4 h-4" /> }
      ]
    : [
        { id: 'grilla', label: 'Grilla Mensual', icono: <Calendar className="w-4 h-4" /> },
        { id: 'objetivos', label: 'Objetivos', icono: <MapPin className="w-4 h-4" /> },
        { id: 'vigiladores', label: 'Vigiladores', icono: <Users className="w-4 h-4" /> },
        { id: 'novedades', label: 'Libro de Novedades', icono: <BookOpen className="w-4 h-4" /> },
        { id: 'cambios', label: 'Cambios y Reemplazos', icono: <ArrowRightLeft className="w-4 h-4" /> },
        { id: 'avisos', label: 'Avisos', icono: <Bell className="w-4 h-4" /> }
      ]

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Banner de Bienvenida y Rol Activo */}
      <div className="p-5 sm:p-6 rounded-2xl bg-white dark:bg-[#0C121E] border border-slate-200 dark:border-slate-800 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-blue-100 dark:bg-blue-950/70 border border-blue-300 dark:border-blue-800/80 flex items-center justify-center p-2 text-blue-600 dark:text-blue-400 shadow-sm shrink-0">
            <img src="/Escudo.png" alt="Escudo GSP" className="w-full h-full object-contain" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white font-['Outfit']">
                {usuario.nombre} {usuario.apellido}
              </h2>
              <Insignia
                variante={
                  esSuperAdmin
                    ? 'dorado'
                    : esAdmin
                    ? 'azul'
                    : 'verde'
                }
              >
                {esSuperAdmin
                  ? t.roles.superAdmin
                  : esAdmin
                  ? t.roles.admin
                  : t.roles.vigilador}
              </Insignia>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 flex items-center gap-2">
              <span className="font-mono text-blue-600 dark:text-blue-400">{usuario.email}</span>
              <span>•</span>
              <span className="font-medium text-slate-700 dark:text-slate-300">
                {usuario.empresa_nombre || 'GSP Plataforma Global'}
              </span>
            </p>
          </div>
        </div>

        {/* Botón Cerrar Sesión */}
        <div className="flex items-center gap-2 w-full md:w-auto justify-end">
          <Boton
            variante="secundario"
            tamano="chico"
            onClick={() => cerrarSesion()}
            icono={<LogOut className="w-3.5 h-3.5" />}
          >
            {t.navegacion.cerrarSesion}
          </Boton>
        </div>
      </div>

      {/* Switcher de Roles para Evaluación Rápida */}
      <div className="p-3 rounded-xl bg-slate-100 dark:bg-slate-950/70 border border-slate-200 dark:border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
        <span className="text-slate-600 dark:text-slate-400 flex items-center gap-1.5 font-medium">
          <Sparkles className="w-4 h-4 text-blue-500" />
          Alternar rol para verificar la vista y permisos:
        </span>
        <div className="flex items-center gap-2 flex-wrap">
          <button
            type="button"
            onClick={() => cambiarRolYDefinirPestana('super_administrador')}
            className={`px-3 py-1 rounded-lg font-bold transition-all cursor-pointer ${
              esSuperAdmin
                ? 'bg-amber-500 text-slate-950 shadow-xs'
                : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white border border-slate-200 dark:border-slate-800'
            }`}
          >
            Super-Admin
          </button>
          <button
            type="button"
            onClick={() => cambiarRolYDefinirPestana('administrador')}
            className={`px-3 py-1 rounded-lg font-bold transition-all cursor-pointer ${
              esAdmin
                ? 'bg-blue-600 text-white shadow-xs'
                : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white border border-slate-200 dark:border-slate-800'
            }`}
          >
            Administrador
          </button>
          <button
            type="button"
            onClick={() => cambiarRolYDefinirPestana('vigilador')}
            className={`px-3 py-1 rounded-lg font-bold transition-all cursor-pointer ${
              esVigilador
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white border border-slate-200 dark:border-slate-800'
            }`}
          >
            Vigilador
          </button>
        </div>
      </div>

      {/* Pestañas de Navegación Operativa */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 border-b border-slate-200 dark:border-slate-800/80">
        {pestanas.map((p) => {
          const estaActiva = pestanaActiva === p.id
          return (
            <button
              key={p.id}
              type="button"
              onClick={() => setPestanaActiva(p.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs whitespace-nowrap transition-all cursor-pointer select-none ${
                estaActiva
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
                  : 'bg-white dark:bg-slate-900/60 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800/80'
              }`}
            >
              {p.icono}
              <span>{p.label}</span>
            </button>
          )
        })}
      </div>

      {/* Renderizado de Módulos Operativos */}
      <div className="pt-1">
        {pestanaActiva === 'empresas' && esSuperAdmin && <GestionEmpresas />}
        {pestanaActiva === 'grilla' && <GrillaMensual />}
        {pestanaActiva === 'objetivos' && <GestionObjetivos />}
        {pestanaActiva === 'vigiladores' && <GestionVigiladores />}
        {pestanaActiva === 'novedades' && <LibroNovedades />}
        {pestanaActiva === 'cambios' && <CambiosTurnos />}
        {pestanaActiva === 'avisos' && <AvisosComunicacion />}
        {pestanaActiva === 'miTurno' && <MiTurno />}
        {pestanaActiva === 'miMes' && <MiMes />}
      </div>
    </div>
  )
}
