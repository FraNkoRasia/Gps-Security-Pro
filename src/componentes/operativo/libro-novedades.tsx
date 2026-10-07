import React, { useState } from 'react'
import { BookOpen, Plus, Search, Eye, Edit2, CheckCircle } from 'lucide-react'
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
  const { novedades, novedadesLeidas, objetivos, crearNovedad, editarNovedad, marcarNovedadLeida } = useOperativo()
  const { usuario } = useAutenticacion()

  const [modalNuevoAbierto, setModalNuevoAbierto] = useState(false)
  const [modalDetalleAbierto, setModalDetalleAbierto] = useState(false)
  const [modalEditarAbierto, setModalEditarAbierto] = useState(false)

  const [novedadSeleccionada, setNovedadSeleccionada] = useState<NovedadLibro | null>(null)
  const [filtroObjetivo, setFiltroObjetivo] = useState('todos')
  const [busqueda, setBusqueda] = useState('')

  // Formulario nueva novedad (Sección 32)
  const [idObjetivo, setIdObjetivo] = useState(objetivos[0]?.id || '')
  const [fecha, setFecha] = useState(new Date().toISOString().split('T')[0])
  const [hora, setHora] = useState(
    new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  )
  const [turno, setTurno] = useState('12🌙 Nocturno (19:00 - 07:00)')
  const [nombreSupervisor, setNombreSupervisor] = useState('Carlos Méndez')
  const [elementosACargo, setElementosACargo] = useState(
    'Handy Motorola VHF #12, Linterna LED táctica, Libro Tomo IV'
  )
  const [informeNovedades, setInformeNovedades] = useState('')
  const [error, setError] = useState<string | null>(null)

  // Corrección con motivo obligatorio (Sección 32)
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

  const abrirDetalle = (nov: NovedadLibro) => {
    setNovedadSeleccionada(nov)
    setModalDetalleAbierto(true)
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

    if (!informeNovedades.trim()) {
      setError('El informe de novedades no puede estar vacío.')
      return
    }

    const nombreVigilante = usuario
      ? `${usuario.nombre} ${usuario.apellido}`
      : 'Franco Rasia'

    crearNovedad({
      id_objetivo: idObjetivo,
      id_vigilador: usuario?.id || 'usr-vig-01',
      nombre_vigilante: nombreVigilante,
      nombre_supervisor: nombreSupervisor,
      fecha,
      hora,
      turno,
      elementos_a_cargo: elementosACargo,
      informe_novedades: informeNovedades.trim()
    })

    setModalNuevoAbierto(false)
  }

  const manejarGuardarCorreccion = (e: React.FormEvent) => {
    e.preventDefault()
    if (!motivoCorreccion.trim()) {
      setError('El motivo de la corrección es obligatorio para preservar la trazabilidad.')
      return
    }

    if (novedadSeleccionada) {
      editarNovedad(novedadSeleccionada.id, {
        informe_novedades: informeCorregido.trim(),
        motivo_correccion: motivoCorreccion.trim()
      })
    }
    setModalEditarAbierto(false)
  }

  const novedadesFiltradas = novedades.filter((nov) => {
    const coincideObj = filtroObjetivo === 'todos' || nov.id_objetivo === filtroObjetivo
    const coincideTexto =
      nov.informe_novedades.toLowerCase().includes(busqueda.toLowerCase()) ||
      nov.nombre_vigilante.toLowerCase().includes(busqueda.toLowerCase())
    return coincideObj && coincideTexto
  })

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-xl font-black text-slate-900 dark:text-white font-['Outfit']">
            Libro Digital de Novedades
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Registro operativo oficial e inmutable de guardia por objetivo (Sección 32).
          </p>
        </div>
        <Boton
          variante="primario"
          onClick={abrirCrear}
          icono={<Plus className="w-4 h-4" />}
        >
          Asentar Novedad
        </Boton>
      </div>

      {/* Barra de Filtros y Búsqueda */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex-1">
          <Entrada
            placeholder="Buscar por vigilador, informe o palabras clave..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            iconoIzquierda={<Search className="w-4 h-4" />}
          />
        </div>
        <div className="w-full sm:w-64">
          <select
            value={filtroObjetivo}
            onChange={(e) => setFiltroObjetivo(e.target.value)}
            className="w-full min-h-[46px] rounded-xl bg-white dark:bg-[#0A0F1A] border border-slate-300 dark:border-slate-700/80 px-3 py-2.5 text-xs font-semibold text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all cursor-pointer"
          >
            <option value="todos">Todos los objetivos</option>
            {objetivos.map((o) => (
              <option key={o.id} value={o.id}>
                {o.nombre}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Listado de Novedades */}
      <div className="space-y-3">
        {novedadesFiltradas.length === 0 ? (
          <Tarjeta>
            <TarjetaContenido className="p-8 text-center text-slate-500">
              No se encontraron registros de novedades con los filtros seleccionados.
            </TarjetaContenido>
          </Tarjeta>
        ) : (
          novedadesFiltradas.map((nov) => {
            const obj = objetivos.find((o) => o.id === nov.id_objetivo)

            return (
              <Tarjeta key={nov.id} className="hover:border-blue-500/50 transition-all">
                <TarjetaContenido className="p-5 space-y-3">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-b border-slate-200 dark:border-slate-800 pb-3">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-bold text-slate-900 dark:text-white text-sm">
                        {obj?.nombre || 'Objetivo'}
                      </span>
                      <Insignia variante="azul">{nov.turno}</Insignia>
                    </div>

                    <div className="flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400">
                      <span className="font-mono">{nov.fecha} — {nov.hora} hs</span>
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => abrirDetalle(nov)}
                          className="p-1 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-blue-500 transition-colors"
                          title="Ver detalle"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => abrirEditar(nov)}
                          className="p-1 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-amber-500 transition-colors"
                          title="Corregir novedad (asienta auditoría)"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>

                  <p className="text-xs text-slate-800 dark:text-slate-200 leading-relaxed whitespace-pre-line">
                    {nov.informe_novedades}
                  </p>

                  <div className="flex items-center justify-between gap-3 pt-2 border-t border-slate-200 dark:border-slate-800/60">
                    <span className="text-[11px] text-slate-500 dark:text-slate-400">
                      <span className="font-semibold text-slate-700 dark:text-slate-300">Vigilante:</span>{' '}
                      {nov.nombre_vigilante}
                    </span>
                    {nov.id_vigilador !== usuario?.id && (
                      <button
                        type="button"
                        onClick={() => marcarNovedadLeida(nov.id)}
                        className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1 cursor-pointer"
                      >
                        <CheckCircle className="w-3.5 h-3.5" />
                        {novedades.some(n => n.id === nov.id) ? 'Marcar como visto' : 'Marcar como visto'}
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2 text-[11px] text-slate-500 dark:text-slate-400 border-t border-slate-200 dark:border-slate-800/60">
                    <div>
                      <span className="font-semibold text-slate-700 dark:text-slate-300">Vigilante:</span>{' '}
                      {nov.nombre_vigilante}
                    </div>
                    <div>
                      <span className="font-semibold text-slate-700 dark:text-slate-300">Supervisor:</span>{' '}
                      {nov.nombre_supervisor}
                    </div>
                  </div>

                  {nov.id_vigilador !== usuario?.id && (
                    <div className="flex justify-end pt-1">
                      {novedadesLeidas.has(nov.id) ? (
                        <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                          <CheckCircle className="w-3.5 h-3.5" />
                          Visto
                        </span>
                      ) : (
                        <button
                          type="button"
                          onClick={() => marcarNovedadLeida(nov.id)}
                          className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1 cursor-pointer"
                        >
                          <CheckCircle className="w-3.5 h-3.5" />
                          Marcar como visto
                        </button>
                      )}
                    </div>
                  )}
                </TarjetaContenido>
              </Tarjeta>
            )
          })
        )}
      </div>

      {/* Modal Asentar Novedad (Sección 32) */}
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
            <div>
              <Etiqueta requerido>Objetivo del Servicio</Etiqueta>
              <select
                value={idObjetivo}
                onChange={(e) => setIdObjetivo(e.target.value)}
                className="w-full min-h-[46px] rounded-xl bg-white dark:bg-[#0A0F1A] border border-slate-300 dark:border-slate-700/80 px-3 py-2.5 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all cursor-pointer"
              >
                {objetivos.map((o) => (
                  <option key={o.id} value={o.id}>
                    {o.nombre} ({o.localidad})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <Etiqueta requerido>Turno Correspondiente</Etiqueta>
              <Entrada
                value={turno}
                onChange={(e) => setTurno(e.target.value)}
                placeholder="12🌙 Nocturno (19:00 - 07:00)"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Etiqueta requerido>Fecha</Etiqueta>
              <Entrada
                type="date"
                value={fecha}
                onChange={(e) => setFecha(e.target.value)}
              />
            </div>
            <div>
              <Etiqueta requerido>Hora</Etiqueta>
              <Entrada
                type="time"
                value={hora}
                onChange={(e) => setHora(e.target.value)}
              />
            </div>
          </div>

          <div>
            <Etiqueta requerido>Supervisor a Cargo</Etiqueta>
            <Entrada
              value={nombreSupervisor}
              onChange={(e) => setNombreSupervisor(e.target.value)}
              placeholder="Carlos Méndez"
            />
          </div>

          <div>
            <Etiqueta requerido>Elementos a Cargo / Entrega</Etiqueta>
            <Entrada
              value={elementosACargo}
              onChange={(e) => setElementosACargo(e.target.value)}
              placeholder="Handy, linterna, llaves, detector, etc."
            />
          </div>

          <div>
            <Etiqueta requerido>Informe de Novedades</Etiqueta>
            <textarea
              value={informeNovedades}
              onChange={(e) => setInformeNovedades(e.target.value)}
              rows={4}
              placeholder="Detallá el relevo, novedades operativas, rondas, anomalías observadas o novedades ordinarias..."
              className="w-full rounded-xl bg-white dark:bg-[#0A0F1A] border border-slate-300 dark:border-slate-700/80 p-3 text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all resize-none"
            />
          </div>

          {error && <p className="text-xs text-red-500 font-semibold">{error}</p>}

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200 dark:border-slate-800">
            <Boton type="button" variante="secundario" onClick={() => setModalNuevoAbierto(false)}>
              Cancelar
            </Boton>
            <Boton type="submit" variante="primario">
              Registrar en Libro
            </Boton>
          </div>
        </form>
      </Dialogo>

      {/* Modal Corrección de Novedad (Sección 32: Con motivo obligatorio) */}
      <Dialogo
        abierto={modalEditarAbierto}
        alCerrar={() => setModalEditarAbierto(false)}
        titulo="Corrección de Novedad (Trazabilidad Oficial)"
        subtitulo="Las modificaciones quedan asentadas conservando usuario, fecha y justificación."
        icono={<Edit2 className="w-5 h-5 text-amber-500" />}
      >
        <form onSubmit={manejarGuardarCorreccion} className="space-y-4">
          <div>
            <Etiqueta requerido>Informe Modificado</Etiqueta>
            <textarea
              value={informeCorregido}
              onChange={(e) => setInformeCorregido(e.target.value)}
              rows={4}
              className="w-full rounded-xl bg-white dark:bg-[#0A0F1A] border border-slate-300 dark:border-slate-700/80 p-3 text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all resize-none"
            />
          </div>

          <div>
            <Etiqueta requerido>Motivo de la Modificación</Etiqueta>
            <textarea
              value={motivoCorreccion}
              onChange={(e) => setMotivoCorreccion(e.target.value)}
              rows={2}
              placeholder="Ingresá la justificación formal de la corrección..."
              className="w-full rounded-xl bg-white dark:bg-[#0A0F1A] border border-slate-300 dark:border-slate-700/80 p-3 text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all resize-none"
            />
          </div>

          {error && <p className="text-xs text-red-500 font-semibold">{error}</p>}

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200 dark:border-slate-800">
            <Boton type="button" variante="secundario" onClick={() => setModalEditarAbierto(false)}>
              Cancelar
            </Boton>
            <Boton type="submit" variante="primario">
              Asentar Corrección Auditada
            </Boton>
          </div>
        </form>
      </Dialogo>

      {/* Modal Ver Detalle */}
      <Dialogo
        abierto={modalDetalleAbierto}
        alCerrar={() => setModalDetalleAbierto(false)}
        titulo="Detalle del Registro de Guardia"
        subtitulo={`Asiento Oficial ID: ${novedadSeleccionada?.id}`}
        icono={<BookOpen className="w-5 h-5 text-blue-500" />}
      >
        {novedadSeleccionada && (
          <div className="space-y-4 text-xs">
            <div className="grid grid-cols-2 gap-2 p-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
              <div>
                <span className="text-slate-500 dark:text-slate-400 block text-[10px]">Fecha y Hora:</span>
                <span className="font-bold text-slate-900 dark:text-white">
                  {novedadSeleccionada.fecha} a las {novedadSeleccionada.hora} hs
                </span>
              </div>
              <div>
                <span className="text-slate-500 dark:text-slate-400 block text-[10px]">Turno:</span>
                <span className="font-bold text-slate-900 dark:text-white">
                  {novedadSeleccionada.turno}
                </span>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
              <span className="text-slate-500 dark:text-slate-400 block text-[10px] mb-1">
                Elementos a Cargo:
              </span>
              <span className="text-slate-800 dark:text-slate-200">
                {novedadSeleccionada.elementos_a_cargo}
              </span>
            </div>

            <div className="p-3.5 rounded-xl bg-white dark:bg-[#0A0F1A] border border-slate-300 dark:border-slate-700">
              <span className="text-slate-500 dark:text-slate-400 block text-[10px] mb-1 font-bold uppercase">
                Informe del Vigilador:
              </span>
              <p className="text-sm text-slate-900 dark:text-slate-100 whitespace-pre-line leading-relaxed">
                {novedadSeleccionada.informe_novedades}
              </p>
            </div>

            <div className="flex justify-end pt-2">
              <Boton variante="secundario" onClick={() => setModalDetalleAbierto(false)}>
                Cerrar
              </Boton>
            </div>
          </div>
        )}
      </Dialogo>
    </div>
  )
}
