-- Permite completar días anteriores en la primera grilla del mes de alta de un vigilador.
-- La excepción solo aplica a asignaciones activas del mismo objetivo y del mismo mes,
-- y únicamente mientras todavía no exista el marcador de grilla.
CREATE OR REPLACE FUNCTION public.guardar_grilla_mensual(
  p_id_objetivo uuid,
  p_mes date,
  p_operaciones jsonb
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_usuario uuid := (SELECT auth.uid());
  v_rol text;
  v_empresa uuid;
  v_hoy date := (now() AT TIME ZONE 'America/Argentina/Buenos_Aires')::date;
  v_creada boolean;
  v_op jsonb;
  v_fecha date;
  v_id_vigilador uuid;
  v_id_vigilador_usuario uuid;
  v_codigo text;
  v_id_tipo uuid;
  v_tipo text;
  v_horas numeric;
  v_inicio time;
  v_fin time;
  v_diurnas numeric;
  v_nocturnas numeric;
  v_existente uuid;
  v_feriado boolean;
BEGIN
  IF v_usuario IS NULL THEN
    RAISE EXCEPTION 'Debe iniciar sesión para guardar la grilla.' USING ERRCODE = '42501';
  END IF;
  IF p_mes IS NULL OR EXTRACT(DAY FROM p_mes) <> 1 OR coalesce(jsonb_typeof(p_operaciones), '') <> 'array' THEN
    RAISE EXCEPTION 'Mes u operaciones inválidos.' USING ERRCODE = '22023';
  END IF;

  SELECT p.rol, p.id_empresa INTO v_rol, v_empresa
  FROM public.perfiles p
  WHERE p.id = v_usuario AND p.activo = true;

  IF v_rol NOT IN ('administrador', 'super_administrador') THEN
    RAISE EXCEPTION 'Solo un administrador puede guardar la grilla.' USING ERRCODE = '42501';
  END IF;

  PERFORM 1 FROM public.objetivos o
  WHERE o.id = p_id_objetivo
    AND (v_rol = 'super_administrador' OR o.id_empresa = v_empresa);
  IF NOT FOUND THEN
    RAISE EXCEPTION 'El objetivo no pertenece a la empresa autorizada.' USING ERRCODE = '42501';
  END IF;

  -- Serializa guardados simultáneos para el mismo objetivo y mes.
  PERFORM pg_advisory_xact_lock(hashtext(p_id_objetivo::text), hashtext(p_mes::text));

  SELECT EXISTS (
    SELECT 1 FROM public.grillas_mensuales g
    WHERE g.id_objetivo = p_id_objetivo AND g.mes = p_mes
  ) INTO v_creada;

  FOR v_op IN SELECT value FROM jsonb_array_elements(p_operaciones)
  LOOP
    v_fecha := (v_op->>'fecha')::date;
    v_codigo := coalesce(v_op->>'codigo', '');
    v_id_tipo := nullif(v_op->>'id_tipo_turno', '')::uuid;

    IF date_trunc('month', v_fecha)::date <> p_mes THEN
      RAISE EXCEPTION 'Hay una operación fuera del mes seleccionado.' USING ERRCODE = '22023';
    END IF;

    IF v_creada AND v_fecha <= v_hoy THEN
      RAISE EXCEPTION 'No se puede editar hoy ni días anteriores en una grilla ya creada.' USING ERRCODE = '42501';
    END IF;

    SELECT v.id, v.id_usuario INTO v_id_vigilador, v_id_vigilador_usuario
    FROM public.vigiladores v
    JOIN public.asignaciones a ON a.id_vigilador = v.id AND a.id_objetivo = p_id_objetivo
    WHERE v.id_usuario = (v_op->>'id_vigilador')::uuid
      AND v.id_empresa = (SELECT o.id_empresa FROM public.objetivos o WHERE o.id = p_id_objetivo)
      AND (
        -- Asignación vigente en la fecha del turno: regla habitual.
        (a.fecha_inicio <= v_fecha AND (a.fecha_fin IS NULL OR a.fecha_fin >= v_fecha))
        OR
        -- Excepción limitada a la primera grilla del mismo mes de alta:
        -- permite completar días anteriores al inicio de la asignación activa,
        -- sin habilitar objetivos distintos, meses anteriores ni asignaciones cerradas.
        (
          NOT v_creada
          AND a.activa = true
          AND v_fecha < a.fecha_inicio
          AND date_trunc('month', v_fecha)::date = p_mes
          AND date_trunc('month', a.fecha_inicio)::date = p_mes
        )
      )
    ORDER BY a.activa DESC, a.fecha_inicio DESC
    LIMIT 1;

    IF v_id_vigilador IS NULL THEN
      RAISE EXCEPTION 'El vigilador no está asignado a este objetivo en la fecha indicada.' USING ERRCODE = '42501';
    END IF;

    SELECT t.id INTO v_existente
    FROM public.turnos t
    WHERE t.id_objetivo = p_id_objetivo AND t.id_vigilador = v_id_vigilador AND t.fecha = v_fecha
    LIMIT 1;

    IF v_codigo = 'borrar' THEN
      IF v_existente IS NOT NULL THEN
        IF EXISTS (SELECT 1 FROM public.solicitudes_horas_extra s WHERE s.id_turno = v_existente) THEN
          RAISE EXCEPTION 'No se puede borrar un turno con solicitudes de horas extra asociadas.' USING ERRCODE = '42501';
        END IF;
        DELETE FROM public.turnos WHERE id = v_existente;
      END IF;
      CONTINUE;
    END IF;

    IF v_id_tipo IS NOT NULL THEN
      SELECT tt.horas, tt.tipo, coalesce(tt.hora_inicio, '00:00'::time), coalesce(tt.hora_fin, '00:00'::time)
      INTO v_horas, v_tipo, v_inicio, v_fin
      FROM public.tipos_turno tt
      WHERE tt.id = v_id_tipo
        AND tt.activo = true
        AND (tt.id_empresa = (SELECT o.id_empresa FROM public.objetivos o WHERE o.id = p_id_objetivo))
        AND (tt.id_objetivo IS NULL OR tt.id_objetivo = p_id_objetivo);
      IF NOT FOUND THEN
        RAISE EXCEPTION 'El atajo seleccionado no existe o no pertenece a este objetivo.' USING ERRCODE = '42501';
      END IF;
      v_tipo := CASE WHEN v_tipo = 'mixto' THEN 'especial' ELSE v_tipo END;
      IF v_tipo NOT IN ('diurno','nocturno','franco','especial') THEN v_tipo := 'especial'; END IF;
      IF v_tipo = 'franco' THEN v_horas := 0; END IF;
      v_diurnas := CASE WHEN v_tipo = 'diurno' THEN v_horas ELSE 0 END;
      v_nocturnas := CASE WHEN v_tipo = 'nocturno' THEN v_horas ELSE 0 END;
    ELSE
      v_horas := 12; v_tipo := 'diurno'; v_inicio := '07:00'; v_fin := '19:00';
      v_diurnas := 12; v_nocturnas := 0;
      IF v_codigo = '12🌙' THEN
        v_tipo := 'nocturno'; v_inicio := '19:00'; v_fin := '07:00'; v_diurnas := 3; v_nocturnas := 9;
      ELSIF v_codigo = '10' THEN
        v_tipo := 'especial'; v_horas := 10; v_inicio := '08:00'; v_fin := '18:00'; v_diurnas := 10; v_nocturnas := 0;
      ELSIF v_codigo = '8' THEN
        v_tipo := 'diurno'; v_horas := 8; v_inicio := '08:00'; v_fin := '16:00'; v_diurnas := 8; v_nocturnas := 0;
      ELSIF v_codigo = 'F' THEN
        v_tipo := 'franco'; v_horas := 0; v_inicio := '00:00'; v_fin := '00:00'; v_diurnas := 0; v_nocturnas := 0;
      ELSIF v_codigo NOT IN ('12☀️','12🌙','10','8','F') THEN
        RAISE EXCEPTION 'Código de turno inválido.' USING ERRCODE = '22023';
      END IF;
    END IF;

    SELECT EXISTS (
      SELECT 1 FROM public.feriados f
      WHERE f.fecha = v_fecha AND (f.id_empresa IS NULL OR f.id_empresa = (SELECT o.id_empresa FROM public.objetivos o WHERE o.id = p_id_objetivo))
    ) INTO v_feriado;

    IF v_existente IS NULL THEN
      INSERT INTO public.turnos (
        id_empresa, id_objetivo, id_vigilador, fecha, hora_inicio, hora_fin,
        horas_totales, tipo, horas_diurnas, horas_nocturnas, es_feriado,
        es_domingo, id_tipo_turno, estado
      )
      VALUES (
        (SELECT o.id_empresa FROM public.objetivos o WHERE o.id = p_id_objetivo),
        p_id_objetivo, v_id_vigilador, v_fecha, v_inicio, v_fin,
        v_horas, v_tipo, v_diurnas, v_nocturnas, v_feriado,
        EXTRACT(DOW FROM v_fecha) = 0, v_id_tipo, 'programado'
      );
    ELSE
      UPDATE public.turnos SET
        hora_inicio = v_inicio, hora_fin = v_fin, horas_totales = v_horas,
        tipo = v_tipo, horas_diurnas = v_diurnas, horas_nocturnas = v_nocturnas,
        es_feriado = v_feriado, es_domingo = EXTRACT(DOW FROM v_fecha) = 0,
        id_tipo_turno = v_id_tipo, estado = 'programado', actualizado_en = now()
      WHERE id = v_existente;
    END IF;
  END LOOP;

  INSERT INTO public.grillas_mensuales (id_objetivo, mes, id_empresa, creada_por)
  VALUES (p_id_objetivo, p_mes, (SELECT o.id_empresa FROM public.objetivos o WHERE o.id = p_id_objetivo), v_usuario)
  ON CONFLICT (id_objetivo, mes) DO NOTHING;

  RETURN jsonb_build_object('ok', true, 'primera_creacion', NOT v_creada);
END;
$$;

