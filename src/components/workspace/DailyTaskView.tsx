'use client';

import React, { useState } from 'react';
import { Send, CheckCircle2, Link as LinkIcon, Video, Layout, Info } from 'lucide-react';
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
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Header & Progress */}
      <div className="bg-white p-8 rounded-[3rem] border border-slate-100 shadow-sm relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8">
           <Video className="text-blue-50/50 w-32 h-32 -mr-10 -mt-10 rotate-12" />
        </div>
        
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-3 bg-blue-600 rounded-2xl shadow-lg shadow-blue-100">
              <Send className="text-white" size={24} />
            </div>
            <div>
              <h2 className="text-2xl font-black text-slate-800 font-outfit uppercase tracking-tight">ส่งชิ้นงานรายวัน</h2>
              <div className="flex items-center gap-2 mt-1">
                <p className="text-slate-400 text-[10px] font-bold uppercase tracking-[0.2em]">Target: 10 เพจ x 4 คลิป (รวม 40 คลิป/วัน)</p>
                <div className="w-1 h-1 rounded-full bg-slate-300" />
                <div className="flex items-center gap-1.5 px-2 py-0.5 bg-emerald-50 border border-emerald-100 rounded-full">
                   <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                   <span className="text-[9px] font-black text-emerald-600 uppercase tracking-widest">Live Session: {new Date().toLocaleDateString('th-TH', { 
                     day: 'numeric', 
                     month: 'long', 
                     year: 'numeric' 
                   })}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-8">
            <div className="flex justify-between items-end mb-2">
              <span className="text-xs font-black text-slate-600 uppercase tracking-widest">Progress: {totalLinksFilled}/{totalRequired} Clips</span>
              <span className="text-2xl font-black text-blue-600 font-outfit">{Math.round(progress)}%</span>
            </div>
            <div className="h-4 bg-slate-100 rounded-full overflow-hidden p-1">
              <div 
                className="h-full bg-blue-600 rounded-full transition-all duration-500 shadow-sm"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Instructions Alert */}
      <div className="bg-blue-50/50 border border-blue-100 rounded-[2rem] p-6 flex items-start gap-4">
        <Info className="text-blue-500 mt-1" size={20} />
        <div>
           <p className="text-sm font-bold text-blue-800">กฎระเบียบการส่งงาน</p>
           <p className="text-xs text-blue-600/80 mt-1 leading-relaxed">
             กรุณา Copy ลิงก์วิดีโอ (Reels/Shorts) ที่โพสต์แล้วมาวางในช่องหน้าเพจที่กำหนด หากส่งไม่ครบตามเป้าหมายรายวัน 
             ระบบจะถือว่าท่าน "ขาดงาน" ในวันนั้น และจะมีผลต่อการคำนวณเงินเดือนสิ้นเดือน
           </p>
        </div>
      </div>

      {/* Grid of Pages */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {displayPages.map((page, idx) => (
          <div key={page.id} className="bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-md transition-all group">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-blue-50 group-hover:text-blue-500 transition-colors">
                  <Layout size={20} />
                </div>
                <div>
                  <h3 className="text-sm font-black text-slate-700">{page.name}</h3>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Page #{idx + 1}</p>
                </div>
              </div>
              {submissionData[page.id].every(l => l.trim() !== '') && (
                <CheckCircle2 className="text-emerald-500" size={20} />
              )}
            </div>

            <div className="space-y-3">
              {submissionData[page.id].map((link, i) => (
                <div key={i} className="relative group/input">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within/input:text-blue-400 transition-colors">
                    <LinkIcon size={14} />
                  </div>
                  <input 
                    type="url"
                    placeholder={`Video Link #${i + 1}`}
                    value={link}
                    onChange={(e) => handleLinkChange(page.id, i, e.target.value)}
                    className="w-full bg-slate-50 border-none rounded-xl pl-10 pr-4 py-3 text-xs focus:ring-2 ring-blue-100 outline-none transition-all placeholder:text-slate-300 font-medium"
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
              : "bg-blue-600 text-white shadow-xl shadow-blue-100 hover:bg-blue-700 hover:-translate-y-1"
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
