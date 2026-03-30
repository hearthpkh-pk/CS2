'use client';

import React from 'react';
import { AlertTriangle, X } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: 'danger' | 'warning' | 'info';
}

export const ConfirmationModal = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmLabel = 'ยืนยัน',
  cancelLabel = 'ยกเลิก',
  variant = 'danger'
}: ConfirmationModalProps) => {
  if (!isOpen) return null;

  const colors = {
    danger: 'bg-red-600 hover:bg-red-700 shadow-red-100 text-white',
    warning: 'bg-amber-500 hover:bg-amber-600 shadow-amber-100 text-white',
    info: 'bg-blue-600 hover:bg-blue-700 shadow-blue-100 text-white'
  };

  const icons = {
    danger: <AlertTriangle className="text-red-600" size={24} />,
    warning: <AlertTriangle className="text-amber-500" size={24} />,
    info: <AlertTriangle className="text-blue-600" size={24} />
  };

  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (isOpen && e.key === 'Enter') {
        onConfirm();
        onClose();
      } else if (isOpen && e.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onConfirm, onClose]);

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div 
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" 
        onClick={onClose}
      />
      
      <div className="relative bg-white w-full max-w-md rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 border border-slate-100">
        <div className="p-8">
          <div className="flex items-center justify-center w-16 h-16 rounded-3xl bg-slate-50 mb-6 mx-auto">
            {icons[variant]}
          </div>
          
          <div className="text-center space-y-2 mb-8">
            <h3 className="text-xl font-bold text-slate-800 font-outfit uppercase tracking-tight leading-none">
              {title}
            </h3>
            <p className="text-slate-500 text-sm font-noto leading-relaxed">
              {message}
            </p>
          </div>
          
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 py-4 px-6 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-2xl font-bold font-noto transition-all active:scale-95"
            >
              {cancelLabel}
            </button>
            <button
              onClick={() => {
                onConfirm();
                onClose();
              }}
              className={cn(
                "flex-2 py-4 px-8 rounded-2xl font-bold font-noto transition-all shadow-lg active:scale-95",
                colors[variant]
              )}
            >
              {confirmLabel}
            </button>
          </div>
        </div>
        
        <button 
          onClick={onClose}
          className="absolute top-6 right-6 p-2 text-slate-400 hover:text-slate-600 transition-all rounded-xl hover:bg-slate-50"
        >
          <X size={20} />
        </button>
      </div>
    </div>
  );
};
