import { AlertTriangle } from 'lucide-react';

interface ConfirmDialogProps {
  open: boolean;
  title: string;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
  confirmLabel?: string;
  confirmClass?: string;
}

export function ConfirmDialog({ open, title, message, onConfirm, onCancel, confirmLabel = 'YA, HAPUS', confirmClass }: ConfirmDialogProps) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="absolute inset-0" onClick={onCancel} />
      <div className="relative bg-white border-4 border-[#1E3A5F] shadow-none w-full max-w-sm p-6 z-10 animate-in zoom-in-95 duration-200">
        <div className="flex flex-col items-center text-center gap-4">
          <div className="flex-shrink-0 w-16 h-16 bg-rose-400 border-4 border-[#1E3A5F] shadow-none flex items-center justify-center">
            <AlertTriangle className="w-8 h-8 text-[#1E3A5F]" />
          </div>
          <div>
            <h3 className="font-black text-xl text-[#1E3A5F] uppercase tracking-widest">{title}</h3>
            <p className="text-[10px] font-bold text-[#64748B] mt-2 uppercase tracking-widest leading-relaxed">{message}</p>
          </div>
        </div>
        <div className="flex flex-col sm:flex-row gap-3 mt-8">
          <button
            onClick={onCancel}
            className="flex-1 px-4 py-3 border-2 border-[#1E3A5F] bg-white text-[#1E3A5F] text-xs font-black uppercase tracking-widest hover:bg-[#1E3A5F] hover:text-white transition-colors shadow-none"
          >
            BATAL
          </button>
          <button
            onClick={onConfirm}
            className={confirmClass || 'flex-1 px-4 py-3 text-white bg-rose-600 border-2 border-[#1E3A5F] text-xs font-black uppercase tracking-widest shadow-none hover:bg-white hover:text-rose-600 transition-colors'}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
