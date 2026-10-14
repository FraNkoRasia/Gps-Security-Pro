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

with filas as (
  select id, legajo,
         row_number() over (
           partition by nullif(lower(btrim(legajo)), '')
           order by creado_en asc, id asc
         ) as posicion
  from public.vigiladores
  where legajo is not null and btrim(legajo) <> ''
),
a_corregir as (
  select id from filas where posicion > 1
  union
  select id from public.vigiladores where legajo is null or btrim(legajo) = ''
)
update public.vigiladores v
set legajo = nextval('public.vigiladores_legajo_seq')::text
from a_corregir c
where c.id = v.id;

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
