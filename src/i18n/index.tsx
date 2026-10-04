import React, { createContext, useContext, useState, useEffect } from 'react'
import { traduccionesEs, type TipoTraducciones } from './es'
import { traduccionesEn } from './en'

export type Idioma = 'es' | 'en'

interface ContextoI18nTipo {
  idioma: Idioma
  cambiarIdioma: (nuevoIdioma: Idioma) => void
  t: TipoTraducciones
}

const ContextoI18n = createContext<ContextoI18nTipo | undefined>(undefined)

const CLAVE_ALMACENAMIENTO_IDIOMA = 'gsp_seguridad_idioma'

export const ProveedorIdioma: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [idioma, setIdioma] = useState<Idioma>(() => {
    if (typeof window !== 'undefined') {
      const guardado = localStorage.getItem(CLAVE_ALMACENAMIENTO_IDIOMA) as Idioma | null
      if (guardado === 'es' || guardado === 'en') {
        return guardado
      }
      const navLang = navigator.language.toLowerCase()
      if (navLang.startsWith('en')) {
        return 'en'
      }
    }
    return 'es'
  })

  useEffect(() => {
    localStorage.setItem(CLAVE_ALMACENAMIENTO_IDIOMA, idioma)
    document.documentElement.lang = idioma
  }, [idioma])

  const cambiarIdioma = (nuevoIdioma: Idioma) => {
    setIdioma(nuevoIdioma)
  }

  const t = idioma === 'en' ? traduccionesEn : traduccionesEs

  return (
    <ContextoI18n.Provider value={{ idioma, cambiarIdioma, t }}>
      {children}
    </ContextoI18n.Provider>
  )
}

export function useTraduccion(): ContextoI18nTipo {
  const context = useContext(ContextoI18n)
  if (!context) {
    throw new Error('useTraduccion debe ser utilizado dentro de un ProveedorIdioma')
  }
  return context
}
