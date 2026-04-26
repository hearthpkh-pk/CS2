'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { Save, FilePlus, Search, X, Check, Eye, Users } from 'lucide-react';
import { Page, DailyLog, User } from '@/types';
import { cn } from '@/lib/utils';

interface Props {
  pages: Page[];
  logs: DailyLog[];
  currentUser: User;
  onSave: (newLogs: DailyLog[]) => void;
}

export const TransactionsView = ({ pages, logs, currentUser, onSave }: Props) => {
  const [logDate, setLogDate] = useState(new Date().toISOString().split('T')[0]);
  const [activeMode, setActiveMode] = useState<'views' | 'followers'>('views');
  const [inputData, setInputData] = useState<Record<string, Record<string, { followers: string; views: string }>>>({});

  // CSV Import States
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [importStep, setImportStep] = useState<'select' | 'confirm'>('select');
  const [pendingCsvRows, setPendingCsvRows] = useState<{ date: string; followers: number; views: number }[]>([]);
  const [importSummary, setImportSummary] = useState({ days: 0, hasViews: false, hasFollowers: false });
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTargetPageId, setSelectedTargetPageId] = useState<string | null>(null);

  // Portal mount state
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  // Filter and sort pages to match SetupView order
  const sortedPages = useMemo(() => {
    return pages
      .filter(p => !p.isDeleted)
      .sort((a, b) => {
        // 1. Sort by Box ID
        const boxA = a.boxId || 0;
        const boxB = b.boxId || 0;
        if (boxA !== boxB) return boxA - boxB;

        // 2. Sort by Status (Active first)
        if (a.status === 'Active' && b.status !== 'Active') return -1;
        if (a.status !== 'Active' && b.status === 'Active') return 1;

        // 3. Sort by Name
        return a.name.localeCompare(b.name);
      });
  }, [pages]);

  const rollingDates = useMemo(() => {
    const dates = [];
    const baseDate = new Date(logDate);

    // We want 5 days ending on `baseDate` (so `baseDate - 4 days` to `baseDate`)
    for (let i = 4; i >= 0; i--) {
      const d = new Date(baseDate);
      d.setDate(d.getDate() - i);
      dates.push(d.toISOString().split('T')[0]);
    }

    return dates;
  }, [logDate]);

  useEffect(() => {
    const dataForDates: Record<string, Record<string, { followers: string; views: string }>> = {};
    sortedPages.forEach(p => {
      dataForDates[p.id] = {};
      rollingDates.forEach(date => {
        const existingLog = logs.find(l => l.pageId === p.id && l.date === date);
        dataForDates[p.id][date] = {
          followers: existingLog?.followers?.toString() || '',
          views: existingLog?.views?.toString() || ''
        };
      });
    });
    setInputData(dataForDates);
  }, [rollingDates, sortedPages, logs]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      parseCSV(text);
    };
    reader.readAsText(file);
    // Reset input
    e.target.value = '';
  };

  const parseCSV = (text: string) => {
    const lines = text.split(/\r?\n/);
    const dataByDate: Record<string, { followers: number; views: number }> = {};

    let currentMetric: 'views' | 'followers' | null = null;
    let inDataBlock = false;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) {
        // 🛡️ ไม่หยุด data block เมื่อเจอบรรทัดว่าง
        // Meta CSV อาจมี blank lines แทรกกลาง data block ได้
        continue;
      }

      // Check for metric indicators in lines preceding or in metadata
      // เมื่อเจอ section header ใหม่ → reset data block (เริ่มอ่าน section ใหม่)
      if (line.includes('"ยอดดู"') || line.toLowerCase().includes('"views"')) {
        currentMetric = 'views';
        inDataBlock = false; // รอ header row ใหม่ก่อนจะเปิด data block
      } else if (line.includes('"จำนวนการติดตามบน Facebook"') || line.toLowerCase().includes('"facebook follows"')) {
        currentMetric = 'followers';
        inDataBlock = false;
      }

      // Check for header row
      const isHeader = (line.includes('"Date"') || line.includes('"วันที่"')) && line.includes('"Primary"');

      if (isHeader) {
        inDataBlock = true;
        continue;
      }

      if (inDataBlock && currentMetric) {
        const parts = line.split(',').map(p => p.replace(/"/g, ''));
        if (parts.length >= 2) {
          const rawDate = parts[0];
          const valStr = parts[1];
          const dateOnly = rawDate.split('T')[0];
          const value = parseInt(valStr) || 0;

          if (dateOnly && !isNaN(value)) {
            if (!dataByDate[dateOnly]) {
              dataByDate[dateOnly] = { followers: 0, views: 0 };
            }
            if (currentMetric === 'views') {
              dataByDate[dateOnly].views = value;
            } else {
              dataByDate[dateOnly].followers = value;
            }
          }
        }
      }
    }

    const rows = Object.entries(dataByDate).map(([date, data]) => ({
      date,
      ...data
    }));

    if (rows.length === 0) {
      alert('ไม่พบข้อมูลที่สามารถนำเข้าได้ หรือรูปแบบไฟล์ไม่รองรับ');
      return;
    }

    setPendingCsvRows(rows);
    setImportSummary({
      days: rows.length,
      hasViews: rows.some(r => r.views > 0),
      hasFollowers: rows.some(r => r.followers > 0)
    });
    setSearchQuery('');

    if (sortedPages.length === 1) {
      setSelectedTargetPageId(sortedPages[0].id);
      setImportStep('confirm');
      setIsImportModalOpen(true);
    } else {
      setImportStep('select');
      setIsImportModalOpen(true);
    }
  };

  const startConfirmation = (pageId: string) => {
    setSelectedTargetPageId(pageId);
    setImportStep('confirm');
  };

  const handleFinalSave = () => {
    const pageId = selectedTargetPageId;
    const rows = pendingCsvRows;
    const targetPage = sortedPages.find(p => p.id === pageId);
    if (!targetPage || !pageId) return;

    const newLogs = rows.map(r => {
      // Find existing log to merge data
      const existingLog = logs.find(l => l.pageId === pageId && l.date === r.date);

      return {
        id: `log-${pageId}-${r.date}`,
        pageId: pageId,
        staffId: targetPage.ownerId || currentUser.id,
        date: r.date,
        // Merge: If CSV has non-zero value, use it. Otherwise keep existing.
        followers: r.followers !== 0 ? r.followers : (existingLog?.followers || 0),
        views: r.views !== 0 ? r.views : (existingLog?.views || 0),
        createdAt: existingLog?.createdAt || new Date().toISOString()
      };
    });

    onSave(newLogs);
    setIsImportModalOpen(false);
    setPendingCsvRows([]);
    setSelectedTargetPageId(null);
    setImportStep('select');
  };

  const filteredPages = sortedPages.filter(p =>
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.boxId?.toString().includes(searchQuery)
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newLogs: DailyLog[] = [];
    sortedPages.forEach(p => {
      rollingDates.forEach(date => {
        const fStr = inputData[p.id]?.[date]?.followers || '';
        const vStr = inputData[p.id]?.[date]?.views || '';

        if (fStr !== '' || vStr !== '') {
          const followers = parseInt(fStr) || 0;
          const views = parseInt(vStr) || 0;

          newLogs.push({
            id: `log-${p.id}-${date}`,
            pageId: p.id,
            staffId: p.ownerId || currentUser.id,
            date: date,
            followers,
            views,
            createdAt: new Date().toISOString()
          });
        }
      });
    });

    if (newLogs.length > 0) {
      onSave(newLogs);
    }
  };

  return (
    <div className="w-full max-w-[1600px] mx-auto px-4 md:px-8 pb-10 animate-fade-in flex flex-col gap-8">
      <div className="flex justify-between items-center border-b border-slate-200 pt-4 pb-6 mb-6">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <h2 className="text-2xl font-bold text-[#0f172a] font-outfit uppercase tracking-tight leading-none">Transactions</h2>
          </div>
          <p className="text-slate-400 font-noto text-[11px] mt-1.5">
            กรอกข้อมูล 5 วันย้อนหลัง • <span className="text-[var(--primary-blue)] font-bold">Real-time update</span>
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Date Picker (Left) */}
          <div className="flex items-center py-2.5 px-4 bg-white border border-slate-200 rounded-2xl shadow-sm hover:shadow-md hover:border-[var(--primary-blue)] focus-within:border-[var(--primary-blue)] focus-within:ring-4 focus-within:ring-blue-50 transition-all text-slate-500 hover:text-[var(--primary-blue)]">
            <input
              type="date"
              value={logDate}
              onChange={e => setLogDate(e.target.value)}
              className="text-inherit font-bold outline-none bg-transparent font-noto text-sm cursor-pointer w-full"
            />
          </div>

          {/* CSV Import Button (Middle) */}
          <input
            type="file"
            id="csvInput"
            accept=".csv"
            className="hidden"
            onChange={handleFileUpload}
          />
          <button
            type="button"
            onClick={() => document.getElementById('csvInput')?.click()}
            className="p-3 flex items-center justify-center bg-white border border-slate-200 text-slate-500 hover:text-[var(--primary-blue)] hover:border-[var(--primary-blue)] rounded-2xl transition-all shadow-sm hover:shadow-md active:scale-95 flex-shrink-0"
            title="Import Meta CSV"
          >
            <FilePlus size={18} />
          </button>

          {/* Toggle Mode Panel (Right) */}
          <div className="relative flex items-center bg-[#054ab3] p-1 rounded-2xl shadow-md border border-white/10 overflow-hidden">
            <div
              className={cn(
                "absolute top-1 bottom-1 w-[40px] bg-white rounded-xl shadow-sm transition-all duration-300 ease-in-out",
                activeMode === 'views' ? "left-1" : "left-[45px]"
              )}
            />
            <button
              type="button"
              onClick={() => setActiveMode('views')}
              className={cn(
                "relative z-10 w-[40px] h-[32px] flex items-center justify-center rounded-xl transition-colors duration-300",
                activeMode === 'views' ? "text-[#054ab3]" : "text-white/70 hover:text-white"
              )}
              title="โหมดยอดวิว"
            >
              <Eye size={16} strokeWidth={2.5} />
            </button>
            <button
              type="button"
              onClick={() => setActiveMode('followers')}
              className={cn(
                "relative z-10 w-[40px] h-[32px] flex items-center justify-center rounded-xl transition-colors duration-300",
                activeMode === 'followers' ? "text-[#054ab3]" : "text-white/70 hover:text-white"
              )}
              title="โหมดยอดผู้ติดตาม"
            >
              <Users size={16} strokeWidth={2.5} />
            </button>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-[2rem] shadow-2xl shadow-slate-200/60 border border-slate-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50 border-b border-slate-100">
                <th className="p-4 text-slate-400 font-bold text-[10px] uppercase tracking-[0.15em] font-noto w-1/4">ชื่อเพจ / หมวดหมู่</th>
                <th className="p-4 text-slate-400 font-bold text-[10px] uppercase tracking-[0.15em] font-noto text-center w-12" title="สถานะ">STATUS</th>
                {rollingDates.map((date, idx) => (
                  <th key={date} className={cn(
                    "p-3 font-bold text-[10px] uppercase tracking-widest font-noto text-center transition-colors break-words w-[14%]",
                    idx === 4 ? "text-[#054ab3] font-black bg-blue-100/80 border-b-2 border-[#054ab3]" : "text-slate-400"
                  )}>
                    {date.split('-').slice(1).reverse().join('/')}
                    {idx === 4 && (
                      <div className="text-[8px] opacity-70 tracking-normal mt-0.5">
                        (วันนี้)
                      </div>
                    )}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {/* ──── ACTIVE PAGES SECTION ──── */}
              {sortedPages.filter(p => p.status === 'Active').map((p) => (
                <tr key={p.id} className="hover:bg-slate-50/30 transition-colors border-b border-slate-50">
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-50 to-blue-100/80 border border-blue-200/60 flex items-center justify-center flex-shrink-0 shadow-sm">
                        <span className="text-sm font-black text-[var(--primary-blue)] font-inter leading-none">{p.boxId || '#'}</span>
                      </div>
                      <div>
                        <div className="font-bold text-primary-navy text-sm font-noto mb-0.5">{p.name}</div>
                        <div className="text-[10px] text-slate-400 font-noto flex items-center gap-2">
                          <span className="w-1 h-1 rounded-full bg-slate-300"></span>
                          {p.category}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="flex justify-center">
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-widest bg-emerald-50 text-emerald-600 border border-emerald-100">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                        Active
                      </span>
                    </div>
                  </td>

                  {rollingDates.map((date, idx) => (
                    <td key={date} className={cn("p-2 align-middle transition-colors", idx === 4 ? "bg-blue-50/60" : "")}>
                      <div className="relative group mx-auto w-full max-w-[110px]">
                        {activeMode === 'views' ? (
                          <input
                            type="number"
                            placeholder="0"
                            value={inputData[p.id]?.[date]?.views || ''}
                            onChange={e => setInputData(prev => ({
                              ...prev,
                              [p.id]: {
                                ...prev[p.id],
                                [date]: { ...(prev[p.id]?.[date] || {}), views: e.target.value }
                              }
                            }))}
                            className={cn(
                              "w-full border rounded-xl px-2 py-2.5 text-xs font-bold font-inter outline-none transition-all text-center placeholder:text-slate-300",
                              idx === 4
                                ? "bg-white border-[#054ab3]/40 text-[#054ab3] focus:border-[#054ab3] focus:ring-4 focus:ring-blue-100 shadow-md shadow-blue-100/50"
                                : "bg-slate-50/50 border-slate-100 text-slate-700 hover:bg-slate-50/80 focus:border-[#054ab3] focus:bg-white focus:shadow-sm"
                            )}
                          />
                        ) : (
                          <input
                            type="number"
                            placeholder="0"
                            value={inputData[p.id]?.[date]?.followers || ''}
                            onChange={e => setInputData(prev => ({
                              ...prev,
                              [p.id]: {
                                ...prev[p.id],
                                [date]: { ...(prev[p.id]?.[date] || {}), followers: e.target.value }
                              }
                            }))}
                            className={cn(
                              "w-full border rounded-xl px-2 py-2.5 text-xs font-bold font-inter outline-none transition-all text-center placeholder:text-slate-200",
                              idx === 4
                                ? "bg-emerald-50/30 border-emerald-200 text-emerald-700 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-50 shadow-sm"
                                : "bg-slate-50/50 border-slate-100 text-slate-700 hover:bg-slate-50/80 focus:border-emerald-500 focus:bg-white focus:shadow-sm"
                            )}
                          />
                        )}
                      </div>
                    </td>
                  ))}
                </tr>
              ))}

              {/* ──── INACTIVE SECTION DIVIDER ──── */}
              {sortedPages.some(p => p.status !== 'Active') && (
                <tr>
                  <td colSpan={2 + rollingDates.length} className="px-6 py-3 bg-slate-50/80">
                    <div className="flex items-center gap-3">
                      <div className="h-px flex-1 bg-slate-200/60"></div>
                      <span className="text-[9px] font-bold text-slate-400 uppercase tracking-[0.2em] whitespace-nowrap">ไม่ได้ติดตามยอด</span>
                      <div className="h-px flex-1 bg-slate-200/60"></div>
                    </div>
                  </td>
                </tr>
              )}

              {/* ──── INACTIVE PAGES SECTION (dimmed & disabled) ──── */}
              {sortedPages.filter(p => p.status !== 'Active').map((p) => (
                <tr key={p.id} className="opacity-45 hover:opacity-60 transition-opacity border-b border-slate-50/50 bg-slate-50/30">
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-slate-100 border border-slate-200/60 flex items-center justify-center flex-shrink-0">
                        <span className="text-sm font-black text-slate-400 font-inter leading-none">{p.boxId || '#'}</span>
                      </div>
                      <div>
                        <div className="font-bold text-slate-500 text-sm font-noto mb-0.5 line-through decoration-slate-300">{p.name}</div>
                        <div className="text-[10px] text-slate-400 font-noto flex items-center gap-2">
                          <span className="w-1 h-1 rounded-full bg-slate-300"></span>
                          {p.category}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="flex justify-center">
                      <span className={cn(
                        "inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-widest border",
                        p.status === 'Rest'
                          ? "bg-amber-50 text-amber-500 border-amber-100"
                          : "bg-red-50 text-red-400 border-red-100"
                      )}>
                        <span className={cn(
                          "w-1.5 h-1.5 rounded-full",
                          p.status === 'Rest' ? "bg-amber-400" : "bg-red-400"
                        )}></span>
                        {p.status === 'Rest' ? 'Rest' : 'Closed'}
                      </span>
                    </div>
                  </td>

                  {rollingDates.map((date, idx) => (
                    <td key={date} className={cn("p-2 align-middle", idx === 4 ? "bg-blue-50/30" : "")}>
                      <div className="relative group mx-auto w-full max-w-[110px]">
                        {activeMode === 'views' ? (
                          <input
                            type="number"
                            placeholder="0"
                            value={inputData[p.id]?.[date]?.views || ''}
                            onChange={e => setInputData(prev => ({
                              ...prev,
                              [p.id]: {
                                ...prev[p.id],
                                [date]: { ...(prev[p.id]?.[date] || {}), views: e.target.value }
                              }
                            }))}
                            className={cn(
                              "w-full border rounded-xl px-2 py-2.5 text-xs font-bold font-inter outline-none transition-all text-center placeholder:text-slate-200",
                              idx === 4
                                ? "bg-white/60 border-slate-200 text-slate-500 focus:border-[#054ab3] focus:ring-4 focus:ring-blue-100 focus:bg-white"
                                : "bg-slate-50/30 border-slate-100 text-slate-500 hover:bg-slate-50/60 focus:border-[#054ab3] focus:bg-white focus:shadow-sm"
                            )}
                          />
                        ) : (
                          <input
                            type="number"
                            placeholder="0"
                            value={inputData[p.id]?.[date]?.followers || ''}
                            onChange={e => setInputData(prev => ({
                              ...prev,
                              [p.id]: {
                                ...prev[p.id],
                                [date]: { ...(prev[p.id]?.[date] || {}), followers: e.target.value }
                              }
                            }))}
                            className={cn(
                              "w-full border rounded-xl px-2 py-2.5 text-xs font-bold font-inter outline-none transition-all text-center placeholder:text-slate-200",
                              idx === 4
                                ? "bg-white/60 border-slate-200 text-slate-500 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-50 focus:bg-white"
                                : "bg-slate-50/30 border-slate-100 text-slate-500 hover:bg-slate-50/60 focus:border-emerald-500 focus:bg-white focus:shadow-sm"
                            )}
                          />
                        )}
                      </div>
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="p-8 bg-slate-50/30 flex justify-end border-t border-slate-100">
          <button
            type="submit"
            className="bg-[var(--primary-theme)] hover:bg-[var(--primary-theme-hover)] text-white px-8 py-3 rounded-2xl font-bold font-noto flex items-center gap-2 transition-all shadow-lg shadow-blue-100/50 text-sm active:scale-95"
          >
            <Save size={18} />
            <span>บันทึกข้อมูล</span>
          </button>
        </div>
      </form>

      {/* Import Modal */}
      {mounted && isImportModalOpen && createPortal(
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-300">
          <div className="bg-white rounded-[2.5rem] w-full max-w-md shadow-2xl border border-slate-100 overflow-hidden animate-in zoom-in-95 duration-300">
            {importStep === 'select' ? (
              <>
                <div className="p-6 border-b border-slate-50 flex justify-between items-center">
                  <div>
                    <h3 className="text-lg font-bold text-slate-800 font-outfit uppercase tracking-tight">เลือกเพจที่ต้องการนำเข้า</h3>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">พบข้อมูล {pendingCsvRows.length} วันในไฟล์</p>
                  </div>
                  <button
                    onClick={() => setIsImportModalOpen(false)}
                    className="p-2 hover:bg-slate-50 rounded-xl text-slate-400 transition-colors"
                  >
                    <X size={20} />
                  </button>
                </div>

                <div className="p-4">
                  <div className="relative mb-4">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={16} />
                    <input
                      type="text"
                      placeholder="ค้นหาชื่อเพจ หรือ ID..."
                      value={searchQuery}
                      onChange={e => setSearchQuery(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-100 rounded-2xl pl-12 pr-4 py-3 text-sm focus:ring-4 focus:ring-blue-50 focus:border-blue-400 outline-none transition-all placeholder:text-slate-300 font-medium"
                      autoFocus
                    />
                  </div>

                  <div className="max-h-[300px] overflow-y-auto pr-1 flex flex-col gap-1 custom-scrollbar">
                    {filteredPages.length > 0 ? (
                      filteredPages.map(p => (
                        <button
                          key={p.id}
                          onClick={() => startConfirmation(p.id)}
                          className="flex items-center justify-between p-3 rounded-2xl hover:bg-blue-50 group transition-all text-left border border-transparent hover:border-blue-100"
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-white group-hover:text-blue-500 transition-all font-bold text-[10px]">
                              {p.boxId || '#'}
                            </div>
                            <div>
                              <div className="text-sm font-bold text-slate-700 group-hover:text-blue-700 transition-colors">{p.name}</div>
                              <div className="text-[10px] text-slate-400 font-medium">ID: {p.id}</div>
                            </div>
                          </div>
                          <div className="w-8 h-8 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-blue-100 text-blue-600">
                            <Check size={14} />
                          </div>
                        </button>
                      ))
                    ) : (
                      <div className="py-12 text-center">
                        <p className="text-slate-400 text-xs font-medium uppercase tracking-widest">ไม่พบเพจที่ตรงกับการค้นหา</p>
                      </div>
                    )}
                  </div>
                </div>

                <div className="p-6 bg-slate-50/50 flex justify-end gap-3">
                  <button
                    onClick={() => setIsImportModalOpen(false)}
                    className="px-6 py-2.5 text-xs font-bold text-slate-500 uppercase tracking-widest hover:text-slate-700 transition-colors"
                  >
                    ยกเลิก
                  </button>
                </div>
              </>
            ) : (
              <>
                <div className="p-8 text-center">
                  <div className="w-20 h-20 bg-blue-50 text-blue-500 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-sm border border-blue-100">
                    <FilePlus size={32} />
                  </div>
                  <h3 className="text-xl font-bold text-slate-800 font-outfit uppercase tracking-tight mb-2">ยืนยันการนำเข้าข้อมูล</h3>
                  <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 mb-6">
                    <p className="text-sm text-slate-600 font-medium">พบข้อมูลรวม <span className="text-blue-600 font-black">{importSummary.days} วัน</span></p>
                    <div className="flex items-center justify-center gap-2 mt-2">
                      {importSummary.hasFollowers && (
                        <span className="px-2 py-0.5 bg-emerald-50 text-emerald-600 text-[8px] font-bold rounded-lg border border-emerald-100">ผู้ติดตาม</span>
                      )}
                      {importSummary.hasViews && (
                        <span className="px-2 py-0.5 bg-blue-50 text-blue-600 text-[8px] font-bold rounded-lg border border-blue-100">ยอดดู</span>
                      )}
                    </div>
                    <p className="text-[10px] text-slate-400 mt-3 uppercase tracking-widest font-bold border-t border-slate-100 pt-3">ไปยังเพจ: {pages.find(p => p.id === selectedTargetPageId)?.name}</p>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <button
                      onClick={() => setImportStep('select')}
                      className="w-full py-4 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 hover:text-slate-600 bg-slate-50 hover:bg-slate-100 rounded-2xl transition-all"
                    >
                      ย้อนกลับ
                    </button>
                    <button
                      onClick={handleFinalSave}
                      className="w-full py-4 text-[10px] font-black uppercase tracking-[0.2em] bg-[var(--primary-theme)] hover:bg-[var(--primary-theme-hover)] text-white rounded-2xl shadow-xl shadow-blue-100/50 hover:-translate-y-0.5 transition-all active:scale-95"
                    >
                      ยืนยันบันทึก
                    </button>
                  </div>
                </div>
                <div className="p-4 bg-slate-50/30 text-center border-t border-slate-50">
                  <p className="text-[9px] text-slate-300 font-bold uppercase tracking-widest">ข้อมูลเดิมในวันดังกล่าวจะถูกแทนที่ด้วยข้อมูลใหม่จากไฟล์</p>
                </div>
              </>
            )}
          </div>
        </div>,
        document.body
      )}
    </div>
  );
};
