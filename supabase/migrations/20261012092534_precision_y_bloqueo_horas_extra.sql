-- Preserva precisión de minutos y bloquea duplicados pendientes/aprobados por turno.
alter table public.turnos
  alter column horas_extra type numeric
  using horas_extra::numeric;

drop index if exists public.uq_solicitud_horas_extra_pendiente_turno;
create unique index if not exists uq_solicitud_horas_extra_activa_turno
on public.solicitudes_horas_extra (id_turno)
where estado in ('pendiente','aprobada');

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
