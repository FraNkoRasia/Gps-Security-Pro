-- Evita que las solicitudes pendientes/rechazadas intenten actualizar el turno bloqueado.
-- Solo sincroniza turnos cuando una solicitud aprobada cambia el total aprobado.
CREATE OR REPLACE FUNCTION public.sincronizar_horas_extra_turno()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  turno_afectado uuid;
  horas_extra_calculadas numeric;
BEGIN
  IF TG_OP = 'INSERT' THEN
    IF NEW.estado IS DISTINCT FROM 'aprobada' THEN
      RETURN NEW;
    END IF;
    turno_afectado := NEW.id_turno;
  ELSIF TG_OP = 'DELETE' THEN
    IF OLD.estado IS DISTINCT FROM 'aprobada' THEN
      RETURN OLD;
    END IF;
    turno_afectado := OLD.id_turno;
  ELSE
    IF OLD.estado IS DISTINCT FROM 'aprobada'
       AND NEW.estado IS DISTINCT FROM 'aprobada' THEN
      RETURN NEW;
    END IF;
    turno_afectado := NEW.id_turno;
  END IF;

  SELECT COALESCE(SUM(s.minutos_aprobados)::numeric / 60, 0)
  INTO horas_extra_calculadas
  FROM public.solicitudes_horas_extra s
  WHERE s.id_turno = turno_afectado
    AND s.estado = 'aprobada';

  UPDATE public.turnos t
  SET horas_extra = horas_extra_calculadas
  WHERE t.id = turno_afectado
    AND t.horas_extra IS DISTINCT FROM horas_extra_calculadas;

  IF TG_OP = 'UPDATE'
     AND OLD.id_turno IS DISTINCT FROM NEW.id_turno
     AND OLD.estado = 'aprobada' THEN
    SELECT COALESCE(SUM(s.minutos_aprobados)::numeric / 60, 0)
    INTO horas_extra_calculadas
    FROM public.solicitudes_horas_extra s
    WHERE s.id_turno = OLD.id_turno
      AND s.estado = 'aprobada';

    UPDATE public.turnos t
    SET horas_extra = horas_extra_calculadas
    WHERE t.id = OLD.id_turno
      AND t.horas_extra IS DISTINCT FROM horas_extra_calculadas;
  END IF;

  IF TG_OP = 'DELETE' THEN
    RETURN OLD;
  END IF;
  RETURN NEW;
END;
$$;
