import React from 'react'
import { FileText, ShieldAlert } from 'lucide-react'
import { Dialogo } from '@/componentes/ui/dialogo'

interface PropiedadesVistaTerminos {
  abierto: boolean
  alCerrar: () => void
}

export const VistaTerminos: React.FC<PropiedadesVistaTerminos> = ({ abierto, alCerrar }) => {
  return (
    <Dialogo
      abierto={abierto}
      alCerrar={alCerrar}
      titulo="Términos y Condiciones de Uso"
      subtitulo="Condiciones de utilización de la plataforma GSP Security Pro (Gestión de Seguridad Profesional)."
      icono={<FileText className="w-5 h-5 text-blue-400" />}
      tamano="grande"
    >
      <div className="space-y-4 text-xs text-slate-300 leading-relaxed">
        <div className="p-3.5 rounded-xl bg-blue-950/40 border border-blue-800/60 flex items-start gap-2.5">
          <ShieldAlert className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
          <p className="text-slate-200">
            GSP Security Pro es un entorno profesional de misión crítica para la administración de seguridad privada, control de puestos y personal operativo.
          </p>
        </div>

        <section className="space-y-1.5">
          <h4 className="font-bold text-white text-sm">1. Propósito y Acceso</h4>
          <p>
            El acceso está restringido a personal expresamente designado por cada empresa adherida. Queda prohibida la compartición de credenciales individuales. Toda acción realizada bajo una sesión autenticada se atribuye a dicho operador.
          </p>
        </section>

        <section className="space-y-1.5">
          <h4 className="font-bold text-white text-sm">2. Integridad de los Registros Operativos</h4>
          <p>
            Los registros del Libro Digital de Novedades, horarios de entrada y salida, relevos y observaciones constituyen prueba documental operativa y no podrán ser eliminados deliberadamente. Las modificaciones quedarán asentadas con usuario, fecha y justificación.
          </p>
        </section>

        <section className="space-y-1.5">
          <h4 className="font-bold text-white text-sm">3. Aislamiento de Empresas y Objetivos</h4>
          <p>
            Cada empresa goza de aislamiento estricto de información mediante políticas a nivel de base de datos (Row Level Security). Ningún administrador u operador podrá acceder ni visualizar datos pertenecientes a otras firmas de seguridad.
          </p>
        </section>

        <section className="space-y-1.5">
          <h4 className="font-bold text-white text-sm">4. Notificaciones y Turnos</h4>
          <p>
            Las solicitudes de cambio de turno o relevo entre vigiladores requieren ratificación del colega y posterior aprobación administrativa formal para tener vigencia en la grilla oficial del servicio.
          </p>
        </section>
      </div>
    </Dialogo>
  )
}
