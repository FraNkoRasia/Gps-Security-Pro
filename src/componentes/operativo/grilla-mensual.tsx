import React, { useEffect, useState } from 'react'
import {
  Sun,
  Moon,
  Edit3,
  ChevronLeft,
  ChevronRight,
  Wand2,
} from 'lucide-react'
import { Tarjeta } from '@/componentes/ui/tarjeta'
import { Boton } from '@/componentes/ui/boton'
import { Dialogo } from '@/componentes/ui/dialogo'
import { Etiqueta } from '@/componentes/ui/etiqueta'
import { useOperativo } from '@/contextos/contexto-operativo'
import type { Turno } from '@/tipos'

export const GrillaMensual: React.FC<{ objetivoInicial?: string }> = ({ objetivoInicial = '' }) => {
  const { vigiladores, asignaciones, turnos, asignarTurnoGrilla } = useOperativo()
  const [objetivoSeleccionado] = useState(objetivoInicial)

  const mesSeleccionado = '2026-10'
  const totalDiasMes = 31

  // Selector de Modo: 'semana' (7 días a simple vista) o 'mes' (31 días completo)
  const [modoVista, setModoVista] = useState<'semana' | 'mes'>('semana')
  const [semanaActiva, setSemanaActiva] = useState<number>(1) // 1 a 5

  // Modal para edición interactiva de celda
  const [modalEdicionAbierto, setModalEdicionAbierto] = useState(false)
  const [celdaEditando, setCeldaEditando] = useState<{
    idVigilador: string
    nombreVigilador: string
    fecha: string
    dia: number
    turnoActual?: Turno
  } | null>(null)

  // Modal Generador de Diagramas (Sección 28)
  const [modalGeneradorAbierto, setModalGeneradorAbierto] = useState(false)
  const [vigiladorDiagrama, setVigiladorDiagrama] = useState('')

  const [patronDiagrama, setPatronDiagrama] = useState<'4x3' | '4x2' | '2x2' | '6x1'>('4x3')
  const [tipoGuardiaDiagrama, setTipoGuardiaDiagrama] = useState<'diurno' | 'nocturno'>('nocturno')

  // Definición de las 5 semanas de Octubre 2026
  const semanas = [
    { numero: 1, inicio: 1, fin: 7, label: 'Sem 1 (1 - 7)' },
    { numero: 2, inicio: 8, fin: 14, label: 'Sem 2 (8 - 14)' },
    { numero: 3, inicio: 15, fin: 21, label: 'Sem 3 (15 - 21)' },
    { numero: 4, inicio: 22, fin: 28, label: 'Sem 4 (22 - 28)' },
    { numero: 5, inicio: 29, fin: 31, label: 'Sem 5 (29 - 31)' }
  ]

  const semanaActualData = semanas.find((s) => s.numero === semanaActiva) || semanas[0]

  // Días a renderizar según el modo
  const diasVisibles =
    modoVista === 'semana'
      ? Array.from(
          { length: semanaActualData.fin - semanaActualData.inicio + 1 },
          (_, i) => semanaActualData.inicio + i
        )
      : Array.from({ length: totalDiasMes }, (_, i) => i + 1)

  // Filtrado de vigiladores
  const vigiladoresMostrados = objetivoSeleccionado
    ? vigiladores.filter((v) => asignaciones.some((a) => a.id_vigilador === v.id && a.id_objetivo === objetivoSeleccionado && a.activa))
    : []
  useEffect(() => {
    if (!vigiladorDiagrama && vigiladoresMostrados.length > 0) {
      setVigiladorDiagrama(vigiladoresMostrados[0].id)
    }
  }, [vigiladoresMostrados, vigiladorDiagrama])

  const abrirEditarCelda = (idVig: string, nombreVig: string, dia: number) => {
    const diaStr = dia < 10 ? `0${dia}` : `${dia}`
    const fecha = `${mesSeleccionado}-${diaStr}`
    const turnoActual = turnos.find(
      (t) => t.id_vigilador === idVig && t.id_objetivo === objetivoSeleccionado && t.fecha === fecha
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

    const objId = objetivoSeleccionado || celdaEditando.turnoActual?.id_objetivo || ''
    if (!objId) return

    asignarTurnoGrilla({
      id_vigilador: celdaEditando.idVigilador,
      id_objetivo: objId,
      fecha: celdaEditando.fecha,
      codigo
    })

    setModalEdicionAbierto(false)
  }

  // Generador de Diagramas (Sección 28: ej 4x3)
  const aplicarGeneradorDiagrama = () => {
    const objId = objetivoSeleccionado
    if (!objId || !vigiladorDiagrama) return
    let diasTrabajo = 4
    let diasFranco = 3

    if (patronDiagrama === '4x2') {
      diasTrabajo = 4
      diasFranco = 2
    } else if (patronDiagrama === '2x2') {
      diasTrabajo = 2
      diasFranco = 2
    } else if (patronDiagrama === '6x1') {
      diasTrabajo = 6
      diasFranco = 1
    }

    const cicloTotal = diasTrabajo + diasFranco
    const codigoGuardia = tipoGuardiaDiagrama === 'nocturno' ? '12🌙' : '12☀️'

    for (let d = 1; d <= totalDiasMes; d++) {
      const posCiclo = (d - 1) % cicloTotal
      const diaStr = d < 10 ? `0${d}` : `${d}`
      const fecha = `${mesSeleccionado}-${diaStr}`

      if (posCiclo < diasTrabajo) {
        asignarTurnoGrilla({
          id_vigilador: vigiladorDiagrama,
          id_objetivo: objId,
          fecha,
          codigo: codigoGuardia
        })
      } else {
        asignarTurnoGrilla({
          id_vigilador: vigiladorDiagrama,
          id_objetivo: objId,
          fecha,
          codigo: 'F'
        })
      }
    }

    setModalGeneradorAbierto(false)
  }

  // Cálculos por vigilador (Sección 24)
  const calcularTotalesVigilador = (idVig: string) => {
    const turnosVig = turnos.filter(
      (t) => t.id_vigilador === idVig && t.id_objetivo === objetivoSeleccionado && t.id_objetivo === objetivoSeleccionado && t.fecha.startsWith(mesSeleccionado)
    )

    const horasTotales = turnosVig.reduce((acc, t) => acc + t.horas_totales, 0)
    const horasDiurnas = turnosVig.reduce((acc, t) => acc + t.horas_diurnas, 0)
    const horasNocturnas = turnosVig.reduce((acc, t) => acc + t.horas_nocturnas, 0)
    const francos = turnosVig.filter((t) => t.tipo === 'franco').length

    // Horas en la semana activa
    const horasSemana = turnosVig
      .filter((t) => {
        const d = Number(t.fecha.split('-')[2])
        return d >= semanaActualData.inicio && d <= semanaActualData.fin
      })
      .reduce((acc, t) => acc + t.horas_totales, 0)

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
      horasSemana,
      francos,
      metaHoras,
      estadoMeta
    }
  }

  // Total diario de horas del servicio
  const calcularTotalDiario = (dia: number) => {
    const diaStr = dia < 10 ? `0${dia}` : `${dia}`
    const fecha = `${mesSeleccionado}-${diaStr}`
    const turnosDia = turnos.filter((t) => t.id_objetivo === objetivoSeleccionado && t.fecha === fecha)
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
    <div className="space-y-5">
      {/* Barra de Controles y Selector Intuitivo de Semanas */}
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
        <div>
          <h3 className="text-xl font-black text-slate-900 dark:text-white font-['Outfit']">
            Grilla Mensual Operativa
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Diagramá turnos visualizando una semana completa a simple vista o el mes entero.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap w-full lg:w-auto justify-between lg:justify-end">
          {/* Alternador de Modo: Semana (7 días) vs Mes Completo */}
          <div className="inline-flex rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-300 dark:border-slate-800 p-1 text-xs">
            <button
              type="button"
              onClick={() => setModoVista('semana')}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                modoVista === 'semana'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Vista Semana (7 días)
            </button>
            <button
              type="button"
              onClick={() => setModoVista('mes')}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                modoVista === 'mes'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Mes Completo (31 días)
            </button>
          </div>

          {/* Generador de Diagramas (Sección 28) */}
          <Boton
            variante="secundario"
            tamano="chico"
            onClick={() => setModalGeneradorAbierto(true)}
            icono={<Wand2 className="w-3.5 h-3.5 text-blue-500" />}
          >
            Generar Diagrama
          </Boton>
        </div>
      </div>

      {/* Navegador Intuitivo de Semanas (Visible en modo Semana) */}
      {modoVista === 'semana' && (
        <div className="p-3 rounded-2xl bg-white dark:bg-[#0C121E] border border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-sm">
          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled={semanaActiva === 1}
              onClick={() => setSemanaActiva((prev) => Math.max(1, prev - 1))}
              className="p-1.5 rounded-lg border border-slate-300 dark:border-slate-700 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-slate-100 dark:hover:bg-slate-800"
              title="Semana anterior"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            <span className="text-xs font-bold text-slate-800 dark:text-slate-200 min-w-[150px] text-center">
              Semana {semanaActiva} de Octubre 2026 ({semanaActualData.inicio} al {semanaActualData.fin})
            </span>

            <button
              type="button"
              disabled={semanaActiva === semanas.length}
              onClick={() => setSemanaActiva((prev) => Math.min(semanas.length, prev + 1))}
              className="p-1.5 rounded-lg border border-slate-300 dark:border-slate-700 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-slate-100 dark:hover:bg-slate-800"
              title="Semana siguiente"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* Botones de Acceso Rápido por Semana */}
          <div className="flex items-center gap-1.5 overflow-x-auto max-w-full pb-1 sm:pb-0">
            {semanas.map((sem) => (
              <button
                key={sem.numero}
                type="button"
                onClick={() => setSemanaActiva(sem.numero)}
                className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition-all cursor-pointer whitespace-nowrap ${
                  semanaActiva === sem.numero
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'bg-slate-100 dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white border border-slate-200 dark:border-slate-800'
                }`}
              >
                {sem.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Tabla de la Grilla (Semanal o Mensual con Scroll Controlado) */}
      <Tarjeta className="overflow-hidden border-slate-200 dark:border-slate-800">
        <div className="overflow-x-auto max-w-full">
          <table className="w-full text-xs text-left border-collapse">
            <thead>
              <tr className="bg-slate-100 dark:bg-slate-950/80 border-b border-slate-200 dark:border-slate-800 text-[11px] select-none">
                <th className="p-3 sticky left-0 z-20 bg-slate-100 dark:bg-slate-950 border-r border-slate-200 dark:border-slate-800 font-bold text-slate-800 dark:text-slate-200 w-28 sm:w-32 min-w-[118px]">
                  Vigilador
                </th>
                {diasVisibles.map((dia) => {
                  const dateObj = new Date(2026, 9, dia)
                  const esFinDeSemana = dateObj.getDay() === 0 || dateObj.getDay() === 6
                  const esFeriado = dia === 12
                  return (
                    <th
                      key={dia}
                      className={`p-2 text-center border-r border-slate-200 dark:border-slate-800/60 font-semibold ${
                        modoVista === 'semana' ? 'min-w-[40px] max-w-[40px]' : 'min-w-[32px] max-w-[32px]'
                      } ${
                        esFeriado
                          ? 'bg-amber-100/70 dark:bg-amber-950/50 text-amber-700 dark:text-amber-300'
                          : esFinDeSemana
                          ? 'bg-slate-200/50 dark:bg-slate-900/60 text-slate-700 dark:text-slate-300'
                          : 'text-slate-600 dark:text-slate-400'
                      }`}
                    >
                      <div className="text-[10px] leading-tight opacity-75 font-semibold">
                        {['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'][dateObj.getDay()]}
                      </div>
                      <div className="font-extrabold text-sm">{dia}</div>
                      {esFeriado && (
                        <div className="text-[9px] text-amber-600 dark:text-amber-400 font-bold">Fer</div>
                      )}
                    </th>
                  )
                })}
                <th className="p-1.5 sm:p-2 text-center sticky right-0 z-20 bg-slate-100 dark:bg-slate-950 border-l border-slate-200 dark:border-slate-800 font-bold text-slate-800 dark:text-slate-200 min-w-[78px] sm:min-w-[88px]">
                  {modoVista === 'semana' ? 'Sem / Mes' : 'Total hs'}
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
              {vigiladoresMostrados.map((vig) => {
                const totales = calcularTotalesVigilador(vig.id)

                return (
                  <tr
                    key={vig.id}
                    className="hover:bg-blue-50/40 dark:hover:bg-blue-950/20 transition-colors"
                  >
                    {/* Columna Vigilador Sticky */}
                    <td className="p-2 sm:p-2.5 sticky left-0 z-10 bg-white dark:bg-[#0C121E] border-r border-slate-200 dark:border-slate-800 shadow-xs">
                      <div className="font-bold text-slate-900 dark:text-white leading-tight truncate">
                        {vig.apellido}, {vig.nombre.charAt(0)}.
                      </div>
                      <div className="text-[10px] text-slate-400 truncate max-w-[105px]">
                        {vig.email.split('@')[0]}
                      </div>
                    </td>

                    {/* Celdas de Días Editables */}
                    {diasVisibles.map((dia) => {
                      const diaStr = dia < 10 ? `0${dia}` : `${dia}`
                      const fecha = `${mesSeleccionado}-${diaStr}`
                      const turno = turnos.find(
                        (t) => t.id_vigilador === vig.id && t.id_objetivo === objetivoSeleccionado && t.fecha === fecha
                      )

                      return (
                        <td
                          key={dia}
                          onClick={() => abrirEditarCelda(vig.id, `${vig.nombre} ${vig.apellido}`, dia)}
                          className="p-0.5 text-center border-r border-slate-200 dark:border-slate-800/40 cursor-pointer hover:bg-blue-100 dark:hover:bg-blue-900/40 transition-colors select-none group"
                          title="Clic para modificar turno"
                        >
                          <div className="h-7 flex items-center justify-center rounded-md group-hover:scale-105 transition-transform text-xs">
                            {obtenerEtiquetaTurno(turno)}
                          </div>
                        </td>
                      )
                    })}

                    {/* Columna Totales y Meta Sticky */}
                    <td className="p-1.5 text-center sticky right-0 z-10 bg-white dark:bg-[#0C121E] border-l border-slate-200 dark:border-slate-800 shadow-xs">
                      <div className="flex flex-col items-center justify-center gap-0.5">
                        {modoVista === 'semana' ? (
                          <>
                            <span className="font-bold text-blue-600 dark:text-blue-400 text-xs">
                              {totales.horasSemana} hs sem
                            </span>
                            <span className="text-[10px] text-slate-500 dark:text-slate-400">
                              Total: {totales.horasTotales} hs
                            </span>
                          </>
                        ) : (
                          <>
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
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                )
              })}

              {/* Fila Total Diario del Servicio */}
              <tr className="bg-slate-100/90 dark:bg-slate-950/90 font-bold border-t-2 border-slate-300 dark:border-slate-700 text-[11px]">
                <td className="p-2 sm:p-2.5 sticky left-0 z-10 bg-slate-100 dark:bg-slate-950 border-r border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200">
                  Total Día
                </td>
                {diasVisibles.map((dia) => {
                  const total = calcularTotalDiario(dia)
                  return (
                    <td
                      key={dia}
                      className="p-0.5 text-center border-r border-slate-200 dark:border-slate-800/40 text-blue-600 dark:text-blue-400 font-mono"
                    >
                      {total}h
                    </td>
                  )
                })}
                <td className="p-2 text-center sticky right-0 z-10 bg-slate-100 dark:bg-slate-950 border-l border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300">
                  Total
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

      {/* Modal Generador Automático de Diagramas (Sección 28) */}
      <Dialogo
        abierto={modalGeneradorAbierto}
        alCerrar={() => setModalGeneradorAbierto(false)}
        titulo="Generador Automático de Diagramas"
        subtitulo="Diagramación automática configurable (ej. 4x3) para todo el mes con posterior edición manual (Sección 28)."
        icono={<Wand2 className="w-5 h-5 text-blue-500" />}
        tamano="medio"
      >
        <div className="space-y-4">
          <div>
            <Etiqueta requerido>Vigilador a Diagramar</Etiqueta>
            <select
              value={vigiladorDiagrama}
              onChange={(e) => setVigiladorDiagrama(e.target.value)}
              className="w-full min-h-[46px] rounded-xl bg-white dark:bg-[#0A0F1A] border border-slate-300 dark:border-slate-700/80 px-3 py-2.5 text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all cursor-pointer"
            >
              {vigiladores.map((v) => (
                <option key={v.id} value={v.id}>
                  {v.nombre} {v.apellido} ({v.email})
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Etiqueta requerido>Esquema de Rotación</Etiqueta>
              <select
                value={patronDiagrama}
                onChange={(e) => setPatronDiagrama(e.target.value as typeof patronDiagrama)}
                className="w-full min-h-[46px] rounded-xl bg-white dark:bg-[#0A0F1A] border border-slate-300 dark:border-slate-700/80 px-3 py-2.5 text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all cursor-pointer"
              >
                <option value="4x3">4x3 (4 trabajados, 3 francos)</option>
                <option value="4x2">4x2 (4 trabajados, 2 francos)</option>
                <option value="2x2">2x2 (2 trabajados, 2 francos)</option>
                <option value="6x1">6x1 (6 trabajados, 1 franco)</option>
              </select>
            </div>

            <div>
              <Etiqueta requerido>Turno Predeterminado</Etiqueta>
              <select
                value={tipoGuardiaDiagrama}
                onChange={(e) => setTipoGuardiaDiagrama(e.target.value as typeof tipoGuardiaDiagrama)}
                className="w-full min-h-[46px] rounded-xl bg-white dark:bg-[#0A0F1A] border border-slate-300 dark:border-slate-700/80 px-3 py-2.5 text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all cursor-pointer"
              >
                <option value="nocturno">12🌙 Nocturno (19:00 - 07:00)</option>
                <option value="diurno">12☀️ Diurno (07:00 - 19:00)</option>
              </select>
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900/40 text-xs text-blue-700 dark:text-blue-300 space-y-1">
            <p className="font-bold">Regla de Diagramación Oficial (Sección 28):</p>
            <p>
              El generador poblará el mes con el patrón seleccionado calculando nocturnidad y feriados. Podrás ajustar manualmente cualquier celda con un solo clic.
            </p>
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200 dark:border-slate-800">
            <Boton type="button" variante="secundario" onClick={() => setModalGeneradorAbierto(false)}>
              Cancelar
            </Boton>
            <Boton type="button" variante="primario" onClick={aplicarGeneradorDiagrama}>
              Aplicar Diagrama al Mes
            </Boton>
          </div>
        </div>
      </Dialogo>
    </div>
  )
}
