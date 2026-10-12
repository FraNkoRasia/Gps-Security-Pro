-- Bloquea cambios sobre turnos de días pasados, sin impedir que la RPC
-- de aprobación actualice únicamente las horas extra recién aprobadas.
CREATE OR REPLACE FUNCTION public.proteger_turnos_de_dias_pasados()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_fecha_hoy date := (now() AT TIME ZONE 'America/Argentina/Buenos_Aires')::date;
  v_solo_horas_extra boolean;
  v_aprobacion_valida boolean;
BEGIN
  IF OLD.fecha >= v_fecha_hoy THEN
    RETURN NEW;
  END IF;

  v_solo_horas_extra :=
    NEW.horas_extra IS DISTINCT FROM OLD.horas_extra
    AND (to_jsonb(NEW) - ARRAY['horas_extra', 'actualizado_en'])
        = (to_jsonb(OLD) - ARRAY['horas_extra', 'actualizado_en']);

  IF v_solo_horas_extra THEN
    SELECT EXISTS (
      SELECT 1
      FROM public.solicitudes_horas_extra AS s
      WHERE s.id_turno = OLD.id
        AND s.id_empresa = OLD.id_empresa
        AND s.estado = 'aprobada'
        AND s.revisado_por = (SELECT auth.uid())
        AND s.revisado_en = transaction_timestamp()
    ) INTO v_aprobacion_valida;

    IF v_aprobacion_valida THEN
      RETURN NEW;
    END IF;
  END IF;

  RAISE EXCEPTION 'No se pueden modificar turnos de días pasados. Las horas extra solo se actualizan al aprobar una solicitud válida.'
    USING ERRCODE = '42501';
END;
$$;

DROP TRIGGER IF EXISTS proteger_turnos_de_dias_pasados ON public.turnos;
CREATE TRIGGER proteger_turnos_de_dias_pasados
BEFORE UPDATE ON public.turnos
FOR EACH ROW
EXECUTE FUNCTION public.proteger_turnos_de_dias_pasados();
