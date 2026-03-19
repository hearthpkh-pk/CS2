'use client';

import React from 'react';
import { LayoutGrid, Shield, Settings, Plus, Trash2 } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface KanbanHeaderProps {
  viewMode: 'pages' | 'accounts';
  setViewMode: (mode: 'pages' | 'accounts') => void;
  onOpenConfig: () => void;
  onAddPage: () => void;
  onAddAccount: () => void;
  onOpenTrash: () => void;
  trashCount: number;
}

export const KanbanHeader = ({
  viewMode,
  setViewMode,
  onOpenConfig,
  onAddPage,
  onAddAccount,
  onOpenTrash,
  trashCount
}: KanbanHeaderProps) => {
  return (
    <div className="sticky top-0 z-40 bg-slate-50 -mx-4 md:-mx-6 px-4 md:px-6 pt-4 pb-6 mb-6 border-b border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-sm">
      <div className="flex flex-col gap-1">
        <div className="flex items-center gap-2">
          <h2 className="text-2xl font-bold text-[#0f172a] font-outfit uppercase tracking-tight leading-none">Kanban Setup</h2>
          <div className="flex bg-slate-100 p-1 rounded-xl ml-4">
            <button
              onClick={() => setViewMode('pages')}
              className={cn(
                "px-4 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-2",
                viewMode === 'pages' ? "bg-white text-[var(--primary-blue)] shadow-sm" : "text-slate-500 hover:text-slate-700"
              )}
            >
              <LayoutGrid size={14} />
              <span>Pages</span>
            </button>
            <button
              onClick={() => setViewMode('accounts')}
              className={cn(
                "px-4 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-2",
                viewMode === 'accounts' ? "bg-white text-[var(--primary-blue)] shadow-sm" : "text-slate-500 hover:text-slate-700"
              )}
            >
              <Shield size={14} />
              <span>Accounts</span>
            </button>
          </div>
        </div>
        <p className="text-slate-400 font-noto text-[11px] mt-1.5">
          {viewMode === 'pages' ? "One Active per box • 20 Units Max" : "Manage Facebook Credentials for each box"}
        </p>
      </div>
      <div className="flex items-center gap-3">
        <button
          onClick={onOpenConfig}
          className="p-3 bg-white border border-slate-200 text-slate-500 hover:text-[var(--primary-blue)] hover:border-[var(--primary-blue)] rounded-2xl transition-all shadow-sm hover:shadow-md"
          title="ตั้งค่ากล่อง"
        >
          <Settings size={18} />
        </button>
        <button
          onClick={onOpenTrash}
          className="p-3 bg-white border border-slate-200 text-slate-500 hover:text-red-500 hover:border-red-200 rounded-2xl transition-all shadow-sm hover:shadow-md relative group"
          title="ถังขยะ"
        >
          <Trash2 size={18} />
          {trashCount > 0 && (
            <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center border-2 border-white shadow-sm group-hover:scale-110 transition-transform">
              {trashCount}
            </span>
          )}
        </button>
        <button
          onClick={() => viewMode === 'pages' ? onAddPage() : onAddAccount()}
          className="bg-[var(--primary-blue)] hover:bg-[#0b5ed7] text-white px-5 py-2.5 rounded-2xl font-bold font-noto flex items-center gap-2 transition-all shadow-lg shadow-blue-200 text-sm"
        >
          <Plus size={18} />
          <span>{viewMode === 'pages' ? "เพิ่มเพจใหม่" : "เพิ่มบัญชีใหม่"}</span>
        </button>
      </div>
    </div>
  );
};
