import React, { createContext, useContext, useState, useEffect } from 'react'
import type { Usuario, RolUsuario } from '@/tipos'
import { supabase, hayConexionSupabase, superAdminInicial } from '@/servicios/supabase'

interface ContextoAutenticacionTipo {
  usuario: Usuario | null
  estaAutenticado: boolean
  cargando: boolean
  errorAuth: string | null
  iniciarSesion: (email: string, contrasena: string, recordarme: boolean) => Promise<{ exito: boolean; error?: string }>
  cerrarSesion: () => Promise<void>
  solicitarRecuperacion: (email: string) => Promise<{ exito: boolean; error?: string }>
  cambiarRolSimulado?: (rol: RolUsuario) => void
}

const ContextoAutenticacion = createContext<ContextoAutenticacionTipo | undefined>(undefined)

const CLAVE_SESION_LOCAL = 'gsp_sesion_activa'
const CLAVE_RECORDAR_EMAIL = 'gsp_email_recordado'

// Cuentas de demostración iniciales para desarrollo y verificación operativa
const USUARIOS_DEMO: Record<string, Usuario> = {
  [superAdminInicial]: {
    id: 'usr-super-admin-01',
    email: superAdminInicial,
    nombre: 'FraNko',
    apellido: 'Rasia',
    rol: 'super_administrador',
    id_empresa: null,
    empresa_nombre: 'GSP Plataforma Global',
    activo: true,
    debe_cambiar_contrasena: false,
    creado_en: '2026-10-01T00:00:00Z'
  },
  'admin@wallsecurity.com': {
    id: 'usr-admin-01',
    email: 'admin@wallsecurity.com',
    nombre: 'Carlos',
    apellido: 'Méndez',
    rol: 'administrador',
    id_empresa: 'emp-wall-01',
    empresa_nombre: 'Wall Security',
    activo: true,
    debe_cambiar_contrasena: false,
    creado_en: '2026-10-01T00:00:00Z'
  },
  'franco.rasia@wallsecurity.com': {
    id: 'usr-vigilador-01',
    email: 'franco.rasia@wallsecurity.com',
    nombre: 'Franco',
    apellido: 'Rasia',
    rol: 'vigilador',
    id_empresa: 'emp-wall-01',
    empresa_nombre: 'Wall Security',
    activo: true,
    debe_cambiar_contrasena: false,
    creado_en: '2026-10-01T00:00:00Z'
  }
}

export const ProveedorAutenticacion: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [usuario, setUsuario] = useState<Usuario | null>(null)
  const [cargando, setCargando] = useState<boolean>(true)
  const [errorAuth, setErrorAuth] = useState<string | null>(null)

  const cargarPerfil = async (authUser: NonNullable<Awaited<ReturnType<typeof supabase.auth.getUser>>['data']['user']>) => {
    if (!supabase) return null

    const email = authUser.email || ''

    const { data: perfil, error: errorPerfil } = await supabase
      .from('perfiles')
      .select('id, id_empresa, nombre, apellido, telefono, rol, activo, debe_cambiar_contrasena, creado_en')
      .eq('id', authUser.id)
      .maybeSingle()

    if (errorPerfil) throw errorPerfil

    // El superadministrador inicial puede existir antes de que se cree su perfil.
    // Para cualquier otra cuenta exigimos un perfil real en la base.
    if (!perfil) {
      if (email.toLowerCase() === superAdminInicial.toLowerCase()) {
        return {
          id: authUser.id,
          email,
          nombre: (authUser.user_metadata?.nombre as string) || 'FraNko',
          apellido: (authUser.user_metadata?.apellido as string) || 'Rasia',
          rol: 'super_administrador' as RolUsuario,
          id_empresa: null,
          empresa_nombre: 'GSP Plataforma Global',
          telefono: null,
          activo: true,
          debe_cambiar_contrasena: false,
          creado_en: authUser.created_at
        }
      }
      throw new Error('Tu usuario está autenticado, pero todavía no tiene un perfil habilitado en GSP Security Pro.')
    }

    if (!perfil.activo) {
      throw new Error('Tu usuario está desactivado. Contactá a la administración.')
    }

    let empresaNombre: string | null = null

    if (perfil.id_empresa) {
      const { data: empresa, error: errorEmpresa } = await supabase
        .from('empresas')
        .select('nombre')
        .eq('id', perfil.id_empresa)
        .maybeSingle()

      if (errorEmpresa) throw errorEmpresa
      empresaNombre = empresa?.nombre || null
    }

    return {
      id: perfil.id,
      email,
      nombre: perfil.nombre,
      apellido: perfil.apellido,
      rol: perfil.rol as RolUsuario,
      id_empresa: perfil.id_empresa,
      empresa_nombre: empresaNombre,
      telefono: perfil.telefono,
      activo: perfil.activo,
      debe_cambiar_contrasena: perfil.debe_cambiar_contrasena,
      creado_en: perfil.creado_en
    } satisfies Usuario
  }

  useEffect(() => {
    if (!hayConexionSupabase || !supabase) {
      const sesionGuardada = localStorage.getItem(CLAVE_SESION_LOCAL)
      if (sesionGuardada) {
        try {
          setUsuario(JSON.parse(sesionGuardada) as Usuario)
        } catch {
          localStorage.removeItem(CLAVE_SESION_LOCAL)
        }
      }
      setCargando(false)
      return
    }

    let activo = true

    const inicializarSesion = async () => {
      try {
        const { data, error } = await supabase.auth.getSession()
        if (error) throw error

        if (data.session?.user && activo) {
          const perfil = await cargarPerfil(data.session.user)
          if (activo) setUsuario(perfil)
        }
      } catch (err) {
        console.error('Error al inicializar sesión:', err)
        if (activo) {
          setUsuario(null)
          setErrorAuth(err instanceof Error ? err.message : 'No se pudo cargar el perfil.')
        }
      } finally {
        if (activo) setCargando(false)
      }
    }

    inicializarSesion()

    const { data: listener } = supabase.auth.onAuthStateChange(async (_evento, session) => {
      if (!activo) return

      try {
        if (!session?.user) {
          setUsuario(null)
          return
        }

        const perfil = await cargarPerfil(session.user)
        if (activo) setUsuario(perfil)
      } catch (err) {
        console.error('Error al actualizar sesión:', err)
        if (activo) {
          setUsuario(null)
          setErrorAuth(err instanceof Error ? err.message : 'No se pudo cargar el perfil.')
        }
      }
    })

    return () => {
      activo = false
      listener.subscription.unsubscribe()
    }
  }, [])

  const iniciarSesion = async (email: string, contrasena: string, recordarme: boolean) => {
    setCargando(true)
    setErrorAuth(null)

    try {
      const emailLimpio = email.trim().toLowerCase()

      if (hayConexionSupabase && supabase) {
        const { data, error } = await supabase.auth.signInWithPassword({
          email: emailLimpio,
          password: contrasena
        })

        if (error) {
          setErrorAuth(error.message)
          return { exito: false, error: error.message }
        }

        if (!data.user) {
          const err = 'No se pudo obtener el usuario autenticado.'
          setErrorAuth(err)
          return { exito: false, error: err }
        }

        const usuarioAutenticado = await cargarPerfil(data.user)
        setUsuario(usuarioAutenticado)

        if (recordarme) {
          localStorage.setItem(CLAVE_SESION_LOCAL, JSON.stringify(usuarioAutenticado))
          localStorage.setItem(CLAVE_RECORDAR_EMAIL, emailLimpio)
        } else {
          sessionStorage.setItem(CLAVE_SESION_LOCAL, JSON.stringify(usuarioAutenticado))
          localStorage.removeItem(CLAVE_RECORDAR_EMAIL)
        }

        return { exito: true }
      }

      await new Promise((resolver) => setTimeout(resolver, 600))

      const usuarioEncontrado = USUARIOS_DEMO[emailLimpio]
      if (!usuarioEncontrado) {
        const err = 'Usuario no registrado. La creación de cuentas es realizada exclusivamente por la administración.'
        setErrorAuth(err)
        return { exito: false, error: err }
      }

      if (contrasena.length < 6) {
        const err = 'Contraseña incorrecta.'
        setErrorAuth(err)
        return { exito: false, error: err }
      }

      setUsuario(usuarioEncontrado)
      if (recordarme) {
        localStorage.setItem(CLAVE_SESION_LOCAL, JSON.stringify(usuarioEncontrado))
        localStorage.setItem(CLAVE_RECORDAR_EMAIL, emailLimpio)
      } else {
        sessionStorage.setItem(CLAVE_SESION_LOCAL, JSON.stringify(usuarioEncontrado))
        localStorage.removeItem(CLAVE_RECORDAR_EMAIL)
      }

      return { exito: true }
    } catch (err: unknown) {
      const mensaje = err instanceof Error ? err.message : 'Error inesperado al conectar con el servicio'
      setErrorAuth(mensaje)
      return { exito: false, error: mensaje }
    } finally {
      setCargando(false)
    }
  }

  const cerrarSesion = async () => {
    setCargando(true)
    try {
      if (hayConexionSupabase && supabase) {
        await supabase.auth.signOut()
      }
      localStorage.removeItem(CLAVE_SESION_LOCAL)
      sessionStorage.removeItem(CLAVE_SESION_LOCAL)
      setUsuario(null)
    } catch (err) {
      console.error('Error cerrando sesión:', err)
    } finally {
      setCargando(false)
    }
  }

  const solicitarRecuperacion = async (email: string) => {
    try {
      const emailLimpio = email.trim().toLowerCase()
      if (hayConexionSupabase && supabase) {
        const { error } = await supabase.auth.resetPasswordForEmail(emailLimpio, {
          redirectTo: window.location.origin + '/cambiar-contrasena'
        })
        if (error) return { exito: false, error: error.message }
      } else {
        await new Promise((res) => setTimeout(res, 500))
      }
      return { exito: true }
    } catch (err: unknown) {
      return { exito: false, error: err instanceof Error ? err.message : 'Error al enviar recuperación' }
    }
  }

  return (
    <ContextoAutenticacion.Provider
      value={{
        usuario,
        estaAutenticado: Boolean(usuario),
        cargando,
        errorAuth,
        iniciarSesion,
        cerrarSesion,
        solicitarRecuperacion
      }}
    >
      {children}
    </ContextoAutenticacion.Provider>
  )
}

export function useAutenticacion(): ContextoAutenticacionTipo {
  const context = useContext(ContextoAutenticacion)
  if (!context) {
    throw new Error('useAutenticacion debe usarse dentro de un ProveedorAutenticacion')
  }
  return context
}
