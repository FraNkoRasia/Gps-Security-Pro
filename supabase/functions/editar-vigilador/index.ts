import "jsr:@supabase/functions-js/edge-runtime.d.ts"
import { createClient } from "jsr:@supabase/supabase-js@2"

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
}
const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { "Content-Type": "application/json", ...corsHeaders } })

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { status: 200, headers: corsHeaders })
  if (req.method !== "POST") return json({ error: "Método no permitido." }, 405)

  try {
    const token = req.headers.get("Authorization")?.replace(/^Bearer\s+/i, "")
    if (!token) return json({ error: "No autenticado." }, 401)
    const url = Deno.env.get("SUPABASE_URL")
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")
    if (!url || !serviceRoleKey) return json({ error: "Configuración de servidor incompleta." }, 500)

    const admin = createClient(url, serviceRoleKey, { auth: { autoRefreshToken: false, persistSession: false } })
    const { data: authData, error: authError } = await admin.auth.getUser(token)
    if (authError || !authData.user) return json({ error: "Sesión no válida." }, 401)

    const { data: caller, error: callerError } = await admin.from("perfiles")
      .select("id,id_empresa,rol,activo").eq("id", authData.user.id).single()
    if (callerError || !caller?.activo || !["administrador", "super_administrador"].includes(caller.rol)) {
      return json({ error: "Solo administración puede editar vigiladores." }, 403)
    }

    let body: { accion?: string; vigilador_id?: string; vigilador_operativo_id?: string; nombre?: string; apellido?: string; email?: string; telefono?: string | null; dni?: string; fecha_nacimiento?: string; domicilio?: string; contacto_emergencia_nombre?: string; contacto_emergencia_telefono?: string; fecha_ingreso?: string; categoria?: string; tipo_contrato?: string; fecha_fin_contrato?: string | null; notas_administrativas?: string }
    try { body = await req.json() } catch { return json({ error: "Datos inválidos." }, 400) }
    const targetId = body.vigilador_id?.trim()
    const legacyOperationalId = body.vigilador_operativo_id?.trim()

    if (body.accion === "restablecer_contrasena") {
      if (!targetId || legacyOperationalId) return json({ error: "Cuenta de vigilador inválida." }, 400)
      const { data: targetProfile, error: targetProfileError } = await admin.from("perfiles")
        .select("id,id_empresa,rol,debe_cambiar_contrasena").eq("id", targetId).single()
      if (targetProfileError || !targetProfile || targetProfile.rol !== "vigilador") {
        return json({ error: "No se encontró una cuenta de vigilador." }, 404)
      }
      if (caller.rol !== "super_administrador" && targetProfile.id_empresa !== caller.id_empresa) {
        return json({ error: "No puede restablecer contraseñas de otra empresa." }, 403)
      }
      const { data: operationalTarget, error: operationalTargetError } = await admin.from("vigiladores")
        .select("id,id_empresa").eq("id_usuario", targetId).single()
      if (operationalTargetError || !operationalTarget || operationalTarget.id_empresa !== targetProfile.id_empresa) {
        return json({ error: "No se encontró el registro operativo del vigilador." }, 409)
      }
      const { data: fichaTarget, error: fichaTargetError } = await admin.from("fichas_vigiladores")
        .select("dni").eq("id_vigilador", operationalTarget.id).maybeSingle()
      if (fichaTargetError || !fichaTarget?.dni) {
        return json({ error: "El vigilador no tiene un DNI guardado en su ficha." }, 409)
      }
      const passwordInicial = String(fichaTarget.dni).replace(/\D/g, "")
      if (passwordInicial.length < 6) {
        return json({ error: "El DNI registrado debe contener al menos 6 dígitos para utilizarlo como contraseña inicial." }, 400)
      }
      // Activar primero el bloqueo. Si Auth falla, restaurar el valor previo.
      const { error: profileError } = await admin.from("perfiles")
        .update({ debe_cambiar_contrasena: true }).eq("id", targetId)
      if (profileError) return json({ error: "No se pudo activar el cambio obligatorio; la contraseña no fue modificada." }, 500)

      const { error: passwordError } = await admin.auth.admin.updateUserById(targetId, { password: passwordInicial })
      if (passwordError) {
        const { error: rollbackError } = await admin.from("perfiles")
          .update({ debe_cambiar_contrasena: targetProfile.debe_cambiar_contrasena === true }).eq("id", targetId)
        if (rollbackError) console.error("No se pudo revertir la marca de cambio obligatorio:", rollbackError.message)
        return json({ error: "Supabase no aceptó el DNI como contraseña inicial. Revisá la política de contraseñas de Auth." }, 400)
      }

      // Revocar los refresh tokens para que las sesiones previas no sigan renovándose.
      // El indicador de cambio obligatorio también se revalida en el cliente.
      const { error: signOutError } = await admin.auth.admin.signOut(targetId, "global")
      if (signOutError) {
        console.error("No se pudieron revocar todas las sesiones del vigilador:", signOutError.message)
        return json({ error: "La contraseña se restableció, pero no se pudieron revocar todas las sesiones. El cambio obligatorio quedó activado; cerrá las sesiones del vigilador y revisá Auth." }, 500)
      }

      const { error: auditError } = await admin.from("auditoria").insert({
        id_empresa: targetProfile.id_empresa,
        id_usuario: caller.id,
        accion: "RESTABLECER_CONTRASENA_VIGILADOR",
        entidad: "Vigilador",
        entidad_id: operationalTarget.id,
        detalle: { texto: "Restableció la contraseña al DNI; cambio obligatorio al próximo ingreso" },
        fecha_hora: new Date().toISOString(),
      })
      if (auditError) console.error("No se pudo registrar auditoría:", auditError.message)
      return json({ ok: true })
    }

    if (body.accion === "consultar_email") {
      if (!targetId || legacyOperationalId) return json({ error: "Cuenta de vigilador inválida." }, 400)
      const { data: targetEmailProfile, error: targetEmailProfileError } = await admin.from("perfiles")
        .select("id,id_empresa,rol").eq("id", targetId).single()
      if (targetEmailProfileError || !targetEmailProfile || targetEmailProfile.rol !== "vigilador") {
        return json({ error: "No se encontró una cuenta de vigilador." }, 404)
      }
      if (caller.rol !== "super_administrador" && targetEmailProfile.id_empresa !== caller.id_empresa) {
        return json({ error: "No puede consultar personal de otra empresa." }, 403)
      }
      const { data: authTarget, error: authTargetError } = await admin.auth.admin.getUserById(targetId)
      if (authTargetError || !authTarget.user) return json({ error: "No se pudo recuperar el correo de la cuenta." }, 409)
      return json({ email: authTarget.user.email || "" })
    }
    const nombre = body.nombre?.trim()
    const apellido = body.apellido?.trim()
    const email = body.email?.trim().toLowerCase()
    const telefono = body.telefono?.trim() || null
    const incluyeFicha = ["dni", "fecha_nacimiento", "domicilio", "contacto_emergencia_nombre", "contacto_emergencia_telefono", "fecha_ingreso", "categoria", "tipo_contrato", "fecha_fin_contrato", "notas_administrativas"].some((key) => Object.prototype.hasOwnProperty.call(body, key))
    const ficha = {
      dni: body.dni?.trim() || null,
      fecha_nacimiento: body.fecha_nacimiento || null,
      domicilio: body.domicilio?.trim() || null,
      contacto_emergencia_nombre: body.contacto_emergencia_nombre?.trim() || null,
      contacto_emergencia_telefono: body.contacto_emergencia_telefono?.trim() || null,
      fecha_ingreso: body.fecha_ingreso || null,
      categoria: body.categoria?.trim() || null,
      tipo_contrato: body.tipo_contrato?.trim() || null,
      fecha_fin_contrato: body.fecha_fin_contrato || null,
      notas_administrativas: body.notas_administrativas?.trim() || null,
    }

    if ((!targetId && !legacyOperationalId) || (targetId && legacyOperationalId) || !nombre || !apellido || (!legacyOperationalId && !email)) return json({ error: "Vigilador, nombre y apellido son obligatorios; el correo es obligatorio para cuentas vinculadas." }, 400)
    if (incluyeFicha && (!ficha.dni || !ficha.fecha_nacimiento || !ficha.domicilio || !ficha.fecha_ingreso || !ficha.categoria || !ficha.tipo_contrato)) {
      return json({ error: "Completá DNI, fecha de nacimiento, domicilio y los datos laborales obligatorios." }, 400)
    }
    if (incluyeFicha && ((ficha.contacto_emergencia_nombre && !ficha.contacto_emergencia_telefono) || (!ficha.contacto_emergencia_nombre && ficha.contacto_emergencia_telefono))) {
      return json({ error: "Completá nombre y teléfono del contacto de emergencia, o dejá ambos vacíos." }, 400)
    }

    if (legacyOperationalId) {
      const { data: operationalLegacy, error: legacyError } = await admin.from("vigiladores")
        .select("id,id_empresa,id_usuario")
        .eq("id", legacyOperationalId)
        .maybeSingle()
      if (legacyError || !operationalLegacy) return json({ error: "No se encontró el registro operativo del vigilador." }, 404)
      if (operationalLegacy.id_usuario) return json({ error: "El vigilador tiene una cuenta vinculada; actualizá su perfil por el flujo normal." }, 409)
      if (caller.rol !== "super_administrador" && operationalLegacy.id_empresa !== caller.id_empresa) {
        return json({ error: "No puede editar personal de otra empresa." }, 403)
      }
      if (!operationalLegacy.id_empresa) return json({ error: "El vigilador no tiene una empresa asociada." }, 409)

      const { error: fichaError } = await admin.from("fichas_vigiladores").upsert({
        id_vigilador: operationalLegacy.id,
        id_empresa: operationalLegacy.id_empresa,
        ...ficha,
        actualizado_en: new Date().toISOString(),
      }, { onConflict: "id_vigilador" })
      if (fichaError) {
        console.error("Error guardando ficha de vigilador sin cuenta:", fichaError.message)
        return json({ error: "No se pudo guardar la ficha personal y laboral: " + fichaError.message }, 500)
      }

      const { error: legacyUpdateError } = await admin.from("vigiladores").update({
        nombre, apellido, telefono,
      }).eq("id", operationalLegacy.id)
      if (legacyUpdateError) return json({ error: "La ficha se guardó, pero no se pudieron actualizar los datos operativos: " + legacyUpdateError.message }, 500)

      const { error: auditError } = await admin.from("auditoria").insert({
        id_empresa: operationalLegacy.id_empresa,
        id_usuario: caller.id,
        accion: "EDITAR_VIGILADOR",
        entidad: "Vigilador",
        entidad_id: operationalLegacy.id,
        detalle: { texto: "Completó datos personales y laborales de un vigilador sin cuenta vinculada" },
        fecha_hora: new Date().toISOString(),
      })
      if (auditError) console.error("No se pudo registrar auditoría:", auditError.message)
      return json({ ok: true })
    }

    const { data: target, error: targetError } = await admin.from("perfiles")
      .select("id,id_empresa,rol,activo,email").eq("id", targetId).single()
    if (targetError || !target || target.rol !== "vigilador") {
      return json({ error: "No se encontró una cuenta de vigilador." }, 404)
    }
    if (caller.rol !== "super_administrador" && target.id_empresa !== caller.id_empresa) {
      return json({ error: "No puede editar personal de otra empresa." }, 403)
    }

    const { data: operational, error: operationalError } = await admin.from("vigiladores")
      .select("id,id_empresa").eq("id_usuario", targetId).single()
    if (operationalError || !operational || operational.id_empresa !== target.id_empresa) {
      return json({ error: "No se encontró el registro operativo asociado." }, 409)
    }
    const { data: targetAuth, error: targetAuthError } = await admin.auth.admin.getUserById(targetId)
    if (targetAuthError || !targetAuth.user) return json({ error: "No se pudo verificar la cuenta de acceso." }, 409)

    const authUpdates: { email?: string; email_confirm?: boolean } = {}
    if (email !== (targetAuth.user.email || "").toLowerCase()) {
      authUpdates.email = email
      authUpdates.email_confirm = true
    }
    if (Object.keys(authUpdates).length) {
      const { error } = await admin.auth.admin.updateUserById(targetId, authUpdates)
      if (error) return json({ error: error.message }, 400)
    }

    const { error: profileError } = await admin.from("perfiles").update({
      nombre, apellido, email, telefono,
    }).eq("id", targetId)
    if (profileError) return json({ error: "La cuenta se actualizó, pero falló la actualización del perfil. Contacte a soporte." }, 500)

    const { error: operationalUpdateError } = await admin.from("vigiladores").update({
      nombre, apellido, telefono,
    }).eq("id", operational.id)
    if (operationalUpdateError) return json({ error: "El perfil se actualizó, pero falló la actualización operativa. Contacte a soporte." }, 500)

    if (incluyeFicha) {
      const { error: fichaError } = await admin.from("fichas_vigiladores").upsert({
        id_vigilador: operational.id,
        id_empresa: target.id_empresa,
        ...ficha,
        actualizado_en: new Date().toISOString(),
      }, { onConflict: "id_vigilador" })
      if (fichaError) {
        console.error("Error guardando ficha personal/laboral:", fichaError.message)
        return json({ error: "El perfil se actualizó, pero no se pudo guardar la ficha personal y laboral: " + fichaError.message }, 500)
      }
    }

    const { error: auditError } = await admin.from("auditoria").insert({
      id_empresa: target.id_empresa,
      id_usuario: caller.id,
      accion: "EDITAR_VIGILADOR",
      entidad: "Vigilador",
      entidad_id: operational.id,
      detalle: { texto: "Actualizó datos de acceso y perfil", cambio_email: Boolean(authUpdates.email) },
      fecha_hora: new Date().toISOString(),
    })
    if (auditError) console.error("No se pudo registrar auditoría:", auditError.message)

    return json({ ok: true })
  } catch (error) {
    console.error("Error editando vigilador:", error)
    return json({ error: "Error interno al editar el vigilador." }, 500)
  }
})
