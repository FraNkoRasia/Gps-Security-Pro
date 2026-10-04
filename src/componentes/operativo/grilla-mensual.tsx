import React, { useState } from 'react'
import { Calendar, Sun, Moon, Edit3 } from 'lucide-react'
import { Tarjeta } from '@/componentes/ui/tarjeta'
import { Boton } from '@/componentes/ui/boton'
import { Insignia } from '@/componentes/ui/insignia'
import { Dialogo } from '@/componentes/ui/dialogo'
import { useOperativo } from '@/contextos/contexto-operativo'
import type { Turno } from '@/tipos'

export const GrillaMensual: React.FC = () => {
  const { vigiladores, objetivos, turnos, asignarTurnoGrilla } = useOperativo()

  const mesSeleccionado = '2026-10'

  // Modal para edición interactiva de celda
  const [modalEdicionAbierto, setModalEdicionAbierto] = useState(false)
  const [celdaEditando, setCeldaEditando] = useState<{
    idVigilador: string
    nombreVigilador: string
    fecha: string
    dia: number
    turnoActual?: Turno
  } | null>(null)

  const diasEnMes = 31 // Octubre 2026

  // Filtrar vigiladores por objetivo si aplica
  const vigiladoresMostrados = vigiladores

  const abrirEditarCelda = (idVig: string, nombreVig: string, dia: number) => {
    const diaStr = dia < 10 ? `0${dia}` : `${dia}`
    const fecha = `${mesSeleccionado}-${diaStr}`
    const turnoActual = turnos.find(
      (t) => t.id_vigilador === idVig && t.fecha === fecha
    )

    setCeldaEditando({
      idVigilador: idVig,
      nombreVigilador: nombreVig,
      fecha,
      dia,
      turnoActual
    })
    setModalEdicionAbierto(true)
  }

  const aplicarCodigoTurno = (codigo: '12☀️' | '12🌙' | '10' | '8' | 'F' | 'borrar') => {
    if (!celdaEditando) return

    // Buscar objetivo asignado al vigilador
    const objId = celdaEditando.turnoActual?.id_objetivo || objetivos[0]?.id || 'obj-melli-01'

    asignarTurnoGrilla({
      id_vigilador: celdaEditando.idVigilador,
      id_objetivo: objId,
      fecha: celdaEditando.fecha,
      codigo
    })

    setModalEdicionAbierto(false)
  }

  // Cálculos por vigilador (Sección 24)
  const calcularTotalesVigilador = (idVig: string) => {
    const turnosVig = turnos.filter(
      (t) => t.id_vigilador === idVig && t.fecha.startsWith(mesSeleccionado)
    )

    const horasTotales = turnosVig.reduce((acc, t) => acc + t.horas_totales, 0)
    const horasDiurnas = turnosVig.reduce((acc, t) => acc + t.horas_diurnas, 0)
    const horasNocturnas = turnosVig.reduce((acc, t) => acc + t.horas_nocturnas, 0)
    const horasDomingos = turnosVig
      .filter((t) => t.es_domingo)
      .reduce((acc, t) => acc + t.horas_totales, 0)
    const horasFeriados = turnosVig
      .filter((t) => t.es_feriado)
      .reduce((acc, t) => acc + t.horas_totales, 0)
    const francos = turnosVig.filter((t) => t.tipo === 'franco').length
    const diasTrabajados = turnosVig.filter((t) => t.horas_totales > 0).length

    // Objetivo mensual estándar: 204 horas
    const metaHoras = 204
    let estadoMeta: 'verde' | 'amarillo' | 'rojo' = 'amarillo'
    if (horasTotales >= metaHoras && horasTotales <= 220) {
      estadoMeta = 'verde'
    } else if (horasTotales > 220) {
      estadoMeta = 'rojo'
    }

    return {
      horasTotales,
      horasDiurnas,
      horasNocturnas,
      horasDomingos,
      horasFeriados,
      francos,
      diasTrabajados,
      metaHoras,
      estadoMeta
    }
  }

  // Total diario de horas del servicio (Sección 24: e.g. 12+12+10 = 34hs)
  const calcularTotalDiario = (dia: number) => {
    const diaStr = dia < 10 ? `0${dia}` : `${dia}`
    const fecha = `${mesSeleccionado}-${diaStr}`
    const turnosDia = turnos.filter((t) => t.fecha === fecha)
    return turnosDia.reduce((acc, t) => acc + t.horas_totales, 0)
  }

  const obtenerEtiquetaTurno = (t?: Turno) => {
    if (!t) return <span className="text-slate-300 dark:text-slate-700">-</span>
    if (t.tipo === 'franco') {
      return <span className="text-slate-500 dark:text-slate-400 font-bold">F</span>
    }
    if (t.tipo === 'nocturno') {
      return (
        <span className="text-blue-600 dark:text-blue-400 font-bold flex items-center justify-center gap-0.5">
          12🌙
        </span>
      )
    }
    if (t.tipo === 'diurno') {
      return (
        <span className="text-amber-500 font-bold flex items-center justify-center gap-0.5">
          {t.horas_totales}☀️
        </span>
      )
    }
    return <span className="text-emerald-500 font-bold">{t.horas_totales}</span>
  }

  return (
    <div className="space-y-6">
      {/* Controles de la Grilla */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-xl font-black text-slate-900 dark:text-white font-['Outfit']">
            Grilla Mensual Operativa
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Diagramación de guardias, cálculo automático de nocturnidad y control del objetivo mensual (204 hs).
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center gap-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 rounded-xl px-3 py-1.5 text-xs shadow-xs">
            <Calendar className="w-3.5 h-3.5 text-blue-500" />
            <span className="font-bold text-slate-900 dark:text-white">Octubre 2026</span>
          </div>

          <div className="flex items-center gap-1.5 text-xs">
            <Insignia variante="verde">Cumplido (≥204h)</Insignia>
            <Insignia variante="dorado">Por debajo (&lt;204h)</Insignia>
            <Insignia variante="rojo">Exceso (&gt;220h)</Insignia>
          </div>
        </div>
      </div>

      {/* Grilla Mensual con Scroll Horizontal Controlado y Columnas Sticky (Sección 5 & 22) */}
      <Tarjeta className="overflow-hidden">
        <div className="overflow-x-auto max-w-full">
          <table className="w-full text-xs text-left border-collapse min-w-[950px]">
            {/* Encabezado de Días */}
            <thead>
              <tr className="bg-slate-100 dark:bg-slate-950/80 border-b border-slate-200 dark:border-slate-800 text-[11px] select-none">
                <th className="p-3 sticky left-0 z-20 bg-slate-100 dark:bg-slate-950 border-r border-slate-200 dark:border-slate-800 font-bold text-slate-800 dark:text-slate-200 w-44 min-w-[176px]">
                  Vigilador
                </th>
                {Array.from({ length: diasEnMes }, (_, i) => i + 1).map((dia) => {
                  const dateObj = new Date(2026, 9, dia)
                  const esFinDeSemana = dateObj.getDay() === 0 || dateObj.getDay() === 6
                  const esFeriado = dia === 12
                  return (
                    <th
                      key={dia}
                      className={`p-2 text-center border-r border-slate-200 dark:border-slate-800/60 font-semibold min-w-[34px] ${
                        esFeriado
                          ? 'bg-amber-100/70 dark:bg-amber-950/50 text-amber-700 dark:text-amber-300'
                          : esFinDeSemana
                          ? 'bg-slate-200/50 dark:bg-slate-900/60 text-slate-700 dark:text-slate-300'
                          : 'text-slate-600 dark:text-slate-400'
                      }`}
                      title={esFeriado ? '12 Oct: Feriado Nacional' : undefined}
                    >
                      <div className="text-[10px] leading-tight opacity-70">
                        {['D', 'L', 'M', 'M', 'J', 'V', 'S'][dateObj.getDay()]}
                      </div>
                      <div className="font-bold">{dia}</div>
                    </th>
                  )
                })}
                <th className="p-3 text-center sticky right-0 z-20 bg-slate-100 dark:bg-slate-950 border-l border-slate-200 dark:border-slate-800 font-bold text-slate-800 dark:text-slate-200 min-w-[130px]">
                  Total hs / Meta
                </th>
              </tr>
            </thead>

            {/* Filas de Vigiladores */}
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
              {vigiladoresMostrados.map((vig) => {
                const totales = calcularTotalesVigilador(vig.id)

                return (
                  <tr
                    key={vig.id}
                    className="hover:bg-blue-50/40 dark:hover:bg-blue-950/20 transition-colors"
                  >
                    {/* Columna Vigilador Sticky */}
                    <td className="p-3 sticky left-0 z-10 bg-white dark:bg-[#0C121E] border-r border-slate-200 dark:border-slate-800 shadow-xs">
                      <div className="font-bold text-slate-900 dark:text-white leading-tight">
                        {vig.apellido}, {vig.nombre.charAt(0)}.
                      </div>
                      <div className="text-[10px] text-slate-400 truncate max-w-[150px]">
                        {vig.email}
                      </div>
                    </td>

                    {/* Celdas de Días Editables */}
                    {Array.from({ length: diasEnMes }, (_, i) => i + 1).map((dia) => {
                      const diaStr = dia < 10 ? `0${dia}` : `${dia}`
                      const fecha = `${mesSeleccionado}-${diaStr}`
                      const turno = turnos.find(
                        (t) => t.id_vigilador === vig.id && t.fecha === fecha
                      )

                      return (
                        <td
                          key={dia}
                          onClick={() => abrirEditarCelda(vig.id, `${vig.nombre} ${vig.apellido}`, dia)}
                          className="p-1 text-center border-r border-slate-200 dark:border-slate-800/40 cursor-pointer hover:bg-blue-100 dark:hover:bg-blue-900/40 transition-colors select-none group"
                          title="Clic para modificar turno"
                        >
                          <div className="h-7 flex items-center justify-center rounded-md group-hover:scale-105 transition-transform text-[11px]">
                            {obtenerEtiquetaTurno(turno)}
                          </div>
                        </td>
                      )
                    })}

                    {/* Columna Totales y Meta Sticky */}
                    <td className="p-2 text-center sticky right-0 z-10 bg-white dark:bg-[#0C121E] border-l border-slate-200 dark:border-slate-800 shadow-xs">
                      <div className="flex flex-col items-center justify-center gap-1">
                        <span
                          className={`px-2 py-0.5 rounded-md font-bold text-xs ${
                            totales.estadoMeta === 'verde'
                              ? 'bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800'
                              : totales.estadoMeta === 'rojo'
                              ? 'bg-red-100 dark:bg-red-950/80 text-red-700 dark:text-red-300 border border-red-300 dark:border-red-800'
                              : 'bg-amber-100 dark:bg-amber-950/80 text-amber-700 dark:text-amber-300 border border-amber-300 dark:border-amber-800'
                          }`}
                        >
                          {totales.horasTotales} hs
                        </span>
                        <span className="text-[10px] text-slate-400">
                          {totales.horasNocturnas}🌙 • {totales.francos}F
                        </span>
                      </div>
                    </td>
                  </tr>
                )
              })}

              {/* Fila Total Diario del Servicio (Sección 24) */}
              <tr className="bg-slate-100/80 dark:bg-slate-950/90 font-bold border-t-2 border-slate-300 dark:border-slate-700 text-[11px]">
                <td className="p-3 sticky left-0 z-10 bg-slate-100 dark:bg-slate-950 border-r border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200">
                  Total Diario Servicio
                </td>
                {Array.from({ length: diasEnMes }, (_, i) => i + 1).map((dia) => {
                  const total = calcularTotalDiario(dia)
                  return (
                    <td
                      key={dia}
                      className="p-1 text-center border-r border-slate-200 dark:border-slate-800/40 text-blue-600 dark:text-blue-400 font-mono"
                    >
                      {total}h
                    </td>
                  )
                })}
                <td className="p-2 text-center sticky right-0 z-10 bg-slate-100 dark:bg-slate-950 border-l border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300">
                  {turnos
                    .filter((t) => t.fecha.startsWith(mesSeleccionado))
                    .reduce((a, b) => a + b.horas_totales, 0)}{' '}
                  hs
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </Tarjeta>

      {/* Modal Interactivo de Asignación / Edición de Celda de Turno */}
      <Dialogo
        abierto={modalEdicionAbierto}
        alCerrar={() => setModalEdicionAbierto(false)}
        titulo="Asignación Rápida de Turno"
        subtitulo={
          celdaEditando
            ? `${celdaEditando.nombreVigilador} — Día ${celdaEditando.dia} de Octubre 2026`
            : ''
        }
        icono={<Edit3 className="w-5 h-5 text-blue-500" />}
        tamano="chico"
      >
        <div className="space-y-4">
          <p className="text-xs text-slate-600 dark:text-slate-400">
            Seleccioná el código de guardia para esta jornada:
          </p>

          <div className="grid grid-cols-2 gap-2 text-xs">
            <button
              type="button"
              onClick={() => aplicarCodigoTurno('12☀️')}
              className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-800 hover:scale-102 transition-all text-left cursor-pointer"
            >
              <div className="font-bold text-amber-700 dark:text-amber-400 flex items-center gap-1.5">
                <Sun className="w-4 h-4" /> 12☀️ Diurno
              </div>
              <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                07:00 a 19:00 (12 hs)
              </div>
            </button>

            <button
              type="button"
              onClick={() => aplicarCodigoTurno('12🌙')}
              className="p-3 rounded-xl bg-blue-50 dark:bg-blue-950/40 border border-blue-300 dark:border-blue-800 hover:scale-102 transition-all text-left cursor-pointer"
            >
              <div className="font-bold text-blue-600 dark:text-blue-400 flex items-center gap-1.5">
                <Moon className="w-4 h-4" /> 12🌙 Nocturno
              </div>
              <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                19:00 a 07:00 (9h nocturnas)
              </div>
            </button>

            <button
              type="button"
              onClick={() => aplicarCodigoTurno('10')}
              className="p-3 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-300 dark:border-slate-800 hover:scale-102 transition-all text-left cursor-pointer"
            >
              <div className="font-bold text-slate-800 dark:text-slate-200">
                10 hs Especial
              </div>
              <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                08:00 a 18:00 (10 hs)
              </div>
            </button>

            <button
              type="button"
              onClick={() => aplicarCodigoTurno('8')}
              className="p-3 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-300 dark:border-slate-800 hover:scale-102 transition-all text-left cursor-pointer"
            >
              <div className="font-bold text-slate-800 dark:text-slate-200">
                8 hs Estándar
              </div>
              <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                08:00 a 16:00 (8 hs)
              </div>
            </button>

            <button
              type="button"
              onClick={() => aplicarCodigoTurno('F')}
              className="p-3 rounded-xl bg-slate-200/70 dark:bg-slate-800/80 border border-slate-300 dark:border-slate-700 hover:scale-102 transition-all text-left cursor-pointer"
            >
              <div className="font-bold text-slate-800 dark:text-white">
                F — Franco
              </div>
              <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                Descanso del vigilador (0 hs)
              </div>
            </button>

            <button
              type="button"
              onClick={() => aplicarCodigoTurno('borrar')}
              className="p-3 rounded-xl bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900/60 hover:scale-102 transition-all text-left cursor-pointer"
            >
              <div className="font-bold text-red-600 dark:text-red-400">
                Borrar Guardia
              </div>
              <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                Dejar sin turno asignado
              </div>
            </button>
          </div>

          <div className="pt-2 flex justify-end">
            <Boton
              type="button"
              variante="secundario"
              onClick={() => setModalEdicionAbierto(false)}
            >
              Cancelar
            </Boton>
          </div>
        </div>
      </Dialogo>
    </div>
  )
}
