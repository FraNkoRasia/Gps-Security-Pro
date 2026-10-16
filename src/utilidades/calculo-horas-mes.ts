import type { Turno } from '@/tipos'

export interface ResumenHorasMes {
  horasTurno: number
  horasDiurnas: number
  horasNocturnas: number
  horasExtra: number
  turnosFinalizados: Turno[]
}

export const obtenerIntervaloTurno = (turno: Pick<Turno, 'fecha' | 'hora_inicio' | 'hora_fin'>) => {
  const [anio, mes, dia] = turno.fecha.split('-').map(Number)
  const [horaInicio, minutoInicio] = turno.hora_inicio.slice(0, 5).split(':').map(Number)
  const [horaFin, minutoFin] = turno.hora_fin.slice(0, 5).split(':').map(Number)
  const inicio = new Date(anio, mes - 1, dia, horaInicio || 0, minutoInicio || 0, 0, 0)
  let fin = new Date(anio, mes - 1, dia, horaFin || 0, minutoFin || 0, 0, 0)
  if (fin.getTime() <= inicio.getTime()) fin = new Date(fin.getTime() + 24 * 60 * 60 * 1000)
  return { inicio, fin }
}

export const eliminarTurnosDuplicados = (turnos: Turno[]) => {
  const ids = new Set<string>()
  const clavesHorario = new Set<string>()
  // Si hay un duplicado reemplazado y otro vigente, conservar el vigente.
  const ordenados = [...turnos].sort((a, b) => Number(a.estado === 'reemplazado' || a.estado === 'ausente') - Number(b.estado === 'reemplazado' || b.estado === 'ausente'))
  return ordenados.filter(turno => {
    if (ids.has(turno.id)) return false
    ids.add(turno.id)
    const clave = [turno.id_empresa, turno.id_vigilador, turno.id_objetivo, turno.fecha, turno.hora_inicio.slice(0, 5), turno.hora_fin.slice(0, 5)].join('|')
    if (clavesHorario.has(clave)) return false
    clavesHorario.add(clave)
    return true
  })
}

export const turnoFinalizado = (turno: Pick<Turno, 'fecha' | 'hora_inicio' | 'hora_fin'>, ahora = new Date()) =>
  obtenerIntervaloTurno(turno).fin.getTime() <= ahora.getTime()

const obtenerLimitesMes = (mes: string) => {
  const [anio, numeroMes] = mes.split('-').map(Number)
  return {
    inicio: new Date(anio, numeroMes - 1, 1, 0, 0, 0, 0),
    fin: new Date(anio, numeroMes, 1, 0, 0, 0, 0),
  }
}

export const turnoSeSuperponeConMes = (
  turno: Pick<Turno, 'fecha' | 'hora_inicio' | 'hora_fin' | 'tipo'>,
  mes: string
) => {
  if (turno.tipo === 'franco') return turno.fecha.startsWith(mes)
  const { inicio, fin } = obtenerIntervaloTurno(turno)
  const limites = obtenerLimitesMes(mes)
  return inicio < limites.fin && fin > limites.inicio
}

export const obtenerHorasProgramadasEnMes = (turno: Turno, mes: string) => {
  if (turno.tipo === 'franco' || turno.horas_totales <= 0 || turno.estado === 'reemplazado') return 0
  const { inicio, fin } = obtenerIntervaloTurno(turno)
  const limites = obtenerLimitesMes(mes)
  const inicioMes = Math.max(inicio.getTime(), limites.inicio.getTime())
  const finMes = Math.min(fin.getTime(), limites.fin.getTime())
  return Math.max(0, finMes - inicioMes) / 3600000
}

export const obtenerResumenHorasMes = (turnos: Turno[], mes: string, ahora = new Date()): ResumenHorasMes => {
  const limites = obtenerLimitesMes(mes)
  const resumen: ResumenHorasMes = { horasTurno: 0, horasDiurnas: 0, horasNocturnas: 0, horasExtra: 0, turnosFinalizados: [] }

  for (const turno of eliminarTurnosDuplicados(turnos)) {
    if (turno.tipo === 'franco' || turno.estado === 'reemplazado' || turno.estado === 'ausente' || turno.horas_totales <= 0) continue

    const { inicio, fin } = obtenerIntervaloTurno(turno)
    // No se contabilizan turnos futuros ni turnos que todavía están en curso.
    if (fin.getTime() > ahora.getTime()) continue
    const inicioMes = new Date(Math.max(inicio.getTime(), limites.inicio.getTime()))
    const finMes = new Date(Math.min(fin.getTime(), limites.fin.getTime()))
    if (finMes.getTime() <= inicioMes.getTime()) continue

    let minutosDiurnos = 0
    let minutosNocturnos = 0
    for (let cursor = inicioMes.getTime(); cursor < finMes.getTime(); cursor += 60000) {
      const hora = new Date(cursor).getHours()
      if (hora >= 21 || hora < 6) minutosNocturnos++
      else minutosDiurnos++
    }

    resumen.horasDiurnas += minutosDiurnos / 60
    resumen.horasNocturnas += minutosNocturnos / 60
    resumen.horasTurno += (minutosDiurnos + minutosNocturnos) / 60
    resumen.turnosFinalizados.push(turno)

    // horas_extra ya representa minutos aprobados convertidos a horas en contexto-operativo.
    // Se suma una vez y al mes en que finalizó el turno, sin incorporarla al desglose diurno/nocturno.
    if (fin >= limites.inicio && fin < limites.fin) resumen.horasExtra += Number(turno.horas_extra || 0)
  }
  return resumen
}

export const obtenerMesesDeTurnos = (turnos: Turno[]) => {
  const meses = new Set<string>()
  for (const turno of turnos) {
    const { inicio, fin } = obtenerIntervaloTurno(turno)
    const cursor = new Date(inicio.getFullYear(), inicio.getMonth(), 1)
    const ultimo = new Date(fin.getFullYear(), fin.getMonth(), 1)
    while (cursor <= ultimo) {
      meses.add(`${cursor.getFullYear()}-${String(cursor.getMonth() + 1).padStart(2, '0')}`)
      cursor.setMonth(cursor.getMonth() + 1)
    }
  }
  return Array.from(meses).sort((a, b) => b.localeCompare(a))
}
