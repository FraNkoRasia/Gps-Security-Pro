-- Alta integral de vigiladores y legajo automático, único y secuencial.
-- Conserva el legajo más antiguo cuando hay duplicados y asigna nuevos a los demás.

create sequence if not exists public.vigiladores_legajo_seq;

select setval(
  'public.vigiladores_legajo_seq',
  greatest(
    coalesce((select max(legajo::bigint) from public.vigiladores where btrim(legajo) ~ '^[0-9]+$'), 0),
    0
  ),
  true
);

with base as (
  select coalesce(max(legajo::bigint) filter (where btrim(legajo) ~ '^[0-9]+$'), 0) as max_legajo
  from public.vigiladores
),
filas as (
  select id,
         row_number() over (
           partition by nullif(lower(btrim(legajo)), '')
           order by creado_en asc, id asc
         ) as posicion
  from public.vigiladores
  where legajo is not null and btrim(legajo) <> ''
),
a_corregir as (
  select v.id, v.creado_en
  from public.vigiladores v
  left join filas f on f.id = v.id
  where (v.legajo is null or btrim(v.legajo) = '')
     or coalesce(f.posicion, 1) > 1
),
numerados as (
  select id, row_number() over (order by creado_en asc, id asc) as numero
  from a_corregir
)
update public.vigiladores v
set legajo = (b.max_legajo + n.numero)::text
from numerados n cross join base b
where n.id = v.id;

select setval(
  'public.vigiladores_legajo_seq',
  greatest(
    coalesce((select max(legajo::bigint) from public.vigiladores where btrim(legajo) ~ '^[0-9]+$'), 0),
    1
  ),
  true
);

create unique index if not exists vigiladores_legajo_unico_idx
  on public.vigiladores (lower(btrim(legajo)))
  where legajo is not null and btrim(legajo) <> '';

create or replace function public.asignar_legajo_vigilador()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if tg_op = 'INSERT' then
    new.legajo := nextval('public.vigiladores_legajo_seq')::text;
    return new;
  end if;

  if new.legajo is distinct from old.legajo then
    raise exception 'El legajo se asigna automáticamente y no se puede modificar.'
      using errcode = '22023';
  end if;

  return new;
end;
$$;

drop trigger if exists trg_asignar_legajo_vigilador on public.vigiladores;
create trigger trg_asignar_legajo_vigilador
before insert or update of legajo on public.vigiladores
for each row execute function public.asignar_legajo_vigilador();

revoke all on sequence public.vigiladores_legajo_seq from public, anon, authenticated;
grant usage, select on sequence public.vigiladores_legajo_seq to service_role;

comment on column public.vigiladores.legajo is
  'Número de legajo secuencial generado automáticamente; único y no editable.';
