import { z } from 'zod';

/**
 * Esquema Zod para credenciales de autenticación
 */
export const CredentialsSchema = z.object({
  email: z.string().email('Formato de correo electrónico inválido').min(5).max(120),
  password: z.string().min(6, 'La contraseña debe tener al menos 6 caracteres').max(128),
  deviceFingerprint: z.string().min(3).max(256).optional(),
});

/**
 * Esquema Zod para validación de estructura de Claims JWT (soporta estándar RFC 7519 y claims de .NET Core)
 */
export const JwtClaimsSchema = z.object({
  sub: z.string().min(1, 'El identificador de sujeto (sub) es obligatorio'),
  email: z.string().email('El claim email no es válido'),
  role: z.enum(['ADMIN', 'CONTADOR', 'ENTRENADOR', 'MIEMBRO']),
  iss: z.string().default('SportifyApi'),
  aud: z.string().default('SportifyClients'),
  exp: z.number().int().positive('El claim de expiración (exp) debe ser un timestamp positivo'),
  iat: z.number().int().optional(),
  nbf: z.number().int().optional(),
});

/**
 * Esquema Zod para solicitud de verificación de firma y vigencia de JWT
 */
export const TokenVerifyRequestSchema = z.object({
  token: z
    .string()
    .min(20, 'El token JWT proporcionado es demasiado corto')
    .regex(/^[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+$/, 'Estructura de segmentos JWT (Header.Payload.Signature) inválida'),
  requiredRoles: z
    .array(z.enum(['ADMIN', 'CONTADOR', 'ENTRENADOR', 'MIEMBRO']))
    .optional(),
  validateSignature: z.boolean().default(true),
});

/**
 * Esquema Zod para validación de Refresh Tokens
 */
export const RefreshTokenSchema = z.object({
  refreshToken: z.string().min(16, 'Refresh token inválido'),
  userId: z.string().min(1, 'ID de usuario requerido'),
  ipAddress: z.string().ip().optional(),
});

/**
 * Esquema Zod para auditoría y saneamiento de sesiones concurrentes
 */
export const AuditSessionRequestSchema = z.object({
  userId: z.string().min(1, 'El ID de usuario es obligatorio'),
  email: z.string().email('Correo electrónico inválido'),
  role: z.enum(['ADMIN', 'CONTADOR', 'ENTRENADOR', 'MIEMBRO']),
  sessionId: z.string().min(4).default(() => `sess_${Date.now()}`),
  token: z.string().optional(),
  userAgent: z.string().max(512).default('Sportify-ERP-Client/1.0'),
  ipAddress: z.string().default('127.0.0.1'),
  maxConcurrentSessions: z.number().int().min(1).max(10).default(2),
  revokeStaleSessions: z.boolean().default(true),
});

export type CredentialsInput = z.infer<typeof CredentialsSchema>;
export type JwtClaims = z.infer<typeof JwtClaimsSchema>;
export type TokenVerifyRequest = z.infer<typeof TokenVerifyRequestSchema>;
export type RefreshTokenInput = z.infer<typeof RefreshTokenSchema>;
export type AuditSessionRequest = z.infer<typeof AuditSessionRequestSchema>;
export type AuditSessionInput = z.infer<typeof AuditSessionRequestSchema>;
