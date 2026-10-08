-- PLAN DE CORRECCIÓN - Paso 1
-- Impide que una persona autenticada cambie sus propios campos de seguridad.
-- Los administradores conservan la capacidad de administrar otros perfiles.
CREATE OR REPLACE FUNCTION public.proteger_campos_seguridad_perfil()
RETURNS trigger
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = ''
AS $function$
DECLARE
  v_uid uuid;
BEGIN
  v_uid := (SELECT auth.uid());

  IF v_uid IS NOT NULL
     AND OLD.id = v_uid
     AND (
       NEW.id IS DISTINCT FROM OLD.id
       OR NEW.rol IS DISTINCT FROM OLD.rol
       OR NEW.id_empresa IS DISTINCT FROM OLD.id_empresa
       OR NEW.activo IS DISTINCT FROM OLD.activo
     )
  THEN
    RAISE EXCEPTION 'No podés modificar tu propio rol, empresa o estado de acceso. Contactá a un administrador.'
      USING ERRCODE = '42501';
  END IF;

  RETURN NEW;
END;
$function$;

REVOKE ALL ON FUNCTION public.proteger_campos_seguridad_perfil() FROM PUBLIC, anon, authenticated;

DROP TRIGGER IF EXISTS perfiles_proteger_campos_seguridad ON public.perfiles;

CREATE TRIGGER perfiles_proteger_campos_seguridad
BEFORE UPDATE OF id, rol, id_empresa, activo
ON public.perfiles
FOR EACH ROW
EXECUTE FUNCTION public.proteger_campos_seguridad_perfil();
