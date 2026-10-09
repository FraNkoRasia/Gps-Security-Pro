-- PLAN DE CORRECCIÓN - Paso 7
-- Estas tablas contienen datos internos y sus políticas están destinadas a authenticated.
-- Se revocan privilegios de tabla a anon; no se modifican políticas RLS ni permisos autenticados.
REVOKE ALL PRIVILEGES ON TABLE public.novedades_lecturas, public.solicitudes_horas_extra, public.tipos_turno FROM anon;
