import React,{useState} from 'react'
import {Plus,Edit3,Clock3,Trash2,ShieldAlert} from 'lucide-react'
import {Dialogo} from '@/componentes/ui/dialogo'
import {Boton} from '@/componentes/ui/boton'
import {Entrada} from '@/componentes/ui/entrada'
import {Etiqueta} from '@/componentes/ui/etiqueta'
import {useOperativo} from '@/contextos/contexto-operativo'
import {useAutenticacion} from '@/contextos/contexto-autenticacion'
import type {TipoTurnoPersonalizado} from '@/tipos'

export const GestionTiposTurno:React.FC<{objetivoId:string;alCerrar:()=>void}>=({objetivoId,alCerrar})=>{
 const {usuario}=useAutenticacion(); const {tiposTurno,crearTipoTurno,editarTipoTurno,eliminarTipoTurno}=useOperativo()
 const [editando,setEditando]=useState<TipoTurnoPersonalizado|null>(null); const [modal,setModal]=useState(false)
 const [horas,setHoras]=useState(''); const [tipo,setTipo]=useState<TipoTurnoPersonalizado['tipo']>('especial'); const [inicio,setInicio]=useState(''); const [fin,setFin]=useState(''); const [error,setError]=useState(''); const [confirmando,setConfirmando]=useState<TipoTurnoPersonalizado|null>(null); const [horaInicio,setHoraInicio]=useState('07'); const [minutoInicio,setMinutoInicio]=useState('00')
 const disponibles=tiposTurno.filter(t=>t.id_objetivo===objetivoId||t.id_objetivo===null)
 const calcularFin=(hora:string,h:string)=>{
  if(!hora||!h)return ''
  const cantidad=Number(h); if(!Number.isFinite(cantidad)||cantidad<0)return ''
  const [hh,mm]=hora.split(':').map(Number); if(!Number.isFinite(hh)||!Number.isFinite(mm))return ''
  const minutos=(hh*60+mm+Math.round(cantidad*60))%(24*60)
  return String(Math.floor(minutos/60)).padStart(2,'0')+':'+String(minutos%60).padStart(2,'0')
 }
 const cambiarInicio=(v:string)=>{setInicio(v);setHoraInicio(v.split(':')[0]||'07');setMinutoInicio(v.split(':')[1]||'00');setFin(calcularFin(v,horas))}
 const cambiarHora=(h:string,m:string)=>{const v=h+':'+m;setHoraInicio(h);setMinutoInicio(m);cambiarInicio(v)}
 const cambiarHoras=(v:string)=>{setHoras(v);setFin(calcularFin(inicio,v))}
 const abrir=(t?:TipoTurnoPersonalizado)=>{setEditando(t||null);setHoras(t?String(t.horas):'');setTipo(t?.tipo||'especial');const h=t?.hora_inicio||'07:00';setInicio(h);setHoraInicio(h.split(':')[0]||'07');setMinutoInicio(h.split(':')[1]||'00');setFin(t?.hora_fin||'');setError('');setModal(true)}
 const guardar=async(e:React.FormEvent)=>{
  e.preventDefault();setError('')
  const h=Number(horas)
  if(!Number.isFinite(h)||h<0){setError('Completá una cantidad válida de horas.');return}
  const finCalculado=tipo==='franco'?'':calcularFin(inicio,String(h))
  if(tipo!=='franco'&&!inicio){setError('Indicá la hora de inicio.');return}
  const d={nombre:tipo==='franco'?'Franco':(h+' hs '+(tipo==='diurno'?'Día':tipo==='nocturno'?'Noche':tipo==='mixto'?'Mixto':'Especial')),abreviatura:tipo==='franco'?'F':(h+'h'+tipo.charAt(0).toUpperCase()),horas:h,tipo,hora_inicio:inicio||null,hora_fin:finCalculado||null,color:null,id_objetivo:objetivoId}
  const r=editando?await editarTipoTurno(editando.id,d):await crearTipoTurno(d);if(r){setError(r);return};setModal(false)
 }
 return <Dialogo abierto alCerrar={alCerrar} titulo="Atajos de turnos" subtitulo="Creá una vez cada tipo de guardia y luego asignalo rápidamente desde la grilla." icono={<Clock3 className="w-5 h-5 text-blue-500"/>} tamano="grande">
  <div className="space-y-4">
   <div className="flex items-center justify-between gap-3"><p className="text-xs text-slate-500 dark:text-slate-400">Los atajos pueden ser propios del objetivo o reutilizables en toda la empresa.</p><Boton tamano="chico" variante="primario" onClick={()=>abrir()} icono={<Plus className="w-4 h-4"/>}>Nuevo atajo</Boton></div>
   <div className="space-y-2">{disponibles.length===0?<div className="rounded-xl border border-dashed border-slate-300 dark:border-slate-700 p-6 text-center text-sm text-slate-500">Todavía no hay tipos de turno configurados.</div>:disponibles.map(t=><div key={t.id} className={`flex items-center justify-between gap-3 rounded-xl border border-slate-200 dark:border-slate-800 p-3 ${!t.activo?"opacity-60":""}`}><div><div className="font-bold text-sm text-slate-900 dark:text-white">{t.nombre} <span className="text-blue-500">({t.abreviatura})</span></div><div className="text-[11px] text-slate-500">{t.horas} hs • {t.tipo}{t.hora_inicio&&t.hora_fin?' • '+t.hora_inicio+' → '+t.hora_fin:''}</div></div><div className="flex gap-1 shrink-0"><button type="button" onClick={()=>abrir(t)} className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800" title="Editar"><Edit3 className="w-4 h-4"/></button>{(usuario?.rol==="administrador"||usuario?.rol==="super_administrador")&&<button type="button" onClick={()=>setConfirmando(t)} className="p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/30" title="Eliminar"><Trash2 className="w-4 h-4 text-red-500"/></button>}</div></div>)}</div>
   <Dialogo abierto={!!confirmando} alCerrar={()=>setConfirmando(null)} titulo="Eliminar atajo" subtitulo="Esta acción quitará el atajo de la configuración del objetivo." icono={<ShieldAlert className="w-5 h-5 text-red-500"/>} tamano="medio"><div className="space-y-5"><div className="rounded-xl border border-red-200 dark:border-red-900/50 bg-red-50/60 dark:bg-red-950/20 p-4"><p className="font-semibold text-slate-900 dark:text-white">¿Estás seguro que querés eliminar este atajo?</p><p className="mt-1 text-sm text-slate-600 dark:text-slate-400">{confirmando?.nombre}</p></div><div className="flex flex-col-reverse sm:flex-row justify-end gap-2"><Boton type="button" variante="secundario" onClick={()=>setConfirmando(null)}>Cancelar</Boton><Boton type="button" variante="peligro" onClick={async()=>{if(!confirmando)return;const r=await eliminarTipoTurno(confirmando.id);if(r){setError(r);setConfirmando(null);return}setConfirmando(null)}}>Eliminar</Boton></div></div></Dialogo>
   <div className="flex justify-end pt-2"><Boton variante="secundario" onClick={alCerrar}>Cerrar</Boton></div>
   <Dialogo abierto={modal} alCerrar={()=>setModal(false)} titulo={editando?'Editar atajo':'Crear atajo de turno'} subtitulo="Indicá las horas, el tipo y la hora de inicio. La hora de fin se calcula automáticamente." icono={<Clock3 className="w-5 h-5 text-blue-500"/>} tamano="medio">
    <form onSubmit={guardar} className="space-y-4">
     <div><Etiqueta requerido>Horas</Etiqueta><Entrada type="number" min="0" step="0.25" value={horas} onChange={e=>cambiarHoras(e.target.value)} placeholder="10"/></div>
     <div><Etiqueta requerido>Tipo</Etiqueta><select value={tipo} onChange={e=>setTipo(e.target.value as TipoTurnoPersonalizado['tipo'])} className="w-full min-h-[46px] rounded-xl bg-white dark:bg-[#0A0F1A] border border-slate-300 dark:border-slate-700 px-3 text-sm"><option value="diurno">Diurno</option><option value="nocturno">Nocturno</option><option value="mixto">Mixto</option><option value="especial">Especial</option><option value="franco">Franco</option></select></div>
     <div><Etiqueta requerido>Hora de inicio</Etiqueta><div className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/70 p-4"><div className="flex items-center justify-center gap-3 mb-4"><div className="text-4xl font-bold tracking-tight text-slate-900 dark:text-white">{horaInicio}<span className="text-blue-500">:</span>{minutoInicio}</div><div className="text-xs text-slate-500 dark:text-slate-400">Inicio</div></div><div className="grid grid-cols-2 gap-3"><div><div className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 mb-1">Hora</div><select value={horaInicio} onChange={e=>cambiarHora(e.target.value,minutoInicio)} disabled={tipo==='franco'} className="w-full h-11 rounded-xl bg-white dark:bg-[#0A0F1A] border border-slate-300 dark:border-slate-700 px-3 text-sm font-semibold">{Array.from({length:24},(_,i)=>{const v=String(i).padStart(2,'0');return <option key={v} value={v}>{v} hs</option>})}</select></div><div><div className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 mb-1">Minutos</div><select value={minutoInicio} onChange={e=>cambiarHora(horaInicio,e.target.value)} disabled={tipo==='franco'} className="w-full h-11 rounded-xl bg-white dark:bg-[#0A0F1A] border border-slate-300 dark:border-slate-700 px-3 text-sm font-semibold">{Array.from({length:60},(_,i)=>{const v=String(i).padStart(2,'0');return <option key={v} value={v}>{v} min</option>})}</select></div></div>{tipo!=='franco'&&fin&&<div className="mt-3 rounded-xl bg-blue-50 dark:bg-blue-950/20 border border-blue-100 dark:border-blue-900/40 px-3 py-2 text-center text-xs text-slate-600 dark:text-slate-300">La jornada finalizará automáticamente a las <span className="font-bold text-blue-600 dark:text-blue-400">{fin}</span>.</div>}</div></div>
     
     {error&&<p className="text-xs text-red-500 font-semibold">{error}</p>}
     <div className="flex justify-end gap-2 pt-3 border-t border-slate-200 dark:border-slate-800"><Boton type="button" variante="secundario" onClick={()=>setModal(false)}>Cancelar</Boton><Boton type="submit" variante="primario">Guardar atajo</Boton></div>
    </form>
   </Dialogo>
  </div>
 </Dialogo>
}