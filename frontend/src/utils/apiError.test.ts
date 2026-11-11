import { describe, expect, it } from 'vitest';
import { normalizeApiErrorData } from './apiError';

describe('normalizeApiErrorData (mensajes de error de la API)', () => {
  it('expone el detail de ProblemDetails como message (p. ej. cuenta bloqueada tras 5 intentos)', () => {
    const problem = {
      title: 'Acceso no autorizado',
      status: 401,
      detail: 'La cuenta ha sido bloqueada temporalmente tras 5 intentos fallidos de inicio de sesión.',
      instance: '/api/auth/login',
    };

    expect(normalizeApiErrorData(problem)).toMatchObject({
      message: 'La cuenta ha sido bloqueada temporalmente tras 5 intentos fallidos de inicio de sesión.',
      status: 401,
    });
  });

  it('usa el primer error de validación de ASP.NET cuando existe', () => {
    const validation = {
      title: 'One or more validation errors occurred.',
      status: 400,
      errors: { ComentarioRechazo: ['El comentario debe tener al menos 10 caracteres'] },
    };

    expect(normalizeApiErrorData(validation)).toMatchObject({
      message: 'El comentario debe tener al menos 10 caracteres',
    });
  });

  it('recurre al title cuando no hay detail ni errores', () => {
    expect(normalizeApiErrorData({ title: 'Violación de regla de negocio', status: 400 })).toMatchObject({
      message: 'Violación de regla de negocio',
    });
  });

  it('respeta un message existente y no toca cuerpos que no son objetos de error', () => {
    const withMessage = { message: 'El usuario ya se encuentra inscrito en esta competencia.' };
    expect(normalizeApiErrorData(withMessage)).toBe(withMessage);

    expect(normalizeApiErrorData('texto plano')).toBe('texto plano');
    expect(normalizeApiErrorData(null)).toBeNull();
    expect(normalizeApiErrorData(undefined)).toBeUndefined();

    const blob = new Blob(['%PDF'], { type: 'application/pdf' });
    expect(normalizeApiErrorData(blob)).toBe(blob);
  });
});
