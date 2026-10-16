import React, { useEffect, useMemo, useState } from 'react'
import { Sun, Moon } from 'lucide-react'
import { Tarjeta, TarjetaContenido } from '@/componentes/ui/tarjeta'
import { useOperativo } from '@/contextos/contexto-operativo'
import { useAutenticacion } from '@/contextos/contexto-autenticacion'
import { useTraduccion } from '@/i18n'

const formatearHorasMinutos = (horas: number) => {
  const minutosTotales = Math.round(horas * 60)
  const horasEnteras = Math.floor(minutosTotales / 60)
  const minutosRestantes = minutosTotales % 60
  return `${horasEnteras}.${String(minutosRestantes).padStart(2, '0')}`
}


const calcularHorasPorFranja = (
  turno: { fecha: string; hora_inicio: string; hora_fin: string },
  limite?: Date
) => {
  const [anio, mes, dia] = turno.fecha.split('-').map(Number)
  const [horaInicio, minutoInicio] = turno.hora_inicio.slice(0, 5).split(':').map(Number)
  const [horaFin, minutoFin] = turno.hora_fin.slice(0, 5).split(':').map(Number)
  const inicio = new Date(anio, mes - 1, dia, horaInicio, minutoInicio || 0, 0, 0)
  let fin = new Date(anio, mes - 1, dia, horaFin, minutoFin || 0, 0, 0)
  if (fin.getTime() <= inicio.getTime()) fin = new Date(fin.getTime() + 24 * 60 * 60 * 1000)

  let finContable = fin
  if (limite && limite.getTime() < finContable.getTime()) {
    const minutosTranscurridos = Math.max(0, Math.floor((limite.getTime() - inicio.getTime()) / 60000))
    finContable = new Date(inicio.getTime() + minutosTranscurridos * 60000)
  }
  if (finContable.getTime() <= inicio.getTime()) return { diurnas: 0, nocturnas: 0, total: 0 }

  let minutosDiurnos = 0
  let minutosNocturnos = 0
  for (let cursor = inicio.getTime(); cursor < finContable.getTime(); cursor += 60000) {
    const hora = new Date(cursor).getHours()
    if (hora >= 21 || hora < 6) minutosNocturnos++
    else minutosDiurnos++
  }

  return {
    diurnas: minutosDiurnos / 60,
    nocturnas: minutosNocturnos / 60,
    total: (minutosDiurnos + minutosNocturnos) / 60,
  }
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
    (t) => t.id_vigilador === idVig && t.fecha.startsWith(mesSeleccionado)
  )

  // Los turnos reemplazados no forman parte de las horas ni del objetivo de este vigilador.
  // Si el turno sigue asignado al vigilador, su estado debe ser "programado".
  const turnosContables = turnosMes.filter((t) => t.estado !== 'reemplazado')

  // Objetivo mensual: suma de los turnos válidos de la grilla, incluidas las extras aprobadas.
  const horasObjetivoMes = turnosContables.reduce((acc, t) => acc + t.horas_totales + t.horas_extra, 0)

  // Horas trabajadas hasta la fecha: se cuenta solo el tiempo transcurrido de cada turno.
  // Las horas extra autorizadas se agregan cuando finaliza el turno, como antes.
  const horasTrabajadasAlMomento = turnosContables.reduce((acc, t) => {
    if (t.tipo === 'franco' || t.horas_totales <= 0) return acc
    if (mesSeleccionado > mesActual) return acc
    const resultado = calcularHorasPorFranja(t, mesSeleccionado === mesActual ? ahora : undefined)
    const [anio, mes, dia] = t.fecha.split('-').map(Number)
    const [horaInicio, minutoInicio] = t.hora_inicio.slice(0, 5).split(':').map(Number)
    const [horaFin, minutoFin] = t.hora_fin.slice(0, 5).split(':').map(Number)
    const inicio = new Date(anio, mes - 1, dia, horaInicio, minutoInicio || 0, 0, 0)
    let fin = new Date(anio, mes - 1, dia, horaFin, minutoFin || 0, 0, 0)
    if (fin.getTime() <= inicio.getTime()) fin = new Date(fin.getTime() + 24 * 60 * 60 * 1000)
    const extrasFinalizadas = ahora.getTime() >= fin.getTime() ? t.horas_extra : 0
    return acc + resultado.total + extrasFinalizadas
  }, 0)

  const horasDiurnas = turnosContables.reduce((acc, t) => {
    if (t.tipo === 'franco' || t.horas_totales <= 0 || mesSeleccionado > mesActual) return acc
    return acc + calcularHorasPorFranja(t, mesSeleccionado === mesActual ? ahora : undefined).diurnas
  }, 0)
  const horasNocturnas = turnosContables.reduce((acc, t) => {
    if (t.tipo === 'franco' || t.horas_totales <= 0 || mesSeleccionado > mesActual) return acc
    return acc + calcularHorasPorFranja(t, mesSeleccionado === mesActual ? ahora : undefined).nocturnas
  }, 0)
  const horasDomingos = turnosContables
    .filter((t) => t.es_domingo)
    .reduce((acc, t) => acc + t.horas_totales, 0)
  const horasFeriados = turnosContables
    .filter((t) => t.es_feriado)
    .reduce((acc, t) => acc + t.horas_totales, 0)
  const horasExtra = turnosContables.reduce((acc, t) => acc + t.horas_extra, 0)
  const francos = turnosContables.filter((t) => t.tipo === 'franco').length
  const diasTrabajados = turnosContables.filter((t) => t.horas_totales > 0).length

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
