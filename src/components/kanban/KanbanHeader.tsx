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
    <div className="sticky top-0 z-40 bg-slate-50 -mx-4 md:-mx-6 px-4 md:px-6 pt-4 pb-6 mb-6 border-b border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-y-4 md:gap-x-12 shadow-sm">
      <div className="flex flex-col gap-1">
        <div className="flex items-center gap-2">
          <h2 className="text-2xl font-bold text-[#0f172a] font-outfit uppercase tracking-tight leading-none">
            Facebook Page Setup
          </h2>
        </div>
        <p className="text-slate-400 font-noto text-[11px] mt-1.5 flex items-center gap-2">
          {viewMode === 'pages' ? "One Active per box • 20 Units Max" : "Manage Facebook Credentials for each box"} • <span className="text-[var(--primary-theme)] font-bold">Deployment Hub</span>
        </p>
      </div>

      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <button
            onClick={onOpenConfig}
            className="p-3 bg-white border border-slate-200 text-slate-500 hover:text-[var(--primary-theme)] hover:border-[var(--primary-theme)] rounded-2xl transition-all shadow-sm hover:shadow-md"
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
        </div>

        <button
          onClick={() => viewMode === 'pages' ? onAddPage() : onAddAccount()}
          className="bg-[var(--primary-theme)] hover:bg-[var(--primary-theme-hover)] text-white px-5 py-2.5 rounded-2xl font-bold font-noto flex items-center gap-2 transition-all shadow-lg shadow-blue-100 text-sm whitespace-nowrap flex-shrink-0"
        >
          <Plus size={18} />
          <span className="hidden sm:inline">{viewMode === 'pages' ? "เพิ่มเพจใหม่" : "เพิ่มบัญชีใหม่"}</span>
        </button>

        {/* Minimal Theme-Based Mode Toggle - Now at Far Right (Height-Aligned) */}
        <div className="relative flex bg-gradient-to-br from-[var(--primary-theme)] to-[var(--primary-theme-hover)] p-1 rounded-2xl shadow-lg border border-white/10 overflow-hidden">
          {/* Animated White Pill */}
          <div
            className={cn(
              "absolute top-1 bottom-1 w-[40px] bg-white rounded-xl shadow-md transition-all duration-300 ease-in-out",
              viewMode === 'pages' ? "left-1" : "left-[43px]"
            )}
          />
          <button
            onClick={() => setViewMode('pages')}
            className={cn(
              "relative z-10 w-[40px] h-[32px] flex items-center justify-center rounded-xl transition-all duration-300",
              viewMode === 'pages' ? "text-[var(--primary-theme)]" : "text-white/70 hover:text-white"
            )}
            title="Pages View"
          >
            <LayoutGrid size={16} />
          </button>
          <button
            onClick={() => setViewMode('accounts')}
            className={cn(
              "relative z-10 w-[40px] h-[32px] flex items-center justify-center rounded-xl transition-all duration-300",
              viewMode === 'accounts' ? "text-[var(--primary-theme)]" : "text-white/70 hover:text-white"
            )}
            title="Accounts View"
          >
            <Shield size={16} />
          </button>
        </div>
      </div>
    </div>
  );
};
