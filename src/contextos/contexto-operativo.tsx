import React,{createContext,useContext,useEffect,useState} from 'react'
import type { Empresa,Objetivo,Usuario,Asignacion,Turno,NovedadLibro,SolicitudCambio,Aviso,RegistroAuditoria } from '@/tipos'
import { useAutenticacion } from './contexto-autenticacion'
import { supabase } from '@/servicios/supabase'

// PATCH: aprobación de cambios de turno con manejo visible de errores.
// Se conserva el resto del contexto existente.
