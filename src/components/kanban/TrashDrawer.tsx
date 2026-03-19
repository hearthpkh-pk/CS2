'use client';

import React from 'react';
import { Trash2, RotateCcw, X, AlertTriangle, Shield, LayoutGrid } from 'lucide-react';
import { Page, FBAccount } from '@/types';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface TrashDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  deletedPages: Page[];
  deletedAccounts: FBAccount[];
  onRestorePage: (id: string) => void;
  onRestoreAccount: (id: string) => void;
  onPermanentDeletePage: (id: string) => void;
  onPermanentDeleteAccount: (id: string) => void;
  onClearAll: () => void;
}

export const TrashDrawer = ({
  isOpen,
  onClose,
  deletedPages,
  deletedAccounts,
  onRestorePage,
  onRestoreAccount,
  onPermanentDeletePage,
  onPermanentDeleteAccount,
  onClearAll
}: TrashDrawerProps) => {
  const totalItems = deletedPages.length + deletedAccounts.length;

  return (
    <div className={cn(
      "fixed inset-0 z-[110] transition-visibility duration-300",
      isOpen ? "visible" : "invisible"
    )}>
      {/* Backdrop */}
      <div 
        className={cn(
          "absolute inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity duration-300",
          isOpen ? "opacity-100" : "opacity-0"
        )}
        onClick={onClose}
      />
      
      {/* Drawer */}
      <div className={cn(
        "absolute right-0 top-0 h-full w-full max-w-md bg-white shadow-2xl transition-transform duration-300 transform flex flex-col",
        isOpen ? "translate-x-0" : "translate-x-full"
      )}>
        {/* Header */}
        <div className="p-8 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-red-50 text-red-500 rounded-3xl flex items-center justify-center shadow-sm">
              <Trash2 size={24} />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-800 font-outfit uppercase tracking-tight leading-none">
                ถังขยะ (Trash Bin)
              </h2>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">
                {totalItems} Items waiting for action
              </p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-3 text-slate-400 hover:text-slate-600 hover:bg-white rounded-2xl transition-all border border-transparent hover:border-slate-200"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-8 scroll-smooth custom-scrollbar">
          {totalItems === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-8 space-y-4">
              <div className="w-20 h-20 bg-slate-50 rounded-[2.5rem] flex items-center justify-center text-slate-200">
                <Trash2 size={40} />
              </div>
              <div>
                <h3 className="text-slate-400 font-bold font-noto uppercase tracking-tight">ถังขยะว่างเปล่า</h3>
                <p className="text-[10px] text-slate-300 font-bold uppercase tracking-widest mt-1">
                  Nothing to see here
                </p>
              </div>
            </div>
          ) : (
            <>
              {/* Pages Section */}
              {deletedPages.length > 0 && (
                <div className="space-y-4">
                  <div className="flex items-center gap-2 px-2">
                    <div className="w-1 h-4 bg-[var(--primary-blue)] rounded-full" />
                    <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">Pages ({deletedPages.length})</span>
                  </div>
                  <div className="space-y-2">
                    {deletedPages.map(page => (
                      <div key={page.id} className="bg-slate-50 p-4 rounded-3xl border border-slate-100 flex items-center justify-between group hover:bg-white hover:shadow-md transition-all">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-white rounded-2xl flex items-center justify-center text-slate-400 shadow-sm border border-slate-100">
                            <LayoutGrid size={18} />
                          </div>
                          <div>
                            <h4 className="text-sm font-bold text-slate-700 font-noto truncate max-w-[150px]">{page.name}</h4>
                            <p className="text-[10px] text-slate-400 font-mono">Box #{page.boxId}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button 
                            onClick={() => onRestorePage(page.id)}
                            className="p-2.5 text-blue-500 hover:bg-blue-50 rounded-xl transition-all"
                            title="Restore"
                          >
                            <RotateCcw size={16} />
                          </button>
                          <button 
                            onClick={() => onPermanentDeletePage(page.id)}
                            className="p-2.5 text-red-400 hover:bg-red-50 rounded-xl transition-all"
                            title="Delete Permanently"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Accounts Section */}
              {deletedAccounts.length > 0 && (
                <div className="space-y-4">
                  <div className="flex items-center gap-2 px-2">
                    <div className="w-1 h-4 bg-emerald-500 rounded-full" />
                    <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">Accounts ({deletedAccounts.length})</span>
                  </div>
                  <div className="space-y-2">
                    {deletedAccounts.map(acc => (
                      <div key={acc.id} className="bg-slate-50 p-4 rounded-3xl border border-slate-100 flex items-center justify-between group hover:bg-white hover:shadow-md transition-all">
                        <div className="flex items-center gap-3">
                          <div className={cn(
                            "w-10 h-10 rounded-2xl flex items-center justify-center shadow-sm border",
                            acc.status === 'Admin' ? "bg-blue-600 text-white border-blue-400" : "bg-white text-slate-400 border-slate-100"
                          )}>
                            <Shield size={18} />
                          </div>
                          <div>
                            <h4 className="text-sm font-bold text-slate-700 font-noto truncate max-w-[150px]">{acc.name}</h4>
                            <p className="text-[10px] text-slate-400 font-mono">UID: {acc.uid.slice(0, 8)}...</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button 
                            onClick={() => onRestoreAccount(acc.id)}
                            className="p-2.5 text-blue-500 hover:bg-blue-50 rounded-xl transition-all"
                            title="Restore"
                          >
                            <RotateCcw size={16} />
                          </button>
                          <button 
                            onClick={() => onPermanentDeleteAccount(acc.id)}
                            className="p-2.5 text-red-400 hover:bg-red-50 rounded-xl transition-all"
                            title="Delete Permanently"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer */}
        {totalItems > 0 && (
          <div className="p-8 border-t border-slate-100 bg-slate-50/50">
            <button
              onClick={onClearAll}
              className="w-full py-4 bg-red-600 hover:bg-red-700 text-white rounded-2xl font-bold font-noto flex items-center justify-center gap-2 shadow-lg shadow-red-100 transition-all active:scale-95"
            >
              <AlertTriangle size={18} />
              ลบทั้งหมดถาวร (Clear All Permanently)
            </button>
            <p className="text-[9px] text-slate-400 text-center mt-4 font-bold uppercase tracking-tighter">
              Warning: This action cannot be undone
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
