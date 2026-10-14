-- Trigger functions are invoked by PostgreSQL triggers, not exposed as callable RPCs.
REVOKE ALL ON FUNCTION public.proteger_insercion_turnos_bloqueados() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.proteger_eliminacion_turnos_bloqueados() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.proteger_turnos_de_dias_pasados() FROM PUBLIC, anon, authenticated;
