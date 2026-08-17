import React, { createContext, useContext, useState, useCallback } from 'react';
import { AlertCircle, CheckCircle2, AlertTriangle, Info, X } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface ToastItem {
  id: string;
  type: ToastType;
  title: string;
  message?: string;
  duration?: number;
}

interface ToastContextType {
  toasts: ToastItem[];
  addToast: (type: ToastType, title: string, message?: string, duration?: number) => void;
  removeToast: (id: string) => void;
  showError: (title: string, message?: string) => void;
  showSuccess: (title: string, message?: string) => void;
  showWarning: (title: string, message?: string) => void;
  showInfo: (title: string, message?: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const addToast = useCallback(
    (type: ToastType, title: string, message?: string, duration = 4500) => {
      const id = `toast_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
      const newToast: ToastItem = { id, type, title, message, duration };

      setToasts((prev) => [...prev, newToast]);

      if (duration > 0) {
        setTimeout(() => {
          removeToast(id);
        }, duration);
      }
    },
    [removeToast]
  );

  const showError = useCallback((title: string, message?: string) => {
    addToast('error', title, message);
  }, [addToast]);

  const showSuccess = useCallback((title: string, message?: string) => {
    addToast('success', title, message);
  }, [addToast]);

  const showWarning = useCallback((title: string, message?: string) => {
    addToast('warning', title, message);
  }, [addToast]);

  const showInfo = useCallback((title: string, message?: string) => {
    addToast('info', title, message);
  }, [addToast]);

  return (
    <ToastContext.Provider
      value={{
        toasts,
        addToast,
        removeToast,
        showError,
        showSuccess,
        showWarning,
        showInfo,
      }}
    >
      {children}
      <ToastContainer toasts={toasts} removeToast={removeToast} />
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast deve ser usado dentro de um ToastProvider');
  }
  return context;
};

const ToastContainer: React.FC<{ toasts: ToastItem[]; removeToast: (id: string) => void }> = ({
  toasts,
  removeToast,
}) => {
  if (toasts.length === 0) return null;

  return (
    <div
      id="toast-container"
      className="fixed top-5 right-5 z-50 flex flex-col gap-2.5 max-w-sm w-full px-4 pointer-events-none"
    >
      {toasts.map((toast) => (
        <ToastCard key={toast.id} toast={toast} onClose={() => removeToast(toast.id)} />
      ))}
    </div>
  );
};

const ToastCard: React.FC<{ toast: ToastItem; onClose: () => void }> = ({ toast, onClose }) => {
  const { type, title, message } = toast;

  const styles = {
    error: {
      bg: 'bg-white border-rose-200 shadow-rose-100',
      iconBg: 'bg-rose-100 text-rose-600',
      titleColor: 'text-rose-950',
      Icon: AlertCircle,
      badge: 'Erro de Autenticação',
      badgeBg: 'bg-rose-100 text-rose-800',
    },
    success: {
      bg: 'bg-white border-emerald-200 shadow-emerald-100',
      iconBg: 'bg-emerald-100 text-emerald-600',
      titleColor: 'text-emerald-950',
      Icon: CheckCircle2,
      badge: 'Sucesso',
      badgeBg: 'bg-emerald-100 text-emerald-800',
    },
    warning: {
      bg: 'bg-white border-amber-200 shadow-amber-100',
      iconBg: 'bg-amber-100 text-amber-600',
      titleColor: 'text-amber-950',
      Icon: AlertTriangle,
      badge: 'Atenção',
      badgeBg: 'bg-amber-100 text-amber-800',
    },
    info: {
      bg: 'bg-white border-purple-200 shadow-purple-100',
      iconBg: 'bg-purple-100 text-purple-600',
      titleColor: 'text-purple-950',
      Icon: Info,
      badge: 'Informação',
      badgeBg: 'bg-purple-100 text-purple-800',
    },
  }[type];

  const IconComponent = styles.Icon;

  return (
    <div
      className={`pointer-events-auto p-4 rounded-2xl border shadow-xl flex items-start gap-3 transition-all transform animate-slideInRight ${styles.bg}`}
      role="alert"
    >
      <div className={`p-2 rounded-xl shrink-0 ${styles.iconBg}`}>
        <IconComponent className="w-5 h-5" />
      </div>

      <div className="flex-1 min-w-0 pr-1">
        <div className="flex items-center gap-2 mb-0.5">
          <span className={`text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-full ${styles.badgeBg}`}>
            {styles.badge}
          </span>
        </div>
        <h4 className={`text-xs font-bold leading-snug ${styles.titleColor}`}>{title}</h4>
        {message && <p className="text-[11px] text-slate-600 mt-1 leading-relaxed">{message}</p>}
      </div>

      <button
        onClick={onClose}
        className="text-slate-400 hover:text-slate-700 p-1 rounded-lg hover:bg-slate-100 transition-colors shrink-0 cursor-pointer"
        title="Fechar notificação"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
};
