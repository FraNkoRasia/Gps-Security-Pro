# PLAN DE CORRECCIÓN — GSP Security Pro

Seguimiento de correcciones de seguridad, integridad y funcionamiento. Se trabaja **una tarea por vez**, con cambios mínimos y verificación antes de marcar cada tarea como completada.

- **Punto de resguardo:** `SALVADO` — commit `04a26bf307e07c8b2fdd32bda89b5662509c3a1e`.
- **Rama de trabajo:** `plan-correccion/01-bloquear-autocambio-rol`.
- **Última actualización:** 2026-10-08.
- **Regla:** no mezclar tareas ni modificar funciones ajenas a la corrección en curso.

## Estado general

- [x] Paso 1 — Bloquear cambios propios de campos de seguridad del perfil. **Aplicado en Supabase y verificado con pruebas transaccionales.**
- [ ] Pasos 2–58 — Pendientes; se abordarán de a uno después de cerrar el paso anterior.

## Registro de pasos ejecutados

### Paso 1 — Bloquear auto-modificación de campos de seguridad del perfil

- **Estado:** completado.
- **Base afectada:** Supabase, tabla `public.perfiles`.
- **Migración versionada:** `supabase/migrations/20261008203600_bloquear_autocambio_campos_seguridad.sql`.
- **Cambio:** trigger `perfiles_proteger_campos_seguridad` y función `public.proteger_campos_seguridad_perfil()`.
- **Protección:** un usuario autenticado no puede cambiar en su propio registro `id`, `rol`, `id_empresa` ni `activo`.
- **Funcionalidad preservada:** cambios ordinarios de perfil siguen permitidos. Los permisos de administradores sobre perfiles ajenos permanecen bajo las políticas RLS existentes.
- **Pruebas realizadas:** se intentó modificar el rol propio dentro de una transacción con el rol `authenticated`; la excepción de permisos fue interceptada por la prueba y la transacción se revirtió. También se probó una actualización de campo de perfil dentro de una transacción revertida. Se verificó la presencia del trigger y que la función no tenga permiso de ejecución directa para `anon` ni `authenticated`.
- **Resultado:** pruebas SQL superadas; no se alteró permanentemente el perfil de prueba.
- **Limitación pendiente:** no se probó todavía desde la interfaz de la aplicación la edición de vigiladores por un administrador; se verificará en la fase correspondiente.
- **Motivo/impacto funcional:** evita la elevación de privilegios y el cambio propio de empresa o estado. Los cambios de esos campos deben gestionarse por un flujo administrativo autorizado.

## Lista maestra

### Fase 1 — Seguridad de Supabase
- [x] **1.** Impedir que un usuario cambie su propio rol, empresa o estado de acceso.
- [ ] **2.** Restringir qué campos puede editar un administrador en perfiles.
- [ ] **3.** Corregir la aceptación de solicitudes de cambio de turno.
- [ ] **4.** Revisar y endurecer la RPC `aprobar_cambio_turno`.
- [ ] **5.** Retirar ejecución anónima de RPC administrativas.
- [ ] **6.** Verificar permisos de la RPC de horas extra.
- [ ] **7.** Auditar políticas RLS de todas las tablas.
- [ ] **8.** Evitar relaciones cruzadas entre empresas.
- [ ] **9.** Revisar la asociación entre vigiladores y cuentas.
- [ ] **10.** Revisar permisos sobre empresas.
- [ ] **11.** Revisar funciones `SECURITY DEFINER`.
- [ ] **12.** Verificar el bootstrap del primer superadministrador.

### Fase 2 — Base de datos y migraciones
- [ ] **13.** Inventariar tablas y columnas reales.
- [ ] **14.** Versionar migraciones faltantes.
- [ ] **15.** Comparar políticas reales con las migraciones del repositorio.
- [ ] **16.** Revisar claves foráneas e integridad entre empresas.
- [ ] **17.** Revisar índices operativos.
- [ ] **18.** Optimizar RLS sin cambiar sus reglas funcionales.
- [ ] **19.** Revisar permisos de tablas y secuencias.
- [ ] **20.** Verificar que no haya secretos en el frontend.
- [ ] **21.** Activar protección de contraseñas comprometidas.

### Fase 3 — Roles y permisos de la aplicación
- [ ] **22.** Verificar menú y permisos del supervisor.
- [ ] **23.** Limitar objetivos visibles al vigilador a los que le corresponden.
- [ ] **24.** Revisar traslados y cambios de objetivo.
- [ ] **25.** Revisar alta y edición de vigiladores.
- [ ] **26.** Revisar baja y desactivación de usuarios.
- [ ] **27.** Verificar accesos del superadministrador.
- [ ] **28.** Revisar permisos de avisos y novedades.

### Fase 4 — Flujos funcionales
- [ ] **29.** Probar cambios de turno de punta a punta.
- [ ] **30.** Garantizar atomicidad del intercambio de turnos.
- [ ] **31.** Probar solicitudes y aprobación de horas extra.
- [ ] **32.** Verificar notificaciones de cambios y reemplazos.
- [ ] **33.** Verificar el flujo de avisos.
- [ ] **34.** Verificar el libro de novedades.
- [ ] **35.** Verificar historial de correcciones de novedades.
- [ ] **36.** Revisar auditoría de acciones sensibles.
- [ ] **37.** Corregir y probar la creación de empresas y su Edge Function.
- [ ] **38.** Probar la creación de vigiladores y sus cuentas.
- [ ] **39.** Revisar errores de Edge Functions.

### Fase 5 — Fechas y cálculos
- [ ] **40.** Quitar el mes fijo de la grilla mensual.
- [ ] **41.** Corregir el mes fijo de Mi Mes.
- [ ] **42.** Corregir la fecha inicial fija en cambios de turno.
- [ ] **43.** Verificar cálculos de horas trabajadas.
- [ ] **44.** Verificar patrones de turnos.
- [ ] **45.** Revisar reglas laborales configurables.
- [ ] **46.** Revisar fechas, zona horaria y feriados.

### Fase 6 — Calidad y pendientes por confirmar
- [ ] **47.** Crear matriz de pruebas por rol.
- [ ] **48.** Probar políticas con solicitudes directas a la API.
- [ ] **49.** Añadir pruebas automatizadas de RPC.
- [ ] **50.** Repetir pruebas de flujos después de las correcciones.
- [ ] **51.** Alinear el hash de referencia del README con el commit SALVADO correcto.
- [ ] **52.** Revisar respaldo y recuperación.
- [ ] **53.** Confirmar si fichada de ingreso/egreso está dentro del alcance.
- [ ] **54.** Confirmar si GPS y rondas QR están dentro del alcance.
- [ ] **55.** Confirmar si notificaciones push Android están dentro del alcance.
- [ ] **56.** Confirmar si exportaciones Excel/PDF están dentro del alcance.
- [ ] **57.** Revisar experiencia móvil y permisos de pantalla.
- [ ] **58.** Ejecutar checklist de preproducción.

## Regla de trabajo

No comenzar el siguiente paso hasta que el usuario lo indique. Antes de cada cambio se revisará el código o la configuración relacionada, se explicará cualquier impacto funcional y se probará la corrección. No se mezclarán tareas.
