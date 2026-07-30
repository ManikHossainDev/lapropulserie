'use client';

import { createContext, useCallback, useContext, useMemo, useRef, useState } from 'react';
import { FaExclamationTriangle } from 'react-icons/fa';

const ConfirmContext = createContext(null);

export function ConfirmProvider({ children }) {
  const [opts, setOpts] = useState(null);
  const resolverRef = useRef(null);

  const confirm = useCallback((options) => {
    setOpts(options);
    return new Promise((resolve) => {
      resolverRef.current = resolve;
    });
  }, []);

  const handleClose = (result) => {
    if (resolverRef.current) resolverRef.current(result);
    resolverRef.current = null;
    setOpts(null);
  };

  const value = useMemo(() => ({ confirm }), [confirm]);

  return (
    <ConfirmContext.Provider value={value}>
      {children}
      {opts && (
        <div className="fixed inset-0 z-[90] bg-black/40 flex items-center justify-center p-4 animate-in fade-in duration-150" onClick={() => handleClose(false)}>
          <div className="bg-white rounded-xl shadow-2xl max-w-sm w-full p-5 animate-in zoom-in-95 duration-150" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-start gap-3 mb-4">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${opts.destructive ? 'bg-red-100 text-red-600' : 'bg-blue-100 text-[#2E2A5A]'}`}>
                <FaExclamationTriangle size={20} />
              </div>
              <div className="flex-1">
                <h3 className="text-base font-semibold text-gray-900">{opts.title}</h3>
                {opts.description && <p className="text-sm text-gray-600 mt-1">{opts.description}</p>}
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <button onClick={() => handleClose(false)} className="px-4 py-2 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-100 transition-colors">
                {opts.cancelLabel ?? 'Cancel'}
              </button>
              <button autoFocus onClick={() => handleClose(true)} className={`px-4 py-2 rounded-lg text-sm font-medium text-white transition-colors ${opts.destructive ? 'bg-red-600 hover:bg-red-700' : 'bg-[#2E2A5A] hover:bg-[#3d3870]'}`}>
                {opts.confirmLabel ?? 'Confirm'}
              </button>
            </div>
          </div>
        </div>
      )}
    </ConfirmContext.Provider>
  );
}

export function useConfirm() {
  const ctx = useContext(ConfirmContext);
  if (!ctx) throw new Error('useConfirm must be used within ConfirmProvider');
  return ctx.confirm;
}