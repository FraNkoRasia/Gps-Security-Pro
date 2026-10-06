import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string | undefined
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined

const esUrlValida = (url?: string) => {
  if (!url) return false
  try {
    const u = new URL(url)
    return u.protocol === 'http:' || u.protocol === 'https:'
  } catch {
    return false
  }
}

export const hayConexionSupabase = Boolean(
  supabaseUrl && 
  esUrlValida(supabaseUrl) && 
  supabaseAnonKey && 
  !supabaseUrl.includes('tu-proyecto')
)

// Inicialización de cliente Supabase
export const supabase = hayConexionSupabase
  ? createClient(supabaseUrl!, supabaseAnonKey!, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true
      }
    })
  : null

