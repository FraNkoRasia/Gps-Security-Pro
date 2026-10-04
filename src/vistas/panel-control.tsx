import React from 'react'
import {
  Shield,
  Building2,
  Users,
  MapPin,
  Calendar,
  BookOpen,
  CheckCircle,
  Sparkles,
  Clock
} from 'lucide-react'
import { Tarjeta, TarjetaContenido, TarjetaEncabezado, TarjetaTitulo } from '@/componentes/ui/tarjeta'
import { Insignia } from '@/componentes/ui/insignia'
import { Boton } from '@/componentes/ui/boton'
import { useAutenticacion } from '@/contextos/contexto-autenticacion'
import { useTraduccion } from '@/i18n'

export const VistaPanelControl: React.FC = () => {
  const { usuario, cerrarSesion, cambiarRolSimulado } = useAutenticacion()
  const { t } = useTraduccion()

  if (!usuario) return null

  const esSuperAdmin = usuario.rol === 'super_administrador'
  const esAdmin = usuario.rol === 'administrador'
  const esVigilador = usuario.rol === 'vigilador'

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Banner de Bienvenida y Rol Activo */}
      <div className="p-5 sm:p-7 rounded-2xl bg-gradient-to-r from-slate-900 via-blue-950/40 to-slate-900 border border-slate-800 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-blue-900/60 border border-blue-600/50 flex items-center justify-center p-2 text-blue-400 shadow-lg shrink-0">
            <Shield className="w-8 h-8" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-xl sm:text-2xl font-black text-white font-['Outfit']">
                Bienvenido, {usuario.nombre} {usuario.apellido}
              </h2>
              <Insignia
                variante={
                  esSuperAdmin
                    ? 'dorado'
                    : esAdmin
                    ? 'azul'
                    : 'verde'
                }
              >
                {esSuperAdmin
                  ? t.roles.superAdmin
                  : esAdmin
                  ? t.roles.admin
                  : t.roles.vigilador}
              </Insignia>
            </div>
            <p className="text-xs text-slate-400 mt-1 flex items-center gap-2">
              <span className="font-mono text-blue-300">{usuario.email}</span>
              <span>•</span>
              <span className="text-slate-300 font-medium">
                {usuario.empresa_nombre || 'Plataforma Global'}
              </span>
            </p>
          </div>
        </div>

        {/* Acciones de rol */}
        <div className="flex items-center gap-2 w-full md:w-auto justify-end">
          <Boton
            variante="secundario"
            tamano="chico"
            onClick={() => cerrarSesion()}
          >
            {t.navegacion.cerrarSesion}
          </Boton>
        </div>
      </div>

      {/* Switcher de Roles para Evaluación Rápida en Etapa 0 */}
      <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
        <span className="text-slate-400 flex items-center gap-1.5 font-medium">
          <Sparkles className="w-4 h-4 text-amber-400" />
          Probar vista operativa según perfil:
        </span>
        <div className="flex items-center gap-2 flex-wrap">
          <button
            type="button"
            onClick={() => cambiarRolSimulado?.('super_administrador')}
            className={`px-3 py-1 rounded-lg font-semibold transition-all cursor-pointer ${
              esSuperAdmin ? 'bg-amber-600 text-white' : 'bg-slate-900 text-slate-400 hover:text-white'
            }`}
          >
            Super-Admin
          </button>
          <button
            type="button"
            onClick={() => cambiarRolSimulado?.('administrador')}
            className={`px-3 py-1 rounded-lg font-semibold transition-all cursor-pointer ${
              esAdmin ? 'bg-blue-600 text-white' : 'bg-slate-900 text-slate-400 hover:text-white'
            }`}
          >
            Administrador
          </button>
          <button
            type="button"
            onClick={() => cambiarRolSimulado?.('vigilador')}
            className={`px-3 py-1 rounded-lg font-semibold transition-all cursor-pointer ${
              esVigilador ? 'bg-emerald-600 text-white' : 'bg-slate-900 text-slate-400 hover:text-white'
            }`}
          >
            Vigilador
          </button>
        </div>
      </div>

      {/* Vista Específica de Super-Admin */}
      {esSuperAdmin && (
        <div className="space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Tarjeta>
              <TarjetaContenido className="p-5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                    Empresas Activas
                  </span>
                  <Building2 className="w-5 h-5 text-amber-400" />
                </div>
                <div className="text-2xl font-black text-white mt-2">12</div>
                <p className="text-[11px] text-emerald-400 mt-1">+2 nuevas este mes</p>
              </TarjetaContenido>
            </Tarjeta>

            <Tarjeta>
              <TarjetaContenido className="p-5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                    Objetivos Totales
                  </span>
                  <MapPin className="w-5 h-5 text-blue-400" />
                </div>
                <div className="text-2xl font-black text-white mt-2">48</div>
                <p className="text-[11px] text-slate-400 mt-1">En Río Cuarto y Córdoba</p>
              </TarjetaContenido>
            </Tarjeta>

            <Tarjeta>
              <TarjetaContenido className="p-5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                    Vigiladores Activos
                  </span>
                  <Users className="w-5 h-5 text-emerald-400" />
                </div>
                <div className="text-2xl font-black text-white mt-2">142</div>
                <p className="text-[11px] text-slate-400 mt-1">Con asignación vigente</p>
              </TarjetaContenido>
            </Tarjeta>

            <Tarjeta>
              <TarjetaContenido className="p-5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                    Seguridad & RLS
                  </span>
                  <Shield className="w-5 h-5 text-purple-400" />
                </div>
                <div className="text-2xl font-black text-emerald-400 mt-2">Activo</div>
                <p className="text-[11px] text-slate-400 mt-1">Aislamiento por empresa OK</p>
              </TarjetaContenido>
            </Tarjeta>
          </div>

          <Tarjeta>
            <TarjetaEncabezado>
              <TarjetaTitulo>Gestión Global de Empresas (Super-Administrador)</TarjetaTitulo>
            </TarjetaEncabezado>
            <TarjetaContenido>
              <div className="divide-y divide-slate-800">
                <div className="py-3 flex items-center justify-between gap-4">
                  <div>
                    <h4 className="text-sm font-bold text-white">Wall Security</h4>
                    <p className="text-xs text-slate-400">CUIT: 30-71458921-9 • 3 objetivos • 24 vigiladores</p>
                  </div>
                  <Insignia variante="verde">Operativa</Insignia>
                </div>
                <div className="py-3 flex items-center justify-between gap-4">
                  <div>
                    <h4 className="text-sm font-bold text-white">Vigilancia Centro SRL</h4>
                    <p className="text-xs text-slate-400">CUIT: 30-68912344-2 • 5 objetivos • 38 vigiladores</p>
                  </div>
                  <Insignia variante="verde">Operativa</Insignia>
                </div>
              </div>
            </TarjetaContenido>
          </Tarjeta>
        </div>
      )}

      {/* Vista Específica de Administrador de Empresa */}
      {esAdmin && (
        <div className="space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Tarjeta>
              <TarjetaContenido className="p-5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                    Objetivos de Wall Security
                  </span>
                  <MapPin className="w-5 h-5 text-blue-400" />
                </div>
                <div className="text-2xl font-black text-white mt-2">3</div>
                <p className="text-[11px] text-slate-400 mt-1">MercadoLibre, ChangoMás, Banco Nación</p>
              </TarjetaContenido>
            </Tarjeta>

            <Tarjeta>
              <TarjetaContenido className="p-5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                    Horas Mensuales Objetivo
                  </span>
                  <Clock className="w-5 h-5 text-amber-400" />
                </div>
                <div className="text-2xl font-black text-amber-400 mt-2">204 hs</div>
                <p className="text-[11px] text-slate-400 mt-1">Meta mensual por vigilador</p>
              </TarjetaContenido>
            </Tarjeta>

            <Tarjeta>
              <TarjetaContenido className="p-5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                    Novedades de Hoy
                  </span>
                  <BookOpen className="w-5 h-5 text-emerald-400" />
                </div>
                <div className="text-2xl font-black text-white mt-2">7</div>
                <p className="text-[11px] text-emerald-400 mt-1">Sin incidentes graves</p>
              </TarjetaContenido>
            </Tarjeta>
          </div>

          <Tarjeta>
            <TarjetaEncabezado>
              <TarjetaTitulo>Objetivos Asignados — Wall Security</TarjetaTitulo>
            </TarjetaEncabezado>
            <TarjetaContenido>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800">
                  <h4 className="text-sm font-bold text-white">MercadoLibre Río Cuarto</h4>
                  <p className="text-xs text-slate-400 mt-1">Parque Industrial • Cobertura 24/7</p>
                  <div className="mt-3 flex items-center justify-between text-xs text-slate-300">
                    <span>Personal: 8 vig.</span>
                    <Insignia variante="verde">Cubierto</Insignia>
                  </div>
                </div>
                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800">
                  <h4 className="text-sm font-bold text-white">ChangoMás Río Cuarto</h4>
                  <p className="text-xs text-slate-400 mt-1">Av. Sabattini • Cobertura Diurna/Nocturna</p>
                  <div className="mt-3 flex items-center justify-between text-xs text-slate-300">
                    <span>Personal: 6 vig.</span>
                    <Insignia variante="verde">Cubierto</Insignia>
                  </div>
                </div>
                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800">
                  <h4 className="text-sm font-bold text-white">Banco Nación Río Cuarto</h4>
                  <p className="text-xs text-slate-400 mt-1">Centro • Cobertura bancaria + cajeros</p>
                  <div className="mt-3 flex items-center justify-between text-xs text-slate-300">
                    <span>Personal: 10 vig.</span>
                    <Insignia variante="verde">Cubierto</Insignia>
                  </div>
                </div>
              </div>
            </TarjetaContenido>
          </Tarjeta>
        </div>
      )}

      {/* Vista Específica de Vigilador (Mi Turno y Mi Mes) */}
      {esVigilador && (
        <div className="space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Tarjeta className="border-blue-900/50 bg-gradient-to-br from-slate-900 to-blue-950/30">
              <TarjetaEncabezado>
                <div className="flex items-center justify-between">
                  <TarjetaTitulo className="flex items-center gap-2">
                    <Clock className="w-5 h-5 text-blue-400" />
                    Mi Turno Actual
                  </TarjetaTitulo>
                  <Insignia variante="verde">En servicio</Insignia>
                </div>
              </TarjetaEncabezado>
              <TarjetaContenido className="space-y-3">
                <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800">
                  <div className="text-xs text-slate-400">Objetivo Asignado:</div>
                  <div className="text-base font-bold text-white">MercadoLibre Río Cuarto</div>
                  <div className="text-xs text-slate-400 mt-0.5">Puesto 1 — Control de Acceso Principal</div>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="p-3 rounded-lg bg-slate-950 border border-slate-800">
                    <span className="text-slate-400 block">Horario:</span>
                    <span className="font-bold text-white">19:00 → 07:00</span>
                    <span className="text-[10px] text-amber-400 block mt-0.5">12🌙 Nocturno</span>
                  </div>
                  <div className="p-3 rounded-lg bg-slate-950 border border-slate-800">
                    <span className="text-slate-400 block">Supervisor:</span>
                    <span className="font-bold text-white">Carlos Méndez</span>
                    <span className="text-[10px] text-slate-400 block mt-0.5">Móvil 04</span>
                  </div>
                </div>

                <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 text-xs text-slate-300">
                  <span className="text-slate-400 block mb-1">Elementos a cargo:</span>
                  <span>Handy Motorola VHF #12, Linterna LED táctica, Libro de Novedades Tomo IV, Llaves de portón este.</span>
                </div>
              </TarjetaContenido>
            </Tarjeta>

            <Tarjeta>
              <TarjetaEncabezado>
                <div className="flex items-center justify-between">
                  <TarjetaTitulo className="flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-amber-400" />
                    Mi Mes (Octubre 2026)
                  </TarjetaTitulo>
                  <Insignia variante="dorado">Meta: 204 hs</Insignia>
                </div>
              </TarjetaEncabezado>
              <TarjetaContenido className="space-y-3">
                <div className="grid grid-cols-3 gap-2 text-center text-xs">
                  <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                    <span className="text-slate-400 block text-[11px]">Horas Totales</span>
                    <span className="text-xl font-black text-emerald-400">144 hs</span>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                    <span className="text-slate-400 block text-[11px]">Nocturnidad</span>
                    <span className="text-xl font-black text-blue-400">72 hs</span>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                    <span className="text-slate-400 block text-[11px]">Francos</span>
                    <span className="text-xl font-black text-white">4</span>
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 space-y-1.5 text-xs">
                  <div className="flex justify-between text-slate-300">
                    <span>Progreso hacia objetivo mensual (204 hs):</span>
                    <span className="font-bold text-amber-400">70.5%</span>
                  </div>
                  <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                    <div className="bg-gradient-to-r from-blue-500 to-amber-500 h-full w-[70.5%] rounded-full" />
                  </div>
                  <p className="text-[10px] text-slate-400 text-right">Faltan 60 hs para cumplir objetivo</p>
                </div>
              </TarjetaContenido>
            </Tarjeta>
          </div>
        </div>
      )}

      {/* Nota de Etapa 0 completada y preparación para Etapa 1 */}
      <div className="p-4 rounded-xl bg-slate-900/50 border border-slate-800/80 text-xs text-slate-400 flex items-start gap-3">
        <CheckCircle className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
        <div>
          <p className="font-semibold text-slate-200">
            ETAPA 0 — FUNDACIÓN lista y validada
          </p>
          <p className="text-slate-400 mt-0.5">
            Arquitectura base con React, Vite, TypeScript, Tailwind v4, shadcn/ui, Supabase client, PWA install prompt, Zod, i18n español/inglés, tema oscuro y responsive desde 320px preparada para la implementación de autenticación backend completa y base de datos relacional en la Etapa 1.
          </p>
        </div>
      </div>
    </div>
  )
}
