import React from 'react'
import { Clock, MapPin, Calendar } from 'lucide-react'
import { Tarjeta, TarjetaContenido, TarjetaEncabezado, TarjetaTitulo } from '@/componentes/ui/tarjeta'
import { Insignia } from '@/componentes/ui/insignia'
import { useOperativo } from '@/contextos/contexto-operativo'
import { useAutenticacion } from '@/contextos/contexto-autenticacion'
import { SolicitarHorasExtra } from '@/componentes/operativo/solicitar-horas-extra'

export const MiTurno: React.FC = () => {
  const { turnos, objetivos, asignaciones, supervisores, tiposTurno } = useOperativo()
  const { usuario } = useAutenticacion()

  const idVig = usuario?.id || 'usr-vig-01'
  const hoyStr = new Date().toISOString().split('T')[0]

  // Buscar turno de hoy
  const turnoHoy = turnos.find((t) => t.id_vigilador === idVig && t.fecha === hoyStr)
  // Próximos turnos
  const proximosTurnos = turnos
    .filter((t) => t.id_vigilador === idVig && t.fecha > hoyStr && t.horas_totales > 0)
    .sort((a, b) => a.fecha.localeCompare(b.fecha))

  // Asignación activa
  const asignacionActiva = asignaciones.find((a) => a.id_vigilador === idVig && a.activa)
  const objetivoActivo = objetivos.find((o) => o.id === asignacionActiva?.id_objetivo)
  const supervisorActivo = supervisores.find((s) => s.id === objetivoActivo?.id_supervisor)

  // Última novedad registrada
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-xl font-black text-slate-900 dark:text-white font-['Outfit']">
          Mi Turno Operativo
        </h3>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
          Información de tu puesto, horario, supervisor y elementos asignados.
        </p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        {/* Tarjeta de Guardia Actual */}
        <Tarjeta className="border-blue-500/40 bg-gradient-to-br from-white via-blue-50/20 to-white dark:from-[#0C121E] dark:via-blue-950/20 dark:to-[#0C121E]">
          <TarjetaEncabezado>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
              <TarjetaTitulo className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-blue-500" />
                Guardia de Hoy ({hoyStr})
              </TarjetaTitulo>
              {turnoHoy && turnoHoy.tipo !== 'franco' ? (
                <Insignia variante="verde">En Servicio</Insignia>
              ) : (
                <Insignia variante="gris">Franco de Servicio</Insignia>
              )}
            </div>
          </TarjetaEncabezado>

          <TarjetaContenido className="space-y-4">
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950/70 border border-slate-200 dark:border-slate-800">
              <span className="text-[11px] text-slate-500 dark:text-slate-400 block mb-0.5 font-bold uppercase tracking-wider">
                Objetivo Asignado:
              </span>
              <h4 className="text-lg font-black text-slate-900 dark:text-white">
                {objetivoActivo?.nombre || 'MercadoLibre Río Cuarto'}
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-slate-400" />
                <span>{objetivoActivo?.direccion || 'Parque Industrial'}</span>
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950/70 border border-slate-200 dark:border-slate-800">
                <span className="text-slate-500 dark:text-slate-400 block text-[10px] uppercase font-bold">
                  Horario del Turno:
                </span>
                <span className="font-extrabold text-slate-900 dark:text-white text-base break-words">
                  {turnoHoy ? `${turnoHoy.hora_inicio} → ${turnoHoy.hora_fin}` : 'Sin turno hoy'}
                </span>
                <span className="text-[11px] text-blue-600 dark:text-blue-400 font-semibold block mt-0.5">
                  {turnoHoy ? (tiposTurno.find(t => t.id === turnoHoy.id_tipo_turno)?.nombre || (turnoHoy.tipo === 'nocturno' ? 'Turno nocturno' : turnoHoy.tipo === 'diurno' ? 'Turno diurno' : 'Franco')) : 'Sin guardia programada'}
                </span>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950/70 border border-slate-200 dark:border-slate-800">
                <span className="text-slate-500 dark:text-slate-400 block text-[10px] uppercase font-bold">
                  Supervisor a Cargo:
                </span>
                <span className="font-bold text-slate-900 dark:text-white text-sm break-words">
                  {supervisorActivo ? `${supervisorActivo.nombre} ${supervisorActivo.apellido}` : 'Sin supervisor asignado'}
                </span>
                <span className="text-[11px] text-slate-500 dark:text-slate-400 block mt-0.5">
                  {supervisorActivo?.telefono || 'Contacto no registrado'}
                </span>
              </div>
            </div>

            {turnoHoy && turnoHoy.tipo !== 'franco' && <div className="space-y-2"><div className="flex justify-end"><SolicitarHorasExtra turno={turnoHoy}/></div>{turnoHoy.horas_extra > 0 && <p className="text-right text-xs font-semibold text-emerald-500">Horas extra confirmadas: +{turnoHoy.horas_extra} h</p>}</div>}

            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950/70 border border-slate-200 dark:border-slate-800 text-xs">
              <span className="text-slate-500 dark:text-slate-400 block text-[10px] font-bold uppercase mb-1">
                Elementos a Cargo del Puesto:
              </span>
              <p className="text-slate-800 dark:text-slate-200 break-words whitespace-pre-line leading-5">
                {objetivoActivo?.elementos_a_cargo || 'No hay elementos registrados para este objetivo.'}
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950/70 border border-slate-200 dark:border-slate-800 text-xs">
              <span className="text-slate-500 dark:text-slate-400 block text-[10px] font-bold uppercase mb-1">Descripción y Puntos de Cobertura:</span>
              <p className="text-slate-800 dark:text-slate-200 break-words whitespace-pre-line leading-5">{objetivoActivo?.descripcion || 'No hay descripción ni puntos de cobertura registrados para este objetivo.'}</p>
            </div>
          </TarjetaContenido>
        </Tarjeta>

        {/* Próximos Turnos Programados */}
        <Tarjeta>
          <TarjetaEncabezado>
            <TarjetaTitulo className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-amber-500" />
              Próximos Turnos Programados
            </TarjetaTitulo>
          </TarjetaEncabezado>
          <TarjetaContenido>
            {proximosTurnos.length === 0 ? (
              <p className="text-xs text-slate-500 text-center py-6">
                No hay guardias adicionales diagramadas en los próximos días.
              </p>
            ) : (
              <div className="divide-y divide-slate-200 dark:divide-slate-800 text-xs">
                {proximosTurnos.slice(0, 5).map((trn) => (
                  <div key={trn.id} className="py-3 flex items-center justify-between gap-3">
                    <div>
                      <div className="font-bold text-slate-900 dark:text-white">
                        {trn.fecha}
                      </div>
                      <div className="text-[11px] text-slate-500 dark:text-slate-400">
                        {trn.hora_inicio} a {trn.hora_fin} ({trn.horas_totales} hs)
                      </div>
                    </div>
                    <div>
                      <Insignia variante={trn.tipo === 'nocturno' ? 'azul' : 'dorado'}>
                        {tiposTurno.find(t => t.id === trn.id_tipo_turno)?.nombre || (trn.tipo === 'nocturno' ? '12🌙 Nocturno' : trn.tipo === 'diurno' ? '12☀️ Diurno' : trn.tipo)}
                      </Insignia>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </TarjetaContenido>
        </Tarjeta>
      </div>
    </div>
  )
}
