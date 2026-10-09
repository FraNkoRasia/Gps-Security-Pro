-- PLAN DE CORRECCIÓN - Pasos 7 y 8
-- Asegura que la empresa del objetivo, la asignación, el vigilador y la novedad coincidan.
-- Los controles previos de datos no detectaron inconsistencias; no modifica filas.

DROP POLICY IF EXISTS "objetivos lectura empresa" ON public.objetivos;
CREATE POLICY "objetivos lectura empresa" ON public.objetivos
FOR SELECT USING (
  private.current_role() = 'super_administrador'
  OR (
    private.current_role() <> 'vigilador'
    AND id_empresa = private.current_company_id()
  )
  OR (
    private.current_role() = 'vigilador'
    AND EXISTS (
      SELECT 1
      FROM public.asignaciones a
      JOIN public.vigiladores v ON v.id = a.id_vigilador
      WHERE a.id_objetivo = objetivos.id
        AND a.id_empresa = objetivos.id_empresa
        AND v.id_empresa = objetivos.id_empresa
        AND a.activa = true
        AND a.fecha_inicio <= CURRENT_DATE
        AND (a.fecha_fin IS NULL OR a.fecha_fin >= CURRENT_DATE)
        AND v.id_usuario = (SELECT auth.uid())
    )
  )
);

DROP POLICY IF EXISTS "novedades lectura empresa" ON public.novedades_libro;
CREATE POLICY "novedades lectura empresa" ON public.novedades_libro
FOR SELECT USING (
  (
    private.current_role() <> 'vigilador'
    AND id_empresa = private.current_company_id()
  )
  OR private.current_role() = 'super_administrador'
  OR (
    private.current_role() = 'vigilador'
    AND EXISTS (
      SELECT 1
      FROM public.asignaciones a
      JOIN public.vigiladores v ON v.id = a.id_vigilador
      JOIN public.objetivos o ON o.id = a.id_objetivo
      WHERE a.id_objetivo = novedades_libro.id_objetivo
        AND a.id_empresa = novedades_libro.id_empresa
        AND v.id_empresa = novedades_libro.id_empresa
        AND o.id_empresa = novedades_libro.id_empresa
        AND a.activa = true
        AND a.fecha_inicio <= CURRENT_DATE
        AND (a.fecha_fin IS NULL OR a.fecha_fin >= CURRENT_DATE)
        AND v.id_usuario = (SELECT auth.uid())
    )
  )
);

DROP POLICY IF EXISTS "novedades alta empresa" ON public.novedades_libro;
CREATE POLICY "novedades alta empresa" ON public.novedades_libro
FOR INSERT WITH CHECK (
  creado_por = (SELECT auth.uid())
  AND (
    (
      private.current_role() <> 'vigilador'
      AND id_empresa = private.current_company_id()
    )
    OR private.current_role() = 'super_administrador'
    OR (
      private.current_role() = 'vigilador'
      AND EXISTS (
        SELECT 1
        FROM public.asignaciones a
        JOIN public.vigiladores v ON v.id = a.id_vigilador
        JOIN public.objetivos o ON o.id = a.id_objetivo
        WHERE a.id_objetivo = novedades_libro.id_objetivo
          AND a.id_vigilador = novedades_libro.id_vigilador
          AND a.id_empresa = novedades_libro.id_empresa
          AND v.id_empresa = novedades_libro.id_empresa
          AND o.id_empresa = novedades_libro.id_empresa
          AND a.activa = true
          AND a.fecha_inicio <= novedades_libro.fecha
          AND (a.fecha_fin IS NULL OR a.fecha_fin >= novedades_libro.fecha)
          AND v.id_usuario = (SELECT auth.uid())
      )
    )
  )
);
