'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { 
  Send, 
  CheckCircle2, 
  Link as LinkIcon, 
  Video, 
  Layout, 
  Info, 
  ShieldCheck,
  Plus,
  Trash2
} from 'lucide-react';
import { DailyLog, Page, User } from '@/types';
import { cn } from '@/lib/utils';
import { useCompanyConfig } from '@/features/company/hooks/useCompanyConfig';
import { dataService } from '@/services/dataService';
import { format } from 'date-fns';

interface DailyTaskViewProps {
  currentUser: User;
  pages: Page[]; 
}

export const DailyTaskView: React.FC<DailyTaskViewProps> = ({ currentUser, pages }) => {
  const { getPolicyForUser, isLoading: isConfigLoading } = useCompanyConfig();
  
  // 🎯 Resolve dynamic policy for this user
  const policy = useMemo(() => getPolicyForUser(currentUser), [getPolicyForUser, currentUser]);
  
  // Determine how many pages this user SHOULD be working on based on their group
  const displayPages = useMemo(() => {
    // If user has specifically assigned pages, use them (but limit to required count if needed, or allow all)
    // The user said "รายการ 10 เพจ, ข่าว 5 เพจ" -> This suggests we should show exactly that many inputs
    // or at least cap/default to that.
    return pages.slice(0, Math.max(pages.length, policy.requiredPagesPerDay));
  }, [pages, policy.requiredPagesPerDay]);

  const [submissionData, setSubmissionData] = useState<Record<string, string[]>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  // Initialize submission data when policy or pages load
  useEffect(() => {
    if (isConfigLoading) return;
    
    const initial: Record<string, string[]> = {};
    displayPages.forEach(p => {
      // Create empty slots based on group policy (e.g. 4 slots for Shows, 8 for News)
      initial[p.id] = Array(policy.clipsPerPageInLog).fill('');
    });
    setSubmissionData(initial);
  }, [displayPages, policy.clipsPerPageInLog, isConfigLoading]);

  const handleLinkChange = (pageId: string, index: number, value: string) => {
    setSubmissionData(prev => ({
      ...prev,
      [pageId]: prev[pageId].map((link, i) => i === index ? value : link)
    }));
  };

  const addLinkSlot = (pageId: string) => {
    setSubmissionData(prev => ({
      ...prev,
      [pageId]: [...(prev[pageId] || []), '']
    }));
  };

  const removeLinkSlot = (pageId: string, index: number) => {
    setSubmissionData(prev => ({
      ...prev,
      [pageId]: prev[pageId].filter((_, i) => i !== index)
    }));
  };

  const totalLinksFilled = Object.values(submissionData).flat().filter(l => l.trim() !== '').length;
  const totalRequired = displayPages.length * policy.clipsPerPageInLog;
  const progress = totalRequired > 0 ? (totalLinksFilled / totalRequired) * 100 : 0;

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      const logs: DailyLog[] = displayPages.map(page => {
        const links = (submissionData[page.id] || []).filter(l => l.trim() !== '');
        return {
          id: '', // Will be assigned by DB
          pageId: page.id,
          staffId: currentUser.id,
          date: format(new Date(), 'yyyy-MM-dd'),
          followers: 0, // Staff only submits links, views/followers might be synced later or entered elsewhere
          views: 0,
          clipsCount: links.length,
          links: links,
          source: 'Manual',
          createdAt: new Date().toISOString()
        };
      });

      await dataService.saveLogs(logs);
      setIsSuccess(true);
      setTimeout(() => setIsSuccess(false), 5000);
    } catch (error) {
      console.error('Failed to submit logs:', error);
      alert('เกิดข้อผิดพลาดในการส่งงาน กรุณาลองใหม่อีกครั้ง');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isConfigLoading) {
    return (
      <div className="py-20 text-center opacity-50">
        <div className="w-8 h-8 border-2 border-[var(--primary-theme)] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-[10px] font-bold uppercase tracking-widest">Loading Policy Matrix...</p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-[1600px] mx-auto px-4 md:px-8 pb-10 animate-in fade-in slide-in-from-bottom-4 duration-700 space-y-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-slate-200 pt-4 pb-6 mb-6 gap-4">
        <div className="flex flex-col gap-1">
          <h2 className="text-2xl font-bold text-[#0f172a] font-outfit uppercase tracking-tight leading-none">
            DAILY SUBMISSION
          </h2>
          <p className="text-slate-400 font-noto text-[11px] mt-1.5 flex items-center gap-2">
            บันทึกการส่งงานตามกลุ่ม <span className="px-2 py-0.5 bg-slate-100 rounded text-slate-600 font-bold uppercase">{currentUser.department || 'General'}</span>
          </p>
        </div>

        <div className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 border border-emerald-100 rounded-full shrink-0">
          <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest font-noto">
            Session: {format(new Date(), 'dd MMMM yyyy')}
          </span>
        </div>
      </div>

      {/* Target & Progress Monitoring */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 bg-white p-6 md:p-8 rounded-[2.5rem] border border-slate-100 shadow-sm relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:scale-110 transition-transform duration-500">
            <Video className="text-blue-500 w-24 h-24 -mr-6 -mt-6 rotate-12" />
          </div>
          
          <div className="relative z-10">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end mb-4 gap-4">
              <div>
                <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest mb-1 font-noto">Workload Progress</h3>
                <p className="text-slate-400 text-[10px] font-bold uppercase tracking-[0.2em] font-noto">
                  Target: {policy.requiredPagesPerDay} Pages x {policy.clipsPerPageInLog} Clips
                </p>
              </div>
              <div className="text-right w-full sm:w-auto">
                <span className="text-3xl font-black text-[var(--primary-theme)] font-outfit">{Math.round(progress)}%</span>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{totalLinksFilled} / {totalRequired} required clips</p>
              </div>
            </div>
            
            <div className="h-4 bg-slate-100 rounded-full overflow-hidden p-1 shadow-inner relative">
              <div 
                className="h-full bg-[var(--primary-theme)] rounded-full transition-all duration-700 shadow-sm relative overflow-hidden"
                style={{ width: `${Math.min(progress, 100)}%` }}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent animate-marquee" />
              </div>
            </div>
          </div>
        </div>

        <div className="bg-slate-900 p-8 rounded-[2.5rem] text-white shadow-xl shadow-slate-200/50 relative overflow-hidden flex flex-col justify-between min-h-[200px]">
           <div className="absolute top-0 right-0 p-4 opacity-20">
              <ShieldCheck className="w-16 h-16 -mr-4 -mt-4 text-blue-400" />
           </div>
           <div className="relative z-10">
              <h3 className="text-md font-bold mb-2 flex items-center gap-2 font-noto">
                <span>Group Target</span>
              </h3>
              <p className="text-[11px] text-white/50 font-noto leading-relaxed">
                กลุ่มของคุณ ({currentUser.department}) ถูกกำหนดเงื่อนไขให้ส่งงานขั้นต่ำ {policy.clipsPerPageInLog} คลิปต่อเพจ
              </p>
           </div>
           <div className="relative z-10 flex gap-2 mt-4">
              <div className="bg-white/10 px-4 py-2 rounded-xl border border-white/5 flex-1">
                 <p className="text-[8px] font-black uppercase text-white/50 tracking-widest mb-1">Clips/Page</p>
                 <p className="text-xs font-bold text-blue-400">{policy.clipsPerPageInLog}</p>
              </div>
              <div className="bg-white/10 px-4 py-2 rounded-xl border border-white/5 flex-1">
                 <p className="text-[8px] font-black uppercase text-white/50 tracking-widest mb-1">Status</p>
                 <p className="text-xs font-bold text-emerald-400 uppercase">Live</p>
              </div>
           </div>
        </div>
      </div>

      {/* Inputs Matrix */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {displayPages.map((page, idx) => (
          <div key={page.id} className="bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-md transition-all group overflow-hidden relative">
            <div className="flex items-center justify-between mb-6 relative z-10">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-blue-600 group-hover:text-white transition-all shadow-sm">
                  <Layout size={18} />
                </div>
                <div>
                  <h3 className="text-sm font-black text-slate-900 font-noto truncate max-w-[150px]">{page.name}</h3>
                  <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest">Asset Matrix #{idx + 1}</p>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                 <p className="text-[10px] font-bold text-slate-400">
                    {(submissionData[page.id] || []).filter(l => l.trim() !== '').length} / {policy.clipsPerPageInLog}
                 </p>
                 {(submissionData[page.id] || []).filter(l => l.trim() !== '').length >= policy.clipsPerPageInLog ? (
                    <CheckCircle2 className="text-emerald-500" size={18} />
                 ) : (
                    <div className="w-4 h-4 rounded-full border-2 border-slate-100" />
                 )}
              </div>
            </div>

            <div className="space-y-2 relative z-10">
              {(submissionData[page.id] || []).map((link, i) => (
                <div key={i} className="flex gap-2 group/input">
                  <div className="relative flex-1">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within/input:text-blue-500 transition-colors">
                      <LinkIcon size={12} />
                    </div>
                    <input 
                      type="url"
                      placeholder={`Clip URL ${i + 1}`}
                      value={link}
                      onChange={(e) => handleLinkChange(page.id, i, e.target.value)}
                      className="w-full bg-slate-50 border border-transparent rounded-xl pl-10 pr-4 py-2.5 text-[11px] focus:ring-4 focus:ring-blue-50 focus:bg-white focus:border-blue-100 outline-none transition-all placeholder:text-slate-300 font-medium text-slate-900"
                    />
                  </div>
                  {i >= policy.clipsPerPageInLog && (
                    <button 
                      onClick={() => removeLinkSlot(page.id, i)}
                      className="p-2.5 text-slate-300 hover:text-rose-500 transition-all rounded-xl hover:bg-rose-50"
                    >
                      <Trash2 size={14} />
                    </button>
                  )}
                </div>
              ))}
              
              <button 
                onClick={() => addLinkSlot(page.id)}
                className="w-full py-2.5 rounded-xl border border-dashed border-slate-100 text-[10px] font-bold text-slate-400 uppercase tracking-widest hover:border-slate-200 hover:text-slate-600 transition-all flex items-center justify-center gap-2 group/add"
              >
                <Plus size={12} className="group-hover/add:rotate-90 transition-transform" />
                Add Extra Clip
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Footer Submission */}
      <div className="flex flex-col sm:flex-row justify-between items-center bg-slate-50 border border-slate-100 rounded-[2.5rem] p-6 md:p-8 gap-6">
        <div className="flex items-start gap-4">
           <div className="p-3 bg-white rounded-2xl shadow-sm border border-slate-100 shrink-0">
             <Info className="text-blue-500" size={18} />
           </div>
           <div>
              <p className="text-xs font-bold text-slate-800 font-noto">Audit Condition</p>
              <p className="text-[10px] text-slate-500 mt-1 leading-relaxed max-w-sm">
                การส่งงานต้องครบตามเป้าหมายของกลุ่ม ({policy.requiredPagesPerDay} แผ่น) จึงจะกดบันทึกได้ ระบบเก็บประวัติเพื่อใช้ประมวลผล Audit และคำนวณเงินเดือนสิ้นเดือนแบบอัตโนมัติ
              </p>
           </div>
        </div>

        <button 
          onClick={handleSubmit}
          disabled={isSubmitting || totalLinksFilled < totalRequired}
          className={cn(
            "px-10 py-5 rounded-[2rem] font-bold text-[11px] uppercase tracking-[0.2em] transition-all flex items-center gap-3 shrink-0 shadow-lg",
            totalLinksFilled < totalRequired 
              ? "bg-white border border-slate-200 text-slate-400 cursor-not-allowed opacity-60" 
              : "bg-slate-900 hover:bg-black text-white shadow-slate-200"
          )}
        >
          {isSubmitting ? (
            <>
              <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Processing Matrix...
            </>
          ) : isSuccess ? (
            <>
              <CheckCircle2 size={16} className="text-emerald-400" />
              Submission Recorded
            </>
          ) : (
            <>
              <Send size={16} />
              Validate & Submit Work
            </>
          )}
        </button>
      </div>
    </div>
  );
};
