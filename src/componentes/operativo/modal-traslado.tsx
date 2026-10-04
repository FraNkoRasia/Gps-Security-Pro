import React, { useState } from 'react'
import { ArrowRightLeft, AlertTriangle, Calendar } from 'lucide-react'
import { Dialogo } from '@/componentes/ui/dialogo'
import { Boton } from '@/componentes/ui/boton'
import { Entrada } from '@/componentes/ui/entrada'
import { Etiqueta } from '@/componentes/ui/etiqueta'
import { Alerta } from '@/componentes/ui/alerta'
import { useOperativo } from '@/contextos/contexto-operativo'
import type { Usuario } from '@/tipos'

interface PropiedadesModalTraslado {
  abierto: boolean
  alCerrar: () => void
  vigilador: Usuario | null
}

export const ModalTraslado: React.FC<PropiedadesModalTraslado> = ({
  abierto,
  alCerrar,
  vigilador
}) => {
  const { objetivos, asignaciones, trasladarVigilador } = useOperativo()

  const asignacionActual = asignaciones.find(
    (a) => a.id_vigilador === vigilador?.id && a.activa
  )

  const [idNuevoObjetivo, setIdNuevoObjetivo] = useState('')
  const [fechaEfectiva, setFechaEfectiva] = useState(
    new Date().toISOString().split('T')[0]
  )
  const [motivo, setMotivo] = useState('')
  const [accionTurnos, setAccionTurnos] = useState<'mantener' | 'reasignar' | 'cancelar'>(
    'reasignar'
  )
  const [error, setError] = useState<string | null>(null)

  if (!vigilador) return null

  const objetivosDisponibles = objetivos.filter(
    (o) => o.id !== asignacionActual?.id_objetivo && o.activo
  )

  const manejarConfirmar = (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!idNuevoObjetivo) {
      setError('Debes seleccionar el objetivo de destino.')
      return
    }
    if (!motivo.trim()) {
      setError('Debes ingresar el motivo operativo del traslado.')
      return
    }

    trasladarVigilador({
      id_vigilador: vigilador.id,
      id_nuevo_objetivo: idNuevoObjetivo,
      fecha_efectiva: fechaEfectiva,
      motivo: motivo.trim(),
      accion_turnos_futuros: accionTurnos
    })

    // Limpiar y cerrar
    setIdNuevoObjetivo('')
    setMotivo('')
    alCerrar()
  }

  return (
    <Dialogo
      abierto={abierto}
      alCerrar={alCerrar}
      titulo="Traslado Oficial de Objetivo"
      subtitulo={`Reasignación de servicio para ${vigilador.nombre} ${vigilador.apellido}`}
      icono={<ArrowRightLeft className="w-5 h-5 text-blue-500" />}
      tamano="medio"
    >
      <form onSubmit={manejarConfirmar} className="space-y-4 text-left">
        {/* Puesto Actual */}
        <div className="p-3.5 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs">
          <span className="text-slate-500 dark:text-slate-400 block mb-0.5">Objetivo Actual:</span>
          <span className="text-sm font-bold text-slate-900 dark:text-white">
            {asignacionActual?.objetivo_nombre || 'Sin asignación activa previa'}
          </span>
          {asignacionActual && (
            <span className="text-slate-500 dark:text-slate-400 block mt-0.5">
              Desde: {asignacionActual.fecha_inicio}
            </span>
          )}
        </div>

        {/* Nuevo Objetivo */}
        <div>
          <Etiqueta requerido>Nuevo Objetivo de Destino</Etiqueta>
          <div className="relative">
            <select
              value={idNuevoObjetivo}
              onChange={(e) => setIdNuevoObjetivo(e.target.value)}
              className="w-full min-h-[46px] rounded-xl bg-white dark:bg-[#0A0F1A] border border-slate-300 dark:border-slate-700/80 px-4 py-2.5 text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all cursor-pointer"
            >
              <option value="">Seleccioná un puesto...</option>
              {objetivosDisponibles.map((obj) => (
                <option key={obj.id} value={obj.id}>
                  {obj.nombre} ({obj.localidad})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Fecha Efectiva */}
        <div>
          <Etiqueta requerido>Fecha Efectiva del Traslado</Etiqueta>
          <Entrada
            type="date"
            value={fechaEfectiva}
            onChange={(e) => setFechaEfectiva(e.target.value)}
            iconoIzquierda={<Calendar className="w-4 h-4" />}
          />
        </div>

        {/* Motivo del Traslado (Sección 21) */}
        <div>
          <Etiqueta requerido>Motivo del Traslado</Etiqueta>
          <textarea
            value={motivo}
            onChange={(e) => setMotivo(e.target.value)}
            rows={2}
            placeholder="Ej: Refuerzo operativo de fin de semana, solicitud del cliente, rotación programada..."
            className="w-full rounded-xl bg-white dark:bg-[#0A0F1A] border border-slate-300 dark:border-slate-700/80 p-3 text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all resize-none"
          />
        </div>

        {/* Advertencia y Manejo de Turnos Futuros (Sección 21) */}
        <div className="p-3.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 text-xs text-amber-900 dark:text-amber-200 space-y-2">
          <div className="flex items-center gap-1.5 font-bold">
            <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
            <span>Gestión de Turnos Posteriores a la Fecha Efectiva:</span>
          </div>
          <p className="text-[11px] leading-relaxed text-amber-800 dark:text-amber-300">
            El sistema detectará automáticamente los turnos agendados en la grilla mensual desde el {fechaEfectiva}:
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-1.5 pt-1">
            <label className="flex items-center gap-2 p-2 rounded-lg bg-white dark:bg-slate-900 border border-amber-300 dark:border-amber-800/80 cursor-pointer">
              <input
                type="radio"
                name="accionTurnos"
                value="reasignar"
                checked={accionTurnos === 'reasignar'}
                onChange={() => setAccionTurnos('reasignar')}
                className="text-blue-600"
              />
              <span className="font-semibold text-slate-800 dark:text-slate-200">Reasignar puesto</span>
            </label>
            <label className="flex items-center gap-2 p-2 rounded-lg bg-white dark:bg-slate-900 border border-amber-300 dark:border-amber-800/80 cursor-pointer">
              <input
                type="radio"
                name="accionTurnos"
                value="mantener"
                checked={accionTurnos === 'mantener'}
                onChange={() => setAccionTurnos('mantener')}
                className="text-blue-600"
              />
              <span className="font-semibold text-slate-800 dark:text-slate-200">Mantener actuales</span>
            </label>
            <label className="flex items-center gap-2 p-2 rounded-lg bg-white dark:bg-slate-900 border border-amber-300 dark:border-amber-800/80 cursor-pointer">
              <input
                type="radio"
                name="accionTurnos"
                value="cancelar"
                checked={accionTurnos === 'cancelar'}
                onChange={() => setAccionTurnos('cancelar')}
                className="text-blue-600"
              />
              <span className="font-semibold text-slate-800 dark:text-slate-200">Cancelar turnos</span>
            </label>
          </div>
        </div>

        {error && <Alerta tipo="error">{error}</Alerta>}

        {/* Botones de acción */}
        <div className="flex flex-col-reverse sm:flex-row items-center justify-end gap-2.5 pt-3 border-t border-slate-200 dark:border-slate-800">
          <Boton type="button" variante="secundario" onClick={alCerrar} className="w-full sm:w-auto">
            Cancelar
          </Boton>
          <Boton type="submit" variante="primario" className="w-full sm:w-auto">
            Registrar Traslado
          </Boton>
        </div>
      </form>
    </Dialogo>
  )
}
