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
    <div className="px-4 py-6 bg-gradient-to-r from-blue-50/50 via-white to-blue-50/50 rounded-[2.5rem] border border-blue-200/60 mx-2 shadow-sm relative overflow-hidden group">
      {/* Decorative accent */}
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-blue-400/30 to-transparent" />
      
      <div className="flex items-center justify-between mb-4 px-4 relative z-10">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-blue-600 rounded-[1.25rem] flex items-center justify-center text-white shadow-xl shadow-blue-100 group-hover:scale-105 transition-transform">
            <Shield size={24} fill="white" fillOpacity={0.2} />
          </div>
          <div>
            <h3 className="text-base font-bold text-blue-900 uppercase tracking-tight font-outfit">ACCOUNT ADMIN MASTER</h3>
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse" />
              <p className="text-[10px] text-blue-400 font-bold uppercase tracking-widest font-inter">Global Controller & Multi-Page Holder</p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex flex-col items-end mr-2">
            <span className="text-[9px] font-bold text-blue-300 uppercase tracking-tighter">Current Capacity</span>
            <span className="text-xs font-black text-blue-600 font-inter tracking-tighter">
              {adminAccounts.length} / 20
            </span>
          </div>
          <button 
            onClick={() => handleOpenAccountAdd(0)}
            className="w-10 h-10 bg-blue-600 text-white rounded-2xl flex items-center justify-center hover:bg-blue-700 transition-all shadow-lg shadow-blue-200 active:scale-95"
          >
            <Plus size={20} />
          </button>
        </div>
      </div>

      <div className="flex items-center gap-4 overflow-x-auto pb-4 px-4 custom-scrollbar relative z-10">
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
          <div className="w-full h-24 border-2 border-dashed border-blue-100 rounded-[2rem] flex items-center justify-center text-blue-300 gap-3 bg-white/50">
            <Shield size={20} className="opacity-30" />
            <p className="text-[10px] font-bold uppercase tracking-widest">No Admin accounts in this fleet</p>
          </div>
        )}
      </div>
    </div>
  );
};
