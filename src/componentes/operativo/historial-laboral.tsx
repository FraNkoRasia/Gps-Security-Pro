import React, { useMemo, useState } from 'react'
import { History } from 'lucide-react'
import { Tarjeta, TarjetaContenido } from '@/componentes/ui/tarjeta'
import { useOperativo } from '@/contextos/contexto-operativo'
import { useAutenticacion } from '@/contextos/contexto-autenticacion'
import { useTraduccion } from '@/i18n'

const formatearHoras = (horas: number) => {
  const minutos = Math.round(horas * 60)
  return `${Math.floor(minutos / 60)}.${String(minutos % 60).padStart(2, '0')}`
}

const turnoYaFinalizo = (turno: { fecha: string; hora_inicio: string; hora_fin: string }) => {
  const ahora = new Date()
  const [anio, mes, dia] = turno.fecha.split('-').map(Number)
  const [horaInicio, minutoInicio] = turno.hora_inicio.slice(0, 5).split(':').map(Number)
  const [horaFin, minutoFin] = turno.hora_fin.slice(0, 5).split(':').map(Number)
  const inicio = new Date(anio, mes - 1, dia, horaInicio, minutoInicio)
  const fin = new Date(anio, mes - 1, dia, horaFin, minutoFin)
  if (fin <= inicio) fin.setDate(fin.getDate() + 1)
  return fin <= ahora
}


const calcularHorasPorFranja = (turno: { fecha: string; hora_inicio: string; hora_fin: string }) => {
  const [anio, mes, dia] = turno.fecha.split('-').map(Number)
  const [horaInicio, minutoInicio] = turno.hora_inicio.slice(0, 5).split(':').map(Number)
  const [horaFin, minutoFin] = turno.hora_fin.slice(0, 5).split(':').map(Number)
  const inicio = new Date(anio, mes - 1, dia, horaInicio, minutoInicio || 0, 0, 0)
  let fin = new Date(anio, mes - 1, dia, horaFin, minutoFin || 0, 0, 0)
  if (fin.getTime() <= inicio.getTime()) fin = new Date(fin.getTime() + 24 * 60 * 60 * 1000)

  let minutosDiurnos = 0
  let minutosNocturnos = 0
  for (let cursor = inicio.getTime(); cursor < fin.getTime(); cursor += 60000) {
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

export const HistorialLaboral: React.FC = () => {
  const { turnos } = useOperativo()
  const { usuario } = useAutenticacion()
  const { idioma } = useTraduccion()
  const idVigilador = usuario?.id || ''
  const ahora = new Date()
  const mesActual = `${ahora.getFullYear()}-${String(ahora.getMonth() + 1).padStart(2, '0')}`
  const [mesSeleccionado, setMesSeleccionado] = useState(mesActual)

  const turnosVigilador = useMemo(
    () => turnos.filter(t => t.id_vigilador === idVigilador).sort((a, b) => b.fecha.localeCompare(a.fecha)),
    [turnos, idVigilador]
  )
  const anios = useMemo(() => {
    const lista = new Set(turnosVigilador.map(t => t.fecha.slice(0, 4)))
    lista.add(String(ahora.getFullYear()))
    return Array.from(lista).sort((a, b) => b.localeCompare(a))
  }, [turnosVigilador, ahora.getFullYear()])
  const meses = anios.flatMap(anio => Array.from({ length: 12 }, (_, i) => {
    const valor = `${anio}-${String(i + 1).padStart(2, '0')}`
    return { valor, etiqueta: new Intl.DateTimeFormat(idioma === 'en' ? 'en-US' : 'es-AR', { month: 'long', year: 'numeric' }).format(new Date(Number(anio), i, 1)) }
  }).filter(m => m.valor <= mesActual)).sort((a, b) => b.valor.localeCompare(a.valor))
  const turnosMes = turnosVigilador.filter(t => t.fecha.startsWith(mesSeleccionado) && turnoYaFinalizo(t))
  const horasNormales = turnosMes.reduce((s, t) => s + calcularHorasPorFranja(t).total, 0)
  const horasExtra = turnosMes.reduce((s, t) => s + t.horas_extra, 0)
  const horasDiurnas = turnosMes.reduce((s, t) => s + calcularHorasPorFranja(t).diurnas, 0)
  const horasNocturnas = turnosMes.reduce((s, t) => s + calcularHorasPorFranja(t).nocturnas, 0)
  const horasFeriado = turnosMes.reduce((s, t) => s + (t.es_feriado ? t.horas_totales : 0), 0)
  const diasTrabajados = turnosMes.filter(t => t.horas_totales > 0).length
  const nombreMes = new Intl.DateTimeFormat(idioma === 'en' ? 'en-US' : 'es-AR', { month: 'long', year: 'numeric' }).format(
    new Date(Number(mesSeleccionado.slice(0, 4)), Number(mesSeleccionado.slice(5, 7)) - 1, 1)
  )

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h3 className="flex items-center gap-2 text-xl font-black text-slate-900 dark:text-white">
            <History className="h-5 w-5 text-blue-500" /> Historial laboral
          </h3>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">Consultá tus turnos y horas registradas por mes y año. Solo se muestran turnos cuyo horario ya finalizó; los turnos futuros no se contabilizan.</p>
        </div>
        <label className="flex flex-col gap-1 text-xs font-semibold text-slate-500">
          Mes y año
          <select value={mesSeleccionado} onChange={e => setMesSeleccionado(e.target.value)} className="min-h-[42px] min-w-[190px] rounded-xl border border-slate-300 bg-white px-3 text-sm font-semibold capitalize text-slate-800 dark:border-slate-700 dark:bg-[#0A0F1A] dark:text-slate-100">
            {meses.map(m => <option key={m.valor} value={m.valor}>{m.etiqueta}</option>)}
          </select>
        </label>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Tarjeta><TarjetaContenido className="p-4"><p className="text-xs text-slate-500">Días trabajados</p><p className="mt-1 text-2xl font-black text-slate-900 dark:text-white">{diasTrabajados}</p></TarjetaContenido></Tarjeta>
        <Tarjeta><TarjetaContenido className="p-4"><p className="text-xs text-slate-500">Horas de turno</p><p className="mt-1 text-2xl font-black text-slate-900 dark:text-white">{formatearHoras(horasNormales)} h</p></TarjetaContenido></Tarjeta>
        <Tarjeta><TarjetaContenido className="p-4"><p className="text-xs text-slate-500">Horas diurnas</p><p className="mt-1 text-2xl font-black text-amber-600">{formatearHoras(horasDiurnas)} h</p></TarjetaContenido></Tarjeta>
        <Tarjeta><TarjetaContenido className="p-4"><p className="text-xs text-slate-500">Horas nocturnas</p><p className="mt-1 text-2xl font-black text-indigo-600">{formatearHoras(horasNocturnas)} h</p></TarjetaContenido></Tarjeta>
        <Tarjeta><TarjetaContenido className="p-4"><p className="text-xs text-slate-500">Horas en feriados</p><p className="mt-1 text-2xl font-black text-orange-600">{formatearHoras(horasFeriado)} h</p></TarjetaContenido></Tarjeta>
        <Tarjeta><TarjetaContenido className="p-4"><p className="text-xs text-slate-500">Horas extra autorizadas</p><p className="mt-1 text-2xl font-black text-emerald-600">{formatearHoras(horasExtra)} h</p></TarjetaContenido></Tarjeta>
        <Tarjeta><TarjetaContenido className="p-4"><p className="text-xs text-slate-500">Total del mes</p><p className="mt-1 text-2xl font-black text-blue-600">{formatearHoras(horasNormales + horasExtra)} h</p></TarjetaContenido></Tarjeta>
      </div>

      <Tarjeta className="overflow-hidden">
        <TarjetaContenido className="p-0">
          <div className="border-b border-slate-200 p-4 dark:border-slate-800">
            <h4 className="font-bold capitalize text-slate-900 dark:text-white">{nombreMes}</h4>
            <p className="text-xs text-slate-500">{idioma === 'en' ? `${turnosMes.length} shift records` : `${turnosMes.length} registros de turno`}</p>
          </div>
          {turnosMes.length === 0 ? (
            <p className="p-6 text-center text-sm text-slate-500">No hay turnos registrados para este mes.</p>
          ) : (
            <div className="max-w-full overflow-x-auto">
              <table className="w-full min-w-[600px] text-left text-sm">
                <thead className="bg-slate-50 text-xs text-slate-500 dark:bg-slate-900/70">
                  <tr><th className="p-3">Fecha</th><th className="p-3">Turno</th><th className="p-3">Horario</th><th className="p-3 text-right">Hs turno</th><th className="p-3 text-right">Hs extra</th><th className="p-3 text-right">Total</th></tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                  {turnosMes.map(t => (
                    <tr key={t.id} className="text-slate-700 dark:text-slate-200">
                      <td className="whitespace-nowrap p-3">{new Intl.DateTimeFormat(idioma === 'en' ? 'en-US' : 'es-AR', { day: '2-digit', month: '2-digit', year: 'numeric', timeZone: 'UTC' }).format(new Date(`${t.fecha}T12:00:00Z`))}</td>
                      <td className="p-3 capitalize">{idioma === 'en' ? (t.tipo === 'diurno' ? 'Day Shift' : t.tipo === 'nocturno' ? 'Night Shift' : t.tipo === 'franco' ? 'Day Off' : t.tipo) : t.tipo}</td>
                      <td className="whitespace-nowrap p-3">{t.hora_inicio.slice(0, 5)} – {t.hora_fin.slice(0, 5)}</td>
                      <td className="p-3 text-right tabular-nums">{formatearHoras(t.horas_totales)} h</td>
                      <td className="p-3 text-right tabular-nums text-emerald-600">{formatearHoras(t.horas_extra)} h</td>
                      <td className="p-3 text-right font-bold tabular-nums">{formatearHoras(t.horas_totales + t.horas_extra)} h</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </TarjetaContenido>
      </Tarjeta>
    </div>
  )
}
