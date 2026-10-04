import React from 'react'
import { Shield, Award, Cpu, CheckCircle2 } from 'lucide-react'
import { Dialogo } from '@/componentes/ui/dialogo'
import { Insignia } from '@/componentes/ui/insignia'
import { superAdminInicial } from '@/servicios/supabase'

interface PropiedadesVistaAcercaDe {
  abierto: boolean
  alCerrar: () => void
}

export const VistaAcercaDe: React.FC<PropiedadesVistaAcercaDe> = ({ abierto, alCerrar }) => {
  return (
    <Dialogo
      abierto={abierto}
      alCerrar={alCerrar}
      titulo="Acerca de GSP Security Pro"
      subtitulo="Plataforma tecnológica para la gestión profesional de empresas de seguridad y vigilancia."
      icono={<Shield className="w-5 h-5 text-amber-400" />}
      tamano="medio"
    >
      <div className="space-y-5 text-center">
        {/* Emblema Central */}
        <div className="flex flex-col items-center justify-center pt-2">
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-blue-900/60 to-slate-950 border-2 border-amber-500/60 p-2 shadow-2xl flex items-center justify-center glow-amber mb-3">
            <img src="/logo-gsp.svg" alt="GSP Logo" className="w-full h-full object-contain" />
          </div>
          <h3 className="text-2xl font-black text-white font-['Outfit'] tracking-tight">
            GSP Security Pro
          </h3>
          <p className="text-sm font-semibold text-blue-400">
            Gestión de Seguridad Profesional
          </p>
          <div className="mt-2 flex items-center gap-2">
            <Insignia variante="dorado">Versión 1.0 — Fundación</Insignia>
            <Insignia variante="azul">PWA + Web</Insignia>
          </div>
        </div>

        {/* Desarrollador Oficial (Sección 3 y 16) */}
        <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 text-left space-y-2">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-amber-400">
            <Award className="w-4 h-4" />
            <span>Créditos de Desarrollo</span>
          </div>
          <p className="text-sm font-semibold text-slate-100">
            Desarrollado por <span className="text-amber-400 font-bold">FraNko Rasia</span>
          </p>
          <p className="text-xs text-slate-400">
            Super-Administrador inicial:{' '}
            <span className="font-mono text-blue-300">{superAdminInicial}</span>
          </p>
        </div>

        {/* Stack Tecnológico */}
        <div className="p-4 rounded-xl bg-slate-950/50 border border-slate-800 text-left space-y-2.5">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-blue-400">
            <Cpu className="w-4 h-4" />
            <span>Arquitectura y Tecnologías</span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-[11px] text-slate-300">
            <div className="flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> React + Vite</div>
            <div className="flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> TypeScript</div>
            <div className="flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> Tailwind CSS</div>
            <div className="flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> shadcn/ui</div>
            <div className="flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> Supabase + Auth</div>
            <div className="flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> PostgreSQL + RLS</div>
            <div className="flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> PWA Service Worker</div>
            <div className="flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> Zod Validation</div>
            <div className="flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> pnpm 10</div>
          </div>
        </div>

        <p className="text-[11px] text-slate-500 pt-1">
          GSP Security Pro — Construido para una gestión de seguridad confiable, escalable y sin fisuras operativas.
        </p>
      </div>
    </Dialogo>
  )
}
