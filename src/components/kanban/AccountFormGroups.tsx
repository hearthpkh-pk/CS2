'use client';

import React from 'react';
import { FBAccount } from '@/types';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface SectionProps {
  formData: any;
  setFormData: (data: any) => void;
}

export const IdentitySection = ({ formData, setFormData }: SectionProps) => (
  <div className="space-y-5">
    <div className="flex items-center gap-2 px-1">
      <div className="w-1 h-4 bg-[var(--primary-theme)] rounded-full" />
      <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">ข้อมูลพื้นฐาน & โปรไฟล์</span>
    </div>
    
    <div className="space-y-4">
      <div className="space-y-1 relative pt-2">
        <label className="absolute -top-1 left-3 px-1.5 bg-white text-[10px] font-bold text-[var(--primary-theme)] uppercase tracking-widest z-10">ชื่อเรียกบัญชี</label>
        <input 
          type="text"
          required
          value={formData.name}
          onChange={e => setFormData({...formData, name: e.target.value})}
          placeholder="เช่น บัญชีหลัก 01"
          className="w-full bg-white border border-slate-200 rounded-2xl px-4 py-3.5 outline-none focus:ring-2 focus:ring-[var(--primary-theme)]/5 focus:border-[var(--primary-theme)] transition-all text-sm font-noto"
        />
      </div>
      
      <div className="space-y-1 relative pt-2">
        <label className="absolute -top-1 left-3 px-1.5 bg-white text-[10px] font-bold text-slate-400 uppercase tracking-widest z-10">Facebook Profile Link</label>
        <input 
          type="url"
          value={formData.profileUrl}
          onChange={e => setFormData({...formData, profileUrl: e.target.value})}
          placeholder="https://www.facebook.com/profile.php?id=..."
          className="w-full bg-white border border-slate-200 rounded-2xl px-4 py-3.5 outline-none focus:ring-2 focus:ring-[var(--primary-theme)]/5 focus:border-[var(--primary-theme)] transition-all text-sm font-inter"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2 pt-1 flex-1">
          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-1">จัดเก็บลงกล่องที่</label>
          <select 
            value={formData.boxId}
            onChange={e => {
              const newBoxId = parseInt(e.target.value);
              const update: any = { boxId: newBoxId };
              if (newBoxId === 0) update.status = 'Admin';
              setFormData({...formData, ...update});
            }}
            className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 outline-none focus:ring-2 focus:ring-[var(--primary-theme)]/5 focus:border-[var(--primary-theme)] transition-all text-xs font-bold font-noto"
          >
            <option value={0}>Admin Box (พิเศษ)</option>
            {[1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20].map(n => (
              <option key={n} value={n}>{n}</option>
            ))}
          </select>
        </div>

        <div className="space-y-2 pt-1 flex-1">
          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-1">สถานะปัจจุบัน</label>
          <div className="flex bg-slate-50 p-1 rounded-2xl border border-slate-100">
            {(['Live', 'Check', 'Die', 'Admin'] as FBAccount['status'][]).map(s => (
              <button
                key={s}
                type="button"
                onClick={() => {
                  const update: any = { status: s };
                  if (s === 'Admin') update.boxId = 0;
                  else if (formData.boxId === 0) update.boxId = 1;
                  setFormData({...formData, ...update});
                }}
                className={cn(
                  "flex-1 py-1.5 rounded-xl text-[10px] font-bold transition-all",
                  formData.status === s 
                    ? cn(
                        "text-white shadow-lg",
                        s === 'Live' ? "bg-emerald-500 shadow-emerald-100" :
                        s === 'Check' ? "bg-amber-500 shadow-amber-100" :
                        s === 'Admin' ? "bg-[var(--primary-theme)] shadow-slate-200/50" :
                        "bg-red-500 shadow-red-100"
                      )
                    : "text-slate-400 hover:text-slate-600"
                )}
              >
                {s}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  </div>
);

export const LoginSection = ({ formData, setFormData }: SectionProps) => (
  <div className="space-y-5">
    <div className="flex items-center gap-2 px-1">
       <div className="w-1 h-4 bg-amber-400 rounded-full" />
       <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">ข้อมูลล็อกอินหลัก</span>
    </div>
    
    <div className="space-y-4">
      <div className="space-y-1 relative pt-2">
        <label className="absolute -top-1 left-3 px-1.5 bg-white text-[10px] font-bold text-amber-500 uppercase tracking-widest z-10">Facebook UID</label>
        <input 
          type="text"
          required
          value={formData.uid}
          onChange={e => setFormData({...formData, uid: e.target.value})}
          placeholder="เช่น 1000XXXXXXXXXXX"
          className="w-full bg-white border border-slate-200 rounded-2xl px-4 py-3.5 outline-none focus:ring-2 focus:ring-amber-500/5 focus:border-amber-400 transition-all text-sm font-inter"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1 relative pt-2">
          <label className="absolute -top-1 left-3 px-1.5 bg-white text-[10px] font-bold text-slate-400 uppercase tracking-widest z-10">Password</label>
          <input 
            type="text"
            value={formData.password}
            onChange={e => setFormData({...formData, password: e.target.value})}
            className="w-full bg-white border border-slate-200 rounded-2xl px-4 py-3.5 outline-none focus:ring-2 focus:ring-[var(--primary-theme)]/5 focus:border-[var(--primary-theme)] transition-all text-sm font-inter"
          />
        </div>
        <div className="space-y-1 relative pt-2">
          <label className="absolute -top-1 left-3 px-1.5 bg-white text-[10px] font-bold text-slate-400 uppercase tracking-widest z-10">2FA Secret</label>
          <div className="flex gap-2">
            <input 
              type="text"
              value={formData.twoFactor}
              onChange={e => setFormData({...formData, twoFactor: e.target.value})}
              placeholder="ABCD EFGH..."
              className="flex-1 min-w-0 bg-white border border-slate-200 rounded-2xl px-4 py-3.5 outline-none focus:ring-2 focus:ring-[var(--primary-theme)]/5 focus:border-[var(--primary-theme)] transition-all text-sm font-inter uppercase"
            />
            <a 
              href="https://gauth.apps.gbraad.nl/#main" 
              target="_blank" 
              rel="noopener noreferrer"
              className="w-12 h-[46px] flex items-center justify-center bg-slate-50 border border-slate-200 rounded-2xl text-[10px] font-black text-slate-400 hover:text-amber-500 hover:bg-amber-50 hover:border-amber-100 transition-all shrink-0 shadow-sm active:scale-95"
              title="Open 2FA Converter Tool"
            >
              2FA
            </a>
          </div>
        </div>
      </div>
    </div>
  </div>
);

export const EmailSection = ({ formData, setFormData }: SectionProps) => (
  <div className="space-y-5">
    <div className="flex items-center gap-2 px-1">
       <div className="w-1 h-4 bg-emerald-400 rounded-full" />
       <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">อีเมลสำรอง & กู้คืน</span>
    </div>

    <div className="grid grid-cols-2 gap-4">
      <div className="space-y-1 relative pt-2">
        <label className="absolute -top-1 left-3 px-1.5 bg-white text-[10px] font-bold text-emerald-600 uppercase tracking-widest z-10">อีเมลหลัก ( recovery )</label>
        <input 
          type="email"
          value={formData.email}
          onChange={e => setFormData({...formData, email: e.target.value})}
          placeholder="mail@outlook.com"
          className="w-full bg-white border border-slate-200 rounded-2xl px-4 py-3.5 outline-none focus:ring-2 focus:ring-emerald-500/5 focus:border-emerald-400 transition-all text-sm font-inter"
        />
      </div>
      <div className="space-y-1 relative pt-2">
        <label className="absolute -top-1 left-3 px-1.5 bg-white text-[10px] font-bold text-emerald-600 uppercase tracking-widest z-10">รหัสผ่านอีเมล</label>
        <input 
          type="text"
          value={formData.emailPassword}
          onChange={e => setFormData({...formData, emailPassword: e.target.value})}
          className="w-full bg-white border border-slate-200 rounded-2xl px-4 py-3.5 outline-none focus:ring-2 focus:ring-emerald-500/5 focus:border-emerald-400 transition-all text-sm font-inter"
        />
      </div>
    </div>

    <div className="space-y-1 relative pt-2">
      <label className="absolute -top-1 left-3 px-1.5 bg-white text-[10px] font-bold text-slate-400 uppercase tracking-widest z-10">อีเมลที่ 2 ( Backup )</label>
      <input 
        type="email"
        value={formData.email2}
        onChange={e => setFormData({...formData, email2: e.target.value})}
        placeholder="mail2@getmule.com"
        className="w-full bg-white border border-slate-200 rounded-2xl px-4 py-3.5 outline-none focus:ring-2 focus:ring-[var(--primary-theme)]/5 focus:border-[var(--primary-theme)] transition-all text-sm font-inter"
      />
    </div>
  </div>
);

export const BrowserSection = ({ formData, setFormData }: SectionProps) => (
  <div className="space-y-4">
    <div className="flex items-center gap-2 px-1">
       <div className="w-1 h-4 bg-slate-400 rounded-full" />
       <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">Browser Session</span>
    </div>
    <div className="space-y-1 relative pt-2">
      <label className="absolute -top-1 left-3 px-1.5 bg-white text-[10px] font-bold text-slate-400 uppercase tracking-widest z-10">Facebook Cookies</label>
      <textarea 
        value={formData.cookie}
        onChange={e => setFormData({...formData, cookie: e.target.value})}
        placeholder="c_user=...; xs=...;"
        rows={3}
        className="w-full bg-white border border-slate-200 rounded-2xl px-4 py-3 outline-none focus:ring-2 focus:ring-[var(--primary-theme)]/5 focus:border-[var(--primary-theme)] transition-all text-[10px] font-inter resize-none h-24"
      />
    </div>
  </div>
);
