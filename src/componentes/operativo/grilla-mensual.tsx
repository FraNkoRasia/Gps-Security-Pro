import React, { useEffect, useState } from 'react'
import {
  Download,
  Edit3,
  ChevronLeft,
  ChevronRight,
  Wand2,
  Settings2,
} from 'lucide-react'
import { GestionTiposTurno } from '@/componentes/operativo/gestion-tipos-turno'
import { Tarjeta } from '@/componentes/ui/tarjeta'
import { Boton } from '@/componentes/ui/boton'
import { Dialogo } from '@/componentes/ui/dialogo'
import { Etiqueta } from '@/componentes/ui/etiqueta'
import { useOperativo } from '@/contextos/contexto-operativo'
import type { Turno } from '@/tipos'

export const GrillaMensual: React.FC<{ objetivoInicial?: string; soloLectura?: boolean }> = ({ objetivoInicial = '', soloLectura = false }) => {
  const { objetivos, vigiladores, asignaciones, turnos, tiposTurno, asignarTurnoGrilla } = useOperativo()
  const [objetivoSeleccionado] = useState(objetivoInicial)
  const objetivoActual = objetivos.find((objetivo) => objetivo.id === objetivoSeleccionado)

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
  const [modalTiposTurnoAbierto, setModalTiposTurnoAbierto] = useState(false)
  const [vigiladorDiagrama, setVigiladorDiagrama] = useState('')

  const [patronDiagrama, setPatronDiagrama] = useState<'4x3' | '4x2' | '2x2' | '6x1'>('4x3')
  const [tipoTurnoDiagrama, setTipoTurnoDiagrama] = useState('')

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

  const aplicarCodigoTurno = (codigo: string, idTipoTurno?: string) => {
    if (!celdaEditando) return

    const objId = objetivoSeleccionado || celdaEditando.turnoActual?.id_objetivo || ''
    if (!objId) return

    asignarTurnoGrilla({
      id_vigilador: celdaEditando.idVigilador,
      id_objetivo: objId,
      fecha: celdaEditando.fecha,
      codigo,
      id_tipo_turno: idTipoTurno || null
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
    const tipoSeleccionado = tiposTurno.find(t => t.id === tipoTurnoDiagrama && t.activo)
    const codigoGuardia = tipoSeleccionado?.abreviatura || '12🌙'

    for (let d = 1; d <= totalDiasMes; d++) {
      const posCiclo = (d - 1) % cicloTotal
      const diaStr = d < 10 ? `0${d}` : `${d}`
      const fecha = `${mesSeleccionado}-${diaStr}`

      if (posCiclo < diasTrabajo) {
        asignarTurnoGrilla({
          id_vigilador: vigiladorDiagrama,
          id_objetivo: objId,
          fecha,
          codigo: codigoGuardia,
          id_tipo_turno: tipoSeleccionado?.id || null
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
      (t) => t.id_vigilador === idVig && t.id_objetivo === objetivoSeleccionado && t.fecha.startsWith(mesSeleccionado)
    )

    const horasTotales = turnosVig.reduce((acc, t) => acc + t.horas_totales + t.horas_extra, 0)
    const horasDiurnas = turnosVig.reduce((acc, t) => acc + t.horas_diurnas, 0)
    const horasNocturnas = turnosVig.reduce((acc, t) => acc + t.horas_nocturnas, 0)
    const francos = turnosVig.filter((t) => t.tipo === 'franco').length

    // Horas en la semana activa
    const horasSemana = turnosVig
      .filter((t) => {
        const d = Number(t.fecha.split('-')[2])
        return d >= semanaActualData.inicio && d <= semanaActualData.fin
      })
      .reduce((acc, t) => acc + t.horas_totales + t.horas_extra, 0)

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
    return turnosDia.reduce((acc, t) => acc + t.horas_totales + t.horas_extra, 0)
  }

  const obtenerEtiquetaTurno = (t?: Turno) => {
    if (!t) return <span className="text-slate-600 dark:text-slate-700">-</span>
    if (t.tipo === 'franco') {
      return <span className="text-slate-300 font-extrabold text-xs">F</span>
    }
    if (t.tipo === 'nocturno') {
      return (
        <span className="font-extrabold flex flex-col items-center justify-center leading-none gap-0.5 text-blue-400">
          <span className="text-[11px]">{t.horas_totales}</span>
          <span className="text-[11px] leading-none" aria-label="Nocturno">🌙</span>
        </span>
      )
    }
    if (t.tipo === 'diurno') {
      return (
        <span className="font-extrabold flex flex-col items-center justify-center leading-none gap-0.5 text-amber-400">
          <span className="text-[11px]">{t.horas_totales}</span>
          <span className="text-[11px] leading-none" aria-label="Diurno">☀️</span>
        </span>
      )
    }
    const personalizado = t.id_tipo_turno ? tiposTurno.find((x) => x.id === t.id_tipo_turno) : null
    return <span className="text-emerald-400 font-extrabold flex flex-col items-center justify-center leading-none gap-0.5"><span className="text-[10px]">{personalizado?.abreviatura || t.horas_totales}</span><span className="text-[8px] text-slate-400">{personalizado?.nombre || 'Especial'}</span></span>
  }

  const descargarGrilla = () => {
    if (!objetivoSeleccionado) return

    const ventana = window.open('', '_blank')
    if (!ventana) {
      window.alert('El navegador bloqueó la ventana de impresión. Permití las ventanas emergentes e intentá nuevamente.')
      return
    }

    const escaparHtml = (valor: string) => valor
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;')
    const [anio, numeroMes] = mesSeleccionado.split('-').map(Number)
    const fechaMes = new Date(anio, numeroMes - 1, 1)
    const nombreMes = new Intl.DateTimeFormat('es-AR', { month: 'long', year: 'numeric' }).format(fechaMes)
    const quincenas = [
      { titulo: 'Primera quincena', inicio: 1, fin: 15 },
      { titulo: 'Segunda quincena', inicio: 16, fin: totalDiasMes }
    ]

    const paginas = quincenas.map((quincena) => {
      const dias = Array.from(
        { length: quincena.fin - quincena.inicio + 1 },
        (_, indice) => quincena.inicio + indice
      )
      const encabezados = dias.map((dia) => {
        const fecha = new Date(anio, numeroMes - 1, dia)
        const diaSemana = new Intl.DateTimeFormat('es-AR', { weekday: 'short' }).format(fecha)
        const finDeSemana = fecha.getDay() === 0 || fecha.getDay() === 6
        return `<th class="${finDeSemana ? 'fin-de-semana' : ''}"><span>${escaparHtml(diaSemana)}</span><strong>${dia}</strong></th>`
      }).join('')
      const filas = vigiladoresMostrados.map((vigilador) => {
        const celdas = dias.map((dia) => {
          const fecha = `${mesSeleccionado}-${String(dia).padStart(2, '0')}`
          const turno = turnos.find((item) =>
            item.id_vigilador === vigilador.id &&
            item.id_objetivo === objetivoSeleccionado &&
            item.fecha === fecha
          )
          if (!turno) return '<td class="sin-turno">—</td>'

          const tipoPersonalizado = turno.id_tipo_turno
            ? tiposTurno.find((tipo) => tipo.id === turno.id_tipo_turno)
            : undefined
          const codigoBase = turno.tipo === 'franco'
            ? 'F'
            : tipoPersonalizado?.abreviatura || `${turno.horas_totales}h`
          const codigoSinIconos = codigoBase.replace(/[☀🌙]/g, '').replace(/\uFE0F/g, '').trim()
          const codigo = codigoSinIconos || `${turno.horas_totales}h`
          const iconoTurno = turno.tipo === 'diurno'
            ? '☀️'
            : turno.tipo === 'nocturno'
              ? '🌙'
              : turno.tipo === 'franco'
                ? '🛌'
                : '◆'
          const extra = turno.horas_extra > 0 ? `<small>+${turno.horas_extra}h extra</small>` : ''
          const claseTurno = turno.tipo === 'diurno'
            ? 'turno-diurno'
            : turno.tipo === 'nocturno'
              ? 'turno-nocturno'
              : turno.tipo === 'franco'
                ? 'turno-franco'
                : 'turno-especial'
          return `<td><span class="turno-casillero ${claseTurno}"><strong>${escaparHtml(codigo)}</strong><span class="icono-turno">${iconoTurno}</span></span>${extra}</td>`
        }).join('')
        const horasQuincena = turnos
          .filter((turno) => {
            const dia = Number(turno.fecha.slice(8, 10))
            return turno.id_vigilador === vigilador.id &&
              turno.id_objetivo === objetivoSeleccionado &&
              turno.fecha.startsWith(mesSeleccionado) &&
              dia >= quincena.inicio && dia <= quincena.fin
          })
          .reduce((total, turno) => total + turno.horas_totales + turno.horas_extra, 0)

        return `<tr><th scope="row">${escaparHtml(`${vigilador.apellido}, ${vigilador.nombre}`)}</th>${celdas}<td class="total">${horasQuincena} hs</td></tr>`
      }).join('')
      const filasVacias = vigiladoresMostrados.length === 0
        ? `<tr><td colspan="${dias.length + 2}" class="vacio">No hay vigiladores asignados a este objetivo.</td></tr>`
        : filas
      const totalesDiarios = dias.map((dia) => `<td>${calcularTotalDiario(dia)}h</td>`).join('')

      return `<section class="quincena"><header><h2>${quincena.titulo}</h2><p>${quincena.inicio} al ${quincena.fin} de ${escaparHtml(nombreMes)}</p></header><table><thead><tr><th>Vigilador</th>${encabezados}<th>Horas</th></tr></thead><tbody>${filasVacias}</tbody><tfoot><tr><th>Total Día</th>${totalesDiarios}<td>Total</td></tr></tfoot></table></section>`
    }).join('')

    ventana.opener = null
    ventana.document.open()
    ventana.document.write(`<!doctype html><html lang="es"><head><meta charset="utf-8"><title>Grilla ${escaparHtml(objetivoActual?.nombre || 'objetivo')} - ${escaparHtml(nombreMes)}</title><style>
      @page { size: 297mm 210mm; margin: 8mm; }
      * { box-sizing: border-box; }
      body { margin: 0; color: #0f172a; font-family: Arial, sans-serif; }
      body { height: 194mm; display: flex; flex-direction: column; }
      .titulo { flex: none; display: flex; justify-content: space-between; align-items: center; margin: 0 0 2mm; padding: 0 1mm 2mm; border-bottom: 2px solid #2563eb; }
      .titulo h1 { margin: 1px 0; font-size: 17px; font-weight: 800; }
      .marca { color: #2563eb; font-size: 7px; font-weight: 800; letter-spacing: 1px; }
      .titulo p { margin: 0; font-size: 9px; color: #475569; }
      .mes { padding: 5px 9px; border: 1px solid #93c5fd; border-radius: 7px; color: #1d4ed8; background: #eff6ff; font-size: 10px; text-transform: capitalize; }
      .quincena { flex: 1 1 0; min-height: 0; overflow: hidden; display: flex; flex-direction: column; }
      .quincena + .quincena { margin-top: 2mm; }
      .quincena header { flex: none; display: flex; justify-content: space-between; align-items: center; margin-bottom: 1mm; padding: 1mm 2mm; border-left: 3px solid #2563eb; border-radius: 0 5px 5px 0; background: #eff6ff; }
      h2 { margin: 0; color: #1e3a8a; font-size: 11px; font-weight: 800; }
      .quincena header p { margin: 0; color: #475569; font-size: 8px; }
      table { flex: 1 1 auto; width: 100%; height: 100%; border-collapse: separate; border-spacing: 0; table-layout: fixed; font-size: 8px; }
      th, td { border-right: 1px solid #cbd5e1; border-bottom: 1px solid #cbd5e1; padding: 1px; text-align: center; overflow-wrap: anywhere; line-height: 1.1; }
      thead th { border-top: 1px solid #94a3b8; background: #e2e8f0; color: #334155; }
      thead th:first-child, tbody th:first-child, tfoot th:first-child { border-left: 1px solid #94a3b8; }
      thead th:first-child { border-radius: 6px 0 0 0; }
      thead th:last-child { border-radius: 0 6px 0 0; }
      thead th:first-child, tbody th { width: 20%; text-align: left; }
      thead th:last-child, tbody td:last-child, tfoot td:last-child { width: 7%; font-weight: 700; }
      thead th span, thead th strong { display: block; }
      thead th span { font-size: 7px; font-weight: 600; }
      thead th strong { font-size: 10px; }
      thead th.fin-de-semana { background: #dbeafe; color: #1e40af; }
      tbody th { padding-left: 2mm; background: #f8fafc; font-size: 8px; font-weight: 700; }
      .turno-casillero { min-height: 23px; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 1px; border: 1.5px solid; border-radius: 6px; font-size: 8px; line-height: 1; }
      .turno-casillero strong { font-size: 8px; }
      .icono-turno { font-size: 9px; }
      td small { display: block; margin-top: 1px; color: #047857; font-size: 6px; font-weight: 700; }
      .turno-casillero.turno-diurno { border-color: #f59e0b; background: #fef3c7; color: #92400e; }
      .turno-casillero.turno-nocturno { border-color: #3b82f6; background: #dbeafe; color: #1e40af; }
      .turno-casillero.turno-franco { border-color: #22c55e; background: #dcfce7; color: #166534; }
      .turno-casillero.turno-especial { border-color: #8b5cf6; background: #ede9fe; color: #5b21b6; }
      tfoot th, tfoot td { border-top: 2px solid #64748b; background: #f1f5f9; color: #1e293b; font-weight: 800; }
      tfoot th { border-radius: 0 0 0 5px; text-align: left; }
      tfoot td { color: #1d4ed8; font-family: Arial, sans-serif; }
      tfoot td:last-child { border-radius: 0 0 5px 0; }
      .vacio { padding: 3px; color: #475569; }
      @media print {
        * { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
        thead { display: table-header-group; }
        tr { break-inside: avoid; }
      }
    </style></head><body><header class="titulo"><div><span class="marca">GPS SECURITY PRO</span><h1>Grilla de turnos</h1><p>${escaparHtml(objetivoActual?.nombre || 'Objetivo')}</p></div><strong class="mes">${escaparHtml(nombreMes)}</strong></header>${paginas}</body></html>`)
    ventana.document.close()
    ventana.focus()
    window.setTimeout(() => ventana.print(), 250)
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

          {!soloLectura && (
            <div className="flex items-center gap-2">
              <Boton
                type="button"
                variante="secundario"
                tamano="chico"
                onClick={() => { const primero = tiposTurno.find(t => (t.id_objetivo === objetivoSeleccionado || t.id_objetivo === null) && t.activo); setTipoTurnoDiagrama(primero?.id || ''); setModalGeneradorAbierto(true)  }}
                icono={<Wand2 className="w-3.5 h-3.5 text-blue-500" />}
              >
                Generar Diagrama
              </Boton>
              <Boton
                type="button"
                variante="secundario"
                tamano="chico"
                onClick={descargarGrilla}
                icono={<Download className="w-3.5 h-3.5 text-blue-500" />}
              >
                Descargar Grilla
              </Boton>
            </div>
          )}
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
      <Tarjeta className="overflow-hidden rounded-2xl border-slate-200 dark:border-slate-800">
        <div className="overflow-x-auto max-w-full scrollbar-thin">
          <table className="w-max min-w-full text-xs text-left border-separate border-spacing-0 bg-white dark:bg-[#0C121E]">
            <thead>
              <tr className="bg-slate-100 dark:bg-slate-950/80 border-b border-slate-200 dark:border-slate-800 text-[11px] select-none">
                <th className="p-2.5 sm:p-3 sticky left-0 z-20 bg-[#0C121E] border-r border-slate-800 font-bold text-white w-[120px] min-w-[120px] sm:w-32 sm:min-w-[128px] rounded-tl-xl">
                  Vigilador
                </th>
                {diasVisibles.map((dia) => {
                  const dateObj = new Date(2026, 9, dia)
                  const esFinDeSemana = dateObj.getDay() === 0 || dateObj.getDay() === 6
                  const esFeriado = dia === 12
                  return (
                    <th
                      key={dia}
                      className={`p-1.5 text-center border-r border-slate-800/80 font-semibold bg-[#0C121E] ${
                        modoVista === 'semana' ? 'min-w-[36px] max-w-[36px]' : 'min-w-[30px] max-w-[30px]'
                      } ${
                        esFeriado
                          ? 'bg-amber-100/70 dark:bg-amber-950/50 text-amber-700 dark:text-amber-300'
                          : esFinDeSemana
                          ? 'bg-slate-200/50 dark:bg-slate-900/60 text-slate-700 dark:text-slate-300'
                          : 'text-slate-600 dark:text-slate-400'
                      }`}
                    >
                      <div className="text-[10px] leading-tight opacity-75 font-semibold">
                        <span className="sm:hidden">
                          {['Do', 'Lu', 'Ma', 'Mi', 'Ju', 'Vi', 'Sá'][dateObj.getDay()]}
                        </span>
                        <span className="hidden sm:inline">
                          {['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'][dateObj.getDay()]}
                        </span>
                      </div>
                      <div className="font-extrabold text-sm">{dia}</div>
                      {esFeriado && (
                        <div className="text-[9px] text-amber-600 dark:text-amber-400 font-bold">Fer</div>
                      )}
                    </th>
                  )
                })}
                <th className="p-1.5 sm:p-2 text-center bg-slate-100 dark:bg-slate-950 border-l border-slate-200 dark:border-slate-800 font-bold text-slate-800 dark:text-slate-200 min-w-[78px] sm:min-w-[88px]">
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
                    <td className="p-2 sm:p-2.5 sticky left-0 z-10 bg-[#0C121E] border-r border-slate-800 shadow-xs">
                      <div className="font-bold text-slate-900 dark:text-white leading-tight truncate">
                        {vig.apellido}, {vig.nombre.charAt(0)}.
                      </div>
                      <div className="text-[10px] text-blue-600 dark:text-blue-400 font-semibold truncate max-w-[105px]">
                        <span className="sm:hidden">{totales.horasSemana}h sem</span>
                        <span className="hidden sm:inline text-slate-400 font-normal">{vig.email.split('@')[0]}</span>
                      </div>
                    </td>

                    {/* Celdas de Días Editables */}
                    {diasVisibles.map((dia) => {
                      const diaStr = dia < 10 ? `0${dia}` : `${dia}`
                      const fecha = `${mesSeleccionado}-${diaStr}`
                      const turno = turnos.find(
                        (t) => t.id_vigilador === vig.id && t.id_objetivo === objetivoSeleccionado && t.fecha === fecha
                      )
                      const horasExtra = turno?.horas_extra ?? 0

                      return (
                        <td
                          key={dia}
                          onClick={() => !soloLectura && abrirEditarCelda(vig.id, `${vig.nombre} ${vig.apellido}`, dia)}
                          className={`p-1 text-center border-r border-slate-800/70 transition-colors select-none group bg-[#0C121E] ${soloLectura ? '' : 'cursor-pointer hover:bg-slate-800/80'}`}
                          title={soloLectura ? 'Turno programado' : 'Clic para modificar turno'}
                        >
                          <div
                            className={`h-10 sm:h-7 min-w-[38px] sm:min-w-0 flex items-center justify-center rounded-lg border transition-transform group-hover:scale-105 ${
                              !turno
                                ? 'border-transparent'
                                : turno.tipo === 'franco'
                                ? 'bg-slate-800/40 dark:bg-slate-800/70 border-slate-500/40'
                                : turno.tipo === 'diurno'
                                ? 'bg-amber-500/10 border-amber-500/70 dark:bg-amber-950/50'
                                : turno.tipo === 'nocturno'
                                ? 'bg-blue-500/10 border-blue-500/70 dark:bg-blue-950/50'
                                : 'bg-emerald-500/10 border-emerald-500/60 dark:bg-emerald-950/40'
                            }`}
                          >
                            {obtenerEtiquetaTurno(turno)}{horasExtra > 0 && <span className="text-[8px] font-bold text-emerald-400">+{horasExtra}h extra</span>}
                          </div>
                        </td>
                      )
                    })}

                    {/* Columna Totales y Meta Sticky */}
                    <td className="p-1.5 text-center bg-white dark:bg-[#0C121E] border-l border-slate-200 dark:border-slate-800 shadow-xs">
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
                <td className="p-2 sm:p-2.5 sticky left-0 z-10 bg-[#101827] border-r border-slate-800 text-slate-200">
                  Total Día
                </td>
                {diasVisibles.map((dia) => {
                  const total = calcularTotalDiario(dia)
                  return (
                    <td
                      key={dia}
                      className="p-1 text-center border-r border-slate-800/70 text-blue-400 font-mono bg-[#101827]"
                    >
                      {total}h
                    </td>
                  )
                })}
                <td className="p-2 text-center bg-slate-100 dark:bg-slate-950 border-l border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300">
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

          <div className="space-y-3">
            <div className="flex items-center justify-between gap-2">
              <p className="text-xs text-slate-500 dark:text-slate-400">Seleccioná un atajo configurado para este objetivo.</p>
              <Boton variante="secundario" tamano="chico" onClick={()=>setModalTiposTurnoAbierto(true)} icono={<Settings2 className="w-3.5 h-3.5"/>}>Gestionar atajos</Boton>
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs">
              {tiposTurno.filter(t=>(t.id_objetivo===objetivoSeleccionado||t.id_objetivo===null)&&t.activo).map(t=>{const icono=t.tipo==='diurno'?'☀️':t.tipo==='nocturno'?'🌙':t.tipo==='franco'?'🛌':'🔹';const nombre=t.tipo==='franco'?'Franco':`${t.horas}Hs ${t.tipo==='diurno'?'Diurno':t.tipo==='nocturno'?'Nocturno':t.tipo==='mixto'?'Mixto':'Especial'}`;return <button key={t.id} type="button" onClick={()=>aplicarCodigoTurno(t.abreviatura,t.id)} className="p-3 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-300 dark:border-slate-800 hover:scale-102 transition-all text-left cursor-pointer"><div className="font-bold text-slate-800 dark:text-slate-200">{icono} {nombre}</div><div className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">{t.hora_inicio&&t.hora_fin?`${t.hora_inicio} → ${t.hora_fin}`:`${t.horas} hs`}</div></button>})}
              {tiposTurno.filter(t=>(t.id_objetivo===objetivoSeleccionado||t.id_objetivo===null)&&t.activo).length===0&&<div className="col-span-2 rounded-xl border border-dashed border-slate-300 dark:border-slate-700 p-5 text-center text-xs text-slate-500">No hay atajos configurados. Creá uno para comenzar.</div>}{tiposTurno.filter(t=>(t.id_objetivo===objetivoSeleccionado||t.id_objetivo===null)&&t.activo).length===0&&<><button type="button" onClick={()=>aplicarCodigoTurno('12☀️')} className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-800 text-left cursor-pointer"><div className="font-bold text-amber-700 dark:text-amber-400">12☀️ — Diurno</div><div className="text-[11px] text-slate-500 mt-1">07:00 → 19:00 • 12 hs</div></button><button type="button" onClick={()=>aplicarCodigoTurno('12🌙')} className="p-3 rounded-xl bg-blue-50 dark:bg-blue-950/40 border border-blue-300 dark:border-blue-800 text-left cursor-pointer"><div className="font-bold text-blue-600 dark:text-blue-400">12🌙 — Nocturno</div><div className="text-[11px] text-slate-500 mt-1">19:00 → 07:00 • 12 hs</div></button><button type="button" onClick={()=>aplicarCodigoTurno('10')} className="p-3 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-300 dark:border-slate-800 text-left cursor-pointer"><div className="font-bold">10 — Especial</div><div className="text-[11px] text-slate-500 mt-1">08:00 → 18:00 • 10 hs</div></button><button type="button" onClick={()=>aplicarCodigoTurno('8')} className="p-3 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-300 dark:border-slate-800 text-left cursor-pointer"><div className="font-bold">8 — Estándar</div><div className="text-[11px] text-slate-500 mt-1">08:00 → 16:00 • 8 hs</div></button><button type="button" onClick={()=>aplicarCodigoTurno('F')} className="p-3 rounded-xl bg-slate-200/70 dark:bg-slate-800/80 border border-slate-300 dark:border-slate-700 text-left cursor-pointer"><div className="font-bold">F — Franco</div><div className="text-[11px] text-slate-500 mt-1">0 hs</div></button></>}
              <button type="button" onClick={()=>aplicarCodigoTurno('borrar')} className="p-3 rounded-xl bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900/60 text-left cursor-pointer"><div className="font-bold text-red-600 dark:text-red-400">Borrar Guardia</div><div className="text-[11px] text-slate-500 mt-1">Dejar sin turno asignado</div></button>
            </div>
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

      {modalTiposTurnoAbierto && <GestionTiposTurno objetivoId={objetivoSeleccionado} alCerrar={()=>setModalTiposTurnoAbierto(false)} />}

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
                value={tipoTurnoDiagrama}
                onChange={(e) => setTipoTurnoDiagrama(e.target.value)}
                className="w-full min-h-[46px] rounded-xl bg-white dark:bg-[#0A0F1A] border border-slate-300 dark:border-slate-700/80 px-3 py-2.5 text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all cursor-pointer"
              >
                {tiposTurno.filter(t => (t.id_objetivo === objetivoSeleccionado || t.id_objetivo === null) && t.activo).map(t => <option key={t.id} value={t.id}>{t.abreviatura} — {t.nombre} ({t.horas} hs)</option>)}
                {tiposTurno.filter(t => (t.id_objetivo === objetivoSeleccionado || t.id_objetivo === null) && t.activo).length === 0 && <option value="">12🌙 Nocturno (19:00 - 07:00)</option>}
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
