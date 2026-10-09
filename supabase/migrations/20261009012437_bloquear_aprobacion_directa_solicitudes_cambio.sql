-- PLAN DE CORRECCIÓN - Paso 8
-- Las respuestas del destinatario se permiten por UPDATE directo; toda gestión administrativa
-- (aprobar, rechazar/cancelar o cambiar datos) debe pasar por la RPC transaccional.
-- La migración no modifica solicitudes históricas ni turnos existentes.

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

  -- Operaciones internas sin identidad JWT conservan su comportamiento.
  IF v_uid IS NULL THEN
    RETURN NEW;
  END IF;

  -- Una sesión PostgREST autenticada solo puede responder como destinatario una solicitud
  -- pendiente, sin cambiar ningún dato de la solicitud. Las transiciones administrativas
  -- deben ejecutarse por aprobar_cambio_turno(), cuyo contexto SECURITY DEFINER es el owner.
  IF current_user IN ('anon', 'authenticated')
     AND OLD.id_destinatario = v_uid
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

  IF current_user IN ('anon', 'authenticated') THEN
    RAISE EXCEPTION 'Solo el destinatario puede responder una solicitud pendiente; la gestión administrativa debe pasar por aprobar_cambio_turno.'
      USING ERRCODE = '42501';
  END IF;

  RETURN NEW;
END;
$function$;

REVOKE ALL ON FUNCTION public.validar_respuesta_solicitud_cambio() FROM PUBLIC, anon, authenticated;

-- El trigger solicitudes_cambio_validar_respuesta ya existe; CREATE OR REPLACE actualiza
-- la función asociada sin necesidad de recrear el trigger.
