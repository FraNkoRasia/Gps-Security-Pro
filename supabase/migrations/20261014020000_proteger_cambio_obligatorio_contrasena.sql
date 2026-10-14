-- Impide que una sesión autenticada cambie por sí misma la marca
-- que obliga a cambiar la contraseña. Las Edge Functions confiables usan
-- service_role (auth.uid() = NULL) y conservan la capacidad de administrarla.
CREATE OR REPLACE FUNCTION public.proteger_cambio_obligatorio_contrasena()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = pg_catalog
AS $$
BEGIN
  IF auth.uid() IS NOT NULL
     AND NEW.id = auth.uid()
     AND NEW.debe_cambiar_contrasena IS DISTINCT FROM OLD.debe_cambiar_contrasena
  THEN
    RAISE EXCEPTION 'No podés modificar por tu cuenta la obligación de cambiar la contraseña.'
      USING ERRCODE = '42501';
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS perfiles_proteger_cambio_obligatorio_contrasena
  ON public.perfiles;

CREATE TRIGGER perfiles_proteger_cambio_obligatorio_contrasena
BEFORE UPDATE OF debe_cambiar_contrasena
ON public.perfiles
FOR EACH ROW
EXECUTE FUNCTION public.proteger_cambio_obligatorio_contrasena();
