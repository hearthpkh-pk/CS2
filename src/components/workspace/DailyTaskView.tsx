'use client';

import React, { useState } from 'react';
import { Send, CheckCircle2, Link as LinkIcon, Video, Layout, Info, ShieldCheck } from 'lucide-react';
import { Page, User } from '@/types';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface DailyTaskViewProps {
  currentUser: User;
  pages: Page[]; // เพจที่พนักงานรับผิดชอบ
}

export const DailyTaskView: React.FC<DailyTaskViewProps> = ({ currentUser, pages }) => {
  // Mocking 10 pages if user has fewer (for demonstration of the 10-page rule)
  const displayPages = pages.slice(0, 10);
  
  // State for 10 pages x 4 links
  const [submissionData, setSubmissionData] = useState<Record<string, string[]>>(() => {
    const initial: Record<string, string[]> = {};
    displayPages.forEach(p => {
      initial[p.id] = ['', '', '', ''];
    });
    return initial;
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleLinkChange = (pageId: string, index: number, value: string) => {
    setSubmissionData(prev => ({
      ...prev,
      [pageId]: prev[pageId].map((link, i) => i === index ? value : link)
    }));
  };

  const totalLinksFilled = Object.values(submissionData).flat().filter(l => l.trim() !== '').length;
  const totalRequired = displayPages.length * 4;
  const progress = (totalLinksFilled / totalRequired) * 100;

  const handleSubmit = async () => {
    setIsSubmitting(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));
    setIsSubmitting(false);
    setIsSuccess(true);
    setTimeout(() => setIsSuccess(false), 3000);
  };

  return (
    <div className="w-full max-w-[1600px] mx-auto px-4 md:px-8 pb-10 animate-in fade-in slide-in-from-bottom-4 duration-700 space-y-8">
      {/* Page Header (Golden Rules Mode 1) */}
      <div className="flex justify-between items-center border-b border-slate-200 pt-4 pb-6 mb-6">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <h2 className="text-2xl font-bold text-[#0f172a] font-outfit uppercase tracking-tight leading-none">
              DAILY SUBMISSION
            </h2>
          </div>
          <p className="text-slate-400 font-noto text-[11px] mt-1.5">
            บันทึกและส่งลิงก์วิดีโอรายวัน • <span className="text-[var(--primary-theme)] font-bold">Workspace</span>
          </p>
        </div>

        <div className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 border border-emerald-100 rounded-full">
          <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest font-noto">
            Live Session: {new Date().toLocaleDateString('th-TH', { 
              day: 'numeric', 
              month: 'long', 
              year: 'numeric' 
            })}
          </span>
        </div>
      </div>

      {/* Target & Progress Monitoring Section (Decoupled Card) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Progress Display */}
        <div className="md:col-span-2 bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-110 transition-transform duration-500">
            <Video className="text-blue-500 w-24 h-24 -mr-6 -mt-6 rotate-12" />
          </div>
          
          <div className="relative z-10">
            <div className="flex justify-between items-end mb-4">
              <div>
                <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest mb-1 font-noto">ความคืบหน้าการส่งงาน</h3>
                <p className="text-slate-400 text-[10px] font-bold uppercase tracking-[0.2em] font-noto">Target: {displayPages.length} เพจ x 4 คลิป (รวม 40 คลิป/วัน)</p>
              </div>
              <div className="text-right">
                <span className="text-3xl font-black text-[var(--primary-theme)] font-outfit">{Math.round(progress)}%</span>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{totalLinksFilled} / {totalRequired} clips</p>
              </div>
            </div>
            
            <div className="h-4 bg-slate-100 rounded-full overflow-hidden p-1 shadow-inner">
              <div 
                className="h-full bg-[var(--primary-theme)] rounded-full transition-all duration-700 shadow-sm relative overflow-hidden"
                style={{ width: `${progress}%` }}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent animate-marquee" />
              </div>
            </div>
          </div>
        </div>

        {/* Quick Guide Card */}
        <div className="bg-slate-900 p-8 rounded-[2.5rem] text-white shadow-xl shadow-slate-200/50 relative overflow-hidden flex flex-col justify-between">
           <div className="absolute top-0 right-0 p-4 opacity-20">
              <Info className="w-16 h-16 -mr-4 -mt-4" />
           </div>
           <div className="relative z-10">
              <h3 className="text-md font-bold mb-2 flex items-center gap-2 font-noto">
                <ShieldCheck size={18} className="text-blue-400" />
                <span>เป้าหมายวันนี้</span>
              </h3>
              <p className="text-xs text-white/60 font-noto leading-relaxed mb-4">
                เป้าหมายหลักคือการรักษาระดับการส่งงานให้คงที่ เพื่อการคำนวณเงินเดือนที่แม่นยำ
              </p>
           </div>
           <div className="relative z-10 grid grid-cols-2 gap-2">
              <div className="bg-white/10 p-3 rounded-2xl border border-white/5">
                 <p className="text-[8px] font-black uppercase text-white/50 tracking-widest mb-1">Status</p>
                 <p className="text-xs font-bold text-emerald-400">ACTIVE</p>
              </div>
              <div className="bg-white/10 p-3 rounded-2xl border border-white/5">
                 <p className="text-[8px] font-black uppercase text-white/50 tracking-widest mb-1">Due</p>
                 <p className="text-xs font-bold font-inter">23:59</p>
              </div>
           </div>
        </div>
      </div>

      {/* Instructions Alert */}
      <div className="bg-blue-50/50 border border-blue-100/50 rounded-[2rem] p-6 flex items-start gap-4 transition-all hover:bg-blue-50">
        <div className="p-3 bg-white rounded-2xl shadow-sm border border-blue-100 flex-shrink-0">
          <Info className="text-[var(--primary-theme)]" size={18} />
        </div>
        <div>
           <p className="text-sm font-bold text-blue-800 font-noto">กฎระเบียบการส่งงาน</p>
           <p className="text-xs text-blue-600/80 mt-1 leading-relaxed font-noto">
             กรุณา Copy ลิงก์วิดีโอ (Reels/Shorts) ที่โพสต์แล้วมาวางในช่องหน้าเพจที่กำหนด หากส่งไม่ครบตามเป้าหมายรายวัน 
             ระบบจะถือว่าท่าน "ขาดงาน" ในวันนั้น และจะมีผลต่อการคำนวณเงินเดือนสิ้นเดือน
           </p>
        </div>
      </div>

      {/* Grid of Pages */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {displayPages.map((page, idx) => (
          <div key={page.id} className="bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-md transition-all group overflow-hidden relative">
            <div className="flex items-center justify-between mb-4 relative z-10">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-blue-50 group-hover:text-[var(--primary-theme)] transition-colors">
                  <Layout size={20} />
                </div>
                <div>
                  <h3 className="text-sm font-black text-slate-700 font-noto">{page.name}</h3>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Page #{idx + 1}</p>
                </div>
              </div>
              {submissionData[page.id].every(l => l.trim() !== '') && (
                <CheckCircle2 className="text-emerald-500" size={20} />
              )}
            </div>

            <div className="space-y-3 relative z-10">
              {submissionData[page.id].map((link, i) => (
                <div key={i} className="relative group/input">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within/input:text-[var(--primary-theme)] transition-colors">
                    <LinkIcon size={14} />
                  </div>
                  <input 
                    type="url"
                    placeholder={`Video Link #${i + 1}`}
                    value={link}
                    onChange={(e) => handleLinkChange(page.id, i, e.target.value)}
                    className="w-full bg-slate-50 border-none rounded-2xl pl-10 pr-4 py-3 text-xs focus:ring-4 focus:ring-blue-50 focus:bg-white outline-none transition-all placeholder:text-slate-300 font-medium font-inter"
                  />
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Footer Actions */}
      <div className="flex justify-end pt-4 pb-12">
        <button 
          onClick={handleSubmit}
          disabled={isSubmitting || totalLinksFilled < totalRequired}
          className={cn(
            "px-10 py-4 rounded-[2rem] font-black text-sm uppercase tracking-widest transition-all flex items-center gap-3",
            totalLinksFilled < totalRequired 
              ? "bg-slate-100 text-slate-400 cursor-not-allowed" 
              : "bg-[var(--primary-theme)] hover:bg-[var(--primary-theme-hover)] text-white shadow-xl shadow-blue-100/50 hover:-translate-y-1 active:scale-95"
          )}
        >
          {isSubmitting ? (
            <>
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              กำลังส่งงาน...
            </>
          ) : isSuccess ? (
            <>
              <CheckCircle2 size={18} />
              ส่งงานเรียบร้อยแล้ว
            </>
          ) : (
            <>
              <Send size={18} />
              ยืนยันการบันทึกงาน
            </>
          )}
        </button>
      </div>
    </div>
  );
};
