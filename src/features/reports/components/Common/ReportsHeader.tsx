'use client';

import React from 'react';
import { Search, FileText, BarChart2, Briefcase, ArrowUpDown, Check, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ReportsHeaderProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  viewMode: 'report' | 'stats' | 'leaves';
  onViewModeChange: (mode: 'report' | 'stats' | 'leaves') => void;
  isReorderMode?: boolean;
  onToggleReorder?: () => void;
  onSaveOrder?: () => void;
  isSavingOrder?: boolean;
}

export const ReportsHeader: React.FC<ReportsHeaderProps> = ({
  searchTerm,
  onSearchChange,
  viewMode,
  onViewModeChange,
  isReorderMode = false,
  onToggleReorder,
  onSaveOrder,
  isSavingOrder = false,
}) => {
  return (
    <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 border-b border-slate-200 pt-4 pb-6 mb-6">
      <div className="flex flex-col gap-1">
        <div className="flex items-center gap-2">
          <h2 className="text-2xl font-bold text-[#0f172a] font-outfit uppercase tracking-tight leading-none">
            REPORTS & STATISTICS
          </h2>
        </div>
        <p className="text-slate-400 font-noto text-[11px] mt-1.5 flex items-center gap-2">
          รายงานและสถิติการปฏิบัติงานรายบุคคล • <span className="text-[var(--primary-theme)] font-bold">Command Console</span>
        </p>
      </div>

      <div className="flex flex-col sm:flex-row items-center gap-4 w-full md:w-auto">
        {/* 🔢 Reorder Controls */}
        {viewMode === 'report' && onToggleReorder && (
          <div className="flex items-center gap-2 shrink-0">
            {isReorderMode ? (
              <button
                onClick={onSaveOrder}
                disabled={isSavingOrder}
                className={cn(
                  "flex items-center gap-2 px-4 py-2.5 rounded-xl text-[11px] font-bold transition-all border",
                  isSavingOrder
                    ? "bg-slate-50 border-slate-100 text-slate-400 cursor-wait"
                    : "bg-emerald-500 border-emerald-500 text-white hover:bg-emerald-600 shadow-md shadow-emerald-500/20"
                )}
              >
                {isSavingOrder ? (
                  <Loader2 size={13} className="animate-spin" />
                ) : (
                  <Check size={13} />
                )}
                {isSavingOrder ? 'Saving...' : 'Save Order'}
              </button>
            ) : null}
            <button
              onClick={onToggleReorder}
              className={cn(
                "flex items-center gap-2 px-4 py-2.5 rounded-xl text-[11px] font-bold transition-all border",
                isReorderMode
                  ? "bg-rose-50 border-rose-100 text-rose-500 hover:bg-rose-100"
                  : "bg-white border-slate-100 text-slate-500 hover:border-blue-200 hover:text-[var(--primary-theme)] shadow-sm"
              )}
            >
              <ArrowUpDown size={13} />
              {isReorderMode ? 'Cancel' : 'Reorder'}
            </button>
          </div>
        )}

        {/* Search Matrix */}
        <div className="relative group w-full sm:w-64">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-[var(--primary-theme)] transition-colors" size={16} />
          <input 
            type="text"
            placeholder="Search by name..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full bg-white border border-slate-100 rounded-2xl pl-11 pr-4 py-3 text-[13px] font-medium text-slate-900 focus:outline-none focus:border-[var(--primary-theme)] focus:ring-4 focus:ring-blue-100/50 transition-all placeholder:text-slate-300 shadow-sm"
          />
        </div>

        {/* Mode Switcher (Sliding Matrix) */}
        <div className="relative flex bg-[var(--primary-theme)] p-1 rounded-2xl shadow-inner shadow-blue-900/20 h-[40px] z-10 shrink-0 w-full sm:w-[126px]">
          {/* Sliding Pill */}
          <div 
            className="absolute top-1 bottom-1 w-[38px] bg-white rounded-xl shadow-md transition-transform duration-300 ease-out z-0"
            style={{ 
              transform: viewMode === 'report' ? 'translateX(0)' : viewMode === 'stats' ? 'translateX(100%)' : 'translateX(200%)' 
            }}
          />
          
          <button 
            onClick={() => onViewModeChange('report')}
            title="Report Matrix"
            className={cn(
              "relative z-10 flex-1 flex items-center justify-center transition-colors duration-300",
              viewMode === 'report' ? "text-[var(--primary-theme)] drop-shadow-sm" : "text-white/60 hover:text-white"
            )}
          >
            <FileText size={18} />
          </button>
          <button 
            onClick={() => onViewModeChange('stats')}
            title="Performance Statistics"
            className={cn(
              "relative z-10 flex-1 flex items-center justify-center transition-colors duration-300",
              viewMode === 'stats' ? "text-[var(--primary-theme)] drop-shadow-sm" : "text-white/60 hover:text-white"
            )}
          >
            <BarChart2 size={18} />
          </button>
          <button 
            onClick={() => onViewModeChange('leaves')}
            title="Personnel Leave Audit"
            className={cn(
              "relative z-10 flex-1 flex items-center justify-center transition-colors duration-300",
              viewMode === 'leaves' ? "text-[var(--primary-theme)] drop-shadow-sm" : "text-white/60 hover:text-white"
            )}
          >
            <Briefcase size={18} />
          </button>
        </div>
      </div>
    </div>
  );
};
