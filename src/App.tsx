import React from 'react'
import { ProveedorIdioma } from '@/i18n'
import { ProveedorTema } from '@/contextos/contexto-tema'
import { ProveedorAutenticacion, useAutenticacion } from '@/contextos/contexto-autenticacion'
import { ProveedorOperativo } from '@/contextos/contexto-operativo'
import { DisposicionPrincipal } from '@/componentes/layout/disposicion-principal'
import { VistaInicioSesion } from '@/vistas/inicio-sesion'
import { VistaPanelControl } from '@/vistas/panel-control'
import { CambioContrasenaObligatorio } from '@/componentes/autenticacion/cambio-contrasena-obligatorio'
import './App.css'

const ContenidoAplicacion: React.FC = () => {
  const { estaAutenticado, cargando, usuario } = useAutenticacion()

  if (cargando) {
    // Evita una segunda pantalla con un logo distinto mientras se restaura la sesión.
    // El logo principal se muestra una sola vez en la pantalla de acceso.
    return <div className="min-h-screen flex-1 bg-[#080C14]" aria-label="Iniciando GSP Security Pro" />
  }

  // El cambio obligatorio por DNI es exclusivo de los vigiladores.
  return (
    <DisposicionPrincipal>
      {estaAutenticado
        ? usuario?.rol === 'vigilador' && usuario.debe_cambiar_contrasena
          ? <CambioContrasenaObligatorio />
          : <VistaPanelControl />
        : <VistaInicioSesion />}
    </DisposicionPrincipal>
  )
}

const AplicacionConDatosOperativos: React.FC = () => {
  const { estaAutenticado, usuario } = useAutenticacion()

  // No cargar datos operativos mientras un vigilador tenga pendiente el cambio obligatorio.
  const cambioPendienteDeVigilador =
    usuario?.rol === 'vigilador' && usuario.debe_cambiar_contrasena

  if (estaAutenticado && usuario && !cambioPendienteDeVigilador) {
    return (
      <ProveedorOperativo>
        <ContenidoAplicacion />
      </ProveedorOperativo>
    )
  }

  return <ContenidoAplicacion />
}

export function App() {
  return (
    <ProveedorTema>
      <ProveedorIdioma>
        <ProveedorAutenticacion>
          <AplicacionConDatosOperativos />
        </ProveedorAutenticacion>
      </ProveedorIdioma>
    </ProveedorTema>
  )
}

export default App
