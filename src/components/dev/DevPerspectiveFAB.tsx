'use client';

import React, { useState } from 'react';
import { Shield, UserCog, Users, ShieldCheck, User as UserIcon, ChevronUp, RefreshCw, Activity, ChevronRight, LogOut } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { Role, User } from '@/types';
import { personnelService } from '@/services/personnelService';
import { cn } from '@/lib/utils';

export const DevPerspectiveFAB = () => {
  const { user, originalRole, switchPerspective, restoreOriginalRole } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [hoveredRole, setHoveredRole] = useState<Role | null>(null);

  // FAB remains visible if the ORIGINAL role was Developer
  if (!user || originalRole !== Role.Developer) return null;

  const roleCategories = [
    { id: Role.SuperAdmin, label: 'Super Admin', icon: ShieldCheck, color: 'text-emerald-500' },
    { id: Role.Admin, label: 'Admin', icon: Shield, color: 'text-blue-500' },
    { id: Role.Manager, label: 'Manager', icon: UserCog, color: 'text-amber-500' },
    { id: Role.Staff, label: 'Staff', icon: UserIcon, color: 'text-slate-400' },
  ];

  const handleSwitch = (newUser: User) => {
    switchPerspective(newUser);
    setIsOpen(false);
    setHoveredRole(null);
  };

  return (
    <div className="fixed bottom-6 right-6 z-[9999] font-noto">
      {/* Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/5 backdrop-blur-[2px] transition-all duration-300"
          onClick={() => { setIsOpen(false); setHoveredRole(null); }}
        />
      )}

      <div className="relative flex flex-col items-end gap-3">

        {/* Hover Sub-menu for specific users */}
        {isOpen && hoveredRole !== null && (
          <div
            className="absolute right-[240px] bg-white/95 backdrop-blur-xl border border-slate-200 rounded-[2rem] p-4 shadow-2xl animate-in fade-in slide-in-from-right-4 duration-300 min-w-[240px] transition-all"
            style={(() => {
              const idx = roleCategories.findIndex(r => r.id === hoveredRole);
              return idx <= 1
                ? { top: `${80 + (idx * 52)}px` }
                : { bottom: `${84 + ((3 - idx) * 52)}px` };
            })()}
          >
            <div className="px-3 py-2 border-b border-slate-100 mb-3">
              <p className="text-[10px] font-black text-[#054ab3] uppercase tracking-[0.2em] mb-1">Personnel Selection</p>
              <p className="text-[11px] text-slate-400 font-medium">Select identity to impersonate</p>
            </div>
            <div className="space-y-1.5 max-h-[320px] overflow-y-auto no-scrollbar">
              {personnelService.getUsers().filter(u => u.role === hoveredRole).map((u) => (
                <button
                  key={u.id}
                  onClick={() => handleSwitch(u)}
                  className={cn(
                    "w-full flex flex-col items-start px-4 py-2.5 rounded-2xl transition-all duration-200 hover:bg-[#054ab3]/5 group",
                    user.id === u.id ? "bg-[#054ab3]/10 ring-1 ring-[#054ab3]/20" : ""
                  )}
                >
                  <span className={cn("text-[13px] font-bold", user.id === u.id ? "text-[#054ab3]" : "text-slate-700")}>
                    {u.name}
                  </span>
                  <span className="text-[9px] font-medium text-slate-400 uppercase tracking-tighter">
                    ID: {u.id} • {u.username}
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Primary Role Category Menu */}
        {isOpen && (
          <div className="bg-white/90 backdrop-blur-xl border border-slate-200 rounded-[2.5rem] p-4 shadow-2xl animate-in fade-in slide-in-from-bottom-4 duration-300 min-w-[220px]">
            <div className="px-4 py-3 border-b border-slate-100 mb-4 flex justify-between items-center">
              <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-0.5">Perspective Engine</p>
                <p className="text-[11px] text-slate-500 font-medium">Viewing as: <span className="text-[#054ab3]">{user.name}</span></p>
              </div>
              <Activity size={12} className="text-emerald-500 animate-pulse" />
            </div>

            <div className="space-y-1">
              {roleCategories.map((r) => (
                <div
                  key={r.id}
                  onMouseEnter={() => setHoveredRole(r.id)}
                  className={cn(
                    "flex items-center justify-between px-4 py-3 rounded-2xl transition-all duration-200 cursor-pointer group",
                    hoveredRole === r.id ? "bg-[#054ab3]/5" : "hover:bg-slate-50"
                  )}
                >
                  <div className="flex items-center gap-3">
                    <r.icon size={16} className={cn("transition-transform group-hover:scale-110", r.color)} />
                    <span className="text-[13px] font-bold text-slate-600 tracking-tight">{r.label}</span>
                  </div>
                  <ChevronRight size={14} className={cn("text-slate-300 transition-all", hoveredRole === r.id ? "translate-x-1 text-[#054ab3]" : "")} />
                </div>
              ))}
            </div>

            <div className="mt-6 pt-4 border-t border-slate-100">
              <button
                onClick={() => {
                  restoreOriginalRole();
                  setIsOpen(false);
                }}
                className="w-full py-3.5 bg-slate-900 overflow-hidden text-white rounded-full font-bold text-[11px] tracking-widest uppercase flex items-center justify-center gap-2 hover:bg-black transition-all shadow-xl shadow-black/10 active:scale-95"
              >
                <LogOut size={14} />
                Restore Reality
              </button>
            </div>
          </div>
        )}

        {/* Global FAB Trigger */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className={cn(
            "w-12 h-12 rounded-full flex items-center justify-center shadow-3xl transition-all duration-500 hover:scale-105 active:scale-95 group relative overflow-hidden ring-4 ring-white",
            isOpen ? "bg-slate-900 rotate-90" : "bg-[#054ab3]"
          )}
        >
          {user.role !== Role.Developer && !isOpen && (
            <div className="absolute inset-0 bg-white/30 animate-ping opacity-30" />
          )}

          {isOpen ? (
            <ChevronUp size={24} className="text-white" />
          ) : (
            user.role === Role.Developer
              ? <RefreshCw size={26} className="text-white group-hover:rotate-180 transition-transform duration-700" />
              : <UserIcon size={26} className="text-white animate-pulse" />
          )}
        </button>
      </div>
    </div>
  );
};
