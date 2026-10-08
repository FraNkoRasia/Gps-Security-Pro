-- Restringe objetivos, asignaciones y novedades de los vigiladores a sus asignaciones activas.
-- Administradores, supervisores y superadministrador conservan el alcance operativo actual.

drop policy if exists "asignaciones lectura empresa" on public.asignaciones;
drop policy if exists "asignaciones lectura superadmin" on public.asignaciones;
create policy "asignaciones lectura vigilador" on public.asignaciones
for select using (
  (
    private.current_role() = 'vigilador'
    and exists (
      select 1 from public.vigiladores v
      where v.id = asignaciones.id_vigilador and v.id_usuario = auth.uid()
    )
  )
  or (
    private.current_role() <> 'vigilador'
    and id_empresa = private.current_company_id()
  )
  or private.current_role() = 'super_administrador'
);

drop policy if exists "objetivos lectura empresa" on public.objetivos;
create policy "objetivos lectura empresa" on public.objetivos
for select using (
  private.current_role() = 'super_administrador'
  or (
    private.current_role() <> 'vigilador'
    and id_empresa = private.current_company_id()
  )
  or (
    private.current_role() = 'vigilador'
    and exists (
      select 1
      from public.asignaciones a
      join public.vigiladores v on v.id = a.id_vigilador
      where a.id_objetivo = objetivos.id
        and a.activa = true
        and a.fecha_inicio <= current_date
        and (a.fecha_fin is null or a.fecha_fin >= current_date)
        and v.id_usuario = auth.uid()
    )
  )
);

drop policy if exists "novedades lectura empresa" on public.novedades_libro;
create policy "novedades lectura empresa" on public.novedades_libro
for select using (
  (
    private.current_role() <> 'vigilador'
    and id_empresa = private.current_company_id()
  )
  or private.current_role() = 'super_administrador'
  or (
    private.current_role() = 'vigilador'
    and exists (
      select 1
      from public.asignaciones a
      join public.vigiladores v on v.id = a.id_vigilador
      where a.id_objetivo = novedades_libro.id_objetivo
        and a.activa = true
        and a.fecha_inicio <= current_date
        and (a.fecha_fin is null or a.fecha_fin >= current_date)
        and v.id_usuario = auth.uid()
    )
  )
);

drop policy if exists "novedades alta empresa" on public.novedades_libro;
create policy "novedades alta empresa" on public.novedades_libro
for insert with check (
  creado_por = auth.uid()
  and (
    (
      private.current_role() <> 'vigilador'
      and id_empresa = private.current_company_id()
    )
    or private.current_role() = 'super_administrador'
    or (
      private.current_role() = 'vigilador'
      and exists (
        select 1
        from public.asignaciones a
        join public.vigiladores v on v.id = a.id_vigilador
        where a.id_objetivo = novedades_libro.id_objetivo
          and a.id_vigilador = novedades_libro.id_vigilador
          and a.activa = true
          and a.fecha_inicio <= novedades_libro.fecha
          and (a.fecha_fin is null or a.fecha_fin >= novedades_libro.fecha)
          and v.id_usuario = auth.uid()
          and v.id_empresa = novedades_libro.id_empresa
      )
    )
  )
);
