import { describe, expect, it } from 'vitest';
import { competitionSchema, loginSchema, trainingSchema, userSchema } from './schemas';
import { containsXssPayload, escapeSafeText, sanitizeInputText } from '../utils/xssSanitizer';

describe('loginSchema', () => {
  it('acepta un correo válido y una contraseña de 6 o más caracteres', () => {
    const result = loginSchema.safeParse({ correo: 'admin@sportify.com', contrasena: 'Admin123!' });
    expect(result.success).toBe(true);
  });

  it('rechaza un correo con formato inválido', () => {
    const result = loginSchema.safeParse({ correo: 'admin', contrasena: 'Admin123!' });
    expect(result.success).toBe(false);
  });

  it('rechaza una contraseña de menos de 6 caracteres', () => {
    const result = loginSchema.safeParse({ correo: 'admin@sportify.com', contrasena: '123' });
    expect(result.success).toBe(false);
  });
});

describe('userSchema', () => {
  it('rechaza nombre y apellido de un solo carácter', () => {
    const result = userSchema.safeParse({ nombre: 'A', apellido: 'B', correo: 'a@b.com' });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues.map((i) => i.path[0])).toEqual(['nombre', 'apellido']);
    }
  });

  it('rechaza vectores XSS en nombre o apellido y sanitiza etiquetas residuales', () => {
    const xssAttempt = userSchema.safeParse({
      nombre: '<script>alert(1)</script>',
      apellido: 'Pérez',
      correo: 'perez@sportify.com',
    });
    expect(xssAttempt.success).toBe(false);

    const htmlCleaned = userSchema.safeParse({
      nombre: '  <b>Carlos</b>  ',
      apellido: 'Gómez',
      correo: 'carlos@sportify.com',
    });
    expect(htmlCleaned.success).toBe(true);
    if (htmlCleaned.success) {
      expect(htmlCleaned.data.nombre).toBe('Carlos');
    }
  });
});

describe('Validación de entradas y prevención XSS (competitionSchema, trainingSchema y utilidades)', () => {
  it('bloquea payloads maliciosos <script>, onerror= y javascript: en competencias y entrenamientos', () => {
    expect(containsXssPayload('<img src=x onerror=alert(1)>')).toBe(true);
    expect(containsXssPayload('javascript:evil()')).toBe(true);

    const compResult = competitionSchema.safeParse({
      nombre: 'Copa <script>steal()</script>',
      fechaInicio: '2026-11-15',
      fechaFin: '2026-11-16',
      ubicacion: 'Sede Norte',
    });
    expect(compResult.success).toBe(false);

    const trainResult = trainingSchema.safeParse({
      titulo: 'Funcional',
      descripcion: '<svg onload=alert(1)>',
      fechaHora: '2026-11-15T10:00:00Z',
      fechaFin: '2026-11-15T12:00:00Z',
      capacidadMaxima: 20,
    });
    expect(trainResult.success).toBe(false);
  });

  it('escapa y limpia texto dinámico para renderizado seguro en React', () => {
    expect(sanitizeInputText('Torneo <b>Sub-17</b> <script>alert(1)</script>')).toBe(
      'Torneo Sub-17'
    );
    expect(escapeSafeText('Excelente técnica <iframe src="evil"></iframe>')).toBe(
      'Excelente técnica'
    );
  });
});
