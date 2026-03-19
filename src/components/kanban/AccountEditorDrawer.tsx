'use client';

import React from 'react';
import { Plus, Shield, Key, Database } from 'lucide-react';
import { FBAccount } from '@/types';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface AccountEditorDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  editingAccount: FBAccount | null;
  formData: {
    name: string;
    uid: string;
    status: FBAccount['status'];
    password?: string;
    twoFactor?: string;
    cookie?: string;
    boxId: number;
  };
  setFormData: (data: any) => void;
  onSubmit: (e: React.FormEvent) => void;
  boxes: number[];
}

export const AccountEditorDrawer = ({
  isOpen,
  onClose,
  editingAccount,
  formData,
  setFormData,
  onSubmit,
  boxes
}: AccountEditorDrawerProps) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] overflow-hidden font-prompt font-noto">
      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={onClose} />
      <div className="absolute inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-white shadow-2xl animate-slide-in-right h-screen">
          <div className="h-full flex flex-col">
            <div className="px-8 py-5 border-b border-slate-100 flex items-center justify-between bg-white sticky top-0 z-10">
              <div>
                <h3 className="text-xl font-bold text-slate-800 uppercase tracking-tight leading-none">
                  {editingAccount ? 'แก้ไขบัญชีเฟซบุ๊ก' : 'เพิ่มบัญชีใหม่'}
                </h3>
                <p className="text-[10px] text-slate-400 mt-1 uppercase tracking-wider font-bold opacity-60">Credentials & Access Control</p>
              </div>
              <button onClick={onClose} className="w-10 h-10 flex items-center justify-center bg-slate-50 text-slate-400 hover:text-slate-600 rounded-xl transition-all">
                <Plus size={24} className="rotate-45" />
              </button>
            </div>

            <form onSubmit={onSubmit} className="flex-1 overflow-y-auto px-8 py-6 space-y-6">
              <div className="space-y-4">
                <div className="space-y-1 relative pt-2">
                  <label className="absolute -top-1 left-3 px-1.5 bg-white text-[10px] font-bold text-[var(--primary-blue)] uppercase tracking-widest z-10">ชื่อบัญชี</label>
                  <input 
                    type="text"
                    required
                    value={formData.name}
                    onChange={e => setFormData({...formData, name: e.target.value})}
                    placeholder="เช่น สมชาย แอคเคาท์ 1"
                    className="w-full bg-white border border-slate-200 rounded-2xl px-4 py-3.5 outline-none focus:ring-2 focus:ring-[var(--primary-blue)]/5 focus:border-[var(--primary-blue)] transition-all text-sm font-noto"
                  />
                </div>
                <div className="space-y-1 relative pt-2">
                  <label className="absolute -top-1 left-3 px-1.5 bg-white text-[10px] font-bold text-slate-400 uppercase tracking-widest z-10">Facebook UID</label>
                  <input 
                    type="text"
                    required
                    value={formData.uid}
                    onChange={e => setFormData({...formData, uid: e.target.value})}
                    placeholder="1000XXXXXXXXXXX"
                    className="w-full bg-white border border-slate-200 rounded-2xl px-4 py-3.5 outline-none focus:ring-2 focus:ring-[var(--primary-blue)]/5 focus:border-[var(--primary-blue)] transition-all text-sm font-inter"
                  />
                </div>
              </div>

              <div className="bg-slate-50/50 p-6 rounded-3xl border border-slate-100 space-y-4">
                <div className="flex items-center gap-2 mb-2">
                   <Key size={14} className="text-slate-400" />
                   <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Login Credentials</span>
                </div>
                <div className="space-y-1 relative pt-2">
                  <label className="absolute -top-1 left-3 px-1.5 bg-slate-50 text-[10px] font-bold text-slate-400 uppercase tracking-widest z-10">Password</label>
                  <input 
                    type="text"
                    value={formData.password}
                    onChange={e => setFormData({...formData, password: e.target.value})}
                    className="w-full bg-white border border-slate-200 rounded-2xl px-4 py-3.5 outline-none focus:ring-2 focus:ring-[var(--primary-blue)]/5 focus:border-[var(--primary-blue)] transition-all text-sm font-inter"
                  />
                </div>
                <div className="space-y-1 relative pt-2">
                  <label className="absolute -top-1 left-3 px-1.5 bg-slate-50 text-[10px] font-bold text-slate-400 uppercase tracking-widest z-10">2FA Key / Recovery</label>
                  <input 
                    type="text"
                    value={formData.twoFactor}
                    onChange={e => setFormData({...formData, twoFactor: e.target.value})}
                    placeholder="ABCD EFGH..."
                    className="w-full bg-white border border-slate-200 rounded-2xl px-4 py-3.5 outline-none focus:ring-2 focus:ring-[var(--primary-blue)]/5 focus:border-[var(--primary-blue)] transition-all text-sm font-inter uppercase"
                  />
                </div>
              </div>

              <div className="space-y-1 relative pt-2">
                <label className="absolute -top-1 left-3 px-1.5 bg-white text-[10px] font-bold text-slate-400 uppercase tracking-widest z-10">Cookies</label>
                <textarea 
                  value={formData.cookie}
                  onChange={e => setFormData({...formData, cookie: e.target.value})}
                  placeholder="c_user=...; xs=...;"
                  rows={4}
                  className="w-full bg-white border border-slate-200 rounded-2xl px-4 py-3.5 outline-none focus:ring-2 focus:ring-[var(--primary-blue)]/5 focus:border-[var(--primary-blue)] transition-all text-xs font-inter resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1 relative pt-2">
                  <label className="absolute -top-1 left-3 px-1.5 bg-white text-[10px] font-bold text-slate-400 uppercase tracking-widest z-10">กล่องที่</label>
                  <select 
                    value={formData.boxId}
                    onChange={e => setFormData({...formData, boxId: parseInt(e.target.value)})}
                    className="w-full bg-white border border-slate-200 rounded-2xl px-4 py-3.5 outline-none focus:ring-2 focus:ring-[var(--primary-blue)]/5 focus:border-[var(--primary-blue)] transition-all text-sm font-noto"
                  >
                    {boxes.map(b => <option key={b} value={b}>{b}</option>)}
                  </select>
                </div>
                <div className="space-y-1 relative pt-2">
                  <label className="absolute -top-1 left-3 px-1.5 bg-white text-[10px] font-bold text-slate-400 uppercase tracking-widest z-10">สถานะบัญชี</label>
                  <div className="grid grid-cols-3 gap-2">
                    {(['Live', 'Check', 'Die'] as FBAccount['status'][]).map(s => (
                      <button
                        key={s}
                        type="button"
                        onClick={() => setFormData({...formData, status: s})}
                        className={cn(
                          "py-3 rounded-2xl border text-[10px] font-bold transition-all relative overflow-hidden",
                          formData.status === s 
                            ? cn(
                                "shadow-lg shadow-blue-100 scale-[1.02] border-transparent text-white",
                                s === 'Live' ? "bg-emerald-500" :
                                s === 'Check' ? "bg-amber-500" :
                                "bg-red-500"
                              )
                            : "bg-white border-slate-200 text-slate-400 hover:border-slate-300"
                        )}
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </form>

            <div className="px-8 py-6 border-t border-slate-100 bg-white sticky bottom-0 z-10">
              <button
                onClick={onSubmit}
                className="w-full bg-[var(--primary-blue)] hover:bg-[#0b5ed7] text-white font-bold py-4 rounded-2xl shadow-xl shadow-blue-200 transition-all active:scale-[0.98] font-noto"
              >
                {editingAccount ? 'บันทึกการแก้ไขบัญชี' : 'ยืนยันเพิ่มบัญชี'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
