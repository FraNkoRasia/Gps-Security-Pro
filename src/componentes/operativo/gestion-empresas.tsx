import React, { useState } from 'react'
import { Building2, Plus, Edit2, MapPin } from 'lucide-react'
import { Tarjeta, TarjetaContenido } from '@/componentes/ui/tarjeta'
import { Boton } from '@/componentes/ui/boton'
import { Insignia } from '@/componentes/ui/insignia'
import { Dialogo } from '@/componentes/ui/dialogo'
import { Entrada } from '@/componentes/ui/entrada'
import { Etiqueta } from '@/componentes/ui/etiqueta'
import { useOperativo } from '@/contextos/contexto-operativo'
import type { Empresa } from '@/tipos'

export const GestionEmpresas: React.FC = () => {
  const { empresas, objetivos, vigiladores, crearEmpresa, editarEmpresa } = useOperativo()

  const [modalAbierto, setModalAbierto] = useState(false)
  const [empresaEditando, setEmpresaEditando] = useState<Empresa | null>(null)

  const [nombre, setNombre] = useState('')
  const [cuit, setCuit] = useState('')
  const [direccion, setDireccion] = useState('')
  const [error, setError] = useState<string | null>(null)

  const abrirCrear = () => {
    setEmpresaEditando(null)
    setNombre('')
    setCuit('')
    setDireccion('')
    setError(null)
    setModalAbierto(true)
  }

  const abrirEditar = (emp: Empresa) => {
    setEmpresaEditando(emp)
    setNombre(emp.nombre)
    setCuit(emp.cuit || '')
    setDireccion(emp.direccion || '')
    setError(null)
    setModalAbierto(true)
  }

  const manejarGuardar = (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!nombre.trim()) {
      setError('El nombre de la empresa es obligatorio.')
      return
    }

    if (empresaEditando) {
      editarEmpresa(empresaEditando.id, {
        nombre: nombre.trim(),
        cuit: cuit.trim(),
        direccion: direccion.trim()
      })
    } else {
      crearEmpresa({
        nombre: nombre.trim(),
        cuit: cuit.trim(),
        direccion: direccion.trim()
      })
    }

    setModalAbierto(false)
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-xl font-black text-slate-900 dark:text-white font-['Outfit']">
            Gestión Global de Empresas
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Administración de compañías clientes y aislamiento multitenant de seguridad.
          </p>
        </div>
        <Boton
          variante="primario"
          onClick={abrirCrear}
          icono={<Plus className="w-4 h-4" />}
        >
          Nueva Empresa
        </Boton>
      </div>

      {/* Grid de Empresas */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {empresas.map((emp) => {
          const cantidadObjetivos = objetivos.filter((o) => o.id_empresa === emp.id).length
          const cantidadVigiladores = vigiladores.filter((v) => v.id_empresa === emp.id).length

          return (
            <Tarjeta key={emp.id} className="relative group hover:border-blue-500/50 transition-all">
              <TarjetaContenido className="p-5">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800/60 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
                      <Building2 className="w-6 h-6" />
                    </div>
                    <div>
                      <h4 className="text-base font-bold text-slate-900 dark:text-white">
                        {emp.nombre}
                      </h4>
                      <p className="text-xs text-slate-500 dark:text-slate-400 font-mono mt-0.5">
                        CUIT: {emp.cuit || 'Sin CUIT'}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Insignia variante={emp.activa ? 'verde' : 'gris'}>
                      {emp.activa ? 'Activa' : 'Inactiva'}
                    </Insignia>
                    <button
                      type="button"
                      onClick={() => abrirEditar(emp)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                      title="Editar empresa"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {emp.direccion && (
                  <p className="text-xs text-slate-600 dark:text-slate-400 mt-3 flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span>{emp.direccion}</span>
                  </p>
                )}

                <div className="grid grid-cols-2 gap-2 mt-4 pt-4 border-t border-slate-200 dark:border-slate-800/80 text-xs">
                  <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800">
                    <span className="text-slate-500 dark:text-slate-400 block text-[11px]">Objetivos:</span>
                    <span className="font-bold text-slate-800 dark:text-slate-200 text-sm">{cantidadObjetivos} puestos</span>
                  </div>
                  <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800">
                    <span className="text-slate-500 dark:text-slate-400 block text-[11px]">Vigiladores:</span>
                    <span className="font-bold text-slate-800 dark:text-slate-200 text-sm">{cantidadVigiladores} asignados</span>
                  </div>
                </div>
              </TarjetaContenido>
            </Tarjeta>
          )
        })}
      </div>

      {/* Modal Crear / Editar Empresa */}
      <Dialogo
        abierto={modalAbierto}
        alCerrar={() => setModalAbierto(false)}
        titulo={empresaEditando ? 'Editar Empresa' : 'Nueva Empresa'}
        subtitulo="Gestión de organizaciones para aislamiento de grillas y personal."
        icono={<Building2 className="w-5 h-5 text-blue-500" />}
      >
        <form onSubmit={manejarGuardar} className="space-y-4">
          <div>
            <Etiqueta requerido>Nombre de la Empresa</Etiqueta>
            <Entrada
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              placeholder="Ej: Wall Security"
              autoFocus
            />
          </div>

          <div>
            <Etiqueta>CUIT / Identificación Tributaria</Etiqueta>
            <Entrada
              value={cuit}
              onChange={(e) => setCuit(e.target.value)}
              placeholder="30-71458921-9"
            />
          </div>

          <div>
            <Etiqueta>Dirección / Sede Central</Etiqueta>
            <Entrada
              value={direccion}
              onChange={(e) => setDireccion(e.target.value)}
              placeholder="Av. Marcelo T. de Alvear 1040, Río Cuarto"
            />
          </div>

          {error && <p className="text-xs text-red-500 font-semibold">{error}</p>}

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200 dark:border-slate-800">
            <Boton type="button" variante="secundario" onClick={() => setModalAbierto(false)}>
              Cancelar
            </Boton>
            <Boton type="submit" variante="primario">
              {empresaEditando ? 'Guardar Cambios' : 'Crear Empresa'}
            </Boton>
          </div>
        </form>
      </Dialogo>
    </div>
  )
}
