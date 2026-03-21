'use client';

import React, { useState, useEffect } from 'react';
import { Save, FilePlus, Search, X, Check } from 'lucide-react';
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
  const [inputData, setInputData] = useState<Record<string, { followers: string; views: string }>>({});

  // CSV Import States
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [importStep, setImportStep] = useState<'select' | 'confirm'>('select');
  const [pendingCsvRows, setPendingCsvRows] = useState<{ date: string; views: number }[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTargetPageId, setSelectedTargetPageId] = useState<string | null>(null);

  useEffect(() => {
    const dataForDate: Record<string, { followers: string; views: string }> = {};
    pages.forEach(p => {
      const existingLog = logs.find(l => l.pageId === p.id && l.date === logDate);
      dataForDate[p.id] = {
        followers: existingLog?.followers.toString() || '',
        views: existingLog?.views.toString() || ''
      };
    });
    setInputData(dataForDate);
  }, [logDate, pages, logs]);

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
    const lines = text.split('\n');
    const newLogsFromCsv: DailyLog[] = [];

    // Facebook CSV often starts with "sep=," or "Views" metadata lines
    // We look for the header row "Date","Primary"
    let headerIndex = -1;
    for (let i = 0; i < lines.length; i++) {
      if (lines[i].includes('"Date"') && lines[i].includes('"Primary"')) {
        headerIndex = i;
        break;
      }
    }

    if (headerIndex === -1) {
      alert('ไม่พบรูปแบบไฟล์ที่ถูกต้อง (ต้องการคอลัมน์ "Date" และ "Primary")');
      return;
    }

    const rows: { date: string; views: number }[] = [];
    for (let i = headerIndex + 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;

      const parts = line.split(',').map(p => p.replace(/"/g, ''));
      if (parts.length < 2) continue;

      const rawDate = parts[0];
      const viewsStr = parts[1];
      const dateOnly = rawDate.split('T')[0];
      const views = parseInt(viewsStr) || 0;

      if (dateOnly && !isNaN(views)) {
        rows.push({ date: dateOnly, views });
      }
    }

    if (rows.length === 0) {
      alert('ไม่พบข้อมูลที่สามารถนำเข้าได้');
      return;
    }

    setPendingCsvRows(rows);
    setSearchQuery(''); // Reset search

    if (pages.length === 1) {
      setSelectedTargetPageId(pages[0].id);
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
    const targetPage = pages.find(p => p.id === pageId);
    if (!targetPage || !pageId) return;

    const newLogs = rows.map(r => ({
      id: `log-${pageId}-${r.date}`,
      pageId: pageId,
      staffId: targetPage.ownerId || currentUser.id,
      date: r.date,
      followers: 0,
      views: r.views,
      createdAt: new Date().toISOString()
    }));
    onSave(newLogs);
    setIsImportModalOpen(false);
    setPendingCsvRows([]);
    setSelectedTargetPageId(null);
    setImportStep('select');
  };

  const filteredPages = pages.filter(p =>
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.boxId?.toString().includes(searchQuery)
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newLogs: DailyLog[] = [];
    pages.forEach(p => {
      const fStr = inputData[p.id]?.followers || '';
      const vStr = inputData[p.id]?.views || '';

      // Save if at least one value is provided
      if (fStr !== '' || vStr !== '') {
        const followers = parseInt(fStr) || 0;
        const views = parseInt(vStr) || 0;

        newLogs.push({
          id: `log-${p.id}-${logDate}`,
          pageId: p.id,
          staffId: p.ownerId || currentUser.id,
          date: logDate,
          followers,
          views,
          createdAt: new Date().toISOString()
        });
      }
    });

    if (newLogs.length > 0) {
      onSave(newLogs);
    }
  };

  return (
    <div className="pb-10">
      <div className="max-w-5xl mx-auto animate-fade-in">
        <div className="flex justify-between items-end border-b border-slate-200 pb-6 mb-8">
          <div>
            <div className="flex items-center gap-3 mb-1.5">
              <div className="p-2 bg-blue-50 border border-blue-100 rounded-xl shadow-sm">
                <FilePlus className="text-[var(--primary-blue)]" size={22} />
              </div>
              <h2 className="text-2xl font-bold text-primary-navy font-outfit uppercase tracking-tight leading-none pt-1">Transactions</h2>
            </div>
            <p className="text-slate-400 text-xs font-noto tracking-wide">กรอกข้อมูลทีละหลายเพจในรูปแบบตาราง • <span className="text-[var(--primary-blue)] font-bold">Real-time update</span></p>
          </div>

          <div className="flex items-center gap-3">
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
              className="flex items-center gap-2 px-4 py-2 bg-emerald-50 text-emerald-600 rounded-xl text-[10px] font-black uppercase tracking-widest border border-emerald-100 hover:bg-emerald-100 transition-all shadow-sm"
            >
              <FilePlus size={14} /> Import Meta CSV
            </button>

            <div className="flex items-center gap-3 bg-white border border-slate-200 rounded-2xl px-4 py-2.5 shadow-sm transition-all focus-within:ring-4 focus-within:ring-blue-50 focus-within:border-[var(--primary-blue)]">
              <input
                type="date"
                value={logDate}
                onChange={e => setLogDate(e.target.value)}
                className="text-slate-700 font-bold outline-none bg-transparent font-inter text-sm cursor-pointer"
              />
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="bg-white rounded-[2rem] shadow-2xl shadow-slate-200/60 border border-slate-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/50 border-b border-slate-100">
                  <th className="p-6 text-slate-400 font-bold text-[10px] uppercase tracking-[0.15em] font-noto w-1/3">ชื่อเพจ / หมวดหมู่</th>
                  <th className="p-6 text-slate-400 font-bold text-[10px] uppercase tracking-[0.15em] font-noto text-center">สถานะ</th>
                  <th className="p-6 text-slate-400 font-bold text-[10px] uppercase tracking-[0.15em] font-noto text-center">ยอดผู้ติดตาม</th>
                  <th className="p-6 text-slate-400 font-bold text-[10px] uppercase tracking-[0.15em] font-noto text-center">ยอดวิววันนี้</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {pages.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-50/20 transition-colors">
                    <td className="p-4">
                      <div className="font-bold text-primary-navy text-md font-noto mb-0.5">{p.name}</div>
                      <div className="text-[11px] text-slate-400 font-noto flex items-center gap-2">
                        <span className="w-1 h-1 rounded-full bg-slate-300"></span>
                        {p.category}
                      </div>
                    </td>
                    <td className="p-4 text-center">
                      <span className={cn(
                        "px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider font-noto",
                        p.status === 'Active' ? "bg-emerald-50 text-emerald-600 border border-emerald-100" :
                          p.status === 'Rest' ? "bg-slate-50 text-slate-500 border border-slate-200" : "bg-red-50 text-red-600 border border-red-100"
                      )}>
                        {p.status}
                      </span>
                    </td>
                    <td className="p-4 px-6">
                      <input
                        type="number"
                        placeholder="0"
                        value={inputData[p.id]?.followers || ''}
                        onChange={e => setInputData(prev => ({ ...prev, [p.id]: { ...prev[p.id], followers: e.target.value } }))}
                        className="w-full bg-slate-50/50 border border-slate-100 rounded-xl px-4 py-3 text-slate-800 text-sm font-bold font-inter outline-none focus:border-[var(--primary-blue)] focus:bg-white focus:ring-4 focus:ring-blue-50 text-center transition-all placeholder:text-slate-200"
                      />
                    </td>
                    <td className="p-4 px-6">
                      <input
                        type="number"
                        placeholder="0"
                        value={inputData[p.id]?.views || ''}
                        onChange={e => setInputData(prev => ({ ...prev, [p.id]: { ...prev[p.id], views: e.target.value } }))}
                        className="w-full bg-slate-50/50 border border-slate-100 rounded-xl px-4 py-3 text-slate-800 text-sm font-bold font-inter outline-none focus:border-[var(--primary-blue)] focus:bg-white focus:ring-4 focus:ring-blue-50 text-center transition-all placeholder:text-slate-200"
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="p-8 bg-slate-50/30 flex justify-end border-t border-slate-100">
            <button
              type="submit"
              className="bg-[var(--primary-blue)] hover:bg-[#0b5ed7] active:scale-[0.98] text-white font-bold py-3.5 px-10 rounded-2xl flex items-center gap-3 transition-all shadow-xl shadow-blue-100"
            >
              <Save size={20} />
              <span className="font-noto text-lg">บันทึก</span>
            </button>
          </div>
        </form>
      </div>

      {/* Import Modal */}
      {isImportModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-300">
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
                    <p className="text-sm text-slate-600 font-medium">ต้องการนำเข้าข้อมูลจำนวน <span className="text-blue-600 font-black">{pendingCsvRows.length} วัน</span></p>
                    <p className="text-xs text-slate-400 mt-1 uppercase tracking-widest font-bold">ไปยังเพจ: {pages.find(p => p.id === selectedTargetPageId)?.name}</p>
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
                      className="w-full py-4 text-[10px] font-black uppercase tracking-[0.2em] bg-blue-600 text-white rounded-2xl shadow-xl shadow-blue-100 hover:bg-blue-700 hover:-translate-y-0.5 transition-all"
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
        </div>
      )}
    </div>
  );
};
