-- ==============================================================================
-- GSP SECURITY PRO — Gestión de Seguridad Profesional
-- Esquema Inicial de Base de Datos PostgreSQL con Row Level Security (RLS)
-- Desarrollador: FraNko Rasia
-- Super-Administrador inicial: cjsfranko@gmail.com
-- ==============================================================================

-- 1. Extensión para UUIDs
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Tabla de Empresas
CREATE TABLE IF NOT EXISTS public.empresas (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    nombre TEXT NOT NULL,
    cuit TEXT,
    direccion TEXT,
    activa BOOLEAN DEFAULT true,
    creada_en TIMESTAMPTZ DEFAULT now()
);

-- 3. Tabla de Perfiles de Usuario (vinculada a Supabase Auth)
CREATE TABLE IF NOT EXISTS public.perfiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT UNIQUE NOT NULL,
    nombre TEXT NOT NULL,
    apellido TEXT NOT NULL,
    rol TEXT NOT NULL CHECK (rol IN ('super_administrador', 'administrador', 'supervisor', 'vigilador')),
    id_empresa UUID REFERENCES public.empresas(id) ON DELETE SET NULL,
    telefono TEXT,
    activo BOOLEAN DEFAULT true,
    debe_cambiar_contrasena BOOLEAN DEFAULT false,
    creado_en TIMESTAMPTZ DEFAULT now()
);

-- 4. Tabla de Objetivos y Puestos de Vigilancia
CREATE TABLE IF NOT EXISTS public.objetivos (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    id_empresa UUID NOT NULL REFERENCES public.empresas(id) ON DELETE CASCADE,
    nombre TEXT NOT NULL,
    descripcion TEXT,
    direccion TEXT NOT NULL,
    localidad TEXT NOT NULL,
    provincia TEXT NOT NULL,
    activo BOOLEAN DEFAULT true,
    creado_en TIMESTAMPTZ DEFAULT now()
);

-- 5. Tabla de Asignaciones y Traslados (Historial Inmutable)
CREATE TABLE IF NOT EXISTS public.asignaciones (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    id_vigilador UUID NOT NULL REFERENCES public.perfiles(id) ON DELETE CASCADE,
    id_objetivo UUID NOT NULL REFERENCES public.objetivos(id) ON DELETE CASCADE,
    fecha_inicio DATE NOT NULL,
    fecha_fin DATE,
    activa BOOLEAN DEFAULT true,
    motivo_traslado TEXT,
    creado_por UUID REFERENCES public.perfiles(id),
    creado_en TIMESTAMPTZ DEFAULT now()
);

-- 6. Tabla de Turnos y Grilla Mensual
CREATE TABLE IF NOT EXISTS public.turnos (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    id_empresa UUID NOT NULL REFERENCES public.empresas(id) ON DELETE CASCADE,
    id_objetivo UUID NOT NULL REFERENCES public.objetivos(id) ON DELETE CASCADE,
    id_vigilador UUID NOT NULL REFERENCES public.perfiles(id) ON DELETE CASCADE,
    fecha DATE NOT NULL,
    hora_inicio TIME NOT NULL,
    hora_fin TIME NOT NULL,
    horas_totales NUMERIC(5,2) NOT NULL,
    tipo TEXT NOT NULL CHECK (tipo IN ('diurno', 'nocturno', 'franco', 'especial')),
    horas_diurnas NUMERIC(5,2) DEFAULT 0,
    horas_nocturnas NUMERIC(5,2) DEFAULT 0,
    es_feriado BOOLEAN DEFAULT false,
    es_domingo BOOLEAN DEFAULT false,
    horas_extra NUMERIC(5,2) DEFAULT 0,
    estado TEXT DEFAULT 'programado' CHECK (estado IN ('programado', 'cumplido', 'ausente', 'reemplazado')),
    creado_en TIMESTAMPTZ DEFAULT now(),
    UNIQUE(id_vigilador, fecha)
);

-- 7. Tabla del Libro Digital de Novedades (Registro Inmutable)
CREATE TABLE IF NOT EXISTS public.novedades (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    id_empresa UUID NOT NULL REFERENCES public.empresas(id) ON DELETE CASCADE,
    id_objetivo UUID NOT NULL REFERENCES public.objetivos(id) ON DELETE CASCADE,
    id_vigilador UUID NOT NULL REFERENCES public.perfiles(id) ON DELETE CASCADE,
    nombre_vigilante TEXT NOT NULL,
    nombre_supervisor TEXT NOT NULL,
    fecha DATE NOT NULL,
    hora TIME NOT NULL,
    turno TEXT NOT NULL,
    elementos_a_cargo TEXT NOT NULL,
    informe_novedades TEXT NOT NULL,
    creado_en TIMESTAMPTZ DEFAULT now()
);

-- 8. Tabla de Solicitudes de Cambio de Turno
CREATE TABLE IF NOT EXISTS public.solicitudes_cambio (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    id_empresa UUID NOT NULL REFERENCES public.empresas(id) ON DELETE CASCADE,
    id_solicitante UUID NOT NULL REFERENCES public.perfiles(id) ON DELETE CASCADE,
    id_destinatario UUID NOT NULL REFERENCES public.perfiles(id) ON DELETE CASCADE,
    id_turno_origen UUID NOT NULL REFERENCES public.turnos(id) ON DELETE CASCADE,
    fecha_turno DATE NOT NULL,
    estado TEXT DEFAULT 'pendiente' CHECK (estado IN ('pendiente', 'aceptada_vigilador', 'rechazada_vigilador', 'aprobada_admin', 'cancelada')),
    motivo TEXT NOT NULL,
    creado_en TIMESTAMPTZ DEFAULT now()
);

-- 9. Tabla de Avisos y Comunicados
CREATE TABLE IF NOT EXISTS public.avisos (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    id_empresa UUID NOT NULL REFERENCES public.empresas(id) ON DELETE CASCADE,
    autor_nombre TEXT NOT NULL,
    titulo TEXT NOT NULL,
    contenido TEXT NOT NULL,
    prioridad TEXT DEFAULT 'media' CHECK (prioridad IN ('baja', 'media', 'alta', 'urgente')),
    leido BOOLEAN DEFAULT false,
    creado_en TIMESTAMPTZ DEFAULT now()
);

-- 10. Tabla de Auditoría Operativa
CREATE TABLE IF NOT EXISTS public.auditorias (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    id_usuario UUID REFERENCES public.perfiles(id),
    usuario_nombre TEXT NOT NULL,
    accion TEXT NOT NULL,
    entidad TEXT NOT NULL,
    detalle TEXT NOT NULL,
    fecha_hora TIMESTAMPTZ DEFAULT now()
);

-- ==============================================================================
-- POLÍTICAS DE SEGURIDAD (Row Level Security - RLS)
-- ==============================================================================

ALTER TABLE public.empresas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.perfiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.objetivos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.asignaciones ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.turnos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.novedades ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.solicitudes_cambio ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.avisos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.auditorias ENABLE ROW LEVEL SECURITY;

-- Función helper para verificar Super-Administrador
CREATE OR REPLACE FUNCTION public.es_super_admin()
RETURNS BOOLEAN AS $$
BEGIN
    RETURN (auth.jwt() ->> 'email') = 'cjsfranko@gmail.com';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Función helper para obtener la empresa del usuario actual
CREATE OR REPLACE FUNCTION public.obtener_id_empresa_usuario()
RETURNS UUID AS $$
DECLARE
    emp_id UUID;
BEGIN
    SELECT id_empresa INTO emp_id FROM public.perfiles WHERE id = auth.uid();
    RETURN emp_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Políticas Empresas
CREATE POLICY "Super-Admin gestiona todas las empresas"
ON public.empresas FOR ALL
USING (public.es_super_admin());

CREATE POLICY "Usuarios ven su propia empresa"
ON public.empresas FOR SELECT
USING (id = public.obtener_id_empresa_usuario());

-- Políticas Objetivos
CREATE POLICY "Super-Admin gestiona todos los objetivos"
ON public.objetivos FOR ALL
USING (public.es_super_admin());

CREATE POLICY "Personal ve objetivos de su empresa"
ON public.objetivos FOR ALL
USING (id_empresa = public.obtener_id_empresa_usuario());

-- Políticas Turnos
CREATE POLICY "Super-Admin gestiona todos los turnos"
ON public.turnos FOR ALL
USING (public.es_super_admin());

CREATE POLICY "Personal interactúa con turnos de su empresa"
ON public.turnos FOR ALL
USING (id_empresa = public.obtener_id_empresa_usuario());

-- Políticas Novedades
CREATE POLICY "Super-Admin ve todas las novedades"
ON public.novedades FOR ALL
USING (public.es_super_admin());

CREATE POLICY "Personal gestiona novedades de su empresa"
ON public.novedades FOR ALL
USING (id_empresa = public.obtener_id_empresa_usuario());
