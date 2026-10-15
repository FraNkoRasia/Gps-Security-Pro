-- Permite que cada vigilador lea únicamente la ficha técnica vinculada a su propia cuenta.
-- La política de lectura para Administración/Super Administración permanece sin cambios.
drop policy if exists "vigilador lee su propia ficha" on public.fichas_vigiladores;

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


-- Permite resolver el vínculo entre la cuenta autenticada y su registro de vigilador.
drop policy if exists "vigilador lee su propio registro" on public.vigiladores;

create policy "vigilador lee su propio registro"
on public.vigiladores
for select
to authenticated
using (id_usuario = (select auth.uid()));
