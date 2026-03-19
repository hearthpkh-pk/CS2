'use client';

import React from 'react';
import { Trash2, Shield, Key, Database, Copy } from 'lucide-react';
import { FBAccount } from '@/types';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface AccountCardProps {
  account: FBAccount;
  onEdit: (acc: FBAccount) => void;
  onDelete: (id: string) => void;
}

export const AccountCard = ({
  account,
  onEdit,
  onDelete
}: AccountCardProps) => {
  return (
    <div 
      onClick={() => onEdit(account)}
      className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 cursor-pointer hover:border-[var(--primary-blue)] hover:shadow-md transition-all group relative"
    >
      <div className="flex justify-between items-start mb-2">
        <div className={cn(
          "text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider font-inter flex items-center gap-1",
          account.status === 'Live' ? 'bg-emerald-100 text-emerald-700' : 
          account.status === 'Check' ? 'bg-amber-100 text-amber-700' : 'bg-red-100 text-red-700'
        )}>
          <Shield size={10} /> {account.status}
        </div>
        <button 
          onClick={(e) => { e.stopPropagation(); onDelete(account.id); }}
          className="text-slate-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
        >
          <Trash2 size={14} />
        </button>
      </div>
      
      <h4 className="font-bold text-slate-800 text-sm font-noto truncate mb-1">{account.name}</h4>
      <p className="text-[10px] text-slate-400 font-noto mb-3 truncate">UID: {account.uid}</p>
      
      <div className="flex items-center gap-2 pt-3 border-t border-slate-50">
        {account.password && (
          <button 
            onClick={(e) => { 
              e.stopPropagation(); 
              navigator.clipboard.writeText(account.password!);
            }}
            className="w-7 h-7 flex items-center justify-center bg-slate-50 rounded-lg text-slate-400 hover:text-[var(--primary-blue)] hover:bg-white border border-slate-100 transition-all shadow-sm"
            title="Copy Pass"
          >
            <Key size={12} />
          </button>
        )}
        {account.twoFactor && (
          <button 
            onClick={(e) => { 
              e.stopPropagation(); 
              navigator.clipboard.writeText(account.twoFactor!);
            }}
            className="w-7 h-7 flex items-center justify-center bg-slate-50 rounded-lg text-slate-400 hover:text-[var(--primary-blue)] hover:bg-white border border-slate-100 transition-all shadow-sm"
            title="Copy 2FA"
          >
            <Database size={12} />
          </button>
        )}
        {account.cookie && (
          <button 
            onClick={(e) => { 
              e.stopPropagation(); 
              navigator.clipboard.writeText(account.cookie!);
            }}
            className="w-7 h-7 flex items-center justify-center bg-slate-50 rounded-lg text-slate-400 hover:text-[var(--primary-blue)] hover:bg-white border border-slate-100 transition-all shadow-sm"
            title="Copy Cookie"
          >
            <Copy size={12} />
          </button>
        )}
      </div>
    </div>
  );
};
