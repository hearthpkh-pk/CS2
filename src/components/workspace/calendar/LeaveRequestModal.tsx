'use client';

import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { format } from 'date-fns';
import { MoreHorizontal } from 'lucide-react';

interface LeaveRequestModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedDate: Date;
  leaveReason: string;
  setLeaveReason: (reason: string) => void;
  onConfirm: () => void;
}

export const LeaveRequestModal: React.FC<LeaveRequestModalProps> = ({
  isOpen,
  onClose,
  selectedDate,
  leaveReason,
  setLeaveReason,
  onConfirm,
}) => {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  if (!isOpen || !mounted) return null;

  return createPortal(
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div 
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" 
        onClick={onClose} 
      />
      <div className="relative bg-white w-full max-w-md rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 border border-slate-100">
        
        {/* Header — date is the hero */}
        <div className="p-8 pb-6 text-center border-b border-slate-50">
          <p className="text-xs text-slate-400 uppercase tracking-wider font-noto mb-2">ขอลางานวันที่</p>
          <h3 className="text-3xl font-outfit text-slate-900 tracking-tight leading-none">
            {format(selectedDate, 'd MMMM yyyy')}
          </h3>
          <p className="text-sm text-slate-400 font-noto mt-1">
            {format(selectedDate, 'EEEE')}
          </p>
        </div>

        {/* Body — reason is optional */}
        <div className="p-6">
          <label className="text-xs text-slate-400 font-noto">หมายเหตุ <span className="text-slate-300">(ไม่จำเป็น)</span></label>
          <textarea 
            value={leaveReason}
            onChange={(e) => setLeaveReason(e.target.value)}
            placeholder="เช่น ไม่สบาย, ธุระส่วนตัว..."
            rows={2}
            className="w-full mt-2 bg-slate-50 border border-slate-100 rounded-2xl px-5 py-3 text-sm font-noto outline-none focus:ring-2 focus:ring-[var(--primary-theme)]/20 transition-all resize-none placeholder:text-slate-300"
          />
        </div>

        {/* Footer */}
        <div className="p-6 bg-slate-50/50 flex gap-3">
          <button 
            onClick={onClose} 
            className="flex-1 py-3.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-2xl font-noto transition-all active:scale-95 text-sm"
          >
            ยกเลิก
          </button>
          <button 
            onClick={onConfirm} 
            className="flex-[2] py-3.5 bg-[var(--primary-theme)] hover:bg-[#1e40af] text-white rounded-2xl font-noto transition-all shadow-lg active:scale-95 text-sm"
          >
            ยืนยันการลา
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
};
