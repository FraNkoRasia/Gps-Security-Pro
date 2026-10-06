import React, { createContext, useContext, useState, useEffect } from 'react'
import type {
  Empresa,
  Objetivo,
  Usuario,
  Asignacion,
  Turno,
  NovedadLibro,
  SolicitudCambio,
  Aviso,
  RegistroAuditoria
} from '@/tipos'
import { useAutenticacion } from './contexto-autenticacion'
import { supabase } from '@/servicios/supabase'

// Datos iniciales de demostración basados en las especificaciones del cliente
const EMPRESAS_INICIALES: Empresa[] = [
  {
    id: 'emp-wall-01',
    nombre: 'Wall Security',
    cuit: '30-71458921-9',
    direccion: 'Av. Marcelo T. de Alvear 1040, Río Cuarto',
    activa: true,
    creada_en: '2026-09-01T08:00:00Z'
  },
  {
    id: 'emp-centro-02',
    nombre: 'Vigilancia Centro SRL',
    cuit: '30-68912344-2',
    direccion: 'San Martín 450, Córdoba Capital',
    activa: true,
    creada_en: '2026-09-15T08:00:00Z'
  }
]

const OBJETIVOS_INICIALES: Objetivo[] = [
  {
    id: 'obj-melli-01',
    id_empresa: 'emp-wall-01',
    nombre: 'MercadoLibre Río Cuarto',
    descripcion: 'Centro de Almacenamiento y Logística. Cobertura 24/7 en Puesto 1 y Puesto 2.',
    direccion: 'Ruta Nacional 8 Km 605, Parque Industrial',
    localidad: 'Río Cuarto',
    provincia: 'Córdoba',
    activo: true,
    creado_en: '2026-10-01T08:00:00Z'
  },
  {
    id: 'obj-chango-02',
    id_empresa: 'emp-wall-01',
    nombre: 'ChangoMás Río Cuarto',
    descripcion: 'Hipermercado comercial. Guardia en accesos de clientes y playa de descarga.',
    direccion: 'Av. Amancio Alcorta y Av. Sabattini',
    localidad: 'Río Cuarto',
    provincia: 'Córdoba',
    activo: true,
    creado_en: '2026-10-01T08:00:00Z'
  },
  {
    id: 'obj-banco-03',
    id_empresa: 'emp-wall-01',
    nombre: 'Banco Nación Río Cuarto',
    descripcion: 'Sucursal Bancaria y sector de cajeros automáticos 24 hs.',
    direccion: 'Sobremonte 750, Centro',
    localidad: 'Río Cuarto',
    provincia: 'Córdoba',
    activo: true,
    creado_en: '2026-10-01T08:00:00Z'
  }
]

const VIGILADORES_INICIALES: Usuario[] = [
  {
    id: 'usr-vig-01',
    email: 'franco.rasia@wallsecurity.com',
    nombre: 'Franco',
    apellido: 'Rasia',
    rol: 'vigilador',
    id_empresa: 'emp-wall-01',
    empresa_nombre: 'Wall Security',
    telefono: '+54 9 358 4123456',
    activo: true,
    debe_cambiar_contrasena: false,
    creado_en: '2026-10-01T08:00:00Z'
  },
  {
    id: 'usr-vig-02',
    email: 'marcos.perez@wallsecurity.com',
    nombre: 'Marcos',
    apellido: 'Pérez',
    rol: 'vigilador',
    id_empresa: 'emp-wall-01',
    empresa_nombre: 'Wall Security',
    telefono: '+54 9 358 4654321',
    activo: true,
    debe_cambiar_contrasena: false,
    creado_en: '2026-10-01T08:00:00Z'
  },
  {
    id: 'usr-vig-03',
    email: 'lucas.gomez@wallsecurity.com',
    nombre: 'Lucas',
    apellido: 'Gómez',
    rol: 'vigilador',
    id_empresa: 'emp-wall-01',
    empresa_nombre: 'Wall Security',
    telefono: '+54 9 358 4987654',
    activo: true,
    debe_cambiar_contrasena: false,
    creado_en: '2026-10-01T08:00:00Z'
  },
  {
    id: 'usr-vig-04',
    email: 'matias.rodriguez@wallsecurity.com',
    nombre: 'Matías',
    apellido: 'Rodríguez',
    rol: 'vigilador',
    id_empresa: 'emp-wall-01',
    empresa_nombre: 'Wall Security',
    telefono: '+54 9 358 4333222',
    activo: true,
    debe_cambiar_contrasena: false,
    creado_en: '2026-10-01T08:00:00Z'
  }
]

// Historial de asignaciones (Sección 20 y 21)
const ASIGNACIONES_INICIALES: Asignacion[] = [
  {
    id: 'asig-01',
    id_vigilador: 'usr-vig-01',
    id_objetivo: 'obj-melli-01',
    objetivo_nombre: 'MercadoLibre Río Cuarto',
    fecha_inicio: '2026-10-01',
    fecha_fin: null,
    activa: true,
    motivo_traslado: 'Asignación inicial de puesto',
    creado_por: 'Administrador',
    creado_en: '2026-10-01T08:00:00Z'
  },
  {
    id: 'asig-02',
    id_vigilador: 'usr-vig-02',
    id_objetivo: 'obj-melli-01',
    objetivo_nombre: 'MercadoLibre Río Cuarto',
    fecha_inicio: '2026-10-01',
    fecha_fin: null,
    activa: true,
    motivo_traslado: 'Asignación de servicio',
    creado_por: 'Administrador',
    creado_en: '2026-10-01T08:00:00Z'
  },
  {
    id: 'asig-03',
    id_vigilador: 'usr-vig-03',
    id_objetivo: 'obj-chango-02',
    objetivo_nombre: 'ChangoMás Río Cuarto',
    fecha_inicio: '2026-10-01',
    fecha_fin: null,
    activa: true,
    motivo_traslado: 'Asignación de servicio',
    creado_por: 'Administrador',
    creado_en: '2026-10-01T08:00:00Z'
  },
  {
    id: 'asig-04',
    id_vigilador: 'usr-vig-04',
    id_objetivo: 'obj-banco-03',
    objetivo_nombre: 'Banco Nación Río Cuarto',
    fecha_inicio: '2026-10-01',
    fecha_fin: null,
    activa: true,
    motivo_traslado: 'Asignación de servicio',
    creado_por: 'Administrador',
    creado_en: '2026-10-01T08:00:00Z'
  }
]

// Turnos iniciales para Octubre 2026 (Sección 22 y 23)
const generarTurnosOctubre = (): Turno[] => {
  const turnos: Turno[] = []
  const vigs = ['usr-vig-01', 'usr-vig-02', 'usr-vig-03', 'usr-vig-04']
  const objs = ['obj-melli-01', 'obj-melli-01', 'obj-chango-02', 'obj-banco-03']

  for (let dia = 1; dia <= 31; dia++) {
    const diaStr = dia < 10 ? `0${dia}` : `${dia}`
    const fecha = `2026-10-${diaStr}`
    const dateObj = new Date(2026, 9, dia)
    const esDomingo = dateObj.getDay() === 0

    vigs.forEach((idVig, idx) => {
      // Patrón de turnos rotativo
      const ciclo = (dia + idx * 2) % 4
      let horas = 12
      let tipo: Turno['tipo'] = 'diurno'
      let inicio = '07:00'
      let fin = '19:00'
      let diurnas = 12
      let nocturnas = 0

      if (ciclo === 0) {
        // 12🌙 Nocturno (19:00 -> 07:00 cruza medianoche)
        tipo = 'nocturno'
        inicio = '19:00'
        fin = '07:00'
        horas = 12
        diurnas = 3
        nocturnas = 9
      } else if (ciclo === 1) {
        // Franco
        tipo = 'franco'
        inicio = '00:00'
        fin = '00:00'
        horas = 0
        diurnas = 0
        nocturnas = 0
      } else if (ciclo === 2) {
        // 12☀️ Diurno
        tipo = 'diurno'
        inicio = '07:00'
        fin = '19:00'
        horas = 12
        diurnas = 12
        nocturnas = 0
      } else {
        // 10 hs especial
        tipo = 'especial'
        inicio = '08:00'
        fin = '18:00'
        horas = 10
        diurnas = 10
        nocturnas = 0
      }

      turnos.push({
        id: `trn-${idVig}-${fecha}`,
        id_empresa: 'emp-wall-01',
        id_objetivo: objs[idx],
        id_vigilador: idVig,
        fecha,
        hora_inicio: inicio,
        hora_fin: fin,
        horas_totales: horas,
        tipo,
        horas_diurnas: diurnas,
        horas_nocturnas: nocturnas,
        es_feriado: dia === 12, // 12 de Octubre feriado nacional
        es_domingo: esDomingo,
        horas_extra: 0,
        estado: 'programado'
      })
    })
  }
  return turnos
}

const NOVEDADES_INICIALES: NovedadLibro[] = [
  {
    id: 'nov-01',
    id_empresa: 'emp-wall-01',
    id_objetivo: 'obj-melli-01',
    id_vigilador: 'usr-vig-01',
    nombre_vigilante: 'Franco Rasia',
    nombre_supervisor: 'Carlos Méndez',
    fecha: '2026-10-04',
    hora: '19:00',
    turno: '12🌙 Nocturno (19:00 - 07:00)',
    elementos_a_cargo: 'Handy Motorola VHF #12, Linterna LED táctica, Libro Tomo IV, Llaves de acceso portón este.',
    informe_novedades: 'Relevo de guardia sin novedades. Se recibe el puesto en orden. Iluminación perimetral operando al 100%. Se verifica cierre de portón de descarga a las 19:30 hs.',
    creado_en: '2026-10-04T19:05:00Z'
  },
  {
    id: 'nov-02',
    id_empresa: 'emp-wall-01',
    id_objetivo: 'obj-chango-02',
    id_vigilador: 'usr-vig-03',
    nombre_vigilante: 'Lucas Gómez',
    nombre_supervisor: 'Carlos Méndez',
    fecha: '2026-10-04',
    hora: '14:20',
    turno: '10 hs (08:00 - 18:00)',
    elementos_a_cargo: 'Handy VHF #08, Silbato de alerta, Detector de metales manual.',
    informe_novedades: 'Se presenta móvil de reposición de cajero Banelco. Se verifica identidad de los técnicos y se acompaña hasta el recinto blindado sin anomalías.',
    creado_en: '2026-10-04T14:25:00Z'
  }
]

const AVISOS_INICIALES: Aviso[] = [
  {
    id: 'av-01',
    id_empresa: 'emp-wall-01',
    autor_nombre: 'Administración Wall Security',
    titulo: 'Refuerzo de controles en accesos de camiones',
    contenido: 'A partir de mañana lunes se exigirá a todo transportista presentar remito digital además del documento de identidad antes de abrir la barrera.',
    prioridad: 'alta',
    leido: false,
    creado_en: '2026-10-03T10:00:00Z'
  },
  {
    id: 'av-02',
    id_empresa: 'emp-wall-01',
    autor_nombre: 'Centro de Operaciones',
    titulo: 'Feriado Nacional del 12 de Octubre',
    contenido: 'Recordamos que el lunes 12 de octubre es feriado nacional. Los turnos asignados computarán recargo correspondiente por feriado trabajado.',
    prioridad: 'media',
    leido: true,
    creado_en: '2026-10-02T16:00:00Z'
  }
]

interface ContextoOperativoTipo {
  empresas: Empresa[]
  objetivos: Objetivo[]
  vigiladores: Usuario[]
  asignaciones: Asignacion[]
  turnos: Turno[]
  novedades: NovedadLibro[]
  solicitudesCambio: SolicitudCambio[]
  avisos: Aviso[]
  auditorias: RegistroAuditoria[]

  // Acciones Empresa
  crearEmpresa: (datos: { nombre: string; cuit?: string; direccion?: string }) => void
  editarEmpresa: (id: string, datos: Partial<Empresa>) => void
  eliminarEmpresa: (id: string) => void

  // Acciones Objetivo
  crearObjetivo: (datos: { id_empresa: string; nombre: string; descripcion?: string; direccion: string; localidad: string; provincia: string }) => void
  editarObjetivo: (id: string, datos: Partial<Objetivo>) => void
  eliminarObjetivo: (id: string) => void

  // Acciones Vigilador
  crearVigilador: (datos: { nombre: string; apellido: string; email: string; telefono?: string; id_empresa: string; id_objetivo_inicial?: string }) => void
  editarVigilador: (id: string, datos: Partial<Usuario>) => void
  eliminarVigilador: (id: string) => void

  // Traslados y Asignaciones (Sección 20 y 21)
  trasladarVigilador: (parametros: {
    id_vigilador: string
    id_nuevo_objetivo: string
    fecha_efectiva: string
    motivo: string
    accion_turnos_futuros: 'mantener' | 'reasignar' | 'cancelar'
  }) => void

  // Grilla Mensual y Turnos (Sección 22 y 23)
  asignarTurnoGrilla: (parametros: {
    id_vigilador: string
    id_objetivo: string
    fecha: string
    codigo: '12☀️' | '12🌙' | '10' | '8' | 'F' | 'borrar'
  }) => void

  // Libro de Novedades (Sección 32)
  const crearNovedad = (datos: {
    id_objetivo: string
    id_vigilador: string
    nombre_vigilante: string
    nombre_supervisor: string
    fecha: string
    hora: string
    turno: string
    elementos_a_cargo: string
    informe_novedades: string
  }) => {
    if (!supabase) return
    const vig = vigiladores.find((v) => v.id === datos.id_vigilador)
    const dbVigilador = vig ? vigiladorPorUsuario.get(vig.id) : undefined
    if (!vig || !dbVigilador || !usuario) return

    void (async () => {
      const { data, error } = await supabase.from('novedades_libro').insert({
        id_empresa: vig.id_empresa,
        id_objetivo: datos.id_objetivo,
        id_vigilador: dbVigilador.id,
        nombre_vigilante: datos.nombre_vigilante,
        nombre_supervisor: datos.nombre_supervisor || null,
        fecha: datos.fecha,
        hora: datos.hora,
        turno: datos.turno || null,
        elementos_a_cargo: datos.elementos_a_cargo || null,
        informe_novedades: datos.informe_novedades,
        creado_por: usuario.id
      }).select('*').single()

      if (error) { console.error('Error creando novedad:', error); return }

      setNovedades((prev) => [{
        id: data.id, id_empresa: data.id_empresa, id_objetivo: data.id_objetivo,
        id_vigilador: datos.id_vigilador, nombre_vigilante: data.nombre_vigilante,
        nombre_supervisor: data.nombre_supervisor || '', fecha: data.fecha, hora: data.hora,
        turno: data.turno || '', elementos_a_cargo: data.elementos_a_cargo || '',
        informe_novedades: data.informe_novedades, creado_en: data.creado_en
      }, ...prev])
    })()
  }

  const editarNovedad = (id: string, datos: { informe_novedades: string; motivo_correccion: string }) => {
    if (!supabase || !usuario) return

    void (async () => {
      const original = novedades.find((n) => n.id === id)
      if (!original) return

      const { data, error } = await supabase.from('novedades_correcciones').insert({
        id_novedad: id,
        id_empresa: original.id_empresa,
        correccion: datos.informe_novedades,
        motivo: datos.motivo_correccion || null,
        corregido_por: usuario.id
      }).select('*').single()

      if (error) { console.error('Error guardando corrección:', error); return }

      // El original permanece intacto. La corrección queda como historial inmutable.
      setNovedades((prev) => prev.map((n) =>
        n.id === id ? { ...n, informe_novedades: data.correccion } : n
      ))
    })()
  }

  // Cambios de Turno (Sección 29)
  solicitarCambioTurno: (datos: {
    id_solicitante: string
    id_destinatario: string
    id_turno_origen: string
    fecha_turno: string
    motivo: string
  }) => void
  responderSolicitudCambio: (id_solicitud: string, aceptado: boolean) => void
  aprobarCambioAdmin: (id_solicitud: string, aprobado: boolean) => void

  // Avisos (Sección 31)
  crearAviso: (datos: { titulo: string; contenido: string; prioridad: Aviso['prioridad'] }) => void
  marcarAvisoLeido: (id: string) => void
}

const ContextoOperativo = createContext<ContextoOperativoTipo | undefined>(undefined)

const CLAVE_STORE = 'gsp_seguridad_pro_db_v1'

export const ProveedorOperativo: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { usuario } = useAutenticacion()

  const [empresas, setEmpresas] = useState<Empresa[]>([])
  const [objetivos, setObjetivos] = useState<Objetivo[]>([])
  const [vigiladores, setVigiladores] = useState<Usuario[]>([])
  const [asignaciones, setAsignaciones] = useState<Asignacion[]>([])
  const [turnos, setTurnos] = useState<Turno[]>([])
  const [novedades, setNovedades] = useState<NovedadLibro[]>([])
  const [solicitudesCambio, setSolicitudesCambio] = useState<SolicitudCambio[]>([])
  const [avisos, setAvisos] = useState<Aviso[]>([])
  const [auditorias, setAuditorias] = useState<RegistroAuditoria[]>([])

  useEffect(() => {
    if (!usuario || !supabase) return

    let cancelado = false

    const cargarDatosOperativos = async () => {
      try {
        const empresaId = usuario.id_empresa

        const [
          empresasResult,
          objetivosResult,
          perfilesResult,
          vigiladoresResult,
          asignacionesResult,
          turnosResult,
          novedadesResult,
          solicitudesResult,
          avisosResult,
          auditoriaResult,
          lecturasResult
        ] = await Promise.all([
          usuario.rol === 'super_administrador'
            ? supabase.from('empresas').select('*').order('nombre')
            : supabase.from('empresas').select('*').eq('id', empresaId).order('nombre'),
          supabase.from('objetivos').select('*').order('nombre'),
          supabase.from('perfiles').select('id,id_empresa,nombre,apellido,telefono,rol,activo,debe_cambiar_contrasena,creado_en'),
          supabase.from('vigiladores').select('*').order('apellido'),
          supabase.from('asignaciones').select('*').order('fecha_inicio', { ascending: false }),
          supabase.from('turnos').select('*').order('fecha', { ascending: true }),
          supabase.from('novedades_libro').select('*').order('fecha', { ascending: false }).order('hora', { ascending: false }),
          supabase.from('solicitudes_cambio').select('*').order('creado_en', { ascending: false }),
          supabase.from('avisos').select('*').order('creado_en', { ascending: false }),
          supabase.from('auditoria').select('*').order('fecha_hora', { ascending: false }),
          supabase.from('avisos_lecturas').select('id_aviso,id_usuario').eq('id_usuario', usuario.id)
        ])

        const resultados = [
          empresasResult, objetivosResult, perfilesResult, vigiladoresResult,
          asignacionesResult, turnosResult, novedadesResult, solicitudesResult,
          avisosResult, auditoriaResult, lecturasResult
        ]

        const error = resultados.find((r) => r.error)?.error
        if (error) throw error
        if (cancelado) return

        const empresasDb = empresasResult.data || []
        const objetivosDb = objetivosResult.data || []
        const perfilesDb = perfilesResult.data || []
        const vigiladoresDb = vigiladoresResult.data || []
        const lecturas = new Set((lecturasResult.data || []).map((l) => l.id_aviso))

        const empresaMap = new Map(empresasDb.map((e) => [e.id, e.nombre]))
        const objetivoMap = new Map(objetivosDb.map((o) => [o.id, o.nombre]))
        const perfilMap = new Map(perfilesDb.map((p) => [p.id, p]))
        const vigiladorPorUsuario = new Map(vigiladoresDb.filter((v) => v.id_usuario).map((v) => [v.id_usuario, v]))
        const usuarioPorVigilador = new Map(vigiladoresDb.filter((v) => v.id_usuario).map((v) => [v.id, v.id_usuario]))

        const perfilesVigiladores = vigiladoresDb
          .map((v) => {
            const perfil = v.id_usuario ? perfilMap.get(v.id_usuario) : null
            if (!perfil) return null
            return {
              id: v.id_usuario,
              email: '',
              nombre: perfil.nombre,
              apellido: perfil.apellido,
              rol: perfil.rol,
              id_empresa: perfil.id_empresa,
              empresa_nombre: perfil.id_empresa ? empresaMap.get(perfil.id_empresa) || null : null,
              telefono: perfil.telefono,
              activo: perfil.activo && v.activo,
              debe_cambiar_contrasena: perfil.debe_cambiar_contrasena,
              creado_en: perfil.creado_en
            } satisfies Usuario
          })
          .filter((v): v is Usuario => Boolean(v))

        setEmpresas(empresasDb.map((e) => ({
          id: e.id, nombre: e.nombre, cuit: e.cuit || '', direccion: e.direccion || '',
          activa: e.activa, creada_en: e.creada_en
        })))
        setObjetivos(objetivosDb.map((o) => ({
          id: o.id, id_empresa: o.id_empresa, nombre: o.nombre, descripcion: o.descripcion || '',
          direccion: o.direccion || '', localidad: o.localidad || '', provincia: o.provincia || '',
          activo: o.activo, creado_en: o.creado_en
        })).filter((o) => usuario.rol === 'super_administrador' || o.id_empresa === empresaId))
        setVigiladores(perfilesVigiladores.filter((v) => usuario.rol === 'super_administrador' || v.id_empresa === empresaId))
        setAsignaciones((asignacionesResult.data || []).map((a) => ({
          id: a.id, id_vigilador: usuarioPorVigilador.get(a.id_vigilador) || a.id_vigilador, id_objetivo: a.id_objetivo,
          objetivo_nombre: objetivoMap.get(a.id_objetivo), fecha_inicio: a.fecha_inicio,
          fecha_fin: a.fecha_fin, activa: a.activa, motivo_traslado: a.motivo_traslado,
          creado_por: a.creado_por || '', creado_en: a.creado_en
        })).filter((a) => usuario.rol === 'super_administrador' || a.id_empresa === empresaId))
        setTurnos((turnosResult.data || []).map((t) => ({
          id: t.id, id_empresa: t.id_empresa, id_objetivo: t.id_objetivo, id_vigilador: usuarioPorVigilador.get(t.id_vigilador) || t.id_vigilador,
          fecha: t.fecha, hora_inicio: t.hora_inicio || '00:00', hora_fin: t.hora_fin || '00:00',
          horas_totales: Number(t.horas_totales || 0), tipo: t.tipo, horas_diurnas: Number(t.horas_diurnas || 0),
          horas_nocturnas: Number(t.horas_nocturnas || 0), es_feriado: t.es_feriado, es_domingo: t.es_domingo,
          horas_extra: Number(t.horas_extra || 0), estado: t.estado
        })).filter((t) => usuario.rol === 'super_administrador' || t.id_empresa === empresaId))
        setNovedades((novedadesResult.data || []).map((n) => ({
          id: n.id, id_empresa: n.id_empresa, id_objetivo: n.id_objetivo, id_vigilador: n.id_vigilador || '',
          nombre_vigilante: n.nombre_vigilante, nombre_supervisor: n.nombre_supervisor || '',
          fecha: n.fecha, hora: n.hora, turno: n.turno || '', elementos_a_cargo: n.elementos_a_cargo || '',
          informe_novedades: n.informe_novedades
        })).filter((n) => usuario.rol === 'super_administrador' || n.id_empresa === empresaId))
        setSolicitudesCambio((solicitudesResult.data || []).map((s) => ({
          id: s.id, id_empresa: s.id_empresa, id_solicitante: s.id_solicitante, id_destinatario: s.id_destinatario || '',
          id_turno_origen: s.id_turno_origen, fecha_turno: s.fecha_turno, estado: s.estado,
          motivo: s.motivo || '', creado_en: s.creado_en
        })).filter((s) => usuario.rol === 'super_administrador' || s.id_empresa === empresaId))
        setAvisos((avisosResult.data || []).map((a) => ({
          id: a.id, id_empresa: a.id_empresa, autor_nombre: a.autor_id ? (perfilMap.get(a.autor_id) ? `${perfilMap.get(a.autor_id)!.nombre} ${perfilMap.get(a.autor_id)!.apellido}` : 'Administración') : 'Administración',
          titulo: a.titulo, contenido: a.contenido, prioridad: a.prioridad, leido: lecturas.has(a.id), creado_en: a.creado_en
        })).filter((a) => usuario.rol === 'super_administrador' || a.id_empresa === empresaId))
        setAuditorias((auditoriaResult.data || []).map((a) => ({
          id: a.id, id_usuario: a.id_usuario || '', usuario_nombre: a.id_usuario && perfilMap.get(a.id_usuario) ? `${perfilMap.get(a.id_usuario)!.nombre} ${perfilMap.get(a.id_usuario)!.apellido}` : 'Sistema',
          accion: a.accion, entidad: a.entidad, detalle: JSON.stringify(a.detalle || {}), fecha_hora: a.fecha_hora
        })).filter((a) => usuario.rol === 'super_administrador' || a.id_empresa === empresaId))
      } catch (error) {
        console.error('Error cargando datos operativos desde Supabase:', error)
      }
    }

    cargarDatosOperativos()
    return () => { cancelado = true }
  }, [usuario])

  const registrarAuditoria = (accion: string, entidad: string, detalle: string) => {
    const nuevo: RegistroAuditoria = {
      id: `aud-${Date.now()}`,
      id_usuario: usuario?.id || 'sistema',
      usuario_nombre: usuario ? `${usuario.nombre} ${usuario.apellido}` : 'Sistema',
      accion,
      entidad,
      detalle,
      fecha_hora: new Date().toISOString()
    }
    setAuditorias((prev) => [nuevo, ...prev])
  }

  // Empresas
  const crearEmpresa = (datos: { nombre: string; cuit?: string; direccion?: string }) => {
    if (supabase) {
      void (async () => {
        const { data, error } = await supabase.from('empresas').insert({
          nombre: datos.nombre, cuit: datos.cuit || null, direccion: datos.direccion || null
        }).select('*').single()
        if (error) { console.error('Error creando empresa:', error); return }
        setEmpresas((prev) => [data as Empresa, ...prev])
        if (usuario) {
          await supabase.from('auditoria').insert({
            id_empresa: usuario.id_empresa || data.id, id_usuario: usuario.id,
            accion: 'CREAR_EMPRESA', entidad: 'Empresa', entidad_id: data.id,
            detalle: { texto: `Creó la empresa ${datos.nombre}` }
          })
        }
      })()
      return
    }
    const nueva: Empresa = {
      id: `emp-${Date.now()}`,
      nombre: datos.nombre,
      cuit: datos.cuit || '',
      direccion: datos.direccion || '',
      activa: true,
      creada_en: new Date().toISOString()
    }
    setEmpresas((prev) => [nueva, ...prev])
    registrarAuditoria('CREAR_EMPRESA', 'Empresa', `Creó la empresa ${datos.nombre}`)
  }

  const editarEmpresa = (id: string, datos: Partial<Empresa>) => {
    if (supabase) {
      void (async () => {
        const { data, error } = await supabase.from('empresas').update({
          nombre: datos.nombre, cuit: datos.cuit || null, direccion: datos.direccion || null,
          activa: datos.activa
        }).eq('id', id).select('*').single()
        if (error) { console.error('Error editando empresa:', error); return }
        setEmpresas((prev) => prev.map((e) => e.id === id ? data as Empresa : e))
      })()
      return
    }
    setEmpresas((prev) => prev.map((e) => (e.id === id ? { ...e, ...datos } : e)))
    registrarAuditoria('EDITAR_EMPRESA', 'Empresa', `Modificó empresa ID: ${id}`)
  }

  const eliminarEmpresa = (id: string) => {
    if (supabase) {
      void (async () => {
        const { error } = await supabase.from('empresas').update({ activa: false }).eq('id', id)
        if (error) { console.error('Error desactivando empresa:', error); return }
        setEmpresas((prev) => prev.map((e) => e.id === id ? { ...e, activa: false } : e))
      })()
      return
    }
    setEmpresas((prev) => prev.filter((e) => e.id !== id))
    registrarAuditoria('ELIMINAR_EMPRESA', 'Empresa', `Eliminó empresa ID: ${id}`)
  }

  // Objetivos
  const crearObjetivo = (datos: {
    id_empresa: string
    nombre: string
    descripcion?: string
    direccion: string
    localidad: string
    provincia: string
  }) => {
    if (supabase) {
      void (async () => {
        const { data, error } = await supabase.from('objetivos').insert({
          id_empresa: datos.id_empresa, nombre: datos.nombre, descripcion: datos.descripcion || null,
          direccion: datos.direccion, localidad: datos.localidad, provincia: datos.provincia, activo: true
        }).select('*').single()
        if (error) { console.error('Error creando objetivo:', error); return }
        setObjetivos((prev) => [data as Objetivo, ...prev])
      })()
      return
    }
    const nuevo: Objetivo = {
      id: `obj-${Date.now()}`, id_empresa: datos.id_empresa, nombre: datos.nombre,
      descripcion: datos.descripcion || '', direccion: datos.direccion, localidad: datos.localidad,
      provincia: datos.provincia, activo: true, creado_en: new Date().toISOString()
    }
    setObjetivos((prev) => [nuevo, ...prev])
    registrarAuditoria('CREAR_OBJETIVO', 'Objetivo', `Creó el objetivo ${datos.nombre} en ${datos.localidad}`)
  }

  const editarObjetivo = (id: string, datos: Partial<Objetivo>) => {
    if (supabase) {
      void (async () => {
        const { data, error } = await supabase.from('objetivos').update({
          nombre: datos.nombre, descripcion: datos.descripcion || null, direccion: datos.direccion,
          localidad: datos.localidad, provincia: datos.provincia, activo: datos.activo
        }).eq('id', id).select('*').single()
        if (error) { console.error('Error editando objetivo:', error); return }
        setObjetivos((prev) => prev.map((o) => o.id === id ? data as Objetivo : o))
      })()
      return
    }
    setObjetivos((prev) => prev.map((o) => (o.id === id ? { ...o, ...datos } : o)))
    registrarAuditoria('EDITAR_OBJETIVO', 'Objetivo', `Editó objetivo ID: ${id}`)
  }

  const eliminarObjetivo = (id: string) => {
    if (supabase) {
      void (async () => {
        const { error } = await supabase.from('objetivos').update({ activo: false }).eq('id', id)
        if (error) { console.error('Error desactivando objetivo:', error); return }
        setObjetivos((prev) => prev.map((o) => o.id === id ? { ...o, activo: false } : o))
      })()
      return
    }
    setObjetivos((prev) => prev.filter((o) => o.id !== id))
    registrarAuditoria('ELIMINAR_OBJETIVO', 'Objetivo', `Eliminó objetivo ID: ${id}`)
  }

  const crearVigilador = (datos: {
    nombre: string
    apellido: string
    email: string
    telefono?: string
    id_empresa: string
    id_objetivo_inicial?: string
  }) => {
    if (!supabase) return

    void (async () => {
      const { data, error } = await supabase.functions.invoke('crear-vigilador', {
        body: datos
      })

      if (error || data?.error) {
        console.error('Error creando vigilador:', error || data?.error)
        return
      }

      const perfil = data.profile
      const empresa = empresas.find((e) => e.id === datos.id_empresa)

      const nuevo: Usuario = {
        id: perfil.id,
        email: datos.email,
        nombre: perfil.nombre,
        apellido: perfil.apellido,
        rol: 'vigilador',
        id_empresa: datos.id_empresa,
        empresa_nombre: empresa?.nombre || null,
        telefono: perfil.telefono,
        activo: perfil.activo,
        debe_cambiar_contrasena: perfil.debe_cambiar_contrasena,
        creado_en: perfil.creado_en
      }

      setVigiladores((prev) => [nuevo, ...prev])

      if (data.vigilador && datos.id_objetivo_inicial) {
        const obj = objetivos.find((o) => o.id === datos.id_objetivo_inicial)
        const asignacion = {
          id: data.asignacion?.id || `asig-${Date.now()}`,
          id_vigilador: data.vigilador.id,
          id_objetivo: datos.id_objetivo_inicial,
          objetivo_nombre: obj?.nombre,
          fecha_inicio: new Date().toISOString().split('T')[0],
          fecha_fin: null,
          activa: true,
          motivo_traslado: 'Asignación inicial al dar de alta',
          creado_por: usuario?.id || '',
          creado_en: new Date().toISOString()
        } satisfies Asignacion
        setAsignaciones((prev) => [asignacion, ...prev])
      }

      console.info('Vigilador creado. Entregar la contraseña temporal de forma segura:', data.temporary_password)
    })()
  }

  // Traslados y Asignaciones (Sección 20 y 21)
  trasladarVigilador: (parametros: {
    id_vigilador: string
    id_nuevo_objetivo: string
    fecha_efectiva: string
    motivo: string
    accion_turnos_futuros: 'mantener' | 'reasignar' | 'cancelar'
  }) => void

  // Grilla Mensual y Turnos (Sección 22 y 23)
  asignarTurnoGrilla: (parametros: {
    id_vigilador: string
    id_objetivo: string
    fecha: string
    codigo: '12☀️' | '12🌙' | '10' | '8' | 'F' | 'borrar'
  }) => void

  // Libro de Novedades (Sección 32)
  crearNovedad: (datos: {
    id_objetivo: string
    id_vigilador: string
    nombre_vigilante: string
    nombre_supervisor: string
    fecha: string
    hora: string
    turno: string
    elementos_a_cargo: string
    informe_novedades: string
  }) => void
  editarNovedad: (id: string, datos: { informe_novedades: string; motivo_correccion: string }) => void

  // Cambios de Turno (Sección 29)
  solicitarCambioTurno: (datos: {
    id_solicitante: string
    id_destinatario: string
    id_turno_origen: string
    fecha_turno: string
    motivo: string
  }) => void
  responderSolicitudCambio: (id_solicitud: string, aceptado: boolean) => void
  aprobarCambioAdmin: (id_solicitud: string, aprobado: boolean) => void

  // Avisos (Sección 31)
  crearAviso: (datos: { titulo: string; contenido: string; prioridad: Aviso['prioridad'] }) => void
  marcarAvisoLeido: (id: string) => void
}

const ContextoOperativo = createContext<ContextoOperativoTipo | undefined>(undefined)

const CLAVE_STORE = 'gsp_seguridad_pro_db_v1'

export const ProveedorOperativo: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { usuario } = useAutenticacion()

  const [empresas, setEmpresas] = useState<Empresa[]>([])
  const [objetivos, setObjetivos] = useState<Objetivo[]>([])
  const [vigiladores, setVigiladores] = useState<Usuario[]>([])
  const [asignaciones, setAsignaciones] = useState<Asignacion[]>([])
  const [turnos, setTurnos] = useState<Turno[]>([])
  const [novedades, setNovedades] = useState<NovedadLibro[]>([])
  const [solicitudesCambio, setSolicitudesCambio] = useState<SolicitudCambio[]>([])
  const [avisos, setAvisos] = useState<Aviso[]>([])
  const [auditorias, setAuditorias] = useState<RegistroAuditoria[]>([])

  useEffect(() => {
    if (!usuario || !supabase) return

    let cancelado = false

    const cargarDatosOperativos = async () => {
      try {
        const empresaId = usuario.id_empresa

        const [
          empresasResult,
          objetivosResult,
          perfilesResult,
          vigiladoresResult,
          asignacionesResult,
          turnosResult,
          novedadesResult,
          solicitudesResult,
          avisosResult,
          auditoriaResult,
          lecturasResult
        ] = await Promise.all([
          usuario.rol === 'super_administrador'
            ? supabase.from('empresas').select('*').order('nombre')
            : supabase.from('empresas').select('*').eq('id', empresaId).order('nombre'),
          supabase.from('objetivos').select('*').order('nombre'),
          supabase.from('perfiles').select('id,id_empresa,nombre,apellido,telefono,rol,activo,debe_cambiar_contrasena,creado_en'),
          supabase.from('vigiladores').select('*').order('apellido'),
          supabase.from('asignaciones').select('*').order('fecha_inicio', { ascending: false }),
          supabase.from('turnos').select('*').order('fecha', { ascending: true }),
          supabase.from('novedades_libro').select('*').order('fecha', { ascending: false }).order('hora', { ascending: false }),
          supabase.from('solicitudes_cambio').select('*').order('creado_en', { ascending: false }),
          supabase.from('avisos').select('*').order('creado_en', { ascending: false }),
          supabase.from('auditoria').select('*').order('fecha_hora', { ascending: false }),
          supabase.from('avisos_lecturas').select('id_aviso,id_usuario').eq('id_usuario', usuario.id)
        ])

        const resultados = [
          empresasResult, objetivosResult, perfilesResult, vigiladoresResult,
          asignacionesResult, turnosResult, novedadesResult, solicitudesResult,
          avisosResult, auditoriaResult, lecturasResult
        ]

        const error = resultados.find((r) => r.error)?.error
        if (error) throw error
        if (cancelado) return

        const empresasDb = empresasResult.data || []
        const objetivosDb = objetivosResult.data || []
        const perfilesDb = perfilesResult.data || []
        const vigiladoresDb = vigiladoresResult.data || []
        const lecturas = new Set((lecturasResult.data || []).map((l) => l.id_aviso))

        const empresaMap = new Map(empresasDb.map((e) => [e.id, e.nombre]))
        const objetivoMap = new Map(objetivosDb.map((o) => [o.id, o.nombre]))
        const perfilMap = new Map(perfilesDb.map((p) => [p.id, p]))

        const perfilesVigiladores = vigiladoresDb
          .map((v) => {
            const perfil = v.id_usuario ? perfilMap.get(v.id_usuario) : null
            if (!perfil) return null
            return {
              id: v.id_usuario,
              email: '',
              nombre: perfil.nombre,
              apellido: perfil.apellido,
              rol: perfil.rol,
              id_empresa: perfil.id_empresa,
              empresa_nombre: perfil.id_empresa ? empresaMap.get(perfil.id_empresa) || null : null,
              telefono: perfil.telefono,
              activo: perfil.activo && v.activo,
              debe_cambiar_contrasena: perfil.debe_cambiar_contrasena,
              creado_en: perfil.creado_en
            } satisfies Usuario
          })
          .filter((v): v is Usuario => Boolean(v))

        setEmpresas(empresasDb.map((e) => ({
          id: e.id, nombre: e.nombre, cuit: e.cuit || '', direccion: e.direccion || '',
          activa: e.activa, creada_en: e.creada_en
        })))
        setObjetivos(objetivosDb.map((o) => ({
          id: o.id, id_empresa: o.id_empresa, nombre: o.nombre, descripcion: o.descripcion || '',
          direccion: o.direccion || '', localidad: o.localidad || '', provincia: o.provincia || '',
          activo: o.activo, creado_en: o.creado_en
        })).filter((o) => usuario.rol === 'super_administrador' || o.id_empresa === empresaId))
        setVigiladores(perfilesVigiladores.filter((v) => usuario.rol === 'super_administrador' || v.id_empresa === empresaId))
        setAsignaciones((asignacionesResult.data || []).map((a) => ({
          id: a.id, id_vigilador: a.id_vigilador, id_objetivo: a.id_objetivo,
          objetivo_nombre: objetivoMap.get(a.id_objetivo), fecha_inicio: a.fecha_inicio,
          fecha_fin: a.fecha_fin, activa: a.activa, motivo_traslado: a.motivo_traslado,
          creado_por: a.creado_por || '', creado_en: a.creado_en
        })).filter((a) => usuario.rol === 'super_administrador' || a.id_empresa === empresaId))
        setTurnos((turnosResult.data || []).map((t) => ({
          id: t.id, id_empresa: t.id_empresa, id_objetivo: t.id_objetivo, id_vigilador: t.id_vigilador,
          fecha: t.fecha, hora_inicio: t.hora_inicio || '00:00', hora_fin: t.hora_fin || '00:00',
          horas_totales: Number(t.horas_totales || 0), tipo: t.tipo, horas_diurnas: Number(t.horas_diurnas || 0),
          horas_nocturnas: Number(t.horas_nocturnas || 0), es_feriado: t.es_feriado, es_domingo: t.es_domingo,
          horas_extra: Number(t.horas_extra || 0), estado: t.estado
        })).filter((t) => usuario.rol === 'super_administrador' || t.id_empresa === empresaId))
        setNovedades((novedadesResult.data || []).map((n) => ({
          id: n.id, id_empresa: n.id_empresa, id_objetivo: n.id_objetivo, id_vigilador: n.id_vigilador || '',
          nombre_vigilante: n.nombre_vigilante, nombre_supervisor: n.nombre_supervisor || '',
          fecha: n.fecha, hora: n.hora, turno: n.turno || '', elementos_a_cargo: n.elementos_a_cargo || '',
          informe_novedades: n.informe_novedades
        })).filter((n) => usuario.rol === 'super_administrador' || n.id_empresa === empresaId))
        setSolicitudesCambio((solicitudesResult.data || []).map((s) => ({
          id: s.id, id_empresa: s.id_empresa, id_solicitante: s.id_solicitante, id_destinatario: s.id_destinatario || '',
          id_turno_origen: s.id_turno_origen, fecha_turno: s.fecha_turno, estado: s.estado,
          motivo: s.motivo || '', creado_en: s.creado_en
        })).filter((s) => usuario.rol === 'super_administrador' || s.id_empresa === empresaId))
        setAvisos((avisosResult.data || []).map((a) => ({
          id: a.id, id_empresa: a.id_empresa, autor_nombre: a.autor_id ? (perfilMap.get(a.autor_id) ? `${perfilMap.get(a.autor_id)!.nombre} ${perfilMap.get(a.autor_id)!.apellido}` : 'Administración') : 'Administración',
          titulo: a.titulo, contenido: a.contenido, prioridad: a.prioridad, leido: lecturas.has(a.id), creado_en: a.creado_en
        })).filter((a) => usuario.rol === 'super_administrador' || a.id_empresa === empresaId))
        setAuditorias((auditoriaResult.data || []).map((a) => ({
          id: a.id, id_usuario: a.id_usuario || '', usuario_nombre: a.id_usuario && perfilMap.get(a.id_usuario) ? `${perfilMap.get(a.id_usuario)!.nombre} ${perfilMap.get(a.id_usuario)!.apellido}` : 'Sistema',
          accion: a.accion, entidad: a.entidad, detalle: JSON.stringify(a.detalle || {}), fecha_hora: a.fecha_hora
        })).filter((a) => usuario.rol === 'super_administrador' || a.id_empresa === empresaId))
      } catch (error) {
        console.error('Error cargando datos operativos desde Supabase:', error)
      }
    }

    cargarDatosOperativos()
    return () => { cancelado = true }
  }, [usuario])

  const registrarAuditoria = (accion: string, entidad: string, detalle: string) => {
    const nuevo: RegistroAuditoria = {
      id: `aud-${Date.now()}`,
      id_usuario: usuario?.id || 'sistema',
      usuario_nombre: usuario ? `${usuario.nombre} ${usuario.apellido}` : 'Sistema',
      accion,
      entidad,
      detalle,
      fecha_hora: new Date().toISOString()
    }
    setAuditorias((prev) => [nuevo, ...prev])
  }

  // Empresas
  const crearEmpresa = (datos: { nombre: string; cuit?: string; direccion?: string }) => {
    if (supabase) {
      void (async () => {
        const { data, error } = await supabase.from('empresas').insert({
          nombre: datos.nombre, cuit: datos.cuit || null, direccion: datos.direccion || null
        }).select('*').single()
        if (error) { console.error('Error creando empresa:', error); return }
        setEmpresas((prev) => [data as Empresa, ...prev])
        if (usuario) {
          await supabase.from('auditoria').insert({
            id_empresa: usuario.id_empresa || data.id, id_usuario: usuario.id,
            accion: 'CREAR_EMPRESA', entidad: 'Empresa', entidad_id: data.id,
            detalle: { texto: `Creó la empresa ${datos.nombre}` }
          })
        }
      })()
      return
    }
    const nueva: Empresa = {
      id: `emp-${Date.now()}`,
      nombre: datos.nombre,
      cuit: datos.cuit || '',
      direccion: datos.direccion || '',
      activa: true,
      creada_en: new Date().toISOString()
    }
    setEmpresas((prev) => [nueva, ...prev])
    registrarAuditoria('CREAR_EMPRESA', 'Empresa', `Creó la empresa ${datos.nombre}`)
  }

  const editarEmpresa = (id: string, datos: Partial<Empresa>) => {
    if (supabase) {
      void (async () => {
        const { data, error } = await supabase.from('empresas').update({
          nombre: datos.nombre, cuit: datos.cuit || null, direccion: datos.direccion || null,
          activa: datos.activa
        }).eq('id', id).select('*').single()
        if (error) { console.error('Error editando empresa:', error); return }
        setEmpresas((prev) => prev.map((e) => e.id === id ? data as Empresa : e))
      })()
      return
    }
    setEmpresas((prev) => prev.map((e) => (e.id === id ? { ...e, ...datos } : e)))
    registrarAuditoria('EDITAR_EMPRESA', 'Empresa', `Modificó empresa ID: ${id}`)
  }

  const eliminarEmpresa = (id: string) => {
    if (supabase) {
      void (async () => {
        const { error } = await supabase.from('empresas').update({ activa: false }).eq('id', id)
        if (error) { console.error('Error desactivando empresa:', error); return }
        setEmpresas((prev) => prev.map((e) => e.id === id ? { ...e, activa: false } : e))
      })()
      return
    }
    setEmpresas((prev) => prev.filter((e) => e.id !== id))
    registrarAuditoria('ELIMINAR_EMPRESA', 'Empresa', `Eliminó empresa ID: ${id}`)
  }

  // Objetivos
  const crearObjetivo = (datos: {
    id_empresa: string
    nombre: string
    descripcion?: string
    direccion: string
    localidad: string
    provincia: string
  }) => {
    if (supabase) {
      void (async () => {
        const { data, error } = await supabase.from('objetivos').insert({
          id_empresa: datos.id_empresa, nombre: datos.nombre, descripcion: datos.descripcion || null,
          direccion: datos.direccion, localidad: datos.localidad, provincia: datos.provincia, activo: true
        }).select('*').single()
        if (error) { console.error('Error creando objetivo:', error); return }
        setObjetivos((prev) => [data as Objetivo, ...prev])
      })()
      return
    }
    const nuevo: Objetivo = {
      id: `obj-${Date.now()}`, id_empresa: datos.id_empresa, nombre: datos.nombre,
      descripcion: datos.descripcion || '', direccion: datos.direccion, localidad: datos.localidad,
      provincia: datos.provincia, activo: true, creado_en: new Date().toISOString()
    }
    setObjetivos((prev) => [nuevo, ...prev])
    registrarAuditoria('CREAR_OBJETIVO', 'Objetivo', `Creó el objetivo ${datos.nombre} en ${datos.localidad}`)
  }

  const editarObjetivo = (id: string, datos: Partial<Objetivo>) => {
    if (supabase) {
      void (async () => {
        const { data, error } = await supabase.from('objetivos').update({
          nombre: datos.nombre, descripcion: datos.descripcion || null, direccion: datos.direccion,
          localidad: datos.localidad, provincia: datos.provincia, activo: datos.activo
        }).eq('id', id).select('*').single()
        if (error) { console.error('Error editando objetivo:', error); return }
        setObjetivos((prev) => prev.map((o) => o.id === id ? data as Objetivo : o))
      })()
      return
    }
    setObjetivos((prev) => prev.map((o) => (o.id === id ? { ...o, ...datos } : o)))
    registrarAuditoria('EDITAR_OBJETIVO', 'Objetivo', `Editó objetivo ID: ${id}`)
  }

  const eliminarObjetivo = (id: string) => {
    if (supabase) {
      void (async () => {
        const { error } = await supabase.from('objetivos').update({ activo: false }).eq('id', id)
        if (error) { console.error('Error desactivando objetivo:', error); return }
        setObjetivos((prev) => prev.map((o) => o.id === id ? { ...o, activo: false } : o))
      })()
      return
    }
    setObjetivos((prev) => prev.filter((o) => o.id !== id))
    registrarAuditoria('ELIMINAR_OBJETIVO', 'Objetivo', `Eliminó objetivo ID: ${id}`)
  }

  // Vigiladores
  const crearVigilador = (datos: {
    nombre: string
    apellido: string
    email: string
    telefono?: string
    id_empresa: string
    id_objetivo_inicial?: string
  }) => {
    if (!supabase) return

    void (async () => {
      // Auth se crea desde el panel administrativo mediante una Edge Function segura.
      // Aquí solo creamos el registro operativo cuando el perfil ya existe.
      const { data: perfil, error: perfilError } = await supabase
        .from('perfiles')
        .insert({
          id: crypto.randomUUID(),
          id_empresa: datos.id_empresa,
          nombre: datos.nombre,
          apellido: datos.apellido,
          telefono: datos.telefono || null,
          rol: 'vigilador',
          activo: true,
          debe_cambiar_contrasena: true
        })
        .select('*')
        .single()

      if (perfilError) {
        console.error('Error creando perfil de vigilador:', perfilError)
        return
      }

      const { data: vigilador, error: vigiladorError } = await supabase
        .from('vigiladores')
        .insert({
          id_empresa: datos.id_empresa,
          id_usuario: perfil.id,
          nombre: datos.nombre,
          apellido: datos.apellido,
          telefono: datos.telefono || null,
          activo: true
        })
        .select('*')
        .single()

      if (vigiladorError) {
        console.error('Error creando vigilador:', vigiladorError)
        await supabase.from('perfiles').delete().eq('id', perfil.id)
        return
      }

      const empresa = empresas.find((e) => e.id === datos.id_empresa)
      const nuevo: Usuario = {
        id: perfil.id, email: datos.email, nombre: datos.nombre, apellido: datos.apellido,
        rol: 'vigilador', id_empresa: datos.id_empresa,
        empresa_nombre: empresa?.nombre || null, telefono: datos.telefono || null,
        activo: true, debe_cambiar_contrasena: true, creado_en: perfil.creado_en
      }
      setVigiladores((prev) => [nuevo, ...prev])

      if (datos.id_objetivo_inicial) {
        const { data: asig, error: asigError } = await supabase.from('asignaciones').insert({
          id_empresa: datos.id_empresa, id_vigilador: vigilador.id,
          id_objetivo: datos.id_objetivo_inicial,
          fecha_inicio: new Date().toISOString().split('T')[0],
          activa: true, motivo_traslado: 'Asignación inicial al dar de alta',
          creado_por: usuario?.id || null
        }).select('*').single()

        if (!asigError && asig) {
          const obj = objetivos.find((o) => o.id === datos.id_objetivo_inicial)
          setAsignaciones((prev) => [{
            id: asig.id, id_vigilador: asig.id_vigilador, id_objetivo: asig.id_objetivo,
            objetivo_nombre: obj?.nombre, fecha_inicio: asig.fecha_inicio,
            fecha_fin: asig.fecha_fin, activa: asig.activa,
            motivo_traslado: asig.motivo_traslado, creado_por: asig.creado_por || '',
            creado_en: asig.creado_en
          }, ...prev])
        }
      }
    })()
  }

  const editarVigilador = (id: string, datos: Partial<Usuario>) => {
    if (!supabase) return
    void (async () => {
      const { error } = await supabase.from('perfiles').update({
        nombre: datos.nombre, apellido: datos.apellido, telefono: datos.telefono,
        activo: datos.activo, debe_cambiar_contrasena: datos.debe_cambiar_contrasena
      }).eq('id', id)
      if (error) { console.error('Error editando vigilador:', error); return }
      setVigiladores((prev) => prev.map((v) => v.id === id ? { ...v, ...datos } : v))
    })()
  }

  const eliminarVigilador = (id: string) => {
    if (!supabase) return
    void (async () => {
      const { error } = await supabase.from('vigiladores').update({ activo: false }).eq('id_usuario', id)
      if (error) { console.error('Error desactivando vigilador:', error); return }
      await supabase.from('perfiles').update({ activo: false }).eq('id', id)
      setVigiladores((prev) => prev.map((v) => v.id === id ? { ...v, activo: false } : v))
    })()
  }

  // Traslados y Asignaciones (Sección 20 y 21)
  trasladarVigilador: (parametros: {
    id_vigilador: string
    id_nuevo_objetivo: string
    fecha_efectiva: string
    motivo: string
    accion_turnos_futuros: 'mantener' | 'reasignar' | 'cancelar'
  }) => void

  // Grilla Mensual y Turnos (Sección 22 y 23)
  asignarTurnoGrilla: (parametros: {
    id_vigilador: string
    id_objetivo: string
    fecha: string
    codigo: '12☀️' | '12🌙' | '10' | '8' | 'F' | 'borrar'
  }) => void

  // Libro de Novedades (Sección 32)
  crearNovedad: (datos: {
    id_objetivo: string
    id_vigilador: string
    nombre_vigilante: string
    nombre_supervisor: string
    fecha: string
    hora: string
    turno: string
    elementos_a_cargo: string
    informe_novedades: string
  }) => void
  editarNovedad: (id: string, datos: { informe_novedades: string; motivo_correccion: string }) => void

  // Cambios de Turno (Sección 29)
  solicitarCambioTurno: (datos: {
    id_solicitante: string
    id_destinatario: string
    id_turno_origen: string
    fecha_turno: string
    motivo: string
  }) => void
  responderSolicitudCambio: (id_solicitud: string, aceptado: boolean) => void
  aprobarCambioAdmin: (id_solicitud: string, aprobado: boolean) => void

  // Avisos (Sección 31)
  crearAviso: (datos: { titulo: string; contenido: string; prioridad: Aviso['prioridad'] }) => void
  marcarAvisoLeido: (id: string) => void
}

const ContextoOperativo = createContext<ContextoOperativoTipo | undefined>(undefined)

const CLAVE_STORE = 'gsp_seguridad_pro_db_v1'

export const ProveedorOperativo: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { usuario } = useAutenticacion()

  const [empresas, setEmpresas] = useState<Empresa[]>([])
  const [objetivos, setObjetivos] = useState<Objetivo[]>([])
  const [vigiladores, setVigiladores] = useState<Usuario[]>([])
  const [asignaciones, setAsignaciones] = useState<Asignacion[]>([])
  const [turnos, setTurnos] = useState<Turno[]>([])
  const [novedades, setNovedades] = useState<NovedadLibro[]>([])
  const [solicitudesCambio, setSolicitudesCambio] = useState<SolicitudCambio[]>([])
  const [avisos, setAvisos] = useState<Aviso[]>([])
  const [auditorias, setAuditorias] = useState<RegistroAuditoria[]>([])

  useEffect(() => {
    if (!usuario || !supabase) return

    let cancelado = false

    const cargarDatosOperativos = async () => {
      try {
        const empresaId = usuario.id_empresa

        const [
          empresasResult,
          objetivosResult,
          perfilesResult,
          vigiladoresResult,
          asignacionesResult,
          turnosResult,
          novedadesResult,
          solicitudesResult,
          avisosResult,
          auditoriaResult,
          lecturasResult
        ] = await Promise.all([
          usuario.rol === 'super_administrador'
            ? supabase.from('empresas').select('*').order('nombre')
            : supabase.from('empresas').select('*').eq('id', empresaId).order('nombre'),
          supabase.from('objetivos').select('*').order('nombre'),
          supabase.from('perfiles').select('id,id_empresa,nombre,apellido,telefono,rol,activo,debe_cambiar_contrasena,creado_en'),
          supabase.from('vigiladores').select('*').order('apellido'),
          supabase.from('asignaciones').select('*').order('fecha_inicio', { ascending: false }),
          supabase.from('turnos').select('*').order('fecha', { ascending: true }),
          supabase.from('novedades_libro').select('*').order('fecha', { ascending: false }).order('hora', { ascending: false }),
          supabase.from('solicitudes_cambio').select('*').order('creado_en', { ascending: false }),
          supabase.from('avisos').select('*').order('creado_en', { ascending: false }),
          supabase.from('auditoria').select('*').order('fecha_hora', { ascending: false }),
          supabase.from('avisos_lecturas').select('id_aviso,id_usuario').eq('id_usuario', usuario.id)
        ])

        const resultados = [
          empresasResult, objetivosResult, perfilesResult, vigiladoresResult,
          asignacionesResult, turnosResult, novedadesResult, solicitudesResult,
          avisosResult, auditoriaResult, lecturasResult
        ]

        const error = resultados.find((r) => r.error)?.error
        if (error) throw error
        if (cancelado) return

        const empresasDb = empresasResult.data || []
        const objetivosDb = objetivosResult.data || []
        const perfilesDb = perfilesResult.data || []
        const vigiladoresDb = vigiladoresResult.data || []
        const lecturas = new Set((lecturasResult.data || []).map((l) => l.id_aviso))

        const empresaMap = new Map(empresasDb.map((e) => [e.id, e.nombre]))
        const objetivoMap = new Map(objetivosDb.map((o) => [o.id, o.nombre]))
        const perfilMap = new Map(perfilesDb.map((p) => [p.id, p]))

        const perfilesVigiladores = vigiladoresDb
          .map((v) => {
            const perfil = v.id_usuario ? perfilMap.get(v.id_usuario) : null
            if (!perfil) return null
            return {
              id: v.id_usuario,
              email: '',
              nombre: perfil.nombre,
              apellido: perfil.apellido,
              rol: perfil.rol,
              id_empresa: perfil.id_empresa,
              empresa_nombre: perfil.id_empresa ? empresaMap.get(perfil.id_empresa) || null : null,
              telefono: perfil.telefono,
              activo: perfil.activo && v.activo,
              debe_cambiar_contrasena: perfil.debe_cambiar_contrasena,
              creado_en: perfil.creado_en
            } satisfies Usuario
          })
          .filter((v): v is Usuario => Boolean(v))

        setEmpresas(empresasDb.map((e) => ({
          id: e.id, nombre: e.nombre, cuit: e.cuit || '', direccion: e.direccion || '',
          activa: e.activa, creada_en: e.creada_en
        })))
        setObjetivos(objetivosDb.map((o) => ({
          id: o.id, id_empresa: o.id_empresa, nombre: o.nombre, descripcion: o.descripcion || '',
          direccion: o.direccion || '', localidad: o.localidad || '', provincia: o.provincia || '',
          activo: o.activo, creado_en: o.creado_en
        })).filter((o) => usuario.rol === 'super_administrador' || o.id_empresa === empresaId))
        setVigiladores(perfilesVigiladores.filter((v) => usuario.rol === 'super_administrador' || v.id_empresa === empresaId))
        setAsignaciones((asignacionesResult.data || []).map((a) => ({
          id: a.id, id_vigilador: a.id_vigilador, id_objetivo: a.id_objetivo,
          objetivo_nombre: objetivoMap.get(a.id_objetivo), fecha_inicio: a.fecha_inicio,
          fecha_fin: a.fecha_fin, activa: a.activa, motivo_traslado: a.motivo_traslado,
          creado_por: a.creado_por || '', creado_en: a.creado_en
        })).filter((a) => usuario.rol === 'super_administrador' || a.id_empresa === empresaId))
        setTurnos((turnosResult.data || []).map((t) => ({
          id: t.id, id_empresa: t.id_empresa, id_objetivo: t.id_objetivo, id_vigilador: t.id_vigilador,
          fecha: t.fecha, hora_inicio: t.hora_inicio || '00:00', hora_fin: t.hora_fin || '00:00',
          horas_totales: Number(t.horas_totales || 0), tipo: t.tipo, horas_diurnas: Number(t.horas_diurnas || 0),
          horas_nocturnas: Number(t.horas_nocturnas || 0), es_feriado: t.es_feriado, es_domingo: t.es_domingo,
          horas_extra: Number(t.horas_extra || 0), estado: t.estado
        })).filter((t) => usuario.rol === 'super_administrador' || t.id_empresa === empresaId))
        setNovedades((novedadesResult.data || []).map((n) => ({
          id: n.id, id_empresa: n.id_empresa, id_objetivo: n.id_objetivo, id_vigilador: n.id_vigilador || '',
          nombre_vigilante: n.nombre_vigilante, nombre_supervisor: n.nombre_supervisor || '',
          fecha: n.fecha, hora: n.hora, turno: n.turno || '', elementos_a_cargo: n.elementos_a_cargo || '',
          informe_novedades: n.informe_novedades
        })).filter((n) => usuario.rol === 'super_administrador' || n.id_empresa === empresaId))
        setSolicitudesCambio((solicitudesResult.data || []).map((s) => ({
          id: s.id, id_empresa: s.id_empresa, id_solicitante: s.id_solicitante, id_destinatario: s.id_destinatario || '',
          id_turno_origen: s.id_turno_origen, fecha_turno: s.fecha_turno, estado: s.estado,
          motivo: s.motivo || '', creado_en: s.creado_en
        })).filter((s) => usuario.rol === 'super_administrador' || s.id_empresa === empresaId))
        setAvisos((avisosResult.data || []).map((a) => ({
          id: a.id, id_empresa: a.id_empresa, autor_nombre: a.autor_id ? (perfilMap.get(a.autor_id) ? `${perfilMap.get(a.autor_id)!.nombre} ${perfilMap.get(a.autor_id)!.apellido}` : 'Administración') : 'Administración',
          titulo: a.titulo, contenido: a.contenido, prioridad: a.prioridad, leido: lecturas.has(a.id), creado_en: a.creado_en
        })).filter((a) => usuario.rol === 'super_administrador' || a.id_empresa === empresaId))
        setAuditorias((auditoriaResult.data || []).map((a) => ({
          id: a.id, id_usuario: a.id_usuario || '', usuario_nombre: a.id_usuario && perfilMap.get(a.id_usuario) ? `${perfilMap.get(a.id_usuario)!.nombre} ${perfilMap.get(a.id_usuario)!.apellido}` : 'Sistema',
          accion: a.accion, entidad: a.entidad, detalle: JSON.stringify(a.detalle || {}), fecha_hora: a.fecha_hora
        })).filter((a) => usuario.rol === 'super_administrador' || a.id_empresa === empresaId))
      } catch (error) {
        console.error('Error cargando datos operativos desde Supabase:', error)
      }
    }

    cargarDatosOperativos()
    return () => { cancelado = true }
  }, [usuario])

  const registrarAuditoria = (accion: string, entidad: string, detalle: string) => {
    const nuevo: RegistroAuditoria = {
      id: `aud-${Date.now()}`,
      id_usuario: usuario?.id || 'sistema',
      usuario_nombre: usuario ? `${usuario.nombre} ${usuario.apellido}` : 'Sistema',
      accion,
      entidad,
      detalle,
      fecha_hora: new Date().toISOString()
    }
    setAuditorias((prev) => [nuevo, ...prev])
  }

  // Empresas
  const crearEmpresa = (datos: { nombre: string; cuit?: string; direccion?: string }) => {
    if (supabase) {
      void (async () => {
        const { data, error } = await supabase.from('empresas').insert({
          nombre: datos.nombre, cuit: datos.cuit || null, direccion: datos.direccion || null
        }).select('*').single()
        if (error) { console.error('Error creando empresa:', error); return }
        setEmpresas((prev) => [data as Empresa, ...prev])
        if (usuario) {
          await supabase.from('auditoria').insert({
            id_empresa: usuario.id_empresa || data.id, id_usuario: usuario.id,
            accion: 'CREAR_EMPRESA', entidad: 'Empresa', entidad_id: data.id,
            detalle: { texto: `Creó la empresa ${datos.nombre}` }
          })
        }
      })()
      return
    }
    const nueva: Empresa = {
      id: `emp-${Date.now()}`,
      nombre: datos.nombre,
      cuit: datos.cuit || '',
      direccion: datos.direccion || '',
      activa: true,
      creada_en: new Date().toISOString()
    }
    setEmpresas((prev) => [nueva, ...prev])
    registrarAuditoria('CREAR_EMPRESA', 'Empresa', `Creó la empresa ${datos.nombre}`)
  }

  const editarEmpresa = (id: string, datos: Partial<Empresa>) => {
    if (supabase) {
      void (async () => {
        const { data, error } = await supabase.from('empresas').update({
          nombre: datos.nombre, cuit: datos.cuit || null, direccion: datos.direccion || null,
          activa: datos.activa
        }).eq('id', id).select('*').single()
        if (error) { console.error('Error editando empresa:', error); return }
        setEmpresas((prev) => prev.map((e) => e.id === id ? data as Empresa : e))
      })()
      return
    }
    setEmpresas((prev) => prev.map((e) => (e.id === id ? { ...e, ...datos } : e)))
    registrarAuditoria('EDITAR_EMPRESA', 'Empresa', `Modificó empresa ID: ${id}`)
  }

  const eliminarEmpresa = (id: string) => {
    if (supabase) {
      void (async () => {
        const { error } = await supabase.from('empresas').update({ activa: false }).eq('id', id)
        if (error) { console.error('Error desactivando empresa:', error); return }
        setEmpresas((prev) => prev.map((e) => e.id === id ? { ...e, activa: false } : e))
      })()
      return
    }
    setEmpresas((prev) => prev.filter((e) => e.id !== id))
    registrarAuditoria('ELIMINAR_EMPRESA', 'Empresa', `Eliminó empresa ID: ${id}`)
  }

  // Objetivos
  const crearObjetivo = (datos: {
    id_empresa: string
    nombre: string
    descripcion?: string
    direccion: string
    localidad: string
    provincia: string
  }) => {
    if (supabase) {
      void (async () => {
        const { data, error } = await supabase.from('objetivos').insert({
          id_empresa: datos.id_empresa, nombre: datos.nombre, descripcion: datos.descripcion || null,
          direccion: datos.direccion, localidad: datos.localidad, provincia: datos.provincia, activo: true
        }).select('*').single()
        if (error) { console.error('Error creando objetivo:', error); return }
        setObjetivos((prev) => [data as Objetivo, ...prev])
      })()
      return
    }
    const nuevo: Objetivo = {
      id: `obj-${Date.now()}`, id_empresa: datos.id_empresa, nombre: datos.nombre,
      descripcion: datos.descripcion || '', direccion: datos.direccion, localidad: datos.localidad,
      provincia: datos.provincia, activo: true, creado_en: new Date().toISOString()
    }
    setObjetivos((prev) => [nuevo, ...prev])
    registrarAuditoria('CREAR_OBJETIVO', 'Objetivo', `Creó el objetivo ${datos.nombre} en ${datos.localidad}`)
  }

  const editarObjetivo = (id: string, datos: Partial<Objetivo>) => {
    if (supabase) {
      void (async () => {
        const { data, error } = await supabase.from('objetivos').update({
          nombre: datos.nombre, descripcion: datos.descripcion || null, direccion: datos.direccion,
          localidad: datos.localidad, provincia: datos.provincia, activo: datos.activo
        }).eq('id', id).select('*').single()
        if (error) { console.error('Error editando objetivo:', error); return }
        setObjetivos((prev) => prev.map((o) => o.id === id ? data as Objetivo : o))
      })()
      return
    }
    setObjetivos((prev) => prev.map((o) => (o.id === id ? { ...o, ...datos } : o)))
    registrarAuditoria('EDITAR_OBJETIVO', 'Objetivo', `Editó objetivo ID: ${id}`)
  }

  const eliminarObjetivo = (id: string) => {
    if (supabase) {
      void (async () => {
        const { error } = await supabase.from('objetivos').update({ activo: false }).eq('id', id)
        if (error) { console.error('Error desactivando objetivo:', error); return }
        setObjetivos((prev) => prev.map((o) => o.id === id ? { ...o, activo: false } : o))
      })()
      return
    }
    setObjetivos((prev) => prev.filter((o) => o.id !== id))
    registrarAuditoria('ELIMINAR_OBJETIVO', 'Objetivo', `Eliminó objetivo ID: ${id}`)
  }

  // Vigiladores
  const crearVigilador = (datos: {
    nombre: string
    apellido: string
    email: string
    telefono?: string
    id_empresa: string
    id_objetivo_inicial?: string
  }) => {
    const nuevoId = `usr-vig-${Date.now()}`
    const emp = empresas.find((e) => e.id === datos.id_empresa)

    const nuevo: Usuario = {
      id: nuevoId,
      email: datos.email,
      nombre: datos.nombre,
      apellido: datos.apellido,
      rol: 'vigilador',
      id_empresa: datos.id_empresa,
      empresa_nombre: emp ? emp.nombre : 'Empresa',
      telefono: datos.telefono || '',
      activo: true,
      debe_cambiar_contrasena: true,
      creado_en: new Date().toISOString()
    }
    setVigiladores((prev) => [nuevo, ...prev])

    if (datos.id_objetivo_inicial) {
      const obj = objetivos.find((o) => o.id === datos.id_objetivo_inicial)
      const asig: Asignacion = {
        id: `asig-${Date.now()}`,
        id_vigilador: nuevoId,
        id_objetivo: datos.id_objetivo_inicial,
        objetivo_nombre: obj ? obj.nombre : 'Objetivo inicial',
        fecha_inicio: new Date().toISOString().split('T')[0],
        fecha_fin: null,
        activa: true,
        motivo_traslado: 'Asignación inicial al dar de alta',
        creado_por: usuario ? `${usuario.nombre} ${usuario.apellido}` : 'Administrador',
        creado_en: new Date().toISOString()
      }
      setAsignaciones((prev) => [asig, ...prev])
    }

    registrarAuditoria('CREAR_VIGILADOR', 'Usuario', `Alta de vigilador ${datos.nombre} ${datos.apellido}`)
  }

  const editarVigilador = (id: string, datos: Partial<Usuario>) => {
    setVigiladores((prev) => prev.map((v) => (v.id === id ? { ...v, ...datos } : v)))
    registrarAuditoria('EDITAR_VIGILADOR', 'Usuario', `Editó datos de vigilador ID: ${id}`)
  }

  const eliminarVigilador = (id: string) => {
    setVigiladores((prev) => prev.filter((v) => v.id !== id))
    registrarAuditoria('ELIMINAR_VIGILADOR', 'Usuario', `Baja de vigilador ID: ${id}`)
  }

  // Traslados y Asignaciones (Sección 20 y 21)
  const trasladarVigilador = ({
    id_vigilador,
    id_nuevo_objetivo,
    fecha_efectiva,
    motivo,
    accion_turnos_futuros
  }: {
    id_vigilador: string
    id_nuevo_objetivo: string
    fecha_efectiva: string
    motivo: string
    accion_turnos_futuros: 'mantener' | 'reasignar' | 'cancelar'
  }) => {
    const vig = vigiladores.find((v) => v.id === id_vigilador)
    const objNuevo = objetivos.find((o) => o.id === id_nuevo_objetivo)
    const dbVigiladorId = vig ? vigiladorPorUsuario.get(vig.id)?.id : undefined
    if (!vig || !objNuevo || !dbVigiladorId || !supabase || !usuario) return

    void (async () => {
      const { data: actual, error: cerrarError } = await supabase
        .from('asignaciones')
        .update({ activa: false, fecha_fin: fecha_efectiva })
        .eq('id_vigilador', dbVigiladorId)
        .eq('activa', true)
        .select('*')

      if (cerrarError) { console.error('Error cerrando asignación anterior:', cerrarError); return }

      const { data: nueva, error: nuevaError } = await supabase.from('asignaciones').insert({
        id_empresa: usuario.id_empresa, id_vigilador: dbVigiladorId, id_objetivo: id_nuevo_objetivo,
        fecha_inicio: fecha_efectiva, fecha_fin: null, activa: true,
        motivo_traslado: motivo, creado_por: usuario.id
      }).select('*').single()

      if (nuevaError) { console.error('Error creando nueva asignación:', nuevaError); return }

      if (accion_turnos_futuros === 'reasignar') {
        const { error } = await supabase.from('turnos').update({ id_objetivo: id_nuevo_objetivo })
          .eq('id_vigilador', dbVigiladorId).gte('fecha', fecha_efectiva)
        if (error) { console.error('Error reasignando turnos futuros:', error); return }
      } else if (accion_turnos_futuros === 'cancelar') {
        const { error } = await supabase.from('turnos').delete()
          .eq('id_vigilador', dbVigiladorId).gte('fecha', fecha_efectiva)
        if (error) { console.error('Error cancelando turnos futuros:', error); return }
      }

      setAsignaciones((prev) => [
        {
          id: nueva.id, id_vigilador, id_objetivo: nueva.id_objetivo, objetivo_nombre: objNuevo.nombre,
          fecha_inicio: nueva.fecha_inicio, fecha_fin: nueva.fecha_fin, activa: nueva.activa,
          motivo_traslado: nueva.motivo_traslado, creado_por: usuario.id, creado_en: nueva.creado_en
        },
        ...prev.map((asig) =>
          asig.id_vigilador === id_vigilador && asig.activa
            ? { ...asig, activa: false, fecha_fin: fecha_efectiva }
            : asig
        )
      ])

      if (accion_turnos_futuros === 'reasignar') {
        setTurnos((prev) => prev.map((t) =>
          t.id_vigilador === id_vigilador && t.fecha >= fecha_efectiva
            ? { ...t, id_objetivo: id_nuevo_objetivo }
            : t
        ))
      } else if (accion_turnos_futuros === 'cancelar') {
        setTurnos((prev) => prev.filter((t) => !(t.id_vigilador === id_vigilador && t.fecha >= fecha_efectiva)))
      }

      await supabase.from('auditoria').insert({
        id_empresa: usuario.id_empresa, id_usuario: usuario.id, accion: 'TRASLADO_VIGILADOR',
        entidad: 'Asignacion', entidad_id: nueva.id,
        detalle: { vigilador: `${vig.nombre} ${vig.apellido}`, objetivo: objNuevo.nombre, fecha_efectiva, motivo, accion_turnos_futuros }
      })

      void actual
    })()
  }

  // Grilla Mensual y Turnos (Sección 22 y 23)
  asignarTurnoGrilla: (parametros: {
    id_vigilador: string
    id_objetivo: string
    fecha: string
    codigo: '12☀️' | '12🌙' | '10' | '8' | 'F' | 'borrar'
  }) => void

  // Libro de Novedades (Sección 32)
  crearNovedad: (datos: {
    id_objetivo: string
    id_vigilador: string
    nombre_vigilante: string
    nombre_supervisor: string
    fecha: string
    hora: string
    turno: string
    elementos_a_cargo: string
    informe_novedades: string
  }) => void
  editarNovedad: (id: string, datos: { informe_novedades: string; motivo_correccion: string }) => void

  // Cambios de Turno (Sección 29)
  solicitarCambioTurno: (datos: {
    id_solicitante: string
    id_destinatario: string
    id_turno_origen: string
    fecha_turno: string
    motivo: string
  }) => void
  responderSolicitudCambio: (id_solicitud: string, aceptado: boolean) => void
  aprobarCambioAdmin: (id_solicitud: string, aprobado: boolean) => void

  // Avisos (Sección 31)
  crearAviso: (datos: { titulo: string; contenido: string; prioridad: Aviso['prioridad'] }) => void
  marcarAvisoLeido: (id: string) => void
}

const ContextoOperativo = createContext<ContextoOperativoTipo | undefined>(undefined)

const CLAVE_STORE = 'gsp_seguridad_pro_db_v1'

export const ProveedorOperativo: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { usuario } = useAutenticacion()

  const [empresas, setEmpresas] = useState<Empresa[]>([])
  const [objetivos, setObjetivos] = useState<Objetivo[]>([])
  const [vigiladores, setVigiladores] = useState<Usuario[]>([])
  const [asignaciones, setAsignaciones] = useState<Asignacion[]>([])
  const [turnos, setTurnos] = useState<Turno[]>([])
  const [novedades, setNovedades] = useState<NovedadLibro[]>([])
  const [solicitudesCambio, setSolicitudesCambio] = useState<SolicitudCambio[]>([])
  const [avisos, setAvisos] = useState<Aviso[]>([])
  const [auditorias, setAuditorias] = useState<RegistroAuditoria[]>([])

  useEffect(() => {
    if (!usuario || !supabase) return

    let cancelado = false

    const cargarDatosOperativos = async () => {
      try {
        const empresaId = usuario.id_empresa

        const [
          empresasResult,
          objetivosResult,
          perfilesResult,
          vigiladoresResult,
          asignacionesResult,
          turnosResult,
          novedadesResult,
          solicitudesResult,
          avisosResult,
          auditoriaResult,
          lecturasResult
        ] = await Promise.all([
          usuario.rol === 'super_administrador'
            ? supabase.from('empresas').select('*').order('nombre')
            : supabase.from('empresas').select('*').eq('id', empresaId).order('nombre'),
          supabase.from('objetivos').select('*').order('nombre'),
          supabase.from('perfiles').select('id,id_empresa,nombre,apellido,telefono,rol,activo,debe_cambiar_contrasena,creado_en'),
          supabase.from('vigiladores').select('*').order('apellido'),
          supabase.from('asignaciones').select('*').order('fecha_inicio', { ascending: false }),
          supabase.from('turnos').select('*').order('fecha', { ascending: true }),
          supabase.from('novedades_libro').select('*').order('fecha', { ascending: false }).order('hora', { ascending: false }),
          supabase.from('solicitudes_cambio').select('*').order('creado_en', { ascending: false }),
          supabase.from('avisos').select('*').order('creado_en', { ascending: false }),
          supabase.from('auditoria').select('*').order('fecha_hora', { ascending: false }),
          supabase.from('avisos_lecturas').select('id_aviso,id_usuario').eq('id_usuario', usuario.id)
        ])

        const resultados = [
          empresasResult, objetivosResult, perfilesResult, vigiladoresResult,
          asignacionesResult, turnosResult, novedadesResult, solicitudesResult,
          avisosResult, auditoriaResult, lecturasResult
        ]

        const error = resultados.find((r) => r.error)?.error
        if (error) throw error
        if (cancelado) return

        const empresasDb = empresasResult.data || []
        const objetivosDb = objetivosResult.data || []
        const perfilesDb = perfilesResult.data || []
        const vigiladoresDb = vigiladoresResult.data || []
        const lecturas = new Set((lecturasResult.data || []).map((l) => l.id_aviso))

        const empresaMap = new Map(empresasDb.map((e) => [e.id, e.nombre]))
        const objetivoMap = new Map(objetivosDb.map((o) => [o.id, o.nombre]))
        const perfilMap = new Map(perfilesDb.map((p) => [p.id, p]))
        const vigiladorPorUsuario = new Map(vigiladoresDb.filter((v) => v.id_usuario).map((v) => [v.id_usuario, v]))
        const usuarioPorVigilador = new Map(vigiladoresDb.filter((v) => v.id_usuario).map((v) => [v.id, v.id_usuario]))

        const perfilesVigiladores = vigiladoresDb
          .map((v) => {
            const perfil = v.id_usuario ? perfilMap.get(v.id_usuario) : null
            if (!perfil) return null
            return {
              id: v.id_usuario,
              email: '',
              nombre: perfil.nombre,
              apellido: perfil.apellido,
              rol: perfil.rol,
              id_empresa: perfil.id_empresa,
              empresa_nombre: perfil.id_empresa ? empresaMap.get(perfil.id_empresa) || null : null,
              telefono: perfil.telefono,
              activo: perfil.activo && v.activo,
              debe_cambiar_contrasena: perfil.debe_cambiar_contrasena,
              creado_en: perfil.creado_en
            } satisfies Usuario
          })
          .filter((v): v is Usuario => Boolean(v))

        setEmpresas(empresasDb.map((e) => ({
          id: e.id, nombre: e.nombre, cuit: e.cuit || '', direccion: e.direccion || '',
          activa: e.activa, creada_en: e.creada_en
        })))
        setObjetivos(objetivosDb.map((o) => ({
          id: o.id, id_empresa: o.id_empresa, nombre: o.nombre, descripcion: o.descripcion || '',
          direccion: o.direccion || '', localidad: o.localidad || '', provincia: o.provincia || '',
          activo: o.activo, creado_en: o.creado_en
        })).filter((o) => usuario.rol === 'super_administrador' || o.id_empresa === empresaId))
        setVigiladores(perfilesVigiladores.filter((v) => usuario.rol === 'super_administrador' || v.id_empresa === empresaId))
        setAsignaciones((asignacionesResult.data || []).map((a) => ({
          id: a.id, id_vigilador: usuarioPorVigilador.get(a.id_vigilador) || a.id_vigilador, id_objetivo: a.id_objetivo,
          objetivo_nombre: objetivoMap.get(a.id_objetivo), fecha_inicio: a.fecha_inicio,
          fecha_fin: a.fecha_fin, activa: a.activa, motivo_traslado: a.motivo_traslado,
          creado_por: a.creado_por || '', creado_en: a.creado_en
        })).filter((a) => usuario.rol === 'super_administrador' || a.id_empresa === empresaId))
        setTurnos((turnosResult.data || []).map((t) => ({
          id: t.id, id_empresa: t.id_empresa, id_objetivo: t.id_objetivo, id_vigilador: usuarioPorVigilador.get(t.id_vigilador) || t.id_vigilador,
          fecha: t.fecha, hora_inicio: t.hora_inicio || '00:00', hora_fin: t.hora_fin || '00:00',
          horas_totales: Number(t.horas_totales || 0), tipo: t.tipo, horas_diurnas: Number(t.horas_diurnas || 0),
          horas_nocturnas: Number(t.horas_nocturnas || 0), es_feriado: t.es_feriado, es_domingo: t.es_domingo,
          horas_extra: Number(t.horas_extra || 0), estado: t.estado
        })).filter((t) => usuario.rol === 'super_administrador' || t.id_empresa === empresaId))
        setNovedades((novedadesResult.data || []).map((n) => ({
          id: n.id, id_empresa: n.id_empresa, id_objetivo: n.id_objetivo, id_vigilador: n.id_vigilador || '',
          nombre_vigilante: n.nombre_vigilante, nombre_supervisor: n.nombre_supervisor || '',
          fecha: n.fecha, hora: n.hora, turno: n.turno || '', elementos_a_cargo: n.elementos_a_cargo || '',
          informe_novedades: n.informe_novedades
        })).filter((n) => usuario.rol === 'super_administrador' || n.id_empresa === empresaId))
        setSolicitudesCambio((solicitudesResult.data || []).map((s) => ({
          id: s.id, id_empresa: s.id_empresa, id_solicitante: s.id_solicitante, id_destinatario: s.id_destinatario || '',
          id_turno_origen: s.id_turno_origen, fecha_turno: s.fecha_turno, estado: s.estado,
          motivo: s.motivo || '', creado_en: s.creado_en
        })).filter((s) => usuario.rol === 'super_administrador' || s.id_empresa === empresaId))
        setAvisos((avisosResult.data || []).map((a) => ({
          id: a.id, id_empresa: a.id_empresa, autor_nombre: a.autor_id ? (perfilMap.get(a.autor_id) ? `${perfilMap.get(a.autor_id)!.nombre} ${perfilMap.get(a.autor_id)!.apellido}` : 'Administración') : 'Administración',
          titulo: a.titulo, contenido: a.contenido, prioridad: a.prioridad, leido: lecturas.has(a.id), creado_en: a.creado_en
        })).filter((a) => usuario.rol === 'super_administrador' || a.id_empresa === empresaId))
        setAuditorias((auditoriaResult.data || []).map((a) => ({
          id: a.id, id_usuario: a.id_usuario || '', usuario_nombre: a.id_usuario && perfilMap.get(a.id_usuario) ? `${perfilMap.get(a.id_usuario)!.nombre} ${perfilMap.get(a.id_usuario)!.apellido}` : 'Sistema',
          accion: a.accion, entidad: a.entidad, detalle: JSON.stringify(a.detalle || {}), fecha_hora: a.fecha_hora
        })).filter((a) => usuario.rol === 'super_administrador' || a.id_empresa === empresaId))
      } catch (error) {
        console.error('Error cargando datos operativos desde Supabase:', error)
      }
    }

    cargarDatosOperativos()
    return () => { cancelado = true }
  }, [usuario])

  const registrarAuditoria = (accion: string, entidad: string, detalle: string) => {
    const nuevo: RegistroAuditoria = {
      id: `aud-${Date.now()}`,
      id_usuario: usuario?.id || 'sistema',
      usuario_nombre: usuario ? `${usuario.nombre} ${usuario.apellido}` : 'Sistema',
      accion,
      entidad,
      detalle,
      fecha_hora: new Date().toISOString()
    }
    setAuditorias((prev) => [nuevo, ...prev])
  }

  // Empresas
  const crearEmpresa = (datos: { nombre: string; cuit?: string; direccion?: string }) => {
    if (supabase) {
      void (async () => {
        const { data, error } = await supabase.from('empresas').insert({
          nombre: datos.nombre, cuit: datos.cuit || null, direccion: datos.direccion || null
        }).select('*').single()
        if (error) { console.error('Error creando empresa:', error); return }
        setEmpresas((prev) => [data as Empresa, ...prev])
        if (usuario) {
          await supabase.from('auditoria').insert({
            id_empresa: usuario.id_empresa || data.id, id_usuario: usuario.id,
            accion: 'CREAR_EMPRESA', entidad: 'Empresa', entidad_id: data.id,
            detalle: { texto: `Creó la empresa ${datos.nombre}` }
          })
        }
      })()
      return
    }
    const nueva: Empresa = {
      id: `emp-${Date.now()}`,
      nombre: datos.nombre,
      cuit: datos.cuit || '',
      direccion: datos.direccion || '',
      activa: true,
      creada_en: new Date().toISOString()
    }
    setEmpresas((prev) => [nueva, ...prev])
    registrarAuditoria('CREAR_EMPRESA', 'Empresa', `Creó la empresa ${datos.nombre}`)
  }

  const editarEmpresa = (id: string, datos: Partial<Empresa>) => {
    if (supabase) {
      void (async () => {
        const { data, error } = await supabase.from('empresas').update({
          nombre: datos.nombre, cuit: datos.cuit || null, direccion: datos.direccion || null,
          activa: datos.activa
        }).eq('id', id).select('*').single()
        if (error) { console.error('Error editando empresa:', error); return }
        setEmpresas((prev) => prev.map((e) => e.id === id ? data as Empresa : e))
      })()
      return
    }
    setEmpresas((prev) => prev.map((e) => (e.id === id ? { ...e, ...datos } : e)))
    registrarAuditoria('EDITAR_EMPRESA', 'Empresa', `Modificó empresa ID: ${id}`)
  }

  const eliminarEmpresa = (id: string) => {
    if (supabase) {
      void (async () => {
        const { error } = await supabase.from('empresas').update({ activa: false }).eq('id', id)
        if (error) { console.error('Error desactivando empresa:', error); return }
        setEmpresas((prev) => prev.map((e) => e.id === id ? { ...e, activa: false } : e))
      })()
      return
    }
    setEmpresas((prev) => prev.filter((e) => e.id !== id))
    registrarAuditoria('ELIMINAR_EMPRESA', 'Empresa', `Eliminó empresa ID: ${id}`)
  }

  // Objetivos
  const crearObjetivo = (datos: {
    id_empresa: string
    nombre: string
    descripcion?: string
    direccion: string
    localidad: string
    provincia: string
  }) => {
    if (supabase) {
      void (async () => {
        const { data, error } = await supabase.from('objetivos').insert({
          id_empresa: datos.id_empresa, nombre: datos.nombre, descripcion: datos.descripcion || null,
          direccion: datos.direccion, localidad: datos.localidad, provincia: datos.provincia, activo: true
        }).select('*').single()
        if (error) { console.error('Error creando objetivo:', error); return }
        setObjetivos((prev) => [data as Objetivo, ...prev])
      })()
      return
    }
    const nuevo: Objetivo = {
      id: `obj-${Date.now()}`, id_empresa: datos.id_empresa, nombre: datos.nombre,
      descripcion: datos.descripcion || '', direccion: datos.direccion, localidad: datos.localidad,
      provincia: datos.provincia, activo: true, creado_en: new Date().toISOString()
    }
    setObjetivos((prev) => [nuevo, ...prev])
    registrarAuditoria('CREAR_OBJETIVO', 'Objetivo', `Creó el objetivo ${datos.nombre} en ${datos.localidad}`)
  }

  const editarObjetivo = (id: string, datos: Partial<Objetivo>) => {
    if (supabase) {
      void (async () => {
        const { data, error } = await supabase.from('objetivos').update({
          nombre: datos.nombre, descripcion: datos.descripcion || null, direccion: datos.direccion,
          localidad: datos.localidad, provincia: datos.provincia, activo: datos.activo
        }).eq('id', id).select('*').single()
        if (error) { console.error('Error editando objetivo:', error); return }
        setObjetivos((prev) => prev.map((o) => o.id === id ? data as Objetivo : o))
      })()
      return
    }
    setObjetivos((prev) => prev.map((o) => (o.id === id ? { ...o, ...datos } : o)))
    registrarAuditoria('EDITAR_OBJETIVO', 'Objetivo', `Editó objetivo ID: ${id}`)
  }

  const eliminarObjetivo = (id: string) => {
    if (supabase) {
      void (async () => {
        const { error } = await supabase.from('objetivos').update({ activo: false }).eq('id', id)
        if (error) { console.error('Error desactivando objetivo:', error); return }
        setObjetivos((prev) => prev.map((o) => o.id === id ? { ...o, activo: false } : o))
      })()
      return
    }
    setObjetivos((prev) => prev.filter((o) => o.id !== id))
    registrarAuditoria('ELIMINAR_OBJETIVO', 'Objetivo', `Eliminó objetivo ID: ${id}`)
  }

  const crearVigilador = (datos: {
    nombre: string
    apellido: string
    email: string
    telefono?: string
    id_empresa: string
    id_objetivo_inicial?: string
  }) => {
    if (!supabase) return

    void (async () => {
      const { data, error } = await supabase.functions.invoke('crear-vigilador', {
        body: datos
      })

      if (error || data?.error) {
        console.error('Error creando vigilador:', error || data?.error)
        return
      }

      const perfil = data.profile
      const empresa = empresas.find((e) => e.id === datos.id_empresa)

      const nuevo: Usuario = {
        id: perfil.id,
        email: datos.email,
        nombre: perfil.nombre,
        apellido: perfil.apellido,
        rol: 'vigilador',
        id_empresa: datos.id_empresa,
        empresa_nombre: empresa?.nombre || null,
        telefono: perfil.telefono,
        activo: perfil.activo,
        debe_cambiar_contrasena: perfil.debe_cambiar_contrasena,
        creado_en: perfil.creado_en
      }

      setVigiladores((prev) => [nuevo, ...prev])

      if (data.vigilador && datos.id_objetivo_inicial) {
        const obj = objetivos.find((o) => o.id === datos.id_objetivo_inicial)
        const asignacion = {
          id: data.asignacion?.id || `asig-${Date.now()}`,
          id_vigilador: data.vigilador.id,
          id_objetivo: datos.id_objetivo_inicial,
          objetivo_nombre: obj?.nombre,
          fecha_inicio: new Date().toISOString().split('T')[0],
          fecha_fin: null,
          activa: true,
          motivo_traslado: 'Asignación inicial al dar de alta',
          creado_por: usuario?.id || '',
          creado_en: new Date().toISOString()
        } satisfies Asignacion
        setAsignaciones((prev) => [asignacion, ...prev])
      }

      console.info('Vigilador creado. Entregar la contraseña temporal de forma segura:', data.temporary_password)
    })()
  }

  // Traslados y Asignaciones (Sección 20 y 21)
  trasladarVigilador: (parametros: {
    id_vigilador: string
    id_nuevo_objetivo: string
    fecha_efectiva: string
    motivo: string
    accion_turnos_futuros: 'mantener' | 'reasignar' | 'cancelar'
  }) => void

  // Grilla Mensual y Turnos (Sección 22 y 23)
  asignarTurnoGrilla: (parametros: {
    id_vigilador: string
    id_objetivo: string
    fecha: string
    codigo: '12☀️' | '12🌙' | '10' | '8' | 'F' | 'borrar'
  }) => void

  // Libro de Novedades (Sección 32)
  crearNovedad: (datos: {
    id_objetivo: string
    id_vigilador: string
    nombre_vigilante: string
    nombre_supervisor: string
    fecha: string
    hora: string
    turno: string
    elementos_a_cargo: string
    informe_novedades: string
  }) => void
  editarNovedad: (id: string, datos: { informe_novedades: string; motivo_correccion: string }) => void

  // Cambios de Turno (Sección 29)
  solicitarCambioTurno: (datos: {
    id_solicitante: string
    id_destinatario: string
    id_turno_origen: string
    fecha_turno: string
    motivo: string
  }) => void
  responderSolicitudCambio: (id_solicitud: string, aceptado: boolean) => void
  aprobarCambioAdmin: (id_solicitud: string, aprobado: boolean) => void

  // Avisos (Sección 31)
  crearAviso: (datos: { titulo: string; contenido: string; prioridad: Aviso['prioridad'] }) => void
  marcarAvisoLeido: (id: string) => void
}

const ContextoOperativo = createContext<ContextoOperativoTipo | undefined>(undefined)

const CLAVE_STORE = 'gsp_seguridad_pro_db_v1'

export const ProveedorOperativo: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { usuario } = useAutenticacion()

  const [empresas, setEmpresas] = useState<Empresa[]>([])
  const [objetivos, setObjetivos] = useState<Objetivo[]>([])
  const [vigiladores, setVigiladores] = useState<Usuario[]>([])
  const [asignaciones, setAsignaciones] = useState<Asignacion[]>([])
  const [turnos, setTurnos] = useState<Turno[]>([])
  const [novedades, setNovedades] = useState<NovedadLibro[]>([])
  const [solicitudesCambio, setSolicitudesCambio] = useState<SolicitudCambio[]>([])
  const [avisos, setAvisos] = useState<Aviso[]>([])
  const [auditorias, setAuditorias] = useState<RegistroAuditoria[]>([])

  useEffect(() => {
    if (!usuario || !supabase) return

    let cancelado = false

    const cargarDatosOperativos = async () => {
      try {
        const empresaId = usuario.id_empresa

        const [
          empresasResult,
          objetivosResult,
          perfilesResult,
          vigiladoresResult,
          asignacionesResult,
          turnosResult,
          novedadesResult,
          solicitudesResult,
          avisosResult,
          auditoriaResult,
          lecturasResult
        ] = await Promise.all([
          usuario.rol === 'super_administrador'
            ? supabase.from('empresas').select('*').order('nombre')
            : supabase.from('empresas').select('*').eq('id', empresaId).order('nombre'),
          supabase.from('objetivos').select('*').order('nombre'),
          supabase.from('perfiles').select('id,id_empresa,nombre,apellido,telefono,rol,activo,debe_cambiar_contrasena,creado_en'),
          supabase.from('vigiladores').select('*').order('apellido'),
          supabase.from('asignaciones').select('*').order('fecha_inicio', { ascending: false }),
          supabase.from('turnos').select('*').order('fecha', { ascending: true }),
          supabase.from('novedades_libro').select('*').order('fecha', { ascending: false }).order('hora', { ascending: false }),
          supabase.from('solicitudes_cambio').select('*').order('creado_en', { ascending: false }),
          supabase.from('avisos').select('*').order('creado_en', { ascending: false }),
          supabase.from('auditoria').select('*').order('fecha_hora', { ascending: false }),
          supabase.from('avisos_lecturas').select('id_aviso,id_usuario').eq('id_usuario', usuario.id)
        ])

        const resultados = [
          empresasResult, objetivosResult, perfilesResult, vigiladoresResult,
          asignacionesResult, turnosResult, novedadesResult, solicitudesResult,
          avisosResult, auditoriaResult, lecturasResult
        ]

        const error = resultados.find((r) => r.error)?.error
        if (error) throw error
        if (cancelado) return

        const empresasDb = empresasResult.data || []
        const objetivosDb = objetivosResult.data || []
        const perfilesDb = perfilesResult.data || []
        const vigiladoresDb = vigiladoresResult.data || []
        const lecturas = new Set((lecturasResult.data || []).map((l) => l.id_aviso))

        const empresaMap = new Map(empresasDb.map((e) => [e.id, e.nombre]))
        const objetivoMap = new Map(objetivosDb.map((o) => [o.id, o.nombre]))
        const perfilMap = new Map(perfilesDb.map((p) => [p.id, p]))

        const perfilesVigiladores = vigiladoresDb
          .map((v) => {
            const perfil = v.id_usuario ? perfilMap.get(v.id_usuario) : null
            if (!perfil) return null
            return {
              id: v.id_usuario,
              email: '',
              nombre: perfil.nombre,
              apellido: perfil.apellido,
              rol: perfil.rol,
              id_empresa: perfil.id_empresa,
              empresa_nombre: perfil.id_empresa ? empresaMap.get(perfil.id_empresa) || null : null,
              telefono: perfil.telefono,
              activo: perfil.activo && v.activo,
              debe_cambiar_contrasena: perfil.debe_cambiar_contrasena,
              creado_en: perfil.creado_en
            } satisfies Usuario
          })
          .filter((v): v is Usuario => Boolean(v))

        setEmpresas(empresasDb.map((e) => ({
          id: e.id, nombre: e.nombre, cuit: e.cuit || '', direccion: e.direccion || '',
          activa: e.activa, creada_en: e.creada_en
        })))
        setObjetivos(objetivosDb.map((o) => ({
          id: o.id, id_empresa: o.id_empresa, nombre: o.nombre, descripcion: o.descripcion || '',
          direccion: o.direccion || '', localidad: o.localidad || '', provincia: o.provincia || '',
          activo: o.activo, creado_en: o.creado_en
        })).filter((o) => usuario.rol === 'super_administrador' || o.id_empresa === empresaId))
        setVigiladores(perfilesVigiladores.filter((v) => usuario.rol === 'super_administrador' || v.id_empresa === empresaId))
        setAsignaciones((asignacionesResult.data || []).map((a) => ({
          id: a.id, id_vigilador: a.id_vigilador, id_objetivo: a.id_objetivo,
          objetivo_nombre: objetivoMap.get(a.id_objetivo), fecha_inicio: a.fecha_inicio,
          fecha_fin: a.fecha_fin, activa: a.activa, motivo_traslado: a.motivo_traslado,
          creado_por: a.creado_por || '', creado_en: a.creado_en
        })).filter((a) => usuario.rol === 'super_administrador' || a.id_empresa === empresaId))
        setTurnos((turnosResult.data || []).map((t) => ({
          id: t.id, id_empresa: t.id_empresa, id_objetivo: t.id_objetivo, id_vigilador: t.id_vigilador,
          fecha: t.fecha, hora_inicio: t.hora_inicio || '00:00', hora_fin: t.hora_fin || '00:00',
          horas_totales: Number(t.horas_totales || 0), tipo: t.tipo, horas_diurnas: Number(t.horas_diurnas || 0),
          horas_nocturnas: Number(t.horas_nocturnas || 0), es_feriado: t.es_feriado, es_domingo: t.es_domingo,
          horas_extra: Number(t.horas_extra || 0), estado: t.estado
        })).filter((t) => usuario.rol === 'super_administrador' || t.id_empresa === empresaId))
        setNovedades((novedadesResult.data || []).map((n) => ({
          id: n.id, id_empresa: n.id_empresa, id_objetivo: n.id_objetivo, id_vigilador: n.id_vigilador || '',
          nombre_vigilante: n.nombre_vigilante, nombre_supervisor: n.nombre_supervisor || '',
          fecha: n.fecha, hora: n.hora, turno: n.turno || '', elementos_a_cargo: n.elementos_a_cargo || '',
          informe_novedades: n.informe_novedades
        })).filter((n) => usuario.rol === 'super_administrador' || n.id_empresa === empresaId))
        setSolicitudesCambio((solicitudesResult.data || []).map((s) => ({
          id: s.id, id_empresa: s.id_empresa, id_solicitante: s.id_solicitante, id_destinatario: s.id_destinatario || '',
          id_turno_origen: s.id_turno_origen, fecha_turno: s.fecha_turno, estado: s.estado,
          motivo: s.motivo || '', creado_en: s.creado_en
        })).filter((s) => usuario.rol === 'super_administrador' || s.id_empresa === empresaId))
        setAvisos((avisosResult.data || []).map((a) => ({
          id: a.id, id_empresa: a.id_empresa, autor_nombre: a.autor_id ? (perfilMap.get(a.autor_id) ? `${perfilMap.get(a.autor_id)!.nombre} ${perfilMap.get(a.autor_id)!.apellido}` : 'Administración') : 'Administración',
          titulo: a.titulo, contenido: a.contenido, prioridad: a.prioridad, leido: lecturas.has(a.id), creado_en: a.creado_en
        })).filter((a) => usuario.rol === 'super_administrador' || a.id_empresa === empresaId))
        setAuditorias((auditoriaResult.data || []).map((a) => ({
          id: a.id, id_usuario: a.id_usuario || '', usuario_nombre: a.id_usuario && perfilMap.get(a.id_usuario) ? `${perfilMap.get(a.id_usuario)!.nombre} ${perfilMap.get(a.id_usuario)!.apellido}` : 'Sistema',
          accion: a.accion, entidad: a.entidad, detalle: JSON.stringify(a.detalle || {}), fecha_hora: a.fecha_hora
        })).filter((a) => usuario.rol === 'super_administrador' || a.id_empresa === empresaId))
      } catch (error) {
        console.error('Error cargando datos operativos desde Supabase:', error)
      }
    }

    cargarDatosOperativos()
    return () => { cancelado = true }
  }, [usuario])

  const registrarAuditoria = (accion: string, entidad: string, detalle: string) => {
    const nuevo: RegistroAuditoria = {
      id: `aud-${Date.now()}`,
      id_usuario: usuario?.id || 'sistema',
      usuario_nombre: usuario ? `${usuario.nombre} ${usuario.apellido}` : 'Sistema',
      accion,
      entidad,
      detalle,
      fecha_hora: new Date().toISOString()
    }
    setAuditorias((prev) => [nuevo, ...prev])
  }

  // Empresas
  const crearEmpresa = (datos: { nombre: string; cuit?: string; direccion?: string }) => {
    if (supabase) {
      void (async () => {
        const { data, error } = await supabase.from('empresas').insert({
          nombre: datos.nombre, cuit: datos.cuit || null, direccion: datos.direccion || null
        }).select('*').single()
        if (error) { console.error('Error creando empresa:', error); return }
        setEmpresas((prev) => [data as Empresa, ...prev])
        if (usuario) {
          await supabase.from('auditoria').insert({
            id_empresa: usuario.id_empresa || data.id, id_usuario: usuario.id,
            accion: 'CREAR_EMPRESA', entidad: 'Empresa', entidad_id: data.id,
            detalle: { texto: `Creó la empresa ${datos.nombre}` }
          })
        }
      })()
      return
    }
    const nueva: Empresa = {
      id: `emp-${Date.now()}`,
      nombre: datos.nombre,
      cuit: datos.cuit || '',
      direccion: datos.direccion || '',
      activa: true,
      creada_en: new Date().toISOString()
    }
    setEmpresas((prev) => [nueva, ...prev])
    registrarAuditoria('CREAR_EMPRESA', 'Empresa', `Creó la empresa ${datos.nombre}`)
  }

  const editarEmpresa = (id: string, datos: Partial<Empresa>) => {
    if (supabase) {
      void (async () => {
        const { data, error } = await supabase.from('empresas').update({
          nombre: datos.nombre, cuit: datos.cuit || null, direccion: datos.direccion || null,
          activa: datos.activa
        }).eq('id', id).select('*').single()
        if (error) { console.error('Error editando empresa:', error); return }
        setEmpresas((prev) => prev.map((e) => e.id === id ? data as Empresa : e))
      })()
      return
    }
    setEmpresas((prev) => prev.map((e) => (e.id === id ? { ...e, ...datos } : e)))
    registrarAuditoria('EDITAR_EMPRESA', 'Empresa', `Modificó empresa ID: ${id}`)
  }

  const eliminarEmpresa = (id: string) => {
    if (supabase) {
      void (async () => {
        const { error } = await supabase.from('empresas').update({ activa: false }).eq('id', id)
        if (error) { console.error('Error desactivando empresa:', error); return }
        setEmpresas((prev) => prev.map((e) => e.id === id ? { ...e, activa: false } : e))
      })()
      return
    }
    setEmpresas((prev) => prev.filter((e) => e.id !== id))
    registrarAuditoria('ELIMINAR_EMPRESA', 'Empresa', `Eliminó empresa ID: ${id}`)
  }

  // Objetivos
  const crearObjetivo = (datos: {
    id_empresa: string
    nombre: string
    descripcion?: string
    direccion: string
    localidad: string
    provincia: string
  }) => {
    if (supabase) {
      void (async () => {
        const { data, error } = await supabase.from('objetivos').insert({
          id_empresa: datos.id_empresa, nombre: datos.nombre, descripcion: datos.descripcion || null,
          direccion: datos.direccion, localidad: datos.localidad, provincia: datos.provincia, activo: true
        }).select('*').single()
        if (error) { console.error('Error creando objetivo:', error); return }
        setObjetivos((prev) => [data as Objetivo, ...prev])
      })()
      return
    }
    const nuevo: Objetivo = {
      id: `obj-${Date.now()}`, id_empresa: datos.id_empresa, nombre: datos.nombre,
      descripcion: datos.descripcion || '', direccion: datos.direccion, localidad: datos.localidad,
      provincia: datos.provincia, activo: true, creado_en: new Date().toISOString()
    }
    setObjetivos((prev) => [nuevo, ...prev])
    registrarAuditoria('CREAR_OBJETIVO', 'Objetivo', `Creó el objetivo ${datos.nombre} en ${datos.localidad}`)
  }

  const editarObjetivo = (id: string, datos: Partial<Objetivo>) => {
    if (supabase) {
      void (async () => {
        const { data, error } = await supabase.from('objetivos').update({
          nombre: datos.nombre, descripcion: datos.descripcion || null, direccion: datos.direccion,
          localidad: datos.localidad, provincia: datos.provincia, activo: datos.activo
        }).eq('id', id).select('*').single()
        if (error) { console.error('Error editando objetivo:', error); return }
        setObjetivos((prev) => prev.map((o) => o.id === id ? data as Objetivo : o))
      })()
      return
    }
    setObjetivos((prev) => prev.map((o) => (o.id === id ? { ...o, ...datos } : o)))
    registrarAuditoria('EDITAR_OBJETIVO', 'Objetivo', `Editó objetivo ID: ${id}`)
  }

  const eliminarObjetivo = (id: string) => {
    if (supabase) {
      void (async () => {
        const { error } = await supabase.from('objetivos').update({ activo: false }).eq('id', id)
        if (error) { console.error('Error desactivando objetivo:', error); return }
        setObjetivos((prev) => prev.map((o) => o.id === id ? { ...o, activo: false } : o))
      })()
      return
    }
    setObjetivos((prev) => prev.filter((o) => o.id !== id))
    registrarAuditoria('ELIMINAR_OBJETIVO', 'Objetivo', `Eliminó objetivo ID: ${id}`)
  }

  // Vigiladores
  const crearVigilador = (datos: {
    nombre: string
    apellido: string
    email: string
    telefono?: string
    id_empresa: string
    id_objetivo_inicial?: string
  }) => {
    if (!supabase) return

    void (async () => {
      // Auth se crea desde el panel administrativo mediante una Edge Function segura.
      // Aquí solo creamos el registro operativo cuando el perfil ya existe.
      const { data: perfil, error: perfilError } = await supabase
        .from('perfiles')
        .insert({
          id: crypto.randomUUID(),
          id_empresa: datos.id_empresa,
          nombre: datos.nombre,
          apellido: datos.apellido,
          telefono: datos.telefono || null,
          rol: 'vigilador',
          activo: true,
          debe_cambiar_contrasena: true
        })
        .select('*')
        .single()

      if (perfilError) {
        console.error('Error creando perfil de vigilador:', perfilError)
        return
      }

      const { data: vigilador, error: vigiladorError } = await supabase
        .from('vigiladores')
        .insert({
          id_empresa: datos.id_empresa,
          id_usuario: perfil.id,
          nombre: datos.nombre,
          apellido: datos.apellido,
          telefono: datos.telefono || null,
          activo: true
        })
        .select('*')
        .single()

      if (vigiladorError) {
        console.error('Error creando vigilador:', vigiladorError)
        await supabase.from('perfiles').delete().eq('id', perfil.id)
        return
      }

      const empresa = empresas.find((e) => e.id === datos.id_empresa)
      const nuevo: Usuario = {
        id: perfil.id, email: datos.email, nombre: datos.nombre, apellido: datos.apellido,
        rol: 'vigilador', id_empresa: datos.id_empresa,
        empresa_nombre: empresa?.nombre || null, telefono: datos.telefono || null,
        activo: true, debe_cambiar_contrasena: true, creado_en: perfil.creado_en
      }
      setVigiladores((prev) => [nuevo, ...prev])

      if (datos.id_objetivo_inicial) {
        const { data: asig, error: asigError } = await supabase.from('asignaciones').insert({
          id_empresa: datos.id_empresa, id_vigilador: vigilador.id,
          id_objetivo: datos.id_objetivo_inicial,
          fecha_inicio: new Date().toISOString().split('T')[0],
          activa: true, motivo_traslado: 'Asignación inicial al dar de alta',
          creado_por: usuario?.id || null
        }).select('*').single()

        if (!asigError && asig) {
          const obj = objetivos.find((o) => o.id === datos.id_objetivo_inicial)
          setAsignaciones((prev) => [{
            id: asig.id, id_vigilador: asig.id_vigilador, id_objetivo: asig.id_objetivo,
            objetivo_nombre: obj?.nombre, fecha_inicio: asig.fecha_inicio,
            fecha_fin: asig.fecha_fin, activa: asig.activa,
            motivo_traslado: asig.motivo_traslado, creado_por: asig.creado_por || '',
            creado_en: asig.creado_en
          }, ...prev])
        }
      }
    })()
  }

  const editarVigilador = (id: string, datos: Partial<Usuario>) => {
    if (!supabase) return
    void (async () => {
      const { error } = await supabase.from('perfiles').update({
        nombre: datos.nombre, apellido: datos.apellido, telefono: datos.telefono,
        activo: datos.activo, debe_cambiar_contrasena: datos.debe_cambiar_contrasena
      }).eq('id', id)
      if (error) { console.error('Error editando vigilador:', error); return }
      setVigiladores((prev) => prev.map((v) => v.id === id ? { ...v, ...datos } : v))
    })()
  }

  const eliminarVigilador = (id: string) => {
    if (!supabase) return
    void (async () => {
      const { error } = await supabase.from('vigiladores').update({ activo: false }).eq('id_usuario', id)
      if (error) { console.error('Error desactivando vigilador:', error); return }
      await supabase.from('perfiles').update({ activo: false }).eq('id', id)
      setVigiladores((prev) => prev.map((v) => v.id === id ? { ...v, activo: false } : v))
    })()
  }

  // Traslados y Asignaciones (Sección 20 y 21)
  trasladarVigilador: (parametros: {
    id_vigilador: string
    id_nuevo_objetivo: string
    fecha_efectiva: string
    motivo: string
    accion_turnos_futuros: 'mantener' | 'reasignar' | 'cancelar'
  }) => void

  // Grilla Mensual y Turnos (Sección 22 y 23)
  asignarTurnoGrilla: (parametros: {
    id_vigilador: string
    id_objetivo: string
    fecha: string
    codigo: '12☀️' | '12🌙' | '10' | '8' | 'F' | 'borrar'
  }) => void

  // Libro de Novedades (Sección 32)
  crearNovedad: (datos: {
    id_objetivo: string
    id_vigilador: string
    nombre_vigilante: string
    nombre_supervisor: string
    fecha: string
    hora: string
    turno: string
    elementos_a_cargo: string
    informe_novedades: string
  }) => void
  editarNovedad: (id: string, datos: { informe_novedades: string; motivo_correccion: string }) => void

  // Cambios de Turno (Sección 29)
  solicitarCambioTurno: (datos: {
    id_solicitante: string
    id_destinatario: string
    id_turno_origen: string
    fecha_turno: string
    motivo: string
  }) => void
  responderSolicitudCambio: (id_solicitud: string, aceptado: boolean) => void
  aprobarCambioAdmin: (id_solicitud: string, aprobado: boolean) => void

  // Avisos (Sección 31)
  crearAviso: (datos: { titulo: string; contenido: string; prioridad: Aviso['prioridad'] }) => void
  marcarAvisoLeido: (id: string) => void
}

const ContextoOperativo = createContext<ContextoOperativoTipo | undefined>(undefined)

const CLAVE_STORE = 'gsp_seguridad_pro_db_v1'

export const ProveedorOperativo: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { usuario } = useAutenticacion()

  const [empresas, setEmpresas] = useState<Empresa[]>([])
  const [objetivos, setObjetivos] = useState<Objetivo[]>([])
  const [vigiladores, setVigiladores] = useState<Usuario[]>([])
  const [asignaciones, setAsignaciones] = useState<Asignacion[]>([])
  const [turnos, setTurnos] = useState<Turno[]>([])
  const [novedades, setNovedades] = useState<NovedadLibro[]>([])
  const [solicitudesCambio, setSolicitudesCambio] = useState<SolicitudCambio[]>([])
  const [avisos, setAvisos] = useState<Aviso[]>([])
  const [auditorias, setAuditorias] = useState<RegistroAuditoria[]>([])

  useEffect(() => {
    if (!usuario || !supabase) return

    let cancelado = false

    const cargarDatosOperativos = async () => {
      try {
        const empresaId = usuario.id_empresa

        const [
          empresasResult,
          objetivosResult,
          perfilesResult,
          vigiladoresResult,
          asignacionesResult,
          turnosResult,
          novedadesResult,
          solicitudesResult,
          avisosResult,
          auditoriaResult,
          lecturasResult
        ] = await Promise.all([
          usuario.rol === 'super_administrador'
            ? supabase.from('empresas').select('*').order('nombre')
            : supabase.from('empresas').select('*').eq('id', empresaId).order('nombre'),
          supabase.from('objetivos').select('*').order('nombre'),
          supabase.from('perfiles').select('id,id_empresa,nombre,apellido,telefono,rol,activo,debe_cambiar_contrasena,creado_en'),
          supabase.from('vigiladores').select('*').order('apellido'),
          supabase.from('asignaciones').select('*').order('fecha_inicio', { ascending: false }),
          supabase.from('turnos').select('*').order('fecha', { ascending: true }),
          supabase.from('novedades_libro').select('*').order('fecha', { ascending: false }).order('hora', { ascending: false }),
          supabase.from('solicitudes_cambio').select('*').order('creado_en', { ascending: false }),
          supabase.from('avisos').select('*').order('creado_en', { ascending: false }),
          supabase.from('auditoria').select('*').order('fecha_hora', { ascending: false }),
          supabase.from('avisos_lecturas').select('id_aviso,id_usuario').eq('id_usuario', usuario.id)
        ])

        const resultados = [
          empresasResult, objetivosResult, perfilesResult, vigiladoresResult,
          asignacionesResult, turnosResult, novedadesResult, solicitudesResult,
          avisosResult, auditoriaResult, lecturasResult
        ]

        const error = resultados.find((r) => r.error)?.error
        if (error) throw error
        if (cancelado) return

        const empresasDb = empresasResult.data || []
        const objetivosDb = objetivosResult.data || []
        const perfilesDb = perfilesResult.data || []
        const vigiladoresDb = vigiladoresResult.data || []
        const lecturas = new Set((lecturasResult.data || []).map((l) => l.id_aviso))

        const empresaMap = new Map(empresasDb.map((e) => [e.id, e.nombre]))
        const objetivoMap = new Map(objetivosDb.map((o) => [o.id, o.nombre]))
        const perfilMap = new Map(perfilesDb.map((p) => [p.id, p]))

        const perfilesVigiladores = vigiladoresDb
          .map((v) => {
            const perfil = v.id_usuario ? perfilMap.get(v.id_usuario) : null
            if (!perfil) return null
            return {
              id: v.id_usuario,
              email: '',
              nombre: perfil.nombre,
              apellido: perfil.apellido,
              rol: perfil.rol,
              id_empresa: perfil.id_empresa,
              empresa_nombre: perfil.id_empresa ? empresaMap.get(perfil.id_empresa) || null : null,
              telefono: perfil.telefono,
              activo: perfil.activo && v.activo,
              debe_cambiar_contrasena: perfil.debe_cambiar_contrasena,
              creado_en: perfil.creado_en
            } satisfies Usuario
          })
          .filter((v): v is Usuario => Boolean(v))

        setEmpresas(empresasDb.map((e) => ({
          id: e.id, nombre: e.nombre, cuit: e.cuit || '', direccion: e.direccion || '',
          activa: e.activa, creada_en: e.creada_en
        })))
        setObjetivos(objetivosDb.map((o) => ({
          id: o.id, id_empresa: o.id_empresa, nombre: o.nombre, descripcion: o.descripcion || '',
          direccion: o.direccion || '', localidad: o.localidad || '', provincia: o.provincia || '',
          activo: o.activo, creado_en: o.creado_en
        })).filter((o) => usuario.rol === 'super_administrador' || o.id_empresa === empresaId))
        setVigiladores(perfilesVigiladores.filter((v) => usuario.rol === 'super_administrador' || v.id_empresa === empresaId))
        setAsignaciones((asignacionesResult.data || []).map((a) => ({
          id: a.id, id_vigilador: a.id_vigilador, id_objetivo: a.id_objetivo,
          objetivo_nombre: objetivoMap.get(a.id_objetivo), fecha_inicio: a.fecha_inicio,
          fecha_fin: a.fecha_fin, activa: a.activa, motivo_traslado: a.motivo_traslado,
          creado_por: a.creado_por || '', creado_en: a.creado_en
        })).filter((a) => usuario.rol === 'super_administrador' || a.id_empresa === empresaId))
        setTurnos((turnosResult.data || []).map((t) => ({
          id: t.id, id_empresa: t.id_empresa, id_objetivo: t.id_objetivo, id_vigilador: t.id_vigilador,
          fecha: t.fecha, hora_inicio: t.hora_inicio || '00:00', hora_fin: t.hora_fin || '00:00',
          horas_totales: Number(t.horas_totales || 0), tipo: t.tipo, horas_diurnas: Number(t.horas_diurnas || 0),
          horas_nocturnas: Number(t.horas_nocturnas || 0), es_feriado: t.es_feriado, es_domingo: t.es_domingo,
          horas_extra: Number(t.horas_extra || 0), estado: t.estado
        })).filter((t) => usuario.rol === 'super_administrador' || t.id_empresa === empresaId))
        setNovedades((novedadesResult.data || []).map((n) => ({
          id: n.id, id_empresa: n.id_empresa, id_objetivo: n.id_objetivo, id_vigilador: n.id_vigilador || '',
          nombre_vigilante: n.nombre_vigilante, nombre_supervisor: n.nombre_supervisor || '',
          fecha: n.fecha, hora: n.hora, turno: n.turno || '', elementos_a_cargo: n.elementos_a_cargo || '',
          informe_novedades: n.informe_novedades
        })).filter((n) => usuario.rol === 'super_administrador' || n.id_empresa === empresaId))
        setSolicitudesCambio((solicitudesResult.data || []).map((s) => ({
          id: s.id, id_empresa: s.id_empresa, id_solicitante: s.id_solicitante, id_destinatario: s.id_destinatario || '',
          id_turno_origen: s.id_turno_origen, fecha_turno: s.fecha_turno, estado: s.estado,
          motivo: s.motivo || '', creado_en: s.creado_en
        })).filter((s) => usuario.rol === 'super_administrador' || s.id_empresa === empresaId))
        setAvisos((avisosResult.data || []).map((a) => ({
          id: a.id, id_empresa: a.id_empresa, autor_nombre: a.autor_id ? (perfilMap.get(a.autor_id) ? `${perfilMap.get(a.autor_id)!.nombre} ${perfilMap.get(a.autor_id)!.apellido}` : 'Administración') : 'Administración',
          titulo: a.titulo, contenido: a.contenido, prioridad: a.prioridad, leido: lecturas.has(a.id), creado_en: a.creado_en
        })).filter((a) => usuario.rol === 'super_administrador' || a.id_empresa === empresaId))
        setAuditorias((auditoriaResult.data || []).map((a) => ({
          id: a.id, id_usuario: a.id_usuario || '', usuario_nombre: a.id_usuario && perfilMap.get(a.id_usuario) ? `${perfilMap.get(a.id_usuario)!.nombre} ${perfilMap.get(a.id_usuario)!.apellido}` : 'Sistema',
          accion: a.accion, entidad: a.entidad, detalle: JSON.stringify(a.detalle || {}), fecha_hora: a.fecha_hora
        })).filter((a) => usuario.rol === 'super_administrador' || a.id_empresa === empresaId))
      } catch (error) {
        console.error('Error cargando datos operativos desde Supabase:', error)
      }
    }

    cargarDatosOperativos()
    return () => { cancelado = true }
  }, [usuario])

  const registrarAuditoria = (accion: string, entidad: string, detalle: string) => {
    const nuevo: RegistroAuditoria = {
      id: `aud-${Date.now()}`,
      id_usuario: usuario?.id || 'sistema',
      usuario_nombre: usuario ? `${usuario.nombre} ${usuario.apellido}` : 'Sistema',
      accion,
      entidad,
      detalle,
      fecha_hora: new Date().toISOString()
    }
    setAuditorias((prev) => [nuevo, ...prev])
  }

  // Empresas
  const crearEmpresa = (datos: { nombre: string; cuit?: string; direccion?: string }) => {
    if (supabase) {
      void (async () => {
        const { data, error } = await supabase.from('empresas').insert({
          nombre: datos.nombre, cuit: datos.cuit || null, direccion: datos.direccion || null
        }).select('*').single()
        if (error) { console.error('Error creando empresa:', error); return }
        setEmpresas((prev) => [data as Empresa, ...prev])
        if (usuario) {
          await supabase.from('auditoria').insert({
            id_empresa: usuario.id_empresa || data.id, id_usuario: usuario.id,
            accion: 'CREAR_EMPRESA', entidad: 'Empresa', entidad_id: data.id,
            detalle: { texto: `Creó la empresa ${datos.nombre}` }
          })
        }
      })()
      return
    }
    const nueva: Empresa = {
      id: `emp-${Date.now()}`,
      nombre: datos.nombre,
      cuit: datos.cuit || '',
      direccion: datos.direccion || '',
      activa: true,
      creada_en: new Date().toISOString()
    }
    setEmpresas((prev) => [nueva, ...prev])
    registrarAuditoria('CREAR_EMPRESA', 'Empresa', `Creó la empresa ${datos.nombre}`)
  }

  const editarEmpresa = (id: string, datos: Partial<Empresa>) => {
    if (supabase) {
      void (async () => {
        const { data, error } = await supabase.from('empresas').update({
          nombre: datos.nombre, cuit: datos.cuit || null, direccion: datos.direccion || null,
          activa: datos.activa
        }).eq('id', id).select('*').single()
        if (error) { console.error('Error editando empresa:', error); return }
        setEmpresas((prev) => prev.map((e) => e.id === id ? data as Empresa : e))
      })()
      return
    }
    setEmpresas((prev) => prev.map((e) => (e.id === id ? { ...e, ...datos } : e)))
    registrarAuditoria('EDITAR_EMPRESA', 'Empresa', `Modificó empresa ID: ${id}`)
  }

  const eliminarEmpresa = (id: string) => {
    if (supabase) {
      void (async () => {
        const { error } = await supabase.from('empresas').update({ activa: false }).eq('id', id)
        if (error) { console.error('Error desactivando empresa:', error); return }
        setEmpresas((prev) => prev.map((e) => e.id === id ? { ...e, activa: false } : e))
      })()
      return
    }
    setEmpresas((prev) => prev.filter((e) => e.id !== id))
    registrarAuditoria('ELIMINAR_EMPRESA', 'Empresa', `Eliminó empresa ID: ${id}`)
  }

  // Objetivos
  const crearObjetivo = (datos: {
    id_empresa: string
    nombre: string
    descripcion?: string
    direccion: string
    localidad: string
    provincia: string
  }) => {
    if (supabase) {
      void (async () => {
        const { data, error } = await supabase.from('objetivos').insert({
          id_empresa: datos.id_empresa, nombre: datos.nombre, descripcion: datos.descripcion || null,
          direccion: datos.direccion, localidad: datos.localidad, provincia: datos.provincia, activo: true
        }).select('*').single()
        if (error) { console.error('Error creando objetivo:', error); return }
        setObjetivos((prev) => [data as Objetivo, ...prev])
      })()
      return
    }
    const nuevo: Objetivo = {
      id: `obj-${Date.now()}`, id_empresa: datos.id_empresa, nombre: datos.nombre,
      descripcion: datos.descripcion || '', direccion: datos.direccion, localidad: datos.localidad,
      provincia: datos.provincia, activo: true, creado_en: new Date().toISOString()
    }
    setObjetivos((prev) => [nuevo, ...prev])
    registrarAuditoria('CREAR_OBJETIVO', 'Objetivo', `Creó el objetivo ${datos.nombre} en ${datos.localidad}`)
  }

  const editarObjetivo = (id: string, datos: Partial<Objetivo>) => {
    if (supabase) {
      void (async () => {
        const { data, error } = await supabase.from('objetivos').update({
          nombre: datos.nombre, descripcion: datos.descripcion || null, direccion: datos.direccion,
          localidad: datos.localidad, provincia: datos.provincia, activo: datos.activo
        }).eq('id', id).select('*').single()
        if (error) { console.error('Error editando objetivo:', error); return }
        setObjetivos((prev) => prev.map((o) => o.id === id ? data as Objetivo : o))
      })()
      return
    }
    setObjetivos((prev) => prev.map((o) => (o.id === id ? { ...o, ...datos } : o)))
    registrarAuditoria('EDITAR_OBJETIVO', 'Objetivo', `Editó objetivo ID: ${id}`)
  }

  const eliminarObjetivo = (id: string) => {
    if (supabase) {
      void (async () => {
        const { error } = await supabase.from('objetivos').update({ activo: false }).eq('id', id)
        if (error) { console.error('Error desactivando objetivo:', error); return }
        setObjetivos((prev) => prev.map((o) => o.id === id ? { ...o, activo: false } : o))
      })()
      return
    }
    setObjetivos((prev) => prev.filter((o) => o.id !== id))
    registrarAuditoria('ELIMINAR_OBJETIVO', 'Objetivo', `Eliminó objetivo ID: ${id}`)
  }

  // Vigiladores
  const crearVigilador = (datos: {
    nombre: string
    apellido: string
    email: string
    telefono?: string
    id_empresa: string
    id_objetivo_inicial?: string
  }) => {
    const nuevoId = `usr-vig-${Date.now()}`
    const emp = empresas.find((e) => e.id === datos.id_empresa)

    const nuevo: Usuario = {
      id: nuevoId,
      email: datos.email,
      nombre: datos.nombre,
      apellido: datos.apellido,
      rol: 'vigilador',
      id_empresa: datos.id_empresa,
      empresa_nombre: emp ? emp.nombre : 'Empresa',
      telefono: datos.telefono || '',
      activo: true,
      debe_cambiar_contrasena: true,
      creado_en: new Date().toISOString()
    }
    setVigiladores((prev) => [nuevo, ...prev])

    if (datos.id_objetivo_inicial) {
      const obj = objetivos.find((o) => o.id === datos.id_objetivo_inicial)
      const asig: Asignacion = {
        id: `asig-${Date.now()}`,
        id_vigilador: nuevoId,
        id_objetivo: datos.id_objetivo_inicial,
        objetivo_nombre: obj ? obj.nombre : 'Objetivo inicial',
        fecha_inicio: new Date().toISOString().split('T')[0],
        fecha_fin: null,
        activa: true,
        motivo_traslado: 'Asignación inicial al dar de alta',
        creado_por: usuario ? `${usuario.nombre} ${usuario.apellido}` : 'Administrador',
        creado_en: new Date().toISOString()
      }
      setAsignaciones((prev) => [asig, ...prev])
    }

    registrarAuditoria('CREAR_VIGILADOR', 'Usuario', `Alta de vigilador ${datos.nombre} ${datos.apellido}`)
  }

  const editarVigilador = (id: string, datos: Partial<Usuario>) => {
    setVigiladores((prev) => prev.map((v) => (v.id === id ? { ...v, ...datos } : v)))
    registrarAuditoria('EDITAR_VIGILADOR', 'Usuario', `Editó datos de vigilador ID: ${id}`)
  }

  const eliminarVigilador = (id: string) => {
    setVigiladores((prev) => prev.filter((v) => v.id !== id))
    registrarAuditoria('ELIMINAR_VIGILADOR', 'Usuario', `Baja de vigilador ID: ${id}`)
  }

  // Traslados y Asignaciones (Sección 20 y 21)
  const trasladarVigilador = ({
    id_vigilador,
    id_nuevo_objetivo,
    fecha_efectiva,
    motivo,
    accion_turnos_futuros
  }: {
    id_vigilador: string
    id_nuevo_objetivo: string
    fecha_efectiva: string
    motivo: string
    accion_turnos_futuros: 'mantener' | 'reasignar' | 'cancelar'
  }) => {
    const vig = vigiladores.find((v) => v.id === id_vigilador)
    const objNuevo = objetivos.find((o) => o.id === id_nuevo_objetivo)
    if (!vig || !objNuevo) return

    // 1. Cerrar la asignación anterior
    setAsignaciones((prev) =>
      prev.map((a) =>
        a.id_vigilador === id_vigilador && a.activa
          ? { ...a, activa: false, fecha_fin: fecha_efectiva }
          : a
      )
    )

    // 2. Crear la nueva asignación
    const nuevaAsignacion: Asignacion = {
      id: `asig-${Date.now()}`,
      id_vigilador,
      id_objetivo: id_nuevo_objetivo,
      objetivo_nombre: objNuevo.nombre,
      fecha_inicio: fecha_efectiva,
      fecha_fin: null,
      activa: true,
      motivo_traslado: motivo,
      creado_por: usuario ? `${usuario.nombre} ${usuario.apellido}` : 'Administrador',
      creado_en: new Date().toISOString()
    }
    setAsignaciones((prev) => [nuevaAsignacion, ...prev])

    // 3. Manejar turnos futuros según la decisión del administrador
    if (accion_turnos_futuros === 'reasignar') {
      setTurnos((prev) =>
        prev.map((t) =>
          t.id_vigilador === id_vigilador && t.fecha >= fecha_efectiva
            ? { ...t, id_objetivo: id_nuevo_objetivo }
            : t
        )
      )
    } else if (accion_turnos_futuros === 'cancelar') {
      setTurnos((prev) =>
        prev.filter(
          (t) => !(t.id_vigilador === id_vigilador && t.fecha >= fecha_efectiva)
        )
      )
    }

    registrarAuditoria(
      'TRASLADO_VIGILADOR',
      'Asignacion',
      `Trasladó a ${vig.nombre} ${vig.apellido} a ${objNuevo.nombre}. Fecha: ${fecha_efectiva}. Motivo: ${motivo}`
    )
  }

  // Grilla Mensual: Asignación interactiva de celdas de turnos (Sección 22 y 23)
  // Libro de Novedades (Sección 32)
  crearNovedad: (datos: {
    id_objetivo: string
    id_vigilador: string
    nombre_vigilante: string
    nombre_supervisor: string
    fecha: string
    hora: string
    turno: string
    elementos_a_cargo: string
    informe_novedades: string
  }) => void
  editarNovedad: (id: string, datos: { informe_novedades: string; motivo_correccion: string }) => void

  // Cambios de Turno (Sección 29)
  solicitarCambioTurno: (datos: {
    id_solicitante: string
    id_destinatario: string
    id_turno_origen: string
    fecha_turno: string
    motivo: string
  }) => void
  responderSolicitudCambio: (id_solicitud: string, aceptado: boolean) => void
  aprobarCambioAdmin: (id_solicitud: string, aprobado: boolean) => void

  // Avisos (Sección 31)
  crearAviso: (datos: { titulo: string; contenido: string; prioridad: Aviso['prioridad'] }) => void
  marcarAvisoLeido: (id: string) => void
}

const ContextoOperativo = createContext<ContextoOperativoTipo | undefined>(undefined)

const CLAVE_STORE = 'gsp_seguridad_pro_db_v1'

export const ProveedorOperativo: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { usuario } = useAutenticacion()

  const [empresas, setEmpresas] = useState<Empresa[]>([])
  const [objetivos, setObjetivos] = useState<Objetivo[]>([])
  const [vigiladores, setVigiladores] = useState<Usuario[]>([])
  const [asignaciones, setAsignaciones] = useState<Asignacion[]>([])
  const [turnos, setTurnos] = useState<Turno[]>([])
  const [novedades, setNovedades] = useState<NovedadLibro[]>([])
  const [solicitudesCambio, setSolicitudesCambio] = useState<SolicitudCambio[]>([])
  const [avisos, setAvisos] = useState<Aviso[]>([])
  const [auditorias, setAuditorias] = useState<RegistroAuditoria[]>([])

  useEffect(() => {
    if (!usuario || !supabase) return

    let cancelado = false

    const cargarDatosOperativos = async () => {
      try {
        const empresaId = usuario.id_empresa

        const [
          empresasResult,
          objetivosResult,
          perfilesResult,
          vigiladoresResult,
          asignacionesResult,
          turnosResult,
          novedadesResult,
          solicitudesResult,
          avisosResult,
          auditoriaResult,
          lecturasResult
        ] = await Promise.all([
          usuario.rol === 'super_administrador'
            ? supabase.from('empresas').select('*').order('nombre')
            : supabase.from('empresas').select('*').eq('id', empresaId).order('nombre'),
          supabase.from('objetivos').select('*').order('nombre'),
          supabase.from('perfiles').select('id,id_empresa,nombre,apellido,telefono,rol,activo,debe_cambiar_contrasena,creado_en'),
          supabase.from('vigiladores').select('*').order('apellido'),
          supabase.from('asignaciones').select('*').order('fecha_inicio', { ascending: false }),
          supabase.from('turnos').select('*').order('fecha', { ascending: true }),
          supabase.from('novedades_libro').select('*').order('fecha', { ascending: false }).order('hora', { ascending: false }),
          supabase.from('solicitudes_cambio').select('*').order('creado_en', { ascending: false }),
          supabase.from('avisos').select('*').order('creado_en', { ascending: false }),
          supabase.from('auditoria').select('*').order('fecha_hora', { ascending: false }),
          supabase.from('avisos_lecturas').select('id_aviso,id_usuario').eq('id_usuario', usuario.id)
        ])

        const resultados = [
          empresasResult, objetivosResult, perfilesResult, vigiladoresResult,
          asignacionesResult, turnosResult, novedadesResult, solicitudesResult,
          avisosResult, auditoriaResult, lecturasResult
        ]

        const error = resultados.find((r) => r.error)?.error
        if (error) throw error
        if (cancelado) return

        const empresasDb = empresasResult.data || []
        const objetivosDb = objetivosResult.data || []
        const perfilesDb = perfilesResult.data || []
        const vigiladoresDb = vigiladoresResult.data || []
        const lecturas = new Set((lecturasResult.data || []).map((l) => l.id_aviso))

        const empresaMap = new Map(empresasDb.map((e) => [e.id, e.nombre]))
        const objetivoMap = new Map(objetivosDb.map((o) => [o.id, o.nombre]))
        const perfilMap = new Map(perfilesDb.map((p) => [p.id, p]))

        const perfilesVigiladores = vigiladoresDb
          .map((v) => {
            const perfil = v.id_usuario ? perfilMap.get(v.id_usuario) : null
            if (!perfil) return null
            return {
              id: v.id_usuario,
              email: '',
              nombre: perfil.nombre,
              apellido: perfil.apellido,
              rol: perfil.rol,
              id_empresa: perfil.id_empresa,
              empresa_nombre: perfil.id_empresa ? empresaMap.get(perfil.id_empresa) || null : null,
              telefono: perfil.telefono,
              activo: perfil.activo && v.activo,
              debe_cambiar_contrasena: perfil.debe_cambiar_contrasena,
              creado_en: perfil.creado_en
            } satisfies Usuario
          })
          .filter((v): v is Usuario => Boolean(v))

        setEmpresas(empresasDb.map((e) => ({
          id: e.id, nombre: e.nombre, cuit: e.cuit || '', direccion: e.direccion || '',
          activa: e.activa, creada_en: e.creada_en
        })))
        setObjetivos(objetivosDb.map((o) => ({
          id: o.id, id_empresa: o.id_empresa, nombre: o.nombre, descripcion: o.descripcion || '',
          direccion: o.direccion || '', localidad: o.localidad || '', provincia: o.provincia || '',
          activo: o.activo, creado_en: o.creado_en
        })).filter((o) => usuario.rol === 'super_administrador' || o.id_empresa === empresaId))
        setVigiladores(perfilesVigiladores.filter((v) => usuario.rol === 'super_administrador' || v.id_empresa === empresaId))
        setAsignaciones((asignacionesResult.data || []).map((a) => ({
          id: a.id, id_vigilador: a.id_vigilador, id_objetivo: a.id_objetivo,
          objetivo_nombre: objetivoMap.get(a.id_objetivo), fecha_inicio: a.fecha_inicio,
          fecha_fin: a.fecha_fin, activa: a.activa, motivo_traslado: a.motivo_traslado,
          creado_por: a.creado_por || '', creado_en: a.creado_en
        })).filter((a) => usuario.rol === 'super_administrador' || a.id_empresa === empresaId))
        setTurnos((turnosResult.data || []).map((t) => ({
          id: t.id, id_empresa: t.id_empresa, id_objetivo: t.id_objetivo, id_vigilador: t.id_vigilador,
          fecha: t.fecha, hora_inicio: t.hora_inicio || '00:00', hora_fin: t.hora_fin || '00:00',
          horas_totales: Number(t.horas_totales || 0), tipo: t.tipo, horas_diurnas: Number(t.horas_diurnas || 0),
          horas_nocturnas: Number(t.horas_nocturnas || 0), es_feriado: t.es_feriado, es_domingo: t.es_domingo,
          horas_extra: Number(t.horas_extra || 0), estado: t.estado
        })).filter((t) => usuario.rol === 'super_administrador' || t.id_empresa === empresaId))
        setNovedades((novedadesResult.data || []).map((n) => ({
          id: n.id, id_empresa: n.id_empresa, id_objetivo: n.id_objetivo, id_vigilador: n.id_vigilador || '',
          nombre_vigilante: n.nombre_vigilante, nombre_supervisor: n.nombre_supervisor || '',
          fecha: n.fecha, hora: n.hora, turno: n.turno || '', elementos_a_cargo: n.elementos_a_cargo || '',
          informe_novedades: n.informe_novedades
        })).filter((n) => usuario.rol === 'super_administrador' || n.id_empresa === empresaId))
        setSolicitudesCambio((solicitudesResult.data || []).map((s) => ({
          id: s.id, id_empresa: s.id_empresa, id_solicitante: s.id_solicitante, id_destinatario: s.id_destinatario || '',
          id_turno_origen: s.id_turno_origen, fecha_turno: s.fecha_turno, estado: s.estado,
          motivo: s.motivo || '', creado_en: s.creado_en
        })).filter((s) => usuario.rol === 'super_administrador' || s.id_empresa === empresaId))
        setAvisos((avisosResult.data || []).map((a) => ({
          id: a.id, id_empresa: a.id_empresa, autor_nombre: a.autor_id ? (perfilMap.get(a.autor_id) ? `${perfilMap.get(a.autor_id)!.nombre} ${perfilMap.get(a.autor_id)!.apellido}` : 'Administración') : 'Administración',
          titulo: a.titulo, contenido: a.contenido, prioridad: a.prioridad, leido: lecturas.has(a.id), creado_en: a.creado_en
        })).filter((a) => usuario.rol === 'super_administrador' || a.id_empresa === empresaId))
        setAuditorias((auditoriaResult.data || []).map((a) => ({
          id: a.id, id_usuario: a.id_usuario || '', usuario_nombre: a.id_usuario && perfilMap.get(a.id_usuario) ? `${perfilMap.get(a.id_usuario)!.nombre} ${perfilMap.get(a.id_usuario)!.apellido}` : 'Sistema',
          accion: a.accion, entidad: a.entidad, detalle: JSON.stringify(a.detalle || {}), fecha_hora: a.fecha_hora
        })).filter((a) => usuario.rol === 'super_administrador' || a.id_empresa === empresaId))
      } catch (error) {
        console.error('Error cargando datos operativos desde Supabase:', error)
      }
    }

    cargarDatosOperativos()
    return () => { cancelado = true }
  }, [usuario])

  const registrarAuditoria = (accion: string, entidad: string, detalle: string) => {
    const nuevo: RegistroAuditoria = {
      id: `aud-${Date.now()}`,
      id_usuario: usuario?.id || 'sistema',
      usuario_nombre: usuario ? `${usuario.nombre} ${usuario.apellido}` : 'Sistema',
      accion,
      entidad,
      detalle,
      fecha_hora: new Date().toISOString()
    }
    setAuditorias((prev) => [nuevo, ...prev])
  }

  // Empresas
  const crearEmpresa = (datos: { nombre: string; cuit?: string; direccion?: string }) => {
    if (supabase) {
      void (async () => {
        const { data, error } = await supabase.from('empresas').insert({
          nombre: datos.nombre, cuit: datos.cuit || null, direccion: datos.direccion || null
        }).select('*').single()
        if (error) { console.error('Error creando empresa:', error); return }
        setEmpresas((prev) => [data as Empresa, ...prev])
        if (usuario) {
          await supabase.from('auditoria').insert({
            id_empresa: usuario.id_empresa || data.id, id_usuario: usuario.id,
            accion: 'CREAR_EMPRESA', entidad: 'Empresa', entidad_id: data.id,
            detalle: { texto: `Creó la empresa ${datos.nombre}` }
          })
        }
      })()
      return
    }
    const nueva: Empresa = {
      id: `emp-${Date.now()}`,
      nombre: datos.nombre,
      cuit: datos.cuit || '',
      direccion: datos.direccion || '',
      activa: true,
      creada_en: new Date().toISOString()
    }
    setEmpresas((prev) => [nueva, ...prev])
    registrarAuditoria('CREAR_EMPRESA', 'Empresa', `Creó la empresa ${datos.nombre}`)
  }

  const editarEmpresa = (id: string, datos: Partial<Empresa>) => {
    if (supabase) {
      void (async () => {
        const { data, error } = await supabase.from('empresas').update({
          nombre: datos.nombre, cuit: datos.cuit || null, direccion: datos.direccion || null,
          activa: datos.activa
        }).eq('id', id).select('*').single()
        if (error) { console.error('Error editando empresa:', error); return }
        setEmpresas((prev) => prev.map((e) => e.id === id ? data as Empresa : e))
      })()
      return
    }
    setEmpresas((prev) => prev.map((e) => (e.id === id ? { ...e, ...datos } : e)))
    registrarAuditoria('EDITAR_EMPRESA', 'Empresa', `Modificó empresa ID: ${id}`)
  }

  const eliminarEmpresa = (id: string) => {
    if (supabase) {
      void (async () => {
        const { error } = await supabase.from('empresas').update({ activa: false }).eq('id', id)
        if (error) { console.error('Error desactivando empresa:', error); return }
        setEmpresas((prev) => prev.map((e) => e.id === id ? { ...e, activa: false } : e))
      })()
      return
    }
    setEmpresas((prev) => prev.filter((e) => e.id !== id))
    registrarAuditoria('ELIMINAR_EMPRESA', 'Empresa', `Eliminó empresa ID: ${id}`)
  }

  // Objetivos
  const crearObjetivo = (datos: {
    id_empresa: string
    nombre: string
    descripcion?: string
    direccion: string
    localidad: string
    provincia: string
  }) => {
    if (supabase) {
      void (async () => {
        const { data, error } = await supabase.from('objetivos').insert({
          id_empresa: datos.id_empresa, nombre: datos.nombre, descripcion: datos.descripcion || null,
          direccion: datos.direccion, localidad: datos.localidad, provincia: datos.provincia, activo: true
        }).select('*').single()
        if (error) { console.error('Error creando objetivo:', error); return }
        setObjetivos((prev) => [data as Objetivo, ...prev])
      })()
      return
    }
    const nuevo: Objetivo = {
      id: `obj-${Date.now()}`, id_empresa: datos.id_empresa, nombre: datos.nombre,
      descripcion: datos.descripcion || '', direccion: datos.direccion, localidad: datos.localidad,
      provincia: datos.provincia, activo: true, creado_en: new Date().toISOString()
    }
    setObjetivos((prev) => [nuevo, ...prev])
    registrarAuditoria('CREAR_OBJETIVO', 'Objetivo', `Creó el objetivo ${datos.nombre} en ${datos.localidad}`)
  }

  const editarObjetivo = (id: string, datos: Partial<Objetivo>) => {
    if (supabase) {
      void (async () => {
        const { data, error } = await supabase.from('objetivos').update({
          nombre: datos.nombre, descripcion: datos.descripcion || null, direccion: datos.direccion,
          localidad: datos.localidad, provincia: datos.provincia, activo: datos.activo
        }).eq('id', id).select('*').single()
        if (error) { console.error('Error editando objetivo:', error); return }
        setObjetivos((prev) => prev.map((o) => o.id === id ? data as Objetivo : o))
      })()
      return
    }
    setObjetivos((prev) => prev.map((o) => (o.id === id ? { ...o, ...datos } : o)))
    registrarAuditoria('EDITAR_OBJETIVO', 'Objetivo', `Editó objetivo ID: ${id}`)
  }

  const eliminarObjetivo = (id: string) => {
    if (supabase) {
      void (async () => {
        const { error } = await supabase.from('objetivos').update({ activo: false }).eq('id', id)
        if (error) { console.error('Error desactivando objetivo:', error); return }
        setObjetivos((prev) => prev.map((o) => o.id === id ? { ...o, activo: false } : o))
      })()
      return
    }
    setObjetivos((prev) => prev.filter((o) => o.id !== id))
    registrarAuditoria('ELIMINAR_OBJETIVO', 'Objetivo', `Eliminó objetivo ID: ${id}`)
  }

  // Vigiladores
  const crearVigilador = (datos: {
    nombre: string
    apellido: string
    email: string
    telefono?: string
    id_empresa: string
    id_objetivo_inicial?: string
  }) => {
    const nuevoId = `usr-vig-${Date.now()}`
    const emp = empresas.find((e) => e.id === datos.id_empresa)

    const nuevo: Usuario = {
      id: nuevoId,
      email: datos.email,
      nombre: datos.nombre,
      apellido: datos.apellido,
      rol: 'vigilador',
      id_empresa: datos.id_empresa,
      empresa_nombre: emp ? emp.nombre : 'Empresa',
      telefono: datos.telefono || '',
      activo: true,
      debe_cambiar_contrasena: true,
      creado_en: new Date().toISOString()
    }
    setVigiladores((prev) => [nuevo, ...prev])

    if (datos.id_objetivo_inicial) {
      const obj = objetivos.find((o) => o.id === datos.id_objetivo_inicial)
      const asig: Asignacion = {
        id: `asig-${Date.now()}`,
        id_vigilador: nuevoId,
        id_objetivo: datos.id_objetivo_inicial,
        objetivo_nombre: obj ? obj.nombre : 'Objetivo inicial',
        fecha_inicio: new Date().toISOString().split('T')[0],
        fecha_fin: null,
        activa: true,
        motivo_traslado: 'Asignación inicial al dar de alta',
        creado_por: usuario ? `${usuario.nombre} ${usuario.apellido}` : 'Administrador',
        creado_en: new Date().toISOString()
      }
      setAsignaciones((prev) => [asig, ...prev])
    }

    registrarAuditoria('CREAR_VIGILADOR', 'Usuario', `Alta de vigilador ${datos.nombre} ${datos.apellido}`)
  }

  const editarVigilador = (id: string, datos: Partial<Usuario>) => {
    setVigiladores((prev) => prev.map((v) => (v.id === id ? { ...v, ...datos } : v)))
    registrarAuditoria('EDITAR_VIGILADOR', 'Usuario', `Editó datos de vigilador ID: ${id}`)
  }

  const eliminarVigilador = (id: string) => {
    setVigiladores((prev) => prev.filter((v) => v.id !== id))
    registrarAuditoria('ELIMINAR_VIGILADOR', 'Usuario', `Baja de vigilador ID: ${id}`)
  }

  // Traslados y Asignaciones (Sección 20 y 21)
  const trasladarVigilador = ({
    id_vigilador,
    id_nuevo_objetivo,
    fecha_efectiva,
    motivo,
    accion_turnos_futuros
  }: {
    id_vigilador: string
    id_nuevo_objetivo: string
    fecha_efectiva: string
    motivo: string
    accion_turnos_futuros: 'mantener' | 'reasignar' | 'cancelar'
  }) => {
    const vig = vigiladores.find((v) => v.id === id_vigilador)
    const objNuevo = objetivos.find((o) => o.id === id_nuevo_objetivo)
    if (!vig || !objNuevo) return

    // 1. Cerrar la asignación anterior
    setAsignaciones((prev) =>
      prev.map((a) =>
        a.id_vigilador === id_vigilador && a.activa
          ? { ...a, activa: false, fecha_fin: fecha_efectiva }
          : a
      )
    )

    // 2. Crear la nueva asignación
    const nuevaAsignacion: Asignacion = {
      id: `asig-${Date.now()}`,
      id_vigilador,
      id_objetivo: id_nuevo_objetivo,
      objetivo_nombre: objNuevo.nombre,
      fecha_inicio: fecha_efectiva,
      fecha_fin: null,
      activa: true,
      motivo_traslado: motivo,
      creado_por: usuario ? `${usuario.nombre} ${usuario.apellido}` : 'Administrador',
      creado_en: new Date().toISOString()
    }
    setAsignaciones((prev) => [nuevaAsignacion, ...prev])

    // 3. Manejar turnos futuros según la decisión del administrador
    if (accion_turnos_futuros === 'reasignar') {
      setTurnos((prev) =>
        prev.map((t) =>
          t.id_vigilador === id_vigilador && t.fecha >= fecha_efectiva
            ? { ...t, id_objetivo: id_nuevo_objetivo }
            : t
        )
      )
    } else if (accion_turnos_futuros === 'cancelar') {
      setTurnos((prev) =>
        prev.filter(
          (t) => !(t.id_vigilador === id_vigilador && t.fecha >= fecha_efectiva)
        )
      )
    }

    registrarAuditoria(
      'TRASLADO_VIGILADOR',
      'Asignacion',
      `Trasladó a ${vig.nombre} ${vig.apellido} a ${objNuevo.nombre}. Fecha: ${fecha_efectiva}. Motivo: ${motivo}`
    )
  }

  // Grilla Mensual: Asignación interactiva de celdas de turnos (Sección 22 y 23)
  const asignarTurnoGrilla = ({
    id_vigilador,
    id_objetivo,
    fecha,
    codigo
  }: {
    id_vigilador: string
    id_objetivo: string
    fecha: string
    codigo: '12☀️' | '12🌙' | '10' | '8' | 'F' | 'borrar'
  }) => {
    if (codigo === 'borrar') {
      setTurnos((prev) =>
        prev.filter((t) => !(t.id_vigilador === id_vigilador && t.fecha === fecha))
      )
      return
    }

    const dateParts = fecha.split('-').map(Number)
    const dateObj = new Date(dateParts[0], dateParts[1] - 1, dateParts[2])
    const esDomingo = dateObj.getDay() === 0
    const esFeriado = dateParts[2] === 12 // 12 de octubre feriado

    let horas = 12
    let tipo: Turno['tipo'] = 'diurno'
    let inicio = '07:00'
    let fin = '19:00'
    let diurnas = 12
    let nocturnas = 0

    if (codigo === '12☀️') {
      tipo = 'diurno'
      inicio = '07:00'
      fin = '19:00'
      horas = 12
      diurnas = 12
      nocturnas = 0
    } else if (codigo === '12🌙') {
      // Cruce de medianoche: 19:00 a 07:00
      tipo = 'nocturno'
      inicio = '19:00'
      fin = '07:00'
      horas = 12
      diurnas = 3
      nocturnas = 9
    } else if (codigo === '10') {
      tipo = 'especial'
      inicio = '08:00'
      fin = '18:00'
      horas = 10
      diurnas = 10
      nocturnas = 0
    } else if (codigo === '8') {
      tipo = 'diurno'
      inicio = '08:00'
      fin = '16:00'
      horas = 8
      diurnas = 8
      nocturnas = 0
    } else if (codigo === 'F') {
      tipo = 'franco'
      inicio = '00:00'
      fin = '00:00'
      horas = 0
      diurnas = 0
      nocturnas = 0
    }

    const turnoExistente = turnos.find(
      (t) => t.id_vigilador === id_vigilador && t.fecha === fecha
    )

    const empId = vigiladores.find((v) => v.id === id_vigilador)?.id_empresa || 'emp-wall-01'

    if (turnoExistente) {
      setTurnos((prev) =>
        prev.map((t) =>
          t.id === turnoExistente.id
            ? {
                ...t,
                id_objetivo,
                hora_inicio: inicio,
                hora_fin: fin,
                horas_totales: horas,
                tipo,
                horas_diurnas: diurnas,
                horas_nocturnas: nocturnas,
                es_domingo: esDomingo,
                es_feriado: esFeriado
              }
            : t
        )
      )
    } else {
      const nuevoTurno: Turno = {
        id: `trn-${id_vigilador}-${fecha}-${Date.now()}`,
        id_empresa: empId,
        id_objetivo,
        id_vigilador,
        fecha,
        hora_inicio: inicio,
        hora_fin: fin,
        horas_totales: horas,
        tipo,
        horas_diurnas: diurnas,
        horas_nocturnas: nocturnas,
        es_feriado: esFeriado,
        es_domingo: esDomingo,
        horas_extra: 0,
        estado: 'programado'
      }
      setTurnos((prev) => [...prev, nuevoTurno])
    }
  }

  // Libro de Novedades (Sección 32)
  const crearNovedad = (datos: {
    id_objetivo: string
    id_vigilador: string
    nombre_vigilante: string
    nombre_supervisor: string
    fecha: string
    hora: string
    turno: string
    elementos_a_cargo: string
    informe_novedades: string
  }) => {
    const vig = vigiladores.find((v) => v.id === datos.id_vigilador)
    const empId = vig?.id_empresa || 'emp-wall-01'

    const nueva: NovedadLibro = {
      id: `nov-${Date.now()}`,
      id_empresa: empId,
      id_objetivo: datos.id_objetivo,
      id_vigilador: datos.id_vigilador,
      nombre_vigilante: datos.nombre_vigilante,
      nombre_supervisor: datos.nombre_supervisor,
      fecha: datos.fecha,
      hora: datos.hora,
      turno: datos.turno,
      elementos_a_cargo: datos.elementos_a_cargo,
      informe_novedades: datos.informe_novedades,
      creado_en: new Date().toISOString()
    }
    setNovedades((prev) => [nueva, ...prev])
    registrarAuditoria('LIBRO_NOVEDADES', 'Novedad', `Asentó novedad en objetivo ID: ${datos.id_objetivo}`)
  }

  const editarNovedad = (id: string, datos: { informe_novedades: string; motivo_correccion: string }) => {
    setNovedades((prev) =>
      prev.map((n) =>
        n.id === id
          ? {
              ...n,
              informe_novedades: `${datos.informe_novedades}\n[Corrección por ${usuario?.nombre || 'Admin'} el ${new Date().toLocaleString()}: ${datos.motivo_correccion}]`
            }
          : n
      )
    )
    registrarAuditoria(
      'CORRECCION_NOVEDAD',
      'Novedad',
      `Modificó registro ID: ${id}. Motivo: ${datos.motivo_correccion}`
    )
  }

  // Cambios de Turno (Sección 29)
  const solicitarCambioTurno = (datos: {
    id_solicitante: string
    id_destinatario: string
    id_turno_origen: string
    fecha_turno: string
    motivo: string
  }) => {
    const sol: SolicitudCambio = {
      id: `sol-${Date.now()}`,
      id_empresa: 'emp-wall-01',
      id_solicitante: datos.id_solicitante,
      id_destinatario: datos.id_destinatario,
      id_turno_origen: datos.id_turno_origen,
      fecha_turno: datos.fecha_turno,
      estado: 'pendiente',
      motivo: datos.motivo,
      creado_en: new Date().toISOString()
    }
    setSolicitudesCambio((prev) => [sol, ...prev])
    registrarAuditoria('SOLICITUD_CAMBIO', 'Turno', `Solicitud de cambio creada para fecha ${datos.fecha_turno}`)
  }

  const responderSolicitudCambio = (id_solicitud: string, aceptado: boolean) => {
    setSolicitudesCambio((prev) =>
      prev.map((s) =>
        s.id === id_solicitud
          ? {
              ...s,
              estado: aceptado ? 'aceptada_vigilador' : 'rechazada_vigilador'
            }
          : s
      )
    )
  }

  const aprobarCambioAdmin = (id_solicitud: string, aprobado: boolean) => {
    const solicitud = solicitudesCambio.find((s) => s.id === id_solicitud)
    if (!solicitud) return

    if (aprobado) {
      // Reasignar el turno en la grilla oficial al nuevo vigilador
      setTurnos((prev) =>
        prev.map((t) =>
          t.id === solicitud.id_turno_origen
            ? { ...t, id_vigilador: solicitud.id_destinatario }
            : t
        )
      )
      setSolicitudesCambio((prev) =>
        prev.map((s) => (s.id === id_solicitud ? { ...s, estado: 'aprobada_admin' } : s))
      )
      registrarAuditoria(
        'APROBACION_CAMBIO_TURNO',
        'Turno',
        `Aprobó cambio de turno para fecha ${solicitud.fecha_turno}`
      )
    } else {
      setSolicitudesCambio((prev) =>
        prev.map((s) => (s.id === id_solicitud ? { ...s, estado: 'cancelada' } : s))
      )
      registrarAuditoria(
        'RECHAZO_CAMBIO_TURNO',
        'Turno',
        `Rechazó cambio de turno para fecha ${solicitud.fecha_turno}`
      )
    }
  }

  // Avisos (Sección 31)
  const crearAviso = (datos: { titulo: string; contenido: string; prioridad: Aviso['prioridad'] }) => {
    const nuevo: Aviso = {
      id: `av-${Date.now()}`,
      id_empresa: 'emp-wall-01',
      autor_nombre: usuario ? `${usuario.nombre} ${usuario.apellido}` : 'Administración',
      titulo: datos.titulo,
      contenido: datos.contenido,
      prioridad: datos.prioridad,
      leido: false,
      creado_en: new Date().toISOString()
    }
    setAvisos((prev) => [nuevo, ...prev])
    registrarAuditoria('CREAR_AVISO', 'Aviso', `Publicó aviso: ${datos.titulo}`)
  }

  const marcarAvisoLeido = (id: string) => {
    setAvisos((prev) =>
      prev.map((a) => (a.id === id ? { ...a, leido: true } : a))
    )
  }

  return (
    <ContextoOperativo.Provider
      value={{
        empresas,
        objetivos,
        vigiladores,
        asignaciones,
        turnos,
        novedades,
        solicitudesCambio,
        avisos,
        auditorias,
        crearEmpresa,
        editarEmpresa,
        eliminarEmpresa,
        crearObjetivo,
        editarObjetivo,
        eliminarObjetivo,
        crearVigilador,
        editarVigilador,
        eliminarVigilador,
        trasladarVigilador,
        asignarTurnoGrilla,
        crearNovedad,
        editarNovedad,
        solicitarCambioTurno,
        responderSolicitudCambio,
        aprobarCambioAdmin,
        crearAviso,
        marcarAvisoLeido
      }}
    >
      {children}
    </ContextoOperativo.Provider>
  )
}

export function useOperativo(): ContextoOperativoTipo {
  const context = useContext(ContextoOperativo)
  if (!context) {
    throw new Error('useOperativo debe utilizarse dentro de ProveedorOperativo')
  }
  return context
}
