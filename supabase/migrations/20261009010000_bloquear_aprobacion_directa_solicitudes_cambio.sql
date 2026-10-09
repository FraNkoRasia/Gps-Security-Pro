-- Impide que una actualización directa desde PostgREST marque una solicitud como aprobada.
-- La aprobación efectiva debe pasar por public.aprobar_cambio_turno(), que también actualiza
-- el/los turnos dentro de la misma transacción.
-- Esta migración no modifica solicitudes históricas.

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

  -- Una sesión autenticada no puede simular la aprobación administrativa mediante UPDATE directo.
  -- La RPC SECURITY DEFINER realiza esta transición con el rol propietario de la función.
  IF NEW.estado = 'aprobada_admin'
     AND OLD.estado IS DISTINCT FROM NEW.estado
     AND current_user IN ('anon', 'authenticated')
  THEN
    RAISE EXCEPTION 'La aprobación debe procesarse mediante aprobar_cambio_turno.'
      USING ERRCODE = '42501';
  END IF;

  IF v_uid IS NULL THEN
    RETURN NEW;
  END IF;

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

-- El trigger existente se mantiene; CREATE OR REPLACE actualiza su función asociada.
