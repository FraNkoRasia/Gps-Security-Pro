import React, { useState } from 'react'
import { UserPlus, ArrowRightLeft, History, Edit2, Phone, Mail, MapPin, UserCheck, UserX } from 'lucide-react'
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

export const GestionVigiladores: React.FC<{ idEmpresaSeleccionada?: string; modoConsulta?: boolean }> = ({ idEmpresaSeleccionada, modoConsulta = false }) => {
  const { vigiladores, asignaciones, objetivos, crearVigilador, editarVigilador, cambiarEstadoVigilador } = useOperativo()
  const { usuario } = useAutenticacion()

  const [modalNuevoAbierto, setModalNuevoAbierto] = useState(false)
  const [modalHistorialAbierto, setModalHistorialAbierto] = useState(false)
  const [modalTrasladoAbierto, setModalTrasladoAbierto] = useState(false)
  const [modalEstadoAbierto, setModalEstadoAbierto] = useState(false)
  const [vigiladorEstado, setVigiladorEstado] = useState<Usuario | null>(null)

  const [vigiladorSeleccionado, setVigiladorSeleccionado] = useState<Usuario | null>(null)
  const [vigiladorEditando, setVigiladorEditando] = useState<Usuario | null>(null)

  // Formulario alta / edición
  const [nombre, setNombre] = useState('')
  const [apellido, setApellido] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [telefono, setTelefono] = useState('')
  const [idObjetivoInicial, setIdObjetivoInicial] = useState('')
  const [error, setError] = useState<string | null>(null)

  const idEmpresaActiva = idEmpresaSeleccionada || usuario?.id_empresa || ''
  const objetivosDeEmpresa = objetivos.filter((obj) => obj.id_empresa === idEmpresaActiva)

  const abrirAlta = () => {
    setVigiladorEditando(null)
    setNombre('')
    setApellido('')
    setEmail('')
    setPassword('')
    setTelefono('')
    const empresaInicial = usuario?.id_empresa || ''
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
    setPassword('')
    setError(null)
    setModalNuevoAbierto(true)
  }

  const abrirHistorial = (vig: Usuario) => {
    setVigiladorSeleccionado(vig)
    setModalHistorialAbierto(true)
  }

  const abrirEstado = (vig: Usuario) => {
    setVigiladorEstado(vig)
    setModalEstadoAbierto(true)
  }

  const confirmarEstado = async () => {
    if (!vigiladorEstado) return
    const errorEstado = await cambiarEstadoVigilador(vigiladorEstado.id, !vigiladorEstado.activo)
    if (errorEstado) { setError(errorEstado); return }
    setModalEstadoAbierto(false)
    setVigiladorEstado(null)
  }

  const abrirTraslado = (vig: Usuario) => {
    setVigiladorSeleccionado(vig)
    setModalTrasladoAbierto(true)
  }

  const manejarGuardar = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!nombre.trim() || !apellido.trim() || !email.trim() || (!vigiladorEditando && !password)) {
      setError('Nombre, apellido, correo electrónico y contraseña son obligatorios.')
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
        telefono: telefono.trim(),
        ...(password.trim() ? { password: password.trim() } : {})
      })
      setModalNuevoAbierto(false)
      return
    }

    const errorCreacion = await crearVigilador({
      nombre: nombre.trim(),
      apellido: apellido.trim(),
      email: email.trim().toLowerCase(),
      password,
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

  const vigiladoresMostrados = vigiladores.filter((v) => v.id_empresa === idEmpresaActiva)

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
        {!modoConsulta && <Boton
          variante="primario"
          onClick={abrirAlta}
          icono={<UserPlus className="w-4 h-4" />}
        >
          Nuevo Vigilador
        </Boton>}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {vigiladoresMostrados.map((vig) => {
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

                  {!modoConsulta && <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => abrirEditar(vig)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                      title="Editar vigilador"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => abrirEstado(vig)}
                      className={`p-1.5 rounded-lg transition-colors ${vig.activo ? 'text-red-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30' : 'text-emerald-500 hover:text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/30'}`}
                      title={vig.activo ? 'Dar de baja' : 'Dar de alta'}
                    >
                      {vig.activo ? <UserX className="w-4 h-4" /> : <UserCheck className="w-4 h-4" />}
                    </button>
                  </div>}
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
                        {vig.activo ? (asignacionActiva?.objetivo_nombre || 'Sin puesto asignado') : 'Sin servicio activo'}
                      </span>
                    </div>
                  </div>
                  <Insignia variante={vig.activo ? "verde" : "roja"}>{vig.activo ? "En servicio" : "Dado de baja"}</Insignia>
                </div>

                {/* Acciones de Traslado e Historial (Sección 20 y 21) */}
                {!modoConsulta && <div className="pt-2 flex items-center justify-between gap-2 border-t border-slate-200 dark:border-slate-800">
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
                </div>}
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


      <Dialogo
        abierto={modalEstadoAbierto}
        alCerrar={() => { setModalEstadoAbierto(false); setVigiladorEstado(null) }}
        titulo={vigiladorEstado?.activo ? 'Dar de baja vigilador' : 'Dar de alta vigilador'}
        subtitulo={vigiladorEstado?.activo
          ? 'El vigilador quedará inactivo y no tendrá servicio operativo activo.'
          : 'El vigilador volverá a estar activo para la operación.'}
        icono={vigiladorEstado?.activo ? <UserX className="w-5 h-5 text-red-500" /> : <UserCheck className="w-5 h-5 text-emerald-500" />}
      >
        <div className="space-y-4">
          <p className="text-sm text-slate-700 dark:text-slate-300">
            ¿Deseas {vigiladorEstado?.activo ? 'dar de baja' : 'dar de alta'} a <strong>{vigiladorEstado?.nombre} {vigiladorEstado?.apellido}</strong>?
          </p>
          <div className="flex justify-end gap-2 pt-3 border-t border-slate-200 dark:border-slate-800">
            <Boton variante="secundario" onClick={() => { setModalEstadoAbierto(false); setVigiladorEstado(null) }}>Cancelar</Boton>
            <Boton variante={vigiladorEstado?.activo ? "peligro" : "primario"} onClick={() => void confirmarEstado()}>
              {vigiladorEstado?.activo ? 'Confirmar baja' : 'Confirmar alta'}
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
            <Etiqueta requerido={!vigiladorEditando}>Correo Electrónico (Acceso Auth)</Etiqueta>
            <Entrada
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="franco.rasia@empresa.com"
            />
          </div>

          <div>
            <Etiqueta requerido={!vigiladorEditando}>
              {vigiladorEditando ? 'Nueva Contraseña (opcional)' : 'Contraseña de Acceso'}
            </Etiqueta>
            <Entrada
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder={vigiladorEditando ? 'Dejar vacío para conservar la actual' : 'Mínimo 8 caracteres'}
              minLength={vigiladorEditando ? undefined : 8}
            />
            <p className="text-[11px] text-slate-500 mt-1">
              {vigiladorEditando ? 'Solo completala si querés cambiar la contraseña.' : 'Esta contraseña será la que use el vigilador para iniciar sesión.'}
            </p>
          </div>

          <div>
            <Etiqueta>Teléfono de Contacto</Etiqueta>
            <Entrada
              value={telefono}
              onChange={(e) => setTelefono(e.target.value)}
              placeholder="+54 9 358 1234567"
            />
          </div>

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
