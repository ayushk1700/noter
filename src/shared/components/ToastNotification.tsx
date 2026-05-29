import { X, CheckCircle2, AlertCircle } from 'lucide-react';
import { Toast } from '@/shared/lib/types';

interface ToastProps {
  toast: Toast | null;
  onClose: () => void;
}

export default function ToastNotification({ toast, onClose }: ToastProps) {
  if (!toast) return null;

  const isSuccess = toast.type === 'success';

  return (
    <div
      className="fixed top-5 left-1/2 -translate-x-1/2 z-[200]
                 flex items-center gap-3 px-4 py-3 rounded-full shadow-2xl
                 bg-gray-900/95 backdrop-blur-xl border border-white/10
                 animate-in slide-in-from-top-4 fade-in duration-300
                 max-w-[90vw]"
    >
      {/* Status dot */}
      <div className={`shrink-0 ${isSuccess ? 'text-emerald-400' : 'text-red-400'}`}>
        {isSuccess
          ? <CheckCircle2 size={16} />
          : <AlertCircle size={16} />
        }
      </div>

      {/* Message */}
      <span className="text-white/90 text-sm font-semibold tracking-wide whitespace-nowrap">
        {toast.message}
      </span>

      {/* Action button — orange pill */}
      {toast.actionText && (
        <>
          <div className="w-px h-4 bg-white/15 mx-0.5" />
          <button
            onClick={() => { toast.onAction?.(); onClose(); }}
            className="text-xs bg-[#FF7D54] hover:bg-[#e06945] text-white py-1.5 px-3.5 rounded-full
                       font-bold transition-all shadow-sm whitespace-nowrap"
          >
            {toast.actionText}
          </button>
        </>
      )}

      {/* Close button */}
      <button
        onClick={onClose}
        className="shrink-0 p-1.5 rounded-full hover:bg-white/10 text-white/40 hover:text-white/80 transition-colors ml-0.5"
      >
        <X size={12} />
      </button>
    </div>
  );
}
