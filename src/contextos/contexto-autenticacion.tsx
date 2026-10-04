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

  useEffect(() => {
    const inicializarSesion = async () => {
      try {
        if (hayConexionSupabase && supabase) {
          const { data } = await supabase.auth.getSession()
          if (data.session?.user) {
            const email = data.session.user.email || ''
            const esSuper = email.toLowerCase() === superAdminInicial.toLowerCase()
            setUsuario({
              id: data.session.user.id,
              email: email,
              nombre: (data.session.user.user_metadata?.nombre as string) || 'Operador',
              apellido: (data.session.user.user_metadata?.apellido as string) || 'GSP',
              rol: esSuper ? 'super_administrador' : (data.session.user.user_metadata?.rol as RolUsuario) || 'vigilador',
              id_empresa: data.session.user.user_metadata?.id_empresa || null,
              empresa_nombre: data.session.user.user_metadata?.empresa_nombre || null,
              activo: true,
              debe_cambiar_contrasena: false,
              creado_en: data.session.user.created_at
            })
          }
        } else {
          // Recuperar sesión persistida localmente si recordarme estaba activo
          const sesionGuardada = localStorage.getItem(CLAVE_SESION_LOCAL)
          if (sesionGuardada) {
            const parsed = JSON.parse(sesionGuardada) as Usuario
            setUsuario(parsed)
          }
        }
      } catch (err) {
        console.error('Error al inicializar sesión:', err)
      } finally {
        setCargando(false)
      }
    }

    inicializarSesion()
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

        if (data.user) {
          const esSuper = emailLimpio === superAdminInicial.toLowerCase()
          const usuarioAutenticado: Usuario = {
            id: data.user.id,
            email: emailLimpio,
            nombre: (data.user.user_metadata?.nombre as string) || 'Operador',
            apellido: (data.user.user_metadata?.apellido as string) || 'GSP',
            rol: esSuper ? 'super_administrador' : (data.user.user_metadata?.rol as RolUsuario) || 'vigilador',
            id_empresa: data.user.user_metadata?.id_empresa || null,
            empresa_nombre: data.user.user_metadata?.empresa_nombre || null,
            activo: true,
            debe_cambiar_contrasena: false,
            creado_en: data.user.created_at
          }

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
      } else {
        // Simulación de autenticación local segura para desarrollo
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
      }

      return { exito: false, error: 'No se pudo iniciar sesión.' }
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
        // Simulación de envío
        await new Promise((res) => setTimeout(res, 500))
      }
      return { exito: true }
    } catch (err: unknown) {
      return { exito: false, error: err instanceof Error ? err.message : 'Error al enviar recuperación' }
    }
  }

  const cambiarRolSimulado = (nuevoRol: RolUsuario) => {
    if (!usuario) return
    const actualizado: Usuario = { ...usuario, rol: nuevoRol }
    setUsuario(actualizado)
    localStorage.setItem(CLAVE_SESION_LOCAL, JSON.stringify(actualizado))
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
        solicitarRecuperacion,
        cambiarRolSimulado
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
