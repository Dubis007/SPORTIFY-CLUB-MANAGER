import '@testing-library/jest-dom/vitest';
import { cleanup } from '@testing-library/react';
import { afterEach } from 'vitest';

// jsdom todavía no implementa showModal()/close() de <dialog>. Se simula lo mínimo (atributo `open` y
// evento `close`) para poder montar en pruebas los modales que usan el elemento nativo.
if (typeof HTMLDialogElement !== 'undefined' && typeof HTMLDialogElement.prototype.showModal !== 'function') {
  HTMLDialogElement.prototype.showModal = function showModal(this: HTMLDialogElement) {
    this.setAttribute('open', '');
  };
  HTMLDialogElement.prototype.close = function close(this: HTMLDialogElement) {
    if (!this.hasAttribute('open')) return;
    this.removeAttribute('open');
    this.dispatchEvent(new Event('close'));
  };
}

// jsdom tampoco implementa las URL de objeto (`blob:`) con las que se muestran comprobantes y colillas.
if (typeof URL.createObjectURL !== 'function') {
  URL.createObjectURL = () => 'blob:http://localhost/jsdom-object-url';
}
if (typeof URL.revokeObjectURL !== 'function') {
  URL.revokeObjectURL = () => undefined;
}

afterEach(() => {
  cleanup();
});
