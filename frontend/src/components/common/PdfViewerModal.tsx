import React, { useEffect, useRef } from 'react';
import { X, FileText, ExternalLink } from 'lucide-react';

interface PdfViewerModalProps {
  isOpen: boolean;
  onClose: () => void;
  pdfUrl: string | null;
  title?: string;
}

const PdfViewerModal: React.FC<PdfViewerModalProps> = ({
  isOpen,
  onClose,
  pdfUrl,
  title = 'Visor de Comprobante Financiero',
}) => {
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!isOpen) return;
    closeButtonRef.current?.focus();

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="pdf-modal-title"
    >
      <div className="relative w-full max-w-4xl rounded-2xl bg-slate-900 border border-slate-800 p-6 shadow-2xl">
        <div className="mb-4 flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-blue-600/15 text-blue-400 border border-blue-500/20">
              <FileText className="h-5 w-5" aria-hidden="true" />
            </div>
            <div>
              <h3 id="pdf-modal-title" className="text-base font-bold text-slate-100">
                {title}
              </h3>
              <p className="text-xs text-slate-300">Documento de soporte auditado en Sportify ERP</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {pdfUrl && (
              <a
                href={pdfUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-800 text-slate-200 hover:bg-slate-700 border border-slate-700 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400"
              >
                <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" /> Abrir en pestaña
              </a>
            )}
            <button
              ref={closeButtonRef}
              type="button"
              className="rounded-lg p-1.5 text-slate-300 hover:bg-slate-800 hover:text-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400"
              onClick={onClose}
              aria-label="Cerrar visor"
            >
              <X className="h-5 w-5" aria-hidden="true" />
            </button>
          </div>
        </div>

        <div className="h-[72vh] w-full rounded-xl overflow-hidden border border-slate-800 bg-slate-950">
          {pdfUrl ? (
            <iframe
              src={pdfUrl}
              className="h-full w-full border-0"
              title={title}
            />
          ) : (
            <div className="flex h-full items-center justify-center text-slate-300 text-sm">
              No se pudo cargar el documento adjunto
            </div>
          )}
        </div>

        <div className="mt-4 flex justify-end">
          <button
            type="button"
            className="rounded-lg bg-slate-800 border border-slate-700 px-4 py-2 text-sm font-semibold text-slate-200 hover:bg-slate-700 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400"
            onClick={onClose}
          >
            Cerrar Visor
          </button>
        </div>
      </div>
    </div>
  );
};

export default PdfViewerModal;
