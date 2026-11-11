/**
 * Normaliza el cuerpo de error de la API para que las pantallas siempre encuentren el texto en `message`.
 *
 * El backend responde de tres formas:
 *  - `{ message }` en los controladores que devuelven BadRequest explícito.
 *  - ProblemDetails (RFC 7807) desde GlobalExceptionHandler: `{ title, status, detail }`.
 *  - ValidationProblemDetails de ASP.NET: `{ title, status, errors: { Campo: ['mensaje'] } }`.
 *
 * Los ViewModels leen `err.response.data.message`; sin esta normalización el motivo real
 * (cuenta bloqueada, regla de negocio incumplida, campo inválido) nunca llegaba al usuario.
 */
export function normalizeApiErrorData(data: unknown): unknown {
  if (!data || typeof data !== 'object' || Array.isArray(data)) return data;
  if (typeof Blob !== 'undefined' && data instanceof Blob) return data;

  const body = data as Record<string, unknown>;
  if (isNonEmptyText(body.message)) return data;

  const message = firstValidationError(body.errors) ?? pickText(body.detail) ?? pickText(body.title);
  return message ? { ...body, message } : data;
}

function isNonEmptyText(value: unknown): value is string {
  return typeof value === 'string' && value.trim().length > 0;
}

function pickText(value: unknown): string | undefined {
  return isNonEmptyText(value) ? value.trim() : undefined;
}

function firstValidationError(errors: unknown): string | undefined {
  if (!errors || typeof errors !== 'object') return undefined;
  for (const messages of Object.values(errors as Record<string, unknown>)) {
    if (Array.isArray(messages)) {
      const first = messages.find(isNonEmptyText);
      if (first) return first.trim();
    } else if (isNonEmptyText(messages)) {
      return messages.trim();
    }
  }
  return undefined;
}
