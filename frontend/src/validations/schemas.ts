import { z } from 'zod';

export const loginSchema = z.object({
  correo: z.string().email('Debe ser un correo electrónico válido'),
  contrasena: z.string().min(6, 'La contraseña debe tener al menos 6 caracteres'),
});

export const userSchema = z.object({
  nombre: z.string().min(2, 'El nombre debe tener al menos 2 caracteres'),
  apellido: z.string().min(2, 'El apellido debe tener al menos 2 caracteres'),
  correo: z.string().email('Debe ser un correo válido'),
});

export const competitionSchema = z.object({
  nombre: z.string().min(3, 'El nombre es obligatorio'),
  fechaInicio: z.string().refine((val) => !isNaN(Date.parse(val)), { message: 'Fecha inválida' }),
  fechaFin: z.string().refine((val) => !isNaN(Date.parse(val)), { message: 'Fecha inválida' }),
  ubicacion: z.string().min(3, 'El lugar es obligatorio'),
  descripcion: z.string().optional(),
});

export const trainingSchema = z.object({
  titulo: z.string().min(3, 'El título es obligatorio'),
  descripcion: z.string().optional(),
  fechaHora: z.string().refine((val) => !isNaN(Date.parse(val)), { message: 'Fecha inválida' }),
  fechaFin: z.string().refine((val) => !isNaN(Date.parse(val)), { message: 'Fecha inválida' }),
  capacidadMaxima: z.number().min(1, 'La capacidad mínima es 1').default(20),
});
