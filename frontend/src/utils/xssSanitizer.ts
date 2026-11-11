/**
 * Utilidades de validación de entradas, sanitización contra XSS y renderizado seguro en React.
 */

const DANGEROUS_XSS_REGEX =
  /<\s*\/?\s*(script|iframe|object|embed|svg|link|style|meta|base|form)\b[^>]*>|javascript\s*:|vbscript\s*:|data\s*:\s*text\/html|\bon[a-z]{2,}\s*=|eval\s*\(|document\s*\.\s*(cookie|write)/i;

const SCRIPT_BLOCK_REGEX = /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi;
const INLINE_EVENT_REGEX = /\bon[a-z]{2,}\s*=\s*(?:"[^"]*"|'[^']*'|[^\s>]+)/gi;
const DANGEROUS_PROTOCOL_REGEX = /(?:javascript|vbscript)\s*:/gi;
const HTML_TAG_REGEX = /<[^>]+>/g;

const PASSWORD_KEYS = new Set([
  'contrasena',
  'password',
  'currentPassword',
  'newPassword',
  'nuevaContrasena',
  'confirmPassword',
  'confirmarContrasena',
]);

/**
 * Detecta si una cadena contiene vectores explícitos de ataque XSS.
 */
export function containsXssPayload(value: string | null | undefined): boolean {
  if (!value) return false;
  return DANGEROUS_XSS_REGEX.test(value);
}

/**
 * Limpia etiquetas HTML, scripts, protocolos javascript: y caracteres de control peligrosos.
 */
export function sanitizeInputText(value: string): string {
  return value
    .replace(/\0/g, '')
    .replace(SCRIPT_BLOCK_REGEX, '')
    .replace(INLINE_EVENT_REGEX, '')
    .replace(DANGEROUS_PROTOCOL_REGEX, '')
    .replace(HTML_TAG_REGEX, '')
    .replace(/[<>]/g, '')
    .trim();
}

/**
 * Garantiza que cualquier texto dinámico se muestre limpio de etiquetas ejecutables en la interfaz React.
 */
export function escapeSafeText(value: string | null | undefined): string {
  if (!value) return '';
  return sanitizeInputText(String(value));
}

/**
 * Sanitiza recursivamente las propiedades de texto de un payload JSON antes de enviarlo al backend.
 */
export function sanitizePayloadObject<T>(payload: T): T {
  if (payload === null || payload === undefined) return payload;
  if (typeof FormData !== 'undefined' && payload instanceof FormData) return payload;
  if (typeof Blob !== 'undefined' && payload instanceof Blob) return payload;

  if (typeof payload === 'string') {
    if (containsXssPayload(payload)) {
      throw new Error('Entrada rechazada por contener caracteres o etiquetas XSS peligrosas.');
    }
    return sanitizeInputText(payload) as unknown as T;
  }

  if (Array.isArray(payload)) {
    return payload.map((item) => sanitizePayloadObject(item)) as unknown as T;
  }

  if (typeof payload === 'object') {
    const result: Record<string, unknown> = {};
    for (const [key, val] of Object.entries(payload as Record<string, unknown>)) {
      if (typeof val === 'string' && !PASSWORD_KEYS.has(key)) {
        if (containsXssPayload(val)) {
          throw new Error(
            `El campo '${key}' contiene etiquetas o vectores XSS no permitidos.`
          );
        }
        result[key] = sanitizeInputText(val);
      } else if (typeof val === 'object' && val !== null) {
        result[key] = sanitizePayloadObject(val);
      } else {
        result[key] = val;
      }
    }
    return result as T;
  }

  return payload;
}
