'use client';

import React from 'react';
import { Plus } from 'lucide-react';

interface SmartImportSectionProps {
  importText: string;
  setImportText: (text: string) => void;
  onParse: (text: string) => void;
}

export const SmartImportSection = ({
  importText,
  setImportText,
  onParse
}: SmartImportSectionProps) => {
  return (
    <div className="space-y-3 p-5 bg-[var(--primary-theme-bg)]/50 rounded-[2rem] border border-[var(--primary-theme-border)] border-dashed">
      <div className="flex items-center justify-between px-1">
        <span className="text-[10px] font-bold text-[var(--primary-theme)] uppercase tracking-widest flex items-center gap-2">
            <Plus size={12} /> Smart Import / Paste
        </span>
        <div className="flex items-center gap-3">
          <button 
            type="button"
            onClick={() => setImportText('')}
            className="text-[9px] font-bold text-slate-400 hover:text-red-500 transition-colors uppercase tracking-widest"
          >
            Clear
          </button>
          <span className="text-[9px] font-bold text-[var(--primary-theme)] opacity-40 uppercase tracking-widest">Multi-Data Support</span>
        </div>
      </div>
      <textarea 
        value={importText}
        onChange={(e) => {
          setImportText(e.target.value);
          onParse(e.target.value);
        }}
        placeholder="วางข้อมูลทั้งชุดที่นี่ (รองรับ UID|Pass|2FA|Mail1|Pass1|Mail2...)"
        className="w-full bg-white border border-[var(--primary-theme-border)] rounded-2xl px-4 py-3 outline-none focus:ring-2 focus:ring-[var(--primary-theme)]/10 focus:border-[var(--primary-theme)]/50 transition-all text-xs font-inter resize-none h-20 placeholder:text-slate-300"
      />
    </div>
  );
};
