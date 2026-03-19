'use client';

import React from 'react';
import { Plus } from 'lucide-react';
import { Page } from '@/types';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface PageEditorDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  editingPage: Page | null;
  formData: {
    name: string;
    url: string;
    category: string;
    status: Page['status'];
    boxId: number;
  };
  setFormData: (data: any) => void;
  onSubmit: (e: React.FormEvent) => void;
  boxes: number[];
}

export const PageEditorDrawer = ({
  isOpen,
  onClose,
  editingPage,
  formData,
  setFormData,
  onSubmit,
  boxes
}: PageEditorDrawerProps) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] overflow-hidden font-prompt">
      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={onClose} />
      <div className="absolute inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-white shadow-2xl animate-slide-in-right h-screen">
          <div className="h-full flex flex-col">
            <div className="px-8 py-5 border-b border-slate-100 flex items-center justify-between bg-white sticky top-0 z-10">
              <div>
                <h3 className="text-xl font-bold text-primary-navy font-noto uppercase tracking-tight leading-none">
                  {editingPage ? 'แก้ไขข้อมูลเพจ' : 'เพิ่มเพจใหม่'}
                </h3>
                <p className="text-[10px] text-slate-400 mt-1 font-noto uppercase tracking-wider font-bold opacity-60">รายละเอียดและสถานะของเพจ</p>
              </div>
              <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
                <Plus size={24} className="rotate-45" />
              </button>
            </div>

            <form onSubmit={onSubmit} className="flex-1 overflow-y-auto px-8 py-6 space-y-8">
              <div className="space-y-1 relative pt-2">
                <label className="absolute -top-1 left-3 px-1.5 bg-white text-[10px] font-bold text-[var(--primary-blue)] uppercase tracking-widest z-10 transition-colors">ชื่อเพจ</label>
                <input 
                  type="text"
                  required
                  value={formData.name}
                  onChange={e => setFormData({...formData, name: e.target.value})}
                  placeholder="ระบุชื่อเพจ..."
                  className="w-full bg-white border border-slate-200 rounded-2xl px-4 py-3.5 outline-none focus:ring-2 focus:ring-[var(--primary-blue)]/5 focus:border-[var(--primary-blue)] transition-all placeholder:text-slate-300 text-sm font-noto"
                />
              </div>

              <div className="space-y-1 relative pt-2">
                <label className="absolute -top-1 left-3 px-1.5 bg-white text-[10px] font-bold text-slate-400 uppercase tracking-widest z-10">ลิงก์เพจ</label>
                <input 
                  type="url"
                  value={formData.url}
                  onChange={e => setFormData({...formData, url: e.target.value})}
                  placeholder="https://facebook.com/your-page"
                  className="w-full bg-white border border-slate-200 rounded-2xl px-4 py-3.5 outline-none focus:ring-2 focus:ring-[var(--primary-blue)]/5 focus:border-[var(--primary-blue)] transition-all placeholder:text-slate-300 text-sm font-noto"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1 relative pt-2">
                  <label className="absolute -top-1 left-3 px-1.5 bg-white text-[10px] font-bold text-slate-400 uppercase tracking-widest z-10">หมวดหมู่</label>
                  <select 
                    value={formData.category}
                    onChange={e => setFormData({...formData, category: e.target.value})}
                    className="w-full bg-white border border-slate-200 rounded-2xl px-4 py-3.5 outline-none focus:ring-2 focus:ring-[var(--primary-blue)]/5 focus:border-[var(--primary-blue)] transition-all text-sm font-noto"
                  >
                    <option value="รายการ">รายการ</option>
                    <option value="หนัง">หนัง</option>
                    <option value="ข่าว">ข่าว</option>
                  </select>
                </div>

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
              </div>

              <div className="space-y-4 pt-4">
                <div className="flex items-center justify-between">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">สถานะเพจ</label>
                  <span className="text-[10px] text-[var(--primary-blue)] font-bold font-inter bg-blue-50 px-2 py-0.5 rounded-full">MUST BE ACTIVE TO PROCESS</span>
                </div>
                <div className="grid grid-cols-3 gap-3">
                  {(['Active', 'Rest', 'Error'] as Page['status'][]).map(s => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => setFormData({...formData, status: s})}
                      className={cn(
                        "py-3 rounded-2xl border text-xs font-bold transition-all relative overflow-hidden",
                        formData.status === s 
                          ? cn(
                              "shadow-lg shadow-blue-100 scale-[1.02] border-transparent text-white",
                              s === 'Active' ? "bg-[var(--primary-blue)]" :
                              s === 'Rest' ? "bg-slate-500" :
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
            </form>

            <div className="px-8 py-6 border-t border-slate-100 bg-white sticky bottom-0 z-10">
              <button
                onClick={onSubmit}
                className="w-full bg-[var(--primary-blue)] hover:bg-[#0b5ed7] text-white font-bold py-4 rounded-2xl shadow-xl shadow-blue-200 transition-all active:scale-[0.98] font-noto"
              >
                {editingPage ? 'บันทึกการแก้ไข' : 'ยืนยันเพิ่มเพจ'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
