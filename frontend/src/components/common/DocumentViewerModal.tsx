import React, { useEffect, useId, useRef } from 'react';
import { X, FileText, ExternalLink, Download } from 'lucide-react';

export interface DocumentViewerModalProps {
  isOpen: boolean;
  onClose: () => void;
  /** URL del documento. Para comprobantes y colillas es una URL de objeto (`blob:`) descargada con sesión. */
  documentUrl: string | null;
  /** Decide cómo se muestra: PDF en un marco, PNG/JPG como imagen; cualquier otro tipo solo se descarga. */
  mimeType?: string;
  title?: string;
  /** Nombre sugerido al descargar el documento. */
  downloadName?: string;
}

const INLINE_IMAGE_TYPES = new Set(['image/png', 'image/jpeg']);

// React aplica `autoFocus` llamando a focus() al montar, cuando el diálogo todavía está cerrado. Con el
// atributo real, el propio <dialog> pone el foco inicial en este control al abrirse con showModal().
const markAutofocus = (element: HTMLElement | null) => {
  element?.setAttribute('autofocus', '');
};

const DocumentViewerModal: React.FC<DocumentViewerModalProps> = ({
  isOpen,
  onClose,
  documentUrl,
  mimeType = 'application/pdf',
  title = 'Visor de Comprobante Financiero',
  downloadName,
}) => {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const titleId = useId();

  // <dialog> nativo abierto como modal: el navegador deja inerte la página, contiene el foco, cierra con
  // Esc y devuelve el foco al botón que lo abrió. No hace falta role, aria-modal ni manejadores de teclado.
  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    if (isOpen && !dialog.open) {
      dialog.showModal();
    } else if (!isOpen && dialog.open) {
      dialog.close();
    }
  }, [isOpen]);

  const renderDocument = () => {
    if (!documentUrl) {
      return (
        <div className="flex h-full items-center justify-center text-sm text-slate-300">
          No se pudo cargar el documento adjunto
        </div>
      );
    }

    if (INLINE_IMAGE_TYPES.has(mimeType)) {
      // La caja tiene alto fijo y la imagen se ajusta dentro: su tamaño real no desplaza el contenido
      return <img src={documentUrl} alt={title} className="h-full w-full object-contain" />;
    }

    if (mimeType === 'application/pdf') {
      return <iframe src={documentUrl} className="h-full w-full border-0" title={title} />;
    }

    return (
      <div className="flex h-full flex-col items-center justify-center gap-3 px-6 text-center text-sm text-slate-300">
        <p>Este archivo no se puede previsualizar en el navegador.</p>
        <a
          href={documentUrl}
          download={downloadName}
          className="inline-flex items-center gap-1.5 rounded-lg border border-slate-700 bg-slate-800 px-3 py-1.5 text-xs font-medium text-slate-200 transition-colors hover:bg-slate-700"
        >
          <Download className="h-3.5 w-3.5" aria-hidden="true" /> Descargar archivo
        </a>
      </div>
    );
  };

  return (
    <dialog
      ref={dialogRef}
      aria-labelledby={titleId}
      onClose={onClose}
      className="m-auto w-[calc(100%-2rem)] max-w-4xl rounded-2xl border border-slate-800 bg-slate-900 p-6 text-slate-100 shadow-2xl backdrop:bg-slate-950/80 backdrop:backdrop-blur-sm"
    >
      {isOpen && (
        <>
          <div className="mb-4 flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2.5">
              <div
                className="rounded-lg border border-blue-500/20 bg-blue-600/15 p-2 text-blue-400"
                aria-hidden="true"
              >
                <FileText className="h-5 w-5" />
              </div>
              <div>
                <h2 id={titleId} className="text-base font-bold text-slate-100">
                  {title}
                </h2>
                <p className="text-xs text-slate-300">Documento de soporte auditado en Sportify ERP</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {documentUrl && (
                <a
                  href={documentUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 rounded-lg border border-slate-700 bg-slate-800 px-3 py-1.5 text-xs font-medium text-slate-200 transition-colors hover:bg-slate-700"
                >
                  <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" /> Abrir en pestaña
                </a>
              )}
              <form method="dialog">
                <button
                  ref={markAutofocus}
                  className="rounded-lg p-1.5 text-slate-300 hover:bg-slate-800 hover:text-slate-100"
                  aria-label="Cerrar visor"
                >
                  <X className="h-5 w-5" aria-hidden="true" />
                </button>
              </form>
            </div>
          </div>

          <div className="h-[70vh] w-full overflow-hidden rounded-xl border border-slate-800 bg-slate-950">
            {renderDocument()}
          </div>

          <form method="dialog" className="mt-4 flex justify-end">
            <button className="rounded-lg border border-slate-700 bg-slate-800 px-4 py-2 text-sm font-semibold text-slate-200 transition-colors hover:bg-slate-700">
              Cerrar Visor
            </button>
          </form>
        </>
      )}
    </dialog>
  );
};

export default DocumentViewerModal;
