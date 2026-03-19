'use client';

import { Plus, Shield, UserCheck } from 'lucide-react';
import { Page, FBAccount } from '@/types';
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
    adminIds: string[];
  };
  setFormData: (data: any) => void;
  onSubmit: (e: React.FormEvent) => void;
  boxes: number[];
  adminAccounts: FBAccount[];
}

export const PageEditorDrawer = ({
  isOpen,
  onClose,
  editingPage,
  formData,
  setFormData,
  onSubmit,
  boxes,
  adminAccounts
}: PageEditorDrawerProps) => {
  if (!isOpen) return null;

  const toggleAdmin = (adminId: string) => {
    const currentIds = formData.adminIds || [];
    const newIds = currentIds.includes(adminId)
      ? currentIds.filter(id => id !== adminId)
      : [...currentIds, adminId];
    setFormData({ ...formData, adminIds: newIds });
  };

  return (
    <div className="fixed inset-0 z-[100] overflow-hidden font-prompt text-slate-700">
      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={onClose} />
      <div className="absolute inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-white shadow-2xl animate-slide-in-right h-screen">
          <div className="h-full flex flex-col">
            <div className="px-8 py-5 border-b border-slate-100 flex items-center justify-between bg-white sticky top-0 z-10">
              <div>
                <h3 className="text-xl font-bold text-primary-navy font-noto uppercase tracking-tight leading-none">
                  {editingPage ? 'แก้ไขข้อมูลเพจ' : 'เพิ่มเพจใหม่'}
                </h3>
                <p className="text-[10px] text-slate-400 mt-1 font-noto uppercase tracking-wider font-bold opacity-60">รายละเอียดและการเชื่อมโยง Admin</p>
              </div>
              <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
                <Plus size={24} className="rotate-45" />
              </button>
            </div>

            <form onSubmit={onSubmit} className="flex-1 overflow-y-auto px-8 py-6 space-y-7 scroll-smooth">
              {/* Group 1: Basic Info */}
              <div className="space-y-4">
                <div className="space-y-1 relative pt-2">
                    <label className="absolute -top-1 left-3 px-1.5 bg-white text-[10px] font-bold text-[var(--primary-theme)] uppercase tracking-widest z-10 transition-colors">ชื่อเพจ</label>
                    <input 
                      type="text"
                      required
                      value={formData.name}
                      onChange={e => setFormData({...formData, name: e.target.value})}
                      placeholder="ระบุชื่อเพจ..."
                      className="w-full bg-white border border-slate-200 rounded-2xl px-4 py-3.5 outline-none focus:ring-2 focus:ring-[var(--primary-theme)]/5 focus:border-[var(--primary-theme)] transition-all placeholder:text-slate-300 text-sm font-noto"
                    />
                  </div>

                  <div className="space-y-1 relative pt-2">
                    <label className="absolute -top-1 left-3 px-1.5 bg-white text-[10px] font-bold text-slate-400 uppercase tracking-widest z-10">ลิงก์เพจ</label>
                    <input 
                      type="url"
                      value={formData.url}
                      onChange={e => setFormData({...formData, url: e.target.value})}
                      placeholder="https://facebook.com/your-page"
                      className="w-full bg-white border border-slate-200 rounded-2xl px-4 py-3.5 outline-none focus:ring-2 focus:ring-[var(--primary-theme)]/5 focus:border-[var(--primary-theme)] transition-all placeholder:text-slate-300 text-sm font-noto"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1 relative pt-2">
                      <label className="absolute -top-1 left-3 px-1.5 bg-white text-[10px] font-bold text-slate-400 uppercase tracking-widest z-10">หมวดหมู่</label>
                      <select 
                        value={formData.category}
                        onChange={e => setFormData({...formData, category: e.target.value})}
                        className="w-full bg-white border border-slate-200 rounded-2xl px-4 py-3.5 outline-none focus:ring-2 focus:ring-[var(--primary-theme)]/5 focus:border-[var(--primary-theme)] transition-all text-sm font-noto"
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
                        className="w-full bg-white border border-slate-200 rounded-2xl px-4 py-3.5 outline-none focus:ring-2 focus:ring-[var(--primary-theme)]/5 focus:border-[var(--primary-theme)] transition-all text-sm font-noto"
                      >
                      {boxes.map(b => <option key={b} value={b}>{b === 0 ? 'Admin Box' : b}</option>)}
                    </select>
                  </div>
                </div>
              </div>

              {/* Group 2: Admin Assignment */}
              <div className="space-y-4">
                <div className="flex items-center justify-between px-1">
                  <label className="text-[10px] font-bold text-indigo-600 uppercase tracking-widest flex items-center gap-2">
                    <Shield size={12} /> เชื่อมโยง ACC ADMIN
                  </label>
                  <span className="text-[10px] text-slate-400 font-bold">{formData.adminIds.length} SELECTED</span>
                </div>
                
                <div className="space-y-2 max-h-[160px] overflow-y-auto pr-2 custom-scrollbar">
                  {adminAccounts.length > 0 ? (
                    adminAccounts.map(admin => (
                      <button
                        key={admin.id}
                        type="button"
                        onClick={() => toggleAdmin(admin.id)}
                        className={cn(
                          "w-full flex items-center justify-between p-3 rounded-xl border transition-all text-left group",
                          formData.adminIds.includes(admin.id)
                            ? "bg-indigo-50 border-indigo-200 shadow-sm"
                            : "bg-white border-slate-100 hover:border-slate-200"
                        )}
                      >
                        <div className="flex items-center gap-3">
                          <div className={cn(
                            "w-8 h-8 rounded-lg flex items-center justify-center transition-colors",
                            formData.adminIds.includes(admin.id) ? "bg-indigo-600 text-white" : "bg-slate-100 text-slate-400"
                          )}>
                             <UserCheck size={14} />
                          </div>
                          <div>
                            <p className={cn("text-xs font-bold", formData.adminIds.includes(admin.id) ? "text-indigo-900" : "text-slate-700")}>
                                {admin.name}
                            </p>
                            <p className="text-[9px] text-slate-400 font-inter">UID: {admin.uid}</p>
                          </div>
                        </div>
                        {formData.adminIds.includes(admin.id) && (
                          <div className="w-5 h-5 bg-indigo-600 rounded-full flex items-center justify-center">
                            <Plus size={12} className="text-white rotate-45" />
                          </div>
                        )}
                      </button>
                    ))
                  ) : (
                    <div className="py-6 border-2 border-dashed border-slate-100 rounded-2xl flex flex-col items-center justify-center gap-2 text-slate-400">
                      <Shield size={20} className="opacity-20" />
                      <p className="text-[10px] font-bold uppercase tracking-widest">ยังไม่มี ACC ADMIN ในระบบ</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Group 3: Status selection */}
              <div className="space-y-4">
                <div className="flex items-center justify-between px-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">สถานะเพจ</label>
                  <span className="text-[10px] text-[var(--primary-theme)] font-bold font-inter bg-[var(--primary-theme-bg)] px-2 py-0.5 rounded-full uppercase">Current Mode Focus</span>
                </div>
                <div className="grid grid-cols-3 gap-3">
                  {(['Active', 'Rest', 'Problem' ] as Page['status'][]).map(s => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => setFormData({...formData, status: s})}
                      className={cn(
                        "py-3 rounded-2xl border text-[10px] font-bold transition-all relative overflow-hidden",
                        formData.status === s 
                          ? cn(
                              "shadow-lg shadow-blue-100 scale-[1.02] border-transparent text-white font-black",
                              s === 'Active' ? "bg-[var(--primary-theme)]" :
                              s === 'Rest' ? "bg-slate-500" :
                              "bg-red-500"
                            )
                          : "bg-white border-slate-100 text-slate-400 hover:border-slate-200"
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
                className="w-full bg-[var(--primary-theme)] hover:bg-[var(--primary-theme-hover)] text-white font-bold py-4 rounded-2xl shadow-xl shadow-slate-200/50 transition-all active:scale-[0.98] font-noto"
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
