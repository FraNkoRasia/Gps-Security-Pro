import React, { useState } from 'react'
import { Encabezado } from './encabezado'
import { PieDePagina } from './pie-de-pagina'
import { VistaAyuda } from '@/vistas/ayuda'
import { VistaTerminos } from '@/vistas/terminos'
import { VistaPrivacidad } from '@/vistas/privacidad'
import { VistaAcercaDe } from '@/vistas/acerca-de'
import { VistaPerfil } from '@/vistas/perfil'

interface PropiedadesDisposicionPrincipal {
  children: React.ReactNode
}

export type SubVista = 'ninguna' | 'ayuda' | 'terminos' | 'privacidad' | 'acercaDe' | 'perfil'

export const DisposicionPrincipal: React.FC<PropiedadesDisposicionPrincipal> = ({ children }) => {
  const [subVista, setSubVista] = useState<SubVista>('ninguna')

  return (
    <div className="min-h-screen flex flex-col bg-[#F4F7FC] dark:bg-[#070B12] text-slate-900 dark:text-slate-100 overflow-x-hidden selection:bg-blue-600 selection:text-white transition-colors duration-200">
      {/* Encabezado Principal */}
      <Encabezado
        alIrAInicio={() => setSubVista('ninguna')}
        alAbrirPerfil={() => setSubVista('perfil')}
      />

      {/* Contenido Principal con soporte desde 320px */}
      <main className="flex-1 flex flex-col w-full max-w-7xl mx-auto px-3 sm:px-6 py-4 sm:py-8">
        {subVista === 'perfil' ? <VistaPerfil /> : children}
      </main>

      {/* Pie de Página Global */}
      <PieDePagina alNavegar={(vista) => setSubVista(vista)} />

      {/* Modales informativos de Ayuda, Términos, Privacidad, Acerca de */}
      <VistaAyuda
        abierto={subVista === 'ayuda'}
        alCerrar={() => setSubVista('ninguna')}
      />
      <VistaTerminos
        abierto={subVista === 'terminos'}
        alCerrar={() => setSubVista('ninguna')}
      />
      <VistaPrivacidad
        abierto={subVista === 'privacidad'}
        alCerrar={() => setSubVista('ninguna')}
      />
      <VistaAcercaDe
        abierto={subVista === 'acercaDe'}
        alCerrar={() => setSubVista('ninguna')}
      />
    </div>
  )
}
