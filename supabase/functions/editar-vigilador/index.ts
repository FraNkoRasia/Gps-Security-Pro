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

    let body: { vigilador_id?: string; nombre?: string; apellido?: string; email?: string; telefono?: string | null; password?: string }
    try { body = await req.json() } catch { return json({ error: "Datos inválidos." }, 400) }
    const targetId = body.vigilador_id?.trim()
    const nombre = body.nombre?.trim()
    const apellido = body.apellido?.trim()
    const email = body.email?.trim().toLowerCase()
    const telefono = body.telefono?.trim() || null
    const password = body.password || ""

    if (!targetId || !nombre || !apellido || !email) return json({ error: "Vigilador, nombre, apellido y correo son obligatorios." }, 400)
    if (password && password.length < 8) return json({ error: "La contraseña debe tener al menos 8 caracteres." }, 400)

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

    const authUpdates: { email?: string; email_confirm?: boolean; password?: string } = {}
    if (email !== (targetAuth.user.email || "").toLowerCase()) {
      authUpdates.email = email
      authUpdates.email_confirm = true
    }
    if (password) authUpdates.password = password
    if (Object.keys(authUpdates).length) {
      const { error } = await admin.auth.admin.updateUserById(targetId, authUpdates)
      if (error) return json({ error: error.message }, 400)
    }

    const { error: profileError } = await admin.from("perfiles").update({
      nombre, apellido, email, telefono,
      ...(password ? { debe_cambiar_contrasena: true } : {}),
    }).eq("id", targetId)
    if (profileError) return json({ error: "La cuenta se actualizó, pero falló la actualización del perfil. Contacte a soporte." }, 500)

    const { error: operationalUpdateError } = await admin.from("vigiladores").update({
      nombre, apellido, telefono,
    }).eq("id", operational.id)
    if (operationalUpdateError) return json({ error: "El perfil se actualizó, pero falló la actualización operativa. Contacte a soporte." }, 500)

    const { error: auditError } = await admin.from("auditoria").insert({
      id_empresa: target.id_empresa,
      id_usuario: caller.id,
      accion: "EDITAR_VIGILADOR",
      entidad: "Vigilador",
      entidad_id: operational.id,
      detalle: { texto: "Actualizó datos de acceso y perfil", cambio_email: Boolean(authUpdates.email), cambio_password: Boolean(password) },
      fecha_hora: new Date().toISOString(),
    })
    if (auditError) console.error("No se pudo registrar auditoría:", auditError.message)

    return json({ ok: true })
  } catch (error) {
    console.error("Error editando vigilador:", error)
    return json({ error: "Error interno al editar el vigilador." }, 500)
  }
})
