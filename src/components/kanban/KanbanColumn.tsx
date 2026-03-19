'use client';

import React from 'react';
import { Plus, Shield } from 'lucide-react';
import { Page, FBAccount } from '@/types';
import { PageCard } from './PageCard';
import { AccountCard } from './AccountCard';

interface KanbanColumnProps {
  boxId: number;
  viewMode: 'pages' | 'accounts';
  pages: Page[];
  accounts: FBAccount[];
  handleOpenAdd: (boxId: number) => void;
  handleEdit: (page: Page) => void;
  onDelete: (id: string) => void;
  handleDragStart: (e: React.DragEvent, id: string) => void;
  handleDragOver: (e: React.DragEvent) => void;
  handleDragLeave: (e: React.DragEvent) => void;
  handleDrop: (e: React.DragEvent, boxId: number) => void;
  handleOpenAccountAdd: (boxId: number) => void;
  handleAccountEdit: (acc: FBAccount) => void;
  onDeleteAccount: (id: string) => void;
}

export const KanbanColumn = ({
  boxId,
  viewMode,
  pages,
  accounts,
  handleOpenAdd,
  handleEdit,
  onDelete,
  handleDragStart,
  handleDragOver,
  handleDragLeave,
  handleDrop,
  handleOpenAccountAdd,
  handleAccountEdit,
  onDeleteAccount
}: KanbanColumnProps) => {
  return (
    <div className="flex flex-col h-full min-h-[300px]">
      <div className="flex items-center justify-between mb-3 px-2">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 bg-[var(--primary-blue)] text-white rounded-lg flex items-center justify-center text-xs font-bold font-outfit shadow-sm shadow-blue-100">
            {boxId}
          </div>
          <span className="font-bold text-slate-700 text-sm font-noto">
            กล่องที่ {boxId}
          </span>
        </div>
        <span className="text-[10px] bg-blue-50 text-[var(--primary-blue)] font-bold px-2 py-0.5 rounded-full font-inter">
          {viewMode === 'pages' ? pages.length : accounts.length} {viewMode === 'pages' ? 'PAGES' : 'ACC'}
        </span>
      </div>

      <div 
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={(e) => handleDrop(e, boxId)}
        className="flex-1 bg-slate-50/50 rounded-3xl border-2 border-dashed border-slate-200 p-3 space-y-3 transition-colors"
      >
        {viewMode === 'pages' ? (
          <>
            {pages.map(page => (
              <PageCard 
                key={page.id}
                page={page}
                onEdit={handleEdit}
                onDelete={onDelete}
                onDragStart={handleDragStart}
              />
            ))}
            <button 
              onClick={() => handleOpenAdd(boxId)}
              className="w-full py-3 rounded-2xl border-2 border-dashed border-slate-200 text-slate-300 hover:text-slate-500 hover:border-slate-300 transition-all flex items-center justify-center gap-2 text-xs font-bold"
            >
              <Plus size={14} /> เพิ่มเพจ
            </button>
          </>
        ) : (
          <>
            {accounts.map(acc => (
              <AccountCard 
                key={acc.id}
                account={acc}
                onEdit={handleAccountEdit}
                onDelete={onDeleteAccount}
              />
            ))}
            <button 
              onClick={() => handleOpenAccountAdd(boxId)}
              className="w-full py-8 rounded-3xl border-2 border-dashed border-slate-100 text-slate-300 hover:text-[var(--primary-blue)] hover:border-blue-200 transition-all flex flex-col items-center justify-center gap-2"
            >
              <Shield size={20} />
              <span className="text-[10px] font-bold font-noto uppercase tracking-tight">Add Account</span>
            </button>
          </>
        )}
      </div>
    </div>
  );
};
