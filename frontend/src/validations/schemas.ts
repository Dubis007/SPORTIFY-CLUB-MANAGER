import { z } from 'zod';
import { containsXssPayload, sanitizeInputText } from '../utils/xssSanitizer';

const safeString = (minLen: number, minMessage: string) =>
  z
    .string()
    .min(minLen, minMessage)
    .refine((val) => !containsXssPayload(val), {
      message: 'No se permiten etiquetas HTML ni vectores de script (XSS)',
    })
    .transform((val) => sanitizeInputText(val));

const optionalSafeString = () =>
  z
    .string()
    .refine((val) => !containsXssPayload(val), {
      message: 'No se permiten etiquetas HTML ni vectores de script (XSS)',
    })
    .transform((val) => sanitizeInputText(val))
    .optional();

export const loginSchema = z.object({
  correo: z
    .string()
    .email('Debe ser un correo electrónico válido')
    .refine((val) => !containsXssPayload(val), {
      message: 'Correo contiene caracteres no permitidos',
    }),
  contrasena: z.string().min(6, 'La contraseña debe tener al menos 6 caracteres'),
});

export const userSchema = z.object({
  nombre: safeString(2, 'El nombre debe tener al menos 2 caracteres'),
  apellido: safeString(2, 'El apellido debe tener al menos 2 caracteres'),
  correo: z
    .string()
    .email('Debe ser un correo válido')
    .refine((val) => !containsXssPayload(val), {
      message: 'Correo contiene caracteres no permitidos',
    }),
});

export const competitionSchema = z.object({
  nombre: safeString(3, 'El nombre es obligatorio'),
  fechaInicio: z.string().refine((val) => !isNaN(Date.parse(val)), { message: 'Fecha inválida' }),
  fechaFin: z.string().refine((val) => !isNaN(Date.parse(val)), { message: 'Fecha inválida' }),
  ubicacion: safeString(3, 'El lugar es obligatorio'),
  descripcion: optionalSafeString(),
});

export const trainingSchema = z.object({
  titulo: safeString(3, 'El título es obligatorio'),
  descripcion: optionalSafeString(),
  fechaHora: z.string().refine((val) => !isNaN(Date.parse(val)), { message: 'Fecha inválida' }),
  fechaFin: z.string().refine((val) => !isNaN(Date.parse(val)), { message: 'Fecha inválida' }),
  capacidadMaxima: z.number().min(1, 'La capacidad mínima es 1').default(20),
});
