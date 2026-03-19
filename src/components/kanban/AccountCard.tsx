'use client';

import React from 'react';
import { Trash2, Shield, Key, Database, Copy, Mail, Lock, Link as LinkIcon } from 'lucide-react';
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
      className={cn(
        "p-4 rounded-2xl shadow-sm border cursor-pointer hover:shadow-md transition-all group relative",
        account.status === 'Admin' 
          ? "bg-blue-600 border-blue-400 text-white hover:bg-blue-700" 
          : "bg-white border-slate-100 text-slate-800 hover:border-[var(--primary-blue)]"
      )}
    >
      <div className="flex justify-between items-start mb-2">
        <div className={cn(
          "text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider font-inter flex items-center gap-1",
          account.status === 'Live' ? 'bg-emerald-100 text-emerald-700' : 
          account.status === 'Check' ? 'bg-amber-100 text-amber-700' : 
          account.status === 'Admin' ? 'bg-white text-blue-600' : // White badge on Blue card
          'bg-red-100 text-red-700'
        )}>
          <Shield size={10} /> {account.status}
        </div>
        <button 
          onClick={(e) => { e.stopPropagation(); onDelete(account.id); }}
          className={cn(
            "opacity-0 group-hover:opacity-100 transition-opacity",
            account.status === 'Admin' ? "text-blue-200 hover:text-white" : "text-slate-300 hover:text-red-500"
          )}
        >
          <Trash2 size={14} />
        </button>
      </div>
      
      <h4 className={cn(
        "font-bold text-sm font-noto truncate mb-1",
        account.status === 'Admin' ? "text-white" : "text-slate-800"
      )}>{account.name}</h4>
      <p className={cn(
        "text-[10px] font-noto mb-3 truncate",
        account.status === 'Admin' ? "text-blue-100" : "text-slate-400"
      )}>UID: {account.uid}</p>
      
      <div className={cn(
        "flex flex-wrap items-center gap-2 pt-3 border-t",
        account.status === 'Admin' ? "border-blue-500/50" : "border-slate-50"
      )}>
        {/* Helper to conditionally style action buttons */}
        {(() => {
          const btnClass = (base: string, active: string) => cn(
            "w-7 h-7 flex items-center justify-center rounded-lg transition-all shadow-sm border",
            account.status === 'Admin' 
              ? "bg-blue-500/40 text-white hover:bg-white hover:text-blue-600 border-blue-400/50"
              : cn(base, active)
          );
          
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
              {account.password && (
                <button 
                  onClick={(e) => { 
                    e.stopPropagation(); 
                    navigator.clipboard.writeText(account.password!);
                  }}
                  className={btnClass("bg-slate-50 text-slate-400 border-slate-100", "hover:text-[var(--primary-blue)] hover:bg-white")}
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
                  className={btnClass("bg-slate-50 text-slate-400 border-slate-100", "hover:text-[var(--primary-blue)] hover:bg-white")}
                  title="Copy 2FA"
                >
                  <Database size={12} />
                </button>
              )}
              {account.email && (
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
              {account.emailPassword && (
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
              {account.email2 && (
                <button 
                  onClick={(e) => { 
                    e.stopPropagation(); 
                    navigator.clipboard.writeText(account.email2!);
                  }}
                  className={btnClass("bg-teal-50 text-teal-400 border-teal-100", "hover:text-teal-600 hover:bg-white")}
                  title="Copy Email 2"
                >
                  <Mail size={12} className="opacity-70" />
                </button>
              )}
              {account.cookie && (
                <button 
                  onClick={(e) => { 
                    e.stopPropagation(); 
                    navigator.clipboard.writeText(account.cookie!);
                  }}
                  className={btnClass("bg-slate-50 text-slate-400 border-slate-100", "hover:text-[var(--primary-blue)] hover:bg-white")}
                  title="Copy Cookie"
                >
                  <Copy size={12} />
                </button>
              )}
            </>
          );
        })()}
      </div>
    </div>
  );
};
