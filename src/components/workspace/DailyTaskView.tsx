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
  const [currentInputs, setCurrentInputs] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  // Initialize and load today's submission data when policy or pages load (Targeted Load)
  useEffect(() => {
    if (isConfigLoading) return;

    const loadTodayData = async () => {
      try {
        const todayStr = format(new Date(), 'yyyy-MM-dd');
        // Targeted Query: Fetch ONLY this user's logs for today
        const myTodayLogs = await dataService.getTodayLogsForUser(currentUser.id, todayStr);

        const initial: Record<string, string[]> = {};
        displayPages.forEach(p => {
          const existingLog = myTodayLogs.find(l => l.pageId === p.id);
          initial[p.id] = (existingLog?.links && Array.isArray(existingLog.links)) ? existingLog.links : [];
        });
        
        setSubmissionData(initial);
      } catch (error) {
        console.error("Failed to fetch today's logs (Optimized Query):", error);
        // Fallback to empty setup
        const initial: Record<string, string[]> = {};
        displayPages.forEach(p => initial[p.id] = []);
        setSubmissionData(initial);
      }
    };

    loadTodayData();
  }, [displayPages, isConfigLoading, currentUser.id]);

  const handleAddLink = (pageId: string) => {
    const val = (currentInputs[pageId] || '').trim();
    if (!val) return;

    // Prevent duplicate links across all pages
    const isDuplicate = Object.values(submissionData).some(pageLinks => 
      pageLinks.some(link => link.trim().toLowerCase() === val.toLowerCase())
    );

    if (isDuplicate) {
      alert("⚠️ ข้อผิดพลาด: ลิงก์นี้ถูกกรอกไปแล้วในตารางของคุณ โปรดใช้ลิงก์อื่น");
      return;
    }

    setSubmissionData(prev => {
      const existing = (prev[pageId] || []).filter(l => l.trim() !== '');
      return { ...prev, [pageId]: [...existing, val] };
    });
    setCurrentInputs(prev => ({ ...prev, [pageId]: '' }));
  };

  const handleRemoveLink = (pageId: string, index: number) => {
    setSubmissionData(prev => {
      const existing = (prev[pageId] || []).filter(l => l.trim() !== '');
      return { ...prev, [pageId]: existing.filter((_, i) => i !== index) };
    });
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
    <div className="w-full max-w-[1600px] mx-auto px-4 md:px-8 pb-10 space-y-8">
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

        <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-md shrink-0">
          <div className="w-1.5 h-1.5 rounded-full bg-slate-400" />
          <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest font-noto">
            {format(new Date(), 'dd MMM yyyy')}
          </span>
        </div>
      </div>

      {/* Target & Progress Monitoring */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 bg-white p-6 md:p-8 rounded-[2rem] border border-slate-200 shadow-sm relative flex flex-col justify-center">
          <div className="relative z-10 w-full">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end mb-4 gap-4">
              <div>
                <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest mb-1 font-noto">Workload Progress</h3>
                <p className="text-slate-500 text-[10px] font-bold uppercase tracking-[0.2em] font-noto">
                  Target: {policy.requiredPagesPerDay} Pages x {policy.clipsPerPageInLog} Clips
                </p>
              </div>
              <div className="text-right w-full sm:w-auto">
                <span className="text-4xl font-black text-[var(--primary-theme)] font-outfit">{Math.round(progress)}%</span>
                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{totalLinksFilled} / {totalRequired} clips</p>
              </div>
            </div>

            <div className="h-3 bg-slate-100 rounded-full overflow-hidden shadow-inner relative">
              <div
                className="h-full bg-[var(--primary-theme)] rounded-full transition-all duration-700 relative shadow-[0_0_12px_rgba(37,99,235,0.3)]"
                style={{ width: `${Math.min(progress, 100)}%` }}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent animate-marquee" />
              </div>
            </div>
          </div>
        </div>

        <div className="bg-[#0f172a] p-6 md:p-8 rounded-[2rem] shadow-xl shadow-slate-900/10 flex flex-col justify-between text-white">
          <div>
            <h3 className="text-sm font-black text-white uppercase tracking-widest mb-2 font-noto flex items-center gap-2">
              <ShieldCheck size={16} className="text-slate-400" /> Group Target
            </h3>
            <p className="text-[11px] text-slate-400 font-noto leading-relaxed mt-4">
              เป้าหมายกลุ่ม <strong className="text-white uppercase">{currentUser.department || 'General'}</strong><br/>
              บังคับส่ง <strong className="text-white">{policy.clipsPerPageInLog} ลิงก์/เพจ</strong>
            </p>
          </div>
          <div className="mt-6 flex items-center justify-between gap-4 border-t border-slate-800/80 pt-5">
            <div className="flex flex-col">
              <p className="text-[8px] font-black uppercase text-slate-500 tracking-widest mb-0.5">Status</p>
              <p className="text-[10px] font-bold text-slate-300 uppercase tracking-wider">Audit Queue</p>
            </div>
            
            <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.6)]" />
          </div>
        </div>
      </div>

      {/* Inputs Matrix (Excel-like Horizontal Layout) */}
      <div className="bg-white rounded-[2rem] border border-slate-100 shadow-sm overflow-hidden relative">
        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full text-left border-collapse min-w-[700px] relative">
            <thead>
              <tr className="border-b border-slate-100 text-[10px] font-bold text-slate-400 uppercase tracking-widest bg-slate-50/80">
                <th className="p-4 pl-6 font-noto whitespace-nowrap sticky left-0 z-20 bg-slate-50/95 backdrop-blur-md shadow-[2px_0_10px_rgba(0,0,0,0.03)] border-r border-slate-100/50 w-[200px]">Page Name</th>
                <th className="p-4 font-noto whitespace-nowrap text-center">Box ID</th>
                <th className="p-4 font-noto whitespace-nowrap text-center">Status</th>
                <th className="p-0 font-noto whitespace-nowrap align-middle">
                  <div className="flex items-center justify-between pl-6 pr-4 py-2 w-full h-full">
                    <span>Clips Submission (Target: {policy.clipsPerPageInLog})</span>
                    <button
                      onClick={handleSubmit}
                      disabled={isSubmitting || totalLinksFilled < totalRequired}
                      title="Validate & Submit Work"
                      className={cn(
                        "h-7 px-3 rounded-lg flex items-center justify-center gap-1.5 transition-all shadow-sm shrink-0 border group",
                        totalLinksFilled < totalRequired
                          ? "bg-slate-200/50 border-slate-200 text-slate-400 cursor-not-allowed"
                          : "bg-[var(--primary-theme)] hover:bg-[var(--primary-theme-hover)] text-white border-transparent shadow-md shadow-[var(--primary-theme)]/30"
                      )}
                    >
                      {isSubmitting ? (
                        <>
                          <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                          <span className="text-[10px] font-bold text-white uppercase tracking-widest font-noto">กำลังบันทึก</span>
                        </>
                      ) : isSuccess ? (
                        <>
                          <CheckCircle2 size={12} className="text-white" />
                          <span className="text-[10px] font-bold text-white uppercase tracking-widest font-noto">สำเร็จ</span>
                        </>
                      ) : (
                        <>
                          <Send size={12} className="text-white group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                          <span className="text-[10px] font-bold text-white uppercase tracking-widest font-noto">ส่งงาน</span>
                        </>
                      )}
                    </button>
                  </div>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {displayPages.map((page, idx) => (
                <tr key={page.id} className="group hover:bg-blue-50/30 transition-colors">
                  <td className="p-4 pl-6 sticky left-0 z-10 bg-white group-hover:bg-blue-50/50 transition-colors shadow-[2px_0_10px_rgba(0,0,0,0.02)] border-r border-slate-50">
                    <div className="flex items-center gap-4">
                      <div className="w-9 h-9 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center text-blue-500 shadow-sm shrink-0">
                        <Layout size={14} />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-slate-900 font-noto truncate max-w-[150px] xl:max-w-[180px]" title={page.name}>{page.name}</p>
                        <p className="text-[9px] text-slate-400 font-medium uppercase tracking-widest mt-0.5">Asset #{idx + 1}</p>
                      </div>
                    </div>
                  </td>
                  <td className="p-4 text-center align-middle whitespace-nowrap">
                    <span className="px-3 py-1.5 bg-slate-100 border border-slate-200 rounded-lg text-[10px] font-bold text-slate-600 uppercase tracking-widest shadow-sm inline-block whitespace-nowrap min-w-[74px]">
                      Box {page.boxId || '-'}
                    </span>
                  </td>
                  <td className="p-4 align-middle whitespace-nowrap">
                    <div className="flex items-center justify-center gap-2">
                      {(submissionData[page.id] || []).filter(l => l.trim() !== '').length >= policy.clipsPerPageInLog ? (
                        <CheckCircle2 className="text-emerald-500" size={16} strokeWidth={2.5} />
                      ) : (
                        <div className="w-4 h-4 rounded-full border-2 border-slate-200" />
                      )}
                      <p className="text-[10px] font-bold text-slate-400 whitespace-nowrap tabular-nums">
                        {(submissionData[page.id] || []).filter(l => l.trim() !== '').length} / {policy.clipsPerPageInLog}
                      </p>
                    </div>
                  </td>
                  <td className="p-4 pl-6 w-full max-w-[200px] md:max-w-[300px] xl:max-w-none">
                    <div className="flex flex-nowrap gap-3 items-center w-full overflow-x-auto custom-scrollbar pb-3 pt-1">
                      {/* Left: Input Box */}
                      <div className="flex bg-slate-50 border border-slate-200 rounded-xl overflow-hidden focus-within:ring-4 ring-blue-50 focus-within:border-blue-300 transition-all shadow-sm w-[260px] xl:w-[320px] shrink-0">
                        <div className="pl-3.5 flex items-center text-slate-400 border-r border-slate-200/60 pr-2.5 mr-1 bg-white">
                          <LinkIcon size={14} strokeWidth={2.5} />
                        </div>
                        <input
                          type="url"
                          placeholder="Paste Clip URL & Tap Add ➔"
                          value={currentInputs[page.id] || ''}
                          onChange={(e) => setCurrentInputs(prev => ({ ...prev, [page.id]: e.target.value }))}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                              handleAddLink(page.id);
                            }
                          }}
                          className="flex-1 bg-transparent px-3 py-2.5 text-[11px] outline-none placeholder:text-slate-400 font-medium text-slate-800 min-w-0"
                        />
                        <button
                          onClick={() => handleAddLink(page.id)}
                          className="px-4 xl:px-5 text-[10px] font-bold text-white bg-[var(--primary-theme)] hover:bg-[var(--primary-theme-hover)] transition-colors uppercase tracking-widest shrink-0"
                        >
                          Add
                        </button>
                      </div>

                      {/* Right: Saved Links Chips (Compact & Scrollable) */}
                      {(submissionData[page.id] || []).filter(l => l.trim() !== '').map((link, i) => (
                        <div key={i} className="flex items-center gap-1.5 bg-blue-50/50 border border-blue-100 rounded-lg pl-2.5 pr-1 py-1.5 shrink-0 group/pill shadow-sm hover:shadow-md transition-all" title={link}>
                          <LinkIcon size={10} strokeWidth={3} className="text-blue-500 shrink-0" />
                          <span className="text-[10px] text-blue-700 font-black tracking-wider uppercase">
                            Clip {i + 1}
                          </span>
                          <button
                            onClick={() => handleRemoveLink(page.id, i)}
                            className="p-1 px-1.5 text-blue-400 hover:text-white hover:bg-rose-500 rounded-md transition-colors shrink-0 ml-0.5"
                          >
                            <Trash2 size={12} strokeWidth={2.5} />
                          </button>
                        </div>
                      ))}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Footer Info */}
      <div className="flex items-start gap-3 mt-4 px-2 opacity-60 hover:opacity-100 transition-opacity">
        <Info className="text-slate-400 shrink-0 mt-0.5" size={14} />
        <p className="text-[10px] text-slate-500 leading-relaxed font-noto">
          <strong className="text-slate-700">Audit Condition:</strong> การส่งงานต้องครบเป้าหมายของกลุ่ม ({policy.requiredPagesPerDay} เพจ) ระบบจะบันทึกประวัติเพื่อประมวลผลการทำงานอัตโนมัติ
        </p>
      </div>
    </div>
  );
};
