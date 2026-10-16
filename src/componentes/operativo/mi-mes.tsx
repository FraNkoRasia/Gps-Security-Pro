import React, { useEffect, useMemo, useState } from 'react'
import { Sun, Moon } from 'lucide-react'
import { Tarjeta, TarjetaContenido } from '@/componentes/ui/tarjeta'
import { useOperativo } from '@/contextos/contexto-operativo'
import { useAutenticacion } from '@/contextos/contexto-autenticacion'
import { useTraduccion } from '@/i18n'
import { eliminarTurnosDuplicados, obtenerHorasProgramadasEnMes, obtenerIntervaloTurno, obtenerResumenHorasMes, turnoSeSuperponeConMes } from '@/utilidades/calculo-horas-mes'

const formatearHorasMinutos = (horas: number) => {
  const minutosTotales = Math.round(horas * 60)
  const horasEnteras = Math.floor(minutosTotales / 60)
  const minutosRestantes = minutosTotales % 60
  return `${horasEnteras}.${String(minutosRestantes).padStart(2, '0')}`
}


export const MiMes: React.FC = () => {
  const { turnos } = useOperativo()
  const { usuario } = useAutenticacion()
  const { idioma } = useTraduccion()

  const idVig = usuario?.id || 'usr-vig-01'
  const [ahora, setAhora] = useState(() => new Date())
  useEffect(() => {
    const intervalo = window.setInterval(() => setAhora(new Date()), 60_000)
    return () => window.clearInterval(intervalo)
  }, [])
  const mesActual = `${ahora.getFullYear()}-${String(ahora.getMonth() + 1).padStart(2, '0')}`
  const [mesSeleccionado, setMesSeleccionado] = useState(mesActual)
  const mesesDisponibles = useMemo(() => {
    const anios = new Set(turnos.filter(t => t.id_vigilador === idVig).map(t => t.fecha.slice(0, 4)))
    anios.add(String(ahora.getFullYear()))
    return Array.from(anios).sort((a, b) => b.localeCompare(a))
  }, [turnos, idVig, ahora.getFullYear()])
  const fechaMesSeleccionado = new Date(Number(mesSeleccionado.slice(0, 4)), Number(mesSeleccionado.slice(5, 7)) - 1, 1)
  const nombreMesSeleccionado = new Intl.DateTimeFormat(idioma === 'en' ? 'en-US' : 'es-AR', { month: 'long', year: 'numeric' }).format(fechaMesSeleccionado)

  // Turnos del mes seleccionado para este vigilador
  const turnosMes = turnos.filter(
    (t) => t.id_vigilador === idVig && turnoSeSuperponeConMes(t, mesSeleccionado)
  )

  // Excluye reemplazos y evita duplicar registros antes de aplicar el cálculo compartido.
  const turnosContables = eliminarTurnosDuplicados(turnosMes.filter(t => t.estado !== 'reemplazado'))

  // El objetivo conserva las horas programadas; las horas realizadas se calculan solo al finalizar.
  const horasObjetivoMes = turnosContables.reduce((acc, t) => {
    const horasProgramadas = obtenerHorasProgramadasEnMes(t, mesSeleccionado)
    const { fin } = obtenerIntervaloTurno(t)
    const [anio, mes] = mesSeleccionado.split('-').map(Number)
    const inicioMes = new Date(anio, mes - 1, 1)
    const finMes = new Date(anio, mes, 1)
    const extrasDelMes = fin >= inicioMes && fin < finMes ? t.horas_extra : 0
    return acc + horasProgramadas + extrasDelMes
  }, 0)
  const resumenHoras = obtenerResumenHorasMes(turnosContables, mesSeleccionado, ahora)
  const horasTrabajadasAlMomento = resumenHoras.horasTurno + resumenHoras.horasExtra
  const horasDiurnas = resumenHoras.horasDiurnas
  const horasNocturnas = resumenHoras.horasNocturnas
  const horasDomingos = resumenHoras.turnosFinalizados
    .filter(t => t.es_domingo)
    .reduce((acc, t) => acc + t.horas_totales, 0)
  const horasFeriados = resumenHoras.turnosFinalizados
    .filter(t => t.es_feriado)
    .reduce((acc, t) => acc + t.horas_totales, 0)
  const horasExtra = resumenHoras.horasExtra
  const francos = turnosContables.filter(t => t.tipo === 'franco' && t.fecha <= ahora.toISOString().slice(0, 10)).length
  const diasTrabajados = resumenHoras.turnosFinalizados.length

  const porcentajeCumplimiento = horasObjetivoMes > 0
    ? Math.min(100, Math.round((horasTrabajadasAlMomento / horasObjetivoMes) * 100))
    : 0
  const horasPendientes = Math.max(0, horasObjetivoMes - horasTrabajadasAlMomento)

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-xl font-black text-slate-900 dark:text-white font-['Outfit']">
            Mi Mes — {nombreMesSeleccionado}
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Cálculo consolidado de horas de servicio, nocturnidad y objetivo laboral (Sección 34).
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full sm:w-auto">
          <label htmlFor="mi-mes-selector" className="sr-only">Seleccionar mes y año</label>
          <select
            id="mi-mes-selector"
            value={mesSeleccionado}
            onChange={(e) => setMesSeleccionado(e.target.value)}
            className="min-h-[40px] rounded-xl border border-slate-300 bg-white px-3 text-sm font-semibold capitalize text-slate-800 dark:border-slate-700 dark:bg-[#0A0F1A] dark:text-slate-100"
          >
            {mesesDisponibles.flatMap(anio => Array.from({ length: 12 }, (_, i) => {
              const valor = `${anio}-${String(i + 1).padStart(2, '0')}`
              const etiqueta = new Intl.DateTimeFormat(idioma === 'en' ? 'en-US' : 'es-AR', { month: 'long', year: 'numeric' }).format(new Date(Number(anio), i, 1))
              return { valor, etiqueta }
            }).filter(m => m.valor <= mesActual))
              .sort((a, b) => b.valor.localeCompare(a.valor))
              .map(m => <option key={m.valor} value={m.valor}>{m.etiqueta}</option>)}
          </select>
        </div>
      </div>

      {/* Tarjeta de Progreso Principal hacia 204 hs */}
      <Tarjeta className="border-blue-500/30">
        <TarjetaContenido className="p-6 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <span className="text-xs text-slate-500 dark:text-slate-400 font-semibold uppercase tracking-wider">
                Horas Acumuladas en el Mes
              </span>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white">
                  {formatearHorasMinutos(horasTrabajadasAlMomento)} hs
                </span>
                <span className="text-sm font-bold text-slate-500">/ {formatearHorasMinutos(horasObjetivoMes)} hs objetivo</span>
              </div>
            </div>

            <div className="text-right">
              <span className="text-2xl font-black text-blue-600 dark:text-blue-400">
                {porcentajeCumplimiento}%
              </span>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {horasObjetivoMes > 0 && horasTrabajadasAlMomento >= horasObjetivoMes
                  ? (idioma === 'en' ? 'Monthly target reached' : 'Objetivo mensual alcanzado')
                  : idioma === 'en' ? `${formatearHorasMinutos(horasPendientes)} h remaining to reach the target` : `Faltan ${formatearHorasMinutos(horasPendientes)} hs para cumplir el objetivo`}
              </p>
            </div>
          </div>

          <div className="w-full bg-slate-200 dark:bg-slate-800 h-3 rounded-full overflow-hidden p-0.5">
            <div
              className="bg-gradient-to-r from-blue-600 via-blue-500 to-cyan-400 h-full rounded-full transition-all duration-500"
              style={{ width: `${porcentajeCumplimiento}%` }}
            />
          </div>
        </TarjetaContenido>
      </Tarjeta>

      {/* Grid de Métricas Detalladas (Sección 34) */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Tarjeta>
          <TarjetaContenido className="p-4 text-center">
            <span className="text-slate-500 dark:text-slate-400 text-xs block">Días Trabajados</span>
            <span className="text-2xl font-black text-slate-900 dark:text-white mt-1 block">
              {diasTrabajados}
            </span>
          </TarjetaContenido>
        </Tarjeta>

        <Tarjeta>
          <TarjetaContenido className="p-4 text-center">
            <span className="text-slate-500 dark:text-slate-400 text-xs block">Francos de Guardia</span>
            <span className="text-2xl font-black text-slate-900 dark:text-white mt-1 block">
              {francos}
            </span>
          </TarjetaContenido>
        </Tarjeta>

        <Tarjeta>
          <TarjetaContenido className="p-4 text-center">
            <span className="text-slate-500 dark:text-slate-400 text-xs block flex items-center justify-center gap-1">
              <Sun className="w-3.5 h-3.5 text-amber-500" /> Diurnas
            </span>
            <span className="text-2xl font-black text-amber-600 dark:text-amber-400 mt-1 block">
              {formatearHorasMinutos(horasDiurnas)} hs
            </span>
          </TarjetaContenido>
        </Tarjeta>

        <Tarjeta>
          <TarjetaContenido className="p-4 text-center">
            <span className="text-slate-500 dark:text-slate-400 text-xs block flex items-center justify-center gap-1">
              <Moon className="w-3.5 h-3.5 text-blue-500" /> Nocturnas
            </span>
            <span className="text-2xl font-black text-blue-600 dark:text-blue-400 mt-1 block">
              {formatearHorasMinutos(horasNocturnas)} hs
            </span>
          </TarjetaContenido>
        </Tarjeta>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <Tarjeta>
          <TarjetaContenido className="p-4">
            <span className="text-slate-500 dark:text-slate-400 text-xs block">Domingos Trabajados</span>
            <span className="text-xl font-bold text-slate-900 dark:text-white mt-1 block">
              {horasDomingos} hs
            </span>
            <p className="text-[10px] text-slate-400 mt-0.5">Computan recargo dominical</p>
          </TarjetaContenido>
        </Tarjeta>

        <Tarjeta>
          <TarjetaContenido className="p-4">
            <span className="text-slate-500 dark:text-slate-400 text-xs block">Feriados Trabajados</span>
            <span className="text-xl font-bold text-slate-900 dark:text-white mt-1 block">
              {horasFeriados} hs
            </span>
            <p className="text-[10px] text-slate-400 mt-0.5">Total de horas registradas en feriados</p>
          </TarjetaContenido>
        </Tarjeta>

        <Tarjeta>
          <TarjetaContenido className="p-4">
            <span className="text-slate-500 dark:text-slate-400 text-xs block">Horas Extra</span>
            <span className="text-xl font-bold text-emerald-600 dark:text-emerald-400 mt-1 block">
              {formatearHorasMinutos(horasExtra)} hs
            </span>
            <p className="text-[10px] text-slate-400 mt-0.5">Excedentes autorizados</p>
          </TarjetaContenido>
        </Tarjeta>
      </div>
    </div>
  )
}
