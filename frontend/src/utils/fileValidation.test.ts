import { describe, expect, it } from 'vitest';
import { MAX_UPLOAD_FILE_SIZE_BYTES, validateUploadFile } from './fileValidation';

describe('validateUploadFile (Límite de 2 MB y formato en Frontend)', () => {
  it('acepta archivos .jpg y .pdf válidos de hasta 2 MB', () => {
    const jpgFile = new File([new Uint8Array(500 * 1024)], 'comprobante.jpg', {
      type: 'image/jpeg',
    });
    expect(validateUploadFile(jpgFile)).toEqual({ valid: true });

    const pdfFile = new File([new Uint8Array(1024 * 1024)], 'recibo.pdf', {
      type: 'application/pdf',
    });
    expect(validateUploadFile(pdfFile)).toEqual({ valid: true });
  });

  it('rechaza archivos que superan el límite de 2 MB', () => {
    const bigFile = new File(
      [new Uint8Array(MAX_UPLOAD_FILE_SIZE_BYTES + 100)],
      'pesado.jpg',
      { type: 'image/jpeg' }
    );
    const result = validateUploadFile(bigFile);
    expect(result.valid).toBe(false);
    expect(result.error).toContain('2 MB');
  });

  it('rechaza extensiones no permitidas o doble extensión ejecutable', () => {
    const exeFile = new File([new Uint8Array(1024)], 'malware.exe', {
      type: 'application/octet-stream',
    });
    expect(validateUploadFile(exeFile).valid).toBe(false);

    const doubleExtFile = new File([new Uint8Array(1024)], 'shell.php.jpg', {
      type: 'image/jpeg',
    });
    expect(validateUploadFile(doubleExtFile).valid).toBe(false);
  });
});
