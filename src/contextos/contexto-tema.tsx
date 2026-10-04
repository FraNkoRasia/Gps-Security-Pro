import React, { createContext, useContext, useEffect, useState } from 'react'

export type Tema = 'dark' | 'light' | 'system'

interface ContextoTemaTipo {
  tema: Tema
  temaActual: 'dark' | 'light'
  cambiarTema: (nuevoTema: Tema) => void
}

const ContextoTema = createContext<ContextoTemaTipo | undefined>(undefined)

const CLAVE_TEMA = 'gsp_tema_preferencia'

export const ProveedorTema: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [tema, setTema] = useState<Tema>(() => {
    if (typeof window !== 'undefined') {
      const guardado = localStorage.getItem(CLAVE_TEMA) as Tema | null
      if (guardado) return guardado
    }
    // Prioridad por defecto: Tema oscuro según especificación oficial
    return 'dark'
  })

  const [temaActual, setTemaActual] = useState<'dark' | 'light'>('dark')

  useEffect(() => {
    const root = document.documentElement

    const aplicarTema = () => {
      let resolucion: 'dark' | 'light' = 'dark'

      if (tema === 'system') {
        const sistemaOscuro = window.matchMedia('(prefers-color-scheme: dark)').matches
        resolucion = sistemaOscuro ? 'dark' : 'light'
      } else {
        resolucion = tema
      }

      setTemaActual(resolucion)

      if (resolucion === 'dark') {
        root.classList.add('dark')
        root.classList.remove('light')
      } else {
        root.classList.add('light')
        root.classList.remove('dark')
      }
    }

    aplicarTema()
    localStorage.setItem(CLAVE_TEMA, tema)

    if (tema === 'system') {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
      const listener = () => aplicarTema()
      mediaQuery.addEventListener('change', listener)
      return () => mediaQuery.removeEventListener('change', listener)
    }
  }, [tema])

  const cambiarTema = (nuevoTema: Tema) => {
    setTema(nuevoTema)
  }

  return (
    <ContextoTema.Provider value={{ tema, temaActual, cambiarTema }}>
      {children}
    </ContextoTema.Provider>
  )
}

export function useTema(): ContextoTemaTipo {
  const context = useContext(ContextoTema)
  if (!context) {
    throw new Error('useTema debe usarse dentro de ProveedorTema')
  }
  return context
}
