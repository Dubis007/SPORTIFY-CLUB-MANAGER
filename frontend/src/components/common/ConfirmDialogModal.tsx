import React, { useCallback, useEffect, useId, useRef, useState } from 'react';
import { AlertTriangle, ShieldAlert, CheckCircle2, X } from 'lucide-react';

export type ConfirmDialogVariant = 'danger' | 'warning' | 'primary';

export interface ConfirmDialogModalProps {
  isOpen: boolean;
  title: string;
  description: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: ConfirmDialogVariant;
  loading?: boolean;
  onConfirm: () => void | Promise<void>;
  onClose: () => void;
}

export interface ConfirmRequestOptions {
  title: string;
  description: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: ConfirmDialogVariant;
  onConfirm: () => void | Promise<void>;
}

const VARIANT_STYLES: Record<
  ConfirmDialogVariant,
  {
    iconBox: string;
    button: string;
    Icon: React.ComponentType<{ size?: number; className?: string }>;
  }
> = {
  danger: {
    iconBox: 'bg-rose-500/15 border-rose-500/30 text-rose-400',
    button: 'bg-rose-600 hover:bg-rose-500 text-white',
    Icon: ShieldAlert,
  },
  warning: {
    iconBox: 'bg-amber-500/15 border-amber-500/30 text-amber-400',
    button: 'bg-amber-600 hover:bg-amber-500 text-white',
    Icon: AlertTriangle,
  },
  primary: {
    iconBox: 'bg-blue-500/15 border-blue-500/30 text-blue-400',
    button: 'bg-blue-600 hover:bg-blue-500 text-white',
    Icon: CheckCircle2,
  },
};

export function useConfirmDialog() {
  const [state, setState] = useState<ConfirmRequestOptions | null>(null);
  const [loading, setLoading] = useState(false);

  const requestConfirm = useCallback((options: ConfirmRequestOptions) => {
    setState(options);
  }, []);

  const handleClose = useCallback(() => {
    if (loading) return;
    setState(null);
  }, [loading]);

  const handleConfirm = useCallback(async () => {
    if (!state) return;
    setLoading(true);
    try {
      await state.onConfirm();
      setState(null);
    } finally {
      setLoading(false);
    }
  }, [state]);

  const confirmDialogProps: ConfirmDialogModalProps = {
    isOpen: state !== null,
    title: state?.title ?? '',
    description: state?.description ?? '',
    confirmLabel: state?.confirmLabel,
    cancelLabel: state?.cancelLabel,
    variant: state?.variant ?? 'danger',
    loading,
    onConfirm: handleConfirm,
    onClose: handleClose,
  };

  return { requestConfirm, confirmDialogProps };
}

export default function ConfirmDialogModal({
  isOpen,
  title,
  description,
  confirmLabel = 'Confirmar',
  cancelLabel = 'Cancelar',
  variant = 'danger',
  loading = false,
  onConfirm,
  onClose,
}: ConfirmDialogModalProps) {
  const titleId = useId();
  const descriptionId = useId();
  const cancelButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!isOpen) return;
    // UX ética sin patrones oscuros: enfocar por defecto la acción segura ("Cancelar")
    // para evitar confirmaciones destructivas accidentales al presionar Enter o Espacio.
    cancelButtonRef.current?.focus();

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && !loading) {
        onClose();
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [isOpen, loading, onClose]);

  if (!isOpen) return null;

  const { iconBox, button, Icon } = VARIANT_STYLES[variant];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4"
      role="alertdialog"
      aria-modal="true"
      aria-labelledby={titleId}
      aria-describedby={descriptionId}
    >
      <div className="w-full max-w-md rounded-2xl bg-slate-900 border border-slate-800 p-6 shadow-2xl">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3">
            <div
              className={`w-10 h-10 rounded-xl border flex items-center justify-center shrink-0 ${iconBox}`}
            >
              <Icon size={20} />
            </div>
            <div>
              <h2 id={titleId} className="text-base font-bold text-slate-100">
                {title}
              </h2>
              <p id={descriptionId} className="mt-1.5 text-xs text-slate-400 leading-relaxed">
                {description}
              </p>
            </div>
          </div>

          <button
            type="button"
            disabled={loading}
            onClick={onClose}
            aria-label="Cerrar confirmación"
            className="rounded-lg p-1 text-slate-400 hover:bg-slate-800 hover:text-slate-200 disabled:opacity-40"
          >
            <X size={16} />
          </button>
        </div>

        <div className="mt-6 flex justify-end gap-2.5 border-t border-slate-800 pt-4">
          <button
            ref={cancelButtonRef}
            type="button"
            disabled={loading}
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 disabled:opacity-40 transition-colors"
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            disabled={loading}
            onClick={() => void onConfirm()}
            className={`px-4 py-2 rounded-xl text-xs font-semibold disabled:opacity-50 transition-colors ${button}`}
          >
            {loading ? 'Procesando...' : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
