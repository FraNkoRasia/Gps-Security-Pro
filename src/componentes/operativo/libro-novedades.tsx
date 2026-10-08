import React, { useState } from 'react'
import { BookOpen, Plus, Search, Edit2 } from 'lucide-react'
import { Tarjeta, TarjetaContenido } from '@/componentes/ui/tarjeta'
import { Boton } from '@/componentes/ui/boton'
import { Insignia } from '@/componentes/ui/insignia'
import { Dialogo } from '@/componentes/ui/dialogo'
import { Entrada } from '@/componentes/ui/entrada'
import { Etiqueta } from '@/componentes/ui/etiqueta'
import { useOperativo } from '@/contextos/contexto-operativo'
import { useAutenticacion } from '@/contextos/contexto-autenticacion'
import type { NovedadLibro } from '@/tipos'

export const LibroNovedades: React.FC = () => {
  const { novedades, objetivos, crearNovedad, editarNovedad, marcarNovedadLeida, novedadesLeidas } = useOperativo()
  const { usuario } = useAutenticacion()

  const [modalNuevoAbierto, setModalNuevoAbierto] = useState(false)
  const [modalEditarAbierto, setModalEditarAbierto] = useState(false)
  const [novedadSeleccionada, setNovedadSeleccionada] = useState<NovedadLibro | null>(null)
  const [filtroObjetivo, setFiltroObjetivo] = useState('todos')
  const [busqueda, setBusqueda] = useState('')
  const [idObjetivo, setIdObjetivo] = useState(objetivos[0]?.id || '')
  const [fecha, setFecha] = useState(new Date().toISOString().split('T')[0])
  const [hora, setHora] = useState(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }))
  const [turno, setTurno] = useState('12🌙 Nocturno (19:00 - 07:00)')
  const [nombreSupervisor, setNombreSupervisor] = useState('Carlos Méndez')
  const [elementosACargo, setElementosACargo] = useState('Handy Motorola VHF #12, Linterna LED táctica, Libro Tomo IV')
  const [informeNovedades, setInformeNovedades] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [informeCorregido, setInformeCorregido] = useState('')
  const [motivoCorreccion, setMotivoCorreccion] = useState('')

  const abrirCrear = () => {
    setIdObjetivo(objetivos[0]?.id || '')
    setFecha(new Date().toISOString().split('T')[0])
    setHora(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }))
    setInformeNovedades('')
    setError(null)
    setModalNuevoAbierto(true)
  }

  const abrirEditar = (nov: NovedadLibro) => {
    setNovedadSeleccionada(nov)
    setInformeCorregido(nov.informe_novedades)
    setMotivoCorreccion('')
    setError(null)
    setModalEditarAbierto(true)
  }

  const manejarGuardar = (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    if (!informeNovedades.trim()) { setError('El informe de novedades no puede estar vacío.'); return }
    const nombreVigilante = usuario ? [... ELLIPSIZATION ...]     </div>
                  )}
                </TarjetaContenido>
              </Tarjeta>
            )
          })
        )}
      </div>

      <Dialogo
        abierto={modalNuevoAbierto}
        alCerrar={() => setModalNuevoAbierto(false)}
        titulo="Asentar Novedad en Libro Digital"
        subtitulo="Registro formal de hechos y relevo operativo del puesto de vigilancia."
        icono={<BookOpen className="w-5 h-5 text-blue-500" />}
        tamano="grande"
      >
        <form onSubmit={manejarGuardar} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div><Etiqueta requerido>Objetivo del Servicio</Etiqueta><select value={idObjetivo} onChange={(e) => setIdObjetivo(e.target.value)} className="w-full min-h-[46px] rounded-xl bg-white dark:bg-[#0A0F1A] border border-slate-300 dark:border-slate-700/80 px-3 py-2.5 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all cursor-pointer">{objetivos.map((o) => <option key={o.id} value={o.id}>{o.nombre} ({o.localidad})</option>)}</select></div>
            <div><Etiqueta requerido>Turno Correspondiente</Etiqueta><Entrada value={turno} onChange={(e) => setTurno(e.target.value)} placeholder="12🌙 Nocturno (19:00 - 07:00)" /></div>
          </div>
          <div className="grid grid-cols-2 gap-3"><div><Etiqueta requerido>Fecha</Etiqueta><Entrada type="date" value={fecha} onChange={(e) => setFecha(e.target.value)} /></div><div><Etiqueta requerido>Hora</Etiqueta><Entrada type="time" value={hora} onChange={(e) => setHora(e.target.value)} /></div></div>
          <div><Etiqueta requerido>Supervisor a Cargo</Etiqueta><Entrada value={nombreSupervisor} onChange={(e) => setNombreSupervisor(e.target.value)} placeholder="Carlos Méndez" /></div>
          <div><Etiqueta requerido>Elementos a Cargo / Entrega</Etiqueta><Entrada value={elementosACargo} onChange={(e) => setElementosACargo(e.target.value)} placeholder="Handy, linterna, llaves, detector, etc." /></div>
          <div><Etiqueta requerido>Informe de Novedades</Etiqueta><textarea value={informeNovedades} onChange={(e) => setInformeNovedades(e.target.value)} rows={4} placeholder="Detallá el relevo, novedades operativas, rondas, anomalías observadas o novedades ordinarias..." className="w-full rounded-xl bg-white dark:bg-[#0A0F1A] border border-slate-300 dark:border-slate-700/80 p-3 text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all resize-none" /></div>
          {error && <p className="text-xs text-red-500 font-semibold">{error}</p>}
          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200 dark:border-slate-800"><Boton type="button" variante="secundario" onClick={() => setModalNuevoAbierto(false)}>Cancelar</Boton><Boton type="submit" variante="primario">Registrar en Libro</Boton></div>
        </form>
      </Dialogo>

      <Dialogo abierto={modalEditarAbierto} alCerrar={() => setModalEditarAbierto(false)} titulo="Corrección de Novedad (Trazabilidad Oficial)" subtitulo="Las modificaciones quedan asentadas conservando usuario, fecha y justificación." icono={<Edit2 className="w-5 h-5 text-amber-500" />}>
        <form onSubmit={manejarGuardarCorreccion} className="space-y-4">
          <div><Etiqueta requerido>Informe Modificado</Etiqueta><textarea value={informeCorregido} onChange={(e) => setInformeCorregido(e.target.value)} rows={4} className="w-full rounded-xl bg-white dark:bg-[#0A0F1A] border border-slate-300 dark:border-slate-700/80 p-3 text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all resize-none" /></div>
          <div><Etiqueta requerido>Motivo de la Modificación</Etiqueta><textarea value={motivoCorreccion} onChange={(e) => setMotivoCorreccion(e.target.value)} rows={2} placeholder="Ingresá la justificación formal de la corrección..." className="w-full rounded-xl bg-white dark:bg-[#0A0F1A] border border-slate-300 dark:border-slate-700/80 p-3 text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all resize-none" /></div>
          {error && <p className="text-xs text-red-500 font-semibold">{error}</p>}
          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200 dark:border-slate-800"><Boton type="button" variante="secundario" onClick={() => setModalEditarAbierto(false)}>Cancelar</Boton><Boton type="submit" variante="primario">Asentar Corrección Auditada</Boton></div>
        </form>
      </Dialogo>
    </div>
  )
}
