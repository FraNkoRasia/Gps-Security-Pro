-- Fuente canónica para horas extra: solicitudes aprobadas en minutos.
-- El total del turno es únicamente un espejo derivado y se recalcula al cambiar solicitudes.

create or replace function public.validar_solicitud_horas_extra()
returns trigger
language plpgsql
set search_path = public
as $$
declare
  t public.turnos;
  minutos_calculados integer;
begin
  select * into t
  from public.turnos
  where id = new.id_turno
    and id_empresa = new.id_empresa
  for share;

  if not found then
    raise exception 'El turno asociado no existe en la empresa indicada';
  end if;

  if new.id_vigilador <> t.id_vigilador
     or new.id_objetivo <> t.id_objetivo
     or new.fecha <> t.fecha
     or new.hora_salida_programada <> t.hora_fin then
    raise exception 'Los datos de la solicitud no coinciden con el turno seleccionado';
  end if;

  minutos_calculados := extract(epoch from (new.hora_salida_real - new.hora_salida_programada))::integer / 60;
  if minutos_calculados <= 0 then
    minutos_calculados := minutos_calculados + 1440;
  end if;

  if minutos_calculados <= 0 or minutos_calculados > 720 then
    raise exception 'La duración de horas extra debe ser mayor a cero y no superar 12 horas. Verificá la salida real ingresada.';
  end if;

  -- La duración se calcula en el servidor; nunca se confía en minutos enviados por la interfaz.
  new.minutos_solicitados := minutos_calculados;

  if new.estado = 'aprobada' then
    if new.minutos_aprobados is null or new.minutos_aprobados <= 0
       or new.minutos_aprobados > new.minutos_solicitados
       or new.minutos_aprobados > 720 then
      raise exception 'Los minutos aprobados deben ser positivos y no superar lo solicitado ni 12 horas';
    end if;
  else
    new.minutos_aprobados := null;
  end if;

  return new;
end;
$$;

drop trigger if exists validar_solicitud_horas_extra on public.solicitudes_horas_extra;
create trigger validar_solicitud_horas_extra
before insert or update on public.solicitudes_horas_extra
for each row execute function public.validar_solicitud_horas_extra();

-- Solo puede haber una solicitud pendiente por turno. Las aprobadas pueden coexistir
-- si representan extensiones distintas y el total siempre se deriva de sus minutos.
create unique index if not exists uq_solicitud_horas_extra_pendiente_turno
on public.solicitudes_horas_extra (id_turno)
where estado = 'pendiente';

create or replace function public.sincronizar_horas_extra_turno()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  turno_afectado uuid;
begin
  if tg_op = 'DELETE' then
    turno_afectado := old.id_turno;
  else
    turno_afectado := new.id_turno;
  end if;

  update public.turnos t
  set horas_extra = coalesce((
        select sum(s.minutos_aprobados)::numeric / 60
        from public.solicitudes_horas_extra s
        where s.id_turno = turno_afectado
          and s.estado = 'aprobada'
      ), 0)
  where t.id = turno_afectado;

  -- Si una solicitud cambió de turno, sincronizar también el anterior.
  if tg_op = 'UPDATE' and old.id_turno is distinct from new.id_turno then
    update public.turnos t
    set horas_extra = coalesce((
          select sum(s.minutos_aprobados)::numeric / 60
          from public.solicitudes_horas_extra s
          where s.id_turno = old.id_turno
            and s.estado = 'aprobada'
        ), 0)
    where t.id = old.id_turno;
  end if;

  if tg_op = 'DELETE' then return old; end if;
  return new;
end;
$$;

revoke all on function public.sincronizar_horas_extra_turno() from public, anon, authenticated;

drop trigger if exists sincronizar_horas_extra_turno on public.solicitudes_horas_extra;
create trigger sincronizar_horas_extra_turno
after insert or update or delete on public.solicitudes_horas_extra
for each row execute function public.sincronizar_horas_extra_turno();

create or replace function public.aprobar_solicitud_horas_extra(
  p_solicitud_id uuid,
  p_aprobar boolean,
  p_minutos_aprobados integer default null
)
returns public.solicitudes_horas_extra
language plpgsql
set search_path = public
as $$
declare
  s public.solicitudes_horas_extra;
  minutos integer;
begin
  if not (select private.is_company_admin()) then
    raise exception 'Solo un administrador de empresa puede aprobar horas extra';
  end if;

  select * into s
  from public.solicitudes_horas_extra
  where id = p_solicitud_id
    and id_empresa = (select private.current_company_id())
  for update;

  if not found then
    raise exception 'Solicitud de horas extra no encontrada';
  end if;

  if s.estado <> 'pendiente' then
    raise exception 'La solicitud ya fue procesada';
  end if;

  if p_aprobar then
    minutos := coalesce(p_minutos_aprobados, s.minutos_solicitados);
    if minutos <= 0 or minutos > s.minutos_solicitados or minutos > 720 then
      raise exception 'Los minutos aprobados deben ser positivos y no superar lo solicitado ni 12 horas';
    end if;

    update public.solicitudes_horas_extra
    set estado = 'aprobada',
        minutos_aprobados = minutos,
        revisado_por = (select auth.uid()),
        revisado_en = now()
    where id = s.id
    returning * into s;
    -- El trigger sincroniza turnos.horas_extra desde todas las solicitudes aprobadas.
  else
    update public.solicitudes_horas_extra
    set estado = 'rechazada',
        minutos_aprobados = null,
        revisado_por = (select auth.uid()),
        revisado_en = now()
    where id = s.id
    returning * into s;
  end if;

  return s;
end;
$$;

-- Reparación conservadora: vuelve a derivar los espejos de los turnos desde los minutos aprobados.
update public.turnos t
set horas_extra = coalesce((
  select sum(s.minutos_aprobados)::numeric / 60
  from public.solicitudes_horas_extra s
  where s.id_turno = t.id and s.estado = 'aprobada'
), 0)
where t.horas_extra is distinct from coalesce((
  select sum(s.minutos_aprobados)::numeric / 60
  from public.solicitudes_horas_extra s
  where s.id_turno = t.id and s.estado = 'aprobada'
), 0);
