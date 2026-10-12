-- Permite registrar el nombre del supervisor como dato informativo, sin requerir una cuenta.
-- Se conserva id_supervisor para no romper vínculos antiguos.
ALTER TABLE public.objetivos
ADD COLUMN IF NOT EXISTS supervisor_nombre TEXT;
