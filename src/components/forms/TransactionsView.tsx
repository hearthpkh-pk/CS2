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
      <div className="flex justify-between items-end border-b border-slate-200 pb-5 mb-8">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <div className="p-1.5 bg-slate-50 border border-slate-200 rounded-lg">
              <FilePlus className="text-primary-navy" size={22} />
            </div>
            <h2 className="text-2xl font-bold text-primary-navy font-outfit uppercase tracking-tight">Transactions</h2>
          </div>
          <p className="text-slate-500 text-sm font-noto">กรอกข้อมูลทีละหลายเพจในรูปแบบตาราง</p>
        </div>
        <div className="flex items-center gap-3 bg-white border border-slate-200 rounded-xl px-4 py-2.5 shadow-sm transition-all focus-within:ring-2 focus-within:ring-slate-100">
          <input
            type="date"
            value={logDate}
            onChange={e => setLogDate(e.target.value)}
            className="text-slate-700 font-semibold outline-none bg-transparent font-inter text-sm"
          />
        </div>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/40 border-b border-slate-100">
                <th className="p-5 text-slate-400 font-semibold text-[11px] uppercase tracking-widest font-noto w-1/3">ชื่อเพจ / หมวดหมู่</th>
                <th className="p-5 text-slate-400 font-semibold text-[11px] uppercase tracking-widest font-noto text-center">สถานะ</th>
                <th className="p-5 text-slate-400 font-semibold text-[11px] uppercase tracking-widest font-noto text-center">ยอดผู้ติดตามล่าสุด</th>
                <th className="p-5 text-slate-400 font-semibold text-[11px] uppercase tracking-widest font-noto text-center">ยอดวิวของวันนี้</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {pages.map((p) => (
                <tr key={p.id} className="hover:bg-slate-50/20 transition-colors">
                  <td className="p-5">
                    <div className="font-bold text-primary-navy text-md font-noto mb-0.5">{p.name}</div>
                    <div className="text-[11px] text-slate-400 font-noto flex items-center gap-2">
                      <span className="w-1 h-1 rounded-full bg-slate-300"></span>
                      {p.category}
                    </div>
                  </td>
                  <td className="p-5 text-center">
                    <span className={cn(
                      "px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider font-noto",
                      p.status === 'Active' ? "bg-emerald-50 text-emerald-600 border border-emerald-100" :
                        p.status === 'Rest' ? "bg-slate-50 text-slate-500 border border-slate-200" : "bg-red-50 text-red-600 border border-red-100"
                    )}>
                      {p.status}
                    </span>
                  </td>
                  <td className="p-5">
                    <input
                      type="number"
                      placeholder="กรอกตัวเลข"
                      value={inputData[p.id]?.followers || ''}
                      onChange={e => setInputData(prev => ({ ...prev, [p.id]: { ...prev[p.id], followers: e.target.value } }))}
                      className="w-full bg-[#fcfcfc] border border-slate-200 rounded-xl px-4 py-2.5 text-slate-800 text-sm font-inter outline-none focus:border-yellow-400 focus:bg-white focus:ring-4 focus:ring-yellow-400/10 text-center transition-all"
                    />
                  </td>
                  <td className="p-5">
                    <input
                      type="number"
                      placeholder="กรอกตัวเลข"
                      value={inputData[p.id]?.views || ''}
                      onChange={e => setInputData(prev => ({ ...prev, [p.id]: { ...prev[p.id], views: e.target.value } }))}
                      className="w-full bg-[#fcfcfc] border border-slate-200 rounded-xl px-4 py-2.5 text-slate-800 text-sm font-inter outline-none focus:border-yellow-400 focus:bg-white focus:ring-4 focus:ring-yellow-400/10 text-center transition-all"
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="p-8 bg-slate-50/30 flex justify-end border-t border-slate-50">
          <button
            type="submit"
            className="bg-[#facc15] hover:bg-[#eab308] active:scale-[0.98] text-primary-navy font-bold py-3.5 px-10 rounded-2xl flex items-center gap-3 transition-all shadow-[0_8px_20px_-6px_rgba(250,204,21,0.4)]"
          >
            <div className="bg-[#0f172a] text-white p-1.5 rounded-lg">
              <Save size={18} />
            </div>
            <span className="font-noto">บันทึกข้อมูลทั้งหมด</span>
          </button>
        </div>
      </form>
    </div>
  );
};
