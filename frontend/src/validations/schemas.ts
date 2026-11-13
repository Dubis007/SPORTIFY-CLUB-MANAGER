import { z } from 'zod';
import { containsXssPayload, sanitizeInputText } from '../utils/xssSanitizer';

const XSS_MESSAGE = 'No se permiten etiquetas HTML ni vectores de script (XSS)';
const isValidDate = (val: string) => !isNaN(Date.parse(val));

const safeString = (minLen: number, minMessage: string) =>
  z
    .string()
    .min(minLen, minMessage)
    .refine((val) => !containsXssPayload(val), XSS_MESSAGE)
    .transform((val) => sanitizeInputText(val));

const optionalSafeString = () =>
  z
    .string()
    .refine((val) => !containsXssPayload(val), XSS_MESSAGE)
    .transform((val) => sanitizeInputText(val))
    .optional();

export const loginSchema = z.object({
  correo: z
    .email('Debe ser un correo electrónico válido')
    .refine((val) => !containsXssPayload(val), 'Correo contiene caracteres no permitidos'),
  contrasena: z.string().min(6, 'La contraseña debe tener al menos 6 caracteres'),
});

export const userSchema = z.object({
  nombre: safeString(2, 'El nombre debe tener al menos 2 caracteres'),
  apellido: safeString(2, 'El apellido debe tener al menos 2 caracteres'),
  correo: z
    .email('Debe ser un correo válido')
    .refine((val) => !containsXssPayload(val), 'Correo contiene caracteres no permitidos'),
});

export const competitionSchema = z.object({
  nombre: safeString(3, 'El nombre es obligatorio'),
  fechaInicio: z.string().refine(isValidDate, 'Fecha inválida'),
  fechaFin: z.string().refine(isValidDate, 'Fecha inválida'),
  ubicacion: safeString(3, 'El lugar es obligatorio'),
  descripcion: optionalSafeString(),
});

export const trainingSchema = z.object({
  titulo: safeString(3, 'El título es obligatorio'),
  descripcion: optionalSafeString(),
  // Los selectores entregan el identificador como texto; vacío significa que no se eligió nada
  sedeId: z.coerce
    .number({ error: 'Selecciona una sede' })
    .int('Selecciona una sede')
    .positive('Selecciona una sede'),
  entrenadorId: z.coerce
    .number({ error: 'Selecciona un entrenador' })
    .int('Selecciona un entrenador')
    .positive('Selecciona un entrenador'),
  fechaHora: z.string().refine(isValidDate, 'Fecha inválida'),
  fechaFin: z.string().refine(isValidDate, 'Fecha inválida'),
  capacidadMaxima: z
    .number({ error: 'Indica el cupo con un número' })
    .min(1, 'La capacidad mínima es 1')
    .default(20),
});
