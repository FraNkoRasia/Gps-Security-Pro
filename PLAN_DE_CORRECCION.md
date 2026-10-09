# PLAN DE CORRECCIÓN — GSP Security Pro

Seguimiento de correcciones de seguridad, integridad y funcionamiento. Se trabaja **una tarea por vez**, con cambios mínimos y verificación antes de marcar cada tarea como completada.

- **Punto de resguardo:** `SALVADO` — commit `04a26bf307e07c8b2fdd32bda89b5662509c3a1e`.
- **Rama de trabajo:** `plan-correccion/01-bloquear-autocambio-rol`.
- **Última actualización:** 2026-10-09.
- **Regla:** no mezclar tareas ni modificar funciones ajenas a la corrección en curso.

## Estado general

- [x] Paso 1 — Bloquear cambios propios de campos de seguridad del perfil. **Aplicado en Supabase y verificado con pruebas transaccionales.**
- [x] Paso 2 — Limitar los campos que puede modificar un administrador en perfiles ajenos. **Aplicado en Supabase y verificado con pruebas transaccionales.**
- [x] Paso 3 — Corregir la aceptación de solicitudes de cambio de turno. **Aplicado en Supabase y verificado con pruebas transaccionales.**
- [x] Paso 4 — Endurecer la RPC `aprobar_cambio_turno`. **Aplicado en Supabase y verificado.**
- [x] Paso 5 — Retirar ejecución anónima de la RPC de horas extra. **Aplicado en Supabase, permisos verificados y migración guardada en esta rama.**
- [x] Paso 6 — Verificar permisos y controles de autorización de la RPC de horas extra. **Permisos y pruebas SQL negativas/positivas verificados; prueba funcional de interfaz queda para el paso 31.**
- [ ] Paso 7 — Auditoría RLS en curso; se revocaron privilegios DDL innecesarios de `authenticated`; sigue pendiente revisar alcance de políticas y relaciones multiempresa.
- [ ] Pasos 8–58 — Pendientes; se abordarán de a uno después de cerrar el paso anterior.

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
- **Limitación pendiente:** la edición de vigiladores desde la interfaz administrativa se verificará en la fase de pruebas funcionales.
- **Motivo/impacto funcional:** evita la elevación de privilegios y el cambio propio de empresa o estado. Los cambios de esos campos deben gestionarse por un flujo administrativo autorizado.

### Paso 2 — Limitar edición de perfiles por administradores

- **Estado:** completado en base de datos; pendiente de prueba funcional desde la interfaz.
- **Base afectada:** Supabase, tabla `public.perfiles`.
- **Migración versionada:** `supabase/migrations/20261008210000_limitar_edicion_perfiles_administrador.sql`.
- **Cambio:** trigger `perfiles_limitar_edicion_administrador` y función `public.limitar_edicion_perfiles_administrador()`.
- **Protección aplicada:** usuarios autenticados no pueden modificar el identificador ni la fecha de creación del perfil. El administrador de empresa no puede cambiar el rol, la empresa asignada ni la configuración `debe_cambiar_contrasena` de otro perfil.
- **Funcionalidad preservada:** el administrador puede seguir modificando nombre, apellido, correo, teléfono y estado activo de los perfiles que las políticas RLS ya le permiten administrar. El superadministrador conserva el alcance de sus políticas existentes. Las Edge Functions que usan service role no se bloquean por este trigger.
- **Pruebas realizadas:** transacciones con rol `authenticated` y un administrador de prueba: la actualización ordinaria del teléfono fue permitida; el intento de cambiar el rol de un vigilador fue bloqueado; el intento de quitarle la empresa también fue bloqueado. Todas las pruebas terminaron con `ROLLBACK`, sin conservar cambios de datos.
- **Resultado:** las tres pruebas devolvieron PASS.
- **Limitación pendiente:** la prueba de edición desde la interfaz y el flujo real de alta/edición quedan para la fase de pruebas funcionales. La base consultada solo tiene una empresa registrada, por lo que no se pudo probar contra una segunda empresa real; se comprobó el bloqueo intentando quitar la empresa del perfil.
- **Motivo/impacto funcional:** limita cambios sensibles por API directa sin quitar las operaciones que la pantalla de gestión de vigiladores usa actualmente.

### Paso 3 — Validar la aceptación de solicitudes de cambio de turno

- **Estado:** aplicado en Supabase; pruebas SQL realizadas. La interfaz completa queda para la fase de pruebas funcionales.
- **Base afectada:** Supabase, tabla `public.solicitudes_cambio`.
- **Migración versionada:** `supabase/migrations/20261008213000_validar_respuesta_solicitud_cambio.sql`.
- **Cambio:** trigger `solicitudes_cambio_validar_respuesta`, función `public.validar_respuesta_solicitud_cambio()` y política RLS de actualización más restrictiva.
- **Protección aplicada:** el solicitante ya no puede modificar directamente el estado para simular que el destinatario aceptó. El destinatario solo puede responder una solicitud pendiente como `aceptada_vigilador` o `rechazada_vigilador`, sin alterar el resto de los datos. Administración tampoco puede registrar directamente una aceptación/rechazo en nombre del colega.
- **Funcionalidad preservada:** el botón del destinatario sigue usando el mismo cambio de estado y la aprobación administrativa en grilla continúa usando la RPC existente. El endurecimiento de esa RPC es el paso 4.
- **Pruebas realizadas:** (1) intento del solicitante de aceptar su propia solicitud, sin cambios persistidos; (2) actualización de aceptación por el destinatario dentro de una transacción revertida; (3) intento administrativo de simular aceptación, bloqueado por el trigger. Todas las pruebas fueron transaccionales o fallaron de forma controlada; no se modificaron permanentemente solicitudes.
- **Resultado:** se confirmó el bloqueo al solicitante por RLS y la protección del trigger ante la aceptación simulada. La prueba del destinatario no devolvió error y se revirtió.
- **Observación:** al revisar la tabla había 7 solicitudes existentes: 6 `aprobada_admin` y 1 `cancelada`; no había solicitudes pendientes reales para probar sin preparar una transacción temporal.
- **Motivo/impacto funcional:** la aceptación debe representar la decisión del vigilador destinatario, no un cambio de estado enviado por cualquier usuario autorizado a ver la solicitud. No se modifica el recorrido funcional: solicitud → respuesta del colega → aprobación administrativa.

### Paso 4 — Endurecer la RPC `aprobar_cambio_turno`

- **Estado:** aplicado en Supabase; permisos y configuración verificados. Prueba negativa con usuario vigilador ejecutada dentro de una transacción revertida.
- **Base afectada:** función `public.aprobar_cambio_turno(uuid, boolean)`.
- **Migración versionada:** `supabase/migrations/20261008220000_endurecer_aprobar_cambio_turno.sql`.
- **Cambio:** `SECURITY DEFINER` conserva su uso por la necesidad del flujo privilegiado, pero ahora tiene `search_path = ''`, referencias de objetos calificadas y comprobación explícita de `auth.uid()`. Se revocó `EXECUTE` a `PUBLIC` y `anon`; se concedió explícitamente a `authenticated`.
- **Validaciones agregadas:** solicitud y decisión obligatorias; administrador/supervisor/superadministrador activo de la misma empresa; estado `aceptada_vigilador`; solicitante y destinatario distintos; turno de origen de la misma empresa y fecha; turno perteneciente al solicitante; destinatario activo de la misma empresa; constraint de intercambio referenciada con esquema explícito.
- **Funcionalidad preservada:** rechazo/cancelación administrativa, reemplazo cuando el destinatario no tiene turno ese día e intercambio cuando ya tiene uno. La operación sigue siendo transaccional.
- **Pruebas realizadas:** verificación SQL confirmó `search_path=""`, `anon_exec=false`, `auth_exec=true` y constraint calificada. Se ejecutó prueba negativa con una cuenta de vigilador; la RPC rechaza la operación por falta de rol administrativo. La transacción se revirtió.
- **Resultado:** la función no se puede invocar con el rol `anon`; solo usuarios autenticados pueden invocarla y la función valida el rol antes de operar.
- **Advertencia pendiente:** Supabase Advisor mantiene el aviso de función `SECURITY DEFINER` invocable por `authenticated`. Es esperado para esta RPC pública que la app llama, pero hay que evaluar una alternativa más aislada (p. ej. wrapper en esquema no expuesto) sin romper la llamada PostgREST. La protección de contraseñas filtradas también sigue pendiente y corresponde al paso 21.
- **Prueba funcional pendiente:** confirmar desde la aplicación tanto un reemplazo como un intercambio real con cuentas de prueba; no se alteraron solicitudes ni turnos reales durante esta verificación.
- **Motivo/impacto funcional:** mantiene el flujo actual, pero impide acceso anónimo y comprueba que la aprobación sea de una persona autorizada, dentro de la empresa correcta y sobre turnos consistentes.

### Paso 5 — Retirar ejecución anónima de la RPC de horas extra

- **Estado:** aplicado en Supabase y verificado; migración versionada en la rama de corrección.
- **Función:** `public.aprobar_solicitud_horas_extra(uuid, boolean, integer)`.
- **Migración versionada:** `supabase/migrations/20261009002310_retirar_ejecucion_anonima_aprobar_horas_extra.sql`.
- **Cambio:** revocado `EXECUTE` para `PUBLIC` y `anon`; concedido explícitamente a `authenticated`.
- **Verificación posterior:** `anon_exec=false`, `public_exec=false`, `authenticated_exec=true`. La función sigue siendo `SECURITY INVOKER` y conserva `search_path=public`.
- **Funcionalidad preservada:** no se cambió el cuerpo de la función, las reglas de aprobación, ni las tablas de solicitudes/turnos. La función sigue validando rol, empresa, estado pendiente y límites de minutos.
- **Impacto funcional esperado:** usuarios anónimos ya no pueden llamar la RPC; las sesiones autenticadas de la aplicación mantienen el permiso y deben pasar la validación interna de administrador.

### Paso 6 — Verificar permisos y autorización de la RPC de horas extra

- **Estado:** completado en base de datos; la prueba funcional de aprobación/rechazo desde la interfaz se realizará junto al paso 31.
- **Comprobado:** el cuerpo de la función verifica `private.is_company_admin()`, limita la solicitud a `private.current_company_id()`, exige estado `pendiente`, verifica el turno asociado y restringe los minutos aprobados a un valor positivo no superior al solicitado.
- **Comprobado en permisos:** solo `authenticated` tiene permiso explícito de ejecución; `anon` y `PUBLIC` no.
- **Pruebas SQL realizadas en transacciones sin cambios persistentes:** (1) con rol `authenticated` y perfil de vigilador, la RPC rechazó la llamada con `Solo un administrador de empresa puede aprobar horas extra`; (2) con perfil administrador, la llamada pasó la comprobación de rol y rechazó el UUID inexistente con `Solicitud de horas extra no encontrada`. No se tocaron solicitudes ni turnos reales.
- **Prueba funcional pendiente (paso 31):** probar desde la interfaz que aprobar/rechazar horas extra siga funcionando con una solicitud de prueba controlada.
- **Criterio de cierre:** completar esas pruebas y confirmar que no hubo cambios persistentes inesperados.

### Paso 7 — Auditoría RLS de tablas públicas (primera revisión)

- **Estado:** en curso; dos ajustes de privilegios aplicados y verificados; auditoría global continúa.
- **Cobertura inicial:** las 16 tablas del esquema `public` tienen RLS habilitado. Se revisaron las políticas de esas tablas y los privilegios de tabla de `anon` y `authenticated`.
- **Hallazgo confirmado:** `anon` tenía privilegios de tabla (`SELECT/INSERT/UPDATE/DELETE`) en `public.novedades_lecturas`, `public.solicitudes_horas_extra` y `public.tipos_turno`, mientras que las políticas RLS relevantes estaban dirigidas a `authenticated`. La lectura con rol `anon` devolvió 0 filas en las tres tablas; no se intentaron escrituras.
- **Cambio aplicado:** revocados todos los privilegios de tabla para `anon` en esas tres tablas. No se modificaron las políticas RLS ni los privilegios de `authenticated`.
- **Migración versionada:** `supabase/migrations/20261009002730_revocar_acceso_anon_tablas_internas.sql`.
- **Verificación posterior:** las tres tablas siguen con RLS habilitado y ahora `anon_select`, `anon_insert`, `anon_update` y `anon_delete` son `false` en las tres.
- **Impacto funcional esperado:** elimina acceso de tabla anónimo a datos internos; la aplicación autenticada conserva SELECT/INSERT/UPDATE/DELETE. No se tocaron filas de datos.
- **Segundo hallazgo:** `authenticated` tenía también privilegios `TRUNCATE`, `REFERENCES` y `TRIGGER` en las 16 tablas públicas. No son necesarios para las operaciones CRUD habituales del cliente y amplían innecesariamente sus capacidades de DDL/DML estructural.
- **Segundo cambio aplicado:** `REVOKE TRUNCATE, REFERENCES, TRIGGER ON ALL TABLES IN SCHEMA public FROM authenticated;` aplicado mediante migración Supabase y versionado en `supabase/migrations/20261009004000_revocar_privilegios_ddl_authenticated_tablas_public.sql`.
- **Verificación posterior:** la consulta de privilegios no devuelve concesiones de `TRUNCATE`, `REFERENCES` ni `TRIGGER` para `anon` o `authenticated`; las 16 tablas siguen concediendo a `authenticated` solamente `SELECT`, `INSERT`, `UPDATE` y `DELETE`. Las RLS no se modificaron.
- **Observación adicional:** `objetivos` y `novedades_libro` tienen políticas declaradas para `public`, pero las tablas no conceden acceso de tabla a `anon`; no se modificaron.
- **Tercer hallazgo:** la función trigger `public.actualizar_actualizado_en()` tenía `EXECUTE` concedido a `PUBLIC`, `anon` y `authenticated`, aunque su cuerpo solo actualiza `NEW.actualizado_en` y devuelve `NEW` para los triggers `perfiles_actualizado_en`, `solicitudes_actualizado_en` y `turnos_actualizado_en`.
- **Tercer cambio aplicado:** revocado `EXECUTE` directo a `PUBLIC`, `anon` y `authenticated` para esa función. Migración versionada: `supabase/migrations/20261009005000_revocar_ejecucion_directa_funcion_trigger_actualizado_en.sql`.
- **Verificación posterior:** `routine_privileges` ya no muestra concesiones a esos roles; los tres triggers que usan la función siguen presentes.
- **Resultado:** no se detectaron tablas del esquema `public` con RLS deshabilitado. La auditoría de privilegios y alcance multiempresa continúa antes de marcar el paso completo.

## Lista maestra

### Fase 1 — Seguridad de Supabase
- [x] **1.** Impedir que un usuario cambie su propio rol, empresa o estado de acceso.
- [x] **2.** Restringir qué campos puede editar un administrador en perfiles.
- [x] **3.** Corregir la aceptación de solicitudes de cambio de turno.
- [x] **4.** Revisar y endurecer la RPC `aprobar_cambio_turno`.
- [x] **5.** Retirar ejecución anónima de RPC administrativas (RPC de horas extra revisada y corregida).
- [x] **6.** Verificar permisos de la RPC de horas extra (SQL verificado; UI queda en paso 31).
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
