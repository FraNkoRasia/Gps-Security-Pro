import React, { useState } from 'react'
import { Lock, Mail, Eye, EyeOff, ShieldCheck, ArrowRight } from 'lucide-react'
import { Entrada } from '@/componentes/ui/entrada'
import { Etiqueta } from '@/componentes/ui/etiqueta'
import { Boton } from '@/componentes/ui/boton'
import { Casilla } from '@/componentes/ui/casilla'
import { Alerta } from '@/componentes/ui/alerta'
import { ModalRecuperarContrasena } from './modal-recuperar-contrasena'
import { useTraduccion } from '@/i18n'
import { useAutenticacion } from '@/contextos/contexto-autenticacion'
import { esquemaLogin, type DatosLogin } from '@/esquemas/autenticacion'

export const FormularioLogin: React.FC = () => {
  const { t } = useTraduccion()
  const { iniciarSesion, cargando, errorAuth } = useAutenticacion()

  const [email, setEmail] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('gsp_email_recordado') || ''
    }
    return ''
  })
  const [contrasena, setContrasena] = useState('')
  const [recordarme, setRecordarme] = useState(true)
  const [mostrarContrasena, setMostrarContrasena] = useState(false)
  const [errores, setErrores] = useState<Partial<Record<keyof DatosLogin, string>>>({})
  const [modalRecuperarAbierto, setModalRecuperarAbierto] = useState(false)

  const manejarEnvio = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrores({})

    const validacion = esquemaLogin.safeParse({ email, contrasena, recordarme })
    if (!validacion.success) {
      const mapaErrores: Partial<Record<keyof DatosLogin, string>> = {}
      for (const issue of validacion.error.issues) {
        const campo = issue.path[0] as keyof DatosLogin
        if (campo && !mapaErrores[campo]) {
          mapaErrores[campo] = issue.message
        }
      }
      setErrores(mapaErrores)
      return
    }

    await iniciarSesion(email, contrasena, recordarme)
  }

  return (
    <>
      <form onSubmit={manejarEnvio} className="space-y-4 text-left" noValidate>
        {/* Error general del servidor/auth */}
        {errorAuth && (
          <Alerta tipo="error" titulo="Acceso no autorizado">
            {errorAuth}
          </Alerta>
        )}

        {/* Campo Email / Usuario */}
        <div>
          <Etiqueta htmlFor="email" requerido>
            {t.auth.correoOEmail}
          </Etiqueta>
          <Entrada
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder={t.auth.ejemploEmail}
            iconoIzquierda={<Mail className="w-4 h-4" />}
            error={errores.email}
            disabled={cargando}
            autoComplete="email"
            autoFocus={!email}
          />
        </div>

        {/* Campo Contraseña */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <Etiqueta htmlFor="contrasena" requerido className="mb-0">
              {t.auth.contrasena}
            </Etiqueta>
            <button
              type="button"
              onClick={() => setModalRecuperarAbierto(true)}
              className="text-xs text-blue-400 hover:text-blue-300 font-medium transition-colors cursor-pointer select-none"
            >
              {t.auth.olvidasteContrasena}
            </button>
          </div>
          <Entrada
            id="contrasena"
            type={mostrarContrasena ? 'text' : 'password'}
            value={contrasena}
            onChange={(e) => setContrasena(e.target.value)}
            placeholder="••••••••"
            iconoIzquierda={<Lock className="w-4 h-4" />}
            iconoDerecha={
              <button
                type="button"
                onClick={() => setMostrarContrasena(!mostrarContrasena)}
                className="text-slate-400 hover:text-slate-200 transition-colors p-1"
                aria-label={mostrarContrasena ? 'Ocultar contraseña' : 'Ver contraseña'}
              >
                {mostrarContrasena ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            }
            error={errores.contrasena}
            disabled={cargando}
            autoComplete="current-password"
          />
        </div>

        {/* Recordarme */}
        <div className="pt-1">
          <Casilla
            id="recordarme"
            marcado={recordarme}
            alCambiar={setRecordarme}
            etiqueta={t.auth.recordarme}
            descripcion="Mantiene activa tu sesión de guardia en este dispositivo de forma segura."
            deshabilitado={cargando}
          />
        </div>

        {/* Botón Ingresar */}
        <div className="pt-2">
          <Boton
            type="submit"
            variante="primario"
            tamano="grande"
            cargando={cargando}
            className="w-full text-base font-bold bg-gradient-to-r from-blue-600 via-blue-500 to-blue-600 hover:from-blue-500 hover:to-blue-400 shadow-lg shadow-blue-950/50"
            icono={<ArrowRight className="w-5 h-5" />}
          >
            {cargando ? t.auth.ingresando : t.auth.ingresar}
          </Boton>
        </div>

        {/* Indicador de Seguridad y Sin Registro Público (Sección 14) */}
        <div className="pt-3 text-center space-y-2 border-t border-slate-800/80">
          <p className="text-xs text-slate-500 flex items-center justify-center gap-1.5 select-none">
            <ShieldCheck className="w-4 h-4 text-emerald-500" />
            <span>{t.auth.seguridadAlta}</span>
          </p>
          <p className="text-[11px] text-slate-500 italic max-w-xs mx-auto">
            {t.auth.sinRegistroPublico}
          </p>
        </div>

      </form>

      <ModalRecuperarContrasena
        abierto={modalRecuperarAbierto}
        alCerrar={() => setModalRecuperarAbierto(false)}
      />
    </>
  )
}
