import React, { useState } from 'react'
import {
  Users,
  MapPin,
  Calendar,
  BookOpen,
  ArrowRightLeft,
  Bell,
  Clock
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
import { GestionHorasExtra } from '@/componentes/operativo/gestion-horas-extra'
import { useAutenticacion } from '@/contextos/contexto-autenticacion'
import { useTraduccion } from '@/i18n'
import { useOperativo } from '@/contextos/contexto-operativo'

export const VistaPanelControl: React.FC = () => {
  const { usuario } = useAutenticacion()
  const { t } = useTraduccion()

  const [pestanaActiva, setPestanaActiva] = useState<string>('objetivos')
  const [objetivoGrillaId, setObjetivoGrillaId] = useState<string | null>(null)
  const [empresaSeleccionadaId, setEmpresaSeleccionadaId] = useState<string | null>(null)
  const [objetivoSeleccionadoId, setObjetivoSeleccionadoId] = useState<string | null>(null)

  if (!usuario) return null

  const esSuperAdmin = usuario.rol === 'super_administrador'
  const esAdmin = usuario.rol === 'administrador'
  const esVigilador = usuario.rol === 'vigilador'
  const { asignaciones, solicitudesHorasExtra } = useOperativo()
  const asignacionActiva = asignaciones.find((a) => a.id_vigilador === usuario.id && a.activa)
  const objetivoVigiladorId = asignacionActiva?.id_objetivo || null

  // Lista de pestañas según rol
  const pestanas = esVigilador
    ? [
        { id: 'miTurno', label: 'Mi Turno', icono: <Clock className="w-4 h-4" /> },
        { id: 'grilla', label: 'Grilla', icono: <Calendar className="w-4 h-4" /> },
        { id: 'miMes', label: 'Mi Mes (204 hs)', icono: <Calendar className="w-4 h-4" /> },
        { id: 'novedades', label: 'Libro de Novedades', icono: <BookOpen className="w-4 h-4" /> },
        { id: 'cambios', label: 'Cambios de Turno', icono: <ArrowRightLeft className="w-4 h-4" /> },
        { id: 'avisos', label: 'Avisos', icono: <Bell className="w-4 h-4" /> }
      ]
    : esSuperAdmin
    ? []
    : esAdmin
    ? [
        { id: 'objetivos', label: 'Objetivos', icono: <MapPin className="w-4 h-4" /> },
        { id: 'vigiladores', label: 'Vigiladores', icono: <Users className="w-4 h-4" /> },
        { id: 'novedades', label: 'Libro de Novedades', icono: <BookOpen className="w-4 h-4" /> },
        { id: 'cambios', label: 'Cambios y Reemplazos', icono: <ArrowRightLeft className="w-4 h-4" /> },
        { id: 'avisos', label: 'Avisos', icono: <Bell className="w-4 h-4" /> },
        { id: 'horasExtra', label: `Horas Extra${solicitudesHorasExtra.filter(s => s.estado === 'pendiente').length ? ` (${solicitudesHorasExtra.filter(s => s.estado === 'pendiente').length})` : ''}`, icono: <Clock className="w-4 h-4" /> }
      ]
    : []

  const pestanaRenderizada = pestanaActiva === 'grillaObjetivo' && esAdmin
    ? 'grillaObjetivo'
    : pestanas.some((p) => p.id === pestanaActiva)
    ? pestanaActiva
    : pestanas[0]?.id || ''

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

      </div>

      {/* Navegación y contenido operativo */}
      {esSuperAdmin ? (
        <div className="pt-1">
          {!empresaSeleccionadaId ? (
            <GestionEmpresas onSeleccionarEmpresa={setEmpresaSeleccionadaId} />
          ) : (
            <div className="space-y-6">
              <div className="flex items-center justify-between gap-3">
                <Boton
                  variante="secundario"
                  tamano="chico"
                  onClick={() => {
                    setObjetivoSeleccionadoId(null)
                    setEmpresaSeleccionadaId(null)
                  }}
                >
                  ← Volver a Empresas
                </Boton>
                <Insignia variante="azul">Vista de Empresa</Insignia>
              </div>
              {!objetivoSeleccionadoId ? (
                <GestionObjetivos
                  idEmpresaSeleccionada={empresaSeleccionadaId}
                  modoConsulta
                  onSeleccionarObjetivo={setObjetivoSeleccionadoId}
                />
              ) : (
                <div className="space-y-4">
                  <div className="flex justify-end pt-2">
                    <Boton
                      variante="secundario"
                      tamano="chico"
                      onClick={() => setObjetivoSeleccionadoId(null)}
                    >
                      ← Volver a Objetivos
                    </Boton>
                  </div>
                  <GestionVigiladores
                    idEmpresaSeleccionada={empresaSeleccionadaId}
                    idObjetivoSeleccionado={objetivoSeleccionadoId}
                    modoConsulta
                  />
                </div>
              )}
            </div>
          )}
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2 pb-2 border-b border-slate-200 dark:border-slate-800/80">
            {pestanas.map((p) => {
              const estaActiva = pestanaRenderizada === p.id
              return (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => setPestanaActiva(p.id)}
                  className={`flex items-center justify-center gap-1.5 px-2 sm:px-3 py-2.5 rounded-xl font-bold text-[11px] sm:text-xs text-center transition-all cursor-pointer select-none min-w-0 ${
                    estaActiva
                      ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
                      : 'bg-white dark:bg-slate-900/60 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800/80'
                  }`}
                >
                  {p.icono}
                  <span className="truncate">{p.label}</span>
                </button>
              )
            })}
          </div>
          <div className="pt-1">
            {pestanaRenderizada === 'objetivos' && esAdmin && <GestionObjetivos onSeleccionarObjetivo={(id) => { setObjetivoGrillaId(id); setPestanaActiva('grillaObjetivo') }} />}
            {pestanaRenderizada === 'grillaObjetivo' && esAdmin && objetivoGrillaId && <GrillaMensual objetivoInicial={objetivoGrillaId} />}
            {pestanaRenderizada === 'vigiladores' && esAdmin && <GestionVigiladores />}
            {pestanaRenderizada === 'novedades' && (esAdmin || esVigilador) && <LibroNovedades />}
            {pestanaRenderizada === 'cambios' && (esAdmin || esVigilador) && <CambiosTurnos />}
            {pestanaRenderizada === 'avisos' && (esAdmin || esVigilador) && <AvisosComunicacion />}
            {pestanaRenderizada === 'horasExtra' && esAdmin && <GestionHorasExtra />}
            {pestanaRenderizada === 'miTurno' && esVigilador && <MiTurno />}
            {pestanaRenderizada === 'grilla' && esVigilador && objetivoVigiladorId && <GrillaMensual objetivoInicial={objetivoVigiladorId} soloLectura />}
            {pestanaRenderizada === 'grilla' && esVigilador && !objetivoVigiladorId && <div className="rounded-2xl border border-slate-800 bg-[#0C121E] p-6 text-center text-sm text-slate-400">No tenés un objetivo activo asignado actualmente.</div>}
            {pestanaRenderizada === 'miMes' && esVigilador && <MiMes />}
          </div>
        </>
      )}
    </div>
  )
}
