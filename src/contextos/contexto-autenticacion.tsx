import React, { createContext, useContext, useState, useEffect } from 'react'
import type { User as SupabaseUser } from '@supabase/supabase-js'
import type { Usuario, RolUsuario } from '@/tipos'
import { supabase, hayConexionSupabase } from '@/servicios/supabase'

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

export const ProveedorAutenticacion: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [usuario, setUsuario] = useState<Usuario | null>(null)
  const [cargando, setCargando] = useState<boolean>(true)
  const [errorAuth, setErrorAuth] = useState<string | null>(null)

  const cargarPerfil = async (authUser: SupabaseUser) => {
    if (!supabase) return null

    const email = authUser.email || ''

    const { data: perfil, error: errorPerfil } = await supabase
      .from('perfiles')
      .select('id, id_empresa, nombre, apellido, telefono, rol, activo, debe_cambiar_contrasena, creado_en')
      .eq('id', authUser.id)
      .maybeSingle()

    if (errorPerfil) throw errorPerfil

    if (!perfil) {
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
      setErrorAuth('Supabase no está configurado. Configurá VITE_SUPABASE_URL y VITE_SUPABASE_ANON_KEY para iniciar sesión.')
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

        return { exito: true }
      }

      const err = 'Supabase no está configurado.'
      setErrorAuth(err)
      return { exito: false, error: err }
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
