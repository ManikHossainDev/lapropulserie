'use client';

import { createContext, useCallback, useContext, useMemo, useState } from 'react';
import { FaCheck, FaExclamationCircle, FaInfo, FaTimes } from 'react-icons/fa';

const ToastContext = createContext(null);

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const dismiss = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const show = useCallback((message, variant = 'info', duration = 3000) => {
    const id = Math.random().toString(36).slice(2, 9);
    setToasts((prev) => [...prev, { id, message, variant, duration }]);
    if (duration > 0) {
      setTimeout(() => dismiss(id), duration);
    }
  }, [dismiss]);

  const value = useMemo(() => ({ toasts, show, dismiss }), [toasts, show, dismiss]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <ToastViewport toasts={toasts} onDismiss={dismiss} />
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within ToastProvider');
  return ctx;
}

function ToastViewport({ toasts, onDismiss }) {
  return (
    <div className="fixed top-4 right-4 z-[100] flex flex-col gap-2 pointer-events-none">
      {toasts.map((t) => (
        <ToastItem key={t.id} toast={t} onDismiss={onDismiss} />
      ))}
    </div>
  );
}

function ToastItem({ toast, onDismiss }) {
  const styles = {
    success: 'bg-emerald-600 text-white',
    error: 'bg-red-600 text-white',
    info: 'bg-[#2E2A5A] text-white',
  };
  const Icon = toast.variant === 'success' ? FaCheck : toast.variant === 'error' ? FaExclamationCircle : FaInfo;

  return (
    <div role="status" className={`pointer-events-auto min-w-[280px] max-w-md px-4 py-3 rounded-lg shadow-lg flex items-start gap-2.5 animate-in fade-in slide-in-from-top-2 duration-200 ${styles[toast.variant]}`}>
      <Icon size={18} className="mt-0.5 shrink-0" />
      <span className="font-medium text-sm flex-1">{toast.message}</span>
      <button onClick={() => onDismiss(toast.id)} className="opacity-80 hover:opacity-100 transition-opacity shrink-0" aria-label="Dismiss">
        <FaTimes size={16} />
      </button>
    </div>
  );
}