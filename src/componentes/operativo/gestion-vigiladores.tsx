import React, { useState } from 'react'
import { UserPlus, ArrowRightLeft, History, Edit2, Phone, Mail, MapPin } from 'lucide-react'
import { Tarjeta, TarjetaContenido } from '@/componentes/ui/tarjeta'
import { Boton } from '@/componentes/ui/boton'
import { Insignia } from '@/componentes/ui/insignia'
import { Dialogo } from '@/componentes/ui/dialogo'
import { Entrada } from '@/componentes/ui/entrada'
import { Etiqueta } from '@/componentes/ui/etiqueta'
import { ModalTraslado } from './modal-traslado'
import { useOperativo } from '@/contextos/contexto-operativo'
import { useAutenticacion } from '@/contextos/contexto-autenticacion'
import type { Usuario } from '@/tipos'

export const GestionVigiladores: React.FC = () => {
  const { empresas, vigiladores, asignaciones, objetivos, crearVigilador, editarVigilador } = useOperativo()
  const { usuario } = useAutenticacion()

  const [modalNuevoAbierto, setModalNuevoAbierto] = useState(false)
  const [modalHistorialAbierto, setModalHistorialAbierto] = useState(false)
  const [modalTrasladoAbierto, setModalTrasladoAbierto] = useState(false)

  const [vigiladorSeleccionado, setVigiladorSeleccionado] = useState<Usuario | null>(null)
  const [vigiladorEditando, setVigiladorEditando] = useState<Usuario | null>(null)

  // Formulario alta / edición
  const [nombre, setNombre] = useState('')
  const [apellido, setApellido] = useState('')
  const [email, setEmail] = useState('')
  const [telefono, setTelefono] = useState('')
  const [idEmpresaSeleccionada, setIdEmpresaSeleccionada] = useState('')
  const [idObjetivoInicial, setIdObjetivoInicial] = useState('')
  const [error, setError] = useState<string | null>(null)

  const esSuperAdministrador = usuario?.rol === 'super_administrador'
  const idEmpresaActiva = esSuperAdministrador ? idEmpresaSeleccionada : (usuario?.id_empresa || '')
  const objetivosDeEmpresa = objetivos.filter((obj) => obj.id_empresa === idEmpresaActiva)

  const abrirAlta = () => {
    setVigiladorEditando(null)
    setNombre('')
    setApellido('')
    setEmail('')
    setTelefono('')
    const empresaInicial = esSuperAdministrador ? (idEmpresaSeleccionada || empresas[0]?.id || '') : (usuario?.id_empresa || '')
    setIdEmpresaSeleccionada(empresaInicial)
    setIdObjetivoInicial(objetivos.find((obj) => obj.id_empresa === empresaInicial)?.id || '')
    setError(null)
    setModalNuevoAbierto(true)
  }

  const abrirEditar = (vig: Usuario) => {
    setVigiladorEditando(vig)
    setNombre(vig.nombre)
    setApellido(vig.apellido)
    setEmail(vig.email)
    setTelefono(vig.telefono || '')
    setError(null)
    setModalNuevoAbierto(true)
  }

  const abrirHistorial = (vig: Usuario) => {
    setVigiladorSeleccionado(vig)
    setModalHistorialAbierto(true)
  }

  const abrirTraslado = (vig: Usuario) => {
    setVigiladorSeleccionado(vig)
    setModalTrasladoAbierto(true)
  }

  const manejarGuardar = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!nombre.trim() || !apellido.trim() || !email.trim()) {
      setError('Nombre, apellido y correo electrónico son obligatorios.')
      return
    }

    if (!vigiladorEditando && !idEmpresaActiva) {
      setError('Seleccioná una empresa antes de dar de alta el vigilador.')
      return
    }

    if (!vigiladorEditando && !idObjetivoInicial) {
      setError('Seleccioná un objetivo de inicio antes de dar de alta el vigilador.')
      return
    }

    if (vigiladorEditando) {
      editarVigilador(vigiladorEditando.id, {
        nombre: nombre.trim(),
        apellido: apellido.trim(),
        email: email.trim().toLowerCase(),
        telefono: telefono.trim()
      })
      setModalNuevoAbierto(false)
      return
    }

    const errorCreacion = await crearVigilador({
      nombre: nombre.trim(),
      apellido: apellido.trim(),
      email: email.trim().toLowerCase(),
      telefono: telefono.trim(),
      id_empresa: idEmpresaActiva,
      id_objetivo_inicial: idObjetivoInicial
    })

    if (errorCreacion) {
      setError(errorCreacion)
      return
    }

    setModalNuevoAbierto(false)
    window.location.reload()
  }

  // Historial del vigilador seleccionado
  const historialAsignaciones = asignaciones.filter(
    (a) => a.id_vigilador === vigiladorSeleccionado?.id
  )

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-xl font-black text-slate-900 dark:text-white font-['Outfit']">
            Plantel de Vigiladores
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Control de personal de guardia, asignaciones vigentes e historial de traslados operativos.
          </p>
        </div>
        <Boton
          variante="primario"
          onClick={abrirAlta}
          icono={<UserPlus className="w-4 h-4" />}
        >
          Nuevo Vigilador
        </Boton>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {vigiladores.map((vig) => {
          const asignacionActiva = asignaciones.find(
            (a) => a.id_vigilador === vig.id && a.activa
          )

          return (
            <Tarjeta key={vig.id} className="hover:border-blue-500/50 transition-all">
              <TarjetaContenido className="p-5 space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-xl bg-blue-100 dark:bg-blue-950/70 border border-blue-300 dark:border-blue-800/80 text-blue-700 dark:text-blue-300 font-bold text-base flex items-center justify-center shrink-0">
                      {vig.nombre.charAt(0)}{vig.apellido.charAt(0)}
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-900 dark:text-white text-base leading-snug">
                        {vig.nombre} {vig.apellido}
                      </h4>
                      <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1.5 mt-0.5">
                        <Mail className="w-3 h-3 text-slate-400" />
                        <span>{vig.email}</span>
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => abrirEditar(vig)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                </div>

                {vig.telefono && (
                  <p className="text-xs text-slate-600 dark:text-slate-400 flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5 text-slate-400" />
                    <span>{vig.telefono}</span>
                  </p>
                )}

                {/* Asignación Actual */}
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-emerald-500 shrink-0" />
                    <div>
                      <span className="text-slate-500 dark:text-slate-400 block text-[10px]">Puesto Activo:</span>
                      <span className="font-bold text-slate-900 dark:text-white">
                        {asignacionActiva?.objetivo_nombre || 'Sin puesto asignado'}
                      </span>
                    </div>
                  </div>
                  <Insignia variante="verde">En servicio</Insignia>
                </div>

                {/* Acciones de Traslado e Historial (Sección 20 y 21) */}
                <div className="pt-2 flex items-center justify-between gap-2 border-t border-slate-200 dark:border-slate-800">
                  <button
                    type="button"
                    onClick={() => abrirHistorial(vig)}
                    className="text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-white flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <History className="w-3.5 h-3.5" />
                    <span>Historial de Asignaciones</span>
                  </button>

                  <Boton
                    variante="secundario"
                    tamano="chico"
                    onClick={() => abrirTraslado(vig)}
                    icono={<ArrowRightLeft className="w-3.5 h-3.5 text-blue-500" />}
                  >
                    Trasladar
                  </Boton>
                </div>
              </TarjetaContenido>
            </Tarjeta>
          )
        })}
      </div>

      {/* Modal Historial de Asignaciones (Sección 20) */}
      <Dialogo
        abierto={modalHistorialAbierto}
        alCerrar={() => setModalHistorialAbierto(false)}
        titulo={`Historial de Asignaciones: ${vigiladorSeleccionado?.nombre} ${vigiladorSeleccionado?.apellido}`}
        subtitulo="Registro cronológico inmutable de objetivos y traslados (Sección 20)."
        icono={<History className="w-5 h-5 text-blue-500" />}
        tamano="grande"
      >
        <div className="space-y-3">
          {historialAsignaciones.length === 0 ? (
            <p className="text-xs text-slate-500 text-center py-4">No hay traslados registrados aún.</p>
          ) : (
            <div className="divide-y divide-slate-200 dark:divide-slate-800">
              {historialAsignaciones.map((asig) => (
                <div key={asig.id} className="py-3.5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-xs">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-900 dark:text-white text-sm">
                        {asig.objetivo_nombre}
                      </span>
                      {asig.activa && <Insignia variante="verde">Actual</Insignia>}
                    </div>
                    <p className="text-slate-500 dark:text-slate-400 mt-1">
                      Período: <span className="font-semibold text-slate-700 dark:text-slate-300">{asig.fecha_inicio}</span>
                      {asig.fecha_fin ? ` → ${asig.fecha_fin}` : ' → En curso'}
                    </p>
                    {asig.motivo_traslado && (
                      <p className="text-slate-600 dark:text-slate-400 mt-0.5 italic">
                        Motivo: {asig.motivo_traslado}
                      </p>
                    )}
                  </div>
                  <div className="text-[11px] text-slate-400">
                    Registrado por: {asig.creado_por}
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex justify-end">
            <Boton variante="secundario" onClick={() => setModalHistorialAbierto(false)}>
              Cerrar
            </Boton>
          </div>
        </div>
      </Dialogo>

      {/* Modal Nuevo / Editar Vigilador */}
      <Dialogo
        abierto={modalNuevoAbierto}
        alCerrar={() => setModalNuevoAbierto(false)}
        titulo={vigiladorEditando ? 'Editar Vigilador' : 'Alta de Vigilador'}
        subtitulo="Registro de personal operativo para diagramación y libros de guardia."
        icono={<UserPlus className="w-5 h-5 text-blue-500" />}
      >
        <form onSubmit={manejarGuardar} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Etiqueta requerido>Nombre</Etiqueta>
              <Entrada
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                placeholder="Franco"
                autoFocus
              />
            </div>
            <div>
              <Etiqueta requerido>Apellido</Etiqueta>
              <Entrada
                value={apellido}
                onChange={(e) => setApellido(e.target.value)}
                placeholder="Rasia"
              />
            </div>
          </div>

          <div>
            <Etiqueta requerido>Correo Electrónico (Acceso Auth)</Etiqueta>
            <Entrada
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="franco.rasia@empresa.com"
            />
          </div>

          <div>
            <Etiqueta>Teléfono de Contacto</Etiqueta>
            <Entrada
              value={telefono}
              onChange={(e) => setTelefono(e.target.value)}
              placeholder="+54 9 358 1234567"
            />
          </div>

          {!vigiladorEditando && esSuperAdministrador && (
            <div>
              <Etiqueta requerido>Empresa</Etiqueta>
              <select
                value={idEmpresaSeleccionada}
                onChange={(e) => {
                  const empresaId = e.target.value
                  setIdEmpresaSeleccionada(empresaId)
                  setIdObjetivoInicial(objetivos.find((obj) => obj.id_empresa === empresaId)?.id || '')
                }}
                className="w-full min-h-[46px] rounded-xl bg-white dark:bg-[#0A0F1A] border border-slate-300 dark:border-slate-700/80 px-4 py-2.5 text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all cursor-pointer"
              >
                <option value="">Seleccionar empresa...</option>
                {empresas.filter((empresa) => empresa.activa).map((empresa) => (
                  <option key={empresa.id} value={empresa.id}>{empresa.nombre}</option>
                ))}
              </select>
            </div>
          )}

          {!vigiladorEditando && (
            <div>
              <Etiqueta requerido>Objetivo de Inicio</Etiqueta>
              <select
                value={idObjetivoInicial}
                onChange={(e) => setIdObjetivoInicial(e.target.value)}
                disabled={!idEmpresaActiva}
                className="w-full min-h-[46px] rounded-xl bg-white dark:bg-[#0A0F1A] border border-slate-300 dark:border-slate-700/80 px-4 py-2.5 text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all cursor-pointer"
              >
                <option value="">Seleccionar objetivo...</option>
                {objetivosDeEmpresa.map((obj) => (
                  <option key={obj.id} value={obj.id}>
                    {obj.nombre} ({obj.localidad})
                  </option>
                ))}
              </select>
            </div>
          )}

          {error && <p className="text-xs text-red-500 font-semibold">{error}</p>}

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200 dark:border-slate-800">
            <Boton type="button" variante="secundario" onClick={() => setModalNuevoAbierto(false)}>
              Cancelar
            </Boton>
            <Boton type="submit" variante="primario">
              {vigiladorEditando ? 'Guardar Cambios' : 'Dar de Alta'}
            </Boton>
          </div>
        </form>
      </Dialogo>

      {/* Modal Traslado Oficial */}
      <ModalTraslado
        abierto={modalTrasladoAbierto}
        alCerrar={() => setModalTrasladoAbierto(false)}
        vigilador={vigiladorSeleccionado}
      />
    </div>
  )
}
