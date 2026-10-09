-- Índice de soporte para la FK novedades_lecturas.id_usuario.
-- Cambio aditivo: no altera filas ni permisos.
CREATE INDEX IF NOT EXISTS novedades_lecturas_id_usuario_idx
  ON public.novedades_lecturas (id_usuario);
