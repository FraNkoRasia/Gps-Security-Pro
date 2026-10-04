import React, { useState } from 'react'
import { KeyRound, Mail, CheckCircle2, ArrowRight } from 'lucide-react'
import { Dialogo } from '@/componentes/ui/dialogo'
import { Boton } from '@/componentes/ui/boton'
import { Entrada } from '@/componentes/ui/entrada'
import { Etiqueta } from '@/componentes/ui/etiqueta'
import { Alerta } from '@/componentes/ui/alerta'
import { useTraduccion } from '@/i18n'
import { useAutenticacion } from '@/contextos/contexto-autenticacion'
import { esquemaRecuperarContrasena } from '@/esquemas/autenticacion'

interface PropiedadesModalRecuperarContrasena {
  abierto: boolean
  alCerrar: () => void
}

export const ModalRecuperarContrasena: React.FC<PropiedadesModalRecuperarContrasena> = ({
  abierto,
  alCerrar
}) => {
  const { t } = useTraduccion()
  const { solicitarRecuperacion } = useAutenticacion()

  const [email, setEmail] = useState('')
  const [errorValidacion, setErrorValidacion] = useState<string | undefined>()
  const [cargando, setCargando] = useState(false)
  const [enviadoExitosamente, setEnviadoExitosamente] = useState(false)

  const manejarEnvio = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorValidacion(undefined)

    const resultadoValidacion = esquemaRecuperarContrasena.safeParse({ email })
    if (!resultadoValidacion.success) {
      setErrorValidacion(resultadoValidacion.error.issues[0]?.message)
      return
    }

    setCargando(true)
    const res = await solicitarRecuperacion(email)
    setCargando(false)

    if (res.exito) {
      setEnviadoExitosamente(true)
    } else {
      setErrorValidacion(res.error || t.comun.error)
    }
  }

  const manejarCerrar = () => {
    setEmail('')
    setErrorValidacion(undefined)
    setEnviadoExitosamente(false)
    alCerrar()
  }

  return (
    <Dialogo
      abierto={abierto}
      alCerrar={manejarCerrar}
      titulo={t.auth.recuperarTitulo}
      subtitulo={t.auth.recuperarDesc}
      icono={<KeyRound className="w-5 h-5 text-amber-400" />}
      tamano="medio"
    >
      {enviadoExitosamente ? (
        <div className="space-y-5 text-center py-2">
          <div className="w-14 h-14 mx-auto rounded-2xl bg-emerald-950/80 border border-emerald-800 text-emerald-400 flex items-center justify-center shadow-lg">
            <CheckCircle2 className="w-8 h-8" />
          </div>
          <div>
            <h4 className="text-base font-bold text-white mb-1.5">{t.auth.enlaceEnviado}</h4>
            <p className="text-xs text-slate-300 max-w-sm mx-auto leading-relaxed">
              {t.auth.instruccionesEnlace}
            </p>
            <p className="text-xs text-blue-400 font-mono mt-2">{email}</p>
          </div>

          <div className="pt-3">
            <Boton
              type="button"
              variante="primario"
              onClick={manejarCerrar}
              className="w-full"
            >
              {t.comun.cerrar}
            </Boton>
          </div>
        </div>
      ) : (
        <form onSubmit={manejarEnvio} className="space-y-4">
          <div>
            <Etiqueta requerido>{t.auth.correoOEmail}</Etiqueta>
            <Entrada
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder={t.auth.ejemploEmail}
              iconoIzquierda={<Mail className="w-4 h-4" />}
              error={errorValidacion}
              disabled={cargando}
              autoFocus
            />
          </div>

          <Alerta tipo="info">
            <span className="text-xs">
              Por motivos de seguridad operativa, el enlace caducará tras un período breve. Podrás crear una contraseña nueva y retomar tus funciones.
            </span>
          </Alerta>

          <div className="flex flex-col-reverse sm:flex-row items-center justify-end gap-2.5 pt-3 border-t border-slate-800">
            <Boton
              type="button"
              variante="secundario"
              onClick={manejarCerrar}
              disabled={cargando}
              className="w-full sm:w-auto"
            >
              {t.comun.cancelar}
            </Boton>
            <Boton
              type="submit"
              variante="primario"
              cargando={cargando}
              className="w-full sm:w-auto"
              icono={<ArrowRight className="w-4 h-4" />}
            >
              {t.auth.enviarEnlace}
            </Boton>
          </div>
        </form>
      )}
    </Dialogo>
  )
}
