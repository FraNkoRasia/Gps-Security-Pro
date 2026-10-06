-- GSP: persistir el correo de acceso de los vigiladores en perfiles.
-- El valor se mantiene sincronizado con auth.users por las operaciones de la app.

ALTER TABLE public.perfiles
  ADD COLUMN IF NOT EXISTS email text;

UPDATE public.perfiles p
SET email = u.email
FROM auth.users u
WHERE u.id = p.id
  AND COALESCE(p.email, '') = '';

CREATE INDEX IF NOT EXISTS idx_perfiles_email ON public.perfiles(email);