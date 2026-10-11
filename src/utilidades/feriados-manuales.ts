const claveAlmacenamiento = 'gsp-feriados-manuales-v1'

type FeriadosPorObjetivo = Record<string, string[]>

const leerFeriados = (): FeriadosPorObjetivo => {
  if (typeof window === 'undefined') return {}
  try {
    const valor = window.localStorage.getItem(claveAlmacenamiento)
    const datos = valor ? JSON.parse(valor) as unknown : {}
    if (!datos || typeof datos !== 'object' || Array.isArray(datos)) return {}
    return datos as FeriadosPorObjetivo
  } catch {
    return {}
  }
}

export const cargarFeriadosManuales = (idEmpresa: string, idObjetivo: string) => {
  const feriados = leerFeriados()[`${idEmpresa}:${idObjetivo}`]
  return Array.isArray(feriados) ? feriados.filter((fecha) => /^\d{4}-\d{2}-\d{2}$/.test(fecha)) : []
}

export const guardarFeriadosManuales = (idEmpresa: string, idObjetivo: string, fechas: string[]) => {
  if (typeof window === 'undefined') return
  try {
    const datos = leerFeriados()
    const clave = `${idEmpresa}:${idObjetivo}`
    if (fechas.length) datos[clave] = fechas
    else delete datos[clave]
    window.localStorage.setItem(claveAlmacenamiento, JSON.stringify(datos))
  } catch {
    // La grilla sigue funcionando durante la sesión aunque el navegador no permita guardar.
  }
}
