-- PLAN DE CORRECCIÓN - Paso 5
-- La aprobación de horas extra requiere una sesión autenticada.
-- La función mantiene su validación interna de rol, empresa, estado y minutos.
REVOKE EXECUTE ON FUNCTION public.aprobar_solicitud_horas_extra(uuid, boolean, integer) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.aprobar_solicitud_horas_extra(uuid, boolean, integer) TO authenticated;
