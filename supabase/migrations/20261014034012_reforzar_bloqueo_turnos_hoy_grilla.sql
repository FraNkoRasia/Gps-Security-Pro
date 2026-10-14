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
  v_grilla_bloqueada boolean;
BEGIN
  -- Los turnos enteramente futuros se pueden modificar, salvo que se los mueva a una fecha bloqueada.
  IF OLD.fecha > v_fecha_hoy AND NEW.fecha > v_fecha_hoy THEN
    RETURN NEW;
  END IF;

  -- Única excepción para fechas bloqueadas: cambio de horas extra aprobado por el circuito oficial.
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

  SELECT EXISTS (
    SELECT 1
    FROM public.grillas_mensuales AS g
    WHERE g.id_objetivo = NEW.id_objetivo
      AND g.mes = date_trunc('month', NEW.fecha)::date
      AND NEW.fecha <= v_fecha_hoy
  ) INTO v_grilla_bloqueada;

  IF OLD.fecha <= v_fecha_hoy OR NEW.fecha <= v_fecha_hoy OR v_grilla_bloqueada THEN
    RAISE EXCEPTION 'No se pueden modificar turnos de hoy ni de días pasados en una grilla ya creada. Las horas extra solo se actualizan al aprobar una solicitud válida.'
      USING ERRCODE = '42501';
  END IF;

  RETURN NEW;
END;
$$;
