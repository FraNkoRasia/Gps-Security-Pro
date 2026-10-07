export type RolUsuario = 'super_administrador' | 'administrador' | 'supervisor' | 'vigilador'

export interface Usuario {
  id: string
  email: string
  nombre: string
  apellido: string
  rol: RolUsuario
  id_empresa?: string | null
  empresa_nombre?: string | null
  telefono?: string | null
  activo: boolean
  debe_cambiar_contrasena: boolean
  creado_en: string
}

export interface Empresa {
  id: string
  nombre: string
  cuit?: string
  direccion?: string
  activa: boolean
  creada_en: string
}

export interface Objetivo {
  id: string
  id_empresa: string
  nombre: string
  descripcion?: string
  direccion: string
  localidad: string
  provincia: string
  elementos_a_cargo?: string | null
  id_supervisor?: string | null
  activo: boolean
  creado_en: string
}

export interface Asignacion {
  id: string
  id_vigilador: string
  id_objetivo: string
  objetivo_nombre?: string
  fecha_inicio: string
  fecha_fin?: string | null
  activa: boolean
  motivo_traslado?: string | null
  creado_por: string
  creado_en: string
}

export type TipoTurno = 'diurno' | 'nocturno' | 'franco' | 'especial'

export interface Turno {
  id: string
  id_empresa: string
  id_objetivo: string
  id_vigilador: string
  fecha: string
  hora_inicio: string
  hora_fin: string
  horas_totales: number
  tipo: TipoTurno
  horas_diurnas: number
  horas_nocturnas: number
  es_feriado: boolean
  es_domingo: boolean
  horas_extra: number
  estado: 'programado' | 'cumplido' | 'ausente' | 'reemplazado'
}

export interface NovedadLibro {
  id: string
  id_empresa: string
  id_objetivo: string
  id_vigilador: string
  nombre_vigilante: string
  nombre_supervisor: string
  fecha: string
  hora: string
  turno: string
  elementos_a_cargo: string
  informe_novedades: string
  creado_en: string
}

export type EstadoSolicitud = 'pendiente' | 'aceptada_vigilador' | 'rechazada_vigilador' | 'aprobada_admin' | 'cancelada'

export interface SolicitudCambio {
  id: string
  id_empresa: string
  id_solicitante: string
  id_destinatario: string
  id_turno_origen: string
  fecha_turno: string
  estado: EstadoSolicitud
  motivo: string
  creado_en: string
}

export interface Aviso {
  id: string
  id_empresa: string
  autor_nombre: string
  titulo: string
  contenido: string
  prioridad: 'baja' | 'media' | 'alta' | 'urgente'
  leido: boolean
  creado_en: string
}

export interface RegistroAuditoria {
  id: string
  id_usuario: string
  usuario_nombre: string
  accion: string
  entidad: string
  detalle: string
  fecha_hora: string
}
