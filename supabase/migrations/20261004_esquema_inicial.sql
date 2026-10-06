-- GSP Security Pro — esquema inicial canónico
-- Este archivo refleja el modelo actual utilizado por la aplicación.
-- La seguridad por empresa se resuelve mediante RLS y funciones basadas en auth.uid().
-- No contiene usuarios, correos ni credenciales iniciales.

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE IF NOT EXISTS public.empresas (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  nombre text NOT NULL,
  cuit text,
  direccion text,
  activa boolean NOT NULL DEFAULT true,
  creada_en timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.perfiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  nombre text NOT NULL,
  apellido text NOT NULL,
  telefono text,
  rol text NOT NULL DEFAULT 'vigilador'
    CHECK (rol IN ('super_administrador','administrador','supervisor','vigilador')),
  id_empresa uuid REFERENCES public.empresas(id) ON DELETE SET NULL,
  activo boolean NOT NULL DEFAULT true,
  debe_cambiar_contrasena boolean NOT NULL DEFAULT false,
  creado_en timestamptz NOT NULL DEFAULT now(),
  actualizado_en timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.objetivos (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  id_empresa uuid NOT NULL REFERENCES public.empresas(id) ON DELETE CASCADE,
  nombre text NOT NULL,
  descripcion text,
  direccion text,
  localidad text,
  provincia text,
  activo boolean NOT NULL DEFAULT true,
  creado_en timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.vigiladores (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  id_empresa uuid NOT NULL REFERENCES public.empresas(id) ON DELETE CASCADE,
  id_usuario uuid REFERENCES public.perfiles(id) ON DELETE SET NULL,
  legajo text,
  nombre text NOT NULL,
  apellido text NOT NULL,
  telefono text,
  activo boolean NOT NULL DEFAULT true,
  creado_en timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.asignaciones (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  id_empresa uuid NOT NULL REFERENCES public.empresas(id) ON DELETE CASCADE,
  id_vigilador uuid NOT NULL REFERENCES public.vigiladores(id) ON DELETE CASCADE,
  id_objetivo uuid NOT NULL REFERENCES public.objetivos(id) ON DELETE CASCADE,
  fecha_inicio date NOT NULL,
  fecha_fin date,
  activa boolean NOT NULL DEFAULT true,
  motivo_traslado text,
  creado_por uuid REFERENCES public.perfiles(id) ON DELETE SET NULL,
  creado_en timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.turnos (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  id_empresa uuid NOT NULL REFERENCES public.empresas(id) ON DELETE CASCADE,
  id_objetivo uuid NOT NULL REFERENCES public.objetivos(id) ON DELETE CASCADE,
  id_vigilador uuid NOT NULL REFERENCES public.vigiladores(id) ON DELETE CASCADE,
  fecha date NOT NULL,
  hora_inicio time,
  hora_fin time,
  horas_totales numeric,
  tipo text NOT NULL DEFAULT 'diurno'
    CHECK (tipo IN ('diurno','nocturno','franco','especial')),
  horas_diurnas numeric NOT NULL DEFAULT 0,
  horas_nocturnas numeric NOT NULL DEFAULT 0,
  es_feriado boolean NOT NULL DEFAULT false,
  es_domingo boolean NOT NULL DEFAULT false,
  horas_extra numeric NOT NULL DEFAULT 0,
  estado text NOT NULL DEFAULT 'programado'
    CHECK (estado IN ('programado','cumplido','ausente','reemplazado')),
  creado_en timestamptz NOT NULL DEFAULT now(),
  actualizado_en timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.novedades_libro (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  id_empresa uuid NOT NULL REFERENCES public.empresas(id) ON DELETE CASCADE,
  id_objetivo uuid NOT NULL REFERENCES public.objetivos(id) ON DELETE CASCADE,
  id_vigilador uuid REFERENCES public.vigiladores(id) ON DELETE SET NULL,
  nombre_vigilante text NOT NULL,
  nombre_supervisor text,
  fecha date NOT NULL DEFAULT current_date,
  hora time NOT NULL DEFAULT localtime,
  turno text,
  tipo text NOT NULL DEFAULT 'novedad',
  elementos_a_cargo text,
  informe_novedades text NOT NULL,
  creado_por uuid REFERENCES public.perfiles(id) ON DELETE SET NULL,
  creado_en timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.novedades_correcciones (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  id_novedad uuid NOT NULL REFERENCES public.novedades_libro(id) ON DELETE CASCADE,
  id_empresa uuid NOT NULL REFERENCES public.empresas(id) ON DELETE CASCADE,
  correccion text NOT NULL,
  motivo text,
  corregido_por uuid REFERENCES public.perfiles(id) ON DELETE SET NULL,
  corregido_en timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.solicitudes_cambio (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  id_empresa uuid NOT NULL REFERENCES public.empresas(id) ON DELETE CASCADE,
  id_solicitante uuid NOT NULL REFERENCES public.vigiladores(id) ON DELETE CASCADE,
  id_destinatario uuid REFERENCES public.vigiladores(id) ON DELETE SET NULL,
  id_turno_origen uuid NOT NULL REFERENCES public.turnos(id) ON DELETE CASCADE,
  fecha_turno date NOT NULL,
  estado text NOT NULL DEFAULT 'pendiente'
    CHECK (estado IN ('pendiente','aceptada_vigilador','rechazada_vigilador','aprobada_admin','cancelada')),
  motivo text,
  creado_en timestamptz NOT NULL DEFAULT now(),
  actualizado_en timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.avisos (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  id_empresa uuid NOT NULL REFERENCES public.empresas(id) ON DELETE CASCADE,
  autor_id uuid REFERENCES public.perfiles(id) ON DELETE SET NULL,
  titulo text NOT NULL,
  contenido text NOT NULL,
  prioridad text NOT NULL DEFAULT 'baja'
    CHECK (prioridad IN ('baja','media','alta','urgente')),
  creado_en timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.avisos_lecturas (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  id_aviso uuid NOT NULL REFERENCES public.avisos(id) ON DELETE CASCADE,
  id_usuario uuid NOT NULL REFERENCES public.perfiles(id) ON DELETE CASCADE,
  leido_en timestamptz NOT NULL DEFAULT now(),
  UNIQUE (id_aviso,id_usuario)
);

CREATE TABLE IF NOT EXISTS public.feriados (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  fecha date NOT NULL,
  nombre text NOT NULL,
  tipo text NOT NULL DEFAULT 'nacional',
  id_empresa uuid REFERENCES public.empresas(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS public.auditoria (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  id_empresa uuid REFERENCES public.empresas(id) ON DELETE SET NULL,
  id_usuario uuid REFERENCES public.perfiles(id) ON DELETE SET NULL,
  accion text NOT NULL,
  entidad text NOT NULL,
  entidad_id uuid,
  detalle jsonb,
  fecha_hora timestamptz NOT NULL DEFAULT now()
);

-- Índices principales.
CREATE INDEX IF NOT EXISTS idx_perfiles_empresa_activo ON public.perfiles(id_empresa,activo);
CREATE INDEX IF NOT EXISTS idx_vigiladores_empresa_activo ON public.vigiladores(id_empresa,activo);
CREATE INDEX IF NOT EXISTS idx_objetivos_empresa_activo ON public.objetivos(id_empresa,activo);
CREATE INDEX IF NOT EXISTS idx_asignaciones_vigilador_activa ON public.asignaciones(id_vigilador,activa);
CREATE INDEX IF NOT EXISTS idx_asignaciones_objetivo_fecha ON public.asignaciones(id_objetivo,fecha_inicio);
CREATE INDEX IF NOT EXISTS idx_turnos_empresa_fecha ON public.turnos(id_empresa,fecha);
CREATE INDEX IF NOT EXISTS idx_turnos_vigilador_fecha ON public.turnos(id_vigilador,fecha);
CREATE INDEX IF NOT EXISTS idx_novedades_objetivo_fecha ON public.novedades_libro(id_objetivo,fecha);
CREATE INDEX IF NOT EXISTS idx_auditoria_empresa_fecha ON public.auditoria(id_empresa,fecha_hora);

-- El archivo es el contrato de esquema para futuras migraciones.
-- Las políticas/RLS se mantienen en migraciones de seguridad separadas para
-- poder evolucionarlas sin reescribir este esquema base.
