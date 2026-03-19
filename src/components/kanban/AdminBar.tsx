'use client';

import React from 'react';
import { Shield, Plus } from 'lucide-react';
import { FBAccount } from '@/types';
import { AccountCard } from './AccountCard';

interface AdminBarProps {
  activeBoxes: number[];
  accountsByBox: Record<number, FBAccount[]>;
  handleOpenAccountAdd: (boxId: number) => void;
  handleAccountEdit: (acc: FBAccount) => void;
  onDeleteAccount: (id: string) => void;
}

export const AdminBar = ({
  activeBoxes,
  accountsByBox,
  handleOpenAccountAdd,
  handleAccountEdit,
  onDeleteAccount
}: AdminBarProps) => {
  if (!activeBoxes.includes(0)) return null;

  const adminAccounts = accountsByBox[0] || [];

  return (
    <div className="px-4 py-6 bg-indigo-50/30 rounded-[2.5rem] border border-indigo-100/50 mx-2">
      <div className="flex items-center justify-between mb-4 px-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-indigo-100">
            <Shield size={20} />
          </div>
          <div>
            <h3 className="text-base font-bold text-indigo-900 uppercase tracking-tight">ACCOUNT ADMIN MASTER</h3>
            <p className="text-[10px] text-indigo-400 font-bold uppercase tracking-widest">Global Controller & Multi-Page Holder</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[10px] bg-white text-indigo-600 font-bold px-3 py-1 rounded-full border border-indigo-100 shadow-sm">
            {adminAccounts.length} ADMINS
          </span>
          <button 
            onClick={() => handleOpenAccountAdd(0)}
            className="w-10 h-10 bg-indigo-600 text-white rounded-2xl flex items-center justify-center hover:bg-indigo-700 transition-all shadow-md shadow-indigo-100"
          >
            <Plus size={20} />
          </button>
        </div>
      </div>

      <div className="flex items-center gap-4 overflow-x-auto pb-4 px-4 custom-scrollbar">
        {adminAccounts.length > 0 ? (
          adminAccounts.map(acc => (
            <div key={acc.id} className="w-72 flex-shrink-0">
              <AccountCard 
                account={acc}
                onEdit={handleAccountEdit}
                onDelete={onDeleteAccount}
              />
            </div>
          ))
        ) : (
          <div className="w-full h-24 border-2 border-dashed border-indigo-100 rounded-3xl flex items-center justify-center text-indigo-300 gap-3">
            <Shield size={20} className="opacity-30" />
            <p className="text-xs font-bold uppercase tracking-widest">No Admin Accounts Yet</p>
          </div>
        )}
      </div>
    </div>
  );
};
