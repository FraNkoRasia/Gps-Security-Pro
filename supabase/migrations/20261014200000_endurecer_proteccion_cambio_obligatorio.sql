-- Endurece la protección del indicador de cambio obligatorio.
-- La migración original ya está registrada en producción, por eso este ajuste
-- se aplica con una migración nueva en lugar de reescribir el historial.
-- Las Edge Functions con service_role pueden gestionar el indicador; los
-- clientes autenticados no pueden modificarlo directamente en ningún perfil.
CREATE OR REPLACE FUNCTION public.proteger_cambio_obligatorio_contrasena()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = pg_catalog
AS $$
BEGIN
  IF auth.uid() IS NOT NULL
     AND NEW.debe_cambiar_contrasena IS DISTINCT FROM OLD.debe_cambiar_contrasena
  THEN
    RAISE EXCEPTION 'No podés modificar directamente la obligación de cambiar la contraseña.'
      USING ERRCODE = '42501';
  END IF;

  RETURN NEW;
END;
$$;
