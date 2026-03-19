'use client';

import React from 'react';
import { Plus } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface BoxConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  boxes: number[];
  activeBoxes: number[];
  onToggle: (boxId: number) => void;
  onShowAll: () => void;
}

export const BoxConfigModal = ({
  isOpen,
  onClose,
  boxes,
  activeBoxes,
  onToggle,
  onShowAll
}: BoxConfigModalProps) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[110] overflow-hidden font-prompt">
      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-md" onClick={onClose} />
      <div className="absolute inset-0 flex items-center justify-center p-4">
        <div className="w-full max-w-2xl bg-white rounded-[2.5rem] shadow-2xl animate-fade-in overflow-hidden">
          <div className="px-10 py-8 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
            <div>
              <h3 className="text-2xl font-bold text-[#0f172a]">ตั้งค่าการแสดงผลกล่อง</h3>
              <p className="text-sm text-slate-400 mt-1">เลือกเปิดหรือปิดกล่องที่ต้องการแสดงบนบอร์ด (สูงสุด 20 กล่อง)</p>
            </div>
            <button onClick={onClose} className="w-12 h-12 flex items-center justify-center bg-white border border-slate-100 rounded-2xl text-slate-400 hover:text-slate-600 hover:border-slate-200 transition-all shadow-sm">
              <Plus size={28} className="rotate-45" />
            </button>
          </div>

          <div className="p-10">
            <div className="grid grid-cols-4 sm:grid-cols-5 gap-4">
              {boxes.map(boxId => (
                <button
                  key={boxId}
                  onClick={() => onToggle(boxId)}
                  className={cn(
                    "h-20 rounded-2xl border-2 flex flex-col items-center justify-center gap-1 transition-all group",
                    activeBoxes.includes(boxId)
                      ? "bg-[var(--primary-blue)] border-[var(--primary-blue)] text-white shadow-lg shadow-blue-200 scale-[1.02]"
                      : "bg-white border-slate-100 text-slate-400 hover:border-slate-200 hover:bg-slate-50"
                  )}
                >
                  <span className="text-lg font-bold font-outfit">{boxId}</span>
                  <span className={cn(
                    "text-[9px] font-bold uppercase tracking-widest transition-opacity",
                    activeBoxes.includes(boxId) ? "opacity-100" : "opacity-0 group-hover:opacity-40"
                  )}>
                    ACTIVE
                  </span>
                </button>
              ))}
            </div>

            <div className="mt-10 flex gap-4">
              <button 
                onClick={onShowAll}
                className="flex-1 py-4 rounded-2xl border border-slate-200 text-slate-500 font-bold hover:bg-slate-50 transition-all font-noto"
              >
                เปิดทั้งหมด
              </button>
              <button 
                onClick={onClose}
                className="flex-1 py-4 bg-[var(--primary-blue)] text-white rounded-2xl font-bold shadow-lg shadow-blue-200 hover:bg-[#0b5ed7] transition-all font-noto"
              >
                ตกลง
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
