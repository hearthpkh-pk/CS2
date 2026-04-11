'use client';

import React, { useState } from 'react';
import { Lock, ShieldCheck, AlertCircle, CheckCircle2, Loader2, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/lib/supabaseClient';
import { cn } from '@/lib/utils';

export const ProfileManager = () => {
  const { user } = useAuth();
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  if (!user) return null;

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);

    if (newPassword.length < 6) {
      setMessage({ type: 'error', text: 'รหัสผ่านต้องมีความยาวอย่างน้อย 6 ตัวอักษร' });
      return;
    }

    if (newPassword !== confirmPassword) {
      setMessage({ type: 'error', text: 'รหัสผ่านไม่ตรงกัน กรุณาตรวจสอบอีกครั้ง' });
      return;
    }

    setIsLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({ password: newPassword });
      if (error) throw error;
      
      setMessage({ type: 'success', text: 'เปลี่ยนรหัสผ่านเรียบร้อยแล้ว' });
      setNewPassword('');
      setConfirmPassword('');
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message || 'เกิดข้อผิดพลาดในการเปลี่ยนรหัสผ่าน' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-[1200px] mx-auto flex flex-col gap-6 px-4 md:px-8 pb-10 animate-in fade-in duration-700">
      
      {/* --- PAGE HEADER (Standard Mode) --- */}
      <div className="flex justify-between items-center border-b border-slate-200 pt-4 pb-6 mb-2">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <h2 className="text-2xl font-bold text-[#0f172a] font-outfit uppercase tracking-tight leading-none">
              USER PROFILE
            </h2>
          </div>
          <p className="text-slate-400 font-noto text-[11px] mt-1.5 flex items-center gap-2">
            ข้อมูลประจำตัวพนักงานและระบบรักษาความปลอดภัย • <span className="text-[var(--primary-theme)] font-bold">Personal Terminal</span>
          </p>
        </div>
      </div>

      <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm relative overflow-hidden">
        {/* Decorative background element */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-slate-50 rounded-full blur-3xl -mr-32 -mt-32 opacity-40 pointer-events-none" />
        
        <div className="p-8 md:p-12 space-y-12 relative z-10">
          
          {/* 👤 SECTION 1: IDENTITY */}
          <div className="flex flex-col lg:flex-row gap-8 lg:gap-16 border-b border-slate-50 pb-12">
            <div className="w-full lg:w-1/3 shrink-0">
               <h3 className="text-lg font-bold text-slate-800 font-outfit uppercase tracking-tight mb-2">Account Identity</h3>
               <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest leading-relaxed">
                 ข้อมูลพื้นฐานและสิทธิ์การเข้าถึงของคุณ <br className="hidden lg:block"/> ในระบบ Editor HQ Command Center
               </p>
            </div>

            <div className="flex-1">
               <div className="bg-slate-50/50 rounded-3xl p-6 border border-slate-100/50 flex flex-col sm:flex-row items-center gap-8">
                 <div className="w-20 h-20 rounded-[1.5rem] bg-white border border-slate-200 shadow-sm flex items-center justify-center overflow-hidden shrink-0">
                   {user.avatarUrl ? (
                     <img src={user.avatarUrl} alt={user.name} className="w-full h-full object-cover" />
                   ) : (
                     <span className="text-2xl font-bold text-slate-300 uppercase">{user.name.trim().slice(-1)}</span>
                   )}
                 </div>
                 <div className="space-y-4 text-center sm:text-left flex-1">
                   <div>
                     <h4 className="text-lg font-bold text-slate-800 font-outfit uppercase tracking-tight mb-0.5">{user.name}</h4>
                     <p className="text-[11px] font-medium text-slate-400 font-inter">{user.email || 'System Account'}</p>
                   </div>
                   <div className="flex flex-wrap justify-center sm:justify-start gap-3">
                     <div className="px-4 py-1.5 bg-white rounded-xl border border-slate-200">
                        <p className="text-[8px] font-bold text-slate-300 uppercase tracking-widest leading-none mb-1">Role</p>
                        <p className="text-[10px] font-bold text-[var(--primary-theme)] uppercase tracking-tight">{user.role.replace('_', ' ')}</p>
                     </div>
                     <div className="px-4 py-1.5 bg-white rounded-xl border border-slate-200">
                        <p className="text-[8px] font-bold text-slate-300 uppercase tracking-widest leading-none mb-1">Placement</p>
                        <p className="text-[10px] font-bold text-slate-700 uppercase tracking-tight">{user.group || 'Standby'}</p>
                     </div>
                   </div>
                 </div>
               </div>
            </div>
          </div>

          {/* 🔒 SECTION 2: SECURITY */}
          <div className="flex flex-col lg:flex-row gap-8 lg:gap-16">
            <div className="w-full lg:w-1/3 shrink-0">
               <h3 className="text-lg font-bold text-slate-800 font-outfit uppercase tracking-tight mb-2">Security Center</h3>
               <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest leading-relaxed">
                 จัดการและปรับปรุงความปลอดภัย <br className="hidden lg:block"/> ของบัญชีพนักงานด้วยรหัสผ่านใหม่
               </p>
            </div>

            <div className="flex-1 max-w-xl">
              <form onSubmit={handleUpdatePassword} className="space-y-6">
                {message && (
                  <div className={cn(
                    "p-4 rounded-2xl border flex items-start gap-3 animate-in fade-in slide-in-from-top-2",
                    message.type === 'success' ? "bg-emerald-50/50 border-emerald-100" : "bg-rose-50/50 border-rose-100"
                  )}>
                    <div className={cn(
                      "w-8 h-8 rounded-lg flex items-center justify-center shrink-0 shadow-sm",
                      message.type === 'success' ? "bg-emerald-500 text-white" : "bg-rose-500 text-white"
                    )}>
                      {message.type === 'success' ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
                    </div>
                    <div>
                      <p className={cn("text-xs font-bold", message.type === 'success' ? "text-emerald-800" : "text-rose-800")}>
                        {message.type === 'success' ? 'Update Successful' : 'Update Failed'}
                      </p>
                      <p className={cn("text-[10px] font-medium opacity-70", message.type === 'success' ? "text-emerald-700" : "text-rose-700")}>{message.text}</p>
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-1 gap-5">
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">New Password (ขั้นต่ำ 6 ตัวอักษร)</label>
                    <div className="relative group">
                      <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-[var(--primary-theme)] transition-colors">
                        <Lock size={16} />
                      </div>
                      <input 
                        type={showPassword ? "text" : "password"}
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        required
                        placeholder="กรอกรหัสผ่านใหม่..."
                        className="w-full bg-slate-50 border border-slate-100 rounded-2xl pl-11 pr-12 py-3.5 text-sm font-medium text-slate-800 focus:border-[var(--primary-theme)] focus:ring-4 focus:ring-[var(--primary-theme)]/5 outline-none transition-all placeholder:text-slate-300 font-inter"
                      />
                      <button 
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300 hover:text-slate-600 transition-colors"
                      >
                        {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Confirm New Password</label>
                    <div className="relative group">
                      <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-[var(--primary-theme)] transition-colors">
                        <ShieldCheck size={16} />
                      </div>
                      <input 
                        type={showPassword ? "text" : "password"}
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        required
                        placeholder="ยืนยันรหัสผ่านใหม่อีกครั้ง..."
                        className="w-full bg-slate-50 border border-slate-100 rounded-2xl pl-11 pr-4 py-3.5 text-sm font-medium text-slate-800 focus:border-[var(--primary-theme)] focus:ring-4 focus:ring-[var(--primary-theme)]/5 outline-none transition-all placeholder:text-slate-300 font-inter"
                      />
                    </div>
                  </div>
                </div>

                <div className="pt-4 flex flex-col gap-4">
                  <button 
                    type="submit"
                    disabled={isLoading || !newPassword || !confirmPassword}
                    className="w-full px-8 py-3.5 bg-[var(--primary-theme)] text-white text-xs font-black uppercase tracking-[0.2em] rounded-2xl hover:bg-[var(--primary-theme-hover)] transition-all shadow-lg shadow-blue-100/50 active:scale-[0.98] disabled:opacity-30 disabled:shadow-none flex items-center justify-center gap-3 group"
                  >
                    {isLoading ? (
                      <Loader2 size={16} className="animate-spin" />
                    ) : (
                      'Commit Security Update'
                    )}
                  </button>
                  <p className="text-[9px] text-slate-400 font-bold uppercase tracking-[0.1em] text-center opacity-60">
                    *กรุณาจดจำรหัสผ่านใหม่เพื่อใช้ในการล็อกอินครั้งถัดไป
                  </p>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
