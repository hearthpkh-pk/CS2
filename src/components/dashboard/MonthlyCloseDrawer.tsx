'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { createPortal } from 'react-dom';
import {
  X, Send, CheckCircle2, Clock, XCircle, FileCheck,
  ChevronRight, AlertTriangle, Loader2, Eye, Users as UsersIcon
} from 'lucide-react';
import { Page, DailyLog, User, MonthlySubmission, SubmissionStatus } from '@/types';
import { submissionService } from '@/services/submissionService';
import { cn } from '@/lib/utils';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  currentUser: User;
  targetUser: User;
  pages: Page[];
  logs: DailyLog[];
}

const STATUS_CONFIG: Record<SubmissionStatus, { label: string; color: string; icon: React.ReactNode; bgColor: string }> = {
  Draft: { label: 'แบบร่าง', color: 'text-slate-500', icon: <Clock size={14} />, bgColor: 'bg-slate-50 border-slate-200' },
  Submitted: { label: 'รอตรวจสอบ', color: 'text-amber-600', icon: <Clock size={14} className="animate-pulse" />, bgColor: 'bg-amber-50 border-amber-200' },
  Approved: { label: 'อนุมัติแล้ว', color: 'text-emerald-600', icon: <CheckCircle2 size={14} />, bgColor: 'bg-emerald-50 border-emerald-200' },
  Rejected: { label: 'ไม่อนุมัติ', color: 'text-red-500', icon: <XCircle size={14} />, bgColor: 'bg-red-50 border-red-200' },
};

export const MonthlyCloseDrawer: React.FC<Props> = ({
  isOpen, onClose, currentUser, targetUser, pages, logs
}) => {
  const [mounted, setMounted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [existingSubmission, setExistingSubmission] = useState<MonthlySubmission | null>(null);
  const [selectedPageIds, setSelectedPageIds] = useState<Set<string>>(new Set());
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Default period = current month
  const currentPeriod = useMemo(() => {
    const now = new Date();
    return `${now.getFullYear()}-${(now.getMonth() + 1).toString().padStart(2, '0')}`;
  }, []);

  const [period, setPeriod] = useState(currentPeriod);

  useEffect(() => setMounted(true), []);

  // เช็ค submission ที่มีอยู่แล้ว
  useEffect(() => {
    if (!isOpen) return;
    setError(null);
    setSuccess(false);
    setIsLoading(true);

    submissionService.getMySubmission(targetUser.id, period)
      .then(sub => {
        setExistingSubmission(sub);
        if (!sub || sub.status === 'Rejected') {
          // ถ้าไม่เคยส่งหรือถูก reject → เลือกเพจ Active ทั้งหมดเป็น default
          const activeIds = pages.filter(p => !p.isDeleted && p.ownerId === targetUser.id).map(p => p.id);
          setSelectedPageIds(new Set(activeIds));
        }
      })
      .finally(() => setIsLoading(false));
  }, [isOpen, period, targetUser.id, pages]);

  const pageSnapshots = useMemo(() => {
    return pages
      .filter(p => !p.isDeleted)
      .map(p => ({
        ...p,
        snapshot: submissionService.calculatePageSnapshot(p.id, period, logs),
      }))
      .sort((a, b) => {
        // ให้ Active ขึ้นก่อนเสมอ
        if (a.status === 'Active' && b.status !== 'Active') return -1;
        if (a.status !== 'Active' && b.status === 'Active') return 1;
        // เรียงตามตัวอักษร
        return a.name.localeCompare(b.name, 'th');
      });
  }, [pages, period, logs]);

  // ยอดรวมเพจที่เลือก
  const totals = useMemo(() => {
    return pageSnapshots
      .filter(p => selectedPageIds.has(p.id))
      .reduce((acc, p) => ({
        views: acc.views + p.snapshot.views,
      }), { views: 0 });
  }, [pageSnapshots, selectedPageIds]);

  const togglePage = (pageId: string) => {
    setSelectedPageIds(prev => {
      const next = new Set(prev);
      if (next.has(pageId)) next.delete(pageId);
      else next.add(pageId);
      return next;
    });
  };

  const handleSubmit = async () => {
    if (selectedPageIds.size === 0) {
      setError('กรุณาเลือกอย่างน้อย 1 เพจ');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    const selectedPages = pages.filter(p => selectedPageIds.has(p.id));
    const isSubmittingOnBehalf = currentUser.id !== targetUser.id;

    const result = await submissionService.createSubmission(
      targetUser.id,
      period,
      selectedPages,
      logs,
      isSubmittingOnBehalf ? currentUser.name : undefined
    );

    if (result.success) {
      setSuccess(true);
      setExistingSubmission(result.data || null);
    } else {
      setError(result.error || 'เกิดข้อผิดพลาด');
    }

    setIsSubmitting(false);
  };

  const canSubmit = !existingSubmission || existingSubmission.status === 'Rejected';
  const isLocked = existingSubmission?.status === 'Submitted' || existingSubmission?.status === 'Approved';

  if (!mounted || !isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 z-[200] flex items-end md:items-center justify-center bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-300">
      <div className="bg-white rounded-t-[2.5rem] md:rounded-[2.5rem] w-full max-w-lg max-h-[85vh] shadow-2xl border border-slate-100 overflow-hidden animate-in slide-in-from-bottom-4 duration-300 flex flex-col">
        
        {/* Header */}
        <div className="p-6 border-b border-slate-100 flex justify-between items-start flex-shrink-0">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <FileCheck size={18} className="text-[var(--primary-blue)]" />
              <h3 className="text-lg font-bold text-slate-800 font-outfit uppercase tracking-tight">
                ส่งเช็คยอดประจำเดือน
              </h3>
            </div>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">
              Monthly Submission • {period}
            </p>
            {currentUser.id !== targetUser.id && (
              <p className="mt-1 text-xs font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded border border-amber-200 inline-block">
                กำลังส่งยอดแทน: {targetUser.name}
              </p>
            )}
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-50 rounded-xl text-slate-400 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Period Selector */}
        <div className="px-6 pt-4 flex-shrink-0">
          <div className="flex items-center gap-2 bg-slate-50 p-1 rounded-xl border border-slate-100">
            <select
              value={period}
              onChange={e => setPeriod(e.target.value)}
              disabled={isLocked}
              className="flex-1 bg-transparent border-none text-sm font-bold text-slate-700 outline-none cursor-pointer font-prompt px-3 py-2"
            >
              {Array.from({ length: 6 }).map((_, i) => {
                const d = new Date();
                d.setMonth(d.getMonth() - i);
                const val = `${d.getFullYear()}-${(d.getMonth() + 1).toString().padStart(2, '0')}`;
                const label = d.toLocaleDateString('th-TH', { month: 'long', year: 'numeric' });
                return <option key={val} value={val}>{label}</option>;
              })}
            </select>
          </div>
        </div>

        {/* Loading */}
        {isLoading ? (
          <div className="flex-1 flex items-center justify-center py-12">
            <Loader2 size={24} className="animate-spin text-slate-300" />
          </div>
        ) : (
          <>
            {/* Existing Submission Status */}
            {existingSubmission && (
              <div className={cn(
                "mx-6 mt-4 p-4 rounded-2xl border flex items-center gap-3",
                STATUS_CONFIG[existingSubmission.status].bgColor
              )}>
                <div className={STATUS_CONFIG[existingSubmission.status].color}>
                  {STATUS_CONFIG[existingSubmission.status].icon}
                </div>
                <div className="flex-1">
                  <p className={cn("text-sm font-bold", STATUS_CONFIG[existingSubmission.status].color)}>
                    {STATUS_CONFIG[existingSubmission.status].label}
                  </p>
                  {existingSubmission.submittedAt && (
                    <p className="text-[10px] text-slate-400 mt-0.5">
                      ส่งเมื่อ {new Date(existingSubmission.submittedAt).toLocaleString('th-TH')}
                    </p>
                  )}
                  {existingSubmission.status === 'Rejected' && existingSubmission.reviewNote && (
                    <p className="text-[11px] text-red-600 mt-1 font-medium">
                      หมายเหตุ: {existingSubmission.reviewNote}
                    </p>
                  )}
                  {existingSubmission.status === 'Approved' && (
                    <div className="mt-1 flex items-center gap-2">
                      <span className="text-[10px] text-emerald-600 font-bold">
                        ค่าคอม: ฿{(existingSubmission.adjustedCommission ?? existingSubmission.calculatedCommission ?? 0).toLocaleString()}
                      </span>
                      {existingSubmission.commissionNote && (
                        <span className="text-[9px] text-slate-400">({existingSubmission.commissionNote})</span>
                      )}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Success Message */}
            {success && (
              <div className="mx-6 mt-4 p-4 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center gap-3">
                <CheckCircle2 size={18} className="text-emerald-500" />
                <p className="text-sm font-bold text-emerald-700">ส่งเช็คยอดสำเร็จ! รอ Admin ตรวจสอบ</p>
              </div>
            )}

            {/* Error */}
            {error && (
              <div className="mx-6 mt-4 p-4 rounded-2xl bg-red-50 border border-red-100 flex items-center gap-3">
                <AlertTriangle size={16} className="text-red-500" />
                <p className="text-sm font-medium text-red-700">{error}</p>
              </div>
            )}

            {/* Page List */}
            <div className="flex-1 overflow-y-auto px-6 py-4 custom-scrollbar">
              <p className="text-[9px] font-bold text-slate-400 uppercase tracking-[0.2em] mb-3">
                เลือกเพจที่ต้องการส่ง ({selectedPageIds.size}/{pageSnapshots.length})
              </p>

              <div className="space-y-2">
                {pageSnapshots.map(p => {
                  const isSelected = selectedPageIds.has(p.id);
                  const hasData = p.snapshot.views > 0;
                  const existingPage = existingSubmission?.pages?.find(ep => ep.pageId === p.id);
                  const isPageRejected = existingPage?.reviewStatus === 'Rejected';

                  return (
                    <button
                      key={p.id}
                      onClick={() => !isLocked && togglePage(p.id)}
                      disabled={isLocked}
                      className={cn(
                        "w-full flex items-center gap-3 p-3 rounded-2xl border transition-all text-left",
                        isLocked ? "cursor-default" :
                        isSelected
                          ? "bg-blue-50/80 border-blue-200 hover:bg-blue-100/80"
                          : "bg-white border-slate-100 hover:bg-slate-50/50",
                        !hasData && !isSelected && "opacity-50"
                      )}
                    >
                      {/* Checkbox */}
                      <div className={cn(
                        "w-5 h-5 rounded-lg flex items-center justify-center flex-shrink-0 border-2 transition-all",
                        isSelected
                          ? "bg-[var(--primary-blue)] border-[var(--primary-blue)]"
                          : "border-slate-200"
                      )}>
                        {isSelected && <CheckCircle2 size={12} className="text-white" />}
                      </div>

                      {/* Page Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-bold text-slate-700 truncate">{p.name}</span>
                          <span className={cn(
                            "inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[8px] font-bold uppercase tracking-widest border",
                            p.status === 'Active'
                              ? 'bg-emerald-50 text-emerald-500 border-emerald-100'
                              : p.status === 'Rest'
                                ? 'bg-amber-50 text-amber-500 border-amber-100'
                                : 'bg-red-50 text-red-400 border-red-100'
                          )}>
                            {p.status}
                          </span>
                        </div>
                        <div className="flex items-center gap-3 mt-0.5">
                          <span className="text-[10px] text-slate-400 flex items-center gap-1">
                            <Eye size={10} /> {p.snapshot.views.toLocaleString()}
                          </span>
                        </div>
                        {isPageRejected && existingPage?.reviewNote && (
                          <div className="mt-2 text-[10px] text-red-600 bg-red-50 p-2 rounded-lg border border-red-100 font-medium">
                            <span className="font-bold">❌ สาเหตุที่ตีกลับ:</span> {existingPage.reviewNote}
                          </div>
                        )}
                      </div>

                      <ChevronRight size={14} className="text-slate-200 flex-shrink-0" />
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Footer — Summary + Submit */}
            <div className="flex-shrink-0 border-t border-slate-100 p-6 bg-slate-50/30">
              {/* Totals */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-4">
                  <div>
                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">ยอดวิวรวม</p>
                    <p className="text-lg font-black text-[var(--primary-blue)] font-outfit">{totals.views.toLocaleString()}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">เพจที่เลือก</p>
                  <p className="text-lg font-black text-[var(--primary-blue)] font-outfit">{selectedPageIds.size}</p>
                </div>
              </div>

              {/* Submit Button */}
              {canSubmit && !success ? (
                <button
                  onClick={handleSubmit}
                  disabled={isSubmitting || selectedPageIds.size === 0}
                  className={cn(
                    "w-full py-4 rounded-2xl font-bold font-noto text-sm flex items-center justify-center gap-2 transition-all active:scale-[0.98]",
                    selectedPageIds.size > 0
                      ? "bg-[var(--primary-theme)] hover:bg-[var(--primary-theme-hover)] text-white shadow-xl shadow-blue-100/50 hover:-translate-y-0.5"
                      : "bg-slate-100 text-slate-300 cursor-not-allowed"
                  )}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 size={16} className="animate-spin" />
                      กำลังส่ง...
                    </>
                  ) : (
                    <>
                      <Send size={16} />
                      ยืนยันส่งเช็คยอด
                    </>
                  )}
                </button>
              ) : (
                <button
                  onClick={onClose}
                  className="w-full py-4 rounded-2xl font-bold font-noto text-sm bg-slate-100 text-slate-500 hover:bg-slate-200 transition-all"
                >
                  ปิด
                </button>
              )}
            </div>
          </>
        )}
      </div>
    </div>,
    document.body
  );
};
