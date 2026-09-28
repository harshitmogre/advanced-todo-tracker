'use client';

import { ReactNode } from 'react';
import { X } from 'lucide-react';

export default function Modal({ open, onClose, title, children }: { open: boolean; onClose: () => void; title: string; children: ReactNode }) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm animate-popIn" onClick={onClose} />
      <div className="relative z-10 w-full max-w-lg animate-popIn rounded-xl2 border border-slate-200 bg-panel-light p-5 shadow-glow dark:border-slate-800 dark:bg-panel-dark max-h-[90vh] overflow-y-auto">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-base font-bold">{title}</h2>
          <button onClick={onClose} className="rounded-md p-1 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800">
            <X size={18} />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}
