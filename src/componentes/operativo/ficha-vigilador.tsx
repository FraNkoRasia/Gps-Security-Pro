import React, { useEffect, useState } from 'react'
import { Info, UserRound, Save, LoaderCircle } from 'lucide-react'
import { Dialogo } from '@/componentes/ui/dialogo'
import { Boton } from '@/componentes/ui/boton'
import type { Usuario } from '@/tipos'
import { supabase } from '@/servicios/supabase'

type Ficha = {
  dni: string
  fecha_nacimiento: string
  domicilio: string
  contacto_emergencia_nombre: string
  contacto_emergencia_telefono: string
  fecha_ingreso: string
  categoria: string
  tipo_contrato: string
  fecha_fin_contrato: string
  notas_administrativas: string
}

const vacia: Ficha = {
  dni: '', fecha_nacimiento: '', domicilio: '',
  contacto_emergencia_nombre: '', contacto_emergencia_telefono: '',
  fecha_ingreso: '', categoria: '', tipo_contrato: '',
  fecha_fin_contrato: '', notas_administrativas: ''
}

const campos: { key: keyof Ficha; label: string; type?: string }[] = [
  { key: 'dni', label: 'DNI' },
  { key: 'fecha_nacimiento', label: 'Fecha de nacimiento', type: 'date' },
  { key: 'domicilio', label: 'Domicilio' },
  { key: 'contacto_emergencia_nombre', label: 'Nombre del contacto de emergencia' },
  { key: 'contacto_emergencia_telefono', label: 'Teléfono del contacto de emergencia', type: 'tel' },
  { key: 'fecha_ingreso', label: 'Fecha de ingreso', type: 'date' },
  { key: 'categoria', label: 'Categoría laboral' },
  { key: 'tipo_contrato', label: 'Tipo de contrato' },
  { key: 'fecha_fin_contrato', label: 'Fin de contrato', type: 'date' },
]

export const FichaVigilador: React.FC<{
  abierto: boolean
  vigilador: Usuario | null
  alCerrar: () => void
}> = ({ abierto, vigilador, alCerrar }) => {
  const [ficha, setFicha] = useState<Ficha>(vacia)
  const [idVigiladorDb, setIdVigiladorDb] = useState<string | null>(null)
  const [cargando, setCargando] = useState(false)
  const [guardando, setGuardando] = useState(false)
  const [error, setError] = useState('')
  const [mensaje, setMensaje] = useState('')
  const [pestana, setPestana] = useState<'personal' | 'laboral'>('personal')

  useEffect(() => {
    if (!abierto || !vigilador || !supabase) return
    let cancelado = false
    const cargar = async () => {
      setCargando(true)
      setError('')
      setMensaje('')
      setFicha(vacia)
      const consultaRegistro = supabase.from('vigiladores').select('id,id_empresa')
      const { data: registro, error: errorRegistro } = vigilador.id_usuario
        ? await consultaRegistro.eq('id_usuario', vigilador.id_usuario).maybeSingle()
        : await consultaRegistro.eq('id', vigilador.id).maybeSingle()
      if (errorRegistro || !registro) {
        if (!cancelado) setError(errorRegistro?.message || 'No se encontró el registro operativo del vigilador.')
        if (!cancelado) setCargando(false)
        return
      }
      const { data, error: errorFicha } = await supabase
        .from('fichas_vigiladores').select('*').eq('id_vigilador', registro.id).maybeSingle()
      if (cancelado) return
      setIdVigiladorDb(registro.id)
      if (errorFicha) setError(errorFicha.message)
      else if (data) setFicha({
        dni: data.dni || '',
        fecha_nacimiento: data.fecha_nacimiento || '',
        domicilio: data.domicilio || '',
        contacto_emergencia_nombre: data.contacto_emergencia_nombre || '',
        contacto_emergencia_telefono: data.contacto_emergencia_telefono || '',
        fecha_ingreso: data.fecha_ingreso || '',
        categoria: data.categoria || '',
        tipo_contrato: data.tipo_contrato || '',
        fecha_fin_contrato: data.fecha_fin_contrato || '',
        notas_administrativas: data.notas_administrativas || ''
      })
      setCargando(false)
    }
    void cargar()
    return () => { cancelado = true }
  }, [abierto, vigilador?.id, vigilador?.id_usuario])

  const guardar = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!supabase || !vigilador || !idVigiladorDb || !vigilador.id_empresa) {
      setError('No se pudo identificar la empresa y el registro del vigilador.')
      return
    }
    setGuardando(true)
    setError('')
    setMensaje('')
    const payload = {
      id_vigilador: idVigiladorDb,
      id_empresa: vigilador.id_empresa,
      dni: ficha.dni.trim() || null,
      fecha_nacimiento: ficha.fecha_nacimiento || null,
      domicilio: ficha.domicilio.trim() || null,
      contacto_emergencia_nombre: ficha.contacto_emergencia_nombre.trim() || null,
      contacto_emergencia_telefono: ficha.contacto_emergencia_telefono.trim() || null,
      fecha_ingreso: ficha.fecha_ingreso || null,
      categoria: ficha.categoria.trim() || null,
      tipo_contrato: ficha.tipo_contrato.trim() || null,
      fecha_fin_contrato: ficha.fecha_fin_contrato || null,
      notas_administrativas: ficha.notas_administrativas.trim() || null,
      actualizado_en: new Date().toISOString()
    }
    const { error: errorGuardar } = await supabase.from('fichas_vigiladores')
      .upsert(payload, { onConflict: 'id_vigilador' })
    if (errorGuardar) setError(errorGuardar.message)
    else setMensaje('Ficha guardada correctamente.')
    setGuardando(false)
  }

  const cambiar = (key: keyof Ficha, value: string) => setFicha(prev => ({ ...prev, [key]: value }))
  const etiquetaInput = 'mb-1 block text-xs font-semibold text-slate-600 dark:text-slate-300'
  const claseInput = 'w-full min-h-[42px] rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:ring-2 focus:ring-blue-500 dark:border-slate-700 dark:bg-[#0A0F1A] dark:text-slate-100'

  return (
    <Dialogo
      abierto={abierto}
      alCerrar={alCerrar}
      titulo={vigilador ? `Ficha del vigilador: ${vigilador.nombre} ${vigilador.apellido}` : 'Ficha del vigilador'}
      subtitulo="Datos personales y laborales. Acceso reservado a administración."
      icono={<Info className="h-5 w-5 text-blue-500" />}
      tamano="grande"
    >
      <div className="space-y-4">
        <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 p-3 dark:border-slate-800 dark:bg-slate-950/40">
          <div className="flex h-12 w-12 items-center justify-center rounded-full border border-slate-300 bg-white text-slate-500 dark:border-slate-700 dark:bg-slate-900">
            <UserRound className="h-6 w-6" />
          </div>
          <div className="min-w-0">
            <p className="font-bold text-slate-900 dark:text-white">{vigilador?.nombre} {vigilador?.apellido}</p>
            <p className="break-all text-xs text-slate-500">{vigilador?.email || 'Sin correo de acceso'} · Legajo: {(vigilador as Usuario & { legajo?: string | null })?.legajo || 'Sin legajo cargado'}</p>
            <p className="text-xs text-slate-500">{vigilador?.telefono || 'Sin teléfono registrado'}</p>
          </div>
        </div>

        <div className="flex gap-2 border-b border-slate-200 dark:border-slate-800">
          <button type="button" onClick={() => setPestana('personal')} className={`border-b-2 px-3 py-2 text-sm font-semibold ${pestana === 'personal' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500'}`}>Personal</button>
          <button type="button" onClick={() => setPestana('laboral')} className={`border-b-2 px-3 py-2 text-sm font-semibold ${pestana === 'laboral' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500'}`}>Laboral</button>
        </div>

        {cargando ? <div className="flex items-center justify-center gap-2 py-8 text-sm text-slate-500"><LoaderCircle className="h-4 w-4 animate-spin" /> Cargando ficha…</div> : (
          <form onSubmit={guardar} className="space-y-4">
            {pestana === 'personal' ? (
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                {campos.slice(0, 5).map(c => <label key={c.key}><span className={etiquetaInput}>{c.label}</span><input type={c.type || 'text'} value={ficha[c.key]} onChange={e => cambiar(c.key, e.target.value)} className={claseInput} /></label>)}
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                {campos.slice(5).map(c => <label key={c.key}><span className={etiquetaInput}>{c.label}</span><input type={c.type || 'text'} value={ficha[c.key]} onChange={e => cambiar(c.key, e.target.value)} className={claseInput} /></label>)}
                <label className="sm:col-span-2"><span className={etiquetaInput}>Notas administrativas</span><textarea rows={4} value={ficha.notas_administrativas} onChange={e => cambiar('notas_administrativas', e.target.value)} className={claseInput} /></label>
              </div>
            )}
            {error && <p role="alert" className="rounded-lg bg-red-50 p-3 text-sm text-red-700 dark:bg-red-950/30 dark:text-red-300">{error}</p>}
            {mensaje && <p role="status" className="rounded-lg bg-emerald-50 p-3 text-sm text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-300">{mensaje}</p>}
            <div className="flex flex-col-reverse justify-end gap-2 border-t border-slate-200 pt-3 sm:flex-row dark:border-slate-800">
              <Boton type="button" variante="secundario" onClick={alCerrar}>Cerrar</Boton>
              <Boton type="submit" variante="primario" disabled={guardando || !idVigiladorDb}>
                {guardando ? 'Guardando…' : <><Save className="mr-2 inline h-4 w-4" /> Guardar ficha</>}
              </Boton>
            </div>
          </form>
        )}
      </div>
    </Dialogo>
  )
}
