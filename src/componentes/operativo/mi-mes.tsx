import React from 'react'
import { Sun, Moon } from 'lucide-react'
import { Tarjeta, TarjetaContenido } from '@/componentes/ui/tarjeta'
import { Insignia } from '@/componentes/ui/insignia'
import { useOperativo } from '@/contextos/contexto-operativo'
import { useAutenticacion } from '@/contextos/contexto-autenticacion'

export const MiMes: React.FC = () => {
  const { turnos } = useOperativo()
  const { usuario } = useAutenticacion()

  const idVig = usuario?.id || 'usr-vig-01'
  const mesActual = '2026-10'

  // Turnos del mes para este vigilador
  const turnosMes = turnos.filter(
    (t) => t.id_vigilador === idVig && t.fecha.startsWith(mesActual)
  )

  const horasTotales = turnosMes.reduce((acc, t) => acc + t.horas_totales + t.horas_extra, 0)
  const horasDiurnas = turnosMes.reduce((acc, t) => acc + t.horas_diurnas, 0)
  const horasNocturnas = turnosMes.reduce((acc, t) => acc + t.horas_nocturnas, 0)
  const horasDomingos = turnosMes
    .filter((t) => t.es_domingo)
    .reduce((acc, t) => acc + t.horas_totales, 0)
  const horasFeriados = turnosMes
    .filter((t) => t.es_feriado)
    .reduce((acc, t) => acc + t.horas_totales, 0)
  const horasExtra = turnosMes.reduce((acc, t) => acc + t.horas_extra, 0)
  const francos = turnosMes.filter((t) => t.tipo === 'franco').length
  const diasTrabajados = turnosMes.filter((t) => t.horas_totales > 0).length

  const metaHoras = 204
  const porcentajeCumplimiento = Math.min(100, Math.round((horasTotales / metaHoras) * 100))

  let estadoCumplimiento: 'verde' | 'amarillo' | 'rojo' = 'amarillo'
  if (horasTotales >= metaHoras && horasTotales <= 220) {
    estadoCumplimiento = 'verde'
  } else if (horasTotales > 220) {
    estadoCumplimiento = 'rojo'
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-xl font-black text-slate-900 dark:text-white font-['Outfit']">
            Mi Mes — Octubre 2026
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Cálculo consolidado de horas de servicio, nocturnidad y objetivo laboral (Sección 34).
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Insignia
            variante={
              estadoCumplimiento === 'verde'
                ? 'verde'
                : estadoCumplimiento === 'rojo'
                ? 'rojo'
                : 'dorado'
            }
          >
            {estadoCumplimiento === 'verde'
              ? 'Objetivo Cumplido (204 hs)'
              : estadoCumplimiento === 'rojo'
              ? 'Exceso de Carga'
              : 'En Progreso hacia Meta'}
          </Insignia>
        </div>
      </div>

      {/* Tarjeta de Progreso Principal hacia 204 hs */}
      <Tarjeta className="border-blue-500/30">
        <TarjetaContenido className="p-6 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <span className="text-xs text-slate-500 dark:text-slate-400 font-semibold uppercase tracking-wider">
                Horas Acumuladas en el Mes
              </span>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white">
                  {horasTotales} hs
                </span>
                <span className="text-sm font-bold text-slate-500">/ {metaHoras} hs objetivo</span>
              </div>
            </div>

            <div className="text-right">
              <span className="text-2xl font-black text-blue-600 dark:text-blue-400">
                {porcentajeCumplimiento}%
              </span>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {horasTotales >= metaHoras
                  ? 'Objetivo mensual alcanzado'
                  : `Faltan ${metaHoras - horasTotales} hs para cumplir la meta`}
              </p>
            </div>
          </div>

          <div className="w-full bg-slate-200 dark:bg-slate-800 h-3 rounded-full overflow-hidden p-0.5">
            <div
              className="bg-gradient-to-r from-blue-600 via-blue-500 to-cyan-400 h-full rounded-full transition-all duration-500"
              style={{ width: `${porcentajeCumplimiento}%` }}
            />
          </div>
        </TarjetaContenido>
      </Tarjeta>

      {/* Grid de Métricas Detalladas (Sección 34) */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Tarjeta>
          <TarjetaContenido className="p-4 text-center">
            <span className="text-slate-500 dark:text-slate-400 text-xs block">Días Trabajados</span>
            <span className="text-2xl font-black text-slate-900 dark:text-white mt-1 block">
              {diasTrabajados}
            </span>
          </TarjetaContenido>
        </Tarjeta>

        <Tarjeta>
          <TarjetaContenido className="p-4 text-center">
            <span className="text-slate-500 dark:text-slate-400 text-xs block">Francos de Guardia</span>
            <span className="text-2xl font-black text-slate-900 dark:text-white mt-1 block">
              {francos}
            </span>
          </TarjetaContenido>
        </Tarjeta>

        <Tarjeta>
          <TarjetaContenido className="p-4 text-center">
            <span className="text-slate-500 dark:text-slate-400 text-xs block flex items-center justify-center gap-1">
              <Sun className="w-3.5 h-3.5 text-amber-500" /> Diurnas
            </span>
            <span className="text-2xl font-black text-amber-600 dark:text-amber-400 mt-1 block">
              {horasDiurnas} hs
            </span>
          </TarjetaContenido>
        </Tarjeta>

        <Tarjeta>
          <TarjetaContenido className="p-4 text-center">
            <span className="text-slate-500 dark:text-slate-400 text-xs block flex items-center justify-center gap-1">
              <Moon className="w-3.5 h-3.5 text-blue-500" /> Nocturnas
            </span>
            <span className="text-2xl font-black text-blue-600 dark:text-blue-400 mt-1 block">
              {horasNocturnas} hs
            </span>
          </TarjetaContenido>
        </Tarjeta>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <Tarjeta>
          <TarjetaContenido className="p-4">
            <span className="text-slate-500 dark:text-slate-400 text-xs block">Domingos Trabajados</span>
            <span className="text-xl font-bold text-slate-900 dark:text-white mt-1 block">
              {horasDomingos} hs
            </span>
            <p className="text-[10px] text-slate-400 mt-0.5">Computan recargo dominical</p>
          </TarjetaContenido>
        </Tarjeta>

        <Tarjeta>
          <TarjetaContenido className="p-4">
            <span className="text-slate-500 dark:text-slate-400 text-xs block">Feriados Trabajados</span>
            <span className="text-xl font-bold text-slate-900 dark:text-white mt-1 block">
              {horasFeriados} hs
            </span>
            <p className="text-[10px] text-slate-400 mt-0.5">12 Octubre (Día del Respeto)</p>
          </TarjetaContenido>
        </Tarjeta>

        <Tarjeta>
          <TarjetaContenido className="p-4">
            <span className="text-slate-500 dark:text-slate-400 text-xs block">Horas Extra</span>
            <span className="text-xl font-bold text-emerald-600 dark:text-emerald-400 mt-1 block">
              {horasExtra} hs
            </span>
            <p className="text-[10px] text-slate-400 mt-0.5">Excedentes autorizados</p>
          </TarjetaContenido>
        </Tarjeta>
      </div>
    </div>
  )
}
