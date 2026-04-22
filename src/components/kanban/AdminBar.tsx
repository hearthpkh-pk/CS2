'use client';

import React from 'react';
import { Shield, Plus, Database, ExternalLink } from 'lucide-react';
import { FBAccount, User } from '@/types';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface AdminBarProps {
  activeBoxes: number[];
  accountsByBox: Record<number, FBAccount[]>;
  currentUser: User;
  users: User[];
  handleOpenAccountAdd: (boxId: number) => void;
  handleAccountEdit: (acc: FBAccount) => void;
  onDeleteAccount: (id: string) => void;
}

export const AdminBar = ({
  activeBoxes,
  accountsByBox,
  currentUser,
  users,
  handleOpenAccountAdd,
  handleAccountEdit,
  onDeleteAccount
}: AdminBarProps) => {
  const getOwnerName = (ownerId?: string) => {
    if (!ownerId) return 'Unassigned';
    return users.find(u => u.id === ownerId)?.name || 'Unknown';
  };
  if (!activeBoxes.includes(0)) return null;

  const adminAccounts = accountsByBox[0] || [];
  const totalSlots = adminAccounts.length; // Assuming totalSlots is the count of admin accounts

  return (
    <div className="mb-8 px-2 transition-all duration-500">
      <div className={cn(
        "relative rounded-3xl transition-all duration-500 overflow-hidden",
        "bg-white/80 backdrop-blur-md",
        "border border-slate-200/60 shadow-[0_8px_30px_rgb(0,0,0,0.04)]"
      )}>

        <div className="flex flex-col xl:flex-row xl:items-center">
          
          {/* Header Area: Sleek and compact */}
          <div className="px-6 py-4 flex items-center justify-between xl:w-64 shrink-0 bg-slate-50/50 xl:border-r border-slate-100/80">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-[var(--primary-theme)] rounded-xl shadow-md shadow-blue-500/20">
                <Shield className="text-white" size={18} strokeWidth={2.5} />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-800 font-outfit uppercase tracking-tight leading-none">Box Admin</h3>
                <p className="text-slate-400 text-[9px] font-bold uppercase tracking-widest mt-1">Master Control</p>
              </div>
            </div>
            
            <button 
              onClick={() => handleOpenAccountAdd(0)}
              className="w-8 h-8 rounded-lg bg-white text-[var(--primary-theme)] flex items-center justify-center shadow-sm border border-slate-200 hover:bg-[var(--primary-theme)] hover:text-white hover:border-transparent transition-all active:scale-90 xl:hidden"
            >
              <Plus size={18} strokeWidth={2.5} />
            </button>
          </div>

          {/* Accounts Strip */}
          <div className="flex-1 overflow-x-auto custom-scrollbar p-4 xl:py-3 flex items-center gap-3">
            {adminAccounts.length > 0 ? (
              adminAccounts.map(acc => {
                const isAllowed = currentUser.role !== 'Staff' || acc.ownerId === currentUser.id;
                return (
                  <div 
                    key={acc.id}
                    onClick={() => handleAccountEdit(acc)}
                    className="group flex-shrink-0 flex items-center justify-between w-64 px-4 py-2.5 bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-md hover:border-[var(--primary-theme)]/30 cursor-pointer transition-all"
                  >
                    <div className="flex items-center gap-3 overflow-hidden">
                      <div className="relative flex-shrink-0">
                        <div className="w-8 h-8 rounded-full bg-slate-50 border border-slate-100 flex items-center justify-center overflow-hidden">
                           <Shield size={14} className="text-slate-300 group-hover:text-[var(--primary-theme)] transition-colors" />
                        </div>
                        <div className={cn(
                          "absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2 border-white",
                          acc.status === 'Live' ? "bg-emerald-500" :
                          acc.status === 'Check' ? "bg-amber-500" : "bg-red-500"
                        )} />
                      </div>
                      <div className="overflow-hidden">
                        <p className="text-xs font-bold text-slate-800 truncate">{acc.name}</p>
                        <p className="text-[9px] text-slate-400 font-inter truncate">UID: {acc.uid}</p>
                      </div>
                    </div>

                    {/* Compact actions that appear on hover */}
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1 bg-white/90 backdrop-blur pl-2">
                       {acc.profileUrl && (
                        <button 
                          onClick={(e) => { e.stopPropagation(); window.open(acc.profileUrl!, '_blank', 'noopener,noreferrer'); }}
                          className="p-1.5 text-indigo-400 hover:text-white hover:bg-indigo-500 rounded-lg transition-colors"
                          title="Open Profile"
                        >
                          <ExternalLink size={12} strokeWidth={2.5} />
                        </button>
                       )}
                       {isAllowed && acc.password && (
                        <button 
                          onClick={(e) => { e.stopPropagation(); navigator.clipboard.writeText(acc.password!); }}
                          className="p-1.5 text-slate-300 hover:text-[var(--primary-theme)] hover:bg-blue-50 rounded-lg transition-colors"
                          title="Copy Pass"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4"/></svg>
                        </button>
                       )}
                       {isAllowed && acc.twoFactor && (
                        <button 
                          onClick={(e) => { e.stopPropagation(); navigator.clipboard.writeText(acc.twoFactor!); }}
                          className="p-1.5 text-slate-300 hover:text-[var(--primary-theme)] hover:bg-blue-50 rounded-lg transition-colors"
                          title="Copy 2FA"
                        >
                          <Database size={12} />
                        </button>
                       )}
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="px-6 py-2 rounded-xl flex items-center gap-2 text-slate-300 border border-dashed border-slate-200 bg-slate-50/50">
                <Shield size={14} className="opacity-50" />
                <span className="text-[10px] font-bold uppercase tracking-widest">No Admin Units</span>
              </div>
            )}
            
            <button 
              onClick={() => handleOpenAccountAdd(0)}
              className="group hidden xl:flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-slate-50 text-slate-400 border border-slate-200 border-dashed hover:border-[var(--primary-theme)] hover:bg-blue-50 hover:text-[var(--primary-theme)] transition-all flex-shrink-0"
            >
              <Plus size={16} strokeWidth={2.5} className="group-hover:rotate-90 transition-transform" />
              <span className="text-[10px] font-bold uppercase tracking-wider">Add Unit</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
