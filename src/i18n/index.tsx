import React, { createContext, useContext, useState, useEffect } from 'react'
import { traduccionesEs, type TipoTraducciones } from './es'
import { traduccionesEn } from './en'
import { traducirTextoInterfaz, traducirAtributoInterfaz } from './diccionario-interfaz'

export type Idioma = 'es' | 'en'

interface ContextoI18nTipo {
  idioma: Idioma
  cambiarIdioma: (nuevoIdioma: Idioma) => void
  t: TipoTraducciones
}

const ContextoI18n = createContext<ContextoI18nTipo | undefined>(undefined)

const CLAVE_ALMACENAMIENTO_IDIOMA = 'gsp_seguridad_idioma'
const ATRIBUTOS_TRADUCIBLES = ['placeholder', 'title', 'aria-label'] as const
const textosOriginales = new WeakMap<Text, string>()
const textosAplicados = new WeakMap<Text, string>()
const atributosOriginales = new WeakMap<Element, Map<string, string>>()
const atributosAplicados = new WeakMap<Element, Map<string, string>>()

function traducirNodoTexto(nodo: Text, idioma: Idioma) {
  const aplicadoAnterior = textosAplicados.get(nodo)
  let original = textosOriginales.get(nodo)

  // React puede reutilizar el nodo para un texto distinto. En ese caso,
  // conservamos el nuevo texto fuente y no el inglés aplicado anteriormente.
  if (original === undefined || (nodo.data !== aplicadoAnterior && nodo.data !== original)) {
    original = nodo.data
    textosOriginales.set(nodo, original)
  }

  let resultado = idioma === 'en' ? traducirTextoInterfaz(original) : original

  // "Franco" es un tipo de turno, pero también puede ser un nombre propio.
  // Traducirlo solo dentro de una opción de selección evita alterar nombres
  // de vigiladores o administradores mostrados en el resto de la aplicación.
  if (
    idioma === 'en' &&
    original.replace(/\\s+/g, ' ').trim() === 'Franco' &&
    nodo.parentElement?.closest('option, [role="option"]')
  ) {
    const inicio = original.match(/^\\s*/)?.[0] ?? ''
    const fin = original.match(/\\s*$/)?.[0] ?? ''
    resultado = `${inicio}Day Off${fin}`
  }

  textosAplicados.set(nodo, resultado)
  if (nodo.data !== resultado) nodo.data = resultado
}

function traducirAtributo(elemento: Element, atributo: string, idioma: Idioma) {
  const valorActual = elemento.getAttribute(atributo)
  if (valorActual === null) return

  let originales = atributosOriginales.get(elemento)
  if (!originales) {
    originales = new Map<string, string>()
    atributosOriginales.set(elemento, originales)
  }
  let aplicados = atributosAplicados.get(elemento)
  if (!aplicados) {
    aplicados = new Map<string, string>()
    atributosAplicados.set(elemento, aplicados)
  }

  const aplicadoAnterior = aplicados.get(atributo)
  let original = originales.get(atributo)
  if (original === undefined || (valorActual !== aplicadoAnterior && valorActual !== original)) {
    original = valorActual
    originales.set(atributo, original)
  }

  const resultado = idioma === 'en' ? traducirAtributoInterfaz(original) : original
  aplicados.set(atributo, resultado)
  if (valorActual !== resultado) elemento.setAttribute(atributo, resultado)
}

function traducirSubarbol(nodo: Node, idioma: Idioma) {
  if (nodo.nodeType === Node.TEXT_NODE) {
    traducirNodoTexto(nodo as Text, idioma)
    return
  }
  if (nodo.nodeType !== Node.ELEMENT_NODE && nodo.nodeType !== Node.DOCUMENT_FRAGMENT_NODE) return

  const elemento = nodo.nodeType === Node.ELEMENT_NODE ? nodo as Element : null
  if (elemento) {
    if (['SCRIPT', 'STYLE', 'NOSCRIPT', 'TEXTAREA'].includes(elemento.tagName) || elemento.hasAttribute('data-no-translate')) return
    for (const atributo of ATRIBUTOS_TRADUCIBLES) traducirAtributo(elemento, atributo, idioma)
  }

  nodo.childNodes.forEach((hijo) => traducirSubarbol(hijo, idioma))
}

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

  useEffect(() => {
    if (typeof document === 'undefined' || !document.body) return

    // Traduce textos estáticos de componentes heredados que todavía no usan
    // claves i18n, incluidos los que aparecen después de navegar o abrir modales.
    traducirSubarbol(document.body, idioma)

    const observador = new MutationObserver((mutaciones) => {
      for (const mutacion of mutaciones) {
        if (mutacion.type === 'characterData' && mutacion.target.nodeType === Node.TEXT_NODE) {
          traducirNodoTexto(mutacion.target as Text, idioma)
        } else if (mutacion.type === 'attributes' && mutacion.target instanceof Element && mutacion.attributeName) {
          traducirAtributo(mutacion.target, mutacion.attributeName, idioma)
        } else {
          mutacion.addedNodes.forEach((nodo) => traducirSubarbol(nodo, idioma))
        }
      }
    })

    observador.observe(document.body, {
      subtree: true,
      childList: true,
      characterData: true,
      attributes: true,
      attributeFilter: [...ATRIBUTOS_TRADUCIBLES],
    })

    return () => observador.disconnect()
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
