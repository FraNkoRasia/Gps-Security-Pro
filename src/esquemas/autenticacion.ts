import { z } from 'zod'

export const esquemaLogin = z.object({
  email: z
    .string()
    .min(1, 'El correo electrónico es requerido')
    .email('Ingresá un correo electrónico válido'),
  contrasena: z
    .string()
    .min(6, 'La contraseña debe tener al menos 6 caracteres'),
  recordarme: z.boolean().default(false)
})

export type DatosLogin = z.infer<typeof esquemaLogin>

export const esquemaRecuperarContrasena = z.object({
  email: z
    .string()
    .min(1, 'El correo electrónico es requerido')
    .email('Ingresá un correo electrónico válido')
})

export type DatosRecuperarContrasena = z.infer<typeof esquemaRecuperarContrasena>

export const esquemaCambiarContrasena = z
  .object({
    contrasenaActual: z.string().optional(),
    nuevaContrasena: z
      .string()
      .min(8, 'La nueva contraseña debe tener al menos 8 caracteres')
      .regex(/[A-Za-z]/, 'Debe incluir al menos una letra')
      .regex(/[0-9]/, 'Debe incluir al menos un número'),
    confirmarContrasena: z.string().min(1, 'Confirmá tu contraseña')
  })
  .refine((data) => data.nuevaContrasena === data.confirmarContrasena, {
    message: 'Las contraseñas no coinciden',
    path: ['confirmarContrasena']
  })

export type DatosCambiarContrasena = z.infer<typeof esquemaCambiarContrasena>
