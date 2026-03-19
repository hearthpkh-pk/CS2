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
    <div className="space-y-3 p-5 bg-blue-50/50 rounded-[2rem] border border-blue-100 border-dashed">
      <div className="flex items-center justify-between px-1">
        <span className="text-[10px] font-bold text-[var(--primary-blue)] uppercase tracking-widest flex items-center gap-2">
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
          <span className="text-[9px] font-bold text-blue-300">MULTI-DATA SUPPORT</span>
        </div>
      </div>
      <textarea 
        value={importText}
        onChange={(e) => {
          setImportText(e.target.value);
          onParse(e.target.value);
        }}
        placeholder="วางข้อมูลทั้งชุดที่นี่ (รองรับ UID|Pass|2FA|Mail1|Pass1|Mail2...)"
        className="w-full bg-white border border-blue-100 rounded-2xl px-4 py-3 outline-none focus:ring-2 focus:ring-[var(--primary-blue)]/10 focus:border-[var(--primary-blue)]/50 transition-all text-xs font-inter resize-none h-20 placeholder:text-blue-200"
      />
    </div>
  );
};
