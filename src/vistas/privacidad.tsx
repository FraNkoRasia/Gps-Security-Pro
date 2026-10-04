import React from 'react'
import { Lock, ShieldCheck } from 'lucide-react'
import { Dialogo } from '@/componentes/ui/dialogo'

interface PropiedadesVistaPrivacidad {
  abierto: boolean
  alCerrar: () => void
}

export const VistaPrivacidad: React.FC<PropiedadesVistaPrivacidad> = ({ abierto, alCerrar }) => {
  return (
    <Dialogo
      abierto={abierto}
      alCerrar={alCerrar}
      titulo="Política de Privacidad y Tratamiento de Datos"
      subtitulo="Protección de la información de empresas, vigiladores, objetivos y registros de servicio."
      icono={<Lock className="w-5 h-5 text-emerald-400" />}
      tamano="grande"
    >
      <div className="space-y-4 text-xs text-slate-300 leading-relaxed">
        <div className="p-3.5 rounded-xl bg-emerald-950/40 border border-emerald-800/60 flex items-start gap-2.5">
          <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
          <p className="text-slate-200">
            En GSP Security Pro la confidencialidad de la seguridad física y humana es prioritaria. Los datos son custodiados con cifrado en tránsito y en reposo mediante PostgreSQL y Supabase.
          </p>
        </div>

        <section className="space-y-1.5">
          <h4 className="font-bold text-white text-sm">1. Datos de Vigiladores y Personal</h4>
          <p>
            Almacenamos exclusivamente la información necesaria para la diagramación del servicio: nombres, correos de autenticación, turnos, horas acumuladas, nocturnidades y asignaciones a objetivos.
          </p>
        </section>

        <section className="space-y-1.5">
          <h4 className="font-bold text-white text-sm">2. Datos de Objetivos y Puestos de Vigilancia</h4>
          <p>
            Las direcciones, perímetros y descripción de los objetivos son accesibles únicamente para la empresa contratista y el personal expresamente asignado a dicho puesto.
          </p>
        </section>

        <section className="space-y-1.5">
          <h4 className="font-bold text-white text-sm">3. Novedades y Libro de Guardia</h4>
          <p>
            Los informes redactados en el Libro de Novedades se conservan con fines operativos, de auditoría interna y prevención de incidentes.
          </p>
        </section>

        <section className="space-y-1.5">
          <h4 className="font-bold text-white text-sm">4. No Comercialización</h4>
          <p>
            Bajo ninguna circunstancia la información contenida en la plataforma será vendida, transferida ni cedida a terceros comerciales.
          </p>
        </section>
      </div>
    </Dialogo>
  )
}
