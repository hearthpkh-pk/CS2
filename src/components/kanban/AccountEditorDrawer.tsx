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
    email?: string;
    emailPassword?: string;
    email2?: string;
    profileUrl?: string;
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
  const [importText, setImportText] = React.useState('');

  if (!isOpen) return null;

  const parseAccountString = (input: string) => {
    if (!input.trim()) return;

    let uid = '';
    let password = '';
    let twoFactor = '';
    let email = '';
    let emailPassword = '';
    let email2 = '';
    let profileUrl = '';
    let cookie = '';
    let name = formData.name;

    // 1. Extract Cookie first
    const cookieMatch = input.match(/(c_user=\d+;.*?xs=[^;|\s]+)/i);
    if (cookieMatch) {
      cookie = cookieMatch[1];
      const uidMatch = cookie.match(/c_user=(\d+)/);
      if (uidMatch) uid = uidMatch[1];
    }

    // 2. Extract Profile URL
    const urlMatches = input.match(/(?:https?:\/\/)?(?:www\.)?(?:facebook\.com|fb\.com)\/[^\s|:|;]+/gi);
    if (urlMatches && urlMatches.length > 0) {
      profileUrl = urlMatches[0];
      const idMatch = profileUrl.match(/(\d+)/);
      if (idMatch && !uid) uid = idMatch[1];
    }

    // 3. Split by common separators
    const separators = ['|', ':', ' '];
    let parts: string[] = [];
    
    for (const sep of separators) {
      const testParts = input.split(sep).map(p => p.trim()).filter(p => p.length > 0);
      if (testParts.length >= 3) {
        parts = testParts;
        break;
      }
    }

    if (parts.length > 0) {
      const detectedEmails: string[] = [];

      parts.forEach((part, index) => {
        // Detect UID
        if (!uid && /^\d{10,16}$/.test(part)) {
          uid = part;
        }
        // Detect 2FA
        else if (!twoFactor && (
          /^[A-Z0-9\s]{16,64}$/.test(part) || 
          (/^[a-z0-9]{16,64}$/i.test(part) && part.length >= 15 && !part.includes('@') && !part.includes('.'))
        )) {
          twoFactor = part;
        }
        // Detect Emails
        else if (part.includes('@')) {
          detectedEmails.push(part);
          if (detectedEmails.length === 1) {
            email = part;
            if (!name) name = part.split('@')[0];
            
            // Heuristic for Passmail
            if (index + 1 < parts.length) {
              const nextPart = parts[index + 1];
              if (nextPart.length > 4 && nextPart !== twoFactor && !nextPart.includes('@') && !nextPart.includes('facebook.com')) {
                emailPassword = nextPart;
              }
            }
          } else if (detectedEmails.length === 2) {
            email2 = part;
          }
        }
      });

      // Password Heuristic
      if (parts.length >= 2) {
        const p0 = parts[0];
        const p1 = parts[1];
        
        if ((p0 === uid || p0.includes('@')) && p1 !== twoFactor && !detectedEmails.includes(p1) && p1 !== emailPassword && !p1.includes('facebook.com')) {
          password = p1;
        } else if (parts.length >= 3 && !password) {
           const p2 = parts[2];
           if (p2 !== twoFactor && !detectedEmails.includes(p2) && p2 !== emailPassword && !p2.includes('@') && !p2.includes('facebook.com') && p2.length > 4) {
             password = p2;
           }
        }
      }
    }

    setFormData({
      ...formData,
      uid: uid || formData.uid,
      password: password || formData.password,
      twoFactor: twoFactor || formData.twoFactor,
      email: email || formData.email,
      emailPassword: emailPassword || formData.emailPassword,
      email2: email2 || formData.email2,
      profileUrl: profileUrl || formData.profileUrl,
      cookie: cookie || formData.cookie,
      name: name || formData.name
    });
    
    if (uid || password || twoFactor || cookie || email || profileUrl) {
       setImportText('');
    }
  };

  return (
    <div className="fixed inset-0 z-[100] overflow-hidden font-prompt font-noto">
      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={onClose} />
      <div className="absolute inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-white shadow-2xl animate-slide-in-right h-screen">
          <div className="h-full flex flex-col">
            <div className="px-8 py-5 border-b border-slate-100 flex items-center justify-between bg-white sticky top-0 z-10">
              <div>
                <h3 className="text-xl font-bold text-slate-800 uppercase tracking-tight leading-none">
                  {editingAccount ? 'แก้ไขข้อมูลบัญชี' : 'เพิ่มบัญชีใหม่'}
                </h3>
                <p className="text-[10px] text-slate-400 mt-1 uppercase tracking-wider font-bold opacity-60">Account Hierarchy & Controls</p>
              </div>
              <button onClick={onClose} className="w-10 h-10 flex items-center justify-center bg-slate-50 text-slate-400 hover:text-slate-600 rounded-xl transition-all">
                <Plus size={24} className="rotate-45" />
              </button>
            </div>

            <form onSubmit={onSubmit} className="flex-1 overflow-y-auto px-8 py-6 space-y-8 scroll-smooth">
              {/* Smart Paste Section */}
              <div className="space-y-3 p-5 bg-blue-50/50 rounded-[2rem] border border-blue-100 border-dashed">
                <div className="flex items-center justify-between px-1">
                  <span className="text-[10px] font-bold text-[var(--primary-blue)] uppercase tracking-widest flex items-center gap-2">
                      <Plus size={12} /> Smart Import / Paste
                  </span>
                  <div className="flex items-center gap-3">
                    <button 
                      type="button"
                      onClick={() => setImportText('')}
                      className="text-[9px] font-bold text-slate-400 hover:text-red-500 transition-colors uppercase tracking-widest"
                    >
                      Clear
                    </button>
                    <span className="text-[9px] font-bold text-blue-300">MULTI-DATA SUPPORT</span>
                  </div>
                </div>
                <textarea 
                  value={importText}
                  onChange={(e) => {
                    setImportText(e.target.value);
                    parseAccountString(e.target.value);
                  }}
                  placeholder="วางข้อมูลทั้งชุดที่นี่ (รองรับ UID|Pass|2FA|Mail1|Pass1|Mail2...)"
                  className="w-full bg-white border border-blue-100 rounded-2xl px-4 py-3 outline-none focus:ring-2 focus:ring-[var(--primary-blue)]/10 focus:border-[var(--primary-blue)]/50 transition-all text-xs font-inter resize-none h-20 placeholder:text-blue-200"
                />
              </div>

              {/* Group 1: Identity & Profile */}
              <div className="space-y-5">
                <div className="flex items-center gap-2 px-1">
                   <div className="w-1 h-4 bg-[var(--primary-blue)] rounded-full" />
                   <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">ข้อมูลพื้นฐาน & โปรไฟล์</span>
                </div>
                
                <div className="space-y-4">
                  <div className="space-y-1 relative pt-2">
                    <label className="absolute -top-1 left-3 px-1.5 bg-white text-[10px] font-bold text-[var(--primary-blue)] uppercase tracking-widest z-10">ชื่อเรียกบัญชี</label>
                    <input 
                      type="text"
                      required
                      value={formData.name}
                      onChange={e => setFormData({...formData, name: e.target.value})}
                      placeholder="เช่น บัญชีหลัก 01"
                      className="w-full bg-white border border-slate-200 rounded-2xl px-4 py-3.5 outline-none focus:ring-2 focus:ring-[var(--primary-blue)]/5 focus:border-[var(--primary-blue)] transition-all text-sm font-noto"
                    />
                  </div>
                  
                  <div className="space-y-1 relative pt-2">
                    <label className="absolute -top-1 left-3 px-1.5 bg-white text-[10px] font-bold text-slate-400 uppercase tracking-widest z-10">Facebook Profile Link</label>
                    <input 
                      type="url"
                      value={formData.profileUrl}
                      onChange={e => setFormData({...formData, profileUrl: e.target.value})}
                      placeholder="https://www.facebook.com/profile.php?id=..."
                      className="w-full bg-white border border-slate-200 rounded-2xl px-4 py-3.5 outline-none focus:ring-2 focus:ring-[var(--primary-blue)]/5 focus:border-[var(--primary-blue)] transition-all text-sm font-inter"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1 relative pt-2">
                      <label className="absolute -top-1 left-3 px-1.5 bg-white text-[10px] font-bold text-slate-400 uppercase tracking-widest z-10">จัดเก็บลงกล่องที่</label>
                      <select 
                        value={formData.boxId}
                        onChange={e => setFormData({...formData, boxId: parseInt(e.target.value)})}
                        className="w-full bg-white border border-slate-200 rounded-2xl px-4 py-3.5 outline-none focus:ring-2 focus:ring-[var(--primary-blue)]/5 focus:border-[var(--primary-blue)] transition-all text-sm font-noto"
                      >
                        <option value={0}>Admin Box (พิเศษ)</option>
                        {boxes.filter(b => b > 0).map(b => <option key={b} value={b}>{b}</option>)}
                      </select>
                    </div>
                    <div className="space-y-1 relative pt-2">
                      <label className="absolute -top-1 left-3 px-1.5 bg-white text-[10px] font-bold text-slate-400 uppercase tracking-widest z-10">สถานะปัจจุบัน</label>
                      <div className="grid grid-cols-4 gap-1.5 h-[46px]">
                        {(['Live', 'Check', 'Die', 'Admin'] as FBAccount['status'][]).map(s => (
                          <button
                            key={s}
                            type="button"
                            onClick={() => setFormData({...formData, status: s})}
                            className={cn(
                              "rounded-xl border text-[8px] font-bold transition-all flex items-center justify-center",
                              formData.status === s 
                                ? cn(
                                    "border-transparent text-white",
                                    s === 'Live' ? "bg-emerald-500 shadow-lg shadow-emerald-100" :
                                    s === 'Check' ? "bg-amber-500 shadow-lg shadow-amber-100" :
                                    s === 'Admin' ? "bg-indigo-600 shadow-lg shadow-indigo-100" :
                                    "bg-red-500 shadow-lg shadow-red-100"
                                  )
                                : "bg-white border-slate-200 text-slate-400"
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

              {/* Group 2: Login Credentials */}
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
                        className="w-full bg-white border border-slate-200 rounded-2xl px-4 py-3.5 outline-none focus:ring-2 focus:ring-[var(--primary-blue)]/5 focus:border-[var(--primary-blue)] transition-all text-sm font-inter"
                      />
                    </div>
                    <div className="space-y-1 relative pt-2">
                      <label className="absolute -top-1 left-3 px-1.5 bg-white text-[10px] font-bold text-slate-400 uppercase tracking-widest z-10">2FA Secret</label>
                      <input 
                        type="text"
                        value={formData.twoFactor}
                        onChange={e => setFormData({...formData, twoFactor: e.target.value})}
                        placeholder="ABCD EFGH..."
                        className="w-full bg-white border border-slate-200 rounded-2xl px-4 py-3.5 outline-none focus:ring-2 focus:ring-[var(--primary-blue)]/5 focus:border-[var(--primary-blue)] transition-all text-sm font-inter uppercase"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Group 3: Email Recovery */}
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
                    className="w-full bg-white border border-slate-200 rounded-2xl px-4 py-3.5 outline-none focus:ring-2 focus:ring-[var(--primary-blue)]/5 focus:border-[var(--primary-blue)] transition-all text-sm font-inter"
                  />
                </div>
              </div>

              {/* Group 4: Browser Session */}
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
                    className="w-full bg-white border border-slate-200 rounded-2xl px-4 py-3 outline-none focus:ring-2 focus:ring-[var(--primary-blue)]/5 focus:border-[var(--primary-blue)] transition-all text-[10px] font-inter resize-none h-24"
                  />
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
