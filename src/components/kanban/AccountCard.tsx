'use client';

import React from 'react';
import { Trash2, Shield, Key, Database, Copy, Mail, Lock, Link as LinkIcon } from 'lucide-react';
import { FBAccount, User } from '@/types';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface AccountCardProps {
  account: FBAccount;
  currentUser: User;
  ownerName: string;
  onEdit: (acc: FBAccount) => void;
  onDelete: (id: string) => void;
}

export const AccountCard = ({
  account,
  currentUser,
  ownerName,
  onDelete,
  onEdit
}: AccountCardProps) => {
  // Assuming account.isAdmin is a new property or derived from account.status === 'Admin'
  // For now, let's derive it for safety based on the original logic
  const isAdmin = account.status === 'Admin';

  return (
    <div 
      onClick={() => onEdit(account)}
      className={cn(
        "group relative transition-all duration-300 rounded-[1.5rem] p-4 shadow-sm hover:shadow-xl border cursor-pointer",
        isAdmin 
          ? "bg-white border-white/50 shadow-white/10 text-slate-800 scale-100 hover:scale-[1.03]" 
          : "bg-white border-slate-100 hover:border-[var(--primary-theme)] text-slate-800"
      )}
    >
      <div className="flex justify-between items-start mb-2">
        <div className={cn(
          "text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider font-inter flex items-center gap-1",
          account.status === 'Live' ? 'bg-emerald-100 text-emerald-700' : 
          account.status === 'Check' ? 'bg-amber-100 text-amber-700' : 
          isAdmin ? 'bg-white text-[var(--primary-theme)]' : // White badge on themed card
          'bg-red-100 text-red-700'
        )}>
          <Shield size={10} /> {account.status}
        </div>
        <button 
          onClick={(e) => { e.stopPropagation(); onDelete(account.id); }}
          className={cn(
            "opacity-0 group-hover:opacity-100 transition-opacity",
            isAdmin ? "text-white/70 hover:text-white" : "text-slate-300 hover:text-red-500"
          )}
        >
          <Trash2 size={14} />
        </button>
      </div>
      
      <h4 className={cn(
        "font-bold text-sm font-noto truncate mb-1",
        "text-slate-800"
      )}>{account.name}</h4>
      <p className={cn(
        "text-[10px] font-noto mb-3 truncate",
        "text-slate-400"
      )}>UID: {account.uid}</p>
      
      <div className={cn(
        "flex flex-wrap items-center gap-2 pt-3 border-t",
        isAdmin ? "border-white/20" : "border-slate-50"
      )}>
        {/* Helper to conditionally style action buttons */}
        {(() => {
          const btnClass = (base: string, active: string) => cn(
            "w-7 h-7 flex items-center justify-center rounded-lg transition-all shadow-sm border",
            isAdmin 
              ? "bg-[var(--primary-theme-bg)] text-[var(--primary-theme)] hover:bg-[var(--primary-theme)] hover:text-white border-[var(--primary-theme-border)]"
              : cn(base, active)
          );
          
          // Data Masking Logic: Only Admins/Managers or the Owner (if Staff) can see sensitive data
          // For now, let's keep it simple: Staff can see their own, Managers can see team's.
          // BUT the user asked for "Security Simulation": Staff see personal, Admin see team.
          // If we are simulating "Staff A1" viewing, they should see their own data.
          // If "Admin" views, they see everything.
          const isAllowed = currentUser.role !== 'Staff' || account.ownerId === currentUser.id;

          return (
            <>
              {account.profileUrl && (
                <button 
                  onClick={(e) => { 
                    e.stopPropagation(); 
                    navigator.clipboard.writeText(account.profileUrl!);
                  }}
                  className={btnClass("bg-blue-50 text-blue-400 border-blue-100", "hover:text-blue-600 hover:bg-white")}
                  title="Copy Profile Link"
                >
                  <LinkIcon size={12} />
                </button>
              )}
              {isAllowed && account.password && (
                <button 
                  onClick={(e) => { 
                    e.stopPropagation(); 
                    navigator.clipboard.writeText(account.password!);
                  }}
                  className={btnClass("bg-slate-50 text-slate-400 border-slate-100", "hover:text-[var(--primary-theme)] hover:bg-white")}
                  title="Copy Pass"
                >
                  <Key size={12} />
                </button>
              )}
              {isAllowed && account.twoFactor && (
                <button 
                  onClick={(e) => { 
                    e.stopPropagation(); 
                    navigator.clipboard.writeText(account.twoFactor!);
                  }}
                  className={btnClass("bg-slate-50 text-slate-400 border-slate-100", "hover:text-[var(--primary-theme)] hover:bg-white")}
                  title="Copy 2FA"
                >
                  <Database size={12} />
                </button>
              )}
              {isAllowed && account.email && (
                <button 
                  onClick={(e) => { 
                    e.stopPropagation(); 
                    navigator.clipboard.writeText(account.email!);
                  }}
                  className={btnClass("bg-emerald-50 text-emerald-400 border-emerald-100", "hover:text-emerald-600 hover:bg-white")}
                  title="Copy Email 1"
                >
                  <Mail size={12} />
                </button>
              )}
              {isAllowed && account.emailPassword && (
                <button 
                  onClick={(e) => { 
                    e.stopPropagation(); 
                    navigator.clipboard.writeText(account.emailPassword!);
                  }}
                  className={btnClass("bg-emerald-50 text-emerald-400 border-emerald-100", "hover:text-emerald-600 hover:bg-white")}
                  title="Copy Email Pass"
                >
                  <Lock size={12} />
                </button>
              )}
              {/* Ownership Indicator for Admins */}
              {currentUser.role !== 'Staff' && (
                <div className="ml-auto flex items-center gap-1.5 px-2 py-1 bg-slate-50 rounded-lg border border-slate-100">
                  <div className="w-4 h-4 rounded-full bg-white flex items-center justify-center border border-slate-200">
                    <span className="text-[8px] font-bold text-slate-400 uppercase">{ownerName.charAt(0)}</span>
                  </div>
                  <span className="text-[9px] font-bold text-slate-400 font-noto truncate max-w-[50px]">{ownerName}</span>
                </div>
              )}
            </>
          );
        })()}
      </div>
    </div>
  );
};
