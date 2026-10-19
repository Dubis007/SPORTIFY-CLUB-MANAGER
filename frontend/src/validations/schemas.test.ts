import { describe, expect, it } from 'vitest';
import { loginSchema, userSchema } from './schemas';

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
      expect(result.error.issues.map(i => i.path[0])).toEqual(['nombre', 'apellido']);
    }
  });
});
