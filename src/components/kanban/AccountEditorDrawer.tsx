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
    rawText?: string;
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

  React.useEffect(() => {
    if (isOpen) {
      if (editingAccount) {
        try {
          const dict = JSON.parse(localStorage.getItem('cs_raw_texts') || '{}');
          setImportText(dict[editingAccount.uid] || editingAccount.rawText || formData.rawText || '');
        } catch {
          setImportText(editingAccount.rawText || formData.rawText || '');
        }
      } else {
        // For new accounts, initialize with whatever formData has (SetupView resets it to '') 
        // Do not force it to '' blindly if the user is typing!
        setImportText(formData.rawText || '');
      }
    } else {
      setImportText('');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, editingAccount]);

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

    let text = input.trim();

    // 1. Extract Profile URL first to avoid messing up delimiters
    const urlRegex = /(?:https?:\/\/)?(?:[a-zA-Z0-9-]+\.)?(?:facebook\.com|fb\.com)\/profile\.php\?id=(\d+)/i;
    const urlMatch = text.match(urlRegex);
    if (urlMatch) {
      profileUrl = `https://www.facebook.com/profile.php?id=${urlMatch[1]}`;
      uid = urlMatch[1];
      text = text.replace(urlMatch[0], ''); 
    }

    // Check generic FB urls (e.g. username links)
    const altUrlRegex = /(?:https?:\/\/)?(?:[a-zA-Z0-9-]+\.)?(?:facebook\.com|fb\.com)\/[a-zA-Z0-9.-]+/i;
    const altUrlMatch = text.match(altUrlRegex);
    if (!profileUrl && altUrlMatch) {
      profileUrl = altUrlMatch[0];
      text = text.replace(altUrlMatch[0], '');
    }

    // 2. Identify delimiter. | is standard market format. If not, fallback to :
    let delimiter = '|';
    if (!text.includes('|') && text.includes(':')) {
      delimiter = ':';
    }

    // Preserve the index structure
    let parts = text.split(delimiter).map(p => p.trim());

    // 3. Extract Cookie securely (Long segment with indicators)
    const cookieIndex = parts.findIndex(p => p.includes('c_user=') || p.includes('datr=') || p.includes('sb=') || p.includes('vpd='));
    if (cookieIndex !== -1) {
      cookie = parts[cookieIndex];
      parts[cookieIndex] = ''; // blank it to preserve index alignment!
      
      const cUserMatch = cookie.match(/c_user=(\d+)/);
      if (cUserMatch && !uid) {
        uid = cUserMatch[1];
      }
    }

    // 4. Trace mappings through remaining parts
    let uidIndex = -1;
    let emailIndex = -1;
    let unknownParts: {value: string, index: number}[] = [];

    parts.forEach((part, index) => {
      if (!part) return; // Skip blanks

      // Detect UID
      if (!uid && /^\d{10,20}$/.test(part)) {
        uid = part;
        uidIndex = index;
        return;
      }
      
      if (/^\d{10,20}$/.test(part) && uid === part) {
         uidIndex = index; 
         return;
      }
      
      // Detect 2FA (Handles 32-char solid or 8 groups of 4)
      const is2FA = /^[A-Z2-7]{32}$/i.test(part.replace(/\s+/g, '')) || /^[A-Z2-7]{4}(?:\s[A-Z2-7]{4}){7}$/i.test(part);
      if (!twoFactor && is2FA) {
        twoFactor = part;
        return;
      }
      
      // Detect Email
      const emailRegex = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/i;
      // Strip typical file labels (Email0: ...)
      let cleanPart = part.replace(/^(Email|Email0|MailRcv):\s*/i, '');
      if (emailRegex.test(cleanPart)) {
        if (!email) {
          email = cleanPart;
          emailIndex = index;
        } else if (!email2 && cleanPart !== email) {
          email2 = cleanPart;
        }
        return;
      }
      
      // Detect Dates (usually account birthdate)
      if (/^\d{1,2}-[A-Za-z]{3}-\d{2,4}$/.test(part) || /^\d{1,2}\/\d{1,2}\/\d{2,4}$/.test(part)) {
        return;
      }
      
      // Ignore Meta Labels
      if (/^(Name|Friend|DOB|Gender|CreatedTime|Meta|2FA):\s*/i.test(part)) {
         return;
      }

      // Remaining clean elements are likely passwords
      cleanPart = part.replace(/^(PassEmail0):\s*/i, '');
      if (cleanPart && cleanPart.length > 3) {
         unknownParts.push({ value: cleanPart, index });
      }
    });

    // 5. Intelligent Password Assignment
    unknownParts.forEach(up => {
      // If it immediately follows the UID, it's almost certainly the FB Password
      if (up.index === uidIndex + 1 && !password) {
        password = up.value;
      } 
      // If it intimately follows the Email
      else if (up.index === emailIndex + 1) {
        // If there was no UID at the start of the string (e.g. UID extracted from trailing URL), 
        // the Email acts as the primary ID, so the next item is usually the FB password.
        if (uidIndex === -1 && !password) {
          password = up.value;
        } else if (!emailPassword) {
          emailPassword = up.value;
        }
      }
    });

    // Fallback assignment if positional heuristic fails
    unknownParts.forEach(up => {
      if (up.value !== password && up.value !== emailPassword) {
        // Exclude Base64 giant blobs
        if (up.value.length > 50 && up.value.endsWith('=')) return; 
        
        if (!password) {
           password = up.value;
        } else if (!emailPassword) {
           emailPassword = up.value;
        }
      }
    });

    // If we only found ONE password, assume it is used for both FB and Email (common in farm setups)
    if (password && !emailPassword) {
      emailPassword = password;
    } else if (!password && emailPassword) {
      password = emailPassword;
    }

    // Auto-name
    if (!name && email) {
      name = email.split('@')[0];
    } else if (!name && uid) {
      name = `Acc ${uid.slice(-4)}`;
    }

    // URL Normalization & Auto-Generation
    if (!profileUrl && uid) {
      profileUrl = `https://www.facebook.com/profile.php?id=${uid}`;
    } else if (profileUrl && !profileUrl.startsWith('http')) {
      profileUrl = `https://${profileUrl}`;
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
      rawText: input, // Save the actual raw string from textarea to persist!
      name: name || formData.name
    });
  };

  return (
    <div className="fixed inset-0 z-[150] overflow-hidden font-prompt font-noto">
      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={onClose} />
      <div className="absolute inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-white shadow-2xl animate-slide-in-right h-screen">
          <form onSubmit={onSubmit} className="h-full flex flex-col">
            <div className="px-8 pt-12 pb-5 border-b border-slate-100 flex items-center justify-between bg-white sticky top-0 z-10">
              <div>
                <h3 className="text-xl font-bold text-slate-800 uppercase tracking-tight leading-none">
                  {editingAccount ? 'แก้ไขข้อมูลบัญชี' : 'เพิ่มบัญชีใหม่'}
                </h3>
                <p className="text-[10px] text-slate-400 mt-2 uppercase tracking-wider font-bold opacity-60">Account Hierarchy & Controls</p>
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
