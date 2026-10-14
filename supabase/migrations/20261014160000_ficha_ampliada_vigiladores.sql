-- Ficha ampliada del vigilador.
-- Los datos personales y laborales quedan separados de la tabla operativa
-- para que supervisores y vigiladores no puedan consultarlos.

create table if not exists public.fichas_vigiladores (
  id uuid primary key default gen_random_uuid(),
  id_vigilador uuid not null unique references public.vigiladores(id) on delete cascade,
  id_empresa uuid not null references public.empresas(id) on delete cascade,
  dni text,
  fecha_nacimiento date,
  domicilio text,
  contacto_emergencia_nombre text,
  contacto_emergencia_telefono text,
  fecha_ingreso date,
  categoria text,
  tipo_contrato text,
  fecha_fin_contrato date,
  notas_administrativas text,
  creado_en timestamptz not null default now(),
  actualizado_en timestamptz not null default now(),
  constraint fichas_vigiladores_dni_no_vacio
    check (dni is null or length(trim(dni)) > 0),
  constraint fichas_vigiladores_contacto_emergencia_no_vacio
    check (
      (contacto_emergencia_nombre is null or length(trim(contacto_emergencia_nombre)) > 0)
      and
      (contacto_emergencia_telefono is null or length(trim(contacto_emergencia_telefono)) > 0)
    )
);

create index if not exists fichas_vigiladores_empresa_idx
  on public.fichas_vigiladores (id_empresa);

alter table public.fichas_vigiladores enable row level security;

-- La ficha incluye DNI, domicilio y contacto de emergencia:
-- acceso exclusivo a administradores de la empresa y superadministradores.
drop policy if exists "fichas vigilador lectura admin" on public.fichas_vigiladores;
create policy "fichas vigilador lectura admin"
  on public.fichas_vigiladores
  for select
  to authenticated
  using (
    private."current_role"() = 'super_administrador'
    or (
      private."current_role"() = 'administrador'
      and id_empresa = (select private.current_company_id())
    )
  );

drop policy if exists "fichas vigilador alta admin" on public.fichas_vigiladores;
create policy "fichas vigilador alta admin"
  on public.fichas_vigiladores
  for insert
  to authenticated
  with check (
    (
      private."current_role"() = 'super_administrador'
      or (
        private."current_role"() = 'administrador'
        and id_empresa = (select private.current_company_id())
      )
    )
    and exists (
      select 1
      from public.vigiladores v
      where v.id = id_vigilador
        and v.id_empresa = id_empresa
    )
  );

drop policy if exists "fichas vigilador edicion admin" on public.fichas_vigiladores;
create policy "fichas vigilador edicion admin"
  on public.fichas_vigiladores
  for update
  to authenticated
  using (
    private."current_role"() = 'super_administrador'
    or (
      private."current_role"() = 'administrador'
      and id_empresa = (select private.current_company_id())
    )
  )
  with check (
    (
      private."current_role"() = 'super_administrador'
      or (
        private."current_role"() = 'administrador'
        and id_empresa = (select private.current_company_id())
      )
    )
    and exists (
      select 1
      from public.vigiladores v
      where v.id = id_vigilador
        and v.id_empresa = id_empresa
    )
  );

grant select, insert, update on public.fichas_vigiladores to authenticated;
revoke all on public.fichas_vigiladores from anon;
