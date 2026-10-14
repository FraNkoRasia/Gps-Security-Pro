import "jsr:@supabase/functions-js/edge-runtime.d.ts"
import { createClient } from "jsr:@supabase/supabase-js@2"

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
}

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json", ...corsHeaders },
  })

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { status: 200, headers: corsHeaders })
  if (req.method !== "POST") return json({ error: "Método no permitido." }, 405)

  try {
    const token = req.headers.get("Authorization")?.replace(/^Bearer\s+/i, "")
    if (!token) return json({ error: "No autenticado." }, 401)

    const url = Deno.env.get("SUPABASE_URL")!
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    const admin = createClient(url, serviceRoleKey, { auth: { autoRefreshToken: false, persistSession: false } })

    const { data: authData, error: authError } = await admin.auth.getUser(token)
    if (authError || !authData.user) return json({ error: "Sesión no válida." }, 401)

    const { data: caller, error: callerError } = await admin
      .from("perfiles")
      .select("id,id_empresa,rol,activo")
      .eq("id", authData.user.id)
      .single()

    if (callerError || !caller?.activo || caller.rol !== "administrador") {
      return json({ error: "Solo un Administrador puede crear vigiladores." }, 403)
    }

    let body: {
      nombre?: string
      apellido?: string
      email?: string
      password?: string
      telefono?: string
      id_empresa?: string
      id_objetivo_inicial?: string | null
      dni?: string
      fecha_nacimiento?: string
      domicilio?: string
      contacto_emergencia_nombre?: string
      contacto_emergencia_telefono?: string
      fecha_ingreso?: string
      categoria?: string
      tipo_contrato?: string
      fecha_fin_contrato?: string | null
      notas_administrativas?: string
    }

    try {
      body = await req.json()
    } catch {
      return json({ error: "Datos inválidos." }, 400)
    }

    const nombre = body.nombre?.trim()
    const apellido = body.apellido?.trim()
    const email = body.email?.trim().toLowerCase()
    const idEmpresa = caller.id_empresa
    const idObjetivo = body.id_objetivo_inicial || null
    const password = body.password || ""
    const dni = body.dni?.trim() || null
    const fechaNacimiento = body.fecha_nacimiento || null
    const domicilio = body.domicilio?.trim() || null
    const contactoEmergenciaNombre = body.contacto_emergencia_nombre?.trim() || null
    const contactoEmergenciaTelefono = body.contacto_emergencia_telefono?.trim() || null
    const fechaIngreso = body.fecha_ingreso || null
    const categoria = body.categoria?.trim() || null
    const tipoContrato = body.tipo_contrato?.trim() || null
    const fechaFinContrato = body.fecha_fin_contrato || null
    const notasAdministrativas = body.notas_administrativas?.trim() || null

    if (!nombre || !apellido || !email || !password || !idEmpresa) {
      return json({ error: "Nombre, apellido, correo y contraseña son obligatorios." }, 400)
    }

    if (!dni || !fechaNacimiento || !domicilio || !fechaIngreso || !categoria || !tipoContrato) {
      return json({ error: "Completá los datos personales y laborales obligatorios." }, 400)
    }

    if ((contactoEmergenciaNombre && !contactoEmergenciaTelefono) || (!contactoEmergenciaNombre && contactoEmergenciaTelefono)) {
      return json({ error: "Completá nombre y teléfono del contacto de emergencia, o dejá ambos vacíos." }, 400)
    }

    if (password.length < 8) {
      return json({ error: "La contraseña debe tener al menos 8 caracteres." }, 400)
    }

    if (body.id_empresa && body.id_empresa !== idEmpresa) {
      return json({ error: "No puede crear vigiladores en otra empresa." }, 403)
    }

    if (idObjetivo) {
      const { data: objetivo } = await admin
        .from("objetivos")
        .select("id")
        .eq("id", idObjetivo)
        .eq("id_empresa", idEmpresa)
        .eq("activo", true)
        .single()

      if (!objetivo) return json({ error: "El objetivo seleccionado no pertenece a su empresa o está inactivo." }, 400)
    }



    const { data: created, error: createError } = await admin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
    })

    if (createError || !created.user) {
      return json({ error: createError?.message || "No se pudo crear la cuenta del vigilador." }, 400)
    }

    const userId = created.user.id

    const { error: profileError } = await admin.from("perfiles").upsert({
      id: userId,
      id_empresa: idEmpresa,
      nombre,
      apellido,
      email,
      telefono: body.telefono?.trim() || null,
      rol: "vigilador",
      activo: true,
      debe_cambiar_contrasena: true,
    }, { onConflict: "id" })

    if (profileError) {
      await admin.auth.admin.deleteUser(userId)
      return json({ error: profileError.message }, 400)
    }

    const { data: vigilador, error: vigiladorError } = await admin
      .from("vigiladores")
      .insert({
        id_empresa: idEmpresa,
        id_usuario: userId,
        nombre,
        apellido,
        telefono: body.telefono?.trim() || null,
        activo: true,
      })
      .select("*")
      .single()

    if (vigiladorError || !vigilador) {
      await admin.from("perfiles").delete().eq("id", userId)
      await admin.auth.admin.deleteUser(userId)
      return json({ error: vigiladorError?.message || "No se pudo crear la ficha del vigilador." }, 400)
    }

    const { error: fichaError } = await admin.from("fichas_vigiladores").insert({
      id_vigilador: vigilador.id,
      id_empresa: idEmpresa,
      dni,
      fecha_nacimiento: fechaNacimiento,
      domicilio,
      contacto_emergencia_nombre: contactoEmergenciaNombre,
      contacto_emergencia_telefono: contactoEmergenciaTelefono,
      fecha_ingreso: fechaIngreso,
      categoria,
      tipo_contrato: tipoContrato,
      fecha_fin_contrato: fechaFinContrato,
      notas_administrativas: notasAdministrativas,
    })

    if (fichaError) {
      await admin.from("vigiladores").delete().eq("id", vigilador.id)
      await admin.from("perfiles").delete().eq("id", userId)
      await admin.auth.admin.deleteUser(userId)
      return json({ error: "No se pudo guardar la ficha personal y laboral: " + fichaError.message }, 400)
    }

    let asignacion = null
    if (idObjetivo) {
      const { data, error } = await admin.from("asignaciones").insert({
        id_empresa: idEmpresa,
        id_vigilador: vigilador.id,
        id_objetivo: idObjetivo,
        fecha_inicio: new Date().toISOString().slice(0, 10),
        activa: true,
        motivo_traslado: "Asignación inicial al dar de alta",
        creado_por: caller.id,
      }).select("*").single()

      if (error) {
        await admin.from("fichas_vigiladores").delete().eq("id_vigilador", vigilador.id)
        await admin.from("vigiladores").delete().eq("id", vigilador.id)
        await admin.from("perfiles").delete().eq("id", userId)
        await admin.auth.admin.deleteUser(userId)
        return json({ error: "No se pudo crear la asignación inicial." }, 400)
      }
      asignacion = data
    }

    const { error: auditError } = await admin.from("auditoria").insert({
      id_empresa: idEmpresa,
      id_usuario: caller.id,
      accion: "CREAR_VIGILADOR",
      entidad: "Vigilador",
      entidad_id: vigilador.id,
      detalle: { nombre, apellido, email, legajo: vigilador.legajo },
    })

    if (auditError) {
      console.error("No se pudo registrar auditoría:", auditError.message)
    }

    return json({
      vigilador,
      asignacion,
      password: true,
      email,
    })
  } catch (error) {
    return json({ error: error instanceof Error ? error.message : "Error interno." }, 500)
  }
})