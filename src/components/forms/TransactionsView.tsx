'use client';

import React, { useState, useEffect } from 'react';
import { Save, FilePlus } from 'lucide-react';
import { Page, DailyLog } from '@/types';
import { cn } from '@/lib/utils';

interface Props {
  pages: Page[];
  logs: DailyLog[];
  onSave: (newLogs: DailyLog[]) => void;
}

export const TransactionsView = ({ pages, logs, onSave }: Props) => {
  const [logDate, setLogDate] = useState(new Date().toISOString().split('T')[0]);
  const [inputData, setInputData] = useState<Record<string, { followers: string; views: string }>>({});

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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newLogs: DailyLog[] = [];
    pages.forEach(p => {
      const f = inputData[p.id]?.followers;
      const v = inputData[p.id]?.views;
      if (f !== '' && v !== '') {
        newLogs.push({
          id: `log-${p.id}-${logDate}`,
          pageId: p.id,
          date: logDate,
          followers: parseInt(f),
          views: parseInt(v)
        });
      }
    });
    if (newLogs.length > 0) onSave(newLogs);
  };

  return (
    <div className="max-w-5xl mx-auto animate-fade-in pb-10">
      <div className="flex justify-between items-end border-b border-slate-200 pb-6 mb-8">
        <div>
          <div className="flex items-center gap-3 mb-1.5">
            <div className="p-2 bg-blue-50 border border-blue-100 rounded-xl shadow-sm">
              <FilePlus className="text-[var(--primary-blue)]" size={22} />
            </div>
            <h2 className="text-2xl font-bold text-primary-navy font-outfit uppercase tracking-tight leading-none pt-1">Transactions</h2>
          </div>
          <p className="text-slate-400 text-xs font-noto tracking-wide">กรอกข้อมูลทีละหลายเพจในรูปแบบตาราง • <span className="text-[var(--primary-blue)] font-bold italic">Real-time update</span></p>
        </div>
        <div className="flex items-center gap-3 bg-white border border-slate-200 rounded-2xl px-4 py-2.5 shadow-sm transition-all focus-within:ring-4 focus-within:ring-blue-50 focus-within:border-[var(--primary-blue)]">
          <input
            type="date"
            value={logDate}
            onChange={e => setLogDate(e.target.value)}
            className="text-slate-700 font-bold outline-none bg-transparent font-inter text-sm cursor-pointer"
          />
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
            <span className="font-noto text-lg">บันทึกข้อมูลวันนี้</span>
          </button>
        </div>
      </form>
    </div>
  );
};
