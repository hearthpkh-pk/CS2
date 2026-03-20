'use client';

import React from 'react';
import { Shield, Plus } from 'lucide-react';
import { FBAccount, User } from '@/types';
import { AccountCard } from './AccountCard';
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
    <div className="mb-10 px-2 transition-all duration-500">
      <div className={cn(
        "relative rounded-[2.5rem] transition-all duration-500",
        "bg-[var(--primary-theme-bg)]/40 backdrop-blur-sm",
        "border-2 border-[var(--primary-theme-border)] border-dashed hover:border-solid hover:bg-white/60 transition-all shadow-sm"
      )}>
        {/* 1. Header Section - Minimalist */}
        <div className="px-8 py-6 flex items-center justify-between relative z-10">
          <div className="flex items-center gap-4">
            <div className="p-2.5 bg-white rounded-2xl border border-[var(--primary-theme-border)] shadow-sm">
              <Shield className="text-[var(--primary-theme)]" size={24} strokeWidth={2.5} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-bold text-slate-800 font-outfit uppercase tracking-tight leading-none">Box Admin</h3>
                <span className="px-2 py-0.5 bg-[var(--primary-theme)]/10 rounded-full text-[9px] font-bold text-[var(--primary-theme)] uppercase tracking-widest whitespace-nowrap border border-[var(--primary-theme)]/10">Master Control</span>
              </div>
              <p className="text-slate-400 text-[9px] font-bold uppercase tracking-[0.2em] mt-1.5 flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-[var(--primary-theme)] animate-pulse"></span>
                Operational • {totalSlots} Admin Units
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="text-right hidden sm:block">
              <span className="text-slate-400 text-[9px] font-bold uppercase tracking-widest block mb-0.5">Capacity</span>
              <div className="flex items-center justify-end gap-1.5">
                <span className="text-lg font-black text-slate-700 font-inter tracking-tighter leading-none">{totalSlots}</span>
                <span className="text-slate-300 text-[10px] font-bold">/</span>
                <span className="text-slate-400 text-[10px] font-bold uppercase tracking-tighter">MAX</span>
              </div>
            </div>
            <button 
              onClick={() => handleOpenAccountAdd(0)}
              className="w-10 h-10 rounded-xl bg-white text-[var(--primary-theme)] flex items-center justify-center shadow-sm border border-[var(--primary-theme-border)] hover:bg-[var(--primary-theme)] hover:text-white transition-all active:scale-90"
              title="Add Admin Account"
            >
              <Plus size={22} strokeWidth={3} />
            </button>
          </div>
        </div>

        {/* 2. Divider - Very Subtle */}
        <div className="mx-8 h-px bg-[var(--primary-theme-border)] opacity-50" />

        {/* 3. Account Cards Area - No Overflow Hidden so hover scales work */}
        <div className="p-6 md:p-8 relative z-10">
          <div className="flex items-center gap-6 overflow-x-auto pb-4 custom-scrollbar no-scrollbar scroll-smooth p-2 -m-2">
            {adminAccounts.length > 0 ? (
              adminAccounts.map(acc => (
                <div key={acc.id} className="w-80 flex-shrink-0 transition-transform">
                  <AccountCard 
                    account={acc}
                    currentUser={currentUser}
                    ownerName={getOwnerName(acc.ownerId)}
                    onEdit={handleAccountEdit}
                    onDelete={onDeleteAccount}
                  />
                </div>
              ))
            ) : (
              <div className="w-full h-24 rounded-[2rem] flex items-center justify-center text-slate-400 gap-3 bg-white/40 border border-dashed border-[var(--primary-theme-border)]">
                <Shield size={18} className="opacity-30" />
                <p className="text-[10px] font-bold uppercase tracking-widest opacity-60">Admin fleet is currently empty</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
