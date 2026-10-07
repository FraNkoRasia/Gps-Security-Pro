import React,{useState} from 'react'
import {Plus,Edit3,Power,Clock3,Trash2} from 'lucide-react'
import {Dialogo} from '@/componentes/ui/dialogo'
import {Boton} from '@/componentes/ui/boton'
import {Entrada} from '@/componentes/ui/entrada'
import {Etiqueta} from '@/componentes/ui/etiqueta'
import {useOperativo} from '@/contextos/contexto-operativo'
import type {TipoTurnoPersonalizado} from '@/tipos'

export const GestionTiposTurno:React.FC<{objetivoId:string;alCerrar:()=>void}>=({objetivoId,alCerrar})=>{
 const {tiposTurno,crearTipoTurno,editarTipoTurno,cambiarEstadoTipoTurno,eliminarTipoTurno}=useOperativo()
 const [editando,setEditando]=useState<TipoTurnoPersonalizado|null>(null); const [modal,setModal]=useState(false)
 const [horas,setHoras]=useState(''); const [tipo,setTipo]=useState<TipoTurnoPersonalizado['tipo']>('especial'); const [inicio,setInicio]=useState(''); const [fin,setFin]=useState(''); const [error,setError]=useState('')
 const disponibles=tiposTurno.filter(t=>t.id_objetivo===objetivoId||t.id_objetivo===null)
 const calcularFin=(hora:string,h:string)=>{
  if(!hora||!h)return ''
  const cantidad=Number(h); if(!Number.isFinite(cantidad)||cantidad<0)return ''
  const [hh,mm]=hora.split(':').map(Number); if(!Number.isFinite(hh)||!Number.isFinite(mm))return ''
  const minutos=(hh*60+mm+Math.round(cantidad*60))%(24*60)
  return String(Math.floor(minutos/60)).padStart(2,'0')+':'+String(minutos%60).padStart(2,'0')
 }
 const cambiarInicio=(v:string)=>{setInicio(v);setFin(calcularFin(v,horas))}
 const cambiarHoras=(v:string)=>{setHoras(v);setFin(calcularFin(inicio,v))}
 const abrir=(t?:TipoTurnoPersonalizado)=>{setEditando(t||null);setHoras(t?String(t.horas):'');setTipo(t?.tipo||'especial');setInicio(t?.hora_inicio||'');setFin(t?.hora_fin||'');setError('');setModal(true)}
 const guardar=async(e:React.FormEvent)=>{
  e.preventDefault();setError('')
  const h=Number(horas)
  if(!Number.isFinite(h)||h<0){setError('Completá una cantidad válida de horas.');return}
  const finCalculado=tipo==='franco'?'':calcularFin(inicio,String(h))
  if(tipo!=='franco'&&!inicio){setError('Indicá la hora de inicio.');return}
  const d={nombre:tipo==='franco'?'Franco':(h+' '+(tipo==='diurno'?'Sol':tipo==='nocturno'?'Luna':tipo==='mixto'?'Mixto':'Especial')),abreviatura:tipo==='franco'?'F':(h+(tipo==='diurno'?'☀️':tipo==='nocturno'?'🌙':tipo==='mixto'?'M':'E')),horas:h,tipo,hora_inicio:inicio||null,hora_fin:finCalculado||null,color:null,id_objetivo:objetivoId}
  const r=editando?await editarTipoTurno(editando.id,d):await crearTipoTurno(d);if(r){setError(r);return};setModal(false)
 }
 return <Dialogo abierto alCerrar={alCerrar} titulo="Atajos de turnos" subtitulo="Creá una vez cada tipo de guardia y luego asignalo rápidamente desde la grilla." icono={<Clock3 className="w-5 h-5 text-blue-500"/>} tamano="grande">
  <div className="space-y-4">
   <div className="flex items-center justify-between gap-3"><p className="text-xs text-slate-500 dark:text-slate-400">Los atajos pueden ser propios del objetivo o reutilizables en toda la empresa.</p><Boton tamano="chico" variante="primario" onClick={()=>abrir()} icono={<Plus className="w-4 h-4"/>}>Nuevo atajo</Boton></div>
   <div className="space-y-2">{disponibles.length===0?<div className="rounded-xl border border-dashed border-slate-300 dark:border-slate-700 p-6 text-center text-sm text-slate-500">Todavía no hay tipos de turno configurados.</div>:disponibles.map(t=><div key={t.id} className={`flex items-center justify-between gap-3 rounded-xl border border-slate-200 dark:border-slate-800 p-3 ${!t.activo?"opacity-60":""}`}><div><div className="font-bold text-sm text-slate-900 dark:text-white">{t.nombre} <span className="text-blue-500">({t.abreviatura})</span></div><div className="text-[11px] text-slate-500">{t.horas} hs • {t.tipo}{t.hora_inicio&&t.hora_fin?' • '+t.hora_inicio+' → '+t.hora_fin:''}</div></div><div className="flex gap-1"><button type="button" onClick={()=>abrir(t)} className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800" title="Editar"><Edit3 className="w-4 h-4"/></button><button type="button" onClick={()=>void cambiarEstadoTipoTurno(t.id,!t.activo)} className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800" title={t.activo?"Desactivar":"Activar"}><Power className={`w-4 h-4 ${t.activo?"text-emerald-500":"text-slate-400"}`}/></button><button type="button" onClick={()=>{if(window.confirm('¿Eliminar este atajo de turno?'))void eliminarTipoTurno(t.id)}} className="p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/30" title="Eliminar"><Trash2 className="w-4 h-4 text-red-500"/></button></div></div>)}</div>
   <div className="flex justify-end pt-2"><Boton variante="secundario" onClick={alCerrar}>Cerrar</Boton></div>
   <Dialogo abierto={modal} alCerrar={()=>setModal(false)} titulo={editando?'Editar atajo':'Crear atajo de turno'} subtitulo="Indicá las horas, el tipo y la hora de inicio. La hora de fin se calcula automáticamente." icono={<Clock3 className="w-5 h-5 text-blue-500"/>} tamano="medio">
    <form onSubmit={guardar} className="space-y-4">
     <div><Etiqueta requerido>Horas</Etiqueta><Entrada type="number" min="0" step="0.25" value={horas} onChange={e=>cambiarHoras(e.target.value)} placeholder="10"/></div>
     <div><Etiqueta requerido>Tipo</Etiqueta><select value={tipo} onChange={e=>setTipo(e.target.value as TipoTurnoPersonalizado['tipo'])} className="w-full min-h-[46px] rounded-xl bg-white dark:bg-[#0A0F1A] border border-slate-300 dark:border-slate-700 px-3 text-sm"><option value="diurno">Diurno</option><option value="nocturno">Nocturno</option><option value="mixto">Mixto</option><option value="especial">Especial</option><option value="franco">Franco</option></select></div>
     <div className="grid grid-cols-2 gap-3"><div><Etiqueta requerido>Hora inicio</Etiqueta><Entrada type="time" value={inicio} onChange={e=>cambiarInicio(e.target.value)} disabled={tipo==='franco'}/></div><div><Etiqueta>Hora fin</Etiqueta><Entrada type="time" value={fin} readOnly disabled={tipo==='franco'}/></div></div>
     {tipo!=='franco'&&inicio&&horas&&<p className="text-xs text-slate-500 dark:text-slate-400">Finaliza automáticamente a las <span className="font-bold text-slate-700 dark:text-slate-200">{fin}</span>.</p>}
     {error&&<p className="text-xs text-red-500 font-semibold">{error}</p>}
     <div className="flex justify-end gap-2 pt-3 border-t border-slate-200 dark:border-slate-800"><Boton type="button" variante="secundario" onClick={()=>setModal(false)}>Cancelar</Boton><Boton type="submit" variante="primario">Guardar atajo</Boton></div>
    </form>
   </Dialogo>
  </div>
 </Dialogo>
}