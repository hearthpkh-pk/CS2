'use client';

import React, { useState, useEffect } from 'react';
import { 
  CheckCircle2, XCircle, Clock, Search, Filter, 
  ChevronDown, ChevronUp, Eye, Users, AlertTriangle, FileCheck, ExternalLink, CornerDownRight, Save
} from 'lucide-react';
import { MonthlySubmission, SubmissionStatus } from '@/types';
import { submissionService } from '@/services/submissionService';
import { cn } from '@/lib/utils';

interface Props {
  period: string; // YYYY-MM
  currentUser: { id: string };
  onSubmissionsChanged?: () => void; // Trigger refresh of payroll data if needed
}

export const SubmissionReviewQueue: React.FC<Props> = ({ period, currentUser, onSubmissionsChanged }) => {
  const [submissions, setSubmissions] = useState<MonthlySubmission[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  
  // Review Actions State
  const [reviewNote, setReviewNote] = useState('');
  const [adjustedCommission, setAdjustedCommission] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState<string | null>(null); // submission.id
  
  // Page-level Review State
  const [editingPageId, setEditingPageId] = useState<string | null>(null);
  const [pageNotes, setPageNotes] = useState<Record<string, string>>({});
  const [isSavingPage, setIsSavingPage] = useState<string | null>(null);
  
  // Filter
  const [statusFilter, setStatusFilter] = useState<SubmissionStatus | 'All'>('All');

  const fetchSubmissions = async () => {
    setIsLoading(true);
    const data = await submissionService.getAllSubmissions(period);
    setSubmissions(data);
    setIsLoading(false);
  };

  useEffect(() => {
    fetchSubmissions();
  }, [period]);

  const handleApprove = async (sub: MonthlySubmission) => {
    setIsProcessing(sub.id);
    
    // In a real scenario, this calculatedCommission would come from the policy rules
    // For now, we'll leave it as 0 or the pre-calculated one if it existed,
    // and let the Admin override it via adjustedCommission if they want.
    const finalCommission = adjustedCommission 
      ? parseInt(adjustedCommission, 10) 
      : (sub.calculatedCommission || 0);

    const res = await submissionService.approveSubmission(
      sub.id, 
      currentUser.id, 
      sub.calculatedCommission || 0, // original calc
      adjustedCommission ? finalCommission : undefined,
      reviewNote
    );

    if (res.success) {
      await fetchSubmissions();
      setExpandedId(null);
      setReviewNote('');
      setAdjustedCommission('');
      if (onSubmissionsChanged) onSubmissionsChanged();
    } else {
      alert(`Error: ${res.error}`);
    }
    setIsProcessing(null);
  };

  const handleReject = async (sub: MonthlySubmission) => {
    if (!reviewNote) {
      alert('กรุณาระบุหมายเหตุการไม่อนุมัติ (จะได้ให้พนักงานแก้ได้ถูก)');
      return;
    }

    setIsProcessing(sub.id);
    const res = await submissionService.rejectSubmission(sub.id, currentUser.id, reviewNote);
    
    if (res.success) {
      await fetchSubmissions();
      setExpandedId(null);
      setReviewNote('');
      if (onSubmissionsChanged) onSubmissionsChanged();
    } else {
      alert(`Error: ${res.error}`);
    }
    setIsProcessing(null);
  };

  const handleRejectPage = async (submissionId: string, pageId: string) => {
    const note = pageNotes[pageId] || '';
    if (!note) {
      alert('กรุณาระบุสาเหตุที่ตีกลับเพจนี้');
      return;
    }

    setIsSavingPage(pageId);
    const res = await submissionService.updatePageReview(pageId, 'Rejected', note);
    setIsSavingPage(null);

    if (res.success) {
      setEditingPageId(null);
      // Update local state without full refetch for snappiness
      setSubmissions(subs => subs.map(sub => {
        if (sub.id !== submissionId) return sub;
        return {
          ...sub,
          pages: sub.pages.map(p => p.id === pageId ? { ...p, reviewStatus: 'Rejected', reviewNote: note } : p)
        };
      }));
    } else {
      alert('Error: ' + res.error);
    }
  };

  const handleResetPage = async (submissionId: string, pageId: string) => {
    setIsSavingPage(pageId);
    const res = await submissionService.updatePageReview(pageId, 'Pending', '');
    setIsSavingPage(null);

    if (res.success) {
      setEditingPageId(null);
      setPageNotes(prev => { const next = {...prev}; delete next[pageId]; return next; });
      setSubmissions(subs => subs.map(sub => {
        if (sub.id !== submissionId) return sub;
        return {
          ...sub,
          pages: sub.pages.map(p => p.id === pageId ? { ...p, reviewStatus: 'Pending', reviewNote: undefined } : p)
        };
      }));
    } else {
      alert('Error: ' + res.error);
    }
  };

  const filteredSubs = submissions.filter(s => statusFilter === 'All' || s.status === statusFilter);

  return (
    <div className="bg-white rounded-[2rem] border border-slate-100 shadow-sm overflow-hidden flex flex-col min-h-[400px]">
      {/* Header */}
      <div className="px-8 py-6 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between bg-slate-50/30 gap-4">
        <div className="flex items-center gap-3">
          <FileCheck size={18} className="text-[var(--primary-blue)]" />
          <div>
            <h3 className="text-sm font-bold text-slate-800 uppercase tracking-widest font-outfit">
              Monthly Close Review
            </h3>
            <p className="text-[10px] text-slate-400 font-noto">ตรวจเช็คยอดและอนุมัติค่าคอมมิชชั่นประจำเดือน</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center bg-white border border-slate-200 rounded-lg p-1 shadow-sm">
            {(['All', 'Submitted', 'Approved', 'Rejected'] as const).map(status => (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                className={cn(
                  "px-3 py-1.5 rounded-md text-[10px] font-bold uppercase tracking-widest transition-colors",
                  statusFilter === status 
                    ? "bg-[var(--primary-theme)] text-white shadow-sm" 
                    : "text-slate-500 hover:bg-slate-50"
                )}
              >
                {status === 'All' ? 'ทั้งหมด' : 
                 status === 'Submitted' ? 'รอตรวจ' : 
                 status === 'Approved' ? 'อนุมัติแล้ว' : 'ตีกลับ'}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Body */}
      <div className="flex-1 p-4 md:p-6 bg-slate-50/10">
        {isLoading ? (
          <div className="h-full flex items-center justify-center py-20">
            <div className="w-8 h-8 border-2 border-[var(--primary-theme)] border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : filteredSubs.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center py-20 text-slate-400">
            <FileCheck size={40} className="mb-4 opacity-20" />
            <p className="text-sm font-bold">ไม่มีรายการส่งเช็คยอดในสถานะนี้</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredSubs.map(sub => {
              const isExpanded = expandedId === sub.id;
              
              return (
                <div key={sub.id} className={cn(
                  "bg-white border rounded-2xl transition-all overflow-hidden",
                  isExpanded ? "border-[var(--primary-blue)] shadow-md" : "border-slate-200 hover:border-slate-300"
                )}>
                  {/* Row Summary */}
                  <div 
                    onClick={() => setExpandedId(isExpanded ? null : sub.id)}
                    className="p-4 flex items-center justify-between cursor-pointer group"
                  >
                    <div className="flex items-center gap-4">
                      {/* Status Icon */}
                      <div className={cn(
                        "w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border",
                        sub.status === 'Submitted' ? "bg-amber-50 border-amber-200 text-amber-600" :
                        sub.status === 'Approved' ? "bg-emerald-50 border-emerald-200 text-emerald-600" :
                        sub.status === 'Rejected' ? "bg-red-50 border-red-200 text-red-500" :
                        "bg-slate-50 border-slate-200 text-slate-500"
                      )}>
                        {sub.status === 'Submitted' && <Clock size={18} className="animate-pulse" />}
                        {sub.status === 'Approved' && <CheckCircle2 size={18} />}
                        {sub.status === 'Rejected' && <XCircle size={18} />}
                        {sub.status === 'Draft' && <Clock size={18} />}
                      </div>

                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="text-sm font-bold text-slate-800">{sub.staffName || 'Unknown Staff'}</h4>
                          {sub.submittedByName && (
                            <span className="text-[10px] font-bold text-amber-600 bg-amber-50 border border-amber-200 px-1.5 py-0.5 rounded">
                              ส่งแทนโดย {sub.submittedByName}
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-3 mt-1 text-[11px] font-medium text-slate-400">
                          <span className="flex items-center gap-1"><FileCheck size={12}/> {sub.pages.length} เพจ</span>
                          <span className="flex items-center gap-1"><Eye size={12}/> {(sub.totalViews / 1000000).toFixed(1)}M วิว</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      {sub.status === 'Submitted' && (
                        <span className="px-2.5 py-1 rounded-full bg-amber-100 text-amber-700 text-[10px] font-black uppercase tracking-widest animate-pulse">
                          ACTION REQUIRED
                        </span>
                      )}
                      {sub.status === 'Approved' && (
                        <div className="text-right">
                          <p className="text-[10px] text-emerald-600 font-bold uppercase tracking-widest">Approved</p>
                          <p className="text-sm font-bold text-slate-700">฿{(sub.adjustedCommission ?? sub.calculatedCommission ?? 0).toLocaleString()}</p>
                        </div>
                      )}
                      <button className="w-8 h-8 rounded-full flex items-center justify-center bg-slate-50 text-slate-400 group-hover:bg-slate-100 transition-colors">
                        {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                      </button>
                    </div>
                  </div>

                  {/* Expanded Detail */}
                  {isExpanded && (
                    <div className="border-t border-slate-100 bg-slate-50/50 p-4 md:p-6 animate-in slide-in-from-top-2">
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        
                        {/* Left: Page List */}
                        <div>
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">Snapshot ข้อมูลเพจที่ส่ง</p>
                          <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
                            <table className="w-full text-left text-xs">
                              <thead className="bg-slate-50 border-b border-slate-100">
                                <tr>
                                  <th className="px-3 py-2 font-semibold text-slate-500">Page Name</th>
                                  <th className="px-3 py-2 font-semibold text-slate-500 text-right">Views</th>
                                  <th className="px-3 py-2 font-semibold text-slate-500 text-center w-32">ผลตรวจ</th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-slate-100">
                                {[...sub.pages]
                                  .sort((a, b) => {
                                    if (a.pageStatus === 'Active' && b.pageStatus !== 'Active') return -1;
                                    if (a.pageStatus !== 'Active' && b.pageStatus === 'Active') return 1;
                                    return a.pageName.localeCompare(b.pageName, 'th');
                                  })
                                  .map(p => {
                                    const isEditing = editingPageId === p.id;
                                    const isRejected = p.reviewStatus === 'Rejected';
                                    
                                    return (
                                    <React.Fragment key={p.id}>
                                      <tr className={cn("transition-colors", isRejected ? "bg-red-50/50" : "")}>
                                        <td className="px-3 py-2 text-slate-700 font-medium">
                                          <div className="flex items-center gap-1.5">
                                            <div className={cn("w-1.5 h-1.5 rounded-full shrink-0", p.pageStatus === 'Active' ? 'bg-emerald-400' : 'bg-red-400')}></div>
                                            <a 
                                              href={p.pageUrl || '#'} 
                                              target={p.pageUrl ? "_blank" : undefined} 
                                              rel="noopener noreferrer" 
                                              className="hover:text-blue-600 hover:underline transition-colors"
                                            >
                                              {p.pageName}
                                            </a>
                                          </div>
                                        </td>
                                        <td className="px-3 py-2 text-right text-slate-600 font-inter">{p.snapshotViews.toLocaleString()}</td>
                                        <td className="px-3 py-2 text-center">
                                          {isRejected ? (
                                            <button 
                                              onClick={() => sub.status === 'Submitted' && handleResetPage(sub.id, p.id)}
                                              disabled={sub.status !== 'Submitted' || isSavingPage === p.id}
                                              className="text-[10px] bg-red-100 text-red-600 px-2 py-0.5 rounded font-bold hover:bg-red-200"
                                            >
                                              ตีกลับแล้ว
                                            </button>
                                          ) : (
                                            <button 
                                              onClick={() => {
                                                if (sub.status !== 'Submitted') return;
                                                if (isEditing) setEditingPageId(null);
                                                else setEditingPageId(p.id);
                                              }}
                                              disabled={sub.status !== 'Submitted' || isSavingPage === p.id}
                                              className="text-[10px] text-slate-400 hover:text-red-500 font-medium transition-colors"
                                            >
                                              {isEditing ? 'ยกเลิก' : '❌ ตีกลับ'}
                                            </button>
                                          )}
                                        </td>
                                      </tr>
                                      {/* Inline Edit Row */}
                                      {isEditing && (
                                        <tr className="bg-slate-50/50">
                                          <td colSpan={3} className="px-3 py-2">
                                            <div className="flex items-start gap-2">
                                              <CornerDownRight size={14} className="text-slate-300 mt-2" />
                                              <input
                                                type="text"
                                                autoFocus
                                                placeholder="ระบุสาเหตุที่ตีกลับเพจนี้..."
                                                value={pageNotes[p.id] || ''}
                                                onChange={e => setPageNotes(prev => ({...prev, [p.id]: e.target.value}))}
                                                className="flex-1 bg-white border border-red-200 text-xs px-2 py-1.5 rounded outline-none focus:border-red-400"
                                              />
                                              <button
                                                onClick={() => handleRejectPage(sub.id, p.id)}
                                                disabled={isSavingPage === p.id || !pageNotes[p.id]}
                                                className="bg-red-500 hover:bg-red-600 text-white text-[10px] font-bold px-3 py-1.5 rounded flex items-center gap-1 disabled:opacity-50"
                                              >
                                                {isSavingPage === p.id ? 'กำลังบันทึก...' : <><Save size={12}/> บันทึก</>}
                                              </button>
                                            </div>
                                          </td>
                                        </tr>
                                      )}
                                      {/* Note Display Row */}
                                      {isRejected && p.reviewNote && !isEditing && (
                                        <tr className="bg-red-50/20">
                                          <td colSpan={3} className="px-3 pb-2 pt-0 text-[10px] text-red-600 pl-8">
                                            <span className="font-bold">สาเหตุ:</span> {p.reviewNote}
                                          </td>
                                        </tr>
                                      )}
                                    </React.Fragment>
                                    );
                                  })}
                              </tbody>
                              <tfoot className="bg-slate-50 border-t border-slate-200 font-bold">
                                <tr>
                                  <td className="px-3 py-2 text-slate-700">รวมทั้งหมด</td>
                                  <td className="px-3 py-2 text-right text-blue-600 font-inter">{sub.totalViews.toLocaleString()}</td>
                                  <td></td>
                                </tr>
                              </tfoot>
                            </table>
                          </div>
                          {sub.submittedAt && (
                            <p className="text-[10px] text-slate-400 mt-2 flex items-center gap-1">
                              <Clock size={10} /> ส่งเมื่อ: {new Date(sub.submittedAt).toLocaleString('th-TH')}
                            </p>
                          )}
                        </div>

                        {/* Right: Review Action Box */}
                        <div>
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">การพิจารณา (Admin Action)</p>
                          
                          {sub.status === 'Submitted' ? (
                            <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
                              
                              <div className="space-y-4 mb-6">
                                <div>
                                  <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">
                                    ปรับแก้ค่าคอมมิชชั่น (฿) - ปล่อยว่างถ้าไม่ให้ค่าคอม
                                  </label>
                                  <input 
                                    type="number" 
                                    value={adjustedCommission}
                                    onChange={e => setAdjustedCommission(e.target.value)}
                                    placeholder="เช่น 1500"
                                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm font-inter outline-none focus:border-blue-500"
                                  />
                                </div>
                                <div>
                                  <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">
                                    หมายเหตุ / เหตุผลการปรับแก้หรือตีกลับ (Required for Reject)
                                  </label>
                                  <textarea 
                                    value={reviewNote}
                                    onChange={e => setReviewNote(e.target.value)}
                                    placeholder="ระบุหมายเหตุการตรวจ..."
                                    rows={2}
                                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-500 resize-none"
                                  />
                                </div>
                              </div>

                              <div className="flex items-center gap-3">
                                <button
                                  onClick={() => handleApprove(sub)}
                                  disabled={isProcessing === sub.id}
                                  className="flex-1 bg-emerald-500 hover:bg-emerald-600 text-white py-2.5 rounded-lg text-xs font-bold transition-colors flex items-center justify-center gap-2"
                                >
                                  {isProcessing === sub.id ? 'Processing...' : <><CheckCircle2 size={14}/> อนุมัติข้อมูลและยืนยันยอด</>}
                                </button>
                                <button
                                  onClick={() => handleReject(sub)}
                                  disabled={isProcessing === sub.id}
                                  className="flex-1 bg-white border border-red-200 text-red-600 hover:bg-red-50 py-2.5 rounded-lg text-xs font-bold transition-colors flex items-center justify-center gap-2"
                                >
                                  {isProcessing === sub.id ? 'Processing...' : <><XCircle size={14}/> ตีกลับ (ให้แก้ไขใหม่)</>}
                                </button>
                              </div>
                            </div>
                          ) : (
                            <div className="bg-slate-100/50 border border-slate-200 rounded-xl p-4">
                              <p className="text-xs text-slate-600 mb-2">
                                <span className="font-bold">ตรวจสอบเมื่อ:</span> {sub.reviewedAt ? new Date(sub.reviewedAt).toLocaleString('th-TH') : '-'}
                              </p>
                              {sub.status === 'Approved' && (
                                <p className="text-xs text-slate-600 mb-2">
                                  <span className="font-bold">ค่าคอมมิชชั่นสุทธิ:</span> <span className="text-emerald-600 font-bold">฿{(sub.adjustedCommission ?? sub.calculatedCommission ?? 0).toLocaleString()}</span>
                                </p>
                              )}
                              {sub.reviewNote && (
                                <div className="mt-3 p-3 bg-white rounded-lg border border-slate-200">
                                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">หมายเหตุผู้ตรวจ</p>
                                  <p className="text-xs text-slate-700">{sub.reviewNote}</p>
                                </div>
                              )}
                            </div>
                          )}

                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
