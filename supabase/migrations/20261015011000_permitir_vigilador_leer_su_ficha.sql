-- Permite que cada vigilador lea únicamente la ficha técnica vinculada a su propia cuenta.
-- La política de lectura para Administración/Super Administración permanece sin cambios.
create policy "vigilador lee su propia ficha"
on public.fichas_vigiladores
for select
to authenticated
using (
  exists (
    select 1
    from public.vigiladores v
    where v.id = fichas_vigiladores.id_vigilador
      and v.id_usuario = (select auth.uid())
  )
);
