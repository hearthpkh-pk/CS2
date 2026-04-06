'use client';

import React, { useState } from 'react';
import { UserCog } from 'lucide-react';
import { User, Role } from '@/types';

const ROLE_ORDER: Role[] = [Role.Admin, Role.Manager, Role.Staff];
const ROLE_LABEL: Record<string, string> = {
  [Role.Admin]: 'Admin',
  [Role.Manager]: 'Manager',
  [Role.Staff]: 'Staff',
};

interface WorkspaceFABProps {
  users: User[];
  viewAsUserId: string | null;
  setViewAsUserId: (id: string | null) => void;
}

export const WorkspaceFAB = ({ users, viewAsUserId, setViewAsUserId }: WorkspaceFABProps) => {
  const [isOpen, setIsOpen] = useState(false);

  // กรองออก SuperAdmin / Developer — แสดงเฉพาะ Admin, Manager, Staff
  const visibleUsers = users.filter(
    u => u.isActive && u.role !== Role.SuperAdmin && u.role !== Role.Developer
  );

  const viewingUser = viewAsUserId ? visibleUsers.find(u => u.id === viewAsUserId) : null;
  const getInitial = (name: string) => name.trim().slice(-1).toUpperCase();

  // จัดกลุ่มตาม role ตาม ROLE_ORDER
  const grouped = ROLE_ORDER.reduce<Record<string, User[]>>((acc, role) => {
    const group = visibleUsers.filter(u => u.role === role);
    if (group.length > 0) acc[role] = group;
    return acc;
  }, {});

  return (
    // 🛡️ Render โดยตรงที่ root level ของ page.tsx
    // เพื่อหลีกเลี่ยง parent container ที่มี CSS transform ทำให้ position:fixed พัง
    <>
      {/* Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-[998]"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Popup Panel */}
      {isOpen && (
        <div className="fixed bottom-[5.5rem] right-6 z-[999] min-w-[260px] bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden animate-in fade-in slide-in-from-bottom-3 duration-200">
          {/* Header */}
          <div className="px-5 pt-4 pb-3 border-b border-slate-50 flex items-center justify-between">
            <div>
              <p className="text-[9px] font-black text-[#054ab3] uppercase tracking-[0.2em]">Workspace Viewer</p>
              <p className="text-[11px] font-bold text-slate-800 mt-0.5">เลือกดู Workspace ของ</p>
            </div>
            <UserCog size={15} className="text-[#054ab3]/40" />
          </div>

          {/* User List */}
          <div className="px-3 py-3 space-y-3 max-h-80 overflow-y-auto">
            {/* Reset — กลับมาดู Workspace ของตัวเอง */}
            <button
              onClick={() => { setViewAsUserId(null); setIsOpen(false); }}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-2xl text-left transition-all ${
                !viewAsUserId
                  ? 'bg-[#054ab3] text-white shadow-md shadow-blue-200'
                  : 'hover:bg-slate-50 text-slate-600'
              }`}
            >
              <div className={`w-7 h-7 rounded-xl flex items-center justify-center text-[10px] font-black shrink-0 ${
                !viewAsUserId ? 'bg-white/20' : 'bg-slate-100 text-slate-400'
              }`}>
                ✦
              </div>
              <span className="text-[11px] font-bold">Workspace ของฉัน</span>
            </button>

            {/* Grouped by Role */}
            {ROLE_ORDER.filter(r => grouped[r]).map(role => (
              <div key={role}>
                <p className="text-[8px] font-black text-slate-400 uppercase tracking-[0.25em] px-3 pb-1.5">
                  {ROLE_LABEL[role]}
                </p>
                <div className="space-y-0.5">
                  {grouped[role].map(u => (
                    <button
                      key={u.id}
                      onClick={() => { setViewAsUserId(u.id); setIsOpen(false); }}
                      className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-left transition-all ${
                        viewAsUserId === u.id
                          ? 'bg-[#054ab3] text-white shadow-sm shadow-blue-200'
                          : 'hover:bg-blue-50 text-slate-700'
                      }`}
                    >
                      <div className={`w-7 h-7 rounded-xl flex items-center justify-center text-[10px] font-black shrink-0 ${
                        viewAsUserId === u.id ? 'bg-white/20 text-white' : 'bg-blue-50 text-[#054ab3]'
                      }`}>
                        {getInitial(u.name)}
                      </div>
                      <span className="text-[11px] font-bold truncate">{u.name}</span>
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* FAB Button */}
      <button
        onClick={() => setIsOpen(prev => !prev)}
        className="fixed bottom-6 right-6 z-[999] w-14 h-14 rounded-full bg-[#054ab3] hover:bg-[#0552c7] shadow-xl shadow-blue-200 flex items-center justify-center transition-all duration-300 active:scale-95 hover:scale-105"
        title={viewingUser ? `กำลังดู Workspace: ${viewingUser.name}` : 'Workspace Viewer'}
      >
        {viewingUser ? (
          <span className="text-white text-sm font-black">{getInitial(viewingUser.name)}</span>
        ) : (
          <UserCog size={20} className="text-white" />
        )}
        {/* Green dot = กำลัง View As อยู่ */}
        {viewAsUserId && (
          <span className="absolute -top-0.5 -right-0.5 w-3.5 h-3.5 bg-emerald-400 rounded-full border-2 border-white shadow-sm" />
        )}
      </button>
    </>
  );
};
