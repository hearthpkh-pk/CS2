'use client';

import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { createPortal } from 'react-dom';
import {
  Send,
  CheckCircle2,
  Link as LinkIcon,
  Video,
  Layout,
  Info,
  ShieldCheck,
  Plus,
  Trash2,
  AlertTriangle
} from 'lucide-react';
import { DailyLog, Page, User } from '@/types';
import { cn } from '@/lib/utils';
import { useCompanyConfig } from '@/features/company/hooks/useCompanyConfig';
import { dataService } from '@/services/dataService';
import { useTodayLogs } from './DailyTaskView/hooks/useTodayLogs';
import { VirtualTable } from './DailyTaskView/VirtualTable';
import { format } from 'date-fns';

interface DailyTaskViewProps {
  currentUser: User;
  pages: Page[];
  policy?: any;
}

export const DailyTaskView: React.FC<DailyTaskViewProps> = ({ currentUser, pages, policy: propPolicy }) => {
  const { getPolicyForUser, isLoading: isConfigLoading } = useCompanyConfig();

  // 🎯 Resolve dynamic policy for this user
  const policy = useMemo(() => getPolicyForUser(currentUser), [getPolicyForUser, currentUser]);

  const displayPages = useMemo(() => {
    const sortedPages = [...pages].sort((a, b) => (Number(a.boxId) || 0) - (Number(b.boxId) || 0));
    return sortedPages.slice(0, Math.max(sortedPages.length, policy.requiredPagesPerDay));
  }, [pages, policy.requiredPagesPerDay]);

  const [submissionData, setSubmissionData] = useState<Record<string, string[]>>({});
  const [currentInputs, setCurrentInputs] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [duplicateAlert, setDuplicateAlert] = useState(false);

  // Refs for synchronous checks without triggering re-renders
  const submissionDataRef = useRef(submissionData);
  const currentInputsRef = useRef(currentInputs);

  useEffect(() => {
    submissionDataRef.current = submissionData;
  }, [submissionData]);

  useEffect(() => {
    currentInputsRef.current = currentInputs;
  }, [currentInputs]);

  const { logs: myTodayLogs, isLoading: isLogsLoading, submitLogsMutation } = useTodayLogs(currentUser.id);

  // Sync logs to submissionData when logs load
  useEffect(() => {
    if (isConfigLoading || isLogsLoading) return;

    const draftKey = `cs2_draft_${currentUser.id}_${format(new Date(), 'yyyy-MM-dd')}`;
    const draftJson = localStorage.getItem(draftKey);
    let draftData: Record<string, string[]> | null = null;
    if (draftJson) {
      try { draftData = JSON.parse(draftJson); } catch (e) {}
    }

    const initial: Record<string, string[]> = {};
    displayPages.forEach(p => {
      const existingLog = myTodayLogs.find(l => l.pageId === p.id);
      const dbLinks = (existingLog?.links && Array.isArray(existingLog.links)) ? existingLog.links : [];
      const draftLinks = draftData ? draftData[p.id] || [] : [];
      
      // 🛡️ ผสานข้อมูล: ถ้าใน Draft (ที่พิมพ์ค้างไว้) มีลิงก์เยอะกว่า DB ให้เอา Draft มาใช้
      initial[p.id] = draftLinks.length > dbLinks.length ? draftLinks : dbLinks;
    });
    setSubmissionData(initial);
  }, [displayPages, isConfigLoading, isLogsLoading, myTodayLogs, currentUser.id]);

  // 💾 Auto-Save Draft: บันทึกลง LocalStorage ทุกครั้งที่พิมพ์หรือแก้ลิงก์
  useEffect(() => {
    if (Object.keys(submissionData).length > 0) {
      const draftKey = `cs2_draft_${currentUser.id}_${format(new Date(), 'yyyy-MM-dd')}`;
      localStorage.setItem(draftKey, JSON.stringify(submissionData));
    }
  }, [submissionData, currentUser.id]);

  const handleAddLink = useCallback((pageId: string) => {
    const val = (currentInputsRef.current[pageId] || '').trim();
    if (!val) return;

    const isDuplicate = Object.values(submissionDataRef.current).some(pageLinks => 
      pageLinks.some(link => link.trim().toLowerCase() === val.toLowerCase())
    );

    if (isDuplicate) {
      setDuplicateAlert(true);
      return;
    }

    setSubmissionData(prevData => {
      const existing = (prevData[pageId] || []).filter(l => l.trim() !== '');
      return { ...prevData, [pageId]: [...existing, val] };
    });

    setCurrentInputs(prevInputs => ({ ...prevInputs, [pageId]: '' }));
  }, []);

  const handleInputChange = useCallback((pageId: string, value: string) => {
    setCurrentInputs(prev => ({ ...prev, [pageId]: value }));
  }, []);

  const handleRemoveLink = useCallback((pageId: string, index: number) => {
    setSubmissionData(prev => {
      const existing = (prev[pageId] || []).filter(l => l.trim() !== '');
      return { ...prev, [pageId]: existing.filter((_, i) => i !== index) };
    });
  }, []);

  const totalLinksFilled = Object.values(submissionData).flat().filter(l => l.trim() !== '').length;
  const totalRequired = displayPages.length * policy.clipsPerPageInLog;
  const progress = totalRequired > 0 ? (totalLinksFilled / totalRequired) * 100 : 0;

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      const logs: DailyLog[] = displayPages.map(page => {
        const links = (submissionData[page.id] || []).filter(l => l.trim() !== '');
        return {
          id: '',
          pageId: page.id,
          staffId: page.ownerId || currentUser.id,
          date: format(new Date(), 'yyyy-MM-dd'),
          followers: 0,
          views: 0,
          clipsCount: links.length,
          links: links,
          source: 'Manual',
          createdAt: new Date().toISOString()
        };
      });

      await dataService.saveLogs(logs);
      await submitLogsMutation.mutateAsync({ userId: currentUser.id, date: format(new Date(), 'yyyy-MM-dd'), logs });
      
      // 🧹 เคลียร์ Draft ทิ้งเมื่อส่งงานสำเร็จ เพื่อไม่ให้รกเครื่อง
      const draftKey = `cs2_draft_${currentUser.id}_${format(new Date(), 'yyyy-MM-dd')}`;
      localStorage.removeItem(draftKey);

      setIsSuccess(true);
      setTimeout(() => setIsSuccess(false), 5000);
    } catch (error) {
      console.error('Failed to submit logs:', error);
      alert('เกิดข้อผิดพลาดในการส่งงาน กรุณาลองใหม่อีกครั้ง');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isConfigLoading || isLogsLoading) {
    return (
      <div className="py-20 text-center opacity-50">
        <div className="w-8 h-8 border-2 border-[var(--primary-theme)] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-[10px] font-bold uppercase tracking-widest">Loading Data...</p>
      </div>
    );
  }

  return (
    <div className="w-full space-y-8 animate-fade-in">
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
                <th className="p-4 pl-6 font-noto whitespace-nowrap sticky left-0 z-20 bg-slate-50/95 backdrop-blur-md shadow-[2px_0_10px_rgba(0,0,0,0.03)] border-r border-slate-100/50 w-[100px] text-center">Box ID</th>
                <th className="p-4 font-noto whitespace-nowrap w-[200px]">Page Name</th>
                <th className="p-4 font-noto whitespace-nowrap text-center w-[120px]">Status</th>
                <th className="p-0 font-noto whitespace-nowrap align-middle">
                  <div className="flex items-center justify-between pl-6 pr-4 py-2 w-full h-full">
                    <span>Clips Submission (Target: {policy.clipsPerPageInLog})</span>
                    <button
                      onClick={handleSubmit}
                      disabled={isSubmitting}
                      className={cn(
                        "h-7 px-3 rounded-lg flex items-center justify-center gap-1.5 transition-all shadow-sm shrink-0 border group",
                        isSubmitting
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
          </table>
        </div>
        <div className="w-full relative min-w-[700px] overflow-x-auto custom-scrollbar">
          <VirtualTable
            pages={displayPages}
            policy={policy}
            submissionData={submissionData}
            currentInputs={currentInputs}
            onAddLink={handleAddLink}
            onRemoveLink={handleRemoveLink}
            onInputChange={handleInputChange}
          />
        </div>
      </div>

      {/* Footer Info */}
      <div className="flex items-start gap-3 mt-4 px-2 opacity-60 hover:opacity-100 transition-opacity">
        <span className="text-slate-400 shrink-0 mt-0.5">
          <Info size={14} />
        </span>
        <p className="text-[10px] text-slate-500 leading-relaxed font-noto">
          <strong className="text-slate-700">Audit Condition:</strong> การส่งงานต้องครบเป้าหมายของกลุ่ม ({policy.requiredPagesPerDay} เพจ) ระบบจะบันทึกประวัติเพื่อประมวลผลการทำงานอัตโนมัติ
        </p>
      </div>

      {/* Duplicate Link Alert Modal */}
      {duplicateAlert && typeof document !== 'undefined' && createPortal(
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl shadow-2xl max-w-sm w-full overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-8 text-center relative overflow-hidden">
              <div className="w-20 h-20 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner">
                <AlertTriangle size={40} strokeWidth={2.5} />
              </div>
              <h3 className="text-xl font-black text-slate-900 font-noto mb-3 uppercase tracking-wider">พบลิงก์ซ้ำ!</h3>
              <p className="text-sm text-slate-600 font-noto leading-relaxed">
                การส่งลิงก์ซ้ำถือเป็นการ <strong className="text-red-500">ผิดกฎระเบียบบริษัท</strong><br/>
                หากพบพฤติกรรมผิดปกติหรือจงใจฝ่าฝืน จะถูกตรวจสอบและลงโทษตามขั้นตอน
              </p>
            </div>
            <div className="p-5 bg-slate-50 border-t border-slate-100 flex justify-center">
              <button
                onClick={() => setDuplicateAlert(false)}
                className="w-full py-3 bg-red-500 hover:bg-red-600 text-white text-sm font-bold rounded-xl transition-all shadow-md shadow-red-500/20 font-noto uppercase tracking-widest active:scale-[0.98]"
              >
                รับทราบ และจะไม่ทำซ้ำ
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
};
