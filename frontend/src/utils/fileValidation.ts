/**
 * Validación de formato y peso máximo (2 MB) en el selector de archivos del frontend.
 * Esta validación se replica obligatoriamente en los controladores de C# (FileUploadValidator).
 */

export const MAX_UPLOAD_FILE_SIZE_MB = 2;
export const MAX_UPLOAD_FILE_SIZE_BYTES = MAX_UPLOAD_FILE_SIZE_MB * 1024 * 1024; // 2 MB

export const ALLOWED_FILE_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.pdf'] as const;
export const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'application/pdf'] as const;

const DANGEROUS_INNER_EXTENSIONS = new Set([
  '.exe',
  '.dll',
  '.bat',
  '.cmd',
  '.sh',
  '.ps1',
  '.php',
  '.asp',
  '.aspx',
  '.jsp',
  '.js',
  '.html',
  '.htm',
  '.svg',
]);

export interface FileValidationResult {
  valid: boolean;
  error?: string;
}

export function validateUploadFile(file: File | null | undefined): FileValidationResult {
  if (!file || file.size === 0) {
    return { valid: false, error: 'Debes seleccionar un archivo válido no vacío.' };
  }

  if (file.size > MAX_UPLOAD_FILE_SIZE_BYTES) {
    return {
      valid: false,
      error: `El archivo excede el tamaño máximo permitido de ${MAX_UPLOAD_FILE_SIZE_MB} MB.`,
    };
  }

  const fileName = file.name.trim();
  if (fileName.includes('..') || fileName.includes('/') || fileName.includes('\\')) {
    return { valid: false, error: 'Nombre de archivo inválido.' };
  }

  const parts = fileName.toLowerCase().split('.');
  if (parts.length < 2) {
    return {
      valid: false,
      error: `El archivo debe tener una extensión permitida (${ALLOWED_FILE_EXTENSIONS.join(', ')}).`,
    };
  }

  const ext = `.${parts[parts.length - 1]}`;
  if (!(ALLOWED_FILE_EXTENSIONS as readonly string[]).includes(ext)) {
    return {
      valid: false,
      error: `Formato '${ext}' no permitido. Solo se aceptan archivos ${ALLOWED_FILE_EXTENSIONS.join(', ')} de hasta ${MAX_UPLOAD_FILE_SIZE_MB} MB.`,
    };
  }

  if (parts.length > 2) {
    const innerExt = `.${parts[parts.length - 2]}`;
    if (DANGEROUS_INNER_EXTENSIONS.has(innerExt)) {
      return {
        valid: false,
        error: 'Se detectó una doble extensión ejecutable no permitida.',
      };
    }
  }

  if (file.type && !(ALLOWED_MIME_TYPES as readonly string[]).includes(file.type.toLowerCase())) {
    return {
      valid: false,
      error: `Tipo de contenido '${file.type}' no permitido. Usa imágenes JPG/PNG o documentos PDF.`,
    };
  }

  return { valid: true };
}
