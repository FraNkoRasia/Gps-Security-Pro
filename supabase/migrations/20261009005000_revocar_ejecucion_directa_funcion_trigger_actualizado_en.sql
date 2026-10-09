-- La función solo debe ejecutarse como trigger de actualización, no invocarse directamente por roles cliente.
REVOKE EXECUTE ON FUNCTION public.actualizar_actualizado_en() FROM PUBLIC, anon, authenticated;
