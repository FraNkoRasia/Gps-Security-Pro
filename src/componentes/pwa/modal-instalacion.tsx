import React from 'react'
import { Download, Smartphone, Share2, Monitor, CheckCircle, AlertTriangle } from 'lucide-react'
import { Dialogo } from '@/componentes/ui/dialogo'
import { Boton } from '@/componentes/ui/boton'
import { useTraduccion } from '@/i18n'
import type { EstadoInstalacion } from '@/utilidades/deteccion-plataforma'

interface PropiedadesModalInstalacion {
  abierto: boolean
  alCerrar: () => void
  alConfirmar: () => void
  estadoDispositivo: EstadoInstalacion
}

export const ModalInstalacion: React.FC<PropiedadesModalInstalacion> = ({
  abierto,
  alCerrar,
  alConfirmar,
  estadoDispositivo
}) => {
  const { t } = useTraduccion()
  const { dispositivo, esSafari, puedeInstalarDirecto } = estadoDispositivo

  return (
    <Dialogo
      abierto={abierto}
      alCerrar={alCerrar}
      titulo={t.pwa.modalPregunta}
      subtitulo={t.pwa.modalDesc}
      icono={<Download className="w-5 h-5 text-blue-400" />}
      tamano="medio"
    >
      <div className="space-y-5">
        {/* Banner de beneficios */}
        <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 flex items-start gap-3">
          <Smartphone className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
          <div className="text-xs text-slate-300 space-y-1">
            <p className="font-semibold text-white">Experiencia nativa para guardias y administración</p>
            <p className="text-slate-400">
              Accedé con un toque desde tu pantalla de inicio, sin barras de navegación y con carga inmediata en servicio.
            </p>
          </div>
        </div>

        {/* Guía según dispositivo */}
        {dispositivo === 'ios' ? (
          <div className="space-y-3">
            <div className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
              <Share2 className="w-4 h-4" />
              <span>Instrucciones para iPhone / iPad</span>
            </div>

            {!esSafari && (
              <div className="p-3 rounded-lg bg-amber-950/40 border border-amber-800/60 text-xs text-amber-200 flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5 text-amber-400" />
                <span>{t.pwa.alertaSafariIos}</span>
              </div>
            )}

            <div className="bg-slate-950/80 rounded-xl p-4 border border-slate-800 space-y-2.5 text-xs text-slate-300">
              <div className="flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-blue-900/60 text-blue-300 font-bold flex items-center justify-center shrink-0">1</span>
                <span>{t.pwa.pasoIos1}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-blue-900/60 text-blue-300 font-bold flex items-center justify-center shrink-0">2</span>
                <span>{t.pwa.pasoIos2}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-blue-900/60 text-blue-300 font-bold flex items-center justify-center shrink-0">3</span>
                <span>{t.pwa.pasoIos3}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-blue-900/60 text-blue-300 font-bold flex items-center justify-center shrink-0">4</span>
                <span>{t.pwa.pasoIos4}</span>
              </div>
            </div>
          </div>
        ) : dispositivo === 'android' ? (
          <div className="space-y-3">
            <div className="text-xs font-bold uppercase tracking-wider text-blue-400 flex items-center gap-1.5">
              <Smartphone className="w-4 h-4" />
              <span>Instrucciones para Android</span>
            </div>

            <p className="text-xs text-slate-300 bg-slate-950/70 p-3.5 rounded-xl border border-slate-800 leading-relaxed">
              {puedeInstalarDirecto
                ? 'Presioná "Continuar" para confirmar la instalación automática en tu teléfono.'
                : t.pwa.instruccionesAndroid}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="text-xs font-bold uppercase tracking-wider text-blue-400 flex items-center gap-1.5">
              <Monitor className="w-4 h-4" />
              <span>Instalación en Computadora / Escritorio</span>
            </div>

            <p className="text-xs text-slate-300 bg-slate-950/70 p-3.5 rounded-xl border border-slate-800 leading-relaxed">
              {t.pwa.instruccionesEscritorio}
            </p>
          </div>
        )}

        {/* Botones de acción */}
        <div className="pt-2 flex flex-col-reverse sm:flex-row items-center justify-end gap-2.5 border-t border-slate-800">
          <Boton
            type="button"
            variante="secundario"
            onClick={alCerrar}
            className="w-full sm:w-auto"
          >
            {t.comun.cancelar}
          </Boton>
          <Boton
            type="button"
            variante="primario"
            onClick={alConfirmar}
            className="w-full sm:w-auto"
            icono={<CheckCircle className="w-4 h-4" />}
          >
            {t.comun.continuar}
          </Boton>
        </div>
      </div>
    </Dialogo>
  )
}
