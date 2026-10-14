import React from 'react'
import { ProveedorIdioma } from '@/i18n'
import { ProveedorTema } from '@/contextos/contexto-tema'
import { ProveedorAutenticacion, useAutenticacion } from '@/contextos/contexto-autenticacion'
import { ProveedorOperativo } from '@/contextos/contexto-operativo'
import { DisposicionPrincipal } from '@/componentes/layout/disposicion-principal'
import { VistaInicioSesion } from '@/vistas/inicio-sesion'
import { VistaPanelControl } from '@/vistas/panel-control'
import './App.css'

const ContenidoAplicacion: React.FC = () => {
  const { estaAutenticado, cargando } = useAutenticacion()

  if (cargando) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-8 space-y-4">
        <div className="relative">
          <div className="w-16 h-16 rounded-2xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-blue-500/40 flex items-center justify-center p-2 animate-pulse shadow-xl">
            <img src="/Escudo.png" alt="GSP Logo" className="w-full h-full object-contain" />
          </div>
        </div>
        <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 tracking-wider uppercase animate-pulse">
          Iniciando GSP Security Pro...
        </p>
      </div>
    )
  }

  return (
    <DisposicionPrincipal>
      {estaAutenticado ? <VistaPanelControl /> : <VistaInicioSesion />}
    </DisposicionPrincipal>
  )
}

export function App() {
  return (
    <ProveedorTema>
      <ProveedorIdioma>
        <ProveedorAutenticacion>
          <ProveedorOperativo>
            <ContenidoAplicacion />
          </ProveedorOperativo>
        </ProveedorAutenticacion>
      </ProveedorIdioma>
    </ProveedorTema>
  )
}

export default App
