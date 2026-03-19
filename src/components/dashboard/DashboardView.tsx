'use client';

import React, { useMemo } from 'react';
import { Users, Eye, Filter, Calendar } from 'lucide-react';
import { Page, DailyLog } from '@/types';
import { CombinedAreaChart } from './CombinedAreaChart';

interface Props {
  pages: Page[];
  logs: DailyLog[];
  selectedPage: string;
  setSelectedPage: (id: string) => void;
  selectedMonth: string;
  setSelectedMonth: (m: string) => void;
  selectedYear: string;
  setSelectedYear: (y: string) => void;
}

const thaiMonths = ["มกราคม", "กุมภาพันธ์", "มีนาคม", "เมษายน", "พฤษภาคม", "มิถุนายน", "กรกฎาคม", "สิงหาคม", "กันยายน", "ตุลาคม", "พฤศจิกายน", "ธันวาคม"];

export const DashboardView = ({
  pages, logs, selectedPage, setSelectedPage,
  selectedMonth, setSelectedMonth, selectedYear, setSelectedYear
}: Props) => {

  const chartData = useMemo(() => {
    const relevantPages = selectedPage === 'all' ? pages : pages.filter(p => p.id === selectedPage);
    const relevantPageIds = relevantPages.map(p => p.id);

    let filteredLogs = logs.filter(l => {
      const inPages = relevantPageIds.includes(l.pageId);
      const lDate = new Date(l.date);
      const inYear = lDate.getFullYear().toString() === selectedYear;
      const inMonth = selectedMonth === 'all' ? true : (lDate.getMonth() + 1).toString().padStart(2, '0') === selectedMonth;
      return inPages && inYear && inMonth;
    });

    filteredLogs.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    const grouped: Record<string, { date: string; views: number; followersSum: number }> = {};
    filteredLogs.forEach(log => {
      if (!grouped[log.date]) grouped[log.date] = { date: log.date, views: 0, followersSum: 0 };
      grouped[log.date].views += Number(log.views);
      grouped[log.date].followersSum += Number(log.followers);
    });

    return Object.values(grouped).map(g => ({
      date: g.date,
      views: g.views,
      followers: selectedPage === 'all' ? Math.floor(g.followersSum / Math.max(relevantPageIds.length, 1)) : g.followersSum
    }));
  }, [pages, logs, selectedPage, selectedMonth, selectedYear]);

  const totals = useMemo(() => {
    let currentViews = 0;
    let currentFollowers = chartData.length > 0 ? chartData[chartData.length - 1].followers : 0;
    chartData.forEach(d => currentViews += d.views);
    const prevViews = Math.floor(currentViews * 0.85);
    return { views: currentViews, prevViews, followers: currentFollowers };
  }, [chartData]);

  return (
    <div className="animate-fade-in max-w-6xl mx-auto pb-10">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-10 border-b border-slate-100 pb-6">
        <div>
          <h2 className="text-2xl font-bold text-primary-navy font-outfit uppercase tracking-tight">Dashboard</h2>
          <p className="text-slate-400 font-noto text-sm mt-1">ภาพรวมการเติบโตและสถิติสะสมของคุณ</p>
        </div>

        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-3 bg-white border border-slate-100 rounded-2xl px-5 py-2.5 shadow-sm">
            <Filter size={18} className="text-slate-300" />
            <select value={selectedPage} onChange={e => setSelectedPage(e.target.value)} className="bg-transparent text-slate-700 text-sm font-semibold font-noto outline-none min-w-[150px]">
              <option value="all">ทุกเพจพร้อมกัน</option>
              {pages.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
          </div>

          <div className="flex items-center gap-3 bg-white border border-slate-100 rounded-2xl px-5 py-2.5 shadow-sm">
            <Calendar size={18} className="text-slate-300" />
            <select value={selectedMonth} onChange={e => setSelectedMonth(e.target.value)} className="bg-transparent text-slate-700 text-sm font-semibold font-noto outline-none">
              <option value="all">ทุกเดือน</option>
              {thaiMonths.map((m, i) => <option key={i} value={(i + 1).toString().padStart(2, '0')}>{m}</option>)}
            </select>
            <div className="w-px h-4 bg-slate-100"></div>
            <select value={selectedYear} onChange={e => setSelectedYear(e.target.value)} className="bg-transparent text-slate-700 text-sm font-semibold font-noto outline-none">
              <option value="2024">2567</option>
              <option value="2025">2568</option>
              <option value="2026">2569</option>
            </select>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">
        <div className="bg-white rounded-[2rem] p-6 border border-slate-100 shadow-sm transition-all hover:shadow-md hover:border-slate-200">
          <div className="flex justify-between items-start mb-6">
            <div className="p-4 bg-slate-50 border border-slate-100 rounded-2xl">
              <Users className="text-primary-navy" size={26} />
            </div>
            <div className="px-3 py-1 bg-emerald-50 border border-emerald-100 rounded-full">
              <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider font-inter">+{((totals.followers / Math.max(totals.followers * 0.9, 1)) * 10 - 10).toFixed(1)}%</span>
            </div>
          </div>
          <p className="text-slate-400 text-[11px] font-bold uppercase tracking-[0.15em] font-noto mb-2">Total Followers</p>
          <h3 className="text-4xl font-bold text-primary-navy font-inter tracking-tight">
            {totals.followers.toLocaleString()}
          </h3>
        </div>

        <div className="bg-white rounded-[2rem] p-8 border border-slate-100 shadow-sm transition-all hover:shadow-md hover:border-slate-200">
          <div className="flex justify-between items-start mb-6">
            <div className="p-4 bg-slate-50 border border-slate-100 rounded-2xl">
              <Eye className="text-primary-navy" size={26} />
            </div>
            <div className="px-3 py-1 bg-emerald-50 border border-emerald-100 rounded-full">
              <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider font-inter">
                +{((totals.views - totals.prevViews) / Math.max(totals.prevViews, 1) * 100).toFixed(1)}%
              </span>
            </div>
          </div>
          <p className="text-slate-400 text-[11px] font-bold uppercase tracking-[0.15em] font-noto mb-2">Total Views Performance</p>
          <h3 className="text-4xl font-bold text-primary-navy font-inter tracking-tight">
            {totals.views.toLocaleString()}
          </h3>
        </div>
      </div>

      <div className="bg-white rounded-[2rem] p-6 border border-slate-100 shadow-sm relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
          <div>
            <h3 className="text-xl font-bold text-primary-navy font-outfit uppercase tracking-wider">Growth Performance</h3>
            <p className="text-xs text-slate-400 font-noto mt-1 uppercase tracking-widest">Statistical Trend Analysis</p>
          </div>
          <div className="flex items-center gap-8">
            <div className="flex items-center gap-3">
              <div className="w-3.5 h-3.5 rounded-full bg-[#facc15] shadow-[0_0_12px_rgba(250,204,21,0.5)]"></div>
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.12em] font-noto">ผู้ติดตาม</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-3.5 h-3.5 rounded-full bg-slate-300"></div>
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.12em] font-noto">ยอดการรับชม</span>
            </div>
          </div>
        </div>
        <CombinedAreaChart data={chartData} />
      </div>
    </div>
  );
};
