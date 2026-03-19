'use client';

import React, { useState } from 'react';
import { Trash2 } from 'lucide-react';
import { Page } from '@/types';

interface Props {
  pages: Page[];
  onAdd: (name: string) => void;
  onDelete: (id: string) => void;
}

export const SetupView = ({ pages, onAdd, onDelete }: Props) => {
  const [name, setName] = useState('');

  const handleAdd = () => {
    if (name.trim()) {
      onAdd(name.trim());
      setName('');
    }
  };

  return (
    <div className="max-w-5xl mx-auto animate-fade-in pb-10">
      <div className="border-b border-slate-100 pb-6 mb-10">
        <h2 className="text-3xl font-bold text-primary-navy font-outfit uppercase tracking-tight">Setup</h2>
        <p className="text-slate-400 font-noto text-sm mt-1">เพิ่มหรือลบรายชื่อเพจที่จะติดตามสถิติในเครือของคุณ</p>
      </div>

      <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-8 mb-10 transition-all focus-within:border-slate-200">
        <div className="flex flex-col sm:flex-row gap-4">
          <input
            type="text"
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder="ชื่อเพจที่ต้องการเพิ่ม..."
            className="flex-1 bg-slate-50/50 border border-slate-200 rounded-2xl px-6 py-4 outline-none font-noto text-primary-navy placeholder:text-slate-300 focus:bg-white focus:border-yellow-400 focus:ring-4 focus:ring-yellow-400/10 transition-all"
          />
          <button
            onClick={handleAdd}
            className="bg-[#0f172a] hover:bg-[#1e293b] active:scale-[0.98] text-white px-10 py-4 rounded-2xl font-bold font-noto transition-all shadow-lg shadow-slate-200 hover:shadow-xl"
          >
            ยืนยันเพิ่มเพจ
          </button>
        </div>
      </div>

      <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="bg-slate-50/50 px-8 py-4 border-b border-slate-100">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest font-noto">รายการเพจทั้งหมด ({pages.length})</span>
        </div>
        <div className="divide-y divide-slate-50">
          {pages.map(page => (
            <div key={page.id} className="flex items-center justify-between px-8 py-6 hover:bg-slate-50/30 group transition-all">
              <div className="flex items-center gap-5">
                <div className="w-14 h-14 rounded-[1.25rem] bg-[#0f172a] text-white flex items-center justify-center font-bold text-xl font-outfit shadow-sm">
                  {page.name.charAt(0)}
                </div>
                <div>
                  <div className="font-bold text-primary-navy text-lg font-noto leading-tight">{page.name}</div>
                  <div className="text-xs text-slate-400 font-noto mt-1 flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-slate-200"></span>
                    {page.category}
                  </div>
                </div>
              </div>
              <button
                onClick={() => onDelete(page.id)}
                className="w-10 h-10 rounded-xl bg-red-50 text-red-100 group-hover:text-red-500 group-hover:bg-red-50 flex items-center justify-center transition-all opacity-0 group-hover:opacity-100 hover:scale-110 active:scale-90"
              >
                <Trash2 size={20} />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
