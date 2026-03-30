'use client';

import React from 'react';
import { Plus, Shield, Key, Database } from 'lucide-react';
import { FBAccount } from '@/types';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { SmartImportSection } from './SmartImportSection';
import { 
  IdentitySection, 
  LoginSection, 
  EmailSection, 
  BrowserSection 
} from './AccountFormGroups';

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
    
  };

  return (
    <div className="fixed inset-0 z-[100] overflow-hidden font-prompt font-noto">
      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={onClose} />
      <div className="absolute inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-white shadow-2xl animate-slide-in-right h-screen">
          <form onSubmit={onSubmit} className="h-full flex flex-col">
            <div className="px-8 py-5 border-b border-slate-100 flex items-center justify-between bg-white sticky top-0 z-10">
              <div>
                <h3 className="text-xl font-bold text-slate-800 uppercase tracking-tight leading-none">
                  {editingAccount ? 'แก้ไขข้อมูลบัญชี' : 'เพิ่มบัญชีใหม่'}
                </h3>
                <p className="text-[10px] text-slate-400 mt-1 uppercase tracking-wider font-bold opacity-60">Account Hierarchy & Controls</p>
              </div>
              <button type="button" onClick={onClose} className="w-10 h-10 flex items-center justify-center bg-slate-50 text-slate-400 hover:text-slate-600 rounded-xl transition-all">
                <Plus size={24} className="rotate-45" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto px-8 py-6 space-y-8 scroll-smooth">
              <SmartImportSection 
                importText={importText}
                setImportText={setImportText}
                onParse={parseAccountString}
              />

              <IdentitySection formData={formData} setFormData={setFormData} />
              <LoginSection formData={formData} setFormData={setFormData} />
              <EmailSection formData={formData} setFormData={setFormData} />
              <BrowserSection formData={formData} setFormData={setFormData} />
            </div>

            <div className="px-8 py-6 border-t border-slate-100 bg-white sticky bottom-0 z-10">
              <button
                type="submit"
                className="w-full bg-[var(--primary-theme)] hover:bg-[var(--primary-theme-hover)] text-white font-bold py-4 rounded-2xl shadow-xl shadow-slate-200/50 transition-all active:scale-[0.98] font-noto"
              >
                {editingAccount ? 'บันทึกการแก้ไขบัญชี' : 'ยืนยันเพิ่มบัญชี'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
