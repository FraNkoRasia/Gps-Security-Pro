-- PLAN DE CORRECCIÓN - Paso 2
-- Limita las actualizaciones que un administrador de empresa puede realizar
-- sobre perfiles ajenos. Conserva los campos usados por la gestión de vigiladores.
CREATE OR REPLACE FUNCTION public.limitar_edicion_perfiles_administrador()
RETURNS trigger
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = ''
AS $function$
DECLARE
  v_uid uuid;
  v_rol text;
  v_id_empresa uuid;
BEGIN
  v_uid := (SELECT auth.uid());

  -- Las operaciones de backend con service role no llevan auth.uid().
  -- Se conservan los flujos administrativos de Edge Functions.
  IF v_uid IS NULL THEN
    RETURN NEW;
  END IF;

  -- Ningún usuario autenticado debe poder reasignar identificadores o
  -- modificar la fecha de creación de un perfil existente.
  IF NEW.id IS DISTINCT FROM OLD.id
     OR NEW.creado_en IS DISTINCT FROM OLD.creado_en
  THEN
    RAISE EXCEPTION 'No se puede modificar el identificador ni la fecha de creación del perfil.'
      USING ERRCODE = '42501';
  END IF;

  SELECT p.rol, p.id_empresa
    INTO v_rol, v_id_empresa
  FROM public.perfiles AS p
  WHERE p.id = v_uid
    AND p.activo = true;

  -- Los administradores solo gestionan perfiles de su propia empresa.
  IF v_rol = 'administrador' AND OLD.id <> v_uid THEN
    IF OLD.id_empresa IS DISTINCT FROM v_id_empresa
       OR NEW.id_empresa IS DISTINCT FROM OLD.id_empresa
    THEN
      RAISE EXCEPTION 'Solo podés administrar perfiles de tu empresa y no podés reasignarlos a otra empresa.'
        USING ERRCODE = '42501';
    END IF;

    -- La pantalla actual de gestión de vigiladores edita estos datos:
    -- nombre, apellido, email, teléfono y estado activo.
    -- El rol, la empresa y la obligación de cambiar contraseña no se editan
    -- desde esa pantalla y quedan protegidos ante llamadas directas a la API.
    IF NEW.rol IS DISTINCT FROM OLD.rol
       OR NEW.debe_cambiar_contrasena IS DISTINCT FROM OLD.debe_cambiar_contrasena
    THEN
      RAISE EXCEPTION 'No tenés permiso para modificar el rol ni la configuración de acceso de otro perfil.'
        USING ERRCODE = '42501';
    END IF;
  END IF;

  RETURN NEW;
END;
$function$;

REVOKE ALL ON FUNCTION public.limitar_edicion_perfiles_administrador() FROM PUBLIC, anon, authenticated;

DROP TRIGGER IF EXISTS perfiles_limitar_edicion_administrador ON public.perfiles;

CREATE TRIGGER perfiles_limitar_edicion_administrador
BEFORE UPDATE
ON public.perfiles
FOR EACH ROW
EXECUTE FUNCTION public.limitar_edicion_perfiles_administrador();
