type FeriadoApi = { fecha: string; nombre?: string; tipo?: string }

const claveCache = 'gsp-feriados-nacionales-v1'

const fechaClave = (fecha: Date) =>
  `${fecha.getFullYear()}-${String(fecha.getMonth() + 1).padStart(2, '0')}-${String(fecha.getDate()).padStart(2, '0')}`

const sumarDias = (fecha: Date, dias: number) => {
  const resultado = new Date(fecha)
  resultado.setDate(resultado.getDate() + dias)
  return resultado
}

// Computus gregoriano: permite reconocer Carnaval y Viernes Santo también sin conexión.
const calcularPascua = (anio: number) => {
  const a = anio % 19
  const b = Math.floor(anio / 100)
  const c = anio % 100
  const d = Math.floor(b / 4)
  const e = b % 4
  const f = Math.floor((b + 8) / 25)
  const g = Math.floor((b - f + 1) / 3)
  const h = (19 * a + b - d - g + 15) % 30
  const i = Math.floor(c / 4)
  const k = c % 4
  const l = (32 + 2 * e + 2 * i - h - k) % 7
  const m = Math.floor((a + 11 * h + 22 * l) / 451)
  const mes = Math.floor((h + l - 7 * m + 114) / 31)
  const dia = ((h + l - 7 * m + 114) % 31) + 1
  return new Date(anio, mes - 1, dia)
}

const feriadosBase = (anio: number): Record<string, string> => {
  const feriados: Record<string, string> = {}
  const agregar = (fecha: Date, nombre: string) => { feriados[fechaClave(fecha)] = nombre }
  const fijos: [number, number, string][] = [
    [1, 1, 'Año Nuevo'],
    [2, 24, 'Día Nacional de la Memoria por la Verdad y la Justicia'],
    [4, 2, 'Día del Veterano y de los Caídos en la Guerra de Malvinas'],
    [5, 1, 'Día del Trabajador'],
    [5, 25, 'Día de la Revolución de Mayo'],
    [6, 17, 'Paso a la Inmortalidad del General Martín Miguel de Güemes'],
    [6, 20, 'Paso a la Inmortalidad del General Manuel Belgrano'],
    [7, 9, 'Día de la Independencia'],
    [8, 17, 'Paso a la Inmortalidad del General José de San Martín'],
    [10, 12, 'Día del Respeto a la Diversidad Cultural'],
    [11, 20, 'Día de la Soberanía Nacional'],
    [12, 8, 'Inmaculada Concepción de María'],
    [12, 25, 'Navidad'],
  ]
  fijos.forEach(([mes, dia, nombre]) => agregar(new Date(anio, mes - 1, dia), nombre))
  const pascua = calcularPascua(anio)
  agregar(sumarDias(pascua, -49), 'Carnaval')
  agregar(sumarDias(pascua, -48), 'Carnaval')
  agregar(sumarDias(pascua, -2), 'Viernes Santo')
  return feriados
}

const leerCache = (anio: number): Record<string, string> => {
  if (typeof window === 'undefined') return {}
  try {
    const raw = window.localStorage.getItem(claveCache)
    const cache = raw ? JSON.parse(raw) as Record<string, Record<string, string>> : {}
    return cache[String(anio)] || {}
  } catch {
    return {}
  }
}

export const cargarFeriadosArgentina = async (anio: number): Promise<Record<string, string>> => {
  const base = feriadosBase(anio)
  const cache = leerCache(anio)
  if (Object.keys(cache).length) Object.assign(base, cache)

  // La PWA puede abrirse sin conexión: en ese caso devuelve el calendario nacional calculado localmente.
  if (typeof navigator !== 'undefined' && !navigator.onLine) return base

  try {
    const respuesta = await fetch(`https://api.argentinadatos.com/v1/feriados/${anio}`)
    if (!respuesta.ok) return base
    const datos = await respuesta.json() as FeriadoApi[]
    if (!Array.isArray(datos)) return base
    const oficiales: Record<string, string> = { ...base }
    for (const feriado of datos) {
      if (/^\d{4}-\d{2}-\d{2}$/.test(feriado.fecha)) {
        oficiales[feriado.fecha] = feriado.nombre || 'Feriado nacional'
      }
    }
    if (typeof window !== 'undefined') {
      try {
        const raw = window.localStorage.getItem(claveCache)
        const todo = raw ? JSON.parse(raw) as Record<string, Record<string, string>> : {}
        todo[String(anio)] = oficiales
        window.localStorage.setItem(claveCache, JSON.stringify(todo))
      } catch {
        // La grilla no depende de que el navegador permita guardar la caché.
      }
    }
    return oficiales
  } catch {
    return base
  }
}
