import React, { useState } from 'react'
import { Bell, Plus, CheckCircle } from 'lucide-react'
import { Tarjeta, TarjetaContenido } from '@/componentes/ui/tarjeta'
import { Boton } from '@/componentes/ui/boton'
import { Insignia } from '@/componentes/ui/insignia'
import { Dialogo } from '@/componentes/ui/dialogo'
import { Entrada } from '@/componentes/ui/entrada'
import { Etiqueta } from '@/componentes/ui/etiqueta'
import { useOperativo } from '@/contextos/contexto-operativo'
import { useAutenticacion } from '@/contextos/contexto-autenticacion'
import type { Aviso } from '@/tipos'

export const AvisosComunicacion: React.FC = () => {
  const { avisos, crearAviso, marcarAvisoLeido } = useOperativo()
  const { usuario } = useAutenticacion()

  const [modalAbierto, setModalAbierto] = useState(false)
  const [titulo, setTitulo] = useState('')
  const [contenido, setContenido] = useState('')
  const [prioridad, setPrioridad] = useState<Aviso['prioridad']>('media')
  const [error, setError] = useState<string | null>(null)

  const esAdmin = usuario?.rol === 'super_administrador' || usuario?.rol === 'administrador'

  const manejarCrear = (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!titulo.trim() || !contenido.trim()) {
      setError('El título y contenido del aviso son requeridos.')
      return
    }

    crearAviso({
      titulo: titulo.trim(),
      contenido: contenido.trim(),
      prioridad
    })

    setTitulo('')
    setContenido('')
    setPrioridad('media')
    setModalAbierto(false)
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-xl font-black text-slate-900 dark:text-white font-['Outfit']">
            Avisos y Comunicados Operativos
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Canal de comunicación oficial entre supervisores, administración y personal de guardia.
          </p>
        </div>

        {esAdmin && (
          <Boton
            variante="primario"
            onClick={() => setModalAbierto(true)}
            icono={<Plus className="w-4 h-4" />}
          >
            Publicar Aviso
          </Boton>
        )}
      </div>

      <div className="space-y-3">
        {avisos.length === 0 ? (
          <Tarjeta>
            <TarjetaContenido className="p-8 text-center text-slate-500">
              No hay comunicados publicados actualmente.
            </TarjetaContenido>
          </Tarjeta>
        ) : (
          avisos.map((av) => (
            <Tarjeta
              key={av.id}
              className={`hover:border-blue-500/50 transition-all ${
                !av.leido ? 'border-l-4 border-l-blue-500' : ''
              }`}
            >
              <TarjetaContenido className="p-5 space-y-2.5">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h4 className="font-bold text-slate-900 dark:text-white text-base">
                      {av.titulo}
                    </h4>
                    <Insignia
                      variante={
                        av.prioridad === 'urgente' || av.prioridad === 'alta'
                          ? 'rojo'
                          : av.prioridad === 'media'
                          ? 'dorado'
                          : 'azul'
                      }
                    >
                      Prioridad {av.prioridad.toUpperCase()}
                    </Insignia>
                    {!av.leido && <Insignia variante="verde">Nuevo</Insignia>}
                  </div>

                  <span className="text-[11px] text-slate-500 dark:text-slate-400 font-mono">
                    Publicado por: {av.autor_nombre}
                  </span>
                </div>

                <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-line">
                  {av.contenido}
                </p>

                <div className="pt-2 flex items-center justify-between text-xs border-t border-slate-200 dark:border-slate-800">
                  <span className="text-[11px] text-slate-400">
                    {new Date(av.creado_en).toLocaleString()}
                  </span>

                  {!av.leido && (
                    <button
                      type="button"
                      onClick={() => marcarAvisoLeido(av.id)}
                      className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1 cursor-pointer"
                    >
                      <CheckCircle className="w-3.5 h-3.5" />
                      <span>Marcar como leído</span>
                    </button>
                  )}
                </div>
              </TarjetaContenido>
            </Tarjeta>
          ))
        )}
      </div>

      {/* Modal Crear Aviso */}
      <Dialogo
        abierto={modalAbierto}
        alCerrar={() => setModalAbierto(false)}
        titulo="Publicar Comunicado Oficial"
        subtitulo="Difusión de directivas de seguridad para objetivos y vigiladores."
        icono={<Bell className="w-5 h-5 text-blue-500" />}
      >
        <form onSubmit={manejarCrear} className="space-y-4">
          <div>
            <Etiqueta requerido>Título del Comunicado</Etiqueta>
            <Entrada
              value={titulo}
              onChange={(e) => setTitulo(e.target.value)}
              placeholder="Ej: Refuerzo de control vehicular por evento"
              autoFocus
            />
          </div>

          <div>
            <Etiqueta requerido>Nivel de Prioridad</Etiqueta>
            <select
              value={prioridad}
              onChange={(e) => setPrioridad(e.target.value as Aviso['prioridad'])}
              className="w-full min-h-[46px] rounded-xl bg-white dark:bg-[#0A0F1A] border border-slate-300 dark:border-slate-700/80 px-3 py-2.5 text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all cursor-pointer"
            >
              <option value="baja">Baja</option>
              <option value="media">Media</option>
              <option value="alta">Alta</option>
              <option value="urgente">Urgente</option>
            </select>
          </div>

          <div>
            <Etiqueta requerido>Contenido del Aviso</Etiqueta>
            <textarea
              value={contenido}
              onChange={(e) => setContenido(e.target.value)}
              rows={4}
              placeholder="Detallá la instrucción, alcance o normativa a cumplir..."
              className="w-full rounded-xl bg-white dark:bg-[#0A0F1A] border border-slate-300 dark:border-slate-700/80 p-3 text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all resize-none"
            />
          </div>

          {error && <p className="text-xs text-red-500 font-semibold">{error}</p>}

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200 dark:border-slate-800">
            <Boton type="button" variante="secundario" onClick={() => setModalAbierto(false)}>
              Cancelar
            </Boton>
            <Boton type="submit" variante="primario">
              Publicar Comunicado
            </Boton>
          </div>
        </form>
      </Dialogo>
    </div>
  )
}
