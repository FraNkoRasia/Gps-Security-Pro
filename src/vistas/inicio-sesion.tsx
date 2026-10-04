import React from 'react'
import { Lock } from 'lucide-react'
import { Tarjeta, TarjetaContenido } from '@/componentes/ui/tarjeta'
import { FormularioLogin } from '@/componentes/autenticacion/formulario-login'
import { InstalacionPwa } from '@/componentes/pwa/instalacion-pwa'
import { useTraduccion } from '@/i18n'

export const VistaInicioSesion: React.FC = () => {
  const { t } = useTraduccion()

  return (
    <div className="w-full flex-1 flex flex-col items-center justify-center py-4 sm:py-8 px-2 sm:px-4">
      {/* Contenedor central con ancho controlado y márgenes móviles */}
      <div className="w-full max-w-md mx-auto space-y-6">
        {/* Cabecera del Login con Emblema Oficial GSP */}
        <div className="text-center space-y-3">
          <div className="inline-flex relative">
            <div className="w-28 h-28 sm:w-32 sm:h-32 rounded-3xl bg-slate-950/80 border border-slate-800 p-2 shadow-2xl flex items-center justify-center glow-primary mx-auto">
              <img
                src="/logoAPP.png"
                alt="GSP Security Pro — Gestión de Seguridad Profesional"
                className="w-full h-full object-contain filter drop-shadow-[0_10px_15px_rgba(0,0,0,0.8)]"
              />
            </div>
            <div className="absolute -bottom-1 -right-1 bg-blue-600 border-2 border-slate-900 text-white p-1.5 rounded-full shadow-lg">
              <Lock className="w-4 h-4 stroke-[2.5]" />
            </div>
          </div>

          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-white font-['Outfit'] tracking-tight">
              GSP Security Pro
            </h1>
            <p className="text-xs sm:text-sm font-semibold text-blue-400 uppercase tracking-widest mt-0.5">
              {t.comun.lemaApp}
            </p>
            <p className="text-xs text-slate-400 mt-1 max-w-xs mx-auto">
              Plataforma de gestión operativa de vigilancia y servicios de seguridad privada
            </p>
          </div>
        </div>

        {/* Tarjeta de Inicio de Sesión */}
        <Tarjeta className="border-slate-800 bg-slate-900/85 shadow-2xl backdrop-blur-xl">
          <TarjetaContenido className="p-5 sm:p-7">
            {/* Formulario de Login */}
            <FormularioLogin />

            {/* Sección de Instalación PWA (Sección 15) */}
            <InstalacionPwa />
          </TarjetaContenido>
        </Tarjeta>

        {/* Mensaje de Asistencia Operativa */}
        <div className="text-center text-xs text-slate-500">
          <p>
            ¿Problemas para acceder a tu puesto? Contactá a tu supervisor o centro de operaciones de tu empresa.
          </p>
        </div>
      </div>
    </div>
  )
}
