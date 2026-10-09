-- PLAN DE CORRECCIÓN - Paso 3
-- Solo el vigilador destinatario puede aceptar/rechazar una solicitud pendiente.
-- El solicitante y la administración no pueden simular la respuesta del colega.
CREATE OR REPLACE FUNCTION public.validar_respuesta_solicitud_cambio()
RETURNS trigger
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = ''
AS $function$
DECLARE
  v_uid uuid;
BEGIN
  v_uid := (SELECT auth.uid());

  -- Operaciones internas sin JWT conservan su comportamiento.
  IF v_uid IS NULL THEN
    RETURN NEW;
  END IF;

  -- Administración conserva sus transiciones de gestión, pero no puede
  -- registrar en nombre del colega una aceptación/rechazo desde pendiente.
  IF (SELECT private.is_admin_or_supervisor())
     AND OLD.id_empresa = (SELECT private.current_company_id())
  THEN
    IF OLD.estado = 'pendiente'
       AND NEW.estado IN ('aceptada_vigilador', 'rechazada_vigilador')
    THEN
      RAISE EXCEPTION 'La aceptación o el rechazo del colega solo puede registrarlo el vigilador destinatario.'
        USING ERRCODE = '42501';
    END IF;
    RETURN NEW;
  END IF;

  -- El destinatario solo puede responder una solicitud pendiente, sin cambiar
  -- sus datos ni reemplazar la identidad de las partes.
  IF OLD.id_destinatario = v_uid
     AND OLD.estado = 'pendiente'
     AND NEW.estado IN ('aceptada_vigilador', 'rechazada_vigilador')
     AND NEW.id IS NOT DISTINCT FROM OLD.id
     AND NEW.id_empresa IS NOT DISTINCT FROM OLD.id_empresa
     AND NEW.id_solicitante IS NOT DISTINCT FROM OLD.id_solicitante
     AND NEW.id_destinatario IS NOT DISTINCT FROM OLD.id_destinatario
     AND NEW.id_turno_origen IS NOT DISTINCT FROM OLD.id_turno_origen
     AND NEW.fecha_turno IS NOT DISTINCT FROM OLD.fecha_turno
     AND NEW.motivo IS NOT DISTINCT FROM OLD.motivo
     AND NEW.creado_en IS NOT DISTINCT FROM OLD.creado_en
  THEN
    RETURN NEW;
  END IF;

  RAISE EXCEPTION 'Solo el vigilador destinatario puede aceptar o rechazar una solicitud pendiente, sin modificar sus datos.'
    USING ERRCODE = '42501';
END;
$function$;

REVOKE ALL ON FUNCTION public.validar_respuesta_solicitud_cambio() FROM PUBLIC, anon, authenticated;

DROP TRIGGER IF EXISTS solicitudes_cambio_validar_respuesta ON public.solicitudes_cambio;
CREATE TRIGGER solicitudes_cambio_validar_respuesta
BEFORE UPDATE ON public.solicitudes_cambio
FOR EACH ROW
EXECUTE FUNCTION public.validar_respuesta_solicitud_cambio();

-- Solo el destinatario puede hacer UPDATE directo mientras está pendiente.
-- La administración conserva su flujo de gestión y la RPC se endurecerá
-- en el paso 4.
DROP POLICY IF EXISTS "solicitudes modificacion autorizada" ON public.solicitudes_cambio;

CREATE POLICY "solicitudes modificacion autorizada"
ON public.solicitudes_cambio
FOR UPDATE
TO authenticated
USING (
  id_empresa = (SELECT private.current_company_id())
  AND (
    (id_destinatario = (SELECT auth.uid()) AND estado = 'pendiente')
    OR (SELECT private.is_admin_or_supervisor())
  )
)
WITH CHECK (
  id_empresa = (SELECT private.current_company_id())
  AND (
    (id_destinatario = (SELECT auth.uid()) AND estado IN ('aceptada_vigilador', 'rechazada_vigilador'))
    OR (SELECT private.is_admin_or_supervisor())
  )
);
